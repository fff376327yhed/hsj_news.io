// =====================================================================
// 🎭 만우절.js — April Fools Day 테마 시스템 v2
// ─────────────────────────────────────────────────────────────────────
// ✅ 4월 1일: 만우절 테마 강제 적용 + 변경 불가
// ✅ 4월 1일 외: 테마 설정에서 자유롭게 선택 가능
// ✅ 더보기 메뉴 → "차명석" 탭 (영상 갤러리 + 만우절 전용 콘텐츠)
// ─────────────────────────────────────────────────────────────────────
// 📁 필요 파일 위치:
//   ./videos/1.mp4
//   ./videos/2.mp4
//   ./videos/3.mp4
//   ./videos/4.mp4
//   ./videos/5.mp4
//   ./videos/6.mp4
//   ./videos/7.mp4
//   ./videos/8.mp4
//   ./audio/elevenlabs_music_deb60445.mp3
// =====================================================================

console.log("🎭 만우절.js v2 로드 시작");

// ─────────────────────────────────────────────────────────────────────
// 📌 상수
// ─────────────────────────────────────────────────────────────────────

const AF_VIDEOS = [
    { src: './videos/1.mp4', label: '고딕걸 댄스 💃',  emoji: '💃' },
    { src: './videos/2.mp4', label: '고딕걸 삐짐 😤',  emoji: '😤' },
    { src: './videos/3.mp4', label: '고딕걸 분노 😡',  emoji: '😡' },
    { src: './videos/4.mp4', label: '명석 분노 💢',    emoji: '💢' },
    { src: './videos/5.mp4', label: '명석 교복 🎒',    emoji: '🎒' },
    { src: './videos/6.mp4', label: '명석 점프 🕺',    emoji: '🕺' },
    { src: './videos/7.mp4', label: '명석 서있음 🧍',  emoji: '🧍' },
    { src: './videos/8.mp4', label: '명석 변기 🚽',    emoji: '🚽' },
];

const AF_BGM_PATH = './audio/elevenlabs_music_deb60445.mp3';

const AF_EMOJIS = ['🎭','🤡','🎈','🎉','🃏','😂','🌈','✨','🎪','🎊','🥳','🤣'];

const AF_JOKES = [
    "차명석은 해정뉴스의 CEO입니다. (공식발표)",
    "차명석의 키는 2미터입니다. 믿으세요.",
    "차명석은 오늘부터 아이돌 데뷔 예정입니다.",
    "나무아래키에 따르면 차명석은 날개가 있다고 합니다.",
    "차명석은 롤 챌린저입니다. 진짜예요.",
    "차명석이 이 앱을 만들었다는 소문이 있습니다.",
    "차명석은 현재 달에서 근무 중입니다.",
    "차명석의 진짜 정체는 게넥의 왕입니다.",
];

// ─────────────────────────────────────────────────────────────────────
// 📅 날짜 체크
// ─────────────────────────────────────────────────────────────────────

function isAprilFoolsDay() {
    const d = new Date();
    return d.getMonth() === 3 && d.getDate() === 1;
}

// ─────────────────────────────────────────────────────────────────────
// 💉 CSS 주입
// body 의 padding/margin 을 절대 건드리지 않음 → 네비게이션 오류 방지
// ─────────────────────────────────────────────────────────────────────

