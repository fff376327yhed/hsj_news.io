// =====================================================================
// 📱 pwa.js — 해정뉴스 PWA 설치 관리 (GitHub Pages 완벽 호환 v3)
//
// v3 수정 사항:
//  1. [핵심 버그 수정] updateInstallBadge() 에서 element 못 찾으면
//     _badgeResolved가 false로 남아 fallback도 계속 실패하던 문제 해결
//     → 자동 재시도 로직 추가 (300ms 간격, 최대 15회 = 4.5초)
//  2. [GitHub Pages 버그 수정] DOMContentLoaded + window.load 이중 훅
//     → script 실행 순서 이슈로 DOMContentLoaded를 놓쳐도 안전
//  3. [설치 버튼 개선] beforeinstallprompt 없어도 Android Chrome에서
//     banner UI 표시 + 직관적인 설치 가이드 제공
//  4. [배지 초기화 개선] showSettings 래핑뿐 아니라 설정 섹션이
//     URL 라우팅에 의해 먼저 렌더될 때도 즉시 배지 갱신
//  5. [안전 장치] 모든 setTimeout 타이밍을 다단계로 확대
//     (300ms / 800ms / 2000ms / 4000ms)
// =====================================================================
(function () {
    'use strict';

    // ──────────────────────────────────────────────
    // 상수
    // ──────────────────────────────────────────────
    var DISMISS_KEY   = 'pwa_banner_dismissed_at';
    var COOLDOWN_DAYS = 7;
    var SHOW_DELAY_MS = 3500;

    // 재시도 설정
    var RETRY_INTERVAL_MS = 300;  // 재시도 간격
    var RETRY_MAX         = 15;   // 최대 재시도 횟수 (= 4.5초)

    var _deferredPrompt  = null;
    var _promptReceived  = false;
    var _badgeResolved   = false;
    var _retryCount      = 0;     // 배지 업데이트 재시도 카운터

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
            && !/Firefox/i.test(navigator.userAgent)
            && !/SamsungBrowser/i.test(navigator.userAgent);
    }

    function isSamsungBrowser() {
        return /SamsungBrowser/i.test(navigator.userAgent);
    }

    // ──────────────────────────────────────────────
    // 설치 상태 배지 업데이트
    // ──────────────────────────────────────────────
    // [v3 핵심 수정] element를 못 찾으면 재시도 로직으로 위임
    // 더 이상 중간에 리턴하지 않고 재시도 큐에 넣음
    function updateInstallBadge() {
        var badge = document.getElementById('pwaStatusBadge');
        var btnEl = document.getElementById('pwaSettingInstallBtn');

        // [v3 버그 수정] element 없으면 재시도 — 바로 return하면 _badgeResolved가
        // false로 남아 모든 fallback이 계속 실패하는 근본 원인이었음
        if (!badge || !btnEl) {
            scheduleRetry();
            return;
        }

        // element 찾았으므로 완료 처리
        _badgeResolved = true;
        _retryCount    = 0;

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
    // [v3 신규] 자동 재시도 스케줄러
    // element가 없는 경우 RETRY_INTERVAL_MS마다 재시도 (최대 RETRY_MAX회)
    // ──────────────────────────────────────────────
    function scheduleRetry() {
        if (_badgeResolved) return;
        if (_retryCount >= RETRY_MAX) {
            console.warn('[pwa.js] 배지 elements를 끝내 찾지 못했습니다. (최대 재시도 초과)');
            return;
        }
        _retryCount++;
        setTimeout(updateInstallBadge, RETRY_INTERVAL_MS);
    }

    // ──────────────────────────────────────────────
    // [v3 신규] 다단계 fallback 타이머
    // 재시도와 별개로 300 / 800 / 2000 / 4000ms 시점에 강제 시도
    // ──────────────────────────────────────────────
    function scheduleMultiFallbacks() {
        [300, 800, 2000, 4000].forEach(function (delay) {
            setTimeout(function () {
                if (!_badgeResolved) {
                    _retryCount = 0; // 카운터 리셋 후 재시도
                    updateInstallBadge();
                }
            }, delay);
        });
    }

    // ──────────────────────────────────────────────
    // Android Chrome: 하단 배너 표시
    // ──────────────────────────────────────────────
    function showAndroidBanner() {
        var banner = document.getElementById('pwaInstallBanner');
        if (!banner) return;
        if (banner.style.display === 'flex') return;
        banner.style.display = 'flex';

        var installBtn = document.getElementById('pwaInstallBtn');
        var dismissBtn = document.getElementById('pwaInstallDismiss');
        if (!installBtn || !dismissBtn) return;

        var newInstall = installBtn.cloneNode(true);
        var newDismiss = dismissBtn.cloneNode(true);
        installBtn.parentNode.replaceChild(newInstall, installBtn);
        dismissBtn.parentNode.replaceChild(newDismiss, dismissBtn);

        // [v3] _deferredPrompt가 없을 때는 버튼 텍스트를 안내 문구로 변경
        if (!_deferredPrompt) {
            newInstall.textContent = '설치 방법 보기';
            newInstall.addEventListener('click', function () {
                banner.style.display = 'none';
                saveDismiss();
                _showAndroidManualGuide();
            });
        } else {
            newInstall.addEventListener('click', function () {
                banner.style.display = 'none';
                _deferredPrompt.prompt();
                _deferredPrompt.userChoice.then(function (result) {
                    _deferredPrompt = null;
                    if (result.outcome === 'accepted') {
                        clearDismiss();
                        updateInstallBadge();
                    }
                });
            });
        }

        newDismiss.addEventListener('click', function () {
            banner.style.display = 'none';
            saveDismiss();
        });
    }

    // ──────────────────────────────────────────────
    // [v3 신규] Android 수동 설치 가이드 모달
    // beforeinstallprompt 없을 때 대안 UI
    // ──────────────────────────────────────────────
    function _showAndroidManualGuide() {
        var existing = document.getElementById('_pwaManualGuideModal');
        if (existing) { existing.style.display = 'flex'; return; }

        var modal = document.createElement('div');
        modal.id = '_pwaManualGuideModal';
        modal.style.cssText = [
            'position:fixed','top:0','left:0','width:100%','height:100%',
            'background:rgba(0,0,0,0.7)','z-index:99999',
            'display:flex','align-items:flex-end','justify-content:center'
        ].join(';');

        modal.innerHTML = [
            '<div style="background:#fff;border-radius:20px 20px 0 0;padding:28px 24px;',
            'width:100%;max-width:480px;box-shadow:0 -4px 24px rgba(0,0,0,0.18);">',
            '<h3 style="margin:0 0 18px;font-size:18px;font-weight:800;color:#212121;">',
            '📲 앱 설치 방법</h3>',
            '<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;',
            'padding:14px;background:#f8f9fa;border-radius:12px;">',
            '<div style="width:32px;height:32px;background:#c62828;border-radius:50%;',
            'color:#fff;font-weight:900;display:flex;align-items:center;',
            'justify-content:center;flex-shrink:0;font-size:14px;">1</div>',
            '<div>',
            '<div style="font-size:14px;font-weight:700;color:#212121;">',
            '브라우저 메뉴 열기</div>',
            '<div style="font-size:12px;color:#868e96;margin-top:3px;">',
            'Chrome 우측 상단 <b>⋮</b> (점 세 개) 버튼 탭</div>',
            '</div></div>',
            '<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;',
            'padding:14px;background:#f8f9fa;border-radius:12px;">',
            '<div style="width:32px;height:32px;background:#c62828;border-radius:50%;',
            'color:#fff;font-weight:900;display:flex;align-items:center;',
            'justify-content:center;flex-shrink:0;font-size:14px;">2</div>',
            '<div>',
            '<div style="font-size:14px;font-weight:700;color:#212121;">',
            '홈 화면에 추가</div>',
            '<div style="font-size:12px;color:#868e96;margin-top:3px;">',
            '메뉴에서 <b>"홈 화면에 추가"</b> 선택</div>',
            '</div></div>',
            '<div style="display:flex;align-items:center;gap:14px;margin-bottom:24px;',
            'padding:14px;background:#f8f9fa;border-radius:12px;">',
            '<div style="width:32px;height:32px;background:#c62828;border-radius:50%;',
            'color:#fff;font-weight:900;display:flex;align-items:center;',
            'justify-content:center;flex-shrink:0;font-size:14px;">3</div>',
            '<div>',
            '<div style="font-size:14px;font-weight:700;color:#212121;">',
            '추가 탭</div>',
            '<div style="font-size:12px;color:#868e96;margin-top:3px;">',
            '이름 확인 후 <b>"추가"</b> 버튼 탭하면 완료!</div>',
            '</div></div>',
            '<button id="_pwaManualGuideClose"',
            'style="width:100%;padding:16px;background:linear-gradient(135deg,#c62828,#e53935);',
            'color:#fff;border:none;border-radius:14px;font-size:16px;',
            'font-weight:800;cursor:pointer;">확인했어요 👍</button>',
            '</div>'
        ].join('');

        document.body.appendChild(modal);

        document.getElementById('_pwaManualGuideClose').addEventListener('click', function () {
            modal.style.display = 'none';
        });
        modal.addEventListener('click', function (e) {
            if (e.target === modal) modal.style.display = 'none';
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

        // ③ Android Chrome + beforeinstallprompt 있음 — 네이티브 배너
        if (_deferredPrompt) {
            _deferredPrompt.prompt();
            _deferredPrompt.userChoice.then(function (result) {
                _deferredPrompt = null;
                if (result.outcome === 'accepted') {
                    clearDismiss();
                    updateInstallBadge();
                }
            });
            return;
        }

        // ④ Android Chrome — prompt 없음 (이미 설치됐거나 조건 미충족)
        //    → 수동 설치 가이드 모달 표시 (v3: 토스트 대신 상세 모달)
        if (isAndroidChrome()) {
            _showAndroidManualGuide();
            return;
        }

        // ⑤ 삼성 인터넷
        if (isSamsungBrowser()) {
            _toast('📲 앱 설치', '우측 하단 메뉴 → "페이지를 홈 화면에 추가"를 선택하세요.');
            return;
        }

        // ⑥ 기타 브라우저
        _toast('ℹ️ 앱 설치', '브라우저 메뉴 → "홈 화면에 추가"를 선택하면 앱처럼 사용할 수 있어요.');
    };

    // 기존 이름 호환
    window._pwaInstall = window._pwaShowInstall;

    // ──────────────────────────────────────────────
    // beforeinstallprompt (Android Chrome)
    // ──────────────────────────────────────────────
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        _deferredPrompt   = e;
        _promptReceived   = true;
        console.log('📲 beforeinstallprompt 수신 - PWA 설치 가능');

        // 배지 즉시 갱신 (아직 element를 못 찾은 경우를 대비해 재시도 포함)
        _badgeResolved = false;
        _retryCount    = 0;
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

        _badgeResolved = false;
        _retryCount    = 0;
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
    // [v3 핵심] 초기화 — DOMContentLoaded + window.load 이중 훅
    // GitHub Pages에서 스크립트 실행 순서 이슈로 DOMContentLoaded를
    // 놓치는 경우에도 window.load 가 반드시 배지를 갱신
    // ──────────────────────────────────────────────
    function _init() {
        _retryCount = 0;
        updateInstallBadge();
        scheduleMultiFallbacks();
    }

    if (document.readyState === 'loading') {
        // 아직 DOM 파싱 중 → DOMContentLoaded 대기
        document.addEventListener('DOMContentLoaded', _init);
    } else {
        // 이미 DOM 준비됨 → 즉시 실행
        _init();
    }

    // [v3] window.load 안전망 — 위 두 경로 모두 실패해도 반드시 배지 갱신
    window.addEventListener('load', function () {
        if (!_badgeResolved) {
            _retryCount = 0;
            updateInstallBadge();
        }
    });

    // ──────────────────────────────────────────────
    // 설정 탭 열릴 때마다 배지 재갱신 (showSettings 훅)
    // ──────────────────────────────────────────────
    // [v3] 설치 탭이 URL 라우팅에 의해 pwa.js보다 먼저 렌더될 수 있으므로
    //      래핑 시점뿐 아니라 interval로도 초기 갱신 시도
    var _origShowSettings = window.showSettings;
    window.showSettings = function () {
        if (typeof _origShowSettings === 'function') {
            _origShowSettings.apply(this, arguments);
        }
        // 탭 전환 애니메이션 후 갱신 (여러 타이밍에 시도)
        [120, 500, 1200].forEach(function (delay) {
            setTimeout(function () {
                _badgeResolved = false;
                _retryCount    = 0;
                updateInstallBadge();
            }, delay);
        });
    };

    console.log(
        '✅ pwa.js v3 로드 | 설치됨:', isInstalledPWA(),
        '| iOS:', isIOS(),
        '| AndroidChrome:', isAndroidChrome()
    );

})();
