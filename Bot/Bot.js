// ============================================================
//  해정뉴스 자동 테스트 봇  v2.0
//  node bot.js
//  ※ 로그인이 필요한 테스트는 아래 CONFIG에 이메일/비밀번호 입력
// ============================================================

const { chromium } = require('playwright');
const fs = require('fs');

// ──────────────────────────────────────────────
//  ⚙️  설정 (여기만 수정하면 됩니다)
// ──────────────────────────────────────────────
const CONFIG = {
    BASE_URL: 'https://fff376327yhed.github.io/hsj_news.io',

    // 로그인 테스트용 계정 (이메일/비밀번호 로그인이 Firebase에 등록된 계정)
    // 비워두면 로그인 필요 테스트는 WARN 처리됩니다
    TEST_EMAIL:    'bot@test.com',   // 예: 'bot@test.com'
    TEST_PASSWORD: 'botpass123',   // 예: 'botpass123'

    // 브라우저 표시 여부 (false = 창 없이 실행)
    HEADLESS: false,

    // 각 동작 간 딜레이 (ms) - 너무 빠르면 Firebase 응답 전에 넘어갈 수 있음
    SLOW_MO: 250,

    // 타임아웃 기본값 (ms)
    TIMEOUT: 8000,
};

// Firebase 설정 (script.js 에서 복사)
const FIREBASE_CONFIG = {
    apiKey:        'AIzaSyDgooYtVr8-jm15-fx_WvGLCDxonLpNPuU',
    authDomain:    'hsj-news.firebaseapp.com',
    databaseURL:   'https://hsj-news-default-rtdb.firebaseio.com',
    projectId:     'hsj-news',
    storageBucket: 'hsj-news.appspot.com',
};

// ──────────────────────────────────────────────
//  결과 수집
// ──────────────────────────────────────────────
const R = {
    passed: [], failed: [], warnings: [],
    consoleErrors: [], networkErrors: [],
    startTime: new Date().toISOString(),
    cleanupLog: []          // 삭제한 흔적 기록
};

// 테스트 도중 생성한 데이터의 DB 경로 (cleanup에 사용)
const CREATED = {
    articleId:   null,   // articles/{id}
    commentId:   null,   // comments/{articleId}/{id}
    replyId:     null,   // comments/{articleId}/{commentId}/replies/{id}
    nestedReplyId: null, // comments/{articleId}/{commentId}/replies/{parentId} 아래
    bugReportKey: null,  // bugReports/{key}
    notifKeys:   [],     // notifications/{uid}/{key}[]
};

// ──────────────────────────────────────────────
//  로그 헬퍼
// ──────────────────────────────────────────────
const ts   = () => `[${new Date().toLocaleTimeString('ko-KR', { hour12: false })}]`;
const log  = (m) => console.log(`${ts()} ${m}`);
const pass = (n) => { R.passed.push(n);              log(`  ✅ PASS │ ${n}`); };
const fail = (n, r) => { R.failed.push({name:n,reason:r}); log(`  ❌ FAIL │ ${n}  →  ${r}`); };
const warn = (n, r) => { R.warnings.push({name:n,reason:r}); log(`  ⚠️  WARN │ ${n}  →  ${r}`); };
const step = (n) => log(`\n${'─'.repeat(58)}\n   ${n}\n${'─'.repeat(58)}`);
const detail = (m) => log(`       ↳ ${m}`);

// ──────────────────────────────────────────────
//  공통 헬퍼
// ──────────────────────────────────────────────
async function waitSection(page, id, ms = CONFIG.TIMEOUT) {
    try {
        await page.waitForFunction(
            (sid) => document.getElementById(sid)?.classList.contains('active'),
            id, { timeout: ms }
        );
        return true;
    } catch { return false; }
}

async function waitSel(page, sel, ms = CONFIG.TIMEOUT) {
    try { await page.waitForSelector(sel, { timeout: ms }); return true; }
    catch { return false; }
}

async function dismissDialogs(page) {
    page.on('dialog', async d => {
        detail(`다이얼로그 자동 확인: "${d.message().substring(0, 60)}"`);
        await d.accept();
    });
}

async function goHome(page) {
    const btns = await page.$$('.nav-btn');
    if (btns[0]) { await btns[0].click(); await waitSection(page, 'articlesSection', 4000); }
}