function injectAprilFoolsCSS() {
    if (document.getElementById('af-style')) return;

    const style = document.createElement('style');
    style.id = 'af-style';
    style.textContent = `

    /* ━━━━━━━━━━━━━━━━━━
       🎨 만우절 테마
    ━━━━━━━━━━━━━━━━━━ */
    body.april-fools-theme {
        background: linear-gradient(135deg,#fff9c4 0%,#fce4ec 50%,#e8f5e9 100%) !important;
    }
    body.april-fools-theme .header,
    body.april-fools-theme header,
    body.april-fools-theme .top-bar {
        background: linear-gradient(90deg,
            #ff6b6b,#ffd93d,#6bcb77,#4d96ff,#c77dff,#ff6b6b
        ) !important;
        background-size: 400% 100% !important;
        animation: af-rainbow 4s linear infinite !important;
    }
    @keyframes af-rainbow {
        0%   { background-position: 0% 50%; }
        100% { background-position: 400% 50%; }
    }
    body.april-fools-theme .site-title,
    body.april-fools-theme .header-title,
    body.april-fools-theme .logo-text {
        animation: af-wiggle 0.6s ease infinite alternate !important;
        color: #fff !important;
        text-shadow: 2px 2px 0 rgba(0,0,0,0.2) !important;
    }
    @keyframes af-wiggle {
        from { transform: rotate(-1.5deg) scale(1); }
        to   { transform: rotate(1.5deg)  scale(1.04); }
    }
    body.april-fools-theme .article-card,
    body.april-fools-theme .news-card {
        border: 2px dashed #ff6b6b !important;
        border-radius: 16px !important;
        transition: transform 0.25s !important;
    }
    body.april-fools-theme .article-card:hover,
    body.april-fools-theme .news-card:hover {
        transform: rotate(1.2deg) scale(1.02) !important;
    }

    /* ━━━━━━━━━━━━━━━━━━
       📢 만우절 배너
       ⚠️ pointer-events:none → 클릭/스크롤 방해 없음
       ⚠️ body padding/margin 조작 없음 → 네비 오류 없음
    ━━━━━━━━━━━━━━━━━━ */
    #af-banner {
        position: fixed;
        top: 0; left: 0; right: 0;
        z-index: 9989;
        height: 28px;
        line-height: 28px;
        padding: 0 10px;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.5px;
        text-align: center;
        color: #fff;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.25);
        background: linear-gradient(90deg,
            #ff6b6b,#ffd93d,#6bcb77,#4d96ff,#c77dff,#ff6b6b);
        background-size: 400% 100%;
        animation: af-rainbow 2.5s linear infinite;
        user-select: none;
        pointer-events: none;
        white-space: nowrap;
        overflow: hidden;
    }

    /* ━━━━━━━━━━━━━━━━━━
       🔒 잠금 배지
    ━━━━━━━━━━━━━━━━━━ */
    #af-lock-badge {
        position: fixed;
        bottom: 82px; right: 16px;
        z-index: 9991;
        background: linear-gradient(135deg,#ff6b6b,#ffd93d);
        color: #fff;
        font-weight: 900;
        font-size: 12px;
        padding: 8px 14px;
        border-radius: 22px;
        box-shadow: 0 4px 18px rgba(255,107,107,0.55);
        cursor: pointer;
        border: none;
        animation: af-badgeFloat 2s ease-in-out infinite alternate;
        -webkit-tap-highlight-color: transparent;
        font-family: 'Noto Sans KR', sans-serif;
    }
    @keyframes af-badgeFloat {
        from { transform: translateY(0) rotate(-2deg); }
        to   { transform: translateY(-5px) rotate(2deg); }
    }

    /* ━━━━━━━━━━━━━━━━━━
       🌧 이모지 비
    ━━━━━━━━━━━━━━━━━━ */
    .af-emoji-drop {
        position: fixed;
        top: -50px;
        font-size: 1.6em;
        pointer-events: none;
        z-index: 9993;
        user-select: none;
        animation: af-dropFall linear forwards;
    }
    @keyframes af-dropFall {
        0%   { opacity:1; transform:translateY(0) rotate(0deg); }
        80%  { opacity:0.7; }
        100% { opacity:0; transform:translateY(115vh) rotate(540deg); }
    }

    /* ━━━━━━━━━━━━━━━━━━
       🎭 인트로 팝업
    ━━━━━━━━━━━━━━━━━━ */
    #af-intro-overlay {
        position: fixed; inset: 0;
        z-index: 99999;
        background: rgba(0,0,0,0.7);
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        animation: af-fadeIn 0.35s ease;
    }
    @keyframes af-fadeIn { from{opacity:0} to{opacity:1} }
    #af-intro-box {
        position: relative;
        background: linear-gradient(150deg,#fff9c4,#fce4ec 60%,#e8f5e9);
        border-radius: 28px;
        padding: 28px 22px 22px;
        width: min(360px,92vw);
        text-align: center;
        box-shadow: 0 24px 60px rgba(0,0,0,0.3), 0 0 0 4px #ffd93d;
        animation: af-popIn 0.5s cubic-bezier(0.34,1.56,0.64,1);
        font-family: 'Noto Sans KR', sans-serif;
    }
    @keyframes af-popIn {
        from { transform:scale(0.4) rotate(-8deg); opacity:0; }
        to   { transform:scale(1)   rotate(0deg);  opacity:1; }
    }
    #af-intro-title {
        font-size:22px; font-weight:900;
        color:#e53935; margin-bottom:8px; letter-spacing:-0.5px;
    }
    #af-intro-sub {
        font-size:14px; color:#555;
        line-height:1.65; margin-bottom:20px;
    }
    #af-intro-btn {
        width:100%; padding:14px;
        background:linear-gradient(135deg,#ff6b6b,#ffd93d);
        color:#fff; border:none; border-radius:16px;
        font-size:16px; font-weight:900; cursor:pointer;
        box-shadow:0 5px 18px rgba(255,107,107,0.4);
        font-family:'Noto Sans KR',sans-serif;
        -webkit-tap-highlight-color:transparent;
        transition:transform 0.1s;
    }
    #af-intro-btn:active { transform:scale(0.97); }
    #af-intro-close {
        position:absolute; top:14px; right:14px;
        width:30px; height:30px; border-radius:50%;
        background:rgba(0,0,0,0.1); border:none;
        font-size:15px; cursor:pointer; color:#666;
        display:flex; align-items:center; justify-content:center;
        -webkit-tap-highlight-color:transparent;
    }

    /* ━━━━━━━━━━━━━━━━━━
       🔒 테마 설정 잠금 UI
    ━━━━━━━━━━━━━━━━━━ */
    #af-theme-lock-notice {
        display:none;
        background:linear-gradient(135deg,#fff3cd,#fce4ec);
        border:2px solid #ffd93d; border-radius:12px;
        padding:12px 16px;
        font-size:13px; font-weight:700; color:#d32f2f;
        text-align:center; line-height:1.55; margin-top:10px;
    }
    body.april-fools-day .theme-option:not(.af-active-option) {
        opacity:0.4; pointer-events:none;
    }
    body.april-fools-day .af-active-option {
        border-color:#ff6b6b !important;
        box-shadow:0 0 0 3px rgba(255,107,107,0.25) !important;
    }

    /* ━━━━━━━━━━━━━━━━━━
       📺 차명석 탭
    ━━━━━━━━━━━━━━━━━━ */
    #chamyeokseokSection { padding-bottom:80px; }

    .chs-header {
        background:linear-gradient(135deg,#ff6b6b,#ffd93d);
        padding:18px 16px 14px; text-align:center; color:white;
        position:sticky; top:0; z-index:10;
    }
    .chs-header-title { font-size:21px; font-weight:900; letter-spacing:-0.5px; margin-bottom:3px; }
    .chs-header-sub   { font-size:13px; opacity:0.9; }
    .chs-back-btn {
        position:absolute; left:14px; top:50%; transform:translateY(-50%);
        background:rgba(255,255,255,0.25); border:none; color:white;
        width:36px; height:36px; border-radius:50%;
        font-size:16px; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        -webkit-tap-highlight-color:transparent;
    }

    .chs-joke-banner {
        margin:14px 16px 0;
        background:linear-gradient(135deg,#fff9c4,#fce4ec);
        border:2px dashed #ffd93d; border-radius:14px;
        padding:14px 16px;
        font-size:14px; font-weight:700; color:#c62828;
        text-align:center; line-height:1.5;
    }

    .chs-bgm-bar {
        margin:14px 16px 0; background:white;
        border-radius:14px; padding:12px 16px;
        display:flex; align-items:center; gap:12px;
        box-shadow:0 2px 10px rgba(0,0,0,0.08);
    }
    .chs-bgm-toggle {
        width:42px; height:42px; border-radius:50%;
        background:linear-gradient(135deg,#ff6b6b,#ffd93d);
        border:none; color:white; font-size:18px; cursor:pointer;
        flex-shrink:0; display:flex; align-items:center; justify-content:center;
        -webkit-tap-highlight-color:transparent;
        box-shadow:0 3px 12px rgba(255,107,107,0.4);
    }
    .chs-bgm-info { flex:1; }
    .chs-bgm-title { font-size:14px; font-weight:800; color:#212121; }
    .chs-bgm-sub   { font-size:12px; color:#aaa; margin-top:2px; }
    .chs-volume    { width:80px; accent-color:#ff6b6b; }

    .chs-section-title {
        font-size:15px; font-weight:800; color:#212121;
        margin:18px 16px 10px;
        display:flex; align-items:center; gap:8px;
    }
    .chs-section-title::after {
        content:''; flex:1; height:2px;
        background:linear-gradient(to right,#ff6b6b,transparent);
        border-radius:2px;
    }

    .chs-video-grid {
        display:grid; grid-template-columns:repeat(2,1fr);
        gap:12px; padding:0 16px;
    }
    .chs-video-card {
        background:white; border-radius:16px;
        overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.1);
        cursor:pointer; transition:transform 0.2s,box-shadow 0.2s;
        -webkit-tap-highlight-color:transparent;
    }
    .chs-video-card:active { transform:scale(0.96); }
    .chs-video-card video {
        width:100%; aspect-ratio:1/1; object-fit:cover;
        display:block; background:#f5f5f5; pointer-events:none;
    }
    .chs-video-label {
        padding:8px 10px; font-size:12px; font-weight:700;
        color:#333; text-align:center; background:white;
        border-top:1px solid #f0f0f0;
    }
    .chs-video-card.playing { border:3px solid #ff6b6b; box-shadow:0 4px 20px rgba(255,107,107,0.35); }
    .chs-video-card.playing .chs-video-label {
        background:linear-gradient(135deg,#ff6b6b,#ffd93d); color:white;
    }

    /* 전체화면 뷰어 */
    #af-video-viewer {
        position:fixed; inset:0; z-index:99998;
        background:rgba(0,0,0,0.92);
        display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        animation:af-fadeIn 0.25s ease;
    }
    #af-video-viewer video {
        max-width:min(400px,90vw); max-height:70vh;
        border-radius:20px; object-fit:contain;
        box-shadow:0 16px 48px rgba(0,0,0,0.5);
    }
    #af-video-viewer-label {
        color:white; font-size:16px; font-weight:800;
        margin-top:16px; font-family:'Noto Sans KR',sans-serif;
    }
    #af-video-viewer-close {
        position:absolute; top:20px; right:20px;
        width:44px; height:44px;
        background:rgba(255,255,255,0.15);
        border:none; color:white; border-radius:50%;
        font-size:20px; cursor:pointer;
        -webkit-tap-highlight-color:transparent;
        display:flex; align-items:center; justify-content:center;
    }

    .af-theme-label {
        display:flex; align-items:center; padding:12px;
        border:2px solid #dadce0; border-radius:10px;
        cursor:pointer; transition:all 0.3s;
    }
    .af-theme-label:hover { border-color:#ff6b6b !important; box-shadow:0 4px 12px rgba(255,107,107,0.2); }
    `;

    document.head.appendChild(style);
    console.log('💉 만우절 CSS 주입 완료');
}

