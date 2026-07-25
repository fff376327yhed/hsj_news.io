// ================================================================
// 📱 device-detect.js  —  기기 감지 + 설정 저장 + 팝업 + body 클래스
// script.js 뒤에 <script src="device-detect.js"></script> 로 로드
// ================================================================

(function () {
'use strict';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. 정밀 기기 감지
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DD = window.DeviceDetect = {};

DD.TYPES = {
    MOBILE:  'mobile',
    TABLET:  'tablet',
    PC:      'pc',
};

/** UA + 화면 크기 조합으로 정밀 판별 */
DD.detect = function () {
    const ua = navigator.userAgent;
    const w  = window.screen.width;
    const h  = window.screen.height;
    const shorter = Math.min(w, h);
    const longer  = Math.max(w, h);
    const hasTouch = navigator.maxTouchPoints > 0;

    // ── 아이패드 (iOS 13+는 UA에 iPad 없이 Macintosh로 옴)
    const isIpad = /iPad/i.test(ua)
        || (/Macintosh/i.test(ua) && hasTouch && shorter >= 768);

    // ── 안드로이드 태블릿
    const isAndroidTablet = /Android/i.test(ua) && !/Mobile/i.test(ua);

    // ── 일반 태블릿 (화면 넓이 768~1200, 터치 있음)
    const isTabletSize = hasTouch && shorter >= 600 && longer <= 1366;

    if (isIpad || isAndroidTablet || isTabletSize) {
        return DD.TYPES.TABLET;
    }

    // ── 모바일
    if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        return DD.TYPES.MOBILE;
    }

    // ── 작은 화면 + 터치 = 모바일처럼 취급
    if (hasTouch && shorter < 600) {
        return DD.TYPES.MOBILE;
    }

    return DD.TYPES.PC;
};

DD.detected = DD.detect(); // 현재 실제 기기

/** 저장된 기기 설정 (Firebase에서 로드) */
DD.saved = null;

/** 현재 활성 기기 설정 (saved 없으면 detected) */
DD.current = function () {
    return DD.saved || DD.detected;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. body 클래스 적용
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DD.applyBodyClass = function (type) {
    document.body.classList.remove('device-mobile', 'device-tablet', 'device-pc');
    document.body.classList.add(`device-${type}`);
};

// 로드 즉시 감지 결과 적용 (저장 설정 로드 전까지)
DD.applyBodyClass(DD.detected);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. CSS 주입
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(function injectCSS() {
    if (document.getElementById('_ddStyle')) return;
    const s = document.createElement('style');
    s.id = '_ddStyle';
    s.textContent = `
/* ── 기기별 기본 가시성 ── */
.dd-mobile-only  { display:none !important; }
.dd-tablet-only  { display:none !important; }
.dd-pc-only      { display:none !important; }

body.device-mobile .dd-mobile-only  { display:revert !important; }
body.device-tablet .dd-tablet-only  { display:revert !important; }
body.device-pc     .dd-pc-only      { display:revert !important; }

/* ── 모바일 전용 레이아웃 개선 ── */
body.device-mobile .nav-btn span.nav-label { font-size:10px; }
body.device-mobile .article-card          { margin:0 0 10px; border-radius:10px; }
body.device-mobile .section-header h2     { font-size:20px; }

/* ── 기기 팝업 ── */
@keyframes ddSlideUp {
    from { transform:translateY(100%); opacity:0; }
    to   { transform:translateY(0);    opacity:1; }
}
#_ddPopup {
    position:fixed; bottom:0; left:0; width:100%;
    display:flex; justify-content:center;
    z-index:999999; animation:ddSlideUp 0.3s cubic-bezier(.16,1,.3,1);
}
#_ddPopup .inner {
    background:white; width:100%; max-width:520px;
    border-radius:20px 20px 0 0; padding:20px 20px 32px;
    box-shadow:0 -4px 24px rgba(0,0,0,0.18);
}

/* ── 설정 카드 ── */
.dd-device-card {
    background:white; border-radius:12px; margin-bottom:12px;
    box-shadow:0 2px 8px rgba(0,0,0,0.10); overflow:hidden;
}
.dd-device-card .header {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px; cursor:pointer; user-select:none;
}
.dd-device-card .header:hover { background:#fafafa; }
.dd-device-card .body {
    padding:0 16px 16px; border-top:1px solid #f0f0f0;
}
.dd-device-option {
    display:flex; align-items:center; gap:14px;
    padding:13px 14px; border:2px solid #e8e8e8;
    border-radius:12px; cursor:pointer; margin-bottom:8px;
    transition:border-color 0.15s, background 0.15s;
}
.dd-device-option.selected {
    border-color:#c62828; background:#fff5f5;
}
.dd-device-option:hover:not(.selected) {
    background:#fafafa; border-color:#ccc;
}
.dd-device-option .icon {
    font-size:26px; width:38px; text-align:center; flex-shrink:0;
}
.dd-device-option .info { flex:1; }
.dd-device-option .info .name {
    font-size:15px; font-weight:700; color:#212121;
}
.dd-device-option .info .desc {
    font-size:12px; color:#888; margin-top:2px;
}
.dd-device-option .check {
    width:22px; height:22px; border-radius:50%;
    border:2px solid #ddd; display:flex;
    align-items:center; justify-content:center;
    flex-shrink:0; transition:all 0.15s;
}
.dd-device-option.selected .check {
    background:#c62828; border-color:#c62828;
}
.dd-device-option.selected .check::after {
    content:''; width:6px; height:10px;
    border:2px solid white; border-top:none; border-left:none;
    transform:rotate(45deg); display:block; margin-top:-2px;
}
.dd-badge-detected {
    font-size:10px; background:#e8f5e9; color:#2e7d32;
    border-radius:10px; padding:2px 8px; font-weight:700;
    border:1px solid #c8e6c9;
}
.dd-badge-saved {
    font-size:10px; background:#e3f2fd; color:#1565c0;
    border-radius:10px; padding:2px 8px; font-weight:700;
    border:1px solid #bbdefb;
}
    `;
    document.head.appendChild(s);
})();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. Firebase 저장 / 로드
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DD.saveToFirebase = async function (type) {
    const uid = auth.currentUser?.uid;
    if (!uid) { localStorage.setItem('_ddPref', type); return; }
    try {
        await db.ref(`users/${uid}/devicePreference`).set(type);
        localStorage.setItem('_ddPref', type);
    } catch (e) { console.warn('DD: 저장 실패', e); }
};

DD.loadFromFirebase = async function () {
    // 먼저 localStorage 빠른 로드
    const cached = localStorage.getItem('_ddPref');
    if (cached) {
        DD.saved = cached;
        DD.applyBodyClass(cached);
    }

    const uid = auth.currentUser?.uid;
    if (!uid) return cached || null;

    try {
        const snap = await db.ref(`users/${uid}/devicePreference`).once('value');
        const val  = snap.val();
        if (val) {
            DD.saved = val;
            localStorage.setItem('_ddPref', val);
            DD.applyBodyClass(val);
        }
        return val;
    } catch (e) { return cached || null; }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. 기기 변경 팝업
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const LABELS = {
    mobile:  { icon:'📱', name:'모바일', desc:'스마트폰 최적화 레이아웃' },
    tablet:  { icon:'📟', name:'태블릿', desc:'태블릿 / 대화면 최적화' },
    pc:      { icon:'🖥️', name:'PC',    desc:'데스크탑 / 노트북 최적화' },
};

DD.showChangePop = function (detectedType, savedType) {
    document.getElementById('_ddPopup')?.remove();

    const det  = LABELS[detectedType]  || LABELS.pc;
    const sav  = LABELS[savedType]     || LABELS.pc;

    const popup = document.createElement('div');
    popup.id = '_ddPopup';
    popup.innerHTML = `
        <div class="inner">
            <div style="width:36px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 16px;"></div>
            <div style="font-size:16px;font-weight:800;color:#212121;margin-bottom:6px;">
                기기 설정을 변경할까요?
            </div>
            <div style="font-size:13px;color:#888;margin-bottom:18px;line-height:1.6;">
                현재 접속 기기 <strong>${det.icon} ${det.name}</strong>이(가) 저장된 설정
                <strong>${sav.icon} ${sav.name}</strong>과 달라요.
            </div>

            <!-- 비교 카드 -->
            <div style="display:flex;gap:10px;margin-bottom:20px;">
                <div style="flex:1;padding:12px;border-radius:12px;background:#f8f9fa;border:2px solid #e8e8e8;text-align:center;">
                    <div style="font-size:28px;margin-bottom:4px;">${sav.icon}</div>
                    <div style="font-size:13px;font-weight:700;color:#555;">${sav.name}</div>
                    <div style="font-size:10px;color:#aaa;margin-top:2px;">저장된 설정</div>
                </div>
                <div style="display:flex;align-items:center;color:#ccc;font-size:20px;">→</div>
                <div style="flex:1;padding:12px;border-radius:12px;background:#fff5f5;border:2px solid #c62828;text-align:center;">
                    <div style="font-size:28px;margin-bottom:4px;">${det.icon}</div>
                    <div style="font-size:13px;font-weight:700;color:#c62828;">${det.name}</div>
                    <div style="font-size:10px;color:#c62828;margin-top:2px;">현재 기기 ✓</div>
                </div>
            </div>

            <div style="display:flex;gap:10px;">
                <button id="_ddPopupKeep"
                    style="flex:1;padding:13px;border:1.5px solid #e0e0e0;border-radius:12px;
                    background:white;font-size:14px;font-weight:600;color:#555;cursor:pointer;">
                    유지 (${sav.name})
                </button>
                <button id="_ddPopupChange"
                    style="flex:1;padding:13px;border:none;border-radius:12px;
                    background:#c62828;font-size:14px;font-weight:700;color:white;cursor:pointer;">
                    변경 (${det.name})
                </button>
            </div>

            <div style="text-align:center;margin-top:12px;">
                <button id="_ddPopupDismiss"
                    style="background:none;border:none;font-size:12px;color:#bbb;cursor:pointer;">
                    다음에 묻지 않기
                </button>
            </div>
        </div>`;

    document.body.appendChild(popup);

    document.getElementById('_ddPopupKeep').onclick = () => {
        popup.remove();
        // 저장 설정 유지
        DD.applyBodyClass(savedType);
    };

    document.getElementById('_ddPopupChange').onclick = async () => {
        popup.remove();
        DD.saved = detectedType;
        DD.applyBodyClass(detectedType);
        await DD.saveToFirebase(detectedType);
        _ddShowToast(`${det.icon} ${det.name} 모드로 변경됐어요!`);
        // 설정 카드가 열려있으면 갱신
        _ddRefreshSettingsCard();
    };

    document.getElementById('_ddPopupDismiss').onclick = async () => {
        popup.remove();
        // 현재 설정값으로 덮어쓰기 (다음부터 안 물어봄)
        await DD.saveToFirebase(detectedType);
        DD.saved = detectedType;
        DD.applyBodyClass(detectedType);
    };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. 초기화 (로그인 시 실행)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let _ddInitDone = false;

DD.init = async function () {
    if (_ddInitDone) return;
    _ddInitDone = true;

    const saved = await DD.loadFromFirebase();
    const det   = DD.detected;

    if (!saved) {
        // 첫 방문 → 감지된 기기 저장
        DD.saved = det;
        await DD.saveToFirebase(det);
        DD.applyBodyClass(det);
        _ddShowToast(`${LABELS[det]?.icon} ${LABELS[det]?.name} 모드로 시작해요!`);
        return;
    }

    // 저장된 기기와 다를 때만 팝업
    if (saved !== det) {
        // 사용자가 '다음에 묻지 않기' 선택 여부 확인
        const skipKey = `_ddSkip_${auth.currentUser?.uid}`;
        // 저장값과 감지값이 다를 때 항상 팝업 (dismiss 누르면 같아짐)
        setTimeout(() => DD.showChangePop(det, saved), 1500);
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. auth 상태 감지 → 자동 초기화
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
auth.onAuthStateChanged(user => {
    if (user) {
        _ddInitDone = false; // 로그인 할 때마다 재실행
        DD.init();
    } else {
        // 비로그인: localStorage만
        const cached = localStorage.getItem('_ddPref');
        if (cached) {
            DD.saved = cached;
            DD.applyBodyClass(cached);
        } else {
            DD.applyBodyClass(DD.detected);
        }
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. 설정 카드 렌더링 (updateSettings 패치)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const _origUpdateSettings = window.updateSettings;
window.updateSettings = async function () {
    if (_origUpdateSettings) await _origUpdateSettings();
    _ddInjectSettingsCard();
};

function _ddInjectSettingsCard() {
    // 이미 있으면 갱신
    const existing = document.getElementById('_ddSettingsCard');
    if (existing) { _ddRenderCardContent(existing); return; }

    // soundAccordion 카드 뒤에 삽입
    const anchor = document.querySelector('[id="soundAccordion"]')?.closest('div[style*="border-radius:12px"]')
                || document.getElementById('adminModeIndicator')
                || document.querySelector('.settings-divider');

    if (!anchor) return;

    const card = document.createElement('div');
    card.id = '_ddSettingsCard';
    card.className = 'dd-device-card';
    anchor.parentNode.insertBefore(card, anchor);
    _ddRenderCardContent(card);
}

function _ddRenderCardContent(card) {
    const cur = DD.current();
    const det = DD.detected;
    const lbl = LABELS[cur] || LABELS.pc;

    card.innerHTML = `
        <div class="header" onclick="ddToggleCard()">
            <h3 style="font-size:16px;font-weight:700;margin:0;color:#202124;">
                ${lbl.icon} 기기 모드
                <span style="font-size:12px;font-weight:600;color:#888;margin-left:8px;">${lbl.name}</span>
            </h3>
            <button id="_ddAccBtn"
                style="padding:5px 14px;font-size:13px;font-weight:700;border:1.5px solid #c62828;
                background:white;color:#c62828;border-radius:6px;cursor:pointer;pointer-events:none;">
                더보기 ▾
            </button>
        </div>
        <div id="_ddCardBody" style="display:none;padding:0 16px 16px;border-top:1px solid #f0f0f0;">
            <div style="padding-top:14px;">
                <div style="font-size:12px;color:#888;margin-bottom:12px;line-height:1.6;
                    background:#f8f9fa;border-radius:8px;padding:10px 12px;">
                    <i class="fas fa-info-circle" style="color:#c62828;margin-right:4px;"></i>
                    현재 접속 기기: <strong>${LABELS[det]?.icon} ${LABELS[det]?.name}</strong>
                    &nbsp;·&nbsp; 적용 중: <strong>${lbl.icon} ${lbl.name}</strong>
                </div>
                ${Object.entries(LABELS).map(([type, info]) => `
                    <div class="dd-device-option ${cur === type ? 'selected' : ''}"
                        onclick="ddSelectDevice('${type}')">
                        <div class="icon">${info.icon}</div>
                        <div class="info">
                            <div class="name">${info.name}
                                ${det === type ? `<span class="dd-badge-detected">현재 기기</span>` : ''}
                                ${DD.saved === type && det !== type ? `<span class="dd-badge-saved">저장됨</span>` : ''}
                            </div>
                            <div class="desc">${info.desc}</div>
                        </div>
                        <div class="check"></div>
                    </div>`).join('')}
                <div style="font-size:12px;color:#aaa;margin-top:10px;text-align:center;line-height:1.6;">
                    변경 후 즉시 적용되며 Firebase에 저장됩니다.
                </div>
            </div>
        </div>`;
}

window.ddToggleCard = function () {
    const body = document.getElementById('_ddCardBody');
    const btn  = document.getElementById('_ddAccBtn');
    if (!body) return;
    const open = body.style.display === 'block';
    body.style.display = open ? 'none' : 'block';
    if (btn) btn.textContent = open ? '더보기 ▾' : '접기 ▲';
};

window.ddSelectDevice = async function (type) {
    DD.saved = type;
    DD.applyBodyClass(type);
    await DD.saveToFirebase(type);
    const lbl = LABELS[type];
    _ddShowToast(`${lbl.icon} ${lbl.name} 모드로 변경됐어요!`);
    _ddRefreshSettingsCard();
};

function _ddRefreshSettingsCard() {
    const card = document.getElementById('_ddSettingsCard');
    if (!card) return;
    _ddRenderCardContent(card);
    // 아코디언 열려있으면 유지
    const body = document.getElementById('_ddCardBody');
    if (body) body.style.display = 'block';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. 토스트 헬퍼
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function _ddShowToast(msg) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
        background:rgba(30,30,30,0.82);color:white;padding:11px 22px;border-radius:22px;
        font-size:13px;z-index:999999;pointer-events:none;white-space:nowrap;
        box-shadow:0 2px 10px rgba(0,0,0,0.2);font-weight:600;`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity='0'; el.style.transition='opacity 0.4s'; }, 2500);
    setTimeout(() => el.remove(), 3000);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. 전역 헬퍼 노출 (외부 스크립트에서 사용 가능)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 현재 기기 타입 반환 */
window.getDeviceMode   = () => DD.current();
window.isMobileMode    = () => DD.current() === DD.TYPES.MOBILE;
window.isTabletMode    = () => DD.current() === DD.TYPES.TABLET;
window.isPCMode        = () => DD.current() === DD.TYPES.PC;

/** HTML 조각: 특정 기기에서만 보이는 wrapper */
window.ddOnlyMobile    = (html) => `<div class="dd-mobile-only">${html}</div>`;
window.ddOnlyTablet    = (html) => `<div class="dd-tablet-only">${html}</div>`;
window.ddOnlyPC        = (html) => `<div class="dd-pc-only">${html}</div>`;

console.log(`✅ device-detect.js 로드 완료 | 감지: ${DD.detected}`);
})();