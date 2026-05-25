// ===== 🃏 포커 도전과제 시스템 =====
// 파일 위치: ./js/poker-achievement.js

(function () {
    'use strict';

    const POKER_GOAL      = 10000;
    const ACH_UNLOCKED_KEY = 'poker_master_unlocked';
    const GANADI_ACH_KEY   = 'ganadi_found';           // 🐶 가나디 도전과제
    const SCRIPT_URL      = 'https://script.google.com/macros/s/AKfycbyj3UNS1tKXnLgflfqtUeAiod-Ah8yC34UwSC2yEMgZO9kd2nAgGWVrnmer2xnkpOYN/exec';

    // ── 관리자 매핑 ──────────────────────────────────────────────────
    // 뉴스 관리자(1@gmail.com)로 로그인 시
    // 포커 플레이 계정(hyeseongjeong735@gmail.com)의 데이터를 읽음
    // 나중에 도전과제 추가 시에도 이 함수만 거치면 자동 적용
    const ADMIN_MAP = {
        '1@gmail.com': '106548451001774078015'  // → hyeseongjeong735@gmail.com Google UID
    };

    function resolveGoogleUid(user) {
        if (!user) return null;
        if (ADMIN_MAP[user.email]) {
            console.log(`[뉴스👑] 관리자 매핑 적용: ${user.email} → googleUid ${ADMIN_MAP[user.email]}`);
            return ADMIN_MAP[user.email];
        }
        return user.providerData?.[0]?.uid || null;
    }

    // ─────────────────────────────────────────────────────────────────
    // 1. 섹션 DOM 주입
    // ─────────────────────────────────────────────────────────────────
    function injectAchievementsSection() {
        if (document.getElementById('achievementsSection')) return;
        const section = document.createElement('section');
        section.className = 'page-section';
        section.id = 'achievementsSection';
        section.innerHTML = `
            <div class="section-header">
                <button onclick="showMoreMenu()" class="btn-back">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2><i class="fas fa-trophy" style="color:#f9a825;"></i> 도전과제</h2>
            </div>
            <div id="achievementsList" style="padding: 16px;"></div>
        `;
        const main = document.querySelector('main') || document.body;
        main.appendChild(section);
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. Apps Script에서 코인 조회 (Google UID 기준)
    // ─────────────────────────────────────────────────────────────────
    async function fetchPokerCoins() {
        const user = (typeof auth !== 'undefined') ? auth.currentUser : null;

        if (!user) {
            console.warn('[뉴스⚠️] 로그인 필요 — coins=0');
            return 0;
        }

        const googleUid = resolveGoogleUid(user);
        if (!googleUid) {
            console.warn('[뉴스⚠️] Google UID 없음 — coins=0');
            return 0;
        }

        console.log('[뉴스🔍] Apps Script 조회 중... googleUid=', googleUid);

        try {
            const res  = await fetch(`${SCRIPT_URL}?uid=${encodeURIComponent(googleUid)}`, { redirect: 'follow' });
            const json = await res.json();
            console.log('[뉴스✅] Apps Script 응답:', json);
            return parseInt(json.coins) || 0;
        } catch (err) {
            console.error('[뉴스❌] Apps Script 조회 실패:', err.message);
            return 0;
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 3. _pokerAchData 갱신 및 뱃지 동기화
    // ─────────────────────────────────────────────────────────────────
    function syncAchievementData(coins) {
        const unlocked = coins >= POKER_GOAL;
        window._pokerAchData = {
            coins,
            goal   : POKER_GOAL,
            percent: Math.min(100, Math.floor((coins / POKER_GOAL) * 100)),
            unlocked,
        };

        const badge = document.getElementById('achUnlockBadgeMore');
        if (badge) badge.style.display = unlocked ? 'inline-block' : 'none';

        if (unlocked) {
            localStorage.setItem(ACH_UNLOCKED_KEY, '1');
            // 🏅 칭호 해금 처리 (onPokerMasterAchieved가 로드됐을 때만 호출)
            if (typeof window.onPokerMasterAchieved === 'function') {
                window.onPokerMasterAchieved();
            } else {
                // script.js보다 먼저 로드됐을 경우를 대비해 지연 재시도
                setTimeout(() => {
                    if (typeof window.onPokerMasterAchieved === 'function') {
                        window.onPokerMasterAchieved();
                    }
                }, 1500);
            }
        }
        return window._pokerAchData;
    }

    // ─────────────────────────────────────────────────────────────────
    // 4. 도전과제 카드 렌더링
    // ─────────────────────────────────────────────────────────────────
    function renderAchievementsUI(achData) {
        const list = document.getElementById('achievementsList');
        if (!list) return;
        const { coins, goal, percent, unlocked } = achData;

        list.innerHTML = `
            <div style="
                background: ${unlocked ? 'linear-gradient(135deg,#e8f5e9,#f1f8e9)' : 'white'};
                border: 2px solid ${unlocked ? '#66bb6a' : '#e0e0e0'};
                border-radius: 16px; padding: 20px; margin-bottom: 16px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.07);
            ">
                <div style="display:flex; align-items:center; gap:14px; margin-bottom:14px;">
                    <div style="
                        font-size:40px; width:56px; height:56px;
                        display:flex; align-items:center; justify-content:center;
                        background:${unlocked ? '#e8f5e9' : '#f5f5f5'}; border-radius:14px;
                        filter:${unlocked ? 'none' : 'grayscale(0.4)'};
                    ">🃏</div>
                    <div style="flex:1;">
                        <div style="font-size:17px; font-weight:800; color:${unlocked ? '#2e7d32' : '#212121'}; display:flex; align-items:center; gap:6px;">
                            포커 마스터
                            ${unlocked
                                ? '<span style="font-size:12px; background:#2e7d32; color:white; border-radius:20px; padding:2px 8px;">달성!</span>'
                                : '<span style="font-size:12px; color:#9e9e9e;">🔒 미달성</span>'}
                        </div>
                        <div style="font-size:13px; color:#757575; margin-top:3px;">
                            포커 게임에서 코인 ${goal.toLocaleString()}개 달성
                        </div>
                    </div>
                </div>

                <div style="font-size:13px; color:#555; margin-bottom:8px; display:flex; justify-content:space-between;">
                    <span>보유 코인</span>
                    <span style="font-weight:700; color:${unlocked ? '#2e7d32' : '#424242'};">
                        ${coins.toLocaleString()} / ${goal.toLocaleString()}
                    </span>
                </div>

                <div style="background:#e0e0e0; border-radius:999px; height:10px; overflow:hidden; margin-bottom:6px;">
                    <div style="
                        width:${percent}%; height:100%;
                        background:${unlocked ? 'linear-gradient(90deg,#43a047,#66bb6a)' : 'linear-gradient(90deg,#1565c0,#42a5f5)'};
                        border-radius:999px; transition:width .6s cubic-bezier(.4,0,.2,1);
                    "></div>
                </div>

                <div style="font-size:12px; color:#9e9e9e; text-align:right;">${percent}% 달성</div>

                ${unlocked ? `
                <div style="margin-top:14px; background:linear-gradient(135deg,#2e7d32,#43a047); color:white;
                    border-radius:10px; padding:10px 14px; font-size:13px; font-weight:700; text-align:center;">
                    🎉 축하합니다! 포커 마스터 달성 완료!
                </div>` : `
                <div style="margin-top:14px; background:#f5f5f5; border-radius:10px; padding:10px 14px; font-size:12px; color:#757575; text-align:center;">
                    <a target="_blank" rel="noopener"
                       style="color:#1565c0; font-weight:700; text-decoration:none;">
                       🎮 포커 게임
                    </a>
                    <span style="margin-left:6px;">에서 10000 코인을 모아보세요!</span>
                </div>`}
            </div>
            <div id="_achGanadiSlot"></div>
        <div id="_achTitleCategorySlot"></div>
        `;

        // ── 🐶 가나디 도전과제 렌더링 ──────────────────────────────────
        renderGanadiAchievementCard();

        // ── 🏅 칭호 카테고리 렌더링 ──────────────────────────────────
        // _renderTitleCategory가 로드됐으면 바로 호출, 아니면 폴링으로 대기
        function _tryRenderTitles() {
            if (typeof window._renderTitleCategory === 'function') {
                window._renderTitleCategory('#_achTitleCategorySlot');
            } else {
                setTimeout(_tryRenderTitles, 200);
            }
        }
        _tryRenderTitles();
    }

    // ─────────────────────────────────────────────────────────────────
    // 4-2. 🐶 가나디 도전과제 카드 렌더링
    // ─────────────────────────────────────────────────────────────────
    function renderGanadiAchievementCard() {
        const slot = document.getElementById('_achGanadiSlot');
        if (!slot) return;

        // sessionStorage 또는 localStorage 에서 가나디 이스터에그 활성화 여부 확인
        const unlocked =
            sessionStorage.getItem('ganadi_easter_egg') === 'true' ||
            localStorage.getItem(GANADI_ACH_KEY) === '1';

        if (unlocked) {
            // 달성 시 localStorage 영구 저장
            localStorage.setItem(GANADI_ACH_KEY, '1');
        }

        slot.innerHTML = `
            <div style="
                background: ${unlocked ? 'linear-gradient(135deg,#fff0f5,#ffe4ef)' : 'white'};
                border: 2px solid ${unlocked ? '#FFB6C1' : '#e0e0e0'};
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 16px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.07);
                position: relative;
                overflow: hidden;
            ">
                <!-- 발자국 장식 -->
                <span style="position:absolute;top:8px;left:12px;font-size:13px;opacity:0.13;transform:rotate(-20deg);pointer-events:none;">🐾</span>
                <span style="position:absolute;bottom:10px;right:16px;font-size:11px;opacity:0.11;transform:rotate(30deg);pointer-events:none;">🐾</span>

                <!-- 헤더 -->
                <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
                    <div style="
                        font-size:40px;width:56px;height:56px;
                        display:flex;align-items:center;justify-content:center;
                        background:${unlocked ? 'linear-gradient(135deg,#FFB6C1,#ff85a1)' : '#f5f5f5'};
                        border-radius:14px;
                        filter:${unlocked ? 'none' : 'grayscale(0.4)'};
                        box-shadow:${unlocked ? '0 3px 12px rgba(255,182,193,0.5)' : 'none'};
                        flex-shrink:0;
                    ">${unlocked ? '🐶' : '🐾'}</div>
                    <div style="flex:1;">
                        <div style="font-size:17px;font-weight:800;color:${unlocked ? '#7a2050' : '#212121'};display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                            가나디 발견
                            ${unlocked
                                ? '<span style="font-size:12px;background:#e91e8c;color:white;border-radius:20px;padding:2px 8px;font-weight:800;">달성!</span>'
                                : '<span style="font-size:12px;color:#9e9e9e;">🔒 미달성</span>'}
                        </div>
                        <div style="font-size:13px;color:#757575;margin-top:3px;">
                            가나디를 찾으세요!
                        </div>
                    </div>
                </div>

                <!-- 진행도 -->
                <div style="font-size:13px;color:#555;margin-bottom:8px;display:flex;justify-content:space-between;">
                    <span>진행도</span>
                    <span style="font-weight:700;color:${unlocked ? '#7a2050' : '#424242'};">
                        ${unlocked ? '발견 완료 🐾' : '?'}
                    </span>
                </div>
                <div style="background:#e0e0e0;border-radius:999px;height:10px;overflow:hidden;margin-bottom:6px;">
                    <div style="
                        width:${unlocked ? '100' : '0'}%;height:100%;
                        background:${unlocked ? 'linear-gradient(90deg,#e91e8c,#FFB6C1)' : 'linear-gradient(90deg,#bdbdbd,#e0e0e0)'};
                        border-radius:999px;
                        transition:width .6s cubic-bezier(.4,0,.2,1);
                    "></div>
                </div>
                <div style="font-size:12px;color:#9e9e9e;text-align:right;">${unlocked ? '100%' : '0%'} 달성</div>

                <!-- 하단 -->
                ${unlocked ? `
                <div style="margin-top:14px;background:linear-gradient(135deg,#e91e8c,#f06292);color:white;
                    border-radius:10px;padding:10px 14px;font-size:13px;font-weight:700;text-align:center;">
                    🎉 축하합니다! 가나디 발견 달성 완료!
                </div>` : `
                <div style="margin-top:14px;background:#f5f5f5;border-radius:10px;padding:10px 14px;font-size:12px;color:#757575;text-align:center;">
                    🐾 가나디를 테마에서 찾아보세요
                </div>`}
            </div>
        `;
    }

    // ─────────────────────────────────────────────────────────────────
    // 5. 전체 로드
    // ─────────────────────────────────────────────────────────────────
    async function loadPokerAchievement() {
        if (window.authReady) await window.authReady;
        const coins   = await fetchPokerCoins();
        const achData = syncAchievementData(coins);
        return achData;
    }

    // ─────────────────────────────────────────────────────────────────
    // 6. 도전과제 페이지 표시
    // ─────────────────────────────────────────────────────────────────
    window.showAchievementsPage = async function () {
        if (typeof hideAll === 'function') hideAll();
        window.scrollTo(0, 0);
        injectAchievementsSection();

        const section = document.getElementById('achievementsSection');
        if (section) section.classList.add('active');

        const list = document.getElementById('achievementsList');
        if (list) {
            list.innerHTML = `
                <div style="text-align:center; padding:60px 0; color:#9e9e9e;">
                    <i class="fas fa-spinner fa-spin" style="font-size:28px; margin-bottom:12px; display:block;"></i>
                    도전과제 로딩중..
                </div>
            `;
        }

        const achData = await loadPokerAchievement();
        renderAchievementsUI(achData);

        if (typeof updateURL === 'function') updateURL('achievements');
    };

    // ─────────────────────────────────────────────────────────────────
    // 7. 페이지 로드 시 뱃지 초기화
    // ─────────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', async () => {
        injectAchievementsSection();

        if (localStorage.getItem(ACH_UNLOCKED_KEY) === '1') {
            window._pokerAchData = { ...(window._pokerAchData || {}), unlocked: true };
            const badge = document.getElementById('achUnlockBadgeMore');
            if (badge) badge.style.display = 'inline-block';
        }

        await loadPokerAchievement();
    });

})();