// ─────────────────────────────────────────────────────────────────────
// 🎨 테마 스타일 적용 / 해제
// ─────────────────────────────────────────────────────────────────────

function applyAprilFoolsThemeStyles() {
    ['style1.css','style2.css','style3.css','style4.css'].forEach(f => {
        const el = document.querySelector(`link[href*="${f}"]`);
        if (el) el.disabled = true;
    });
    document.body.classList.remove('ganadi-theme','dark-theme');
    document.body.classList.add('april-fools-theme');
    if (typeof currentAppliedTheme !== 'undefined') currentAppliedTheme = 'april-fools';
    injectAprilFoolsCSS();
}

function removeAprilFoolsThemeStyles() {
    document.body.classList.remove('april-fools-theme');
    stopEmojiRain();
    afStopBGM();
    document.getElementById('af-banner')?.remove();
    document.getElementById('af-lock-badge')?.remove();
}

// ─────────────────────────────────────────────────────────────────────
// 🎵 BGM
// ─────────────────────────────────────────────────────────────────────

let _afAudio   = null;
let _afPlaying = false;

function afPlayBGM() {
    if (!_afAudio) {
        _afAudio        = new Audio(AF_BGM_PATH);
        _afAudio.loop   = true;
        _afAudio.volume = 0.3;
    }
    _afAudio.play()
        .then(() => { _afPlaying = true;  _afSyncBGMBtn(); })
        .catch(() => { _afPlaying = false; _afSyncBGMBtn(); });
}
function afStopBGM() {
    if (_afAudio) { _afAudio.pause(); _afAudio.currentTime = 0; }
    _afPlaying = false; _afSyncBGMBtn();
}
function afToggleBGM() { _afPlaying ? afStopBGM() : afPlayBGM(); }

