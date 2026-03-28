// =====================================================================
// 📱 pwa.js — 해정뉴스 PWA 설치 관리 (GitHub Pages 완전 수정판 v4)
//
// [핵심 변경]
//  - showSettings 훅/DOMContentLoaded 의존 방식 완전 폐기
//  - 스크립트 실행 즉시 DOM에 직접 접근 (line 805 요소가 이미 존재)
//  - 버튼에 addEventListener 직접 바인딩 (inline onclick 의존 X)
//  - _pwaShowInstall 정의 여부와 무관하게 버튼이 항상 작동
//  - 배지도 즉시 업데이트 (이벤트 대기 없음)
// =====================================================================
(function () {
    'use strict';

    var DISMISS_KEY   = 'pwa_banner_dismissed_at';
    var COOLDOWN_DAYS = 7;
    var SHOW_DELAY_MS = 3500;

    var _deferredPrompt = null;

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
            && !/Firefox|SamsungBrowser/i.test(navigator.userAgent);
    }

    // ──────────────────────────────────────────────
    // 배지 업데이트 (즉시 실행 + 언제든 재호출 가능)
    // ──────────────────────────────────────────────
    function updateInstallBadge() {
        var badge = document.getElementById('pwaStatusBadge');
        var btnEl = document.getElementById('pwaSettingInstallBtn');
        if (!badge || !btnEl) return;

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
    // ① 스크립트 실행 즉시 배지 업데이트
    // ──────────────────────────────────────────────
    // pwa.js(line 1164)가 실행될 때 pwaStatusBadge(line 805)는
    // 이미 DOM에 존재하므로 이벤트 없이 바로 접근 가능
    updateInstallBadge();

    // 안전망: 혹시 아직 DOM이 덜 파싱된 경우를 위한 추가 시도
    setTimeout(updateInstallBadge, 200);
    setTimeout(updateInstallBadge, 800);

    // ──────────────────────────────────────────────
    // 설치 안내 모달 (Android Chrome / 기타 브라우저)
    // ──────────────────────────────────────────────
    function showManualGuide(title, steps) {
        var existing = document.getElementById('_pwaGuideOverlay');
        if (existing) { existing.remove(); }

        var stepsHtml = steps.map(function(step, i) {
            return '<div style="display:flex;align-items:flex-start;gap:12px;'
                + 'margin-bottom:12px;padding:12px 14px;background:#f8f9fa;border-radius:10px;">'
                + '<div style="width:26px;height:26px;border-radius:50%;background:#c62828;'
                + 'color:#fff;font-weight:800;display:flex;align-items:center;'
                + 'justify-content:center;flex-shrink:0;font-size:12px;">' + (i + 1) + '</div>'
                + '<div style="font-size:13px;color:#212121;line-height:1.6;">' + step + '</div>'
                + '</div>';
        }).join('');

        var overlay = document.createElement('div');
        overlay.id = '_pwaGuideOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;'
            + 'background:rgba(0,0,0,0.65);z-index:999999;'
            + 'display:flex;align-items:flex-end;justify-content:center;';

        overlay.innerHTML = '<div style="background:#fff;border-radius:20px 20px 0 0;'
            + 'padding:28px 20px 32px;width:100%;max-width:480px;'
            + 'box-shadow:0 -6px 24px rgba(0,0,0,0.2);">'
            + '<h3 style="margin:0 0 18px;font-size:17px;font-weight:800;color:#212121;">'
            + title + '</h3>'
            + stepsHtml
            + '<button id="_pwaGuideClose" style="width:100%;padding:15px;'
            + 'background:linear-gradient(135deg,#c62828,#e53935);'
            + 'color:#fff;border:none;border-radius:14px;'
            + 'font-size:15px;font-weight:800;cursor:pointer;margin-top:4px;">'
            + '확인했어요 \uD83D\uDC4D</button>'
            + '</div>';

        document.body.appendChild(overlay);

        document.getElementById('_pwaGuideClose').addEventListener('click', function () {
            overlay.remove();
        });
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    // ──────────────────────────────────────────────
    // iOS Safari: 안내 모달
    // ──────────────────────────────────────────────
    function showIOSModal() {
        var modal = document.getElementById('pwaIosModal');
        if (modal) {
            modal.style.display = 'flex';
            var closeBtn = document.getElementById('pwaIosClose');
            if (closeBtn) {
                var newClose = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newClose, closeBtn);
                newClose.addEventListener('click', function () {
                    modal.style.display = 'none';
                    saveDismiss();
                });
            }
            modal.addEventListener('click', function (e) {
                if (e.target === modal) { modal.style.display = 'none'; saveDismiss(); }
            });
        } else {
            showManualGuide('\uD83D\uDCF1 iPhone에 앱 추가하기', [
                'Safari 하단의 <b>공유 버튼 (\u25A1\u2191)</b>을 탭하세요',
                '"<b>홈 화면에 추가</b>" 를 선택하세요',
                '이름 확인 후 오른쪽 위 <b>"추가"</b>를 탭하면 완료!'
            ]);
        }
    }

    // ──────────────────────────────────────────────
    // Android Chrome: 기존 배너 UI 표시
    // ──────────────────────────────────────────────
    function showAndroidBanner() {
        var banner = document.getElementById('pwaInstallBanner');
        if (!banner) return;
        banner.style.display = 'flex';

        var installBtn = document.getElementById('pwaInstallBtn');
        var dismissBtn = document.getElementById('pwaInstallDismiss');
        if (!installBtn || !dismissBtn) return;

        var newInstall = installBtn.cloneNode(true);
        var newDismiss = dismissBtn.cloneNode(true);
        installBtn.parentNode.replaceChild(newInstall, installBtn);
        dismissBtn.parentNode.replaceChild(newDismiss, dismissBtn);

        newInstall.addEventListener('click', function () {
            banner.style.display = 'none';
            if (_deferredPrompt) {
                _deferredPrompt.prompt();
                _deferredPrompt.userChoice.then(function (r) {
                    _deferredPrompt = null;
                    if (r.outcome === 'accepted') { clearDismiss(); updateInstallBadge(); }
                });
            } else {
                showManualGuide('\uD83D\uDCF2 Chrome에서 앱 설치하기', [
                    '주소창 오른쪽 <b>\u22EE (점 세 개)</b> 버튼을 탭하세요',
                    '"<b>홈 화면에 추가</b>" 또는 "<b>앱 설치</b>"를 선택하세요',
                    '이름 확인 후 <b>"추가"</b>를 탭하면 완료!'
                ]);
            }
        });

        newDismiss.addEventListener('click', function () {
            banner.style.display = 'none';
            saveDismiss();
        });
    }

    // ──────────────────────────────────────────────
    // 설치 버튼 핸들러 (모든 플랫폼 분기)
    // ──────────────────────────────────────────────
    function handleInstallClick() {
        if (isInstalledPWA()) {
            alert('\u2705 해정뉴스 앱이 이미 설치되어 있어요!');
            return;
        }

        if (isIOS()) {
            showIOSModal();
            return;
        }

        if (_deferredPrompt) {
            _deferredPrompt.prompt();
            _deferredPrompt.userChoice.then(function (r) {
                _deferredPrompt = null;
                if (r.outcome === 'accepted') { clearDismiss(); updateInstallBadge(); }
            });
            return;
        }

        if (isAndroidChrome()) {
            showManualGuide('\uD83D\uDCF2 Chrome에서 앱 설치하기', [
                '주소창 오른쪽 <b>\u22EE (점 세 개)</b> 버튼을 탭하세요',
                '"<b>홈 화면에 추가</b>" 또는 "<b>앱 설치</b>"를 선택하세요',
                '이름 확인 후 <b>"추가"</b>를 탭하면 완료!'
            ]);
            return;
        }

        if (/Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent)) {
            showIOSModal();
            return;
        }

        showManualGuide('\uD83D\uDCF2 앱 설치하기', [
            '브라우저 <b>메뉴 버튼</b>을 탭하세요',
            '"<b>홈 화면에 추가</b>" 또는 "<b>앱으로 열기</b>"를 선택하세요',
            '이름 확인 후 <b>"추가"</b>를 탭하면 완료!'
        ]);
    }

    // ──────────────────────────────────────────────
    // ② 버튼에 직접 addEventListener 바인딩
    //    inline onclick 오작동과 무관하게 항상 동작
    // ──────────────────────────────────────────────
    (function bindButton() {
        var btn = document.getElementById('pwaSettingInstallBtn');
        if (btn) {
            btn.onclick = null;
            btn.addEventListener('click', handleInstallClick);
        } else {
            // 혹시 element가 없으면 DOMContentLoaded 후 재시도
            document.addEventListener('DOMContentLoaded', function () {
                var b = document.getElementById('pwaSettingInstallBtn');
                if (b) { b.onclick = null; b.addEventListener('click', handleInstallClick); }
            });
        }
    })();

    // ──────────────────────────────────────────────
    // 공개 API (기존 inline onclick 호환용)
    // ──────────────────────────────────────────────
    window._pwaShowInstall = handleInstallClick;
    window._pwaInstall     = handleInstallClick;

    // ──────────────────────────────────────────────
    // beforeinstallprompt (Android Chrome 네이티브 설치)
    // ──────────────────────────────────────────────
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        _deferredPrompt = e;
        console.log('\uD83D\uDCF2 beforeinstallprompt \uC218\uC2E0');
        updateInstallBadge();
        if (!isInstalledPWA() && !isDismissedRecently()) {
            setTimeout(showAndroidBanner, SHOW_DELAY_MS);
        }
    });

    // ──────────────────────────────────────────────
    // appinstalled
    // ──────────────────────────────────────────────
    window.addEventListener('appinstalled', function () {
        _deferredPrompt = null;
        clearDismiss();
        var banner = document.getElementById('pwaInstallBanner');
        if (banner) banner.style.display = 'none';
        updateInstallBadge();
        if (typeof showToastNotification === 'function') {
            showToastNotification('\uD83C\uDF89 설치 완료!', '해정뉴스 앱이 홈 화면에 추가되었어요!', null);
        }
    });

    // ──────────────────────────────────────────────
    // iOS 자동 모달
    // ──────────────────────────────────────────────
    if (isIOS() && !isInstalledPWA() && !isDismissedRecently()) {
        setTimeout(showIOSModal, SHOW_DELAY_MS);
    }

    // ──────────────────────────────────────────────
    // DOMContentLoaded / load — 배지 추가 갱신 안전망
    // ──────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', updateInstallBadge);
    window.addEventListener('load', updateInstallBadge);

    // ──────────────────────────────────────────────
    // showSettings 훅 — 설정 탭 열 때마다 배지 재갱신
    // ──────────────────────────────────────────────
    var _origShowSettings = window.showSettings;
    window.showSettings = function () {
        if (typeof _origShowSettings === 'function') {
            _origShowSettings.apply(this, arguments);
        }
        setTimeout(updateInstallBadge, 100);
        setTimeout(updateInstallBadge, 500);
    };

    console.log('\u2705 pwa.js v4 | \uC124\uCE58\uB428:', isInstalledPWA(), '| iOS:', isIOS(), '| Android:', isAndroidChrome());

})();
