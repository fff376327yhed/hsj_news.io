// ===== 🃏 포커 도전과제 시스템 =====
// 파일 위치: ./js/poker-achievement.js

(function () {
    'use strict';

    const POKER_GOAL      = 10000;
    const ACH_UNLOCKED_KEY = 'poker_master_unlocked';
    const GANADI_ACH_KEY   = 'ganadi_found';           // 🐶 가나디 도전과제
    const GAENEKDO_ACH_KEY = 'gaenekdo_member_unlocked'; // 🎖️ 게넥도 도전과제

    // ⬇️ 게넥도 도전과제를 클리어할 기사 ID (레거시 — 현재는 Firebase linkedAchievement 방식 사용)
    window.GAENEKDO_TARGET_ARTICLE_ID = null;
    const SCRIPT_URL      = 'https://script.google.com/macros/s/AKfycbwLzQ3zEV_Xqc_wnpmzayY_qxLeLgqR-4umN2gjfq_oA0U-GiRpoSbVPQdYlL8z-tAp/exec';

    // ── 관리자 매핑 ──────────────────────────────────────────────────
    const ADMIN_MAP = {
        '1@gmail.com': '106548451001774078015'
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
        if (!user) { console.warn('[뉴스⚠️] 로그인 필요 — coins=0'); return 0; }
        const googleUid = resolveGoogleUid(user);
        if (!googleUid) { console.warn('[뉴스⚠️] Google UID 없음 — coins=0'); return 0; }
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
        const unlocked = coins >= POKER_GOAL || localStorage.getItem(ACH_UNLOCKED_KEY) === '1';
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
            if (typeof window.onPokerMasterAchieved === 'function') {
                window.onPokerMasterAchieved();
            } else {
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
            <div id="_achGaenekdoSlot"></div>
            <div id="_achArrowSlot"></div>
            <div id="_achTitleCategorySlot"></div>
        `;

        renderGanadiAchievementCard();
        renderGaenekdoAchievementCard();
        renderArrowAchievementCard(); // async — Firebase에서 점수 조회 후 슬롯 업데이트

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

        const unlocked =
            sessionStorage.getItem('ganadi_easter_egg') === 'true' ||
            localStorage.getItem(GANADI_ACH_KEY) === '1';

        if (unlocked) {
            localStorage.setItem(GANADI_ACH_KEY, '1');
            if (typeof window.onGanadiMasterAchieved === 'function') {
                window.onGanadiMasterAchieved();
            } else {
                setTimeout(() => {
                    if (typeof window.onGanadiMasterAchieved === 'function') {
                        window.onGanadiMasterAchieved();
                    }
                }, 1500);
            }
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
                <span style="position:absolute;top:8px;left:12px;font-size:13px;opacity:0.13;transform:rotate(-20deg);pointer-events:none;">🐾</span>
                <span style="position:absolute;bottom:10px;right:16px;font-size:11px;opacity:0.11;transform:rotate(30deg);pointer-events:none;">🐾</span>

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
                        <div style="font-size:13px;color:#757575;margin-top:3px;">가나디를 찾으세요!</div>
                    </div>
                </div>

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
    // 4-3. 🎖️ 게넥도 도전과제 카드 렌더링
    // ─────────────────────────────────────────────────────────────────
    function renderGaenekdoAchievementCard() {
        const slot = document.getElementById('_achGaenekdoSlot');
        if (!slot) return;

        const unlocked = localStorage.getItem('gaenekdo_member_unlocked') === '1';

        if (unlocked) {
            if (typeof window.onGaenekdoMemberAchieved === 'function') {
                window.onGaenekdoMemberAchieved();
            } else {
                setTimeout(() => {
                    if (typeof window.onGaenekdoMemberAchieved === 'function') {
                        window.onGaenekdoMemberAchieved();
                    }
                }, 1500);
            }
        }

        slot.innerHTML = `
            <div style="
                background: ${unlocked ? 'linear-gradient(135deg,#060e2a,#0d1b4b)' : 'white'};
                border: 2px solid ${unlocked ? '#2756cc' : '#e0e0e0'};
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 16px;
                box-shadow: ${unlocked ? '0 2px 18px rgba(39,86,204,0.35)' : '0 2px 12px rgba(0,0,0,0.07)'};
                position: relative;
                overflow: hidden;
            ">
                <span style="position:absolute;top:8px;left:12px;font-size:13px;opacity:0.15;transform:rotate(-20deg);pointer-events:none;">✦</span>
                <span style="position:absolute;bottom:10px;right:16px;font-size:11px;opacity:0.12;transform:rotate(30deg);pointer-events:none;">✦</span>

                <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
                    <div style="
                        font-size:40px;width:56px;height:56px;
                        display:flex;align-items:center;justify-content:center;
                        background:${unlocked ? 'linear-gradient(135deg,#1a3a8f,#2756cc)' : '#f5f5f5'};
                        border-radius:14px;
                        filter:${unlocked ? 'none' : 'grayscale(0.5)'};
                        box-shadow:${unlocked ? '0 3px 14px rgba(39,86,204,0.5)' : 'none'};
                        flex-shrink:0;
                    ">🎖️</div>
                    <div style="flex:1;">
                        <div style="font-size:17px;font-weight:800;color:${unlocked ? '#7da4ff' : '#212121'};display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                            게넥도
                            ${unlocked
                                ? '<span style="font-size:12px;background:#2756cc;color:white;border-radius:20px;padding:2px 8px;font-weight:800;">달성!</span>'
                                : '<span style="font-size:12px;color:#9e9e9e;">🔒 미달성</span>'}
                        </div>
                        <div style="font-size:13px;color:${unlocked ? '#5a80cc' : '#757575'};margin-top:3px;">
                            ${unlocked ? '당신은 명예의 게넥도 멤버입니다' : '알 수 없음'}
                        </div>
                    </div>
                </div>

                <div style="font-size:13px;color:${unlocked ? '#7da4ff' : '#555'};margin-bottom:8px;display:flex;justify-content:space-between;">
                    <span>진행도</span>
                    <span style="font-weight:700;color:${unlocked ? '#7da4ff' : '#424242'};">
                        ${unlocked ? '달성 완료 🎖️' : '?'}
                    </span>
                </div>
                <div style="background:#e0e0e0;border-radius:999px;height:10px;overflow:hidden;margin-bottom:6px;">
                    <div style="
                        width:${unlocked ? '100' : '0'}%;height:100%;
                        background:${unlocked ? 'linear-gradient(90deg,#1a3a8f,#6ea0ff)' : 'linear-gradient(90deg,#bdbdbd,#e0e0e0)'};
                        border-radius:999px;
                        transition:width .6s cubic-bezier(.4,0,.2,1);
                    "></div>
                </div>
                <div style="font-size:12px;color:${unlocked ? '#5a80cc' : '#9e9e9e'};text-align:right;">${unlocked ? '100%' : '0%'} 달성</div>

                ${unlocked ? `
                <div style="margin-top:14px;background:linear-gradient(135deg,#1a3a8f,#2756cc);color:white;
                    border-radius:10px;padding:10px 14px;font-size:13px;font-weight:700;text-align:center;">
                    🎉 축하합니다! 당신은 명예의 게넥도 멤버입니다!
                </div>` : `
                <div style="margin-top:14px;background:#f5f5f5;border-radius:10px;padding:10px 14px;font-size:12px;color:#757575;text-align:center;">
                    🎖️ 얻는 방법을 알 수 없습니다
                </div>`}
            </div>
        `;
    }

    // ─────────────────────────────────────────────────────────────────
    // 4-4. 🏹 화살표 장인 도전과제 카드 렌더링
    // 화살표 게임의 별도 Firebase DB에서 점수를 읽어옵니다.
    // ─────────────────────────────────────────────────────────────────

    const ARROW_GOAL = 50000;

    // 화살표 게임 최고점 조회 — 해정뉴스 DB의 arrowScores/{googleUid}/score 경로에서 읽음
    // (화살표 게임 index.html의 fbSaveBest가 신기록 시 이 경로에 동기화 저장함)
    async function fetchArrowScore() {
        const user = (typeof auth !== 'undefined') ? auth.currentUser : null;
        if (!user) return 0;

        const googleUid = resolveGoogleUid(user);
        if (!googleUid) return 0;

        try {
            const snap = await db.ref(`arrowScores/${googleUid}/score`).once('value');
            return parseInt(snap.val()) || 0;
        } catch(e) {
            console.warn('[화살표 장인] 점수 조회 실패:', e.message);
            return 0;
        }
    }

    async function renderArrowAchievementCard() {
        const slot = document.getElementById('_achArrowSlot');
        if (!slot) return;

        // 로딩 스켈레톤
        slot.innerHTML = `
            <div style="background:white;border:2px solid #e0e0e0;border-radius:16px;padding:20px;margin-bottom:16px;
                box-shadow:0 2px 12px rgba(0,0,0,0.07);">
                <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
                    <div style="width:56px;height:56px;background:#f5f5f5;border-radius:14px;flex-shrink:0;"></div>
                    <div style="flex:1;">
                        <div style="height:16px;background:#f0f0f0;border-radius:8px;width:60%;margin-bottom:8px;"></div>
                        <div style="height:12px;background:#f0f0f0;border-radius:8px;width:80%;"></div>
                    </div>
                </div>
                <div style="background:#e0e0e0;border-radius:999px;height:10px;overflow:hidden;">
                    <div style="width:0%;height:100%;background:#bdbdbd;border-radius:999px;"></div>
                </div>
            </div>`;

        const score    = await fetchArrowScore();
        const unlocked = score >= ARROW_GOAL;
        const percent  = Math.min(100, Math.floor((score / ARROW_GOAL) * 100));

        slot.innerHTML = `
            <div style="
                background: ${unlocked ? 'linear-gradient(135deg,#e8eaf6,#c5cae9)' : 'white'};
                border: 2px solid ${unlocked ? '#3949ab' : '#e0e0e0'};
                border-radius: 16px;
                padding: 20px;
                margin-bottom: 16px;
                box-shadow: ${unlocked ? '0 2px 18px rgba(57,73,171,0.25)' : '0 2px 12px rgba(0,0,0,0.07)'};
                position: relative;
                overflow: hidden;
            ">
                <span style="position:absolute;top:8px;left:12px;font-size:13px;opacity:0.13;transform:rotate(-20deg);pointer-events:none;">🏹</span>
                <span style="position:absolute;bottom:10px;right:16px;font-size:11px;opacity:0.11;transform:rotate(30deg);pointer-events:none;">🎯</span>

                <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">
                    <div style="
                        font-size:40px;width:56px;height:56px;
                        display:flex;align-items:center;justify-content:center;
                        background:${unlocked ? 'linear-gradient(135deg,#1a237e,#3949ab)' : '#f5f5f5'};
                        border-radius:14px;
                        filter:${unlocked ? 'none' : 'grayscale(0.4)'};
                        box-shadow:${unlocked ? '0 3px 14px rgba(57,73,171,0.45)' : 'none'};
                        flex-shrink:0;
                    ">🏹</div>
                    <div style="flex:1;">
                        <div style="font-size:17px;font-weight:800;color:${unlocked ? '#1a237e' : '#212121'};display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                            화살표 장인
                            ${unlocked
                                ? '<span style="font-size:12px;background:#3949ab;color:white;border-radius:20px;padding:2px 8px;font-weight:800;">달성!</span>'
                                : '<span style="font-size:12px;color:#9e9e9e;">🔒 미달성</span>'}
                        </div>
                        <div style="font-size:13px;color:${unlocked ? '#5c6bc0' : '#757575'};margin-top:3px;">
                            화살표 게임에서 50000점 달성하기!
                        </div>
                    </div>
                </div>

                <div style="font-size:13px;color:${unlocked ? '#3949ab' : '#555'};margin-bottom:8px;display:flex;justify-content:space-between;">
                    <span>진행도</span>
                    <span style="font-weight:700;color:${unlocked ? '#1a237e' : '#424242'};">
                        ${score.toLocaleString()} / ${ARROW_GOAL.toLocaleString()}${unlocked ? ' 🏹' : ''}
                    </span>
                </div>
                <div style="background:#e0e0e0;border-radius:999px;height:10px;overflow:hidden;margin-bottom:6px;">
                    <div style="
                        width:${percent}%;height:100%;
                        background:${unlocked
                            ? 'linear-gradient(90deg,#1a237e,#5c6bc0)'
                            : 'linear-gradient(90deg,#1565c0,#42a5f5)'};
                        border-radius:999px;
                        transition:width .6s cubic-bezier(.4,0,.2,1);
                    "></div>
                </div>
                <div style="font-size:12px;color:${unlocked ? '#5c6bc0' : '#9e9e9e'};text-align:right;">${percent}% 달성</div>

                ${unlocked ? `
                <div style="margin-top:14px;background:linear-gradient(135deg,#1a237e,#3949ab);color:white;
                    border-radius:10px;padding:10px 14px;font-size:13px;font-weight:700;text-align:center;">
                    🎉 축하합니다! 화살표 장인 달성 완료!
                </div>` : `
                <div style="margin-top:14px;background:#f5f5f5;border-radius:10px;padding:10px 14px;font-size:12px;color:#757575;text-align:center;">
                    <a href="https://fff376327yhed.github.io/arrow-game/" target="_blank" rel="noopener"
                       style="color:#1565c0;font-weight:700;text-decoration:none;">
                       🏹 화살표 게임하러가기
                    </a>
                    <span style="margin-left:6px;">에서 50000점을 달성해보세요!</span>
                </div>`}
            </div>
        `;

        // 달성 시 칭호 해금 콜백
        if (unlocked) {
            if (typeof window.onArrowMasterAchieved === 'function') {
                window.onArrowMasterAchieved();
            } else {
                setTimeout(() => {
                    if (typeof window.onArrowMasterAchieved === 'function') {
                        window.onArrowMasterAchieved();
                    }
                }, 1500);
            }
        }
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

        // ── 관리자 도전과제 설정 UI 주입 ──────────────────────────────
        injectAdminAchievementUI();
    });

    // ═════════════════════════════════════════════════════════════════
    // ✨ 신규: 기사 열람 시 연동 도전과제 달성 처리
    // ═════════════════════════════════════════════════════════════════

    /**
     * 기사 데이터에 linkedAchievement 필드가 있으면 해당 도전과제를 달성 처리합니다.
     * showArticleDetail 호출 후 기사 데이터가 로드됐을 때 실행됩니다.
     * @param {string} articleId - 기사 ID
     * @param {string|null} linkedAchievement - 기사에 연결된 도전과제 이름 (예: "게넥도")
     */
    window._checkArticleAchievement = async function(articleId, linkedAchievement) {
        if (!linkedAchievement) return;
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) return;

        const achName = linkedAchievement.trim();
        console.log(`[도전과제🔍] 기사 열람 감지 — linkedAchievement: "${achName}"`);

        // 도전과제 이름별 달성 처리
        if (achName === '게넥도') {
            // 이미 달성했으면 스킵
            if (localStorage.getItem('gaenekdo_member_unlocked') === '1') return;
            console.log('[도전과제🎖️] 게넥도 도전과제 달성!');
            localStorage.setItem('gaenekdo_member_unlocked', '1');
            if (typeof window.onGaenekdoMemberAchieved === 'function') {
                window.onGaenekdoMemberAchieved();
            } else {
                setTimeout(() => {
                    if (typeof window.onGaenekdoMemberAchieved === 'function') {
                        window.onGaenekdoMemberAchieved();
                    }
                }, 1000);
            }
        } else {
            // 그 외 커스텀 도전과제 — Firebase에서 매핑 조회 후 처리
            try {
                const snap = await db.ref('achievementMap').once('value');
                const map = snap.val() || {};
                // map: { "도전과제이름": "titleId" } 형태
                const titleId = map[achName];
                if (titleId) {
                    const uid = (typeof getUserId === 'function') ? getUserId() : null;
                    if (!uid) return;
                    const already = await db.ref(`users/${uid}/unlockedTitles/${titleId}`).once('value');
                    if (already.val()) return;
                    await db.ref(`users/${uid}/unlockedTitles/${titleId}`).set(true);
                    if (typeof window.showTitleUnlockModal === 'function') {
                        window.showTitleUnlockModal(titleId);
                    }
                }
            } catch(e) {
                console.warn('[도전과제] 커스텀 달성 처리 오류:', e);
            }
        }
    };

    // ── showArticleDetail 훅 — 기사 로드 후 linkedAchievement 체크 ──
    (function hookShowArticleDetail() {
        // script.js 로드 완료 후 훅 적용
        function _applyHook() {
            if (typeof window.showArticleDetail !== 'function') {
                setTimeout(_applyHook, 300);
                return;
            }
            // 이미 훅이 적용됐으면 스킵
            if (window.showArticleDetail._achHooked) return;

            const _origDetail = window.showArticleDetail;
            window.showArticleDetail = async function(id) {
                const result = await _origDetail.call(this, id);
                // 기사 데이터에서 linkedAchievement 읽기
                try {
                    if (typeof db !== 'undefined' && id) {
                        const snap = await db.ref(`articles/${id}/linkedAchievement`).once('value');
                        const linked = snap.val();
                        if (linked) {
                            // 기사를 3초 이상 열람한 경우에만 달성 (UX)
                            setTimeout(() => {
                                window._checkArticleAchievement(id, linked);
                            }, 3000);
                        }
                    }
                } catch(e) {
                    console.warn('[도전과제] linkedAchievement 읽기 오류:', e);
                }
                return result;
            };
            window.showArticleDetail._achHooked = true;
            console.log('[도전과제✅] showArticleDetail 훅 적용 완료');
        }
        _applyHook();
    })();

    // ═════════════════════════════════════════════════════════════════
    // ✨ 신규: 관리자 — 기사 작성/수정 폼에 도전과제 연결 UI 주입
    // ═════════════════════════════════════════════════════════════════

    /**
     * 관리자일 때 기사 작성/수정 폼 하단(⚙️ 기사 설정 박스 위)에
     * "이 기사를 읽으면 달성되는 도전과제" 입력 필드를 삽입합니다.
     */
    function injectAdminAchievementUI() {
        // 관리자 여부 확인 (auth 로드 대기)
        function _tryInject() {
            if (typeof isAdmin !== 'function' || typeof auth === 'undefined') {
                setTimeout(_tryInject, 500);
                return;
            }
            if (!auth.currentUser) {
                // 로그인 상태 변경을 감지해서 재시도
                auth.onAuthStateChanged(user => { if (user) _doInject(); });
                return;
            }
            _doInject();
        }

        function _doInject() {
            if (!isAdmin()) return;
            // 이미 주입됐으면 스킵
            if (document.getElementById('_adminAchLinkBox')) return;

            const settingsBox = document.querySelector('#writeSection #articleForm > div[style*="background:#f8f9fa"]');
            if (!settingsBox) {
                // 아직 DOM이 없으면 재시도
                setTimeout(_doInject, 500);
                return;
            }

            const box = document.createElement('div');
            box.id = '_adminAchLinkBox';
            box.style.cssText = 'background:#f0f4ff; border:1px solid #c7d7f7; border-radius:10px; padding:14px 16px; margin-bottom:14px;';
            box.innerHTML = `
                <div style="font-size:13px; font-weight:700; color:#1a3a8f; margin-bottom:10px;">
                    🏆 관리자 — 도전과제 연결
                </div>
                <div style="font-size:12px; color:#5a6e9a; margin-bottom:10px; line-height:1.6;">
                    아래에 도전과제 이름을 입력하면, 이 기사를 읽는 유저에게 해당 도전과제가 달성됩니다.<br>
                    <b>정확한 이름</b>을 입력하세요 (예: <code>게넥도</code>). 비워두면 연결 없음.
                </div>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                    <input id="_adminAchLinkInput"
                        placeholder="도전과제 이름 (예: 게넥도)"
                        style="flex:1; min-width:160px; padding:9px 12px; border:1.5px solid #c7d7f7;
                               border-radius:8px; font-size:13px; font-family:inherit; outline:none;"
                        list="_adminAchLinkDatalist">
                    <datalist id="_adminAchLinkDatalist">
                        <option value="게넥도">
                    </datalist>
                    <button type="button" onclick="window._adminAchPreviewName()"
                        style="padding:9px 14px; background:#1a3a8f; color:white; border:none;
                               border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap;">
                        확인
                    </button>
                </div>
                <div id="_adminAchLinkPreview" style="margin-top:8px; font-size:12px; color:#1a3a8f; min-height:18px;"></div>
            `;
            settingsBox.parentNode.insertBefore(box, settingsBox);

            // 미리보기 함수
            window._adminAchPreviewName = function() {
                const val = (document.getElementById('_adminAchLinkInput')?.value || '').trim();
                const preview = document.getElementById('_adminAchLinkPreview');
                if (!preview) return;
                if (!val) {
                    preview.textContent = '비어있음 — 도전과제 연결 없음';
                    preview.style.color = '#aaa';
                } else {
                    preview.innerHTML = `✅ "<b>${val}</b>" 도전과제가 연결됩니다`;
                    preview.style.color = '#1a3a8f';
                }
            };

            console.log('[도전과제✅] 관리자 도전과제 연결 UI 주입 완료');
        }

        _tryInject();
    }

    /**
     * 기사 저장 직전에 linkedAchievement 값을 article 객체에 주입합니다.
     * script.js의 saveArticle 호출 직전에 article 객체를 가로채는 방식으로 동작합니다.
     * → saveArticle 함수를 훅(래핑)하여 처리합니다.
     */
    (function hookSaveArticle() {
        function _applyHook() {
            if (typeof window.saveArticle !== 'function') {
                setTimeout(_applyHook, 400);
                return;
            }
            if (window.saveArticle._achHooked) return;

            const _origSave = window.saveArticle;
            window.saveArticle = function(article, callback) {
                // 관리자이고 입력값이 있으면 linkedAchievement 추가
                if (typeof isAdmin === 'function' && isAdmin()) {
                    const input = document.getElementById('_adminAchLinkInput');
                    if (input) {
                        const achName = input.value.trim();
                        if (achName) {
                            article.linkedAchievement = achName;
                            console.log(`[도전과제💾] linkedAchievement 저장: "${achName}"`);
                        } else {
                            // 비워두면 기존 연결 제거
                            delete article.linkedAchievement;
                        }
                    }
                }
                return _origSave.call(this, article, callback);
            };
            window.saveArticle._achHooked = true;
            console.log('[도전과제✅] saveArticle 훅 적용 완료');
        }
        _applyHook();
    })();

    /**
     * 기사 수정 시 기존 linkedAchievement 값을 폼에 채워줍니다.
     * showArticleDetail 안의 editArticle 버튼 클릭 시 동작합니다.
     */
    (function hookEditArticle() {
        // editArticle 이벤트를 window에서 감지
        // script.js가 editArticle 폼을 주입할 때 _adminAchLinkInput도 있으면 자동으로 값이 채워짐
        // → MutationObserver로 수정 폼 감지 후 기존 값 채우기

        const observer = new MutationObserver(function(mutations) {
            for (const mut of mutations) {
                for (const node of mut.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    // 수정 폼 내 _adminAchLinkBox가 추가됐는지 확인
                    if (node.id === '_adminAchLinkBox' || node.querySelector?.('#_adminAchLinkBox')) {
                        // 현재 보고 있는 기사의 linkedAchievement 가져오기
                        _fillEditFormAchievement();
                    }
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        async function _fillEditFormAchievement() {
            // 현재 열람 중인 기사 ID 찾기
            const articleId = window.currentArticleId
                || new URLSearchParams(location.search).get('id');
            if (!articleId) return;

            const input = document.getElementById('_adminAchLinkInput');
            if (!input || input.value) return; // 이미 값이 있으면 스킵

            try {
                const snap = await db.ref(`articles/${articleId}/linkedAchievement`).once('value');
                const val = snap.val() || '';
                input.value = val;
                if (val && typeof window._adminAchPreviewName === 'function') {
                    window._adminAchPreviewName();
                }
            } catch(e) {
                console.warn('[도전과제] 수정 폼 기존값 채우기 오류:', e);
            }
        }
    })();

})();