function _afSyncBGMBtn() {
    const btn    = document.getElementById('chs-bgm-btn');
    const status = document.getElementById('chs-bgm-bar-status');
    if (btn)    btn.textContent    = _afPlaying ? '⏸' : '▶';
    if (status) status.textContent = _afPlaying ? '🎵 재생 중' : '⏸ 탭하여 재생';
}

// ─────────────────────────────────────────────────────────────────────
// 🌧 이모지 비
// ─────────────────────────────────────────────────────────────────────

let _afEmojiInterval = null;

function startEmojiRain() {
    if (_afEmojiInterval) return;
    _afEmojiInterval = setInterval(() => {
        const el = document.createElement('span');
        el.className = 'af-emoji-drop';
        el.textContent = AF_EMOJIS[Math.floor(Math.random() * AF_EMOJIS.length)];
        el.style.left = Math.random() * 100 + 'vw';
        const dur = (3.5 + Math.random() * 3.5).toFixed(2);
        el.style.animationDuration = dur + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), (parseFloat(dur) + 0.3) * 1000);
    }, 380);
}
function stopEmojiRain() {
    if (_afEmojiInterval) { clearInterval(_afEmojiInterval); _afEmojiInterval = null; }
    document.querySelectorAll('.af-emoji-drop').forEach(e => e.remove());
}

