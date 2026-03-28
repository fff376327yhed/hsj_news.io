// =====================================================================
// 📱 pwa.js — 해정뉴스 PWA 설치 관리 (완전 독립 파일)
// index.html 의 기존 PWA 인라인 <script> 블록을 모두 제거하고
// 이 파일을 ./js/pwa.js 로 저장한 뒤 index.html 에 아래 한 줄 추가:
//   <script src="./js/pwa.js"></script>   (다른 js 파일들 아래에)
// =====================================================================
(function () {
    'use strict';

    // ──────────────────────────────────────────────
    // 상수
    // ──────────────────────────────────────────────
    var DISMISS_KEY   = 'pwa_banner_dismissed_at'; // localStorage 키
    var COOLDOWN_DAYS = 7;   // 닫기 후 재표시까지 일수
    var SHOW_DELAY_MS = 4000; // 페이지 로드 후 자동 배너 표시 지연(ms)

    var _deferredPrompt = null; // beforeinstallprompt 이벤트 저장

    // ──────────────────────────────────────────────
    // 감지 유틸
    // ──────────────────────────────────────────────

    /** 이미 PWA로 설치된 상태인지 */
    function isInstalledPWA() {
        return window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone === true   // iOS Safari 홈화면
            || document.referrer.includes('android-app://'); // TWA
    }

    /** 사용자가 최근에 배너를 닫았는지 */
    function isDismissedRecently() {
        try {
            var ts = localStorage.getItem(DISMISS_KEY);
            if (!ts) return false;
            return (Date.now() - parseInt(ts, 10)) < COOLDOWN_DAYS * 86400000;
        } catch (e) { return false; }
    }

    /** 닫기 시각 저장 */
    function saveDismiss() {
        try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
    }

    /** localStorage 쿨다운 초기화 (설치 완료 후) */
    function clearDismiss() {
        try { localStorage.removeItem(DISMISS_KEY); } catch (e) {}
    }

    /** iOS 기기 판단 */
    function isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream;
    }

    // ──────────────────────────────────────────────
    // 설치 상태 배지 업데이트
    // (설정 페이지의 "앱 설치" 카드 상태 표시)
    // ──────────────────────────────────────────────
    function updateInstallBadge() {
        var badge  = document.getElementById('pwaStatusBadge');
        var btnEl  = document.getElementById('pwaSettingInstallBtn');
        if (!badge || !btnEl) return;

        if (isInstalledPWA()) {
            badge.textContent        = '✅ 설치됨';
            badge.style.background   = '#e8f5e9';
            badge.style.color        = '#2e7d32';
            badge.style.border       = '1px solid #a5d6a7';
            btnEl.textContent        = '이미 설치되어 있어요';
            btnEl.disabled           = true;
            btnEl.style.opacity      = '0.5';
            btnEl.style.cursor       = 'default';
        } else {
            badge.textContent        = '미설치';
            badge.style.background   = '#fff3e0';
            badge.style.color        = '#e65100';
            badge.style.border       = '1px solid #ffcc80';
            btnEl.textContent        = '📲 지금 설치하기';
            btnEl.disabled           = false;
            btnEl.style.opacity      = '1';
            btnEl.style.cursor       = 'pointer';
        }
    }

    // ──────────────────────────────────────────────
    // Android Chrome: 하단 배너 표시
    // ──────────────────────────────────────────────
    function showAndroidBanner() {
        var banner = document.getElementById('pwaInstallBanner');
        if (!banner || banner.style.display === 'flex') return;
        banner.style.display = 'flex';

        // 버튼 이벤트 (중복 방지: clone)
        var installBtn  = document.getElementById('pwaInstallBtn');
        var dismissBtn  = document.getElementById('pwaInstallDismiss');
        var newInstall  = installBtn.cloneNode(true);
        var newDismiss  = dismissBtn.cloneNode(true);
        installBtn.parentNode.replaceChild(newInstall, installBtn);
        dismissBtn.parentNode.replaceChild(newDismiss, dismissBtn);

        newInstall.addEventListener('click', async function () {
            banner.style.display = 'none';
            if (!_deferredPrompt) return;
            _deferredPrompt.prompt();
            var result = await _deferredPrompt.userChoice;
            _deferredPrompt = null;
            if (result.outcome === 'accepted') {
                clearDismiss();
                updateInstallBadge();
            }
        });

        newDismiss.addEventListener('click', function () {
            banner.style.display = 'none';
            saveDismiss();
        });
    }

    // ──────────────────────────────────────────────
    // iOS Safari: 안내 모달 표시
    // ──────────────────────────────────────────────
    function showIOSModal() {
        var modal = document.getElementById('pwaIosModal');
        if (!modal || modal.style.display === 'flex') return;
        modal.style.display = 'flex';

        var closeBtn = document.getElementById('pwaIosClose');
        var newClose = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newClose, closeBtn);

        newClose.addEventListener('click', function () {
            modal.style.display = 'none';
            saveDismiss();
        });
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                saveDismiss();
            }
        });
    }

    // ──────────────────────────────────────────────
    // 공개 API: 설정 버튼 / 외부에서 직접 호출
    // ──────────────────────────────────────────────
    window._pwaShowInstall = function () {
        if (isInstalledPWA()) {
            if (typeof showToastNotification === 'function') {
                showToastNotification('✅ 이미 설치됨', '해정뉴스 앱이 이미 설치되어 있어요!', null);
            }
            return;
        }
        if (isIOS()) {
            showIOSModal();
            return;
        }
        if (_deferredPrompt) {
            showAndroidBanner();
            return;
        }
        // beforeinstallprompt가 아직 오지 않은 경우 (이미 설치됐거나 조건 미충족)
        if (typeof showToastNotification === 'function') {
            showToastNotification('ℹ️ 앱 설치', '브라우저 메뉴 → "홈 화면에 추가"를 선택하세요.', null);
        }
    };

    // 기존 이름 호환
    window._pwaInstall = window._pwaShowInstall;

    // ──────────────────────────────────────────────
    // beforeinstallprompt (Android Chrome)
    // ──────────────────────────────────────────────
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        _deferredPrompt = e;
        console.log('📲 beforeinstallprompt 수신 - PWA 설치 가능');

        updateInstallBadge(); // 설정 카드 상태 갱신

        // 이미 설치됨 or 최근 닫음 → 자동 배너 표시 안 함
        if (isInstalledPWA() || isDismissedRecently()) return;

        setTimeout(showAndroidBanner, SHOW_DELAY_MS);
    });

    // ──────────────────────────────────────────────
    // appinstalled (설치 완료)
    // ──────────────────────────────────────────────
    window.addEventListener('appinstalled', function () {
        _deferredPrompt = null;
        clearDismiss();

        var banner = document.getElementById('pwaInstallBanner');
        if (banner) banner.style.display = 'none';

        updateInstallBadge();

        if (typeof showToastNotification === 'function') {
            showToastNotification('🎉 설치 완료!', '해정뉴스 앱이 홈 화면에 추가되었어요!', null);
        }
        console.log('✅ PWA 설치 완료');
    });

    // ──────────────────────────────────────────────
    // iOS: 자동 모달 (4초 후)
    // ──────────────────────────────────────────────
    if (isIOS() && !isInstalledPWA() && !isDismissedRecently()) {
        setTimeout(showIOSModal, SHOW_DELAY_MS);
    }

    // ──────────────────────────────────────────────
    // DOM 준비 후 설정 배지 초기화
    // ──────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateInstallBadge);
    } else {
        updateInstallBadge();
    }

    // 설정 탭이 열릴 때마다 배지 재갱신 (showSettings 훅)
    var _origShowSettings = window.showSettings;
    window.showSettings = function () {
        if (typeof _origShowSettings === 'function') _origShowSettings.apply(this, arguments);
        setTimeout(updateInstallBadge, 100);
    };

    console.log('✅ pwa.js 로드 완료 | 설치됨:', isInstalledPWA(), '| iOS:', isIOS());

})();