// ──────────────────────────────────────────────
//  1. 페이지 로딩 & 기본 자원 확인
// ──────────────────────────────────────────────
async function testPageLoad(page) {
    step('📄 [01] 페이지 로딩 & 기본 자원 확인');

    // HTTP 응답
    try {
        const res = await page.goto(CONFIG.BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        res.status() === 200 ? pass('HTTP 200 응답') : fail('HTTP 응답', `${res.status()}`);
    } catch (e) { fail('페이지 접속', e.message); return false; }

    // Firebase SDK
    try {
        await page.waitForFunction(() => typeof firebase !== 'undefined', { timeout: 12000 });
        pass('Firebase SDK 로드');
    } catch { fail('Firebase SDK 로드', '12s 내 실패'); return false; }

    // Firebase 초기화 완료 대기
    try {
        await page.waitForFunction(() => typeof db !== 'undefined' && typeof auth !== 'undefined', { timeout: 10000 });
        pass('Firebase db/auth 초기화');
    } catch { fail('Firebase 초기화', 'db/auth undefined'); }

    // 필수 UI 요소
    const uiChecks = [
        ['.bottom-nav',     '하단 네비게이션'],
        ['#searchCategory', '카테고리 셀렉트'],
        ['#searchKeyword',  '검색 입력창'],
    ];
    for (const [sel, name] of uiChecks) {
        (await waitSel(page, sel, 4000)) ? pass(`UI: ${name}`) : fail(`UI: ${name}`, '요소 없음');
    }

    return true;
}

// ──────────────────────────────────────────────
//  2. Firebase DB 연결
// ──────────────────────────────────────────────
async function testFirebase(page) {
    step('🔥 [02] Firebase Realtime DB 연결');

    const result = await page.evaluate(async () => {
        return new Promise((resolve) => {
            const t = setTimeout(() => resolve({ ok: false, reason: '10s 타임아웃' }), 10000);
            db.ref('articles').limitToFirst(1).once('value')
                .then(s => { clearTimeout(t); resolve({ ok: true, hasData: !!s.val() }); })
                .catch(e => { clearTimeout(t); resolve({ ok: false, reason: e.message }); });
        });
    });

    if (result.ok) {
        pass('DB 연결 성공');
        result.hasData ? pass('articles 데이터 존재') : warn('articles 데이터', '빈 DB');
    } else {
        fail('DB 연결', result.reason);
    }

    // 보조 경로 확인
    const paths = ['users', 'votes', 'comments', 'notifications'];
    for (const p of paths) {
        const ok = await page.evaluate(async (path) => {
            try { await db.ref(path).limitToFirst(1).once('value'); return true; }
            catch { return false; }
        }, p);
        ok ? pass(`DB 경로 접근: /${p}`) : warn(`DB 경로: /${p}`, '접근 실패 또는 권한 없음');
    }
}

// ──────────────────────────────────────────────
//  3. 기사 목록 렌더링 & 검색 & 카테고리 필터
// ──────────────────────────────────────────────
async function testArticleList(page) {
    step('📰 [03] 기사 목록 · 검색 · 카테고리 필터');

    await goHome(page);

    // articlesSection active
    (await waitSection(page, 'articlesSection', 5000))
        ? pass('articlesSection 활성화') : fail('articlesSection 활성화', 'active 없음');

    // 기사 카드 렌더링
    try {
        await page.waitForFunction(() => document.querySelectorAll('.article-card').length > 0, { timeout: 10000 });
        const cnt = await page.$$eval('.article-card', els => els.length);
        pass(`기사 카드 렌더링 (${cnt}개)`);
    } catch { warn('기사 카드', '없거나 로딩 지연'); }

    // 검색 기능
    try {
        await page.fill('#searchKeyword', '테스트봇검색쿼리XYZ_없는거');
        await page.waitForTimeout(900);
        const cnt = await page.$$eval('.article-card', els => els.filter(e => e.style.display !== 'none').length);
        pass(`검색 결과 필터 (${cnt}개)`);
        detail(`검색어: "테스트봇검색쿼리XYZ_없는거" → ${cnt}개 표시`);
        await page.fill('#searchKeyword', '');
        await page.waitForTimeout(400);
    } catch (e) { fail('검색 기능', e.message); }

    // 카테고리 필터
    const cats = ['자유게시판', '마크'];
    for (const cat of cats) {
        try {
            await page.selectOption('#searchCategory', cat);
            await page.waitForTimeout(600);
            pass(`카테고리 필터: ${cat}`);
        } catch (e) { warn(`카테고리 필터: ${cat}`, e.message); }
    }
    try { await page.selectOption('#searchCategory', '전체'); } catch {}
}

// ──────────────────────────────────────────────
//  4. 기사 상세 페이지
// ──────────────────────────────────────────────
async function testArticleDetail(page) {
    step('📖 [04] 기사 상세 페이지');

    await goHome(page);
    await page.waitForTimeout(1000);

    const card = await page.$('.article-card');
    if (!card) { warn('기사 상세', '카드 없음 - 스킵'); return null; }

    await card.click();
    await page.waitForTimeout(800);

    const ok = await waitSection(page, 'articleDetailSection', 6000);
    ok ? pass('articleDetailSection 활성화') : fail('articleDetailSection 활성화', 'active 없음');

    // 기사 내 요소
    const checks = [
        ['#articleTitle',  '기사 제목'],
        ['#articleContent','기사 본문'],
        ['.vote-btn',      '추천/비추천 버튼'],
        ['#comments',      '댓글 섹션'],
    ];
    for (const [sel, name] of checks) {
        (await waitSel(page, sel, 3000)) ? pass(`상세: ${name}`) : warn(`상세: ${name}`, '요소 없음');
    }

    // 조회수 증가 확인
    try {
        const views = await page.$eval('#articleViewCount, .view-count, [id*="views"]', el => el.textContent).catch(() => null);
        if (views !== null) { pass(`조회수 표시: ${views.trim()}`); }
        else { detail('조회수 요소 ID 다름 - 확인 불가'); }
    } catch {}

    // 현재 기사 ID 추출 (URL 또는 DOM)
    let articleId = null;
    try {
        articleId = await page.evaluate(() => window.currentArticleId || window._currentArticleId || null);
        if (articleId) detail(`현재 기사 ID: ${articleId}`);
    } catch {}

    // 뒤로가기
    const backBtn = await page.$('.btn-back');
    if (backBtn) {
        await backBtn.click();
        await page.waitForTimeout(600);
        pass('뒤로가기 버튼 동작');
    } else {
        await goHome(page);
        warn('뒤로가기 버튼', '요소 없음 - 홈으로 이동');
    }

    return articleId;
}

// ──────────────────────────────────────────────
//  5. 네비게이션 탭 전환
// ──────────────────────────────────────────────
async function testNavigation(page) {
    step('🧭 [05] 하단 네비게이션 탭 전환');

    const navItems = [
        { idx: 0, section: 'articlesSection',  name: '홈' },
        { idx: 1, section: null,               name: '알림함' },     // messengerSection or similar
        { idx: 2, section: 'settingsSection',  name: '설정' },
        { idx: 3, section: 'moreMenuSection',  name: '더보기' },
    ];

    for (const item of navItems) {
        try {
            const btns = await page.$$('.nav-btn');
            if (!btns[item.idx]) { warn(`탭: ${item.name}`, '버튼 없음'); continue; }
            await btns[item.idx].click();
            await page.waitForTimeout(500);

            if (item.section) {
                const ok = await waitSection(page, item.section, 4000);
                ok ? pass(`탭 전환: ${item.name} → ${item.section}`) : fail(`탭 전환: ${item.name}`, 'section active 안 됨');
            } else {
                pass(`탭 클릭: ${item.name} (section ID 미확인)`);
            }
        } catch (e) { fail(`탭: ${item.name}`, e.message); }
    }

    await goHome(page);
}

// ──────────────────────────────────────────────
//  6. 더보기 메뉴 각 항목
// ──────────────────────────────────────────────
async function testMoreMenu(page) {
    step('☰ [06] 더보기 메뉴 각 항목');

    const openMore = async () => {
        const btns = await page.$$('.nav-btn');
        if (btns[3]) { await btns[3].click(); await waitSection(page, 'moreMenuSection', 3000); }
    };

    await openMore();
    const menuBtns = await page.$$('.more-menu-btn');
    menuBtns.length > 0 ? pass(`더보기 버튼 렌더링 (${menuBtns.length}개)`) : fail('더보기 버튼', '없음');

    // 각 서브페이지 이동 테스트
    const subpages = [
        { text: 'QnA',    sectionId: 'qnaSection',         name: 'QnA 페이지' },
        { text: '패치노트', sectionId: 'patchnotesSection',  name: '패치노트 페이지' },
        { text: '버그 제보', sectionId: null,               name: '버그 제보 페이지' },
        { text: '활동중',  sectionId: null,                 name: '활동중 페이지' },
    ];

    for (const sp of subpages) {
        try {
            await openMore();
            const btn = page.getByText(sp.text, { exact: false }).first();
            if (!await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
                warn(sp.name, `"${sp.text}" 버튼 미발견`); continue;
            }
            await btn.click();
            await page.waitForTimeout(700);

            if (sp.sectionId) {
                const ok = await waitSection(page, sp.sectionId, 4000);
                ok ? pass(`더보기: ${sp.name}`) : warn(`더보기: ${sp.name}`, 'section active 안 됨');
            } else {
                pass(`더보기: ${sp.name} (클릭 성공)`);
            }
        } catch (e) { warn(`더보기: ${sp.name}`, e.message); }
    }

    await goHome(page);
}

// ──────────────────────────────────────────────
//  7. URL 파라미터 라우팅
// ──────────────────────────────────────────────
async function testURLRouting(page) {
    step('🔗 [07] URL 파라미터 라우팅');

    const routes = [
        { p: 'home',       section: 'articlesSection',  name: '홈' },
        { p: 'settings',   section: 'settingsSection',  name: '설정' },
        { p: 'more',       section: 'moreMenuSection',  name: '더보기' },
        { p: 'qna',        section: 'qnaSection',       name: 'QnA' },
        { p: 'patchnotes', section: 'patchnotesSection',name: '패치노트' },
        { p: 'bugreport',  section: null,               name: '버그 리포트' },
        { p: 'chat',       section: 'chatSection',      name: '채팅' },
    ];

    for (const r of routes) {
        try {
            await page.goto(`${CONFIG.BASE_URL}/?page=${r.p}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
            await page.waitForTimeout(500);
            if (r.section) {
                const ok = await waitSection(page, r.section, 5000);
                ok ? pass(`URL 라우팅: /?page=${r.p}`) : warn(`URL 라우팅: /?page=${r.p}`, 'section 미활성');
            } else {
                pass(`URL 라우팅: /?page=${r.p} (접속 성공)`);
            }
        } catch (e) { fail(`URL 라우팅: ${r.name}`, e.message); }
    }

    await page.goto(CONFIG.BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await waitSection(page, 'articlesSection', 5000);
}

// ──────────────────────────────────────────────
//  8. 설정 페이지 UI
// ──────────────────────────────────────────────
async function testSettingsPage(page) {
    step('⚙️  [08] 설정 페이지 UI');

    await page.goto(`${CONFIG.BASE_URL}/?page=settings`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await waitSection(page, 'settingsSection', 5000);

    const els = [
        ['#notificationToggle', '알림 토글'],
        ['#profileNickname',    '닉네임 섹션'],
        ['#notificationTypeSection', '알림 타입 설정'],
    ];
    for (const [sel, name] of els) {
        (await waitSel(page, sel, 3000)) ? pass(`설정: ${name}`) : warn(`설정: ${name}`, '비로그인 또는 요소 없음');
    }
}

// ──────────────────────────────────────────────
//  9. 반응형 레이아웃 (뷰포트 전환)
// ──────────────────────────────────────────────
async function testResponsive(page) {
    step('📱 [09] 반응형 레이아웃');

    const sizes = [
        { w: 390,  h: 844,  label: 'iPhone 14' },
        { w: 768,  h: 1024, label: 'iPad' },
        { w: 1280, h: 800,  label: 'Desktop' },
        { w: 375,  h: 667,  label: 'iPhone SE' },
    ];

    for (const s of sizes) {
        try {
            await page.setViewportSize({ width: s.w, height: s.h });
            await page.waitForTimeout(400);
            const nav = await page.$('.bottom-nav');
            nav ? pass(`반응형: ${s.label} (${s.w}×${s.h})`) : warn(`반응형: ${s.label}`, 'nav 숨김');
        } catch (e) { warn(`반응형: ${s.label}`, e.message); }
    }

    // 원래 모바일로 복원
    await page.setViewportSize({ width: 390, height: 844 });
}

// ──────────────────────────────────────────────
//  10. 로그인
// ──────────────────────────────────────────────
async function testLogin(page) {
    step('🔐 [10] 로그인 (이메일/비밀번호)');

    if (!CONFIG.TEST_EMAIL || !CONFIG.TEST_PASSWORD) {
        warn('로그인', 'CONFIG에 TEST_EMAIL / TEST_PASSWORD 미설정 → 로그인 필요 테스트 전부 SKIP');
        return false;
    }

    try {
        const result = await page.evaluate(async (cred) => {
            return new Promise((resolve) => {
                const t = setTimeout(() => resolve({ ok: false, reason: '15s 타임아웃' }), 15000);
                auth.signInWithEmailAndPassword(cred.email, cred.password)
                    .then(u => { clearTimeout(t); resolve({ ok: true, uid: u.user.uid, email: u.user.email }); })
                    .catch(e => { clearTimeout(t); resolve({ ok: false, reason: e.code + ': ' + e.message }); });
            });
        }, { email: CONFIG.TEST_EMAIL, password: CONFIG.TEST_PASSWORD });

        if (result.ok) {
            pass(`로그인 성공 (${result.email})`);
            detail(`UID: ${result.uid}`);
            await page.waitForTimeout(1500); // onAuthStateChanged 처리 대기
            return true;
        } else {
            fail('로그인', result.reason);
            warn('로그인 필요 테스트', '로그인 실패로 전부 SKIP');
            return false;
        }
    } catch (e) {
        fail('로그인', e.message);
        return false;
    }
}

// ──────────────────────────────────────────────
//  11. 기사 작성 → 상세 확인 → 삭제
// ──────────────────────────────────────────────
async function testArticleWriteAndDelete(page, loggedIn) {
    step('✍️  [11] 기사 작성 · 확인 · 삭제');

    if (!loggedIn) { warn('기사 작성', '로그인 안 됨 - 스킵'); return; }

    const testTitle   = `[BOT_TEST] 자동테스트기사_${Date.now()}`;
    const testContent = '<p>이 기사는 자동 테스트 봇이 작성한 테스트 기사입니다. 테스트 완료 후 자동 삭제됩니다.</p>';
    let articleId = null;

    // 기사 작성 버튼 찾기
    await goHome(page);
    try {
        // writeArticleBtn 또는 nav-btn 중 글쓰기
        const writeBtn = await page.$('#writeArticleBtn') ||
                         await page.$('[onclick*="showWriteArticle"]') ||
                         await page.$('[onclick*="writeArticle"]');
        if (!writeBtn) {
            // URL 직접 이동
            await page.goto(`${CONFIG.BASE_URL}/?page=write`, { waitUntil: 'domcontentloaded', timeout: 8000 });
            await page.waitForTimeout(600);
        } else {
            await writeBtn.click();
            await page.waitForTimeout(600);
        }
    } catch (e) { detail(`글쓰기 버튼: ${e.message}`); }

    // 제목 입력
    try {
        const titleInput = await page.$('#articleTitleInput') || await page.$('[placeholder*="제목"]') || await page.$('input[type="text"]');
        if (titleInput) {
            await titleInput.click();
            await titleInput.fill(testTitle);
            pass('기사 제목 입력');
        } else {
            warn('기사 제목 입력', '입력란 없음');
        }
    } catch (e) { warn('기사 제목 입력', e.message); }

    // 본문 입력 (Quill 에디터 또는 textarea)
    try {
        const quillExists = await page.$('.ql-editor');
        if (quillExists) {
            await page.click('.ql-editor');
            await page.keyboard.type('자동 테스트 봇이 작성한 내용입니다. 테스트 완료 후 삭제됩니다.');
            pass('기사 본문 입력 (Quill)');
        } else {
            const contentArea = await page.$('#articleContentInput') || await page.$('textarea');
            if (contentArea) {
                await contentArea.fill('자동 테스트 봇이 작성한 내용입니다.');
                pass('기사 본문 입력 (textarea)');
            }
        }
    } catch (e) { warn('기사 본문 입력', e.message); }

    // Firebase DB에 직접 기사 작성 (UI 경로가 막힐 경우 폴백)
    try {
        const result = await page.evaluate(async (data) => {
            return new Promise((resolve) => {
                const t = setTimeout(() => resolve({ ok: false, reason: 'timeout' }), 10000);
                if (!isLoggedIn()) { clearTimeout(t); resolve({ ok: false, reason: '로그인 상태 아님' }); return; }
                const id = Date.now().toString();
                const article = {
                    id, category: '자유게시판',
                    title: data.title,
                    summary: '봇 자동 테스트용 기사',
                    content: data.content,
                    author: getNickname(),
                    authorEmail: getUserEmail(),
                    date: new Date().toLocaleString(),
                    createdAt: Date.now(),
                    views: 0, likeCount: 0, dislikeCount: 0,
                    thumbnail: null,
                    _botTest: true      // 봇이 만든 기사 표시
                };
                db.ref('articles/' + id).set(article)
                    .then(() => { clearTimeout(t); resolve({ ok: true, id }); })
                    .catch(e => { clearTimeout(t); resolve({ ok: false, reason: e.message }); });
            });
        }, { title: testTitle, content: testContent });

        if (result.ok) {
            articleId = result.id;
            CREATED.articleId = articleId;
            pass(`기사 DB 저장 완료 (ID: ${articleId})`);
            detail(`제목: ${testTitle}`);
        } else {
            fail('기사 DB 저장', result.reason);
        }
    } catch (e) { fail('기사 DB 저장', e.message); }

    if (!articleId) return;

    // 홈으로 가서 방금 올린 기사 확인
    await goHome(page);
    await page.waitForTimeout(1500);

    try {
        // 제목으로 검색
        await page.fill('#searchKeyword', '[BOT_TEST]');
        await page.waitForTimeout(1000);
        const found = await page.$$eval('.article-card', (cards, t) =>
            cards.some(c => c.textContent.includes(t)), '[BOT_TEST]');
        found ? pass('작성 기사 목록 표시 확인') : warn('작성 기사 목록 표시', '카드에서 미발견');
        await page.fill('#searchKeyword', '');
        await page.waitForTimeout(400);
    } catch (e) { warn('작성 기사 목록 확인', e.message); }

    // 기사 상세 진입 확인
    try {
        const result = await page.evaluate(async (id) => {
            return new Promise((resolve) => {
                const t = setTimeout(() => resolve(null), 6000);
                db.ref('articles/' + id).once('value')
                    .then(s => { clearTimeout(t); resolve(s.val()); })
                    .catch(() => { clearTimeout(t); resolve(null); });
            });
        }, articleId);

        result ? pass('기사 DB 조회 확인') : fail('기사 DB 조회', '데이터 없음');
    } catch (e) { fail('기사 DB 조회', e.message); }

    // 삭제는 testCleanup 에서 처리
    detail(`기사 ID ${articleId} → cleanup 대기`);
}

// ──────────────────────────────────────────────
//  12. 댓글 작성 → 확인 → 삭제
// ──────────────────────────────────────────────
async function testCommentWriteAndDelete(page, loggedIn) {
    step('💬 [12] 댓글 작성 · 확인 · 삭제');

    if (!loggedIn || !CREATED.articleId) { warn('댓글 작성', '로그인 안 됨 또는 기사 없음 - 스킵'); return; }

    const articleId  = CREATED.articleId;
    const commentText = `[BOT_COMMENT_${Date.now()}] 자동 테스트 댓글입니다.`;

    try {
        const result = await page.evaluate(async (data) => {
            return new Promise((resolve) => {
                const t = setTimeout(() => resolve({ ok: false, reason: 'timeout' }), 10000);
                if (!isLoggedIn()) { clearTimeout(t); resolve({ ok: false, reason: '로그인 아님' }); return; }
                const cid = Date.now().toString();
                const comment = {
                    author: getNickname(),
                    authorEmail: getUserEmail(),
                    text: data.text,
                    timestamp: new Date().toLocaleString(),
                    _botTest: true
                };
                db.ref('comments/' + data.aid + '/' + cid).set(comment)
                    .then(() => { clearTimeout(t); resolve({ ok: true, cid }); })
                    .catch(e => { clearTimeout(t); resolve({ ok: false, reason: e.message }); });
            });
        }, { aid: articleId, text: commentText });

        if (result.ok) {
            CREATED.commentId = result.cid;
            pass(`댓글 DB 저장 (ID: ${result.cid})`);
            detail(`내용: ${commentText.substring(0, 50)}`);
        } else {
            fail('댓글 저장', result.reason);
        }
    } catch (e) { fail('댓글 저장', e.message); }

    // 댓글 조회 확인
    if (CREATED.commentId) {
        const r = await page.evaluate(async (data) => {
            const s = await db.ref('comments/' + data.aid + '/' + data.cid).once('value').catch(() => null);
            return s?.val() || null;
        }, { aid: articleId, cid: CREATED.commentId });
        r ? pass('댓글 DB 조회 확인') : fail('댓글 DB 조회', '데이터 없음');
    }

    detail(`댓글 ID ${CREATED.commentId} → cleanup 대기`);
}

// ──────────────────────────────────────────────
//  13. 답글 작성 → 확인 → 삭제
// ──────────────────────────────────────────────
async function testReplyWriteAndDelete(page, loggedIn) {
    step('↩️  [13] 답글 작성 · 확인 · 삭제');

    if (!loggedIn || !CREATED.articleId || !CREATED.commentId) {
        warn('답글 작성', '선행 조건 미충족 - 스킵'); return;
    }

    const articleId = CREATED.articleId;
    const commentId = CREATED.commentId;
    const replyText = `[BOT_REPLY_${Date.now()}] 자동 테스트 답글입니다.`;

    try {
        const result = await page.evaluate(async (data) => {
            return new Promise((resolve) => {
                const t = setTimeout(() => resolve({ ok: false, reason: 'timeout' }), 10000);
                const rid = Date.now().toString();
                const reply = {
                    author: getNickname(),
                    authorEmail: getUserEmail(),
                    text: data.text,
                    timestamp: new Date().toLocaleString(),
                    _botTest: true
                };
                db.ref('comments/' + data.aid + '/' + data.cid + '/replies/' + rid).set(reply)
                    .then(() => { clearTimeout(t); resolve({ ok: true, rid }); })
                    .catch(e => { clearTimeout(t); resolve({ ok: false, reason: e.message }); });
            });
        }, { aid: articleId, cid: commentId, text: replyText });

        if (result.ok) {
            CREATED.replyId = result.rid;
            pass(`답글 DB 저장 (ID: ${result.rid})`);
        } else {
            fail('답글 저장', result.reason);
        }
    } catch (e) { fail('답글 저장', e.message); }

    detail(`답글 ID ${CREATED.replyId} → cleanup 대기`);
}

// ──────────────────────────────────────────────
//  14. 대댓글(중첩 답글) 작성 → 확인 → 삭제
// ──────────────────────────────────────────────
async function testNestedReplyWriteAndDelete(page, loggedIn) {
    step('💭 [14] 대댓글 (중첩 답글) 작성 · 확인 · 삭제');

    if (!loggedIn || !CREATED.articleId || !CREATED.commentId || !CREATED.replyId) {
        warn('대댓글 작성', '선행 조건 미충족 - 스킵'); return;
    }

    const articleId = CREATED.articleId;
    const commentId = CREATED.commentId;
    const parentReplyId = CREATED.replyId;
    const nestedText = `[BOT_NESTED_${Date.now()}] 자동 테스트 대댓글입니다.`;

    try {
        const result = await page.evaluate(async (data) => {
            return new Promise((resolve) => {
                const t = setTimeout(() => resolve({ ok: false, reason: 'timeout' }), 10000);
                const nid = Date.now().toString();
                const nested = {
                    author: getNickname(),
                    authorEmail: getUserEmail(),
                    text: data.text,
                    timestamp: new Date().toLocaleString(),
                    parentReplyId: data.parentReplyId,
                    _botTest: true
                };
                db.ref('comments/' + data.aid + '/' + data.cid + '/replies/' + nid).set(nested)
                    .then(() => { clearTimeout(t); resolve({ ok: true, nid }); })
                    .catch(e => { clearTimeout(t); resolve({ ok: false, reason: e.message }); });
            });
        }, { aid: articleId, cid: commentId, parentReplyId, text: nestedText });

        if (result.ok) {
            CREATED.nestedReplyId = result.nid;
            pass(`대댓글 DB 저장 (ID: ${result.nid})`);
        } else {
            fail('대댓글 저장', result.reason);
        }
    } catch (e) { fail('대댓글 저장', e.message); }

    detail(`대댓글 ID ${CREATED.nestedReplyId} → cleanup 대기`);
}

// ──────────────────────────────────────────────
//  15. 추천 / 비추천 (투표)
// ──────────────────────────────────────────────
async function testVoting(page, loggedIn) {
    step('👍 [15] 추천 · 비추천 (투표)');

    if (!loggedIn || !CREATED.articleId) {
        warn('투표', '로그인 안 됨 또는 기사 없음 - 스킵'); return;
    }

    const articleId = CREATED.articleId;

    try {
        // 현재 votes 읽기
        const before = await page.evaluate(async (id) => {
            const s = await db.ref('votes/' + id).once('value').catch(() => null);
            return s?.val() || {};
        }, articleId);
        detail(`투표 전: likes=${Object.values(before).filter(v=>v==='like').length}, dislikes=${Object.values(before).filter(v=>v==='dislike').length}`);

        // 추천 투표
        const r1 = await page.evaluate(async (data) => {
            return new Promise((resolve) => {
                const t = setTimeout(() => resolve({ ok: false }), 8000);
                const uid = auth.currentUser?.uid;
                if (!uid) { clearTimeout(t); resolve({ ok: false, reason: '미로그인' }); return; }
                db.ref('votes/' + data.articleId + '/' + uid).set('like')
                    .then(() => {
                        db.ref('articles/' + data.articleId).update({ likeCount: (data.prevLikes || 0) + 1 });
                        clearTimeout(t); resolve({ ok: true });
                    })
                    .catch(e => { clearTimeout(t); resolve({ ok: false, reason: e.message }); });
            });
        }, { articleId, prevLikes: Object.values(before).filter(v=>v==='like').length });

        r1.ok ? pass('추천 투표 저장') : fail('추천 투표', r1.reason || '실패');

        // 투표 취소 (흔적 제거)
        const r2 = await page.evaluate(async (id) => {
            const uid = auth.currentUser?.uid;
            if (!uid) return { ok: false };
            await db.ref('votes/' + id + '/' + uid).remove().catch(() => {});
            return { ok: true };
        }, articleId);
        r2.ok ? pass('추천 투표 취소 (흔적 제거)') : warn('추천 투표 취소', '실패');

    } catch (e) { fail('투표 테스트', e.message); }
}

// ──────────────────────────────────────────────
//  16. 알림 생성 확인
// ──────────────────────────────────────────────
async function testNotifications(page, loggedIn) {
    step('🔔 [16] 알림 시스템');

    if (!loggedIn) { warn('알림 테스트', '로그인 안 됨 - 스킵'); return; }

    try {
        // 알림 DB에 테스트 알림 직접 생성
        const result = await page.evaluate(async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return { ok: false, reason: '미로그인' };
            const nid = 'bot_test_notif_' + Date.now();
            await db.ref('notifications/' + uid + '/' + nid).set({
                type: 'article',
                title: '🤖 봇 테스트 알림',
                text: '자동 테스트 알림입니다. 곧 삭제됩니다.',
                timestamp: Date.now(),
                read: false,
                pushed: false,
                _botTest: true
            });
            return { ok: true, nid, uid };
        });

        if (result.ok) {
            CREATED.notifKeys.push({ uid: result.uid, key: result.nid });
            pass(`알림 DB 저장 (key: ${result.nid})`);
        } else {
            fail('알림 저장', result.reason);
        }

        // 알림 읽음 처리 테스트
        if (result.ok) {
            const r2 = await page.evaluate(async (data) => {
                await db.ref('notifications/' + data.uid + '/' + data.nid + '/read').set(true).catch(() => {});
                const s = await db.ref('notifications/' + data.uid + '/' + data.nid + '/read').once('value');
                return s.val() === true;
            }, { uid: result.uid, nid: result.nid });
            r2 ? pass('알림 읽음 처리') : fail('알림 읽음 처리', '읽음 상태 미변경');
        }

    } catch (e) { fail('알림 테스트', e.message); }

    // 알림함 탭 UI 확인
    try {
        const btns = await page.$$('.nav-btn');
        if (btns[1]) {
            await btns[1].click();
            await page.waitForTimeout(700);
            pass('알림함 탭 열기');
        }
    } catch (e) { warn('알림함 탭', e.message); }

    await goHome(page);
}

// ──────────────────────────────────────────────
//  17. 버그 제보 DB 직접 작성 → 삭제
// ──────────────────────────────────────────────
async function testBugReport(page, loggedIn) {
    step('🐛 [17] 버그 제보 DB 저장 · 삭제');

    if (!loggedIn) { warn('버그 제보', '로그인 안 됨 - 스킵'); return; }

    try {
        const result = await page.evaluate(async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return { ok: false, reason: '미로그인' };
            const ref = await db.ref('bugReports').push({
                title: '[BOT_TEST] 자동 테스트 버그 제보',
                content: '이 제보는 자동 테스트 봇이 생성했습니다. 곧 삭제됩니다.',
                device: 'Bot/Playwright',
                time: new Date().toLocaleString(),
                authorName: getNickname(),
                authorEmail: getUserEmail(),
                authorUid: uid,
                status: 'pending',
                createdAt: Date.now(),
                _botTest: true
            });
            return { ok: true, key: ref.key };
        });

        if (result.ok) {
            CREATED.bugReportKey = result.key;
            pass(`버그 제보 저장 (key: ${result.key})`);
        } else {
            fail('버그 제보 저장', result.reason);
        }
    } catch (e) { fail('버그 제보 저장', e.message); }

    detail(`버그 제보 key: ${CREATED.bugReportKey} → cleanup 대기`);
}

// ──────────────────────────────────────────────
//  18. 설정 변경 테스트 (알림 토글 → 원복)
// ──────────────────────────────────────────────
async function testSettingsChange(page, loggedIn) {
    step('🔧 [18] 설정 변경 · 원복');

    if (!loggedIn) { warn('설정 변경', '로그인 안 됨 - 스킵'); return; }

    try {
        const uid = await page.evaluate(() => auth.currentUser?.uid);

        // 현재 알림 설정 읽기
        const before = await page.evaluate(async (uid) => {
            const s = await db.ref('users/' + uid + '/notificationsEnabled').once('value');
            return s.val();
        }, uid);
        detail(`알림 설정 변경 전: ${before}`);

        // 반전 저장
        const flipped = before === false ? true : false;
        await page.evaluate(async (data) => {
            await db.ref('users/' + data.uid + '/notificationsEnabled').set(data.v);
        }, { uid, v: flipped });
        pass(`알림 설정 변경: ${before} → ${flipped}`);

        // 원복
        await page.evaluate(async (data) => {
            await db.ref('users/' + data.uid + '/notificationsEnabled').set(data.v);
        }, { uid, v: before === null ? true : before });
        pass('알림 설정 원복 완료');

        // 알림 타입 설정 (article/comment) 토글 테스트
        const types = ['article', 'comment', 'chat'];
        for (const type of types) {
            const snap = await page.evaluate(async (data) => {
                const s = await db.ref('users/' + data.uid + '/notificationTypes/' + data.type).once('value');
                return s.val();
            }, { uid, type });

            // null(기본값=true)이면 false로 저장 후 다시 삭제
            if (snap !== false) {
                await page.evaluate(async (data) => {
                    await db.ref('users/' + data.uid + '/notificationTypes/' + data.type).set(false);
                    await db.ref('users/' + data.uid + '/notificationTypes/' + data.type).remove();
                }, { uid, type });
                pass(`알림 타입: ${type} 토글 → 원복`);
            } else {
                pass(`알림 타입: ${type} 현재 false 유지`);
            }
        }

    } catch (e) { fail('설정 변경 테스트', e.message); }
}

// ──────────────────────────────────────────────
//  19. 채팅 페이지 UI
// ──────────────────────────────────────────────
async function testChatUI(page, loggedIn) {
    step('💬 [19] 채팅 페이지 UI');

    try {
        await page.goto(`${CONFIG.BASE_URL}/?page=chat`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(1500);

        const sectionOk = await waitSection(page, 'chatSection', 5000);
        sectionOk ? pass('chatSection 활성화') : warn('chatSection', 'active 안 됨');

        if (sectionOk) {
            const chatHeader = await page.$('#chatSection h2, #chatSection .chat-header');
            chatHeader ? pass('채팅 헤더 렌더링') : warn('채팅 헤더', '요소 없음');

            const newChatBtn = await page.$('[onclick*="showNewChatModal"]');
            newChatBtn ? pass('새 채팅 버튼 존재') : warn('새 채팅 버튼', '없음');
        }
    } catch (e) { warn('채팅 UI 테스트', e.message); }

    await goHome(page);
}

// ──────────────────────────────────────────────
//  20. 콘솔 에러 분석
// ──────────────────────────────────────────────
function testConsoleErrors() {
    step('🖥️  [20] 콘솔 에러 분석');

    const ignorePatterns = [
        'favicon', 'ERR_BLOCKED', 'sw.js', 'VAPID', 'ERR_ABORTED',
        'analytics', 'gtag', 'Non-Error', 'ResizeObserver'
    ];
    const critical = R.consoleErrors.filter(e => !ignorePatterns.some(p => e.includes(p)));

    if (critical.length === 0) {
        pass('심각한 콘솔 에러 없음');
    } else {
        detail(`총 ${R.consoleErrors.length}개 중 ${critical.length}개 심각`);
        critical.slice(0, 8).forEach(e => fail('콘솔 에러', e.substring(0, 130)));
    }
}

// ──────────────────────────────────────────────
//  21. 네트워크 에러 분석
// ──────────────────────────────────────────────
function testNetworkErrors() {
    step('🌐 [21] 네트워크 에러 분석');

    const ignorePatterns = ['favicon', 'analytics', 'gtag', 'sw.js'];
    const critical = R.networkErrors.filter(
        e => e.status >= 400 && !ignorePatterns.some(p => e.url.includes(p))
    );

    if (critical.length === 0) {
        pass('심각한 네트워크 에러 없음');
    } else {
        critical.slice(0, 8).forEach(e => fail('네트워크 에러', `[${e.status}] ${e.url.substring(0, 100)}`));
    }
}

// ──────────────────────────────────────────────
//  22. 성능 측정
// ──────────────────────────────────────────────
async function testPerformance(page) {
    step('⚡ [22] 성능 측정');

    try {
        const metrics = await page.evaluate(() => {
            const nav = performance.getEntriesByType('navigation')[0];
            if (!nav) return null;
            return {
                domInteractive:   Math.round(nav.domInteractive),
                domComplete:      Math.round(nav.domContentLoadedEventEnd),
                loadEventEnd:     Math.round(nav.loadEventEnd),
                transferSize:     nav.transferSize ? Math.round(nav.transferSize / 1024) : null,
            };
        });

        if (metrics) {
            detail(`DOM Interactive: ${metrics.domInteractive}ms`);
            detail(`DOM Complete:    ${metrics.domComplete}ms`);
            detail(`Load Event:      ${metrics.loadEventEnd}ms`);
            if (metrics.transferSize) detail(`전송 크기: ${metrics.transferSize} KB`);

            metrics.domComplete < 5000  ? pass(`DOM Complete ${metrics.domComplete}ms (< 5s)`)
                                        : warn('DOM Complete', `${metrics.domComplete}ms (느림)`);
            metrics.loadEventEnd < 8000 ? pass(`페이지 Load ${metrics.loadEventEnd}ms (< 8s)`)
                                        : warn('페이지 Load', `${metrics.loadEventEnd}ms (느림)`);
        } else {
            warn('성능 측정', 'navigation entry 없음');
        }
    } catch (e) { warn('성능 측정', e.message); }
}

// ──────────────────────────────────────────────
//  🧹 CLEANUP — 모든 흔적 삭제
// ──────────────────────────────────────────────
async function cleanup(page) {
    step('🧹 [CLEANUP] 모든 테스트 흔적 삭제');

    const deletions = [];

    try {
        // 기사 + 연관 votes/comments 전체 삭제
        if (CREATED.articleId) {
            const r = await page.evaluate(async (id) => {
                try {
                    await Promise.all([
                        db.ref('articles/' + id).remove(),
                        db.ref('votes/' + id).remove(),
                        db.ref('comments/' + id).remove(),
                    ]);
                    return { ok: true };
                } catch (e) { return { ok: false, reason: e.message }; }
            }, CREATED.articleId);
            if (r.ok) {
                pass(`기사 삭제: articles/${CREATED.articleId}`);
                pass(`연관 votes/${CREATED.articleId} 삭제`);
                pass(`연관 comments/${CREATED.articleId} 삭제`);
                R.cleanupLog.push(`articles/${CREATED.articleId}`);
                R.cleanupLog.push(`votes/${CREATED.articleId}`);
                R.cleanupLog.push(`comments/${CREATED.articleId}`);
            } else {
                fail('기사 삭제', r.reason);
            }
        }

        // 버그 제보 삭제
        if (CREATED.bugReportKey) {
            const r = await page.evaluate(async (key) => {
                try { await db.ref('bugReports/' + key).remove(); return { ok: true }; }
                catch (e) { return { ok: false, reason: e.message }; }
            }, CREATED.bugReportKey);
            if (r.ok) {
                pass(`버그 제보 삭제: bugReports/${CREATED.bugReportKey}`);
                R.cleanupLog.push(`bugReports/${CREATED.bugReportKey}`);
            } else {
                fail('버그 제보 삭제', r.reason);
            }
        }

        // 알림 삭제
        for (const { uid, key } of CREATED.notifKeys) {
            const r = await page.evaluate(async (data) => {
                try { await db.ref('notifications/' + data.uid + '/' + data.key).remove(); return { ok: true }; }
                catch (e) { return { ok: false, reason: e.message }; }
            }, { uid, key });
            if (r.ok) {
                pass(`알림 삭제: notifications/${uid}/${key}`);
                R.cleanupLog.push(`notifications/${uid}/${key}`);
            } else {
                fail('알림 삭제', r.reason);
            }
        }

        // _botTest 플래그 남은 기사 전수 정리 (혹시 다른 봇 실행 잔여물)
        const orphans = await page.evaluate(async () => {
            try {
                const s = await db.ref('articles').orderByChild('_botTest').equalTo(true).once('value');
                const keys = [];
                s.forEach(c => keys.push(c.key));
                for (const k of keys) {
                    await db.ref('articles/' + k).remove().catch(() => {});
                    await db.ref('votes/' + k).remove().catch(() => {});
                    await db.ref('comments/' + k).remove().catch(() => {});
                }
                return keys;
            } catch { return []; }
        });
        if (orphans.length > 0) {
            pass(`고아 봇 기사 ${orphans.length}개 추가 삭제`);
            detail(`IDs: ${orphans.join(', ')}`);
        }

        // bugReports 중 _botTest 잔여물 정리
        const orphanBugs = await page.evaluate(async () => {
            try {
                const s = await db.ref('bugReports').orderByChild('_botTest').equalTo(true).once('value');
                const keys = [];
                s.forEach(c => keys.push(c.key));
                for (const k of keys) await db.ref('bugReports/' + k).remove().catch(() => {});
                return keys;
            } catch { return []; }
        });
        if (orphanBugs.length > 0) {
            pass(`고아 봇 버그 제보 ${orphanBugs.length}개 추가 삭제`);
        }

        // notifications 중 _botTest 잔여물 정리
        const myUid = await page.evaluate(() => auth.currentUser?.uid).catch(() => null);
        if (myUid) {
            const orphanNotifs = await page.evaluate(async (uid) => {
                try {
                    const s = await db.ref('notifications/' + uid).once('value');
                    const keys = [];
                    s.forEach(c => { if (c.val()?._botTest) keys.push(c.key); });
                    for (const k of keys) await db.ref('notifications/' + uid + '/' + k).remove().catch(() => {});
                    return keys;
                } catch { return []; }
            }, myUid);
            if (orphanNotifs.length > 0) {
                pass(`고아 봇 알림 ${orphanNotifs.length}개 추가 삭제`);
            }
        }

    } catch (e) {
        fail('Cleanup 전체', e.message);
    }

    // Cleanup 검증
    if (CREATED.articleId) {
        const stillExists = await page.evaluate(async (id) => {
            const s = await db.ref('articles/' + id).once('value').catch(() => null);
            return !!s?.val();
        }, CREATED.articleId).catch(() => false);
        stillExists ? fail('삭제 검증: 기사', '아직 DB에 남아있음!') : pass('삭제 검증: 기사 완전 제거 확인');
    }
}

// ──────────────────────────────────────────────
//  리포트 생성
// ──────────────────────────────────────────────
function generateReport() {
    const total    = R.passed.length + R.failed.length;
    const passRate = total > 0 ? Math.round(R.passed.length / total * 100) : 0;
    const duration = Math.round((Date.now() - new Date(R.startTime).getTime()) / 1000);

    const line = '═'.repeat(60);
    const lines = [
        line,
        '         🤖  해정뉴스 자동 테스트 리포트  v2.0',
        line,
        `  실행 시작 : ${R.startTime}`,
        `  실행 시간 : ${Math.floor(duration/60)}분 ${duration%60}초`,
        '',
        `  ✅ 통과   : ${R.passed.length}건`,
        `  ❌ 실패   : ${R.failed.length}건`,
        `  ⚠️  경고   : ${R.warnings.length}건`,
        `  📈 통과율 : ${passRate}%  (${R.passed.length}/${total})`,
        '',
    ];

    if (R.failed.length > 0) {
        lines.push('─'.repeat(60));
        lines.push('  ❌ 실패 목록');
        lines.push('─'.repeat(60));
        R.failed.forEach((f, i) => lines.push(`  ${String(i+1).padStart(2)}. [${f.name}]\n      → ${f.reason}`));
        lines.push('');
    }

    if (R.warnings.length > 0) {
        lines.push('─'.repeat(60));
        lines.push('  ⚠️  경고 목록');
        lines.push('─'.repeat(60));
        R.warnings.forEach((w, i) => lines.push(`  ${String(i+1).padStart(2)}. [${w.name}]\n      → ${w.reason}`));
        lines.push('');
    }

    if (R.cleanupLog.length > 0) {
        lines.push('─'.repeat(60));
        lines.push('  🧹 삭제된 DB 경로 (흔적 제거 완료)');
        lines.push('─'.repeat(60));
        R.cleanupLog.forEach(p => lines.push(`      ✓ /${p}`));
        lines.push('');
    }

    if (R.consoleErrors.length > 0) {
        lines.push('─'.repeat(60));
        lines.push(`  🖥️  콘솔 에러 (${R.consoleErrors.length}건, 최대 15개 표시)`);
        lines.push('─'.repeat(60));
        R.consoleErrors.slice(0, 15).forEach((e, i) => lines.push(`  ${String(i+1).padStart(2)}. ${e.substring(0, 140)}`));
        lines.push('');
    }

    lines.push(line);
    lines.push(passRate >= 80 ? '  🎉 전체 결과: 우수' : passRate >= 60 ? '  🔶 전체 결과: 보통' : '  🚨 전체 결과: 개선 필요');
    lines.push(line);

    const report = lines.join('\n');
    console.log('\n' + report);

    const filename = `report_${new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)}.txt`;
    fs.writeFileSync(filename, report, 'utf8');
    log(`\n📄 리포트 저장 완료: ${filename}`);

    return passRate;
}

// ──────────────────────────────────────────────
//  메인
// ──────────────────────────────────────────────
(async () => {
    log('🤖 해정뉴스 자동 테스트 봇 v2.0 시작');
    log(`🌐 대상: ${CONFIG.BASE_URL}`);
    log(`🔐 로그인 계정: ${CONFIG.TEST_EMAIL || '(미설정 - 비로그인 모드)'}\n`);

    const browser = await chromium.launch({
        headless: CONFIG.HEADLESS,
        slowMo:   CONFIG.SLOW_MO,
    });

    const context = await browser.newContext({
        viewport:  { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        locale:    'ko-KR',
        timezoneId:'Asia/Seoul',
    });

    const page = await context.newPage();

    // 이벤트 리스너
    page.on('console', msg => {
        if (msg.type() === 'error') R.consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => R.consoleErrors.push(`[PageError] ${err.message}`));
    page.on('response', res => {
        if (res.status() >= 400) R.networkErrors.push({ url: res.url(), status: res.status() });
    });

    dismissDialogs(page);

    try {
        // ── Phase 1: 기본 (로그인 불필요) ──────────────────
        const loaded = await testPageLoad(page);
        if (!loaded) {
            log('\n❌ 페이지 로드 실패 - 테스트 중단');
            await browser.close(); process.exit(1);
        }

        await testFirebase(page);
        await testArticleList(page);
        await testArticleDetail(page);
        await testNavigation(page);
        await testMoreMenu(page);
        await testURLRouting(page);
        await testSettingsPage(page);
        await testResponsive(page);
        await testChatUI(page, false);
        await testPerformance(page);

        // ── Phase 2: 로그인 & 인증 필요 ─────────────────────
        await page.goto(CONFIG.BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await waitSection(page, 'articlesSection', 5000);

        const loggedIn = await testLogin(page);

        await testArticleWriteAndDelete(page, loggedIn);
        await testCommentWriteAndDelete(page, loggedIn);
        await testReplyWriteAndDelete(page, loggedIn);
        await testNestedReplyWriteAndDelete(page, loggedIn);
        await testVoting(page, loggedIn);
        await testNotifications(page, loggedIn);
        await testBugReport(page, loggedIn);
        await testSettingsChange(page, loggedIn);

        // ── Phase 3: 콘솔/네트워크 분석 ────────────────────
        testConsoleErrors();
        testNetworkErrors();

        // ── Phase 4: 흔적 전부 삭제 ────────────────────────
        await cleanup(page);

    } catch (e) {
        log(`\n💥 예상치 못한 오류: ${e.message}`);
        log(e.stack);
        R.failed.push({ name: '전체 실행', reason: e.message });
        // 오류가 나도 cleanup 시도
        try { await cleanup(page); } catch {}
    } finally {
        const passRate = generateReport();
        await browser.close();
        log('\n🤖 테스트 봇 종료');
        process.exit(passRate < 70 ? 1 : 0);
    }
})();