// ─────────────────────────────────────────────────────────────────────
// 📢 배너 (pointer-events:none → 네비게이션 방해 ZERO)
// ─────────────────────────────────────────────────────────────────────

function showAprilFoolsBanner() {
    if (document.getElementById('af-banner')) return;
    const b = document.createElement('div');
    b.id = 'af-banner';
    b.textContent = '🎭 오늘은 만우절! · 🤡 모든 뉴스 조심! · 🎈 April Fools! · 😂 속지 마세요! 🎭';
    document.body.appendChild(b); // ⚠️ prepend/paddingTop 절대 사용 안 함
}

// ─────────────────────────────────────────────────────────────────────
// 🔒 잠금 배지
// ─────────────────────────────────────────────────────────────────────

function showLockBadge() {
    if (document.getElementById('af-lock-badge')) return;
    const badge = document.createElement('button');
    badge.id = 'af-lock-badge';
    badge.textContent = '🔒 만우절 테마 잠금';
    badge.onclick = () => _afToast('🎭 만우절', '4월 1일에는 테마 변경이 불가해요! 내일 도전하세요 😜');
    document.body.appendChild(badge);
}

// ─────────────────────────────────────────────────────────────────────
// 🎭 인트로 팝업
// ─────────────────────────────────────────────────────────────────────

function showAprilFoolsIntro() {
    const todayStr = new Date().toDateString();
    if (sessionStorage.getItem('af_intro') === todayStr) return;
    if (document.getElementById('af-intro-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'af-intro-overlay';
    overlay.innerHTML = `
        <div id="af-intro-box">
            <button id="af-intro-close">✕</button>
            <div style="font-size:52px;margin-bottom:10px;">🎭</div>
            <div id="af-intro-title">만우절이다! 속았지? 😂</div>
            <div id="af-intro-sub">
                오늘은 <strong>4월 1일, 만우절</strong>이에요! 🥳<br>
                해정뉴스가 만우절 모드로 변신했어요 🎪<br>
                <span style="font-size:12px;color:#e53935;font-weight:700;">
                    ⚠️ 더보기 → 차명석 탭도 확인해보세요!
                </span>
            </div>
            <button id="af-intro-btn">🎈 알겠어요! 구경할게요!</button>
        </div>
    `;
    document.body.appendChild(overlay);

    const dismiss = () => {
        overlay.style.animation = 'af-fadeIn 0.25s ease reverse forwards';
        setTimeout(() => overlay.remove(), 260);
        sessionStorage.setItem('af_intro', todayStr);
    };
    document.getElementById('af-intro-btn').onclick  = dismiss;
    document.getElementById('af-intro-close').onclick = dismiss;
    overlay.addEventListener('click', e => { if (e.target === overlay) dismiss(); });
}

// ─────────────────────────────────────────────────────────────────────
// 📺 차명석 탭
// ─────────────────────────────────────────────────────────────────────

function _buildChamyeokseokSection() {
    if (document.getElementById('chamyeokseokSection')) return;
    const sec = document.createElement('section');
    sec.className = 'page-section';
    sec.id = 'chamyeokseokSection';
    const moreSection = document.getElementById('moreMenuSection');
    if (moreSection) moreSection.insertAdjacentElement('afterend', sec);
    else document.querySelector('main')?.appendChild(sec);
}

function showChamyeokseokPage() {
    _buildChamyeokseokSection();

    if (typeof hideAll === 'function') hideAll();
    else document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));

    const sec = document.getElementById('chamyeokseokSection');
    if (!sec) return;
    sec.classList.add('active');

    const jokeHTML = isAprilFoolsDay()
        ? `<div class="chs-joke-banner">
               🎭 <strong>[만우절 특보]</strong><br>
               "${AF_JOKES[Math.floor(Math.random() * AF_JOKES.length)]}"
           </div>`
        : '';

    const videoCards = AF_VIDEOS.map((v, i) => `
        <div class="chs-video-card" id="chs-card-${i}" onclick="_afPlayVideoViewer(${i})">
            <video src="${v.src}" muted playsinline preload="metadata"
                   onmouseover="this.play()" onmouseout="this.pause();this.currentTime=0"
                   onerror="this.parentElement.style.background='#f5f5f5'">
            </video>
            <div class="chs-video-label">${v.emoji} ${v.label}</div>
        </div>
    `).join('');

    const aprilExtra = isAprilFoolsDay()
        ? `<div class="chs-section-title">🎉 만우절 특별 메시지</div>
           <div style="margin:0 16px 16px;background:white;border-radius:14px;
                       padding:16px;box-shadow:0 2px 10px rgba(0,0,0,0.08);
                       text-align:center;font-size:14px;color:#555;line-height:1.7;">
               차명석이 직접 제작한 만우절 에디션입니다. 🎭<br>
               <strong style="color:#e53935;">오늘 하루만 공개되는 특별 영상들이에요!</strong><br>
               <span style="font-size:12px;color:#aaa;">(사실 매일 공개됩니다. 속았죠? 😂)</span>
           </div>`
        : '';

    sec.innerHTML = `
        <div class="chs-header" style="position:relative;">
            <button class="chs-back-btn" onclick="showMoreMenu()">
                <i class="fas fa-arrow-left"></i>
            </button>
            <div class="chs-header-title">${isAprilFoolsDay() ? '🎭 ' : ''}차명석 탭</div>
            <div class="chs-header-sub">
                ${isAprilFoolsDay() ? '만우절 특별 에디션 🎪' : '차명석 전용 스페이스'}
            </div>
        </div>

        ${jokeHTML}

        <div class="chs-bgm-bar">
            <button class="chs-bgm-toggle" id="chs-bgm-btn" onclick="afToggleBGM()">
                ${_afPlaying ? '⏸' : '▶'}
            </button>
            <div class="chs-bgm-info">
                <div class="chs-bgm-title">🎵 차명석 테마 BGM</div>
                <div class="chs-bgm-sub" id="chs-bgm-bar-status">
                    ${_afPlaying ? '🎵 재생 중' : '⏸ 탭하여 재생'}
                </div>
            </div>
            <input type="range" class="chs-volume" min="0" max="1" step="0.05"
                   value="${_afAudio ? _afAudio.volume : 0.3}"
                   oninput="_afSetVolume(this.value)" title="볼륨">
        </div>

        <div class="chs-section-title">🎬 캐릭터 영상 갤러리</div>
        <div class="chs-video-grid">${videoCards}</div>

        ${aprilExtra}
        <div style="height:20px;"></div>
    `;

    if (typeof window.scrollTo === 'function') window.scrollTo(0, 0);
}

