// ===== 관리자 콘솔 표시 여부 토글 =====
// script.js 뒤에 로드하세요 (vote.js, chat.js 이후)
(function () {
'use strict';
console.log('🖥️ console-toggle.js 로드 중...');

const STORAGE_KEY = 'adminConsoleVisible';

// ── 설정 읽기/쓰기 ──
function isConsoleEnabled() {
    // 기본값 true (기존 동작 유지)
    return localStorage.getItem(STORAGE_KEY) !== 'false';
}
function setConsoleEnabled(val) {
    localStorage.setItem(STORAGE_KEY, val ? 'true' : 'false');
}

// ── FAB 표시/숨김 적용 ──
function applyConsoleFabVisibility() {
    const fab   = document.getElementById('_mcFab');
    const panel = document.getElementById('_mcPanel');
    const enabled = isConsoleEnabled();

    if (fab) {
        fab.style.display = enabled ? 'flex' : 'none';
    }
    if (panel && !enabled) {
        // 패널도 강제 닫기
        panel.style.display = 'none';
        window._mcClose?.();
    }
}

// ── FAB가 동적으로 생성될 때도 감지 (MutationObserver) ──
const observer = new MutationObserver(() => {
    if (document.getElementById('_mcFab')) {
        applyConsoleFabVisibility();
    }
});
observer.observe(document.body, { childList: true, subtree: false });

// 이미 존재하면 바로 적용
applyConsoleFabVisibility();

// ── showMoreMenu 패치: 관리자 섹션에 토글 추가 ──
const _origShowMoreMenu = window.showMoreMenu;
window.showMoreMenu = function () {
    if (typeof _origShowMoreMenu === 'function') _origShowMoreMenu.call(this);

    // 관리자만
    if (!(typeof isAdmin === 'function' && isAdmin())) return;

    const section = document.getElementById('moreMenuSection');
    if (!section || document.getElementById('_consoleToggleRow')) return;

    // 관리자 섹션 grid 찾기
    const adminSection = [...section.querySelectorAll('.menu-section')]
        .find(s => s.querySelector('h3')?.textContent?.includes('관리자'));
    if (!adminSection) return;

    const grid = adminSection.querySelector('div[style*="display:grid"]');
    if (!grid) return;

    const enabled = isConsoleEnabled();

    const row = document.createElement('button');
    row.id = '_consoleToggleRow';
    row.className = 'more-menu-btn';
    row.style.cssText = 'border-color:#ffcdd2;display:flex;align-items:center;gap:12px;justify-content:space-between;';
    row.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
            <i class="fas fa-terminal" style="color:#c62828;"></i>
            <div>
                <div style="font-weight:600;color:#212121;font-size:14px;">콘솔 버튼 표시</div>
                <div style="font-size:11px;color:#9e9e9e;margin-top:2px;">우측 하단 관리자 콘솔 FAB</div>
            </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
            <span id="_consoleBadge" style="
                font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;
                background:${enabled ? '#e8f5e9' : '#f5f5f5'};
                color:${enabled ? '#2e7d32' : '#9e9e9e'};">
                ${enabled ? 'ON' : 'OFF'}
            </span>
        </div>
    `;
    row.onclick = toggleAdminConsoleVisibility;
    grid.appendChild(row);
};

// ── 토글 함수 ──
window.toggleAdminConsoleVisibility = function () {
    const next = !isConsoleEnabled();
    setConsoleEnabled(next);
    applyConsoleFabVisibility();

    // 배지 업데이트
    const badge = document.getElementById('_consoleBadge');
    if (badge) {
        badge.textContent = next ? 'ON' : 'OFF';
        badge.style.background = next ? '#e8f5e9' : '#f5f5f5';
        badge.style.color      = next ? '#2e7d32' : '#9e9e9e';
    }

    // 토스트
    const msg = next ? '✅ 콘솔 버튼이 표시됩니다' : '🔕 콘솔 버튼을 숨겼습니다';
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
        background:rgba(0,0,0,0.75);color:white;padding:10px 20px;border-radius:20px;
        font-size:13px;z-index:99999;pointer-events:none;white-space:nowrap;`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
};

console.log('✅ console-toggle.js 로드 완료');
})();