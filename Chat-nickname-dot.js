// ===== Chat-nickname-dot.js =====
// 반드시 Chat-upgrade.js 뒤에 로드하세요.
// 기능 1: 새 메시지 도착 시 채팅방 목록에 파란 점 실시간 표시 (여러 방 각각 표시)
// 기능 2: 채팅방별 유저 별명 설정 (해당 채팅방에서만 별명으로 표시)
(function () {
'use strict';
console.log('💙 Chat-nickname-dot.js 로드 중...');

// ========================================================
// 1. CSS 주입 — 파란 점 + 별명 뱃지 + 채팅방 메뉴
// ========================================================
(function injectCSS() {
    if (document.getElementById('_chatNickDotStyle')) return;
    const s = document.createElement('style');
    s.id = '_chatNickDotStyle';
    s.textContent = `
        /* ── 채팅방 목록 아바타 위 파란 점 (기존 cu-unread-dot 빨간색 → 파란색 오버라이드) */
        .cu-unread-dot {
            background: #2196F3 !important;
        }

        /* ── 채팅방 목록 오른쪽 파란 점 (실시간 새 메시지) */
        .cu-room-blue-dot {
            position: absolute;
            top: 50%;
            right: 14px;
            transform: translateY(-50%);
            width: 10px;
            height: 10px;
            background: #2196F3;
            border-radius: 50%;
            border: 2px solid white;
            pointer-events: none;
            box-shadow: 0 0 0 3px rgba(33,150,243,0.18);
            animation: cuBlueDotPulse 2s infinite;
        }
        @keyframes cuBlueDotPulse {
            0%   { box-shadow: 0 0 0 0 rgba(33,150,243,0.35); }
            70%  { box-shadow: 0 0 0 6px rgba(33,150,243,0); }
            100% { box-shadow: 0 0 0 0 rgba(33,150,243,0); }
        }

        /* ── 별명 설정됨 표시 뱃지 */
        .cu-nickname-badge {
            display: inline-block;
            font-size: 9px;
            color: white;
            background: #2196F3;
            border-radius: 10px;
            padding: 1px 5px;
            margin-left: 5px;
            vertical-align: middle;
            font-weight: 700;
            letter-spacing: 0.2px;
        }

        /* ── 채팅방 메뉴 (우상단 ⋮ 버튼) */
        .cu-room-menu {
            position: fixed;
            background: white;
            border-radius: 14px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.18);
            z-index: 99999;
            overflow: hidden;
            min-width: 185px;
        }
        .cu-room-menu-btn {
            display: flex;
            align-items: center;
            gap: 11px;
            width: 100%;
            padding: 14px 16px;
            border: none;
            background: none;
            font-size: 14px;
            cursor: pointer;
            color: #212121;
            font-family: inherit;
            text-align: left;
        }
        .cu-room-menu-btn:active { background: #f5f5f5; }
        .cu-room-menu-btn + .cu-room-menu-btn {
            border-top: 1px solid #f5f5f5;
        }

        /* ── 별명 모달 슬라이드업 */
        @keyframes cuNickSlideUp {
            from { transform: translateY(30px); opacity: 0.7; }
            to   { transform: translateY(0);    opacity: 1; }
        }
    `;
    document.head.appendChild(s);
})();

// ========================================================
// 2. 헬퍼
// ========================================================
function _escHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _toast(msg) {
    // Chat-upgrade.js의 cu_showToast 재사용, 없으면 직접 생성
    if (typeof window.cu_showToast === 'function') { window.cu_showToast(msg); return; }
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
        background:rgba(0,0,0,0.75);color:white;padding:10px 20px;border-radius:20px;
        font-size:13px;z-index:999999;pointer-events:none;white-space:nowrap;`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
}

// ========================================================
// 3. 별명 캐시
//    구조: _cuNicknames[roomId][targetChatUid] = "별명"
// ========================================================
window._cuNicknames      = {};
window._cuCurrentRoomId  = null;       // 현재 열린 채팅방 ID
window._cuCurrentFriendChatUid = null; // 현재 채팅방 상대 chatApp UID

/** 별명 조회 (캐시) */
function _getNick(roomId, targetChatUid) {
    return (window._cuNicknames[roomId] || {})[targetChatUid] || null;
}

/** Firebase → 내 모든 별명 로드 */
async function _loadNicknames(myUid) {
    try {
        const snap = await window._chat.getChatDb()
            .ref(`roomNicknames/${myUid}`).once('value');
        window._cuNicknames = snap.val() || {};
    } catch (e) {
        console.warn('[nickname] 별명 로드 실패:', e);
        window._cuNicknames = {};
    }
}

// ========================================================
// 4. 실시간 채팅방 목록 리스너
//    채팅 목록이 열려 있을 때 각 방의 새 메시지를 실시간 감지
//    → 해당 채팅방 아이템에 파란 점 표시/제거
// ========================================================
let _roomWatchers = []; // { ref, listener }[]

function _clearRoomWatchers() {
    _roomWatchers.forEach(({ ref, listener }) => {
        try { ref.off('value', listener); } catch (e) {}
    });
    _roomWatchers = [];
}

function _startRoomWatchers(myUid, roomIds) {
    _clearRoomWatchers();
    roomIds.forEach(roomId => {
        const ref = window._chat.getChatDb().ref(`chats/${roomId}/messages`);
        const listener = ref.on('value', snap => {
            _updateRoomDot(roomId, snap.val() || {}, myUid);
        });
        _roomWatchers.push({ ref, listener });
    });
}

/** 특정 채팅방 아이템의 파란 점 / 아바타 dot / 뱃지 업데이트 */
function _updateRoomDot(roomId, msgs, myUid) {
    const unread = Object.values(msgs)
        .filter(m => !m.read && m.senderId !== myUid).length;

    // data-room-id 속성으로 아이템 찾기 (camelCase → kebab-case 자동 변환)
    const item = document.querySelector(`.cu-list-row[data-room-id="${roomId}"]`);
    if (!item) return;

    // ── 아바타 위 파란 dot
    const avatarWrap = item.querySelector('.cu-avatar-wrap');
    if (avatarWrap) {
        let avDot = avatarWrap.querySelector('.cu-unread-dot');
        if (unread > 0 && !avDot) {
            avDot = document.createElement('div');
            avDot.className = 'cu-unread-dot';
            avatarWrap.appendChild(avDot);
        } else if (unread === 0 && avDot) {
            avDot.remove();
        }
    }

    // ── 오른쪽 파란 펄스 dot
    let blueDot = item.querySelector('.cu-room-blue-dot');
    if (unread > 0) {
        if (!blueDot) {
            blueDot = document.createElement('div');
            blueDot.className = 'cu-room-blue-dot';
            item.style.position = 'relative'; // 부모 relative 보장
            item.appendChild(blueDot);
        }
    } else {
        blueDot?.remove();
    }

    // ── 읽지 않은 메시지 배지 텍스트 갱신
    const badge = item.querySelector('.cu-unread-badge');
    if (badge) {
        if (unread > 0) {
            badge.textContent = unread > 99 ? '99+' : unread;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }

    // nav 전체 배지 업데이트
    if (window._chat?.updateBadge) window._chat.updateBadge();
}

// ========================================================
// 5. showChatPage 패치
//    — 별명 로드 + 채팅방 목록 렌더 후 실시간 리스너 등록
// ========================================================
function _patchShowChatPage() {
    const _orig = window.showChatPage;
    if (!_orig) return;

    window.showChatPage = async function () {
        // 채팅방에서 목록으로 돌아올 때 방 상태 초기화
        window._cuCurrentRoomId = null;
        window._cuCurrentFriendChatUid = null;

        await _orig.apply(this, arguments);

        // 별명 로드
        const myUid = window._chat?.getChatUserId();
        if (myUid) {
            await _loadNicknames(myUid);
            // 목록에 별명 DOM 적용
            _applyNicknamesToListDOM();

            // 실시간 리스너 등록
            const roomIds = Array.from(
                document.querySelectorAll('.cu-list-row[data-room-id]')
            ).map(el => el.dataset.roomId).filter(Boolean);

            if (roomIds.length) _startRoomWatchers(myUid, roomIds);
        }
    };
}

/** 채팅방 목록 DOM에 별명 적용 */
function _applyNicknamesToListDOM() {
    document.querySelectorAll('.cu-list-row[data-room-id]').forEach(item => {
        const roomId    = item.dataset.roomId;
        const friendUid = item.dataset.friendUid; // ← Chat-upgrade.js에서 추가한 속성
        if (!roomId || !friendUid) return;
        const nick = _getNick(roomId, friendUid);
        if (!nick) return;

        // 이름 span 찾기 (font-weight 600/700, font-size 15px)
        const nameSpan = item.querySelector('span[style*="font-size:15px"]');
        if (nameSpan) {
            nameSpan.textContent = nick;
            // 뱃지가 없으면 추가
            if (!nameSpan.querySelector('.cu-nickname-badge')) {
                const badge = document.createElement('span');
                badge.className = 'cu-nickname-badge';
                badge.title = '설정한 별명';
                badge.textContent = '별명';
                nameSpan.appendChild(badge);
            }
        }
        // 검색 키워드도 별명으로 업데이트
        item.dataset.name = nick.toLowerCase();
    });
}

// ========================================================
// 6. openChatRoom 패치
//    — 채팅방 진입 시 별명 헤더 적용 + 목록 리스너 정리
// ========================================================
function _patchOpenChatRoom() {
    const _orig = window.openChatRoom;
    if (!_orig) return;

    window.openChatRoom = async function (roomId, friendUid, friendName, friendPhoto, friendMainUid) {
        // 목록 리스너 정리 (채팅방 진입 시 불필요)
        _clearRoomWatchers();

        // 현재 방 상태 저장
        window._cuCurrentRoomId = roomId;
        window._cuCurrentFriendChatUid = friendUid;

        // 별명 로드 (캐시 없으면)
        const myUid = window._chat?.getChatUserId();
        if (myUid && !Object.keys(window._cuNicknames).length) {
            await _loadNicknames(myUid);
        }

        // 별명이 있으면 displayName 교체
        const nick = friendUid ? _getNick(roomId, friendUid) : null;
        const displayName = nick || friendName;

        await _orig.call(this, roomId, friendUid, displayName, friendPhoto, friendMainUid);

        // 헤더 이름에 별명 뱃지 표시
        if (nick) {
            const nameEl = document.querySelector('.cu-room-header-name[data-roomtitle]');
            if (nameEl && !nameEl.querySelector('.cu-nickname-badge')) {
                const badge = document.createElement('span');
                badge.className = 'cu-nickname-badge';
                badge.title = '설정한 별명';
                badge.textContent = '별명';
                nameEl.appendChild(badge);
            }
        }

        // 메시지 발신자 이름 별명으로 교체 (렌더 후)
        setTimeout(() => _patchSenderNames(roomId), 80);
    };
}

// ========================================================
// 7. 발신자 이름 별명 교체 (메시지 렌더링 후 DOM 수정)
// ========================================================
function _patchSenderNames(roomId) {
    if (!roomId) return;
    const myUid = window._chat?.getChatUserId();

    document.querySelectorAll('#chatMessages [data-msgid]').forEach(msgEl => {
        const msgId = msgEl.dataset.msgid;
        const msg   = (window._lastMsgs || {})[msgId];
        if (!msg || msg.senderId === myUid) return;

        const nick = _getNick(roomId, msg.senderId);
        if (!nick) return;

        // 발신자 이름 표시 div (color:#888, font-size:11px)
        const nameEl = msgEl.querySelector('div[style*="color:#888"]');
        if (nameEl) nameEl.textContent = nick;
    });
}

// MutationObserver: chatMessages에 새 메시지 추가될 때 자동 별명 교체
(function setupMsgObserver() {
    let _debounce = null;
    const obs = new MutationObserver(() => {
        const roomId = window._cuCurrentRoomId;
        if (!roomId) return;
        clearTimeout(_debounce);
        _debounce = setTimeout(() => _patchSenderNames(roomId), 60);
    });

    // chatMessages가 동적으로 생성되므로 body를 먼저 감시
    const bodyObs = new MutationObserver(() => {
        const chatMsgs = document.getElementById('chatMessages');
        if (chatMsgs) {
            obs.observe(chatMsgs, { childList: true, subtree: true });
            bodyObs.disconnect();
        }
    });
    bodyObs.observe(document.body, { childList: true, subtree: true });
})();

// ========================================================
// 8. showRoomMenu — 채팅방 우상단 ⋮ 메뉴
// ========================================================
window.showRoomMenu = function (roomId, isGroupArg) {
    document.getElementById('_cuRoomMenu')?.remove();
    const isGroup   = isGroupArg === 'true' || isGroupArg === true;
    const friendUid = window._cuCurrentFriendChatUid;
    const myUid     = window._chat?.getChatUserId();

    const menu = document.createElement('div');
    menu.id = '_cuRoomMenu';
    menu.className = 'cu-room-menu';
    menu.style.cssText = 'top:56px;right:8px;';

    const menuItems = [
        // 1:1 채팅: 상대방 별명 + 내 별명
        ...(!isGroup && friendUid ? [{
            icon: 'fas fa-tag',
            label: '상대방 별명 설정',
            color: '#2196F3',
            fn: () => cu_showNicknameModal(roomId, friendUid)
        }] : []),
        ...(!isGroup && myUid ? [{
            icon: 'fas fa-user-tag',
            label: '내 별명 설정',
            color: '#43a047',
            fn: () => cu_showNicknameModal(roomId, myUid)
        }] : []),
        // 그룹방: 그룹 정보 시트
        ...(isGroup ? [{
            icon: 'fas fa-users-cog',
            label: '그룹 정보',
            color: '#555',
            fn: () => cu_showGroupInfo(roomId)
        }] : []),
        {
            icon: 'fas fa-sign-out-alt',
            label: '채팅방 나가기',
            color: '#e53935',
            fn: () => {
                if (confirm('채팅방을 나가시겠습니까?\n나간 후에는 대화 내역이 사라질 수 있습니다.'))
                    cu_leaveChatRoom(roomId);
            }
        },
    ];

    menuItems.forEach(({ icon, label, color, fn }) => {
        const btn = document.createElement('button');
        btn.className = 'cu-room-menu-btn';
        btn.innerHTML = `<i class="${icon}" style="color:${color};width:18px;text-align:center;font-size:15px;"></i>${_escHTML(label)}`;
        btn.onclick = () => { menu.remove(); fn(); };
        menu.appendChild(btn);
    });

    document.body.appendChild(menu);
    setTimeout(() => {
        document.addEventListener('click', function h(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', h);
            }
        });
    }, 80);
};

// ========================================================
// 9. 별명 설정 모달
// ========================================================
window.cu_showNicknameModal = async function (roomId, targetChatUid, returnToGroupRoom) {
    document.getElementById('_cuNicknameModal')?.remove();
    const myUid  = window._chat?.getChatUserId();
    if (!myUid || !targetChatUid) return;

    const isSelf      = (targetChatUid === myUid);
    const currentNick = _getNick(roomId, targetChatUid) || '';

    // 대상 실제 이름 조회
    let targetRealName = '';
    try {
        if (isSelf) {
            // 나 자신: 메인 앱 프로필에서 이름 가져오기
            const mainUid = auth?.currentUser?.uid;
            if (mainUid) {
                const snap = await db.ref(`users/${mainUid}`).once('value');
                const u = snap.val() || {};
                targetRealName = (typeof window._chat.resolveNickname === 'function')
                    ? window._chat.resolveNickname(u)
                    : (u.newNickname || u.displayName || u.email?.split('@')[0] || '');
            }
        } else {
            const roomSnap = await window._chat.getChatDb()
                .ref(`chats/${roomId}/mainUids`).once('value');
            const mainUids      = roomSnap.val() || {};
            const targetMainUid = mainUids[targetChatUid];
            if (targetMainUid) {
                const snap = await db.ref(`users/${targetMainUid}`).once('value');
                const u = snap.val() || {};
                targetRealName = (typeof window._chat.resolveNickname === 'function')
                    ? window._chat.resolveNickname(u)
                    : (u.newNickname || u.displayName || u.email?.split('@')[0] || '');
            }
        }
    } catch (e) {}

    const accentColor = isSelf ? '#43a047' : '#2196F3';
    const accentBg    = isSelf ? '#e8f5e9' : '#e3f2fd';
    const accentText  = isSelf ? '#2e7d32' : '#1565c0';
    const iconClass   = isSelf ? 'fas fa-user-tag' : 'fas fa-tag';
    const titleLabel  = isSelf ? '내 별명 설정' : '별명 설정';
    const targetLabel = isSelf ? '👤 나 (이 방에서 내 별명)' : `👤 대상: <strong style="color:#212121;">${_escHTML(targetRealName)}</strong>`;
    const saveEnter   = `cu_saveNickname('${roomId}','${targetChatUid}','${returnToGroupRoom || ''}')`;

    const modal = document.createElement('div');
    modal.id = '_cuNicknameModal';
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.45);
        z-index:99999;display:flex;align-items:flex-end;justify-content:center;`;

    modal.innerHTML = `
        <div style="background:white;width:100%;max-width:600px;
            border-radius:20px 20px 0 0;padding:22px 20px 36px;
            animation:cuNickSlideUp 0.22s cubic-bezier(.16,1,.3,1);">

            <!-- 핸들 -->
            <div style="width:36px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 20px;"></div>

            <!-- 제목 -->
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                <div style="width:36px;height:36px;border-radius:50%;background:${accentBg};
                    display:flex;align-items:center;justify-content:center;">
                    <i class="${iconClass}" style="color:${accentColor};font-size:16px;"></i>
                </div>
                <div>
                    <div style="font-size:17px;font-weight:800;color:#212121;">${titleLabel}</div>
                    <div style="font-size:12px;color:#aaa;margin-top:1px;">나에게만 보이는 별명이에요</div>
                </div>
            </div>

            <!-- 대상 안내 -->
            <div style="padding:10px 14px;background:#f8f9fa;border-radius:10px;
                font-size:13px;color:#555;margin-bottom:14px;">
                ${targetLabel}
                ${currentNick ? ` &nbsp;→&nbsp; 현재 별명: <strong style="color:${accentColor};">${_escHTML(currentNick)}</strong>` : ''}
            </div>

            <!-- 입력 -->
            <div style="font-size:12px;color:#888;margin-bottom:6px;font-weight:600;">새 별명 (최대 20자)</div>
            <input id="_cuNickInput" type="text"
                value="${_escHTML(currentNick)}"
                maxlength="20"
                placeholder="별명 입력  (빈칸 저장 = 초기화)"
                style="width:100%;padding:13px 16px;border:1.5px solid #e0e0e0;
                border-radius:12px;font-size:15px;font-family:inherit;outline:none;
                box-sizing:border-box;transition:border-color 0.15s;"
                onfocus="this.style.borderColor='${accentColor}'"
                onblur="this.style.borderColor='#e0e0e0'"
                onkeydown="if(event.key==='Enter')${saveEnter}">
            <div style="text-align:right;font-size:11px;color:#bbb;margin-top:4px;"
                id="_cuNickLen">${currentNick.length}/20</div>

            <!-- 안내 -->
            <div style="margin-top:8px;padding:10px 14px;background:${accentBg};border-radius:10px;
                font-size:12px;color:${accentText};line-height:1.5;">
                ${isSelf
                    ? '🟢 내 별명을 설정하면 이 채팅방에서 내 이름이 별명으로 표시됩니다.'
                    : '💙 별명을 설정하면 이 채팅방에서 상대방 이름이 별명으로 표시됩니다.'}
            </div>

            <!-- 버튼 -->
            <div style="display:flex;gap:10px;margin-top:18px;">
                <button onclick="document.getElementById('_cuNicknameModal').remove();
                    ${returnToGroupRoom ? `cu_showGroupInfo('${returnToGroupRoom}')` : ''}"
                    style="flex:1;padding:13px;border:1.5px solid #e0e0e0;border-radius:12px;
                    background:white;font-size:15px;font-weight:600;color:#555;cursor:pointer;">
                    ${returnToGroupRoom ? '← 돌아가기' : '취소'}
                </button>
                <button id="_cuNickSaveBtn"
                    onclick="${saveEnter}"
                    style="flex:1;padding:13px;border:none;border-radius:12px;
                    background:${accentColor};font-size:15px;font-weight:700;color:white;cursor:pointer;
                    box-shadow:0 3px 10px rgba(0,0,0,0.15);">
                    저장
                </button>
            </div>
        </div>`;

    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);

    const input = document.getElementById('_cuNickInput');
    input?.addEventListener('input', () => {
        document.getElementById('_cuNickLen').textContent = `${input.value.length}/20`;
    });
    setTimeout(() => { input?.focus(); input?.select(); }, 60);
};

// ========================================================
// 10. 별명 저장
// ========================================================
window.cu_saveNickname = async function (roomId, targetChatUid, returnToGroupRoom) {
    const input = document.getElementById('_cuNickInput');
    const nick  = input?.value.trim() || '';
    const myUid = window._chat?.getChatUserId();
    if (!myUid) { _toast('로그인이 필요합니다.'); return; }

    const saveBtn = document.getElementById('_cuNickSaveBtn');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '저장 중...'; }

    try {
        const ref = window._chat.getChatDb()
            .ref(`roomNicknames/${myUid}/${roomId}/${targetChatUid}`);

        if (nick) {
            await ref.set(nick);
            if (!window._cuNicknames[roomId]) window._cuNicknames[roomId] = {};
            window._cuNicknames[roomId][targetChatUid] = nick;
        } else {
            await ref.remove();
            if (window._cuNicknames[roomId]) {
                delete window._cuNicknames[roomId][targetChatUid];
            }
        }

        document.getElementById('_cuNicknameModal')?.remove();
        _toast(nick ? `✅ "${nick}" 별명 저장 완료!` : '✅ 별명이 초기화됐어요!');

        // ── 헤더 이름 즉시 업데이트 (상대방 별명인 경우)
        const isSelf = (targetChatUid === myUid);
        if (!isSelf) {
            const nameEl = document.querySelector('.cu-room-header-name[data-roomtitle]');
            if (nameEl) {
                nameEl.textContent = nick || nameEl.textContent.replace('별명', '').trim();
                nameEl.querySelectorAll('.cu-nickname-badge').forEach(b => b.remove());
                if (nick) {
                    const badge = document.createElement('span');
                    badge.className = 'cu-nickname-badge';
                    badge.title = '설정한 별명';
                    badge.textContent = '별명';
                    nameEl.appendChild(badge);
                }
            }
        }

        // ── 메시지 발신자 이름 재적용
        if (window._cuCurrentRoomId === roomId) {
            _patchSenderNames(roomId);
        }

        // ── 그룹 정보 시트에서 왔으면 다시 열기 (연속 별명 설정)
        if (returnToGroupRoom) {
            setTimeout(() => cu_showGroupInfo(returnToGroupRoom), 180);
        }

    } catch (e) {
        _toast('❌ 저장 실패: ' + e.message);
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = '저장'; }
    }
};