function _afSetVolume(val) {
    if (_afAudio) _afAudio.volume = parseFloat(val);
}

function _afPlayVideoViewer(index) {
    if (document.getElementById('af-video-viewer')) return;
    const v = AF_VIDEOS[index];
    const viewer = document.createElement('div');
    viewer.id = 'af-video-viewer';
    viewer.innerHTML = `
        <button id="af-video-viewer-close" onclick="_afCloseVideoViewer()">✕</button>
        <video src="${v.src}" autoplay loop playsinline
               style="max-width:min(400px,90vw);max-height:70vh;border-radius:20px;
                      object-fit:contain;box-shadow:0 16px 48px rgba(0,0,0,0.5);">
        </video>
        <div id="af-video-viewer-label">${v.emoji} ${v.label}</div>
    `;
    viewer.addEventListener('click', e => { if (e.target === viewer) _afCloseVideoViewer(); });
    document.body.appendChild(viewer);
}

function _afCloseVideoViewer() {
    const v = document.getElementById('af-video-viewer');
    if (!v) return;
    v.style.animation = 'af-fadeIn 0.2s ease reverse forwards';
    setTimeout(() => v.remove(), 220);
}

// ─────────────────────────────────────────────────────────────────────
// 🔧 더보기 메뉴에 "차명석" 버튼 주입
//    showMoreMenu()는 매번 innerHTML 덮어씀 → 함수 패치로 해결
// ─────────────────────────────────────────────────────────────────────

function _patchShowMoreMenu() {
    if (typeof showMoreMenu !== 'function') { setTimeout(_patchShowMoreMenu, 400); return; }
    if (window._afMoreMenuPatched) return;
    window._afMoreMenuPatched = true;

    const _orig = window.showMoreMenu;
    window.showMoreMenu = function() {
        _orig.apply(this, arguments);
        requestAnimationFrame(() => { _injectChamyeokseokButton(); });
    };
}

function _injectChamyeokseokButton() {
    const moreSection = document.getElementById('moreMenuSection');
    if (!moreSection || moreSection.querySelector('#chs-more-btn')) return;

    const firstGrid = moreSection.querySelector('.menu-section div[style*="grid"]');
    if (!firstGrid) return;

    const btn = document.createElement('button');
    btn.id = 'chs-more-btn';
    btn.className = 'more-menu-btn';
    btn.style.cssText = `
        background:linear-gradient(135deg,#ff6b6b,#ffd93d) !important;
        color:white !important; font-weight:800 !important; position:relative;
    `;
    btn.innerHTML = `
        <i class="fas fa-film"></i> 차명석
        ${isAprilFoolsDay()
            ? '<span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:white;color:#ff6b6b;font-size:10px;padding:2px 7px;border-radius:8px;font-weight:900;">🎭 만우절</span>'
            : '<span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.3);color:white;font-size:10px;padding:2px 7px;border-radius:8px;font-weight:800;">NEW</span>'
        }
    `;
    btn.onclick = showChamyeokseokPage;
    firstGrid.prepend(btn);
}

