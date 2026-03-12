// ===== 카카오톡형 투표 기능 =====
// IIFE로 전역 스코프 오염 방지
(function () {
'use strict';
console.log('🗳️ vote.js 로드 중...');

// ===== CSS 주입 =====
(function injectVoteCSS() {
    if (document.getElementById('_voteSectionStyle')) return;
    const s = document.createElement('style');
    s.id = '_voteSectionStyle';
    s.textContent = `
        #voteSection { display: none !important; }
        #voteSection.active {
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            padding: 0 !important;
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            right: 0 !important; bottom: 0 !important;
            z-index: 1000 !important;
            background: #f2f3f6 !important;
        }
        .vote-card {
            background: white;
            border-radius: 16px;
            padding: 18px 20px;
            margin-bottom: 12px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.08);
            cursor: pointer;
            transition: transform 0.12s, box-shadow 0.12s;
        }
        .vote-card:active { transform: scale(0.98); box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
        .vote-badge {
            display: inline-flex; align-items: center;
            padding: 3px 10px; border-radius: 20px;
            font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
        }
        .vote-badge.active  { background: #e8f5e9; color: #2e7d32; }
        .vote-badge.closed  { background: #eeeeee; color: #757575; }
        .vote-badge.voted   { background: #e3f2fd; color: #1565c0; }
        .vote-option-btn {
            width: 100%; padding: 14px 16px;
            border: 1.5px solid #e0e0e0;
            border-radius: 12px; background: white;
            text-align: left; cursor: pointer;
            font-size: 14px; color: #212121;
            display: flex; align-items: center; gap: 10px;
            margin-bottom: 8px; transition: border-color 0.15s, background 0.15s;
        }
        .vote-option-btn:hover { border-color: #ffcd00; background: #fffde7; }
        .vote-option-btn.selected {
            border-color: #ffcd00; background: #fff9c4;
            font-weight: 600;
        }
        .vote-option-btn .vote-checkbox {
            width: 20px; height: 20px; border-radius: 50%;
            border: 2px solid #bdbdbd; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.15s;
        }
        .vote-option-btn.selected .vote-checkbox {
            background: #ffcd00; border-color: #ffcd00;
        }
        .vote-result-bar-wrap {
            position: relative; height: 38px; border-radius: 10px;
            background: #f5f5f5; overflow: hidden; margin-bottom: 8px;
        }
        .vote-result-bar {
            position: absolute; left: 0; top: 0; bottom: 0;
            background: #fff9c4; border-radius: 10px;
            transition: width 0.6s cubic-bezier(.25,.8,.25,1);
        }
        .vote-result-bar.mine { background: #ffcd00; }
        .vote-result-label {
            position: absolute; left: 14px; top: 50%;
            transform: translateY(-50%);
            font-size: 13px; color: #212121; font-weight: 500;
            white-space: nowrap; overflow: hidden;
            text-overflow: ellipsis; max-width: 60%;
            z-index: 1;
        }
        .vote-result-pct {
            position: absolute; right: 12px; top: 50%;
            transform: translateY(-50%);
            font-size: 12px; font-weight: 700; color: #424242; z-index: 1;
        }
        .vote-fab {
            position: fixed; bottom: 80px; right: 20px;
            width: 56px; height: 56px; border-radius: 28px;
            background: #ffcd00; color: #212121;
            border: none; font-size: 24px; cursor: pointer;
            box-shadow: 0 4px 14px rgba(255,205,0,0.5);
            display: flex; align-items: center; justify-content: center;
            z-index: 1001; transition: transform 0.15s, box-shadow 0.15s;
        }
        .vote-fab:active { transform: scale(0.93); box-shadow: 0 2px 8px rgba(255,205,0,0.4); }
        .vote-input {
            width: 100%; padding: 12px 14px; border: 1.5px solid #e0e0e0;
            border-radius: 10px; font-size: 14px; box-sizing: border-box;
            transition: border-color 0.15s; outline: none;
            font-family: inherit; background: white;
        }
        .vote-input:focus { border-color: #ffcd00; }
        .vote-toggle-row {
            display: flex; align-items: center; justify-content: space-between;
            padding: 12px 0; border-bottom: 1px solid #f0f0f0;
        }
        .vote-toggle {
            position: relative; width: 46px; height: 26px;
            background: #e0e0e0; border-radius: 13px;
            cursor: pointer; transition: background 0.2s; flex-shrink: 0;
        }
        .vote-toggle.on { background: #ffcd00; }
        .vote-toggle::after {
            content: ''; position: absolute;
            width: 20px; height: 20px; border-radius: 50%;
            background: white; top: 3px; left: 3px;
            transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .vote-toggle.on::after { left: 23px; }
        .vote-submit-btn {
            width: 100%; padding: 15px;
            background: #ffcd00; color: #212121;
            border: none; border-radius: 12px;
            font-size: 16px; font-weight: 700; cursor: pointer;
            transition: opacity 0.15s;
        }
        .vote-submit-btn:active { opacity: 0.8; }
        .vote-submit-btn:disabled { background: #e0e0e0; color: #9e9e9e; cursor: not-allowed; }
    `;
    document.head.appendChild(s);
})();

// ===== Firebase 참조 (메인 db 사용) =====
function pollRef(path) { return db.ref(`polls/${path}`); }

// ===== 투표 섹션 보이기 =====
window.showVotePage = async function () {
    document.querySelectorAll('.page-section').forEach(sec => { sec.style.cssText = ''; });
    hideAll();
    window.scrollTo(0, 0);

    let section = document.getElementById('voteSection');
    if (!section) {
        section = document.createElement('section');
        section.id = 'voteSection';
        section.className = 'page-section';
        (document.querySelector('main') || document.body).appendChild(section);
    }
    section.classList.add('active');

    updateURL('vote');
    renderVoteListPage(section);
};

// ===== 투표 목록 페이지 =====
async function renderVoteListPage(section) {
    section.innerHTML = `
        <div style="max-width:600px;width:100%;margin:0 auto;
            display:flex;flex-direction:column;height:100%;background:#f2f3f6;">

            <!-- 헤더 -->
            <div style="background:white;padding:14px 20px 12px;display:flex;
                align-items:center;justify-content:space-between;flex-shrink:0;
                border-bottom:1px solid #e8e8e8;position:sticky;top:0;z-index:10;">
                <button onclick="showMoreMenu()"
                    style="background:none;border:none;color:#212121;width:40px;height:40px;
                    border-radius:50%;cursor:pointer;font-size:18px;display:flex;
                    align-items:center;justify-content:center;">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2 style="margin:0;font-size:18px;font-weight:800;color:#212121;">투표</h2>
                <div style="width:40px;"></div>
            </div>

            <!-- 탭 -->
            <div style="background:white;display:flex;border-bottom:2px solid #f0f0f0;flex-shrink:0;">
                <button id="voteTabAll" onclick="switchVoteTab('all')"
                    style="flex:1;padding:13px 0;border:none;background:none;font-size:14px;
                    font-weight:700;color:#212121;border-bottom:2px solid #ffcd00;cursor:pointer;">
                    전체
                </button>
                <button id="voteTabMine" onclick="switchVoteTab('mine')"
                    style="flex:1;padding:13px 0;border:none;background:none;font-size:14px;
                    font-weight:600;color:#9e9e9e;cursor:pointer;">
                    내 투표
                </button>
                <button id="voteTabParticipated" onclick="switchVoteTab('participated')"
                    style="flex:1;padding:13px 0;border:none;background:none;font-size:14px;
                    font-weight:600;color:#9e9e9e;cursor:pointer;">
                    참여한 투표
                </button>
            </div>

            <!-- 목록 -->
            <div id="voteListBody" style="overflow-y:auto;flex:1;padding:16px;">
                <div style="text-align:center;padding:60px 20px;color:#9e9e9e;">
                    <div style="font-size:32px;margin-bottom:12px;">🗳️</div>
                    <div style="font-size:14px;">투표를 불러오는 중...</div>
                </div>
            </div>
        </div>

        <!-- FAB 투표 만들기 버튼 -->
        ${isLoggedIn() ? `
        <button class="vote-fab" onclick="showCreateVotePage()"
            title="투표 만들기" style="bottom:80px;">
            <i class="fas fa-plus"></i>
        </button>` : ''}
    `;

    await loadVoteList('all');
}

// ===== 탭 전환 =====
window.switchVoteTab = async function(tab) {
    ['all','mine','participated'].forEach(t => {
        const btn = document.getElementById(`voteTab${t.charAt(0).toUpperCase()+t.slice(1)}`);
        if (!btn) return;
        if (t === tab) {
            btn.style.color = '#212121'; btn.style.fontWeight = '700';
            btn.style.borderBottom = '2px solid #ffcd00';
        } else {
            btn.style.color = '#9e9e9e'; btn.style.fontWeight = '600';
            btn.style.borderBottom = 'none';
        }
    });
    await loadVoteList(tab);
};

// ===== 투표 목록 로드 =====
async function loadVoteList(tab) {
    const body = document.getElementById('voteListBody');
    if (!body) return;
    body.innerHTML = `<div style="text-align:center;padding:60px 0;color:#9e9e9e;font-size:13px;">불러오는 중...</div>`;

    try {
        const snap = await db.ref('polls').orderByChild('createdAt').once('value');
        const data = snap.val() || {};
        let votes = Object.entries(data).map(([id, v]) => ({ id, ...v }))
            .sort((a, b) => b.createdAt - a.createdAt);

        const myUid = auth.currentUser?.uid || null;

        // 탭 필터
        if (tab === 'mine') {
            votes = votes.filter(v => v.createdBy === myUid);
        } else if (tab === 'participated') {
            votes = votes.filter(v => v.responses && myUid && v.responses[myUid]);
        }

        if (!votes.length) {
            body.innerHTML = `
                <div style="text-align:center;padding:60px 20px;color:#9e9e9e;">
                    <div style="font-size:40px;margin-bottom:12px;">🗳️</div>
                    <div style="font-size:14px;font-weight:600;">투표가 없습니다</div>
                    <div style="font-size:12px;margin-top:6px;">
                        ${isLoggedIn() ? '아래 + 버튼으로 투표를 만들어보세요!' : '로그인하면 투표를 만들 수 있어요.'}
                    </div>
                </div>`;
            return;
        }

        body.innerHTML = votes.map(v => renderVoteCard(v, myUid)).join('');

    } catch(e) {
        body.innerHTML = `<div style="text-align:center;padding:40px;color:#e53935;font-size:13px;">오류가 발생했습니다.<br>${e.message}</div>`;
    }
}

// ===== 투표 카드 HTML =====
function renderVoteCard(v, myUid) {
    const now = Date.now();
    const isClosed = v.closed || (v.deadline && v.deadline < now);
    const hasVoted = myUid && v.responses && v.responses[myUid];
    const totalVotes = v.responses ? Object.keys(v.responses).length : 0;

    let badge = '';
    if (isClosed) badge = `<span class="vote-badge closed">종료</span>`;
    else if (hasVoted) badge = `<span class="vote-badge voted">참여완료</span>`;
    else badge = `<span class="vote-badge active">진행중</span>`;

    const optionPreview = v.options ? v.options.slice(0,3).map(o =>
        `<span style="font-size:12px;color:#616161;background:#f5f5f5;
            padding:3px 8px;border-radius:8px;margin-right:4px;">${escapeHtml(o.text)}</span>`
    ).join('') + (v.options.length > 3 ? `<span style="font-size:12px;color:#9e9e9e;">+${v.options.length-3}개</span>` : '') : '';

    const deadlineText = v.deadline
        ? (v.deadline < now ? '마감됨' : `${formatVoteDeadline(v.deadline)} 마감`)
        : '기간 무제한';

    const metaText = `
        ${v.isAnonymous ? '<span style="color:#9e9e9e;font-size:11px;">익명</span>' : ''}
        ${v.isMultiple ? '<span style="color:#9e9e9e;font-size:11px;margin-left:4px;">복수선택</span>' : ''}
    `;

    return `
        <div class="vote-card" onclick="showVoteDetail('${v.id}')">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:10px;">
                <div style="font-size:15px;font-weight:700;color:#212121;line-height:1.4;flex:1;">
                    ${escapeHtml(v.title)}
                </div>
                ${badge}
            </div>
            <div style="margin-bottom:10px;display:flex;flex-wrap:wrap;gap:4px;">${optionPreview}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#9e9e9e;">
                <span>👥 ${totalVotes}명 참여 · ${deadlineText}</span>
                <span>${metaText}</span>
            </div>
        </div>
    `;
}

// ===== 투표 상세 페이지 =====
window.showVoteDetail = async function(voteId) {
    const section = document.getElementById('voteSection');
    if (!section) return;

    section.innerHTML = `
        <div style="max-width:600px;width:100%;margin:0 auto;
            display:flex;flex-direction:column;height:100%;background:#f2f3f6;">
            <div style="background:white;padding:14px 20px 12px;display:flex;
                align-items:center;justify-content:space-between;flex-shrink:0;
                border-bottom:1px solid #e8e8e8;">
                <button onclick="showVotePage()"
                    style="background:none;border:none;color:#212121;width:40px;height:40px;
                    border-radius:50%;cursor:pointer;font-size:18px;display:flex;
                    align-items:center;justify-content:center;">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2 style="margin:0;font-size:18px;font-weight:800;color:#212121;">투표</h2>
                <div id="voteDetailMenu" style="width:40px;"></div>
            </div>
            <div id="voteDetailBody" style="overflow-y:auto;flex:1;padding:16px;">
                <div style="text-align:center;padding:60px 0;color:#9e9e9e;font-size:13px;">불러오는 중...</div>
            </div>
        </div>
    `;

    try {
        const snap = await db.ref(`polls/${voteId}`).once('value');
        const v = snap.val();
        if (!v) { showVoteToast('투표를 찾을 수 없습니다.'); showVotePage(); return; }
        renderVoteDetail(voteId, v);
    } catch(e) {
        const body = document.getElementById('voteDetailBody');
        if (body) body.innerHTML = `<div style="color:#e53935;text-align:center;padding:40px;">오류: ${e.message}</div>`;
    }
};

// ===== 투표 상세 렌더링 =====
function renderVoteDetail(voteId, v) {
    const body = document.getElementById('voteDetailBody');
    const menuBtn = document.getElementById('voteDetailMenu');
    if (!body) return;

    const now = Date.now();
    const myUid = auth.currentUser?.uid || null;
    const isClosed = v.closed || (v.deadline && v.deadline < now);
    const myResponse = myUid && v.responses ? v.responses[myUid] : null;
    const hasVoted = !!myResponse;
    const totalVoters = v.responses ? Object.keys(v.responses).length : 0;
    const isOwner = myUid && v.createdBy === myUid;

    // 관리 버튼 (작성자/관리자)
    if ((isOwner || isAdmin()) && menuBtn) {
        menuBtn.innerHTML = `
            <button onclick="showVoteOptions('${voteId}')"
                style="background:none;border:none;color:#212121;width:40px;height:40px;
                border-radius:50%;cursor:pointer;font-size:18px;display:flex;
                align-items:center;justify-content:center;">
                <i class="fas fa-ellipsis-v"></i>
            </button>
        `;
    }

    // 옵션별 득표수 계산
    const optionCounts = {};
    if (v.options) v.options.forEach(o => { optionCounts[o.id] = 0; });
    if (v.responses) {
        Object.values(v.responses).forEach(r => {
            (r.options || []).forEach(oid => {
                if (optionCounts[oid] !== undefined) optionCounts[oid]++;
            });
        });
    }
    const myOptions = new Set(myResponse?.options || []);

    // 결과 보기 여부: 이미 투표했거나, 종료됐거나, 작성자이거나
    const showResults = hasVoted || isClosed || isOwner;

    const deadlineText = v.deadline
        ? (isClosed ? `마감 (${new Date(v.deadline).toLocaleDateString('ko-KR')})` : `${formatVoteDeadline(v.deadline)} 마감`)
        : '기간 무제한';

    body.innerHTML = `
        <!-- 투표 정보 카드 -->
        <div style="background:white;border-radius:16px;padding:20px;margin-bottom:12px;
            box-shadow:0 1px 4px rgba(0,0,0,0.08);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                ${isClosed
                    ? '<span class="vote-badge closed">종료된 투표</span>'
                    : '<span class="vote-badge active">진행중인 투표</span>'}
                ${v.isAnonymous ? '<span style="font-size:11px;color:#9e9e9e;background:#f5f5f5;padding:3px 8px;border-radius:8px;">익명</span>' : ''}
                ${v.isMultiple ? '<span style="font-size:11px;color:#9e9e9e;background:#f5f5f5;padding:3px 8px;border-radius:8px;">복수선택</span>' : ''}
            </div>
            <div style="font-size:18px;font-weight:800;color:#212121;line-height:1.4;margin-bottom:14px;">
                ${escapeHtml(v.title)}
            </div>
            <div style="font-size:12px;color:#9e9e9e;display:flex;gap:16px;">
                <span>👤 ${escapeHtml(v.createdByName || '알 수 없음')}</span>
                <span>👥 ${totalVoters}명 참여</span>
                <span>⏰ ${deadlineText}</span>
            </div>
        </div>

        <!-- 옵션 카드 -->
        <div style="background:white;border-radius:16px;padding:20px;margin-bottom:12px;
            box-shadow:0 1px 4px rgba(0,0,0,0.08);">

            ${showResults ? renderVoteResults(v.options, optionCounts, myOptions, totalVoters) : renderVoteOptions(v.options, v.isMultiple)}

            ${!isClosed && !hasVoted && isLoggedIn() ? `
            <button class="vote-submit-btn" id="voteSubmitBtn"
                onclick="submitVote('${voteId}', ${v.isMultiple})"
                style="margin-top:16px;" disabled>
                투표하기
            </button>` : ''}

            ${!isLoggedIn() && !isClosed ? `
            <div style="text-align:center;padding:14px;color:#9e9e9e;font-size:13px;margin-top:8px;">
                <i class="fas fa-lock" style="margin-right:6px;"></i>로그인 후 투표할 수 있어요.
            </div>` : ''}

            ${hasVoted && !isClosed ? `
            <button onclick="retractVote('${voteId}')"
                style="width:100%;padding:11px;background:none;border:1.5px solid #e0e0e0;
                border-radius:12px;font-size:13px;color:#757575;cursor:pointer;margin-top:10px;
                font-family:inherit;">
                투표 취소하기
            </button>` : ''}
        </div>

        ${!v.isAnonymous && v.responses && Object.keys(v.responses).length > 0 ? renderVoterList(v) : ''}
    `;

    updateVoteSubmitState(v.isMultiple);
}

// ===== 옵션 선택 UI (투표 전) =====
function renderVoteOptions(options, isMultiple) {
    if (!options || !options.length) return '<div style="color:#9e9e9e;text-align:center;">옵션 없음</div>';
    return options.map(o => `
        <button class="vote-option-btn" id="voteOpt_${o.id}"
            onclick="toggleVoteOption('${o.id}', ${isMultiple})">
            <span class="vote-checkbox">
                <i class="fas fa-check" style="font-size:10px;color:white;display:none;"
                   id="voteOptCheck_${o.id}"></i>
            </span>
            <span>${escapeHtml(o.text)}</span>
        </button>
    `).join('');
}

// ===== 결과 막대 UI =====
function renderVoteResults(options, counts, myOptions, total) {
    if (!options || !options.length) return '';
    return options.map(o => {
        const cnt = counts[o.id] || 0;
        const pct = total > 0 ? Math.round(cnt / total * 100) : 0;
        const isMine = myOptions.has(o.id);
        return `
            <div class="vote-result-bar-wrap" style="height:46px;margin-bottom:8px;">
                <div class="vote-result-bar ${isMine ? 'mine' : ''}"
                    style="width:${pct}%;"></div>
                <div class="vote-result-label">
                    ${isMine ? '<i class="fas fa-check-circle" style="color:#e65100;font-size:12px;margin-right:4px;"></i>' : ''}
                    ${escapeHtml(o.text)}
                </div>
                <div class="vote-result-pct">${pct}% <span style="color:#bdbdbd;font-weight:400;">(${cnt}명)</span></div>
            </div>
        `;
    }).join('');
}

// ===== 참여자 목록 (비익명) =====
function renderVoterList(v) {
    const voters = Object.entries(v.responses || {});
    if (!voters.length) return '';
    return `
        <div style="background:white;border-radius:16px;padding:20px;
            box-shadow:0 1px 4px rgba(0,0,0,0.08);">
            <div style="font-size:13px;font-weight:700;color:#424242;margin-bottom:12px;">
                참여자 목록 (${voters.length}명)
            </div>
            ${voters.map(([uid, r]) => `
                <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:8px 0;border-bottom:1px solid #f5f5f5;font-size:13px;">
                    <span style="color:#212121;font-weight:500;">${escapeHtml(r.name || '알 수 없음')}</span>
                    <span style="color:#9e9e9e;font-size:11px;">${new Date(r.votedAt).toLocaleDateString('ko-KR')}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== 옵션 선택 토글 =====
window.toggleVoteOption = function(optId, isMultiple) {
    const btn = document.getElementById(`voteOpt_${optId}`);
    const check = document.getElementById(`voteOptCheck_${optId}`);
    if (!btn) return;

    if (!isMultiple) {
        // 단일 선택: 기존 선택 해제
        document.querySelectorAll('.vote-option-btn.selected').forEach(b => {
            b.classList.remove('selected');
            const c = b.querySelector('[id^="voteOptCheck_"]');
            if (c) c.style.display = 'none';
        });
    }

    const isNowSelected = !btn.classList.contains('selected');
    btn.classList.toggle('selected', isNowSelected);
    if (check) check.style.display = isNowSelected ? 'block' : 'none';

    updateVoteSubmitState(isMultiple);
};

function updateVoteSubmitState(isMultiple) {
    const btn = document.getElementById('voteSubmitBtn');
    if (!btn) return;
    const selected = document.querySelectorAll('.vote-option-btn.selected').length;
    btn.disabled = selected === 0;
}

// ===== 투표 제출 =====
window.submitVote = async function(voteId, isMultiple) {
    if (!isLoggedIn()) { alert('로그인이 필요합니다!'); return; }

    const selected = [...document.querySelectorAll('.vote-option-btn.selected')]
        .map(b => b.id.replace('voteOpt_', ''));
    if (!selected.length) { showVoteToast('옵션을 선택해주세요.'); return; }

    const btn = document.getElementById('voteSubmitBtn');
    if (btn) { btn.disabled = true; btn.textContent = '투표 중...'; }

    try {
        const myUid = auth.currentUser.uid;
        const myName = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || '알 수 없음';

        await db.ref(`polls/${voteId}/responses/${myUid}`).set({
            options: selected,
            name: myName,
            votedAt: Date.now()
        });

        showVoteToast('✅ 투표가 완료됐어요!');
        await showVoteDetail(voteId);
    } catch(e) {
        showVoteToast('오류가 발생했습니다: ' + e.message);
        if (btn) { btn.disabled = false; btn.textContent = '투표하기'; }
    }
};

// ===== 투표 취소 =====
window.retractVote = async function(voteId) {
    if (!confirm('투표를 취소하시겠어요?')) return;
    try {
        const myUid = auth.currentUser?.uid;
        if (!myUid) return;
        await db.ref(`polls/${voteId}/responses/${myUid}`).remove();
        showVoteToast('투표가 취소됐어요.');
        await showVoteDetail(voteId);
    } catch(e) {
        showVoteToast('오류: ' + e.message);
    }
};

// ===== 투표 관리 메뉴 =====
window.showVoteOptions = function(voteId) {
    const myUid = auth.currentUser?.uid;
    const modal = document.createElement('div');
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.4);
        z-index:9999;display:flex;align-items:flex-end;justify-content:center;`;
    modal.innerHTML = `
        <div style="background:white;width:100%;max-width:600px;border-radius:20px 20px 0 0;
            padding:20px 0 30px;animation:slideUp 0.2s ease;">
            <div style="width:36px;height:4px;background:#e0e0e0;border-radius:2px;
                margin:0 auto 20px;"></div>
            <button onclick="closeVoteModal(this); closeVote('${voteId}')"
                style="width:100%;padding:15px 20px;border:none;background:none;
                font-size:15px;text-align:left;cursor:pointer;color:#212121;">
                🔒 투표 종료하기
            </button>
            <button onclick="closeVoteModal(this); deleteVote('${voteId}')"
                style="width:100%;padding:15px 20px;border:none;background:none;
                font-size:15px;text-align:left;cursor:pointer;color:#e53935;">
                🗑️ 투표 삭제하기
            </button>
            <button onclick="closeVoteModal(this)"
                style="width:100%;padding:15px 20px;border:none;background:none;
                font-size:15px;text-align:left;cursor:pointer;color:#9e9e9e;">
                취소
            </button>
        </div>
    `;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
};
window.closeVoteModal = btn => btn.closest('[style*="inset:0"]')?.remove();

window.closeVote = async function(voteId) {
    if (!confirm('투표를 종료하면 더 이상 참여할 수 없어요. 종료할까요?')) return;
    try {
        await db.ref(`polls/${voteId}/closed`).set(true);
        showVoteToast('투표가 종료됐어요.');
        await showVoteDetail(voteId);
    } catch(e) { showVoteToast('오류: ' + e.message); }
};

window.deleteVote = async function(voteId) {
    if (!confirm('투표를 삭제하면 복구할 수 없어요. 삭제할까요?')) return;
    try {
        await db.ref(`polls/${voteId}`).remove();
        showVoteToast('투표가 삭제됐어요.');
        showVotePage();
    } catch(e) { showVoteToast('오류: ' + e.message); }
};

// ===== 투표 만들기 페이지 =====
window.showCreateVotePage = function() {
    if (!isLoggedIn()) { alert('로그인이 필요합니다!'); return; }

    const section = document.getElementById('voteSection');
    if (!section) return;

    // 기본 옵션 2개
    let optionCount = 2;
    const maxOptions = 10;

    section.innerHTML = `
        <div style="max-width:600px;width:100%;margin:0 auto;
            display:flex;flex-direction:column;height:100%;background:#f2f3f6;">

            <!-- 헤더 -->
            <div style="background:white;padding:14px 20px 12px;display:flex;
                align-items:center;justify-content:space-between;flex-shrink:0;
                border-bottom:1px solid #e8e8e8;">
                <button onclick="showVotePage()"
                    style="background:none;border:none;color:#212121;width:40px;height:40px;
                    border-radius:50%;cursor:pointer;font-size:18px;display:flex;
                    align-items:center;justify-content:center;">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2 style="margin:0;font-size:18px;font-weight:800;color:#212121;">투표 만들기</h2>
                <div style="width:40px;"></div>
            </div>

            <!-- 폼 -->
            <div style="overflow-y:auto;flex:1;padding:16px;">
                <div style="background:white;border-radius:16px;padding:20px;margin-bottom:12px;
                    box-shadow:0 1px 4px rgba(0,0,0,0.08);">
                    <div style="font-size:13px;font-weight:700;color:#424242;margin-bottom:8px;">
                        투표 제목 <span style="color:#e53935;">*</span>
                    </div>
                    <textarea id="voteTitleInput" class="vote-input"
                        placeholder="투표 제목을 입력하세요" maxlength="100"
                        style="resize:none;height:70px;line-height:1.5;"
                        oninput="updateVoteCharCount(this,'voteTitleCount',100)"></textarea>
                    <div style="text-align:right;font-size:11px;color:#bdbdbd;margin-top:4px;">
                        <span id="voteTitleCount">0</span>/100
                    </div>
                </div>

                <!-- 옵션 -->
                <div style="background:white;border-radius:16px;padding:20px;margin-bottom:12px;
                    box-shadow:0 1px 4px rgba(0,0,0,0.08);">
                    <div style="font-size:13px;font-weight:700;color:#424242;margin-bottom:12px;">
                        선택지 (최대 ${maxOptions}개)
                    </div>
                    <div id="voteOptionsContainer">
                        ${[1,2].map(i => renderOptionInput(i)).join('')}
                    </div>
                    <button onclick="addVoteOption(${maxOptions})"
                        id="voteAddOptionBtn"
                        style="width:100%;padding:12px;border:1.5px dashed #e0e0e0;
                        border-radius:12px;background:none;font-size:13px;color:#757575;
                        cursor:pointer;font-family:inherit;transition:border-color 0.15s;"
                        onmouseover="this.style.borderColor='#ffcd00'"
                        onmouseout="this.style.borderColor='#e0e0e0'">
                        <i class="fas fa-plus" style="margin-right:6px;"></i>선택지 추가
                    </button>
                </div>

                <!-- 설정 -->
                <div style="background:white;border-radius:16px;padding:20px;margin-bottom:12px;
                    box-shadow:0 1px 4px rgba(0,0,0,0.08);">
                    <div style="font-size:13px;font-weight:700;color:#424242;margin-bottom:4px;">설정</div>

                    <div class="vote-toggle-row">
                        <div>
                            <div style="font-size:14px;color:#212121;font-weight:500;">익명 투표</div>
                            <div style="font-size:12px;color:#9e9e9e;margin-top:2px;">참여자 이름을 숨깁니다</div>
                        </div>
                        <div class="vote-toggle" id="toggleAnonymous" onclick="toggleVoteSetting('Anonymous')"></div>
                    </div>

                    <div class="vote-toggle-row">
                        <div>
                            <div style="font-size:14px;color:#212121;font-weight:500;">복수 선택 허용</div>
                            <div style="font-size:12px;color:#9e9e9e;margin-top:2px;">여러 항목을 동시에 선택할 수 있어요</div>
                        </div>
                        <div class="vote-toggle" id="toggleMultiple" onclick="toggleVoteSetting('Multiple')"></div>
                    </div>

                    <div class="vote-toggle-row" style="border-bottom:none;">
                        <div>
                            <div style="font-size:14px;color:#212121;font-weight:500;">마감 기한 설정</div>
                            <div style="font-size:12px;color:#9e9e9e;margin-top:2px;">설정하지 않으면 무기한 진행돼요</div>
                        </div>
                        <div class="vote-toggle" id="toggleDeadline" onclick="toggleVoteSetting('Deadline')"></div>
                    </div>

                    <div id="deadlinePicker" style="display:none;margin-top:12px;">
                        <input type="datetime-local" id="voteDeadlineInput" class="vote-input"
                            min="${new Date().toISOString().slice(0,16)}">
                    </div>
                </div>

                <!-- 제출 -->
                <button class="vote-submit-btn" onclick="createVote()" style="margin-bottom:80px;">
                    투표 만들기
                </button>
            </div>
        </div>
    `;

    // 전역 옵션 카운터 초기화
    window._voteOptCount = 2;
};

function renderOptionInput(i) {
    return `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"
             id="voteOptRow_${i}">
            <input type="text" class="vote-input vote-option-input"
                placeholder="선택지 ${i}" maxlength="50"
                style="flex:1;"
                data-opt="${i}">
            ${i > 2 ? `
            <button onclick="removeVoteOption(${i})"
                style="width:34px;height:34px;border-radius:50%;border:none;
                background:#fce4ec;color:#e53935;cursor:pointer;flex-shrink:0;
                font-size:14px;display:flex;align-items:center;justify-content:center;">
                <i class="fas fa-times"></i>
            </button>` : '<div style="width:34px;flex-shrink:0;"></div>'}
        </div>
    `;
}

window.addVoteOption = function(max) {
    window._voteOptCount = (window._voteOptCount || 2) + 1;
    const cnt = window._voteOptCount;
    const container = document.getElementById('voteOptionsContainer');
    if (!container) return;
    const div = document.createElement('div');
    div.innerHTML = renderOptionInput(cnt);
    container.appendChild(div.firstElementChild);
    if (cnt >= max) document.getElementById('voteAddOptionBtn').style.display = 'none';
};

window.removeVoteOption = function(i) {
    const row = document.getElementById(`voteOptRow_${i}`);
    if (row) row.remove();
};

window.toggleVoteSetting = function(name) {
    const el = document.getElementById(`toggle${name}`);
    if (!el) return;
    el.classList.toggle('on');
    if (name === 'Deadline') {
        const picker = document.getElementById('deadlinePicker');
        if (picker) picker.style.display = el.classList.contains('on') ? 'block' : 'none';
    }
};

window.updateVoteCharCount = function(el, countId, max) {
    const span = document.getElementById(countId);
    if (span) span.textContent = el.value.length;
};

// ===== 투표 저장 =====
window.createVote = async function() {
    if (!isLoggedIn()) { alert('로그인이 필요합니다!'); return; }

    const titleEl = document.getElementById('voteTitleInput');
    const title = titleEl?.value.trim();
    if (!title) { showVoteToast('투표 제목을 입력해주세요.'); titleEl?.focus(); return; }

    const optionEls = document.querySelectorAll('.vote-option-input');
    const options = [];
    optionEls.forEach((el, idx) => {
        const text = el.value.trim();
        if (text) options.push({ id: `opt_${idx+1}`, text });
    });
    if (options.length < 2) { showVoteToast('선택지를 2개 이상 입력해주세요.'); return; }

    const isAnonymous = document.getElementById('toggleAnonymous')?.classList.contains('on') || false;
    const isMultiple  = document.getElementById('toggleMultiple')?.classList.contains('on') || false;
    const hasDeadline = document.getElementById('toggleDeadline')?.classList.contains('on') || false;
    let deadline = null;
    if (hasDeadline) {
        const deadlineVal = document.getElementById('voteDeadlineInput')?.value;
        if (!deadlineVal) { showVoteToast('마감 기한을 설정해주세요.'); return; }
        deadline = new Date(deadlineVal).getTime();
        if (deadline <= Date.now()) { showVoteToast('마감 기한은 현재 시각 이후로 설정해주세요.'); return; }
    }

    const btn = document.querySelector('.vote-submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = '만드는 중...'; }

    try {
        const myUid  = auth.currentUser.uid;
        const myName = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || '알 수 없음';

        const newRef = db.ref('polls').push();
        await newRef.set({
            title, options, isAnonymous, isMultiple,
            deadline: deadline || null,
            createdBy: myUid,
            createdByName: myName,
            createdAt: Date.now(),
            closed: false
        });

        showVoteToast('✅ 투표가 만들어졌어요!');
        await showVoteDetail(newRef.key);
    } catch(e) {
        showVoteToast('오류: ' + e.message);
        if (btn) { btn.disabled = false; btn.textContent = '투표 만들기'; }
    }
};

// ===== 유틸 =====
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatVoteDeadline(ts) {
    const diff = ts - Date.now();
    if (diff < 0) return '마감됨';
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}일 후`;
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}시간 후`;
    return `${Math.floor(diff / 60000)}분 후`;
}

function showVoteToast(msg) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
        background:rgba(0,0,0,0.75);color:white;padding:10px 20px;border-radius:20px;
        font-size:13px;z-index:99999;pointer-events:none;white-space:nowrap;`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// ===== 더보기 메뉴에 투표 항목 추가 =====
// showMoreMenu 패치: 커뮤니티 섹션에 투표 버튼 추가
const _origShowMoreMenu = window.showMoreMenu;
window.showMoreMenu = function () {
    if (typeof _origShowMoreMenu === 'function') _origShowMoreMenu.call(this);
    // 커뮤니티 섹션의 grid 첫 번째 자식 뒤에 투표 버튼 삽입
    const section = document.getElementById('moreMenuSection');
    if (!section || document.getElementById('moreMenuVoteBtn')) return;
    const communityGrid = section.querySelector('.menu-section div[style*="display:grid"]');
    if (!communityGrid) return;
    const voteBtn = document.createElement('button');
    voteBtn.id = 'moreMenuVoteBtn';
    voteBtn.className = 'more-menu-btn';
    voteBtn.onclick = showVotePage;
    voteBtn.innerHTML = '<i class="fas fa-poll-h"></i> 투표';
    communityGrid.appendChild(voteBtn);
};

// ===== URL 라우팅 등록 =====
// handleRoute 함수가 이미 초기화된 후라도 vote 라우트를 동적으로 등록
(function registerVoteRoute() {
    const orig = window.handleRoute;
    if (typeof orig !== 'function') return;
    window.handleRoute = function(page, ...args) {
        if (page === 'vote') { showVotePage(); return; }
        return orig.call(this, page, ...args);
    };
})();

console.log('✅ vote.js 로드 완료');

})(); // IIFE 끝