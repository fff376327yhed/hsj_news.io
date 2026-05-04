// =====================================================================
// 🤖 ai-toggle.js — AI 기능 ON/OFF 설정 관리 (버그 수정판 v2)
//
// 수정 사항:
//  1. window._aiToggle → window._aiFeatureToggle 로 이름 변경
//     (Ai.js의 window._aiOpenChat/window._aiToggle과 충돌 해결)
//  2. findAiChatBtn() — '#_aiChatFab' 를 첫 번째 후보로 추가
//  3. applyAiChat() — _aiFloatWrap 전체를 wrap 단위로 hide/show
//     (더 안정적 + MutationObserver subtree:true 로 변경)
//  4. 슬라이더 상태 동기화 강화
//
// index.html 에서 호출 방식:
//   onchange="window._aiFeatureToggle('chat', this.checked)"
//   onchange="window._aiFeatureToggle('summary', this.checked)"
// =====================================================================
(function () {
    'use strict';

    var KEY_CHAT    = 'ai_chat_enabled';
    var KEY_SUMMARY = 'ai_summary_enabled';

    // ── 저장/불러오기 ──────────────────────────────────────────────────
    function getVal(key) {
        try {
            var v = localStorage.getItem(key);
            return v === null ? true : v === 'true';
        } catch(e) { return true; }
    }

    function setVal(key, bool) {
        try { localStorage.setItem(key, bool ? 'true' : 'false'); } catch(e) {}
    }

    // ── 슬라이더 UI 갱신 ───────────────────────────────────────────────
    function applySlider(checkboxId, sliderId, checked) {
        var cb     = document.getElementById(checkboxId);
        var slider = document.getElementById(sliderId);
        if (!cb || !slider) return;

        cb.checked = checked;
        var thumb = slider.querySelector('span');

        if (checked) {
            slider.style.background = '#c62828';
            if (thumb) thumb.style.transform = 'translateX(22px)';
        } else {
            slider.style.background = '#ccc';
            if (thumb) thumb.style.transform = 'translateX(0px)';
        }
    }

    // ── AI 채팅 래퍼/버튼 찾기 ────────────────────────────────────────
    function findAiChatWrap() {
        return document.getElementById('_aiFloatWrap') || null;
    }

    function findAiChatBtn() {
        // 정확한 id 우선 (Ai.js 기준)
        var el = document.getElementById('_aiChatFab');
        if (el) return el;

        var candidates = [
            '#aiChatFab', '#ai-chat-btn', '#aiFloatBtn',
            '#_aiFloatBtn', '#aiRobotBtn', '.ai-float-btn', '[data-ai-chat]'
        ];
        for (var i = 0; i < candidates.length; i++) {
            el = document.querySelector(candidates[i]);
            if (el) return el;
        }

        // body 직속 fixed 요소 중 로봇 관련만 (AI/ai는 너무 광범위하여 오탐 방지)
        var allFixed = document.querySelectorAll(
            'body > div[style*="fixed"], body > button[style*="fixed"]'
        );
        for (var j = 0; j < allFixed.length; j++) {
            var text = allFixed[j].textContent || '';
            var id   = allFixed[j].id || '';
            if (/🤖|robot/i.test(text) || /🤖|robot/i.test(id)) {
                return allFixed[j];
            }
        }
        return null;
    }

    // ── AI 채팅 표시/숨김 ──────────────────────────────────────────────
    function applyAiChat(enabled) {
        // 래퍼(_aiFloatWrap) 전체 hide/show — 가장 안정적
        var wrap = findAiChatWrap();
        if (wrap) {
            wrap.style.display = enabled ? '' : 'none';
            if (!enabled) {
                var win = document.getElementById('_aiChatWin');
                if (win) win.classList.remove('open');
            }
            return;
        }

        // 래퍼 없으면 버튼 단위 시도
        var btn = findAiChatBtn();
        if (btn) {
            btn.style.display = enabled ? '' : 'none';
            return;
        }

        // Ai.js가 아직 DOM에 없으면 MutationObserver로 대기
        if (!window._aiChatObserver) {
            window._aiChatObserver = new MutationObserver(function() {
                var w = findAiChatWrap();
                if (w) {
                    var isEnabled = getVal(KEY_CHAT);
                    w.style.display = isEnabled ? '' : 'none';
                    if (!isEnabled) {
                        var win2 = document.getElementById('_aiChatWin');
                        if (win2) win2.classList.remove('open');
                    }
                } else {
                    var b = findAiChatBtn();
                    if (b) b.style.display = getVal(KEY_CHAT) ? '' : 'none';
                }
            });
            window._aiChatObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // ── AI 요약 표시/숨김 ──────────────────────────────────────────────
    function applyAiSummary(enabled) {
        var wrap = document.getElementById('_aiSummaryWrap');
        if (wrap) wrap.style.display = enabled ? '' : 'none';
        window._aiSummaryEnabled = enabled;
    }

    // ── 공개 토글 API ─────────────────────────────────────────────────
    window._aiFeatureToggle = function(type, enabled) {
        if (type === 'chat') {
            setVal(KEY_CHAT, enabled);
            applyAiChat(enabled);
            applySlider('aiChatToggle', 'aiChatSlider', enabled);
            if (typeof showToastNotification === 'function') {
                showToastNotification(
                    enabled ? '🤖 AI 채팅 ON'  : '🤖 AI 채팅 OFF',
                    enabled ? '🤖 AI 채팅 버튼을 켰어요' : '🤖 AI 채팅 버튼을 껐어요',
                    null
                );
            }
        } else if (type === 'summary') {
            setVal(KEY_SUMMARY, enabled);
            applyAiSummary(enabled);
            applySlider('aiSummaryToggle', 'aiSummarySlider', enabled);
            if (typeof showToastNotification === 'function') {
                showToastNotification(
                    enabled ? '✨ AI 요약 ON'  : '✨ AI 요약 OFF',
                    enabled ? '✨ AI 요약 버튼을 켰어요' : '✨ AI 요약 버튼을 껐어요',
                    null
                );
            }
        }
    };

    // 슬라이더 동기화
    function syncToggleUI() {
        applySlider('aiChatToggle',    'aiChatSlider',    getVal(KEY_CHAT));
        applySlider('aiSummaryToggle', 'aiSummarySlider', getVal(KEY_SUMMARY));
    }

    // ── showSettings 훅 ────────────────────────────────────────────────
    var _origShowSettings = window.showSettings;
    window.showSettings = function() {
        if (typeof _origShowSettings === 'function') _origShowSettings.apply(this, arguments);
        setTimeout(syncToggleUI, 150);
    };

    // ── showArticleDetail 훅 ───────────────────────────────────────────
    var _origShowArticleDetail = window.showArticleDetail;
    window.showArticleDetail = function() {
        if (typeof _origShowArticleDetail === 'function') {
            _origShowArticleDetail.apply(this, arguments);
        }
        setTimeout(function() {
            var wrap = document.getElementById('_aiSummaryWrap');
            if (wrap) wrap.style.display = getVal(KEY_SUMMARY) ? '' : 'none';
        }, 300);
    };

    // ── 초기화 ────────────────────────────────────────────────────────
    function init() {
        applyAiChat(getVal(KEY_CHAT));
        applyAiSummary(getVal(KEY_SUMMARY));
        syncToggleUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('✅ ai-toggle.js v2 로드 | 채팅:', getVal(KEY_CHAT), '| 요약:', getVal(KEY_SUMMARY));

})();