// ─────────────────────────────────────────────────────────────────────
// 🔒 테마 강제 잠금 (4월 1일 전용)
// ─────────────────────────────────────────────────────────────────────

function lockThemeOnAprilFools() {
    if (!isAprilFoolsDay()) return;

    const _origSave  = typeof saveTheme  === 'function' ? saveTheme  : null;
    const _origApply = typeof applyTheme === 'function' ? applyTheme : null;

    window.saveTheme = function(name) {
        if (isAprilFoolsDay() && name !== 'april-fools') {
            _afToast('🎭 만우절', '오늘은 테마를 바꿀 수 없어요! 😜🔒');
            _afRevertRadio(); return;
        }
        _origSave ? _origSave.call(window, name) : localStorage.setItem('selectedTheme', name);
    };

    window.applyTheme = function(name) {
        if (isAprilFoolsDay() && name !== 'april-fools') {
            applyAprilFoolsThemeStyles(); _afRevertRadio(); return;
        }
        if (name === 'april-fools') { applyAprilFoolsThemeStyles(); return; }
        if (_origApply) _origApply.call(window, name);
    };

    // 라디오 변경 차단 (capture phase → 가장 먼저 실행)
    document.addEventListener('change', function _afBlock(e) {
        if (!isAprilFoolsDay()) { document.removeEventListener('change', _afBlock, true); return; }
        if (!e.target || e.target.name !== 'theme' || e.target.value === 'april-fools') return;
        e.stopImmediatePropagation();
        _afRevertRadio();
        _afToast('🎭 만우절', '오늘은 만우절! 테마 변경 불가 🔒');
    }, true);

    // 설정 UI 잠금 표시
    setTimeout(() => {
        document.body.classList.add('april-fools-day');
        document.getElementById('themeAprilFools')?.closest('label')?.classList.add('af-active-option');
        if (!document.getElementById('af-theme-lock-notice')) {
            const container = document.querySelector('#themeAccordion > div');
            if (container) {
                const notice = document.createElement('div');
                notice.id = 'af-theme-lock-notice';
                notice.style.display = 'block';
                notice.innerHTML = '🔒 4월 1일엔 만우절 테마 강제 적용!<br>4월 2일부터 자유롭게 바꿀 수 있어요 😜';
                container.appendChild(notice);
            }
        }
    }, 1500);
}

function _afRevertRadio() {
    setTimeout(() => {
        const r = document.getElementById('themeAprilFools');
        if (r) r.checked = true;
        applyAprilFoolsThemeStyles();
    }, 60);
}

// ─────────────────────────────────────────────────────────────────────
// ➕ 테마 설정 UI에 만우절 옵션 추가
// ─────────────────────────────────────────────────────────────────────

function addAprilFoolsThemeOption() {
    if (document.getElementById('themeAprilFools')) return;
    const darkLabel = document.getElementById('themeDark')?.closest('label');
    if (!darkLabel) { setTimeout(addAprilFoolsThemeOption, 600); return; }

    const saved     = (typeof getCurrentTheme === 'function' ? getCurrentTheme() : localStorage.getItem('selectedTheme')) || 'default';
    const isActive  = saved === 'april-fools';
    const isLocked  = isAprilFoolsDay();
    const highlight = isActive || isLocked;

    const label = document.createElement('label');
    label.className = 'af-theme-label' + (highlight ? ' af-active-option' : '');
    if (highlight) { label.style.borderColor = '#ff6b6b'; label.style.boxShadow = '0 0 0 3px rgba(255,107,107,0.22)'; }
    label.innerHTML = `
        <input type="radio" name="theme" value="april-fools" id="themeAprilFools"
               ${highlight ? 'checked' : ''}
               style="margin-right:12px;width:20px;height:20px;cursor:pointer;">
        <div style="flex:1;">
            <div style="font-weight:600;color:#202124;margin-bottom:4px;">
                🎭 만우절 테마
                ${isLocked
                    ? '<span style="background:linear-gradient(135deg,#ff6b6b,#ffd93d);padding:2px 8px;border-radius:4px;font-size:10px;color:white;margin-left:6px;font-weight:800;">🔒 D-DAY</span>'
                    : '<span style="background:linear-gradient(135deg,#ff6b6b,#ffd93d);padding:2px 6px;border-radius:4px;font-size:10px;color:white;margin-left:4px;">FUN</span>'
                }
            </div>
            <div style="font-size:12px;color:#5f6368;">
                ${isLocked ? '😂 오늘은 만우절! 강제 적용 중 🎪' : '🎭 매년 4월 1일 자동 적용되는 특별 테마'}
            </div>
        </div>
        <div style="width:40px;height:40px;border-radius:8px;flex-shrink:0;
            background:linear-gradient(135deg,#ff6b6b 0%,#ffd93d 50%,#6bcb77 100%);
            border:2px solid #ffd93d;box-shadow:0 0 10px rgba(255,107,107,0.4);">
        </div>
    `;
    darkLabel.insertAdjacentElement('afterend', label);
}