// ========================================================
// 11. 채팅방 나가기
// ========================================================
window.cu_leaveChatRoom = async function (roomId) {
    const myUid = window._chat?.getChatUserId();
    if (!myUid) return;
    try {
        await Promise.all([
            window._chat.getChatDb().ref(`userChats/${myUid}/${roomId}`).remove(),
            window._chat.getChatDb().ref(`chats/${roomId}/participants/${myUid}`).remove(),
        ]);
        _toast('채팅방을 나갔습니다.');
        if (typeof window.showChatPage === 'function') window.showChatPage();
    } catch (e) {
        _toast('❌ 나가기 실패: ' + e.message);
    }
};

// ========================================================
// 12. 그룹 정보 시트
//     멤버 목록 + 각 멤버별 별명 설정 + 나가기
// ========================================================
window.cu_showGroupInfo = async function (roomId) {
    document.getElementById('_cuGroupInfoSheet')?.remove();

    const myUid  = window._chat?.getChatUserId();
    const myMainUid = auth?.currentUser?.uid;

    // 로딩 시트 먼저 표시
    const sheet = document.createElement('div');
    sheet.id = '_cuGroupInfoSheet';
    sheet.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.45);
        z-index:99999;display:flex;align-items:flex-end;justify-content:center;`;
    sheet.innerHTML = `
        <div style="background:white;width:100%;max-width:600px;
            border-radius:20px 20px 0 0;padding:22px 20px 36px;
            animation:cuSlideUp 0.22s cubic-bezier(.16,1,.3,1);max-height:85vh;
            display:flex;flex-direction:column;overflow:hidden;">
            <div style="width:36px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 18px;flex-shrink:0;"></div>
            <div style="text-align:center;padding:30px;color:#bbb;">
                <i class="fas fa-spinner fa-spin" style="font-size:24px;"></i>
            </div>
        </div>`;
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.remove(); });
    document.body.appendChild(sheet);

    try {
        // 그룹 데이터 로드
        const chatSnap = await window._chat.getChatDb().ref(`chats/${roomId}`).once('value');
        const chat = chatSnap.val() || {};
        const groupName    = chat.groupName || '그룹 채팅';
        const participants = chat.participants || {};
        const mainUids     = chat.mainUids    || {};

        // 멤버 프로필 로드
        const memberUids = Object.keys(participants);
        const memberProfiles = await Promise.all(memberUids.map(async (chatUid) => {
            const mainUid = mainUids[chatUid];
            let name = '', photo = null, isMe = (chatUid === myUid);
            if (mainUid) {
                try {
                    const snap = await db.ref(`users/${mainUid}`).once('value');
                    const u = snap.val() || {};
                    name  = (typeof window._chat.resolveNickname === 'function')
                        ? window._chat.resolveNickname(u)
                        : (u.newNickname || u.displayName || u.email?.split('@')[0] || '');
                    photo = u.profilePhoto || null;
                } catch (e) {}
            }
            const nick = _getNick(roomId, chatUid);
            return { chatUid, mainUid, name, photo, isMe, nick };
        }));

        // 나 → 맨 위, 나머지 이름순
        memberProfiles.sort((a, b) => {
            if (a.isMe) return -1;
            if (b.isMe) return 1;
            return (a.name || '').localeCompare(b.name || '');
        });

        // 멤버 HTML 생성
        const membersHTML = memberProfiles.map(m => {
            const avatarHTML = m.photo
                ? `<img src="${_escHTML(m.photo)}" style="width:44px;height:44px;border-radius:50%;
                    object-fit:cover;border:2px solid #f0f0f0;flex-shrink:0;">`
                : `<div style="width:44px;height:44px;border-radius:50%;flex-shrink:0;
                    background:linear-gradient(135deg,#c62828,#e53935);
                    display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:18px;font-weight:700;color:white;">
                        ${_escHTML((m.name || '?')[0].toUpperCase())}
                    </span></div>`;

            const displayName = m.nick
                ? `<span style="font-weight:700;color:#212121;">${_escHTML(m.nick)}</span>
                   <span style="font-size:11px;color:#aaa;margin-left:4px;">(${_escHTML(m.name)})</span>`
                : `<span style="font-weight:600;color:#212121;">${_escHTML(m.name || '알 수 없음')}</span>`;

            const meTag = m.isMe
                ? `<span style="font-size:10px;background:#f5f5f5;color:#888;
                    border-radius:8px;padding:2px 7px;margin-left:4px;font-weight:600;">나</span>` : '';

            const nickBtnColor = m.isMe ? '#43a047' : '#2196F3';
            const nickBtnIcon  = m.isMe ? 'fas fa-user-tag' : 'fas fa-tag';
            const nickBtnLabel = m.nick ? '별명 변경' : (m.isMe ? '내 별명 설정' : '별명 설정');
            const nickBtn = `<button onclick="cu_showNicknameModal('${roomId}','${m.chatUid}','${roomId}');document.getElementById('_cuGroupInfoSheet').remove();"
                    style="border:1px solid #e0e0e0;background:white;border-radius:8px;
                    padding:5px 10px;font-size:12px;color:#555;cursor:pointer;
                    display:flex;align-items:center;gap:4px;white-space:nowrap;flex-shrink:0;">
                    <i class="${nickBtnIcon}" style="color:${nickBtnColor};font-size:11px;"></i>
                    ${nickBtnLabel}
                  </button>`;

            return `
                <div style="display:flex;align-items:center;gap:12px;padding:10px 0;
                    border-bottom:1px solid #f5f5f5;">
                    ${avatarHTML}
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:2px;">
                            ${displayName}${meTag}
                        </div>
                        ${m.nick ? `<div style="font-size:11px;color:#2196F3;margin-top:1px;">
                            <i class="fas fa-tag" style="font-size:9px;"></i> 별명 설정됨</div>` : ''}
                    </div>
                    ${nickBtn}
                </div>`;
        }).join('');

        const inner = sheet.querySelector('div');
        inner.innerHTML = `
            <!-- 핸들 -->
            <div style="width:36px;height:4px;background:#e0e0e0;border-radius:2px;
                margin:0 auto 18px;flex-shrink:0;"></div>

            <!-- 헤더 -->
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-shrink:0;">
                <div style="width:48px;height:48px;border-radius:50%;flex-shrink:0;
                    background:linear-gradient(135deg,#c62828,#e53935);
                    display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-users" style="color:white;font-size:20px;"></i>
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:17px;font-weight:800;color:#212121;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${_escHTML(groupName)}
                    </div>
                    <div style="font-size:13px;color:#aaa;margin-top:2px;">
                        멤버 ${memberProfiles.length}명
                    </div>
                </div>
            </div>

            <!-- 멤버 목록 -->
            <div style="font-size:12px;font-weight:700;color:#888;
                margin-bottom:6px;flex-shrink:0;">멤버</div>
            <div style="overflow-y:auto;flex:1;-webkit-overflow-scrolling:touch;">
                ${membersHTML}
            </div>

            <!-- 나가기 버튼 -->
            <div style="flex-shrink:0;margin-top:14px;">
                <button onclick="
                    document.getElementById('_cuGroupInfoSheet').remove();
                    if(confirm('그룹 채팅방을 나가시겠습니까?')) cu_leaveChatRoom('${roomId}');"
                    style="width:100%;padding:14px;border:1.5px solid #ffcdd2;border-radius:12px;
                    background:white;font-size:15px;font-weight:700;color:#e53935;cursor:pointer;
                    display:flex;align-items:center;justify-content:center;gap:8px;">
                    <i class="fas fa-sign-out-alt"></i> 그룹 채팅방 나가기
                </button>
            </div>`;

    } catch (e) {
        sheet.querySelector('div').innerHTML = `
            <div style="text-align:center;padding:30px;color:#c62828;">
                ❌ 그룹 정보를 불러오지 못했습니다.<br>
                <small style="color:#aaa;">${e.message}</small>
            </div>`;
    }
};

// ========================================================
// 13. 초기화 — chat.js + Chat-upgrade.js 준비 완료 후 패치 적용
// ========================================================
function _init() {
    console.log('💙 Chat-nickname-dot: 패치 적용 시작');
    _patchShowChatPage();
    _patchOpenChatRoom();
    console.log('✅ Chat-nickname-dot: 패치 완료 (파란 점 + 별명 기능 활성화)');
}

// chatReady 이벤트 대기 (chat.js) + showChatPage 준비 대기 (Chat-upgrade.js)
if (window._chat && typeof window.showChatPage === 'function') {
    _init();
} else {
    let _done = false;
    function _tryInit() {
        if (_done) return;
        if (window._chat && typeof window.showChatPage === 'function') {
            _done = true;
            _init();
        }
    }
    window.addEventListener('chatReady', () => setTimeout(_tryInit, 150));
    // 폴백 폴링 (최대 15초)
    let _tries = 0;
    const _poll = setInterval(() => {
        _tryInit();
        if (_done || ++_tries > 150) clearInterval(_poll);
    }, 100);
}

console.log('✅ Chat-nickname-dot.js 로드 완료');
})();