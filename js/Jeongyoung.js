// =====================================================================
// 🎭 정아영 테마 (jeongyoung.js)
// =====================================================================
(function() {
'use strict';

// ──────────────────────────────────────────
// 이미지 경로 설정
// images/jeongyoung/ 폴더에 아래 파일을 넣어주세요:
//   char_normal.png    기본 포즈 (왼쪽 첫번째)
//   char_wink.png      윙크 (가운데 첫번째)
//   char_sweat.png     땀 흘림 (오른쪽 첫번째)
//   char_angry.png     화남 (왼쪽 두번째)
//   char_surprised.png 놀람 (가운데 두번째)
//   char_love.png      사랑 (오른쪽 두번째)
// ──────────────────────────────────────────
const IMG_BASE = './images/jeongyoung/';

const MOTIONS = {
    normal:    { src: IMG_BASE+'char_normal.png',    label: '기본',   idle: true  },
    wink:      { src: IMG_BASE+'char_wink.png',      label: '윙크',   idle: true  },
    love:      { src: IMG_BASE+'char_love.png',      label: '사랑',   idle: true  },
    angry:     { src: IMG_BASE+'char_angry.png',     label: '화남',   idle: false },
    surprised: { src: IMG_BASE+'char_surprised.png', label: '당황',   idle: false },
    sweat:     { src: IMG_BASE+'char_sweat.png',     label: '당혹',   idle: false },
};

const IDLE_MOTIONS    = ['normal', 'wink', 'love'];
const HIT_MOTIONS     = ['angry', 'surprised', 'sweat'];
const IDLE_INTERVAL   = 4000;   // 4초마다 랜덤 idle 전환
const HIT_RESET_DELAY = 2000;   // 맞은 뒤 2초 후 idle 복귀

const DIALOGUES = {
    normal:    ['뭐 봐?', '...', '심심하다', '뉴스나 봐라'],
    wink:      ['ㅎㅎ', '뭐야~', '나 귀엽지?', '😏'],
    love:      ['♡', '오늘도 해정뉴스~', '좋아좋아~', '💕'],
    angry:     ['야!!!!', '아파!!!', '왜 때려!!', '진짜!!!!', '😡'],
    surprised: ['헉!', '어어어!!', '깜짝이야!', '😱'],
    sweat:     ['...', '왜케 때려', '그만해', '💦'],
};

const SOUNDS = {
    hit:   { freq: 350, type: 'sawtooth', duration: 0.18 },
    idle:  { freq: 880, type: 'sine',     duration: 0.12 },
};

// ──────────────────────────────────────────
// 상태
// ──────────────────────────────────────────
let _state         = 'normal';
let _hitResetTimer = null;
let _idleTimer     = null;
let _audioCtx      = null;
let _isHitting     = false;   // 뿅망치 애니메이션 중
let _enabled       = false;   // 네비 탭 활성화 여부

// ──────────────────────────────────────────
// 오디오
// ──────────────────────────────────────────
function _getAudio() {
    if (!_audioCtx) {
        try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return _audioCtx;
}

function _playBeep(type) {
    const ctx = _getAudio();
    if (!ctx) return;
    try {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const s = SOUNDS[type];
        o.type = s.type;
        o.frequency.setValueAtTime(s.freq, ctx.currentTime);
        g.gain.setValueAtTime(0.25, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s.duration);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + s.duration);
    } catch(e) {}
}

// ──────────────────────────────────────────
// 모션 변경
// ──────────────────────────────────────────
function _setMotion(key, isHit) {
    _state = key;
    const motion   = MOTIONS[key];
    const imgEl    = document.getElementById('jy-char-img');
    const labelEl  = document.getElementById('jy-state-label');
    const bubbleEl = document.getElementById('jy-bubble');
    if (!imgEl) return;

    imgEl.src = motion.src;

    // 상태 뱃지
    if (labelEl) labelEl.textContent = motion.label;

    // 말풍선
    if (bubbleEl) {
        const lines = DIALOGUES[key] || [];
        const txt   = lines[Math.floor(Math.random() * lines.length)] || '';
        bubbleEl.textContent = txt;
        bubbleEl.classList.remove('jy-bubble-anim');
        void bubbleEl.offsetWidth;
        bubbleEl.classList.add('jy-bubble-anim');
    }

    if (isHit) {
        _playBeep('hit');
        // 2초 후 idle로 복귀
        clearTimeout(_hitResetTimer);
        _hitResetTimer = setTimeout(_randomIdle, HIT_RESET_DELAY);
    }
}

function _randomIdle() {
    const keys  = IDLE_MOTIONS;
    const picks = keys.filter(k => k !== _state);
    const key   = picks[Math.floor(Math.random() * picks.length)] || 'normal';
    _setMotion(key, false);
    _playBeep('idle');
}

function _startIdleLoop() {
    clearInterval(_idleTimer);
    _idleTimer = setInterval(() => {
        // hit 상태일 때는 타이머가 이미 복귀 예약 중
        if (!HIT_MOTIONS.includes(_state)) {
            if (Math.random() < 0.6) _randomIdle();
        }
    }, IDLE_INTERVAL);
}

function _stopIdleLoop() {
    clearInterval(_idleTimer);
    clearTimeout(_hitResetTimer);
}

// ──────────────────────────────────────────
// 뿅망치 애니메이션
// ──────────────────────────────────────────
function _swingHammer() {
    if (_isHitting) return;
    _isHitting = true;

    const hammer = document.getElementById('jy-hammer');
    if (!hammer) { _isHitting = false; return; }

    hammer.classList.add('jy-swing');
    setTimeout(() => {
        hammer.classList.remove('jy-swing');
        _isHitting = false;
    }, 400);

    // 망치 휘두를 때 랜덤 hit 모션
    const key = HIT_MOTIONS[Math.floor(Math.random() * HIT_MOTIONS.length)];
    _setMotion(key, true);
}

// ──────────────────────────────────────────
// 페이지 렌더링
// ──────────────────────────────────────────
function _injectStyles() {
    if (document.getElementById('jy-styles')) return;
    const s = document.createElement('style');
    s.id = 'jy-styles';
    s.textContent = `
/* ─── 정아영 탭 ─── */
#jy-nav-btn {
    background: linear-gradient(135deg, #ff9a9e, #fad0c4) !important;
    border-radius: 50px !important;
    color: #c62828 !important;
    font-weight: 800 !important;
    font-size: 10px !important;
    transition: transform .15s !important;
}
#jy-nav-btn:hover { transform: scale(1.08); }
#jy-nav-btn.active { background: linear-gradient(135deg, #f9748f, #fda085) !important; color: white !important; }

/* ─── 정아영 섹션 ─── */
#jy-section {
    display: none;
    position: fixed;
    inset: 0;
    background: linear-gradient(180deg, #fff0f3 0%, #fce4ec 60%, #f8bbd0 100%);
    z-index: 1000;
    overflow-y: auto;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-bottom: 80px;
}
#jy-section.active { display: flex; }

/* 헤더 */
.jy-header {
    width: 100%;
    padding: 16px 20px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(8px);
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 1px 12px rgba(249,116,143,0.15);
}
.jy-title {
    font-size: 20px;
    font-weight: 900;
    color: #e91e63;
    letter-spacing: -0.5px;
}
.jy-subtitle {
    font-size: 11px;
    color: #f48fb1;
    font-weight: 600;
    margin-top: 2px;
}

/* 스테이지 */
.jy-stage {
    position: relative;
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 16px;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

/* 뿅망치 */
#jy-hammer {
    font-size: 72px;
    line-height: 1;
    transform-origin: right bottom;
    transition: transform 0.1s;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.18));
    margin-bottom: -10px;
    z-index: 2;
}
#jy-hammer.jy-swing {
    animation: jySwing 0.4s ease-out forwards;
}
@keyframes jySwing {
    0%   { transform: rotate(0deg)   translateY(0px);  }
    30%  { transform: rotate(-45deg) translateY(-10px); }
    55%  { transform: rotate(30deg)  translateY(20px);  }
    75%  { transform: rotate(15deg)  translateY(10px);  }
    100% { transform: rotate(0deg)   translateY(0px);  }
}

/* 캐릭터 */
#jy-char-img {
    width: 260px;
    max-width: 80vw;
    object-fit: contain;
    transition: transform 0.15s, filter 0.15s;
    filter: drop-shadow(0 8px 24px rgba(233,30,99,0.2));
    image-rendering: -webkit-optimize-contrast;
    z-index: 1;
}
#jy-char-img.jy-hit-anim {
    animation: jyHitShake 0.35s ease-out;
}
@keyframes jyHitShake {
    0%,100%{ transform: translateX(0)   rotate(0deg);   }
    20%    { transform: translateX(-8px) rotate(-4deg); }
    40%    { transform: translateX(8px)  rotate(4deg);  }
    60%    { transform: translateX(-5px) rotate(-2deg); }
    80%    { transform: translateX(5px)  rotate(2deg);  }
}

/* 말풍선 */
#jy-bubble {
    position: absolute;
    top: 60px;
    right: -10px;
    background: white;
    color: #c62828;
    font-size: 15px;
    font-weight: 800;
    padding: 8px 14px;
    border-radius: 20px 20px 20px 4px;
    box-shadow: 0 4px 16px rgba(233,30,99,0.18);
    border: 2px solid #f48fb1;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transform: scale(0.7) translateY(8px);
    z-index: 5;
}
#jy-bubble.jy-bubble-anim {
    animation: jyBubblePop 2.2s forwards;
}
@keyframes jyBubblePop {
    0%  { opacity:0; transform:scale(0.7) translateY(8px); }
    12% { opacity:1; transform:scale(1.05) translateY(-2px); }
    20% { transform:scale(1) translateY(0); }
    75% { opacity:1; }
    100%{ opacity:0; transform:scale(0.9) translateY(-6px); }
}

/* 상태 뱃지 */
#jy-state-label {
    margin-top: 14px;
    padding: 6px 18px;
    background: white;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
    color: #e91e63;
    box-shadow: 0 2px 12px rgba(233,30,99,0.15);
    border: 1.5px solid #f8bbd0;
}

/* 힌트 */
.jy-hint {
    margin-top: 20px;
    font-size: 12px;
    color: #f48fb1;
    text-align: center;
    line-height: 1.8;
    padding: 0 24px;
}

/* 이미지 실패 폴백 */
.jy-fallback-char {
    font-size: 120px;
    line-height: 1;
    filter: drop-shadow(0 8px 24px rgba(233,30,99,0.2));
}
    `;
    document.head.appendChild(s);
}

function _buildSection() {
    if (document.getElementById('jy-section')) return;

    const sec = document.createElement('section');
    sec.className = 'page-section';
    sec.id = 'jy-section';
    sec.innerHTML = `
        <div class="jy-header">
            <div>
                <div class="jy-title">🎭 정아영</div>
                <div class="jy-subtitle">때리면 반응한다</div>
            </div>
            <div id="jy-state-label">기본</div>
        </div>

        <div class="jy-stage" id="jy-stage">
            <!-- 뿅망치 -->
            <div id="jy-hammer">🪄</div>

            <!-- 말풍선 -->
            <div id="jy-bubble"></div>

            <!-- 캐릭터 이미지 -->
            <img id="jy-char-img"
                src="${MOTIONS.normal.src}"
                alt="정아영"
                onerror="this.outerHTML='<div class=\\"jy-fallback-char\\">🎭</div>'">
        </div>

        <div class="jy-hint">
            화면 어디든 탭하면 뿅망치가 때립니다 🪄<br>
            잠시 내버려 두면 혼자 반응합니다 💕
        </div>
    `;
    document.querySelector('main')?.appendChild(sec);

    // 전체 화면 클릭 → 뿅망치
    sec.addEventListener('click', (e) => {
        // 뒤로가기 버튼 등 예외
        _swingHammer();
        // 캐릭터 흔들림 애니메이션
        const img = document.getElementById('jy-char-img');
        if (img) {
            img.classList.remove('jy-hit-anim');
            void img.offsetWidth;
            img.classList.add('jy-hit-anim');
            img.addEventListener('animationend', () => img.classList.remove('jy-hit-anim'), { once: true });
        }
    });
}

// ──────────────────────────────────────────
// 네비게이션 탭 주입
// ──────────────────────────────────────────
function _injectNavBtn() {
    if (document.getElementById('jy-nav-btn')) return;
    const nav = document.querySelector('nav.bottom-nav');
    if (!nav) return;

    const btn = document.createElement('button');
    btn.id        = 'jy-nav-btn';
    btn.className = 'nav-btn';
    btn.innerHTML = `<span style="font-size:18px;line-height:1;display:block;">🎭</span><span>정아영</span>`;
    btn.onclick   = () => window.showJeongyoung();
    nav.appendChild(btn);
}

function _removeNavBtn() {
    document.getElementById('jy-nav-btn')?.remove();
}

// ──────────────────────────────────────────
// 공개 API
// ──────────────────────────────────────────
window.showJeongyoung = function() {
    if (typeof hideAll === 'function') hideAll();
    document.getElementById('jy-section')?.classList.add('active');
    document.getElementById('jy-nav-btn')?.classList.add('active');
    _setMotion('normal', false);
    _startIdleLoop();
};

window.hideJeongyoung = function() {
    document.getElementById('jy-section')?.classList.remove('active');
    document.getElementById('jy-nav-btn')?.classList.remove('active');
    _stopIdleLoop();
};

// applyTheme 훅 - 'jeongyoung' 테마 처리
window._jy_applyTheme = function(themeName) {
    if (themeName === 'jeongyoung') {
        _enabled = true;
        _injectStyles();
        _buildSection();
        _injectNavBtn();
        // 테마 적용 알림
        if (typeof showToastNotification === 'function') {
            showToastNotification('🎭 정아영 테마', '하단 탭에서 정아영을 찾아보세요!');
        }
    } else if (_enabled) {
        _enabled = false;
        _stopIdleLoop();
        _removeNavBtn();
        document.getElementById('jy-section')?.classList.remove('active');
    }
};

// 기존 applyTheme 훅
setTimeout(() => {
    const origApply = window.applyTheme;
    if (typeof origApply === 'function' && !origApply._jyHooked) {
        window.applyTheme = function(themeName) {
            window._jy_applyTheme(themeName);
            // jeongyoung이 아닐 때도 기존 테마 처리
            if (themeName !== 'jeongyoung') origApply.apply(this, arguments);
        };
        window.applyTheme._jyHooked = true;
    }

    // 현재 테마가 이미 jeongyoung이면 바로 적용
    const cur = typeof getCurrentTheme === 'function' ? getCurrentTheme() : localStorage.getItem('selectedTheme');
    if (cur === 'jeongyoung') {
        _injectStyles();
        _buildSection();
        _injectNavBtn();
    }
}, 500);

console.log('✅ 정아영 테마 모듈 로드 완료');
})();