// ─────────────────────────────────────────────────────────────────────
// 🔗 applyTheme 전역 확장
// ─────────────────────────────────────────────────────────────────────

function _extendApplyTheme() {
    if (window._afApplyThemeExtended) return;
    if (typeof applyTheme !== 'function') { setTimeout(_extendApplyTheme, 300); return; }
    const _orig = window.applyTheme;
    window.applyTheme = function(name) {
        if (isAprilFoolsDay() && name !== 'april-fools') { applyAprilFoolsThemeStyles(); _afRevertRadio(); return; }
        if (name === 'april-fools') { applyAprilFoolsThemeStyles(); return; }
        if (document.body.classList.contains('april-fools-theme')) removeAprilFoolsThemeStyles();
        _orig.call(window, name);
    };
    window._afApplyThemeExtended = true;
}

function _setupFreeSelectEvent() {
    document.addEventListener('change', e => {
        if (isAprilFoolsDay()) return;
        if (!e.target || e.target.name !== 'theme') return;
        if (e.target.value === 'april-fools') {
            if (typeof saveTheme === 'function') saveTheme('april-fools');
            applyAprilFoolsThemeStyles();
            startEmojiRain();
            _afToast('🎭 만우절 테마', '만우절 테마 적용! 🎪🎉');
        } else if (document.body.classList.contains('april-fools-theme')) {
            removeAprilFoolsThemeStyles();
        }
    });
}

function _afToast(title, msg) {
    if (typeof showToastNotification === 'function') showToastNotification(title, msg);
}

// ─────────────────────────────────────────────────────────────────────
// 🚀 메인 초기화
// ─────────────────────────────────────────────────────────────────────

function initAprilFoolsSystem() {
    if (window._afInited) return;
    window._afInited = true;

    _extendApplyTheme();
    addAprilFoolsThemeOption();
    _patchShowMoreMenu();
    _setupFreeSelectEvent();

    if (isAprilFoolsDay()) {
        localStorage.setItem('selectedTheme', 'april-fools');
        injectAprilFoolsCSS();
        applyAprilFoolsThemeStyles();
        lockThemeOnAprilFools();
        showAprilFoolsBanner();
        showLockBadge();
        startEmojiRain();

        let _flip = false;
        setInterval(() => {
            _flip = !_flip;
            document.title = _flip ? '🃏 속았지? - 만우절뉴스' : '🎭 만우절뉴스';
        }, 2200);

        setTimeout(showAprilFoolsIntro, 900);
    } else {
        const saved = typeof getCurrentTheme === 'function'
            ? getCurrentTheme()
            : (localStorage.getItem('selectedTheme') || 'default');
        if (saved === 'april-fools') {
            injectAprilFoolsCSS();
            applyAprilFoolsThemeStyles();
            startEmojiRain();
        }
    }
}

// ─────────────────────────────────────────────────────────────────────
// 📌 실행 타이밍
// ─────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initAprilFoolsSystem, 200));
} else {
    setTimeout(initAprilFoolsSystem, 200);
}

window.addEventListener('load', () => {
    setTimeout(() => {
        if (!window._afInited) { initAprilFoolsSystem(); return; }
        if (isAprilFoolsDay()) {
            const r = document.getElementById('themeAprilFools');
            if (r) r.checked = true;
            if (!document.body.classList.contains('april-fools-theme')) applyAprilFoolsThemeStyles();
        }
    }, 500);
});

// ─────────────────────────────────────────────────────────────────────
// 📢 전역 노출
// ─────────────────────────────────────────────────────────────────────

window.showChamyeokseokPage = showChamyeokseokPage;
window.afToggleBGM          = afToggleBGM;
window.afPlayBGM            = afPlayBGM;
window.afStopBGM            = afStopBGM;
window._afPlayVideoViewer   = _afPlayVideoViewer;
window._afCloseVideoViewer  = _afCloseVideoViewer;
window._afSetVolume         = _afSetVolume;
window.AprilFools           = { isAprilFoolsDay, startEmojiRain, stopEmojiRain };

console.log("✅ 만우절.js v2 로드 완료 | 4월 1일:", isAprilFoolsDay());