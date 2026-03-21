// =====================================================================
// ✨ 해정뉴스 AI 도우미 (Puter.js - 무제한 무료)
// 처음 사용 시 Puter.com 무료 계정 팝업 자동 표시
// =====================================================================
(function() {
    'use strict';

    const PUTER_SRC = 'https://js.puter.com/v2/';
    const AI_MODEL  = 'gemini-2.5-flash-lite';
    let   _puterLoading = false;

    // ──────────────────────────────────────────────
    // 해정뉴스 사이트 지식베이스 (AI 채팅 학습 데이터)
    // ──────────────────────────────────────────────
    const SITE_KNOWLEDGE = `
[해정뉴스 기본 정보]
- 이름: 해정뉴스
- 설명: 학생들이 직접 운영하는 뉴스 및 커뮤니티 웹사이트
- URL: https://fff376327yhed.github.io/hsj_news.io
- 로그인 방식: Google 계정 로그인만 지원
- 테마: 다크모드 지원 (설정에서 변경 가능)
- 앱 설치: PWA 지원 — 브라우저에서 홈 화면에 앱처럼 설치 가능

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[기사 / 글 기능]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 로그인한 누구나 기사(글) 작성 가능
- 상단 "글쓰기" 버튼으로 작성 시작
- 에디터: Quill.js 기반 (사진 업로드, 서식 지원)
- 임시저장 기능 있음 (작성 중 자동 저장)
- 기사 카테고리: 자유게시판 / 논란 / 연애 / 정아영 / 게넥도 / 게임 / 마크
- 기사 기능: 추천(좋아요), 비추천, 조회수 자동 집계
- 기사 공유: 링크 복사 버튼 지원
- 기사 수정/삭제: 본인 글만 가능
- AI 요약: 기사 하단 "✨ AI 요약 보기" 버튼으로 Puter AI 요약 제공
- 핫 기사: 추천 수 기준 상단 노출

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[댓글 / 대댓글]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 기사마다 댓글 작성 가능 (로그인 필요)
- 대댓글(답글) 지원
- 댓글에도 사진 업로드 가능
- 댓글 추천 기능 있음

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[실시간 채팅]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 접근: 하단 네비게이션 채팅 아이콘 또는 더보기 메뉴 → 채팅
- Firebase 실시간 데이터베이스 기반
- 사진 업로드 가능
- 닉네임 + 프로필 사진 표시

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[친구 기능]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 접근: 더보기 메뉴 → 친구 / 친구 요청
- 친구 추가 및 1:1 메시지 기능

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[알림]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 접근: 상단 종 아이콘 또는 하단 네비게이션
- 알림 종류: 새 기사, 댓글, 좋아요, 위키 수정 요청 등
- 알림 설정: 알림 패널 내 "알림 설정"에서 카테고리별 ON/OFF 가능
- 카테고리 필터: 특정 카테고리 기사 알림만 받도록 설정 가능
- 푸시 알림: 브라우저 알림 권한 허용 시 백그라운드 알림 수신

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[투표 / 설문]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 접근: 더보기 메뉴 → 투표
- 커뮤니티 투표 및 설문 참여 가능

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Q&A 게시판]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 접근: 더보기 메뉴 → Q&A
- 질문과 답변 형식의 게시판

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[버그 제보 / 개선 제보]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 버그 제보: 더보기 메뉴 → 버그 제보 (사이트 오류 제보)
- 개선 제보: 더보기 메뉴 → 개선 제보 (기능 개선 요청)
- 운영자가 검토 후 반영

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[패치노트]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 접근: 더보기 메뉴 → 패치노트
- 사이트 업데이트 기록 확인 가능

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[설정 / 프로필]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 접근: 하단 네비게이션 설정 아이콘
- 닉네임 변경 가능
- 프로필 사진 변경 가능 (최대 200px 자동 압축)
- 다크모드 전환 가능

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[나무아래키 (위키 서비스)]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 접근: 더보기 메뉴 → 나무아래키
- 해정뉴스 자체 위키 서비스
- 누구나 문서 작성 및 편집 가능
- 문서 역사(편집 이력) 확인 가능
- 수정 요청 시스템: 작성자가 편집 잠금 설정 시 수정 요청으로 전환
- 관리자는 모든 문서 수정/삭제 가능
- AI 초안 자동 생성 기능 지원 (편집 툴바 ✨ AI 초안 버튼)

[나무마크 문법 — 나무아래키 편집 방법]
- == 제목 ==        → 대제목 (h2)
- === 소제목 ===    → 소제목 (h3)
- ==== 소소제목 ==== → 세부 제목 (h4)
- '''굵게'''        → 굵은 텍스트
- ''기울임''        → 기울임 텍스트
- __밑줄__          → 밑줄 텍스트
- --취소선--        → 취소선
- ~~형광펜~~        → 노란 형광펜 강조
- [[문서명]]        → 내부 위키 링크
- [[문서명|표시텍스트]] → 텍스트를 지정한 내부 링크
- [* 각주내용]      → 각주 삽입
- {{{코드}}}        → 인라인 코드
- {{{#ff0000 빨간텍스트}}} → 컬러 텍스트
- [목차]            → 목차 자동 생성
- * 항목            → 순서 없는 목록
- ## 주석           → 주석 (화면에 표시 안 됨)
- ||제목||제목||    → 표(테이블) 작성

[나무마크 예시]
[목차]

== 개요 ==
여기에 내용을 씁니다.

== 특징 ==
=== 편집 방법 ===
* 누구나 편집할 수 있습니다
* [[다른문서]]로 내부 링크를 만들 수 있습니다

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[AI 기능]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 기사 AI 요약: 기사 하단 "✨ AI 요약 보기" 버튼 클릭
- AI 채팅: 화면 우측 하단 ✨ 버튼 클릭
- 위키 AI 초안: 위키 편집 화면 툴바의 "✨ AI 초안" 버튼
- AI 엔진: Puter AI (Gemini 2.5 Flash Lite) — 무제한 무료
- 처음 사용 시 Puter.com 무료 계정 가입 팝업이 자동으로 뜸 (정상)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[더보기 메뉴 전체 항목]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 자유게시판 바로가기
- 마크 카테고리 바로가기
- 알림 확인
- 채팅
- 투표
- Q&A
- 패치노트
- 활동 상태
- 버그 제보
- 개선 제보
- ✨ AI 도우미 (AI 채팅 열기)

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[자주 묻는 질문]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q: 글(기사)을 어떻게 쓰나요?
A: 로그인 후 상단 "글쓰기" 버튼을 누르세요. 제목, 카테고리, 내용을 입력하고 등록하면 됩니다. 임시저장도 가능합니다.

Q: 카테고리는 어떤 것들이 있나요?
A: 자유게시판, 논란, 연애, 정아영, 게넥도, 게임, 마크 총 7개입니다.

Q: 댓글은 어떻게 쓰나요?
A: 기사 하단 댓글 입력창에 작성하세요. 사진도 업로드할 수 있습니다.

Q: 채팅은 어떻게 하나요?
A: 더보기 메뉴 또는 하단 네비게이션에서 채팅을 선택하세요.

Q: 나무아래키는 뭔가요?
A: 해정뉴스의 자체 위키입니다. 더보기 → 나무아래키로 접속하세요. 누구나 문서를 작성하고 편집할 수 있습니다.

Q: 나무마크가 뭔가요?
A: 나무아래키에서 사용하는 문서 편집 문법입니다. == 제목 ==, '''굵게''', [[링크]] 등의 문법을 사용합니다.

Q: 알림 설정은 어떻게 하나요?
A: 알림 패널 → 알림 설정에서 카테고리별로 원하는 알림만 받을 수 있습니다.

Q: 프로필 사진이나 닉네임을 바꾸고 싶어요.
A: 하단 네비게이션의 설정(톱니바퀴 아이콘)에서 변경할 수 있습니다.

Q: 앱으로 설치할 수 있나요?
A: 네! PWA를 지원합니다. 브라우저에서 "홈 화면에 추가"를 누르면 앱처럼 설치됩니다.

Q: AI 요약이 처음에 팝업이 뜨는 이유가 뭔가요?
A: Puter AI를 사용하기 위해 Puter.com 무료 계정 가입이 필요합니다. 한 번만 가입하면 이후에는 팝업 없이 사용 가능합니다.

Q: 버그나 불편한 점을 어디에 제보하나요?
A: 더보기 → 버그 제보(오류) 또는 개선 제보(기능 요청)로 제보해주세요.

Q: 주식 기능이 있나요?
A: 아니요, 현재 해정뉴스에는 주식 기능이 없습니다. 예전에 개발 계획이 있었으나 현재는 제공되지 않습니다.
`;

    // ──────────────────────────────────────────────
    // Puter.js 동적 로드
    // ──────────────────────────────────────────────
    function loadPuter() {
        return new Promise((resolve, reject) => {
            if (window.puter) return resolve();
            if (_puterLoading) {
                const t = setInterval(() => { if (window.puter) { clearInterval(t); resolve(); } }, 100);
                setTimeout(() => { clearInterval(t); reject(new Error('Puter 로드 시간 초과')); }, 12000);
                return;
            }
            _puterLoading = true;
            const s = document.createElement('script');
            s.src = PUTER_SRC;
            s.onload = () => { _puterLoading = false; resolve(); };
            s.onerror = () => { _puterLoading = false; reject(new Error('Puter.js 로드 실패')); };
            document.head.appendChild(s);
        });
    }

    async function askAI(prompt, opts = {}) {
        await loadPuter();
        const resp = await puter.ai.chat(prompt, { model: opts.model || AI_MODEL });
        if (typeof resp === 'string') return resp;
        const c = resp?.message?.content;
        if (typeof c === 'string') return c;
        if (Array.isArray(c)) return c.map(b => b.text || '').join('');
        return String(resp ?? '');
    }

    // ══════════════════════════════════════════════════════════════
    // 1. 기사 AI 요약 (_aiSummarize - script.js HTML에서 호출됨)
    // ══════════════════════════════════════════════════════════════
    window._aiSummarize = async function() {
        const btn    = document.getElementById('_aiSummaryBtn');
        const result = document.getElementById('_aiSummaryResult');
        const root   = document.getElementById('articleDetail');
        if (!btn || !result) return;

        // 토글
        if (result.style.display !== 'none') {
            result.style.display = 'none';
            btn.innerHTML = '✨ AI 요약 보기 <span style="font-size:11px;font-weight:400;color:#aaa;">Puter AI</span>';
            return;
        }

        // 본문 수집 - 더 넓게 탐색
        const bodyEl = root?.querySelector('[style*="line-height:1.8"][style*="color:#333"]')
                    || root?.querySelector('.ql-editor')
                    || root?.querySelector('[class*="article-body"]');
        const rawText = bodyEl?.innerText?.trim() || root?.innerText?.slice(0, 3000) || '';
        const titleEl = root?.querySelector('[style*="font-size:22px"],[style*="font-size:20px"],h1,h2');
        const title   = titleEl?.innerText?.trim() || '기사';

        if (rawText.length < 30) {
            result.style.display = 'block';
            result.innerHTML = '<span style="color:#888;">본문을 찾을 수 없어요.</span>';
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI가 읽는 중... <span style="font-size:11px;color:#aaa;">(처음엔 Puter 가입 팝업이 뜹니다)</span>';

        try {
            const prompt = `다음 기사를 한국어로 3줄로 요약해주세요. 핵심만 간결하게.\n\n제목: ${title}\n\n본문:\n${rawText.slice(0, 2500)}`;
            const summary = await askAI(prompt);
            result.style.display = 'block';
            result.innerHTML = `
                <div style="font-size:11px;font-weight:700;color:#c62828;margin-bottom:8px;display:flex;align-items:center;gap:6px;">
                    ✨ AI 요약 <span style="font-weight:400;color:#aaa;">· Puter AI</span>
                </div>
                ${summary.trim().replace(/\n/g, '<br>')}`;
            btn.innerHTML = '✨ AI 요약 닫기';
        } catch (e) {
            result.style.display = 'block';
            result.innerHTML = `<span style="color:#c62828;font-size:13px;">오류: ${e.message}</span>`;
            btn.innerHTML = '✨ AI 요약 보기 <span style="font-size:11px;font-weight:400;color:#aaa;">Puter AI</span>';
        } finally {
            btn.disabled = false;
        }
    };

    // ══════════════════════════════════════════════════════════════
    // 2. AI 채팅 (해정뉴스 학습 포함)
    // ══════════════════════════════════════════════════════════════
    function injectChatFloat() {
        if (document.getElementById('_aiFloatWrap')) return;

        const style = document.createElement('style');
        style.textContent = `
            #_aiChatWin{display:none;position:fixed;bottom:148px;right:16px;width:320px;height:460px;
                background:white;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.2);
                z-index:8888;flex-direction:column;overflow:hidden;border:1px solid #eee;}
            #_aiChatWin.open{display:flex;}
            #_aiChatHdr{background:linear-gradient(135deg,#c62828,#b71c1c);color:white;
                padding:13px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}
            #_aiChatHdrIcon{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.2);
                display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
            #_aiChatMsgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;}
            .aib{max-width:86%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.65;word-break:break-word;}
            .aib.u{background:#c62828;color:white;align-self:flex-end;border-radius:14px 14px 4px 14px;}
            .aib.b{background:#f5f5f5;color:#333;align-self:flex-start;border-radius:14px 14px 14px 4px;}
            .aib.b.thinking{color:#aaa;font-style:italic;}
            #_aiChatInputRow{padding:10px;border-top:1px solid #eee;display:flex;gap:8px;flex-shrink:0;}
            #_aiChatInput{flex:1;padding:8px 12px;border:1.5px solid #eee;border-radius:20px;
                font-size:13px;outline:none;resize:none;max-height:80px;font-family:inherit;}
            #_aiChatInput:focus{border-color:#c62828;}
            #_aiSendBtn{width:36px;height:36px;border-radius:50%;background:#c62828;color:white;
                border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
            #_aiSendBtn:disabled{opacity:.5;cursor:default;}
            #_aiQuickBtns{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 10px;}
            .aiq{padding:5px 10px;border:1px solid #ffcdd2;border-radius:20px;background:#fff8f8;
                color:#c62828;font-size:11px;cursor:pointer;white-space:nowrap;transition:all .15s;}
            .aiq:hover{background:#c62828;color:white;}
            #_aiChatFab{position:fixed;bottom:80px;right:16px;z-index:8888;width:52px;height:52px;
                border-radius:50%;background:#c62828;color:white;border:none;cursor:pointer;
                box-shadow:0 4px 16px rgba(198,40,40,.4);display:flex;align-items:center;
                justify-content:center;transition:transform .2s;font-size:22px;}
            #_aiChatFab:hover{transform:scale(1.08);}
            #_aiChatFab .ai-badge{position:absolute;top:-2px;right:-2px;width:14px;height:14px;
                background:#4caf50;border-radius:50%;border:2px solid white;display:none;}
        `;
        document.head.appendChild(style);

        const wrap = document.createElement('div');
        wrap.id = '_aiFloatWrap';
        wrap.innerHTML = `
            <div id="_aiChatWin">
                <div id="_aiChatHdr">
                    <div id="_aiChatHdrIcon">✨</div>
                    <div style="flex:1;">
                        <div style="font-weight:800;font-size:14px;">해정뉴스 AI 도우미</div>
                        <div style="font-size:10px;opacity:.8;margin-top:1px;">powered by Puter AI · 무제한 무료</div>
                    </div>
                    <button onclick="document.getElementById('_aiChatWin').classList.remove('open')"
                        style="background:none;border:none;color:white;font-size:20px;cursor:pointer;padding:0;line-height:1;">×</button>
                </div>
                <div id="_aiChatMsgs">
                    <div class="aib b">안녕하세요! 해정뉴스 AI 도우미입니다 ✨<br><br>해정뉴스 이용 방법이나 궁금한 점을 물어보세요.<br><span style="font-size:11px;color:#aaa;">처음 사용 시 Puter 무료 가입이 필요합니다.</span></div>
                </div>
                <div id="_aiQuickBtns">
                    <button class="aiq" onclick="window._aiQuick('글 쓰는 방법')">📝 글쓰기</button>
                    <button class="aiq" onclick="window._aiQuick('나무아래키가 뭐야?')">📖 나무아래키</button>
                    <button class="aiq" onclick="window._aiQuick('채팅 어떻게 해?')">💬 채팅</button>
                    <button class="aiq" onclick="window._aiQuick('알림 설정 방법')">🔔 알림</button>
                    <button class="aiq" onclick="window._aiQuick('AI 기능 뭐가 있어?')">🤖 AI 기능</button>
                    <button class="aiq" onclick="window._aiQuick('투표 기능 어떻게 써?')">🗳️ 투표</button>
                </div>
                <div id="_aiChatInputRow">
                    <textarea id="_aiChatInput" placeholder="메시지 입력... (Enter 전송)" rows="1"
                        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();window._aiSend();}"></textarea>
                    <button id="_aiSendBtn" onclick="window._aiSend()">
                        <i class="fas fa-paper-plane" style="font-size:13px;"></i>
                    </button>
                </div>
            </div>
            <button id="_aiChatFab" onclick="window._aiToggle()" title="AI 도우미">
                🤖<div class="ai-badge" id="_aiBadge"></div>
            </button>`;
        document.body.appendChild(wrap);
    }

    window._aiToggle = function() {
        document.getElementById('_aiChatWin')?.classList.toggle('open');
        document.getElementById('_aiBadge').style.display = 'none';
    };

    window._aiQuick = function(q) {
        const input = document.getElementById('_aiChatInput');
        if (input) { input.value = q; window._aiSend(); }
    };

    const _history = [];

    window._aiSend = async function() {
        const input   = document.getElementById('_aiChatInput');
        const msgs    = document.getElementById('_aiChatMsgs');
        const sendBtn = document.getElementById('_aiSendBtn');
        const text    = input?.value.trim();
        if (!text || !msgs || sendBtn?.disabled) return;

        input.value = '';
        _addBubble(msgs, text, 'u');
        _history.push({ r: 'user', t: text });

        sendBtn.disabled = true;
        const thinking = _addBubble(msgs, '⏳ 답변 생성 중... (처음엔 Puter 팝업이 뜹니다)', 'b thinking');

        try {
            // 해정뉴스 지식 + 대화 내역 포함
            const ctx = _history.slice(-8).map(m => `${m.r === 'user' ? '사용자' : 'AI'}: ${m.t}`).join('\n');
            const prompt = `당신은 해정뉴스 커뮤니티의 AI 도우미입니다. 아래 사이트 정보를 바탕으로 친절하고 간결하게 한국어로 답변하세요. 모르면 솔직하게 모른다고 하세요.

${SITE_KNOWLEDGE}

대화 내역:
${ctx}
AI:`;
            const reply = await askAI(prompt);
            thinking.textContent = reply;
            thinking.classList.remove('thinking');
            _history.push({ r: 'ai', t: reply });

            // 뱃지 표시 (창이 닫혀있을 때)
            if (!document.getElementById('_aiChatWin')?.classList.contains('open')) {
                document.getElementById('_aiBadge').style.display = 'block';
            }
        } catch (e) {
            thinking.innerHTML = `<span style="color:#c62828;">오류: ${e.message}</span>`;
            thinking.classList.remove('thinking');
        } finally {
            sendBtn.disabled = false;
            msgs.scrollTop = msgs.scrollHeight;
        }
    };

    function _addBubble(container, text, cls) {
        const el = document.createElement('div');
        el.className = `aib ${cls}`;
        el.textContent = text;
        container.appendChild(el);
        container.scrollTop = container.scrollHeight;
        return el;
    }

    // ══════════════════════════════════════════════════════════════
    // 3. 위키 편집 AI 초안 버튼
    // ══════════════════════════════════════════════════════════════
    function injectWikiDraftBtn() {
        const obs = new MutationObserver(() => {
            const toolbar = document.getElementById('wikiToolbar');
            if (!toolbar || document.getElementById('_aiDraftBtn')) return;
            const btn = document.createElement('button');
            btn.id = '_aiDraftBtn';
            btn.innerHTML = '✨ AI 초안';
            btn.title = 'AI로 위키 문서 초안 자동 생성 (Puter AI)';
            btn.style.cssText = 'padding:4px 10px;font-size:12px;font-weight:700;border:1.5px solid #c62828;background:white;border-radius:4px;cursor:pointer;color:#c62828;';
            btn.onclick = window._aiWikiDraft;
            toolbar.appendChild(btn);
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    window._aiWikiDraft = async function() {
        const titleEl  = document.getElementById('wikiNewTitle');
        const textarea = document.getElementById('wikiEditArea');
        if (!textarea) return;
        const title = titleEl?.value.trim()
            || document.querySelector('.nk-article-title')?.textContent.trim() || '';
        if (!title) { alert('문서 제목을 먼저 입력해주세요.'); return; }
        if (!confirm(`"${title}" 문서의 초안을 AI로 생성할까요?\n기존 내용이 대체됩니다.\n처음 사용 시 Puter 가입 팝업이 뜹니다.`)) return;

        const btn = document.getElementById('_aiDraftBtn');
        if (btn) { btn.disabled = true; btn.textContent = '⏳ 생성 중...'; }

        try {
            const prompt = `나무위키 마크업 문법으로 "${title}" 문서를 작성해줘.
규칙: == 제목 ==, === 소제목 ===, '''굵게''', [[내부링크]], * 목록 사용.
3~5개 섹션, 각 2~4문장. 한국어. 마크업 문서 내용만 출력.`;
            const draft = await askAI(prompt);
            textarea.value = draft.trim();
            textarea.dispatchEvent(new Event('input'));
            if (typeof showToastNotification === 'function') {
                showToastNotification('✅ AI 초안 완성', '내용을 검토 후 저장하세요.');
            }
        } catch (e) {
            alert('AI 오류: ' + e.message);
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = '✨ AI 초안'; }
        }
    };

    // ══════════════════════════════════════════════════════════════
    // 4. 더보기 메뉴에 AI 도우미 버튼
    // ══════════════════════════════════════════════════════════════
    function hookMoreMenu() {
        const orig = window.showMoreMenu;
        if (typeof orig !== 'function' || orig._aiHooked) return;
        window.showMoreMenu = function() {
            orig.apply(this, arguments);
            setTimeout(() => {
                const container = document.querySelector('.more-menu-container');
                if (!container || document.getElementById('_aiMoreBtn')) return;
                const grid = container.querySelector('.menu-section div[style*="grid"]');
                if (!grid) return;
                const btn = document.createElement('button');
                btn.id = '_aiMoreBtn';
                btn.className = 'more-menu-btn';
                btn.innerHTML = '✨ AI 도우미';
                btn.onclick = () => window._aiToggle();
                grid.appendChild(btn);
            }, 80);
        };
        window.showMoreMenu._aiHooked = true;
    }

    // ──────────────────────────────────────────────
    // 초기화
    // ──────────────────────────────────────────────
    function init() {
        injectChatFloat();
        injectWikiDraftBtn();
        setTimeout(hookMoreMenu, 1000);

        // ✅ Puter.js를 백그라운드에서 미리 로드
        // → 사용자가 AI 버튼을 누르기 전에 WebSocket 연결을 안정적으로 수립
        // → "WebSocket closed before established" 에러 방지
        setTimeout(() => {
            loadPuter().catch(() => {}); // 실패해도 조용히 무시 (버튼 클릭 시 재시도)
        }, 2000); // 페이지 초기 렌더링 완료 후 2초 뒤 선로드

        console.log('✅ 해정뉴스 AI 도우미 로드 완료 (Puter.js)');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();