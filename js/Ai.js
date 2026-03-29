// =====================================================================
// ✨ 해정뉴스 AI 도우미 — Groq AI (Llama 3.3 70B) + 커스텀 학습 관리
// =====================================================================
(function () {
    'use strict';

    // ────────────────────────────────────────────
    // 상수 (Groq 설정)
    // 무료 하루 14,400회 / 분당 30회
    // ────────────────────────────────────────────
    var GROQ_ENDPOINT    = 'https://api.groq.com/openai/v1/chat/completions';
    var GROQ_MODEL       = 'llama-3.3-70b-versatile';
    var GROQ_DEFAULT_KEY = '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'; // 공용 기본 키

    var LS_APIKEY   = 'groq_api_key';
    var LS_TRAINING = 'haejung_ai_training';
    var ADMIN_PW    = '';

    // ────────────────────────────────────────────
    // 기본 사이트 지식베이스
    // ────────────────────────────────────────────
    var SITE_KNOWLEDGE = `
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
- AI 요약: 기사 하단 "✨ AI 요약 보기" 버튼으로 Groq AI 요약 제공
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
- AI 초안 자동 생성 기능 지원 (편집 툴바 AI 초안 버튼)

[나무마크 문법]
- 제목: == 제목 ==
- 소제목: === 소제목 ===
- 굵게: 따옴표 3개로 감싸기
- 내부링크: [[문서명]]
- 목록: * 항목
- 표: ||셀||셀||

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[AI 기능]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 기사 AI 요약: 기사 하단 AI 요약 보기 버튼 클릭
- AI 채팅: 화면 우측 하단 버튼 클릭
- 위키 AI 초안: 위키 편집 화면 툴바의 AI 초안 버튼
- AI 엔진: Groq Llama 3.3 70B

━━━━━━━━━━━━━━━━━━━━━━━━━━━
[자주 묻는 질문]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q: 글(기사)을 어떻게 쓰나요?
A: 로그인 후 상단 글쓰기 버튼을 누르세요.

Q: 카테고리는 어떤 것들이 있나요?
A: 자유게시판, 논란, 연애, 정아영, 게넥도, 게임, 마크 총 7개입니다.

Q: 앱으로 설치할 수 있나요?
A: 네! PWA를 지원합니다. 브라우저에서 홈 화면에 추가를 누르면 앱처럼 설치됩니다.

Q: 버그나 불편한 점을 어디에 제보하나요?
A: 더보기 → 버그 제보(오류) 또는 개선 제보(기능 요청)로 제보해주세요.
`;

    // ────────────────────────────────────────────
    // 로컬스토리지 헬퍼
    // ────────────────────────────────────────────
    function getApiKey() {
        try {
            // gsk_ 로 시작하는 개인 키가 있으면 우선 사용, 없으면 기본 공용 키
            var stored = localStorage.getItem(LS_APIKEY) || '';
            if (stored && stored.startsWith('gsk_')) return stored;
            return GROQ_DEFAULT_KEY;
        } catch (e) { return GROQ_DEFAULT_KEY; }
    }
    function setApiKey(k) {
        try { localStorage.setItem(LS_APIKEY, k); } catch (e) {}
    }
    function getTraining() {
        try {
            var raw = localStorage.getItem(LS_TRAINING);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }
    function setTraining(arr) {
        try { localStorage.setItem(LS_TRAINING, JSON.stringify(arr)); } catch (e) {}
    }

    // ────────────────────────────────────────────
    // 커스텀 학습 데이터 빌드
    // ────────────────────────────────────────────
    function buildCustomKnowledge() {
        var items = getTraining();
        if (!items.length) return '';
        var lines = ['━━━━━━━━━━━━━━━━━━━━━━━━━━━', '[관리자 추가 학습 데이터]', '━━━━━━━━━━━━━━━━━━━━━━━━━━━'];
        items.forEach(function (item, i) {
            lines.push((i + 1) + '. [' + item.title + ']');
            lines.push(item.content);
            lines.push('');
        });
        return lines.join('\n');
    }

    function buildSystemPrompt() {
        var custom = buildCustomKnowledge();
        return '당신은 해정뉴스 커뮤니티의 AI 도우미입니다.\n'
            + '아래 사이트 정보를 바탕으로 친절하고 간결하게 한국어로 답변하세요.\n'
            + '모르는 내용은 솔직하게 모른다고 하세요.\n\n'
            + SITE_KNOWLEDGE
            + (custom ? '\n\n' + custom : '');
    }

    // ────────────────────────────────────────────
    // Groq API 호출 (단일 함수)
    // ────────────────────────────────────────────
    async function _groqFetch(messages) {
        var key = getApiKey();
        var isDefault = (key === GROQ_DEFAULT_KEY);
        var res = await fetch(GROQ_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + key
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: messages,
                max_tokens: 800,
                temperature: 0.7
            })
        });
        if (!res.ok) {
            var err = await res.json().catch(function () { return {}; });
            var status = res.status;
            var msg = err?.error?.message || '';
            if (status === 401) {
                throw new Error(isDefault
                    ? '기본 키 만료됨 — ⚙️에서 개인 Groq 키를 입력해주세요.'
                    : '개인 API 키가 올바르지 않습니다. ⚙️에서 확인해주세요.');
            }
            if (status === 429) throw new Error('rate_limit');
            throw new Error(msg || 'HTTP ' + status);
        }
        var data = await res.json();
        var text = data?.choices?.[0]?.message?.content;
        if (!text) throw new Error('응답 없음');
        return text.trim();
    }

    function askAI(userText, systemOverride) {
        var system = systemOverride || buildSystemPrompt();
        return _groqFetch([
            { role: 'system', content: system },
            { role: 'user', content: userText }
        ]);
    }

    function askAIWithHistory(messages) {
        var allMessages = [{ role: 'system', content: buildSystemPrompt() }].concat(messages);
        return _groqFetch(allMessages);
    }

    // ════════════════════════════════════════════
    // 1. 기사 AI 요약
    // ════════════════════════════════════════════
    window._aiSummarize = async function () {
        var btn    = document.getElementById('_aiSummaryBtn');
        var result = document.getElementById('_aiSummaryResult');
        var root   = document.getElementById('articleDetail');
        if (!btn || !result) return;

        if (result.style.display !== 'none') {
            result.style.display = 'none';
            btn.innerHTML = '✨ AI 요약 보기 <span style="font-size:11px;font-weight:400;color:#aaa;">Groq AI</span>';
            return;
        }

        var bodyEl = root?.querySelector('[style*="line-height:1.8"][style*="color:#333"]')
                  || root?.querySelector('.ql-editor')
                  || root?.querySelector('[class*="article-body"]');
        var rawText = bodyEl?.innerText?.trim() || root?.innerText?.slice(0, 3000) || '';
        var titleEl = root?.querySelector('[style*="font-size:22px"],[style*="font-size:20px"],h1,h2');
        var title   = titleEl?.innerText?.trim() || '기사';

        if (rawText.length < 30) {
            result.style.display = 'block';
            result.innerHTML = '<span style="color:#888;">본문을 찾을 수 없어요.</span>';
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI가 읽는 중...';

        try {
            var prompt = '다음 기사를 한국어로 3줄로 요약해주세요. 핵심만 간결하게.\n\n제목: '
                       + title + '\n\n본문:\n' + rawText.slice(0, 2500);
            var summary = await askAI(prompt);
            result.style.display = 'block';
            result.innerHTML = '<div style="font-size:11px;font-weight:700;color:#c62828;margin-bottom:8px;">'
                + '✨ AI 요약 <span style="font-weight:400;color:#aaa;">· Groq Llama 3.3</span></div>'
                + summary.replace(/\n/g, '<br>');
            btn.innerHTML = '✨ AI 요약 닫기';
        } catch (e) {
            result.style.display = 'block';
            result.innerHTML = '<span style="color:#c62828;font-size:13px;">오류: ' + e.message + '</span>';
            btn.innerHTML = '✨ AI 요약 보기 <span style="font-size:11px;font-weight:400;color:#aaa;">Groq AI</span>';
        } finally {
            btn.disabled = false;
        }
    };

    // ════════════════════════════════════════════
    // 2. AI 채팅 UI
    // ════════════════════════════════════════════
    function injectChatFloat() {
        if (document.getElementById('_aiFloatWrap')) return;

        var style = document.createElement('style');
        style.textContent = [
            '#_aiChatWin{display:none;position:fixed;bottom:148px;right:16px;width:320px;height:480px;',
            'background:white;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.2);',
            'z-index:8888;flex-direction:column;overflow:hidden;border:1px solid #eee;}',
            '#_aiChatWin.open{display:flex;}',
            '#_aiChatHdr{background:linear-gradient(135deg,#1a73e8,#0d47a1);color:white;',
            'padding:13px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}',
            '#_aiChatHdrIcon{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.2);',
            'display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}',
            '#_aiChatMsgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;}',
            '.aib{max-width:86%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.65;word-break:break-word;}',
            '.aib.u{background:#1a73e8;color:white;align-self:flex-end;border-radius:14px 14px 4px 14px;}',
            '.aib.b{background:#f5f5f5;color:#333;align-self:flex-start;border-radius:14px 14px 14px 4px;}',
            '.aib.b.thinking{color:#aaa;font-style:italic;animation:_aiPulse 1.2s infinite;}',
            '@keyframes _aiPulse{0%,100%{opacity:.5}50%{opacity:1}}',
            '#_aiChatInputRow{padding:10px;border-top:1px solid #eee;display:flex;gap:8px;flex-shrink:0;}',
            '#_aiChatInput{flex:1;padding:8px 12px;border:1.5px solid #eee;border-radius:20px;',
            'font-size:13px;outline:none;resize:none;max-height:80px;font-family:inherit;}',
            '#_aiChatInput:focus{border-color:#1a73e8;}',
            '#_aiSendBtn{width:36px;height:36px;border-radius:50%;background:#1a73e8;color:white;',
            'border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
            '#_aiSendBtn:disabled{opacity:.5;cursor:default;}',
            '#_aiQuickBtns{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 10px;}',
            '.aiq{padding:5px 10px;border:1px solid #bbdefb;border-radius:20px;background:#e3f2fd;',
            'color:#1a73e8;font-size:11px;cursor:pointer;white-space:nowrap;transition:all .15s;}',
            '.aiq:hover{background:#1a73e8;color:white;}',
            '#_aiChatFab{position:fixed;bottom:80px;right:16px;z-index:10001;width:52px;height:52px;',
            'border-radius:50%;background:linear-gradient(135deg,#1a73e8,#0d47a1);color:white;',
            'border:none;cursor:pointer;box-shadow:0 4px 16px rgba(26,115,232,.45);',
            'display:flex;align-items:center;justify-content:center;transition:transform .2s;font-size:22px;}',
            '#_aiChatFab:hover{transform:scale(1.08);}',
            '#_aiChatFab .ai-badge{position:absolute;top:-2px;right:-2px;width:14px;height:14px;',
            'background:#4caf50;border-radius:50%;border:2px solid white;display:none;}',
            '#_aiTrainPanel{display:none;flex-direction:column;height:100%;overflow:hidden;}',
            '#_aiTrainPanel.open{display:flex;}',
            '#_aiTrainList{flex:1;overflow-y:auto;padding:10px;}',
            '.ai-train-item{background:#f5f5f5;border-radius:10px;padding:10px;margin-bottom:8px;',
            'display:flex;justify-content:space-between;align-items:flex-start;gap:8px;}',
            '.ai-train-item-title{font-weight:700;font-size:12px;color:#1a73e8;margin-bottom:3px;}',
            '.ai-train-item-content{font-size:11px;color:#555;line-height:1.5;',
            'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
            '.ai-train-del{background:none;border:none;color:#e53935;cursor:pointer;font-size:16px;flex-shrink:0;padding:0;line-height:1;}',
            '#_aiKeySetup{padding:14px;border-bottom:1px solid #eee;flex-shrink:0;}',
            '#_aiKeyInput{width:100%;box-sizing:border-box;padding:8px 10px;border:1.5px solid #eee;',
            'border-radius:8px;font-size:12px;font-family:inherit;margin-bottom:8px;}',
            '#_aiKeyInput:focus{border-color:#1a73e8;outline:none;}',
            '.ai-btn-sm{padding:7px 14px;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:opacity .15s;}',
            '.ai-btn-sm:hover{opacity:.85;}',
            '.ai-btn-blue{background:#1a73e8;color:white;}',
            '.ai-btn-gray{background:#eee;color:#555;}',
            '#_aiAddForm{padding:10px 12px;border-top:1px solid #eee;flex-shrink:0;}',
            '#_aiAddTitle,#_aiAddContent{width:100%;box-sizing:border-box;padding:7px 10px;border:1.5px solid #eee;',
            'border-radius:8px;font-size:12px;font-family:inherit;margin-bottom:6px;}',
            '#_aiAddContent{resize:vertical;min-height:60px;}',
            '#_aiAddTitle:focus,#_aiAddContent:focus{border-color:#1a73e8;outline:none;}'
        ].join('');
        document.head.appendChild(style);

        var wrap = document.createElement('div');
        wrap.id = '_aiFloatWrap';

        // 채팅 뷰
        var chatView = document.createElement('div');
        chatView.id = '_aiChatWin';
        chatView.innerHTML = [
            '<div id="_aiChatView" style="display:flex;flex-direction:column;height:100%;">',
              '<div id="_aiChatHdr">',
                '<div id="_aiChatHdrIcon">🤖</div>',
                '<div style="flex:1;">',
                  '<div style="font-weight:800;font-size:14px;">해정뉴스 AI</div>',
                  '<div style="font-size:10px;opacity:.8;margin-top:1px;">powered by Groq · Llama 3.3 70B</div>',
                '</div>',
                '<button id="_aiTrainToggle" title="설정" style="background:rgba(255,255,255,.2);border:none;color:white;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:14px;margin-right:4px;display:flex;align-items:center;justify-content:center;">⚙️</button>',
                '<button onclick="document.getElementById(\'_aiChatWin\').classList.remove(\'open\')" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;padding:0;line-height:1;">×</button>',
              '</div>',
              '<div id="_aiChatMsgs">',
                '<div class="aib b">안녕하세요! 해정뉴스 AI 도우미입니다 ✨<br><br>해정뉴스 이용 방법이나 궁금한 점을 물어보세요.</div>',
              '</div>',
              '<div id="_aiQuickBtns">',
                '<button class="aiq" onclick="window._aiQuick(\'글 쓰는 방법\')">📝 글쓰기</button>',
                '<button class="aiq" onclick="window._aiQuick(\'나무아래키가 뭐야?\')">📖 나무아래키</button>',
                '<button class="aiq" onclick="window._aiQuick(\'채팅 어떻게 해?\')">💬 채팅</button>',
                '<button class="aiq" onclick="window._aiQuick(\'알림 설정 방법\')">🔔 알림</button>',
                '<button class="aiq" onclick="window._aiQuick(\'AI 기능 뭐가 있어?\')">🤖 AI 기능</button>',
              '</div>',
              '<div id="_aiChatInputRow">',
                '<textarea id="_aiChatInput" placeholder="메시지 입력... (Enter 전송)" rows="1" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();window._aiSend();}"></textarea>',
                '<button id="_aiSendBtn" onclick="window._aiSend()"><i class="fas fa-paper-plane" style="font-size:13px;"></i></button>',
              '</div>',
            '</div>',
            // 설정/학습 뷰
            '<div id="_aiTrainPanel">',
              '<div id="_aiChatHdr" style="background:linear-gradient(135deg,#37474f,#263238);">',
                '<div id="_aiChatHdrIcon">⚙️</div>',
                '<div style="flex:1;"><div style="font-weight:800;font-size:14px;">AI 설정 / 학습 관리</div><div style="font-size:10px;opacity:.8;">기본 키로 모든 유저 사용 가능</div></div>',
                '<button id="_aiTrainClose" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;padding:0;line-height:1;">×</button>',
              '</div>',
              '<div id="_aiKeySetup">',
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">',
                  '<div style="font-size:11px;font-weight:700;color:#555;">🔑 개인 Groq 키 (선택)</div>',
                  '<span id="_aiKeyBadge" style="font-size:11px;font-weight:700;"></span>',
                '</div>',
                '<input id="_aiKeyInput" type="text" placeholder="개인 키 없어도 기본 키로 작동합니다" autocomplete="off">',
                '<div style="display:flex;gap:6px;flex-wrap:wrap;">',
                  '<button class="ai-btn-sm ai-btn-blue" onclick="window._aiSaveKey()">💾 저장 + 테스트</button>',
                  '<button class="ai-btn-sm ai-btn-gray" onclick="window._aiTestKey()">🔄 연결 확인</button>',
                  '<a href="https://console.groq.com/keys" target="_blank" style="font-size:11px;color:#1a73e8;text-decoration:none;display:flex;align-items:center;">키 발급 →</a>',
                '</div>',
                '<div id="_aiKeySaved" style="font-size:11px;color:#4caf50;margin-top:6px;display:none;">✅ 저장 완료!</div>',
              '</div>',
              '<div id="_aiTrainList"></div>',
              '<div id="_aiAddForm">',
                '<div style="font-size:11px;font-weight:700;color:#555;margin-bottom:6px;">➕ 학습 데이터 추가 (관리자)</div>',
                '<input id="_aiAddTitle" type="text" placeholder="제목 (예: 공지사항, 규칙, FAQ...)">',
                '<textarea id="_aiAddContent" placeholder="AI가 학습할 내용"></textarea>',
                '<button class="ai-btn-sm ai-btn-blue" onclick="window._aiAddTraining()">추가하기</button>',
              '</div>',
            '</div>'
        ].join('');

        wrap.appendChild(chatView);

        var fab = document.createElement('button');
        fab.id = '_aiChatFab';
        fab.onclick = window._aiOpenChat;
        fab.title = 'AI 도우미';
        fab.innerHTML = '🤖<div class="ai-badge" id="_aiBadge"></div>';
        wrap.appendChild(fab);

        document.body.appendChild(wrap);

        document.getElementById('_aiTrainToggle').addEventListener('click', _openTrainPanel);
        document.getElementById('_aiTrainClose').addEventListener('click', _closeTrainPanel);
        _refreshKeyStatus();
    }

    function _openTrainPanel() {
        var pw = prompt('관리자 비밀번호를 입력하세요:');
        if (pw === null) return; // 취소
        if (pw !== ADMIN_PW) { alert('비밀번호가 올바르지 않습니다.'); return; }
        document.getElementById('_aiChatView').style.display = 'none';
        document.getElementById('_aiTrainPanel').classList.add('open');
        _renderTrainingList();
        _refreshKeyStatus();
    }

    function _closeTrainPanel() {
        document.getElementById('_aiTrainPanel').classList.remove('open');
        document.getElementById('_aiChatView').style.display = 'flex';
    }

    function _refreshKeyStatus() {
        var input = document.getElementById('_aiKeyInput');
        var badge = document.getElementById('_aiKeyBadge');
        if (!input) return;
        var stored = '';
        try { stored = localStorage.getItem(LS_APIKEY) || ''; } catch(e) {}
        var hasPersonal = stored.startsWith('gsk_');
        input.placeholder = hasPersonal ? '개인 키 저장됨 — 변경하려면 새 키 입력' : '개인 키 없어도 기본 키로 작동합니다';
        if (badge) {
            badge.textContent = hasPersonal ? '✅ 개인 키' : '🔑 기본 키';
            badge.style.color = hasPersonal ? '#4caf50' : '#888';
        }
    }

    function _renderTrainingList() {
        var list = document.getElementById('_aiTrainList');
        if (!list) return;
        var items = getTraining();
        if (!items.length) {
            list.innerHTML = '<div style="text-align:center;color:#aaa;font-size:12px;padding:16px;">학습 데이터가 없습니다.</div>';
            return;
        }
        list.innerHTML = items.map(function (item, i) {
            return '<div class="ai-train-item">'
                + '<div style="flex:1;"><div class="ai-train-item-title">' + _esc(item.title) + '</div>'
                + '<div class="ai-train-item-content">' + _esc(item.content) + '</div></div>'
                + '<button class="ai-train-del" onclick="window._aiDeleteTraining(' + i + ')" title="삭제">🗑️</button>'
                + '</div>';
        }).join('');
    }

    function _esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    window._aiSaveKey = function () {
        var v = (document.getElementById('_aiKeyInput').value || '').trim();
        if (!v) { alert('키를 입력하거나 그냥 닫으세요.\n기본 키가 이미 적용되어 있습니다.'); return; }
        if (!v.startsWith('gsk_')) { if (!confirm('Groq 키는 gsk_로 시작합니다. 계속 저장할까요?')) return; }
        setApiKey(v);
        document.getElementById('_aiKeyInput').value = '';
        _refreshKeyStatus();
        var saved = document.getElementById('_aiKeySaved');
        if (saved) { saved.style.display = 'block'; setTimeout(function () { saved.style.display = 'none'; }, 3000); }
        window._aiTestKey();
    };

    window._aiTestKey = async function () {
        var badge = document.getElementById('_aiKeyBadge');
        if (badge) { badge.textContent = '🔄 테스트 중...'; badge.style.color = '#888'; }
        try {
            await _groqFetch([
                { role: 'system', content: '한 단어로만 답해줘.' },
                { role: 'user', content: '안녕' }
            ]);
            if (badge) { badge.textContent = '✅ 연결 성공!'; badge.style.color = '#4caf50'; }
        } catch (err) {
            if (badge) { badge.textContent = '❌ ' + err.message; badge.style.color = '#e53935'; }
        }
    };

    window._aiAddTraining = function () {
        var pw = prompt('학습 관리 비밀번호:');
        if (pw !== ADMIN_PW) { if (pw !== null) alert('비밀번호 오류'); return; }
        var title   = (document.getElementById('_aiAddTitle').value || '').trim();
        var content = (document.getElementById('_aiAddContent').value || '').trim();
        if (!title || !content) { alert('제목과 내용을 모두 입력해주세요.'); return; }
        var items = getTraining();
        items.push({ title: title, content: content, addedAt: new Date().toISOString() });
        setTraining(items);
        document.getElementById('_aiAddTitle').value   = '';
        document.getElementById('_aiAddContent').value = '';
        _renderTrainingList();
        if (typeof showToastNotification === 'function') {
            showToastNotification('✅ 학습 추가 완료', '"' + title + '" 내용이 AI에 학습되었습니다.');
        }
    };

    window._aiDeleteTraining = function (idx) {
        var pw = prompt('학습 관리 비밀번호:');
        if (pw !== ADMIN_PW) { if (pw !== null) alert('비밀번호 오류'); return; }
        if (!confirm('이 학습 데이터를 삭제할까요?')) return;
        var items = getTraining();
        items.splice(idx, 1);
        setTraining(items);
        _renderTrainingList();
    };

    // ════════════════════════════════════════════
    // 채팅 기능
    // ════════════════════════════════════════════
    window._aiOpenChat = function () {
        document.getElementById('_aiChatWin')?.classList.toggle('open');
        document.getElementById('_aiBadge').style.display = 'none';
    };
    window._aiToggle = window._aiOpenChat;

    window._aiQuick = function (q) {
        var input = document.getElementById('_aiChatInput');
        if (input) { input.value = q; window._aiSend(); }
    };

    var _history = [];

    window._aiSend = async function () {
        var input   = document.getElementById('_aiChatInput');
        var msgs    = document.getElementById('_aiChatMsgs');
        var sendBtn = document.getElementById('_aiSendBtn');
        var text    = input?.value.trim();
        if (!text || !msgs || sendBtn?.disabled) return;

        input.value = '';
        _addBubble(msgs, text, 'u');
        _history.push({ r: 'user', t: text });

        sendBtn.disabled = true;
        var thinking = _addBubble(msgs, '⏳ AI 답변 생성 중...', 'b thinking');

        try {
            var messages = _history.slice(-10).map(function (m) {
                return { role: m.r === 'user' ? 'user' : 'assistant', content: m.t };
            });
            messages.push({ role: 'user', content: text });

            var reply = await askAIWithHistory(messages);
            thinking.innerHTML = reply.replace(/\n/g, '<br>');
            thinking.classList.remove('thinking');
            _history.push({ r: 'ai', t: reply });

            if (!document.getElementById('_aiChatWin')?.classList.contains('open')) {
                document.getElementById('_aiBadge').style.display = 'block';
            }
        } catch (e) {
            var isRate = e.message === 'rate_limit';
            thinking.innerHTML = '<span style="color:#e53935;">'
                + (isRate
                    ? '⚠️ 잠시 후 다시 시도해주세요.<br><span style="font-size:11px;color:#aaa;">Groq 무료: 분당 30회 제한</span>'
                    : '오류: ' + e.message)
                + '</span>';
            thinking.classList.remove('thinking');
        } finally {
            sendBtn.disabled = false;
            msgs.scrollTop = msgs.scrollHeight;
        }
    };

    function _addBubble(container, text, cls) {
        var el = document.createElement('div');
        el.className = 'aib ' + cls;
        el.textContent = text;
        container.appendChild(el);
        container.scrollTop = container.scrollHeight;
        return el;
    }

    // ════════════════════════════════════════════
    // 3. 위키 AI 초안 버튼
    // ════════════════════════════════════════════
    function injectWikiDraftBtn() {
        var obs = new MutationObserver(function () {
            var toolbar = document.getElementById('wikiToolbar');
            if (!toolbar || document.getElementById('_aiDraftBtn')) return;
            var btn = document.createElement('button');
            btn.id = '_aiDraftBtn';
            btn.innerHTML = '✨ AI 초안';
            btn.title = 'Groq AI로 위키 문서 초안 자동 생성';
            btn.style.cssText = 'padding:4px 10px;font-size:12px;font-weight:700;border:1.5px solid #1a73e8;background:white;border-radius:4px;cursor:pointer;color:#1a73e8;';
            btn.onclick = window._aiWikiDraft;
            toolbar.appendChild(btn);
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }

    window._aiWikiDraft = async function () {
        var titleEl  = document.getElementById('wikiNewTitle');
        var textarea = document.getElementById('wikiEditArea');
        if (!textarea) return;
        var title = (titleEl?.value.trim())
            || document.querySelector('.nk-article-title')?.textContent.trim() || '';
        if (!title) { alert('문서 제목을 먼저 입력해주세요.'); return; }
        if (!confirm('"' + title + '" 문서의 초안을 Groq AI로 생성할까요?\n기존 내용이 대체됩니다.')) return;

        var btn = document.getElementById('_aiDraftBtn');
        if (btn) { btn.disabled = true; btn.textContent = '⏳ 생성 중...'; }

        try {
            var prompt = '나무위키 마크업 문법으로 "' + title + '" 문서를 작성해줘.\n'
                + '규칙: == 제목 ==, === 소제목 ===, 굵게는 따옴표 3개로 감싸기, [[내부링크]], * 목록 사용.\n'
                + '3~5개 섹션, 각 2~4문장. 한국어. 마크업 문서 내용만 출력.';
            var draft = await askAI(prompt);
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

    // ════════════════════════════════════════════
    // 4. 더보기 메뉴 AI 버튼 훅
    // ════════════════════════════════════════════
    function hookMoreMenu() {
        var orig = window.showMoreMenu;
        if (typeof orig !== 'function' || orig._aiHooked) return;
        window.showMoreMenu = function () {
            orig.apply(this, arguments);
            setTimeout(function () {
                var container = document.querySelector('.more-menu-container');
                if (!container || document.getElementById('_aiMoreBtn')) return;
                var grid = container.querySelector('.menu-section div[style*="grid"]');
                if (!grid) return;
                var btn = document.createElement('button');
                btn.id = '_aiMoreBtn';
                btn.className = 'more-menu-btn';
                btn.innerHTML = '✨ AI 도우미';
                btn.onclick = function () { window._aiOpenChat(); };
                grid.appendChild(btn);
            }, 80);
        };
        window.showMoreMenu._aiHooked = true;
    }

    // ════════════════════════════════════════════
    // 초기화
    // ════════════════════════════════════════════
    function init() {
        // 이전에 저장된 잘못된 키(Gemini 등) 자동 정리
        try {
            var old = localStorage.getItem(LS_APIKEY);
            if (old && !old.startsWith('gsk_')) {
                localStorage.removeItem(LS_APIKEY);
            }
        } catch (e) {}

        injectChatFloat();
        injectWikiDraftBtn();
        setTimeout(hookMoreMenu, 1000);
        console.log('✅ 해정뉴스 AI v3 로드 완료 (Groq Llama 3.3) | 학습 데이터:', getTraining().length + '개');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
