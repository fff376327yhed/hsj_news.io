// =====================================================================
// 📱 pwa.js — 해정뉴스 PWA 설치 관리 (버그 수정 완전판 v2)
//
// 수정 사항:
//  1. beforeinstallprompt 미발생 시에도 배지가 "확인 중..."에 멈추지 않도록
//     1.5초 안전 타임아웃 추가 (확인 중 → 미설치 자동 전환)
//  2. 설치 버튼 → beforeinstallprompt 없어도 작동하도록 개선
//     (Android: banner 표시 / iOS: modal 표시 / 기타: toast)
//  3. showSettings 훅에서 updateInstallBadge 항상 재갱신
//  4. 모바일 UX 최우선 — 버튼 터치 영역 확대, 애니메이션 최적화
// =====================================================================
(function () {
    'use strict';

    // ──────────────────────────────────────────────
    // 상수
    // ──────────────────────────────────────────────
    var DISMISS_KEY    = 'pwa_banner_dismissed_at';
    var COOLDOWN_DAYS  = 7;
    var SHOW_DELAY_MS  = 3500;
    var BADGE_TIMEOUT  = 1500; // 1.5초 후 배지 강제 확정

    var _deferredPrompt     = null;
    var _promptReceived     = false; // beforeinstallprompt 수신 여부
    var _badgeResolved      = false; // 배지 이미 확정됐는지

    // ──────────────────────────────────────────────
    // 감지 유틸
    // ──────────────────────────────────────────────
    function isInstalledPWA() {
        return window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone === true
            || document.referrer.indexOf('android-app://') !== -1;
    }

    function isDismissedRecently() {
        try {
            var ts = localStorage.getItem(DISMISS_KEY);
            if (!ts) return false;
            return (Date.now() - parseInt(ts, 10)) < COOLDOWN_DAYS * 86400000;
        } catch (e) { return false; }
    }

    function saveDismiss() {
        try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
    }

    function clearDismiss() {
        try { localStorage.removeItem(DISMISS_KEY); } catch (e) {}
    }

    function isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream;
    }

    function isAndroidChrome() {
        return /Android/i.test(navigator.userAgent)
            && /Chrome/i.test(navigator.userAgent)
            && !/Firefox/i.test(navigator.userAgent);
    }

    // ──────────────────────────────────────────────
    // 설치 상태 배지 업데이트
    // ──────────────────────────────────────────────
    function updateInstallBadge(force) {
        var badge = document.getElementById('pwaStatusBadge');
        var btnEl = document.getElementById('pwaSettingInstallBtn');
        if (!badge || !btnEl) return;

        _badgeResolved = true;

        if (isInstalledPWA()) {
            badge.textContent      = '✅ 설치됨';
            badge.style.background = '#e8f5e9';
            badge.style.color      = '#2e7d32';
            badge.style.border     = '1px solid #a5d6a7';
            btnEl.textContent      = '이미 설치되어 있어요';
            btnEl.disabled         = true;
            btnEl.style.opacity    = '0.5';
            btnEl.style.cursor     = 'default';
        } else {
            badge.textContent      = '미설치';
            badge.style.background = '#fff3e0';
            badge.style.color      = '#e65100';
            badge.style.border     = '1px solid #ffcc80';
            btnEl.textContent      = '📲 지금 설치하기';
            btnEl.disabled         = false;
            btnEl.style.opacity    = '1';
            btnEl.style.cursor     = 'pointer';
        }
    }

    // ──────────────────────────────────────────────
    // 배지 안전 타임아웃
    // — beforeinstallprompt가 오지 않아도 1.5초 후 강제 확정
    // ──────────────────────────────────────────────
    function scheduleBadgeFallback() {
        setTimeout(function () {
            if (!_badgeResolved) {
                updateInstallBadge(true);
            }
        }, BADGE_TIMEOUT);
    }

    // ──────────────────────────────────────────────
    // Android Chrome: 하단 배너 표시
    // ──────────────────────────────────────────────
    function showAndroidBanner() {
        var banner = document.getElementById('pwaInstallBanner');
        if (!banner) return;
        if (banner.style.display === 'flex') return;
        banner.style.display = 'flex';

        // 버튼 이벤트 — 중복 방지 cloneNode
        var installBtn = document.getElementById('pwaInstallBtn');
        var dismissBtn = document.getElementById('pwaInstallDismiss');
        if (!installBtn || !dismissBtn) return;

        var newInstall = installBtn.cloneNode(true);
        var newDismiss = dismissBtn.cloneNode(true);
        installBtn.parentNode.replaceChild(newInstall, installBtn);
        dismissBtn.parentNode.replaceChild(newDismiss, dismissBtn);

        newInstall.addEventListener('click', function () {
            banner.style.display = 'none';
            if (!_deferredPrompt) return;
            _deferredPrompt.prompt();
            _deferredPrompt.userChoice.then(function (result) {
                _deferredPrompt = null;
                if (result.outcome === 'accepted') {
                    clearDismiss();
                    updateInstallBadge();
                }
            });
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
        if (!modal) return;
        if (modal.style.display === 'flex') return;
        modal.style.display = 'flex';

        var closeBtn = document.getElementById('pwaIosClose');
        if (!closeBtn) return;

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
    // 토스트 알림 헬퍼
    // ──────────────────────────────────────────────
    function _toast(title, msg) {
        if (typeof showToastNotification === 'function') {
            showToastNotification(title, msg, null);
        } else {
            alert(title + '\n' + msg);
        }
    }

    // ──────────────────────────────────────────────
    // 공개 API: 설정/외부에서 호출
    // ──────────────────────────────────────────────
    window._pwaShowInstall = function () {
        // ① 이미 설치된 경우
        if (isInstalledPWA()) {
            _toast('✅ 이미 설치됨', '해정뉴스 앱이 이미 설치되어 있어요!');
            return;
        }

        // ② iOS — 안내 모달
        if (isIOS()) {
            showIOSModal();
            return;
        }

        // ③ Android Chrome + beforeinstallprompt 있음 — 배너 표시
        if (_deferredPrompt) {
            showAndroidBanner();
            return;
        }

        // ④ Android Chrome이지만 prompt가 아직 없음
        //    (매니페스트 누락, 이미 설치됨, 조건 미충족 등)
        if (isAndroidChrome()) {
            _toast('📲 앱 설치', '브라우저 우측 상단 ⋮ 메뉴 → "홈 화면에 추가"를 선택하세요.');
            return;
        }

        // ⑤ 기타 브라우저 (Samsung Internet, Firefox 등)
        _toast('ℹ️ 앱 설치', '브라우저 메뉴 → "홈 화면에 추가"를 선택하면 앱처럼 사용할 수 있어요.');
    };

    // 기존 이름 호환
    window._pwaInstall = window._pwaShowInstall;

    // ──────────────────────────────────────────────
    // beforeinstallprompt (Android Chrome)
    // ──────────────────────────────────────────────
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        _deferredPrompt    = e;
        _promptReceived    = true;
        console.log('📲 beforeinstallprompt 수신 - PWA 설치 가능');

        updateInstallBadge();

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

        _toast('🎉 설치 완료!', '해정뉴스 앱이 홈 화면에 추가되었어요!');
        console.log('✅ PWA 설치 완료');
    });

    // ──────────────────────────────────────────────
    // iOS: 자동 모달
    // ──────────────────────────────────────────────
    if (isIOS() && !isInstalledPWA() && !isDismissedRecently()) {
        setTimeout(showIOSModal, SHOW_DELAY_MS);
    }

    // ──────────────────────────────────────────────
    // DOM 준비 후 배지 초기화 + 안전 타임아웃 시작
    // ──────────────────────────────────────────────
    function _init() {
        updateInstallBadge();
        scheduleBadgeFallback();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
    } else {
        _init();
    }

    // ──────────────────────────────────────────────
    // 설정 탭 열릴 때마다 배지 재갱신 (showSettings 훅)
    // ──────────────────────────────────────────────
    var _origShowSettings = window.showSettings;
    window.showSettings = function () {
        if (typeof _origShowSettings === 'function') {
            _origShowSettings.apply(this, arguments);
        }
        // 탭 전환 애니메이션 후 갱신
        setTimeout(function () {
            _badgeResolved = false; // 강제 재갱신 허용
            updateInstallBadge();
        }, 120);
    };

    console.log('✅ pwa.js v2 로드 | 설치됨:', isInstalledPWA(), '| iOS:', isIOS(), '| AndroidChrome:', isAndroidChrome());

})();
