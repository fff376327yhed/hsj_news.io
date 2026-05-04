// ===== 인스타그램 DM 스타일 채팅 업그레이드 =====
// chat.js 뒤에 로드하세요. 기존 함수를 덮어씁니다.
(function () {
'use strict';
console.log('📱 chat-upgrade.js 로드 중...');

// ✅ window._chat 준비 대기 — CustomEvent 방식 (최적화)
// 기존 100ms × 150회 setTimeout 폴링 → 이벤트 기반으로 교체
// chat.js 마지막에 window.dispatchEvent(new CustomEvent('chatReady')) 추가 필요
function _waitForChat(cb) {
    // 이미 준비됐으면 즉시 실행
    if (window._chat && typeof window._chat.isChatAuthReady === 'function') {
        cb();
        return;
    }
    // CustomEvent 대기 (저속 환경 대비 최대 15초 타임아웃 1개만 유지)
    let resolved = false;
    function _onReady() {
        if (resolved) return;
        resolved = true;
        window.removeEventListener('chatReady', _onReady);
        cb();
    }
    window.addEventListener('chatReady', _onReady);
    // 안전장치: 15초 후 폴백 (setTimeout 1회만 사용)
    setTimeout(() => {
        if (resolved) return;
        resolved = true;
        window.removeEventListener('chatReady', _onReady);
        console.error('❌ Chat-upgrade: chatReady 이벤트 미수신 — 폴백 실행');
        if (typeof window.showChatPage !== 'function') {
            window.showChatPage = function() {
                alert('채팅을 불러올 수 없습니다. 페이지를 새로고침해주세요.');
            };
        }
    }, 15000);
}

// CSS 주입은 즉시 실행 (chat.js 의존 없음)

// ===== CSS 주입 =====
(function injectUpgradeCSS() {
    if (document.getElementById('_chatUpgradeStyle')) return;
    const s = document.createElement('style');
    s.id = '_chatUpgradeStyle';
    s.textContent = `
        /* ── 채팅 목록 ── */
        .cu-list-row {
            display:flex; align-items:center; padding:10px 16px; gap:12px;
            background:white; cursor:pointer; position:relative;
            transition:background 0.12s;
        }
        .cu-list-row:active { background:#f8f9fa; }
        .cu-avatar-wrap { position:relative; flex-shrink:0; }
        .cu-avatar {
            width:56px; height:56px; border-radius:50%; object-fit:cover;
            border:2px solid #f0f0f0; display:block;
        }
        .cu-avatar-placeholder {
            width:56px; height:56px; border-radius:50%;
            background:linear-gradient(135deg,#f5f5f5,#e0e0e0);
            display:flex; align-items:center; justify-content:center;
            border:2px solid #f0f0f0; flex-shrink:0;
        }
        .cu-unread-dot {
            position:absolute; bottom:1px; right:1px;
            width:14px; height:14px; border-radius:50%;
            background:#c62828; border:2px solid white;
        }
        .cu-unread-badge {
            background:#c62828; color:white; border-radius:12px;
            padding:2px 7px; font-size:11px; font-weight:700;
            min-width:20px; text-align:center; flex-shrink:0;
        }

        /* ── 채팅방 메시지 ── */
        .cu-msg-bubble {
            max-width:72%; border-radius:20px; padding:10px 14px;
            font-size:14px; line-height:1.5; word-break:break-word;
            position:relative; cursor:pointer; user-select:text;
        }
        .cu-msg-bubble.mine {
            background:#c62828; color:white;
            border-bottom-right-radius:4px;
        }
        .cu-msg-bubble.theirs {
            background:#efefef; color:#212121;
            border-bottom-left-radius:4px;
        }
        .cu-msg-bubble.mine.img-only,
        .cu-msg-bubble.theirs.img-only {
            background:none !important; padding:0 !important; border-radius:14px !important;
        }

        /* ── 답장 미리보기 ── */
        .cu-reply-bar {
            display:flex; align-items:center; gap:10px;
            padding:8px 14px; background:#f8f9fa;
            border-left:3px solid #c62828; margin:0 12px 4px;
            border-radius:0 8px 8px 0; font-size:12px; color:#555;
        }

        /* ── 리액션 ── */
        .cu-reaction {
            position:absolute; bottom:-14px;
            background:white; border-radius:20px;
            padding:2px 6px; font-size:14px; line-height:1.4;
            box-shadow:0 1px 4px rgba(0,0,0,0.15); cursor:pointer;
            white-space:nowrap;
        }
        .cu-reaction.mine { right:4px; }
        .cu-reaction.theirs { left:4px; }

        /* ── 하트 애니메이션 ── */
        @keyframes cuHeartPop {
            0%   { transform:scale(0) rotate(-20deg); opacity:1; }
            50%  { transform:scale(1.4) rotate(10deg); opacity:1; }
            80%  { transform:scale(1) rotate(0); opacity:1; }
            100% { transform:scale(1); opacity:1; }
        }
        .cu-heart-anim { animation:cuHeartPop 0.35s cubic-bezier(.36,.07,.19,.97); }

        @keyframes cuFloatUp {
            0%   { opacity:1; transform:translateY(0) scale(1); }
            100% { opacity:0; transform:translateY(-60px) scale(1.6); }
        }
        .cu-float-heart {
            position:fixed; pointer-events:none; font-size:28px;
            animation:cuFloatUp 0.7s ease-out forwards; z-index:99999;
        }

        /* ── 메시지 액션 메뉴 ── */
        .cu-msg-actions {
            position:fixed; background:white; border-radius:14px;
            box-shadow:0 4px 20px rgba(0,0,0,0.18); z-index:99999;
            overflow:hidden; min-width:150px;
        }
        .cu-msg-action-btn {
            display:flex; align-items:center; gap:10px;
            width:100%; padding:13px 16px; border:none; background:none;
            font-size:14px; cursor:pointer; color:#212121; font-family:inherit;
        }
        .cu-msg-action-btn:active { background:#f5f5f5; }

        /* ── 검색바 ── */
        .cu-search-bar {
            margin:10px 16px 8px; position:relative;
        }
        .cu-search-input {
            width:100%; padding:9px 14px 9px 36px;
            border:none; border-radius:10px; background:#f5f5f5;
            font-size:14px; outline:none; box-sizing:border-box;
            font-family:inherit; color:#212121;
        }
        .cu-search-input::placeholder { color:#aaa; }
        .cu-search-icon {
            position:absolute; left:12px; top:50%;
            transform:translateY(-50%); color:#aaa; font-size:13px; pointer-events:none;
        }

        /* ── 프로필 시트 ── */
        .cu-profile-sheet {
            position:fixed; top:0; left:0; width:100%; height:100%;
            background:rgba(0,0,0,0.45); z-index:99999;
            display:flex; align-items:flex-end; justify-content:center;
        }
        .cu-profile-sheet-inner {
            background:white; width:100%; max-width:600px;
            border-radius:20px 20px 0 0; padding:0 0 32px;
            box-shadow:0 -4px 30px rgba(0,0,0,0.18);
            animation:cuSlideUp 0.25s cubic-bezier(.16,1,.3,1);
        }
        @keyframes cuSlideUp {
            from { transform:translateY(40px); opacity:0.6; }
            to   { transform:translateY(0); opacity:1; }
        }

        /* ── 인풋 영역 ── */
        .cu-input-area {
            background:white; border-top:1px solid #f0f0f0;
            padding:8px 12px 10px; flex-shrink:0;
        }
        .cu-input-row {
            display:flex; align-items:flex-end; gap:8px;
        }
        .cu-input-icon-btn {
            width:38px; height:38px; border-radius:50%;
            border:none; background:#f5f5f5; color:#555;
            cursor:pointer; font-size:15px; flex-shrink:0;
            display:flex; align-items:center; justify-content:center;
            transition:background 0.12s;
        }
        .cu-input-icon-btn:active { background:#e0e0e0; }
        .cu-input-textarea {
            flex:1; border:1.5px solid #e8e8e8; border-radius:22px;
            padding:9px 16px; font-size:14px; resize:none; outline:none;
            font-family:inherit; max-height:120px; overflow-y:auto;
            line-height:1.5; transition:border-color 0.18s; box-sizing:border-box;
            background:white;
        }
        .cu-input-textarea:focus { border-color:#c62828; }
        .cu-send-btn {
            width:40px; height:40px; border-radius:50%; border:none;
            background:#c62828; color:white; cursor:pointer; font-size:16px;
            flex-shrink:0; display:flex; align-items:center; justify-content:center;
            transition:background 0.15s, transform 0.1s;
            box-shadow:0 2px 8px rgba(198,40,40,0.3);
        }
        .cu-send-btn:active { transform:scale(0.92); }

        /* ── 채팅방 헤더 ── */
        .cu-room-header {
            background:white; padding:10px 14px;
            display:flex; align-items:center; gap:10px;
            border-bottom:1px solid #f0f0f0; flex-shrink:0;
        }
        .cu-room-header-center {
            flex:1; display:flex; flex-direction:column;
            align-items:center; cursor:pointer;
        }
        .cu-room-header-name {
            font-size:15px; font-weight:700; color:#212121;
        }
        .cu-room-header-status {
            font-size:11px; color:#aaa; margin-top:1px;
        }
        .cu-header-avatar {
            width:36px; height:36px; border-radius:50%; object-fit:cover;
            border:2px solid #f0f0f0;
        }

        /* ── 날짜 구분선 ── */
        .cu-date-divider {
            text-align:center; margin:12px 0 8px;
            font-size:11px; color:#888; position:relative;
        }
        .cu-date-divider::before {
            content:''; position:absolute; top:50%; left:0; right:0;
            height:1px; background:#e8e8e8; z-index:0;
        }
        .cu-date-divider span {
            background:white; padding:0 10px;
            position:relative; z-index:1;
        }

        /* ── 스크롤바 숨김 ── */ 
        #chatRoomList::-webkit-scrollbar, 
        #chatMessages::-webkit-scrollbar { display:none; } 
        #chatRoomList, #chatMessages { scrollbar-width:none; -ms-overflow-style:none; } 

        /* ── 채팅 배경 ── */
        #chatMessages.cu-bg {
            background:#fafafa !important;
            background-image:none !important;
        }
    `;
    document.head.appendChild(s);
})();

// ===== 헬퍼 =====
function cu_escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function cu_fmtTime(ts) {
    const d = new Date(ts), now = new Date();
    const isSameDay = d.toDateString() === now.toDateString();
    if (isSameDay) return d.toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit' });
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return ['일','월','화','수','목','금','토'][d.getDay()] + '요일';
    return d.toLocaleDateString('ko-KR', { month:'numeric', day:'numeric' });
}
function cu_fmtMsgTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit' });
}
function cu_avatarHTML(photoUrl, size = 56, name = '') {
    const initial = (name || '?')[0].toUpperCase();
    if (photoUrl) return `<img src="${photoUrl}" class="cu-avatar" style="width:${size}px;height:${size}px;">`;
    return `<div class="cu-avatar-placeholder" style="width:${size}px;height:${size}px;">
        <span style="font-size:${Math.round(size*0.4)}px;font-weight:700;color:#9e9e9e;">${initial}</span>
    </div>`;
}
function cu_showToast(msg) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
        background:rgba(0,0,0,0.75);color:white;padding:10px 20px;border-radius:20px;
        font-size:13px;z-index:999999;pointer-events:none;white-space:nowrap;`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
}

// ===== chat.js 의존 함수들은 준비 완료 후 초기화 =====
_waitForChat(function() {
    console.log('✅ Chat-upgrade: window._chat 준비 완료 — 업그레이드 적용');

    // ✅ 채팅 이미지 모달 전역 자동 정리
    // wiki, 더보기 등 다른 섹션으로 이동 시 열린 모달 자동 닫기
    (function() {
        function _cleanChatModal() {
            document.getElementById('_chatImgModal')?.remove();
        }
        // popstate: URL 변경 시
        window.addEventListener('popstate', _cleanChatModal);
        // 페이지 숨김 시 (모바일 홈 버튼 등)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') _cleanChatModal();
        });
        // hideAll이 호출될 때 (다른 섹션 이동 시 script.js에서 호출)
        const _origHideAll = window.hideAll;
        if (typeof _origHideAll === 'function') {
            window.hideAll = function() {
                _cleanChatModal();
                return _origHideAll.apply(this, arguments);
            };
        }
    })();

// ===== 1. 채팅 목록 페이지 (완전 재작성) =====
window.showChatPage = async function () {
    // ✅ 다른 페이지 이동 전 이미지 모달 제거
    document.getElementById('_chatImgModal')?.remove();
    if (!isLoggedIn()) { alert('로그인이 필요합니다!'); return; }
    if (!window._chat) { alert('채팅 초기화 중입니다. 잠시 후 다시 시도해주세요.'); return; }
    if (!window._chat.isChatAuthReady()) {
        cu_showToast('⚠️ 채팅 인증 중...');
        await window._chat.syncChatAuth(auth.currentUser);
        if (!window._chat.isChatAuthReady()) {
            if (typeof window._showChatAuthExpiredBanner === 'function') {
                window._showChatAuthExpiredBanner();
            } else {
                cu_showToast('⚠️ 채팅 인증에 실패했습니다. 페이지를 새로고침해 주세요.');
            }
            return;
        }
    }
    if (window._chat.chatMsgListener && window._chat.activeChatRoomId) {
        window._chat.getChatDb().ref(`chats/${window._chat.activeChatRoomId}/messages`).off('value', window._chat.chatMsgListener);
        window._chat.chatMsgListener = null; window._chat.activeChatRoomId = null;
    }
    document.querySelectorAll('.page-section').forEach(s => { s.style.cssText = ''; });
    hideAll();
    window.scrollTo(0, 0);

    let section = document.getElementById('chatSection');
    if (!section) {
        section = document.createElement('section');
        section.id = 'chatSection'; section.className = 'page-section';
        (document.querySelector('main') || document.body).appendChild(section);
    }
    section.classList.add('active');

    section.innerHTML = `
        <div style="max-width:600px;width:100%;margin:0 auto;
            display:flex;flex-direction:column;height:100%;overflow:hidden;background:white;">

            <!-- 헤더 -->
            <div style="padding:14px 16px 0;display:flex;align-items:center;
                justify-content:space-between;flex-shrink:0;background:white;">
                <button onclick="showMoreMenu()"
                    style="width:38px;height:38px;border-radius:50%;border:none;
                    background:none;font-size:18px;cursor:pointer;color:#212121;
                    display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <span style="font-size:18px;font-weight:800;color:#212121;">채팅</span>
                <div style="display:flex;gap:4px;">
                    <button onclick="showMyChatProfile()"
                        style="width:38px;height:38px;border-radius:50%;border:none;
                        background:none;font-size:17px;cursor:pointer;color:#212121;
                        display:flex;align-items:center;justify-content:center;"
                        title="내 프로필">
                        <i class="fas fa-user-circle"></i>
                    </button>
                    <button onclick="showNewChatModal()"
                        style="width:38px;height:38px;border-radius:50%;border:none;
                        background:none;font-size:18px;cursor:pointer;color:#212121;
                        display:flex;align-items:center;justify-content:center;"
                        title="새 채팅">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>

            <!-- 검색바 -->
            <div class="cu-search-bar" style="margin:10px 16px 4px;">
                <i class="fas fa-search cu-search-icon"></i>
                <input class="cu-search-input" id="cuChatSearchInput"
                    placeholder="검색" oninput="cu_filterRooms(this.value)">
            </div>

            <!-- 채팅 목록 -->
            <div id="chatRoomList"
                style="flex:1;overflow-y:auto;overflow-x:hidden;background:white;-webkit-overflow-scrolling:touch;">
                <div style="text-align:center;padding:60px 20px;color:#bbb;">
                    <i class="fas fa-spinner fa-spin" style="font-size:28px;"></i>
                    <p style="margin-top:12px;font-size:14px;">불러오는 중...</p>
                </div>
            </div>
        </div>`;

    updateURL('chat');
    await cu_loadChatRoomList();
    window._chat.updateBadge();
};

// ===== 채팅 목록 렌더링 (인스타 스타일) =====
async function cu_loadChatRoomList() {
    const myUid   = window._chat.getChatUserId();
    const mainUid = auth.currentUser?.uid;
    const listEl  = document.getElementById('chatRoomList');
    if (!listEl) return;

    try {
        const myRoomsSnap = await window._chat.getChatDb().ref(`userChats/${myUid}`).once('value');
        const myRoomIds   = Object.keys(myRoomsSnap.val() || {});

        if (!myRoomIds.length) {
            listEl.innerHTML = `
                <div style="text-align:center;padding:70px 20px;color:#bbb;">
                    <i class="fas fa-comment-slash" style="font-size:52px;margin-bottom:18px;display:block;"></i>
                    <p style="font-size:16px;font-weight:600;color:#555;margin-bottom:6px;">아직 채팅이 없어요</p>
                    <p style="font-size:13px;color:#aaa;margin-bottom:20px;">연필 버튼을 눌러 시작해보세요</p>
                    <button onclick="showNewChatModal()"
                        style="background:#c62828;color:white;border:none;
                        padding:11px 28px;border-radius:22px;cursor:pointer;font-size:14px;font-weight:700;">
                        새 채팅 시작
                    </button>
                </div>`;
            return;
        }

        const [chatSnaps, usersSnap] = await Promise.all([
            Promise.all(myRoomIds.map(id => window._chat.getChatDb().ref(`chats/${id}`).once('value'))),
            db.ref('users').once('value')
        ]);
        const usersData = usersSnap.val() || {};

        let rooms = chatSnaps
            .map(s => [s.key, s.val()])
            .filter(([_, c]) => c !== null)
            .sort((a, b) => (b[1].lastMessageAt || 0) - (a[1].lastMessageAt || 0));

        listEl.innerHTML = '';

        for (const [roomId, chat] of rooms) {
            const isGroup = !!chat.isGroup;
            let displayName, photoUrl, friendUid, friendMainUid;

            if (isGroup) {
                displayName   = chat.groupName || '그룹 채팅';
                photoUrl      = null;
                friendUid     = null; friendMainUid = null;
            } else {
                const friendChatUid = Object.keys(chat.participants || {}).find(u => u !== myUid);
                friendMainUid = chat.mainUids?.[friendChatUid]
                    || Object.keys(usersData).find(uid => usersData[uid]?.chatUid === friendChatUid) || null;
                const friend  = usersData[friendMainUid] || {};
                displayName   = window._chat.resolveNickname(friend);
                photoUrl      = friend.profilePhoto || null;
                friendUid     = friendChatUid;
            }

            let unread = 0;
            if (chat.messages)
                unread = Object.values(chat.messages).filter(m => !m.read && m.senderId !== myUid).length;

            const timeStr = chat.lastMessageAt ? cu_fmtTime(chat.lastMessageAt) : '';
            const lastMsg = chat.lastMessage || '';
            const isBold  = unread > 0;

            const item = document.createElement('div');
            item.className = 'cu-list-row';
            item.dataset.roomId    = roomId;
            item.dataset.name      = displayName.toLowerCase();
            item.dataset.friendUid = friendUid || ''; // ✅ 별명 DOM 적용용

            // 아바타
            const avatarWrap = document.createElement('div');
            avatarWrap.className = 'cu-avatar-wrap';
            if (isGroup) {
                avatarWrap.innerHTML = `
                    <div class="cu-avatar-placeholder" style="background:linear-gradient(135deg,#c62828,#e53935);">
                        <i class="fas fa-users" style="color:white;font-size:22px;"></i>
                    </div>`;
            } else {
                avatarWrap.innerHTML = cu_avatarHTML(photoUrl, 56, displayName);
                // 아바타 클릭 → 프로필 시트
                if (friendMainUid) {
                    avatarWrap.style.cursor = 'pointer';
                    avatarWrap.onclick = (e) => {
                        e.stopPropagation();
                        showChatProfileSheet(friendMainUid);
                    };
                }
            }
            if (unread > 0) {
                const dot = document.createElement('div');
                dot.className = 'cu-unread-dot';
                avatarWrap.appendChild(dot);
            }

            // 내용
            const body = document.createElement('div');
            body.style.cssText = 'flex:1;min-width:0;';
            body.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;">
                    <span style="font-weight:${isBold ? '700' : '600'};font-size:15px;color:#212121;
                        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;">
                        ${cu_escapeHTML(displayName)}
                    </span>
                    <span style="font-size:11px;color:${isBold ? '#c62828' : '#aaa'};flex-shrink:0;margin-left:8px;
                        font-weight:${isBold ? '600' : '400'};">
                        ${timeStr}
                    </span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-size:13px;color:${isBold ? '#212121' : '#999'};
                        font-weight:${isBold ? '600' : '400'};
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;">
                        ${cu_escapeHTML(lastMsg || '대화를 시작해보세요')}
                    </span>
                    ${unread > 0 ? `<span class="cu-unread-badge">${unread > 99 ? '99+' : unread}</span>` : ''}
                </div>`;

            item.onclick = () => openChatRoom(roomId, friendUid, displayName, photoUrl, friendMainUid);
            item.appendChild(avatarWrap);
            item.appendChild(body);
            listEl.appendChild(item);
        }

        // 검색 필터 유지
        const searchVal = document.getElementById('cuChatSearchInput')?.value;
        if (searchVal) cu_filterRooms(searchVal);

    } catch (err) {
        listEl.innerHTML = `<div style="text-align:center;padding:40px;color:#c62828;font-size:13px;">
            ❌ 로드 실패: ${err.message}</div>`;
    }
}

        window.cu_loadChatRoomList = cu_loadChatRoomList; // ✅ Chat-nickname-dot.js 패치용 전역 노출

window.cu_filterRooms = function(kw) {
    const q = kw.toLowerCase();
    document.querySelectorAll('#chatRoomList .cu-list-row').forEach(row => {
        row.style.display = (!q || (row.dataset.name || '').includes(q)) ? 'flex' : 'none';
    });
};

// ===== 2. 채팅방 (완전 재작성 — 인스타 스타일) =====
const _origOpenChatRoom = window.openChatRoom;
window.openChatRoom = async function (roomId, friendUid, friendName, friendPhoto, friendMainUid) {
    if (window._chat.chatMsgListener && window._chat.activeChatRoomId) {
        window._chat.getChatDb().ref(`chats/${window._chat.activeChatRoomId}/messages`).off('value', window._chat.chatMsgListener);
        window._chat.chatMsgListener = null;
    }
    window._chat.activeChatRoomId = roomId;

    const myUid    = window._chat.getChatUserId();
    const isGroup  = roomId.startsWith('group_');

    // 최신 친구 프로필 로드
    let latestPhoto = friendPhoto;
    let latestName  = friendName;
    if (friendMainUid && !isGroup) {
        try {
            const snap = await db.ref(`users/${friendMainUid}`).once('value');
            const u = snap.val() || {};
            latestPhoto = u.profilePhoto || friendPhoto || null;
            latestName  = window._chat.resolveNickname(u) || friendName;
        } catch(e) {}
    }

    let section = document.getElementById('chatSection');
    if (!section) {
        section = document.createElement('section');
        section.id = 'chatSection'; section.className = 'page-section';
        (document.querySelector('main') || document.body).appendChild(section);
    }
    section.classList.add('active');

    // 헤더 아바타
    const headerAvatarHTML = isGroup
        ? `<div style="width:36px;height:36px;border-radius:50%;
            background:linear-gradient(135deg,#c62828,#e53935);
            display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="fas fa-users" style="color:white;font-size:16px;"></i></div>`
        : cu_avatarHTML(latestPhoto, 36, latestName);

    const headerClickTarget = (!isGroup && friendMainUid)
        ? `onclick="showChatProfileSheet('${friendMainUid}')"` : '';

    section.innerHTML = `
        <div style="max-width:600px;width:100%;margin:0 auto;
            display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;background:white;">

            <!-- 헤더 -->
            <div class="cu-room-header" style="flex-shrink:0;">
                <button onclick="showChatPage()"
                    style="width:38px;height:38px;border-radius:50%;border:none;background:none;
                    cursor:pointer;font-size:18px;color:#212121;display:flex;align-items:center;
                    justify-content:center;flex-shrink:0;">
                    <i class="fas fa-arrow-left"></i>
                </button>

                <div class="cu-room-header-center" ${headerClickTarget} style="cursor:${(!isGroup && friendMainUid) ? 'pointer' : 'default'};">
                    <div style="display:flex;align-items:center;gap:8px;">
                        ${headerAvatarHTML}
                        <div>
                            <div class="cu-room-header-name" data-roomtitle>${cu_escapeHTML(latestName)}</div>
                            <div class="cu-room-header-status" id="cuRoomStatus">활동 중</div>
                        </div>
                    </div>
                </div>

                <div style="display:flex;gap:2px;flex-shrink:0;">
                    <button onclick="showRoomMenu('${roomId}','${isGroup}')"
                        style="width:38px;height:38px;border-radius:50%;border:none;background:none;
                        cursor:pointer;font-size:18px;color:#212121;display:flex;align-items:center;
                        justify-content:center;">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>

            <!-- 메시지 영역 -->
            <div id="chatMessages" class="cu-bg"
                style="flex:1;overflow-y:auto;overflow-x:hidden;padding:10px 12px 6px;
                display:flex;flex-direction:column;gap:2px;
                min-height:0;-webkit-overflow-scrolling:touch;">
                <div style="text-align:center;color:#ccc;margin:auto;font-size:13px;">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            </div>

            <!-- 답장 미리보기 -->
            <div id="cuReplyPreview" style="display:none;flex-shrink:0;"></div>

            <!-- 사진 미리보기 -->
            <div id="chatImgPreview" style="display:none;flex-shrink:0;padding:8px 14px 4px;position:relative;border-bottom:1px solid #f0f0f0;">
                <div style="position:relative;display:inline-block;">
                    <img id="chatImgPreviewImg"
                        style="max-height:100px;max-width:180px;border-radius:10px;
                               object-fit:cover;border:1.5px solid #e0e0e0;">
                    <button onclick="clearChatImage()"
                        style="position:absolute;top:-6px;right:-6px;background:#333;color:white;
                               border:2px solid white;border-radius:50%;width:20px;height:20px;
                               font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="font-size:11px;color:#aaa;margin-top:4px;">사진이 첨부되었습니다.</div>
            </div>

            <!-- 파일 미리보기 -->
            <div id="chatFilePreview_${roomId}"
                style="display:none;flex-shrink:0;padding:6px 14px;gap:6px;flex-wrap:wrap;border-bottom:1px solid #f0f0f0;">
            </div>

            <!-- 입력 영역 -->
            <div class="cu-input-area" style="flex-shrink:0;">
                <input type="file" id="chatImageInput" accept="image/*" style="display:none;"
                    onchange="previewChatImage(this)">
                <input type="file" id="chatFileInput" multiple accept="*/*" style="display:none;"
                    onchange="previewChatFiles(this,'${roomId}')">
                <div class="cu-input-row">
                    <button class="cu-input-icon-btn"
                        onclick="document.getElementById('chatImageInput').click()" title="사진">
                        <i class="fas fa-camera"></i>
                    </button>
                    <button class="cu-input-icon-btn"
                        onclick="document.getElementById('chatFileInput').click()" title="파일">
                        <i class="fas fa-paperclip"></i>
                    </button>
                    <textarea id="chatInput" class="cu-input-textarea"
                        placeholder="메시지 입력..." rows="1"
                        onkeydown="handleChatKeydown(event,'${roomId}')"
                        oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px';cu_updateSendBtn()"></textarea>
                    <button id="cuSendBtn" class="cu-send-btn"
                        onclick="cu_sendMsg('${roomId}')">
                        <i class="fas fa-paper-plane" style="font-size:15px;"></i>
                    </button>
                </div>
            </div>
        </div>`;

    // 활성 리스너
    if (window._readReceiptListener && window._readReceiptRoomId) {
        window._chat.getChatDb().ref(`chats/${window._readReceiptRoomId}/readReceipts`).off('value', window._readReceiptListener);
    }
    window._readReceiptRoomId = roomId;
    window._readReceipts = {};

    window._readReceiptListener = window._chat.getChatDb().ref(`chats/${roomId}/readReceipts`)
        .on('value', snap => {
            window._readReceipts = snap.val() || {};
            const msgs = window._lastMsgs || {};
            window._chat.updateReadAvatars(msgs, myUid, roomId);
        });

    // 메시지 실시간 리스너
    window._chat.chatMsgListener = window._chat.getChatDb().ref(`chats/${roomId}/messages`)
        .orderByChild('timestamp').on('value', snap => {
            const msgs = snap.val() || {};
            window._lastMsgs = msgs;
            cu_renderMessages(msgs, myUid, roomId, friendMainUid);
            window._chat.markAsRead(roomId, myUid);
        });

    // ✅ PC 힌트 - cu-input-area 상단에 삽입 (중복 방지)
    if (!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        const existing = document.querySelector('.cu-pc-hint');
        if (!existing) {
            const hint = document.createElement('div');
            hint.className = 'cu-pc-hint';
            hint.style.cssText = 'font-size:11px;color:#bbb;padding:2px 14px 0;text-align:right;flex-shrink:0;';
            hint.textContent = 'Shift+Enter로 줄바꿈';
            const inputArea = document.querySelector('.cu-input-area');
            if (inputArea) inputArea.insertBefore(hint, inputArea.firstChild);
        }
    }
};

// ===== 메시지 렌더링 (인스타 스타일) =====
function cu_renderMessages(msgs, myUid, roomId, friendMainUid) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const wasAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 60;
    const prevCount   = container.querySelectorAll('[data-msgid]').length;
    const msgEntries  = Object.entries(msgs).sort((a,b) => (a[1].timestamp||0)-(b[1].timestamp||0));
    if (msgEntries.length === prevCount) {
        window._chat.updateReadAvatars(msgs, myUid, roomId);
        return;
    }

    container.innerHTML = '';
    let lastDate = null;

    for (const [msgId, msg] of msgEntries) {
        const isMe = msg.senderId === myUid;

        // ── 날짜 구분선
        const msgDate = new Date(msg.timestamp).toDateString();
        if (msgDate !== lastDate) {
            lastDate = msgDate;
            const divider = document.createElement('div');
            divider.className = 'cu-date-divider';
            const d = new Date(msg.timestamp);
            divider.innerHTML = `<span>${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일</span>`;
            container.appendChild(divider);
        }

        // ── 삭제된 메시지
        if (msg.deleted) {
            const del = document.createElement('div');
            del.style.cssText = `text-align:${isMe ? 'right' : 'left'};
                font-size:12px;color:#bbb;font-style:italic;padding:2px 14px;`;
            del.textContent = isMe ? '삭제된 메시지입니다' : '삭제된 메시지';
            container.appendChild(del);
            continue;
        }

        // ── 메시지 래퍼
        const msgEl = document.createElement('div');
        msgEl.dataset.msgid = msgId;
        msgEl.style.cssText = `display:flex;flex-direction:column;
            align-items:${isMe ? 'flex-end' : 'flex-start'};margin:2px 0;`;

        // ── 발신자 이름 (상대방, 그룹이거나 첫 메시지)
        if (!isMe && msg.senderName) {
            const nameEl = document.createElement('div');
            nameEl.style.cssText = 'font-size:11px;color:#888;margin-left:12px;margin-bottom:2px;font-weight:600;';
            nameEl.textContent = msg.senderName;
            msgEl.appendChild(nameEl);
        }

        // ── 버블 + 시간 row
        const bubbleRow = document.createElement('div');
        bubbleRow.style.cssText = `display:flex;align-items:flex-end;gap:5px;
            max-width:80%;${isMe ? 'flex-direction:row-reverse;' : ''}`;

        // ── 버블
        const bubble = document.createElement('div');
        bubble.className = `cu-msg-bubble ${isMe ? 'mine' : 'theirs'}`;
        bubble.dataset.msgid = msgId;
        bubble.style.position = 'relative';

        // ✅ 이미지 버블 (확대 + 다운로드 버튼)
        if (msg.imageBase64) {
            bubble.classList.add('img-only');
            // ✅ _lastMsgs[msgId]에서 직접 읽기 위해 msgId만 data 속성에 저장
            bubble.dataset.chatImgId = msgId;
            bubble.innerHTML = `
                <div style="position:relative;display:inline-block;line-height:0;">
                    <img src="${msg.imageBase64}"
                        style="max-width:220px;max-height:260px;border-radius:14px;
                               display:block;cursor:zoom-in;vertical-align:bottom;"
                        onclick="event.stopPropagation();cu_openImgModal('${msgId}')">
                    <!-- ✅ 다운로드 버튼 -->
                    <button onclick="event.stopPropagation();cu_downloadImg('${msgId}')"
                        title="다운로드"
                        style="position:absolute;bottom:8px;right:8px;width:32px;height:32px;
                               border-radius:50%;border:none;cursor:pointer;
                               background:rgba(0,0,0,0.5);color:white;
                               display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-download" style="font-size:13px;pointer-events:none;"></i>
                    </button>
                    <!-- ✅ 메뉴 버튼 (내 사진에만) - 삭제/답장 접근 -->
                    ${isMe ? `<button onclick="event.stopPropagation();cu_showMsgMenu('${msgId}','${roomId}',this.closest('.cu-msg-bubble'),true)"
                        title="메뉴"
                        style="position:absolute;top:8px;right:8px;width:28px;height:28px;
                               border-radius:50%;border:none;cursor:pointer;
                               background:rgba(0,0,0,0.45);color:white;
                               display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-ellipsis-h" style="font-size:11px;pointer-events:none;"></i>
                    </button>` : ''}
                </div>`;
            if (msg.text) {
                bubble.classList.remove('img-only');
                bubble.style.padding = '6px';
                bubble.innerHTML += `<div style="padding:6px 8px 2px;font-size:14px;">${cu_escapeHTML(msg.text)}</div>`;
            }
        } else if (msg.fileName) {
            const icon = window.getChatFileIcon ? window.getChatFileIcon(msg.fileType || '') : '📎';
            const sizeStr = msg.fileSize > 1048576
                ? (msg.fileSize/1048576).toFixed(1)+' MB'
                : Math.round((msg.fileSize||0)/1024)+' KB';
            bubble.dataset.fileId = msgId;
            bubble.innerHTML = `
                <div style="display:flex;align-items:center;gap:10px;min-width:180px;">
                    <div style="width:38px;height:38px;border-radius:8px;flex-shrink:0;
                        background:${isMe ? 'rgba(255,255,255,0.2)' : '#e8eaf6'};
                        display:flex;align-items:center;justify-content:center;font-size:20px;">${icon}</div>
                    <div style="min-width:0;flex:1;">
                        <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;
                            text-overflow:ellipsis;color:${isMe ? 'white' : '#212121'};">${cu_escapeHTML(msg.fileName)}</div>
                        <div style="font-size:11px;color:${isMe ? 'rgba(255,255,255,0.7)' : '#aaa'};">${sizeStr}</div>
                    </div>
                    <button onclick="event.stopPropagation(); window.downloadChatFile && window.downloadChatFile('${msgId}')"
                        style="width:30px;height:30px;border-radius:50%;border:none;cursor:pointer;
                        background:${isMe ? 'rgba(255,255,255,0.25)' : '#e8f0fe'};
                        color:${isMe ? 'white' : '#1565c0'};display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-download" style="font-size:12px;"></i>
                    </button>
                </div>`;
        } else if (msg.text) {
            // 답장 미리보기
            let replyHTML = '';
            if (msg.replyTo) {
                const orig = (window._lastMsgs || {})[msg.replyTo];
                replyHTML = `<div style="border-left:2px solid ${isMe ? 'rgba(255,255,255,0.5)' : '#c62828'};
                    padding:3px 8px;margin-bottom:6px;border-radius:4px;
                    background:${isMe ? 'rgba(255,255,255,0.15)' : 'rgba(198,40,40,0.07)'};">
                    <div style="font-size:11px;color:${isMe ? 'rgba(255,255,255,0.7)' : '#c62828'};
                        font-weight:600;margin-bottom:1px;">${cu_escapeHTML(orig?.senderName || '원본 메시지')}</div>
                    <div style="font-size:12px;color:${isMe ? 'rgba(255,255,255,0.85)' : '#666'};
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;">
                        ${cu_escapeHTML((orig?.text || '').substring(0, 50) || '(사진/파일)')}</div>
                </div>`;
            }
            // 링크 감지
            const linkified = cu_escapeHTML(msg.text).replace(
                /(https?:\/\/[^\s<>"']+)/g,
                `<a href="$1" target="_blank" rel="noopener"
                    style="color:${isMe ? '#ffcdd2' : '#1565c0'};text-decoration:underline;">$1</a>`
            ).replace(/\n/g, '<br>');
            bubble.innerHTML = replyHTML + linkified;
            if (msg.edited) {
                bubble.innerHTML += `<span style="font-size:10px;opacity:0.6;margin-left:4px;">(수정됨)</span>`;
            }
        }

        // 리액션 표시
        if (msg.reactions && Object.keys(msg.reactions).length > 0) {
            const rxCounts = {};
            Object.values(msg.reactions).forEach(r => { rxCounts[r] = (rxCounts[r]||0)+1; });
            const rxEl = document.createElement('div');
            rxEl.className = `cu-reaction ${isMe ? 'mine' : 'theirs'}`;
            rxEl.innerHTML = Object.entries(rxCounts)
                .map(([emoji, cnt]) => `${emoji}${cnt > 1 ? ` <span style="font-size:11px;">${cnt}</span>` : ''}`)
                .join(' ');
            rxEl.onclick = (e) => { e.stopPropagation(); cu_showReactionDetail(msgId); };
            bubble.appendChild(rxEl);
            bubble.style.marginBottom = '18px';
        }

        // ── 이벤트: 클릭 / 더블탭
        let tapTimer = null, tapCount = 0;
        bubble.addEventListener('click', (e) => {
            // IMG/BUTTON 클릭은 각자 inline onclick이 처리 (stopPropagation)
            if (e.target.tagName === 'A' || e.target.tagName === 'IMG' ||
                e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

            if (isMe) {
                // 내 메시지: 클릭 → 수정/삭제 메뉴
                cu_showMsgMenu(msgId, roomId, bubble, isMe);
                return;
            }

            // ✅ 상대방 메시지: 단순 클릭 → 공감/답장/복사 메뉴 (수정/삭제 제외)
            // 더블탭(300ms 내 2번 클릭) → ❤️ 바로 반응
            tapCount++;
            if (tapCount === 1) {
                tapTimer = setTimeout(() => {
                    tapCount = 0;
                    cu_showMsgMenu(msgId, roomId, bubble, false);
                }, 300);
            } else if (tapCount >= 2) {
                clearTimeout(tapTimer); tapCount = 0;
                cu_toggleReaction(msgId, roomId, '❤️', e);
            }
        });

        // ── 이벤트: 길게 누르기 = 메시지 메뉴 (내/상대 공통)
        let pressTimer = null;
        bubble.addEventListener('pointerdown', (e) => {
            pressTimer = setTimeout(() => { cu_showMsgMenu(msgId, roomId, bubble, isMe); }, 500);
        });
        bubble.addEventListener('pointerup',   () => clearTimeout(pressTimer));
        bubble.addEventListener('pointermove', () => clearTimeout(pressTimer));

        // ── 시간 + 읽음
        const timeEl = document.createElement('div');
        timeEl.style.cssText = 'font-size:10px;color:#aaa;flex-shrink:0;margin-bottom:2px;';
        timeEl.textContent = cu_fmtMsgTime(msg.timestamp);

        bubbleRow.appendChild(bubble);
        bubbleRow.appendChild(timeEl);
        msgEl.appendChild(bubbleRow);

        // ── readSlot은 msgEl 직접 자식으로 (bubbleRow 밖 → 가로 넘침 방지)
        if (isMe) {
            const avatarSlot = document.createElement('div');
            avatarSlot.id = `readSlot-${msgId}`;
            avatarSlot.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;gap:2px;min-width:0;padding-right:4px;';
            msgEl.appendChild(avatarSlot);
        }

        container.appendChild(msgEl);
    }

    // ✅ 스크롤 타이밍 수정
    // prevCount===0(첫 로드): chatSection이 방금 display:flex가 되어 레이아웃이 아직 미완료
    // → setTimeout으로 브라우저 레이아웃 완료 후 스크롤
    if (prevCount === 0) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 50);
    } else if (wasAtBottom) {
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    }
    window._chat.updateReadAvatars(msgs, myUid, roomId);
}

// ===== 전송 버튼 상태 갱신 =====
window.cu_updateSendBtn = function () {
    // optional: 텍스트 없을 때 카메라 아이콘으로 전환 가능
};

// ===== 메시지 전송 (sendChatMessage 위임) =====
window.cu_sendMsg = function (roomId) {
    // 답장 ID 첨부
    const replyId = window._cuReplyMsgId || null;
    if (replyId) {
        window._cuPendingReplyId = replyId;
        cu_clearReply();
    }
    sendChatMessage(roomId);
};

// sendChatMessage 패치: replyTo 필드 포함
const _origSendChatMessage = window.sendChatMessage;
window.sendChatMessage = async function (roomId) {
    // _cuPendingReplyId가 있으면 메시지에 첨부
    if (window._cuPendingReplyId) {
        window._tempReplyTo = window._cuPendingReplyId;
        delete window._cuPendingReplyId;
    }
    await _origSendChatMessage(roomId);
    delete window._tempReplyTo;
};

// messagesRef.push 패치는 어렵지만 replyTo 전달을 위해
// sendChatMessage 내에서 msgData에 replyTo 포함시키도록 monkeypatch
const _origPush = window.getChatDb ? null : null; // 핵: sendChatMessage 실행 중에 replyTo 주입
// → 대신 cu_sendMsg에서 직접 처리
window.cu_sendMsgWithReply = async function(roomId) {
    const input   = document.getElementById('chatInput');
    const text    = input?.value.trim();
    const replyTo = window._cuReplyMsgId || null;
    if (replyTo) cu_clearReply();
    if (!text && !document.getElementById('chatImageInput')?.files?.[0]
               && !document.getElementById('chatFileInput')?.files?.length) return;
    const myUid  = window._chat.getChatUserId();
    const myName = window._chat.getMyNickname();
    const ts     = Date.now();
    if (text) {
        const msgData = { senderId:myUid, senderName:myName, text, timestamp:ts, read:false };
        if (replyTo) msgData.replyTo = replyTo;
        await window._chat.getChatDb().ref(`chats/${roomId}/messages`).push(msgData);
        if (input) { input.value = ''; input.style.height = 'auto'; }
        await window._chat.getChatDb().ref(`chats/${roomId}`).update({ lastMessage:text, lastMessageAt:ts });
    } else {
        await _origSendChatMessage(roomId);
    }
};

// ===== 답장 기능 =====
window.cu_setReply = function(msgId) {
    document.getElementById('_chatMsgMenu')?.remove();
    const msg = (window._lastMsgs || {})[msgId];
    if (!msg) return;
    window._cuReplyMsgId = msgId;
    let preview = document.getElementById('cuReplyPreview');
    if (!preview) return;
    preview.style.display = 'block';
    preview.innerHTML = `
        <div class="cu-reply-bar">
            <i class="fas fa-reply" style="color:#c62828;flex-shrink:0;"></i>
            <div style="flex:1;min-width:0;">
                <div style="font-size:11px;font-weight:700;color:#c62828;">${cu_escapeHTML(msg.senderName||'')}</div>
                <div style="font-size:12px;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${cu_escapeHTML((msg.text||'').substring(0,60)||(msg.imageBase64?'📷 사진':'📎 파일'))}
                </div>
            </div>
            <button onclick="cu_clearReply()"
                style="border:none;background:none;color:#aaa;font-size:18px;cursor:pointer;flex-shrink:0;">✕</button>
        </div>`;
    document.getElementById('chatInput')?.focus();
};
window.cu_clearReply = function() {
    delete window._cuReplyMsgId;
    const el = document.getElementById('cuReplyPreview');
    if (el) { el.style.display = 'none'; el.innerHTML = ''; }
};

// ===== 리액션 토글 =====
window.cu_toggleReaction = async function(msgId, roomId, emoji, e) {
    if (!isLoggedIn()) return;
    const myUid = window._chat.getChatUserId();
    const ref   = window._chat.getChatDb().ref(`chats/${roomId}/messages/${msgId}/reactions/${myUid}`);
    const snap  = await ref.once('value');
    if (snap.val() === emoji) {
        await ref.remove(); // 같은 이모지면 취소
    } else {
        await ref.set(emoji);
        // 하트 떠오르는 애니메이션
        if (e) {
            const floater = document.createElement('div');
            floater.className = 'cu-float-heart';
            floater.textContent = emoji;
            floater.style.left = (e.clientX - 14) + 'px';
            floater.style.top  = (e.clientY - 14) + 'px';
            document.body.appendChild(floater);
            setTimeout(() => floater.remove(), 700);
        }
    }
};

// ===== 메시지 액션 메뉴 (길게 누르기) =====
window.cu_showMsgMenu = function(msgId, roomId, el, isMe) {
    document.getElementById('_chatMsgMenu')?.remove();
    const msg  = (window._lastMsgs || {})[msgId];
    const rect = el.getBoundingClientRect();
    const top  = Math.min(rect.bottom + 6, window.innerHeight - 220);

    const menu = document.createElement('div');
    menu.id = '_chatMsgMenu';
    menu.className = 'cu-msg-actions';
    menu.style.cssText = `top:${top}px;${isMe ? `right:${window.innerWidth-rect.right}px;` : `left:${rect.left}px;`}`;

    // 리액션 이모지 행
    const emojis = ['❤️','😂','😮','😢','👍','🔥'];
    const rxRow = document.createElement('div');
    rxRow.style.cssText = 'display:flex;justify-content:space-around;padding:10px 12px;border-bottom:1px solid #f5f5f5;';
    emojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.style.cssText = 'font-size:22px;border:none;background:none;cursor:pointer;padding:2px 4px;transition:transform 0.1s;';
        btn.textContent = emoji;
        btn.onclick = (e) => { menu.remove(); cu_toggleReaction(msgId, roomId, emoji, e); };
        btn.onmouseenter = () => { btn.style.transform='scale(1.3)'; };
        btn.onmouseleave = () => { btn.style.transform='scale(1)'; };
        rxRow.appendChild(btn);
    });
    menu.appendChild(rxRow);

    const actions = [
        { icon:'fas fa-reply', label:'답장', color:'#1565c0', fn: () => cu_setReply(msgId) },
        ...(msg?.imageBase64 ? [{ icon:'fas fa-download', label:'다운로드', color:'#1565c0',
            fn: () => cu_downloadImg(msgId) }] : []),
        ...(msg?.text ? [{ icon:'fas fa-copy', label:'복사', color:'#555',
            fn: () => { navigator.clipboard?.writeText(msg.text).then(() => cu_showToast('복사됐어요!')); }}] : []),
        ...(isMe && msg?.text ? [{ icon:'fas fa-pencil-alt', label:'수정', color:'#405de6',
            fn: () => editChatMessage(msgId, roomId) }] : []),
        ...(isMe ? [{ icon:'fas fa-trash-alt', label:'삭제 🗑️', color:'#e53935',
            fn: () => { if (confirm('이 메시지를 삭제하시겠습니까?')) deleteChatMessage(msgId, roomId); }}] : []),
    ];

    actions.forEach(({ icon, label, color, fn }) => {
        const btn = document.createElement('button');
        btn.className = 'cu-msg-action-btn';
        btn.innerHTML = `<i class="${icon}" style="color:${color};width:18px;text-align:center;"></i> ${label}`;
        btn.onclick = () => { menu.remove(); fn(); };
        menu.appendChild(btn);
    });

    document.body.appendChild(menu);
    setTimeout(() => {
        document.addEventListener('click', function h(e) {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', h); }
        });
    }, 80);
};

// ===== 3. 프로필 시트 =====
window.showChatProfileSheet = async function(mainUid) {
    document.getElementById('_cuProfileSheet')?.remove();
    if (!mainUid) return;

    let userData = {};
    try {
        const snap = await db.ref(`users/${mainUid}`).once('value');
        userData = snap.val() || {};
    } catch(e) {}

    const name    = window._chat.resolveNickname(userData) || '알 수 없음';
    const photo   = userData.profilePhoto || null;
    const email   = userData.email || '';
    const isSelf  = auth.currentUser?.uid === mainUid;

    const sheet = document.createElement('div');
    sheet.id = '_cuProfileSheet';
    sheet.className = 'cu-profile-sheet';
    sheet.innerHTML = `
        <div class="cu-profile-sheet-inner">
            <!-- 핸들 -->
            <div style="text-align:center;padding:14px 0 8px;">
                <div style="width:36px;height:4px;border-radius:2px;background:#e0e0e0;display:inline-block;"></div>
            </div>

            <!-- 프로필 정보 -->
            <div style="display:flex;flex-direction:column;align-items:center;padding:10px 20px 20px;">
                <div style="position:relative;margin-bottom:14px;">
                    ${cu_avatarHTML(photo, 90, name)}
                    ${isSelf ? `
                    <button onclick="cu_promptProfilePhoto()"
                        style="position:absolute;bottom:2px;right:2px;width:28px;height:28px;
                        border-radius:50%;border:2px solid white;background:#c62828;color:white;
                        cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-camera"></i>
                    </button>` : ''}
                </div>

                <div style="font-size:20px;font-weight:800;color:#212121;text-align:center;">${cu_escapeHTML(name)}</div>
                <div style="font-size:13px;color:#aaa;margin-top:4px;">${cu_escapeHTML(email)}</div>

                ${userData.bio ? `<div style="font-size:13px;color:#555;margin-top:10px;text-align:center;
                    max-width:280px;line-height:1.5;">${cu_escapeHTML(userData.bio)}</div>` : ''}
            </div>

            <!-- 액션 버튼들 -->
            <div style="display:flex;gap:10px;padding:0 20px 8px;">
                ${isSelf ? `
                <button onclick="document.getElementById('_cuProfileSheet').remove();showChatNameChange()"
                    style="flex:1;padding:12px;border:1.5px solid #e0e0e0;border-radius:12px;
                    background:white;font-size:14px;font-weight:600;color:#212121;cursor:pointer;
                    display:flex;align-items:center;justify-content:center;gap:6px;">
                    <i class="fas fa-pencil-alt" style="color:#c62828;"></i> 이름 변경
                </button>
                <button onclick="document.getElementById('_cuProfileSheet').remove();showChatBioChange('${mainUid}')"
                    style="flex:1;padding:12px;border:1.5px solid #e0e0e0;border-radius:12px;
                    background:white;font-size:14px;font-weight:600;color:#212121;cursor:pointer;
                    display:flex;align-items:center;justify-content:center;gap:6px;">
                    <i class="fas fa-align-left" style="color:#555;"></i> 소개 편집
                </button>
                ` : `
                <button onclick="document.getElementById('_cuProfileSheet').remove();"
                    style="flex:1;padding:12px;border:none;border-radius:12px;
                    background:#f5f5f5;font-size:14px;font-weight:600;color:#212121;cursor:pointer;">
                    닫기
                </button>
                `}
            </div>
        </div>`;

    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.remove(); });
    document.body.appendChild(sheet);
};

// ===== 4. 내 프로필 (채팅 목록 헤더) =====
window.showMyChatProfile = function() {
    const myUid = auth.currentUser?.uid;
    if (!myUid) { alert('로그인이 필요합니다!'); return; }
    showChatProfileSheet(myUid);
};

// ===== 5. 이름 변경 =====
window.showChatNameChange = function() {
    document.getElementById('_cuNameChangeModal')?.remove();

    const currentName = auth.currentUser?.displayName
        || auth.currentUser?.email?.split('@')[0] || '';

    const modal = document.createElement('div');
    modal.id = '_cuNameChangeModal';
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.45);
        z-index:99999;display:flex;align-items:flex-end;justify-content:center;`;
    modal.innerHTML = `
        <div style="background:white;width:100%;max-width:600px;
            border-radius:20px 20px 0 0;padding:20px 20px 36px;
            animation:cuSlideUp 0.2s ease;">
            <div style="width:36px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 20px;"></div>
            <div style="font-size:16px;font-weight:800;color:#212121;margin-bottom:16px;">
                <i class="fas fa-pencil-alt" style="color:#c62828;margin-right:8px;"></i>이름 변경
            </div>

            <div style="font-size:12px;color:#aaa;margin-bottom:6px;">새 이름</div>
            <input id="_cuNewName" type="text" value="${cu_escapeHTML(currentName)}"
                maxlength="20" placeholder="이름을 입력하세요"
                style="width:100%;padding:13px 16px;border:1.5px solid #e0e0e0;border-radius:12px;
                font-size:15px;font-family:inherit;outline:none;box-sizing:border-box;
                transition:border-color 0.15s;"
                onfocus="this.style.borderColor='#c62828'"
                onblur="this.style.borderColor='#e0e0e0'">
            <div style="text-align:right;font-size:11px;color:#bbb;margin-top:4px;" id="_cuNameLen">
                ${currentName.length}/20
            </div>

            <div style="margin-top:6px;padding:10px 14px;background:#fff9e6;border-radius:10px;
                font-size:12px;color:#856404;line-height:1.5;">
                ⚠️ 이름을 변경하면 채팅에서도 즉시 반영됩니다.
            </div>

            <div style="display:flex;gap:10px;margin-top:18px;">
                <button onclick="document.getElementById('_cuNameChangeModal').remove()"
                    style="flex:1;padding:13px;border:1.5px solid #e0e0e0;border-radius:12px;
                    background:white;font-size:15px;font-weight:600;color:#555;cursor:pointer;">
                    취소
                </button>
                <button onclick="cu_confirmNameChange()"
                    style="flex:1;padding:13px;border:none;border-radius:12px;
                    background:#c62828;font-size:15px;font-weight:700;color:white;cursor:pointer;">
                    변경하기
                </button>
            </div>
        </div>`;

    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);

    const input = document.getElementById('_cuNewName');
    input?.addEventListener('input', () => {
        document.getElementById('_cuNameLen').textContent = `${input.value.length}/20`;
    });
    setTimeout(() => { input?.focus(); input?.select(); }, 60);
};

window.cu_confirmNameChange = async function() {
    const input   = document.getElementById('_cuNewName');
    const newName = input?.value.trim();
    if (!newName) { cu_showToast('이름을 입력해주세요.'); return; }
    if (newName.length > 20) { cu_showToast('20자 이하로 입력해주세요.'); return; }

    const btn = document.querySelector('#_cuNameChangeModal button:last-child');
    if (btn) { btn.disabled = true; btn.textContent = '변경 중...'; }

    try {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('로그인이 필요합니다');

        // Firebase Auth 표시 이름 변경
        await auth.currentUser.updateProfile({ displayName: newName });

        // 메인 DB 닉네임 저장
        await db.ref(`users/${uid}/newNickname`).set(newName);

        document.getElementById('_cuNameChangeModal')?.remove();
        cu_showToast('✅ 이름이 변경됐어요!');

        // 목록 새로고침 (이름 반영)
        if (document.getElementById('chatRoomList')) await cu_loadChatRoomList();

    } catch(e) {
        cu_showToast('❌ 변경 실패: ' + e.message);
        if (btn) { btn.disabled = false; btn.textContent = '변경하기'; }
    }
};

// ===== 6. 소개글 편집 =====
window.showChatBioChange = function(mainUid) {
    document.getElementById('_cuBioModal')?.remove();
    const modal = document.createElement('div');
    modal.id = '_cuBioModal';
    modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.45);
        z-index:99999;display:flex;align-items:flex-end;justify-content:center;`;
    modal.innerHTML = `
        <div style="background:white;width:100%;max-width:600px;
            border-radius:20px 20px 0 0;padding:20px 20px 36px;">
            <div style="width:36px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 20px;"></div>
            <div style="font-size:16px;font-weight:800;color:#212121;margin-bottom:16px;">소개 편집</div>
            <textarea id="_cuBioInput" maxlength="80" placeholder="나를 소개해보세요 (최대 80자)"
                style="width:100%;padding:13px 16px;border:1.5px solid #e0e0e0;border-radius:12px;
                font-size:14px;font-family:inherit;outline:none;resize:none;height:90px;
                box-sizing:border-box;line-height:1.5;"
                onfocus="this.style.borderColor='#c62828'"
                onblur="this.style.borderColor='#e0e0e0'"></textarea>
            <div style="text-align:right;font-size:11px;color:#bbb;margin-top:4px;" id="_cuBioLen">0/80</div>
            <div style="display:flex;gap:10px;margin-top:14px;">
                <button onclick="document.getElementById('_cuBioModal').remove()"
                    style="flex:1;padding:13px;border:1.5px solid #e0e0e0;border-radius:12px;
                    background:white;font-size:15px;font-weight:600;color:#555;cursor:pointer;">취소</button>
                <button onclick="cu_saveBio('${mainUid}')"
                    style="flex:1;padding:13px;border:none;border-radius:12px;
                    background:#c62828;font-size:15px;font-weight:700;color:white;cursor:pointer;">저장</button>
            </div>
        </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);

    const ta = document.getElementById('_cuBioInput');
    db.ref(`users/${mainUid}/bio`).once('value').then(snap => {
        if (ta) { ta.value = snap.val() || ''; document.getElementById('_cuBioLen').textContent = `${ta.value.length}/80`; }
    });
    ta?.addEventListener('input', () => { document.getElementById('_cuBioLen').textContent = `${ta.value.length}/80`; });
    setTimeout(() => ta?.focus(), 60);
};

window.cu_saveBio = async function(mainUid) {
    const bio = document.getElementById('_cuBioInput')?.value.trim() || '';
    try {
        await db.ref(`users/${mainUid}/bio`).set(bio || null);
        document.getElementById('_cuBioModal')?.remove();
        cu_showToast('✅ 소개가 저장됐어요!');
    } catch(e) { cu_showToast('❌ 저장 실패: ' + e.message); }
};

// ===== 리액션 상세 (누가 눌렀는지) =====
window.cu_showReactionDetail = function(msgId) {
    const msg = (window._lastMsgs || {})[msgId];
    if (!msg?.reactions) return;
    const counts = {};
    Object.entries(msg.reactions).forEach(([uid, emoji]) => {
        if (!counts[emoji]) counts[emoji] = 0;
        counts[emoji]++;
    });
    cu_showToast(Object.entries(counts).map(([e, c]) => `${e} ${c}`).join('  '));
};

// ===== 읽음 아바타 + 이름 표시 (override) =====
// readSlot 구조:  [아바타들 행] + [이름 텍스트 행]
// 그룹방: 2명 이하 → "홍길동, 김철수 읽음"
//         3명 이상 → "홍길동 외 N명 읽음"
// 1:1방:  상대 이름 그냥 표시

window._chat.updateReadAvatars = async function(msgs, myUid, roomId) {
    const receipts = window._readReceipts || {};
    const others   = Object.entries(receipts).filter(([uid]) => uid !== myUid);
    if (!others.length) return;

    // msgId → 읽은 chatUid[] 매핑
    const readMap = {};
    others.forEach(([uid, msgId]) => {
        if (!readMap[msgId]) readMap[msgId] = [];
        readMap[msgId].push(uid);
    });

    // 프로필 사진 + 이름 캐시
    if (!window._chatAvatarCache)    window._chatAvatarCache    = {};
    if (!window._chatNameCache)      window._chatNameCache      = {};
    const photoCache = window._chatAvatarCache;
    const nameCache  = window._chatNameCache;

    const roomSnap = await window._chat.getChatDb().ref(`chats/${roomId}/mainUids`).once('value');
    const mainUids = roomSnap.val() || {};
    const isGroup  = roomId.startsWith('group_');

    for (const [chatUid] of others) {
        if (photoCache[chatUid] !== undefined && nameCache[chatUid] !== undefined) continue;
        const mainUid = mainUids[chatUid];
        if (!mainUid) { photoCache[chatUid] = null; nameCache[chatUid] = ''; continue; }
        try {
            const snap = await db.ref(`users/${mainUid}`).once('value');
            const u    = snap.val() || {};
            photoCache[chatUid] = u.profilePhoto || null;
            nameCache[chatUid]  = window._chat.resolveNickname(u) || '';
        } catch {
            photoCache[chatUid] = null;
            nameCache[chatUid]  = '';
        }
    }

    // 슬롯 초기화
    document.querySelectorAll('[id^="readSlot-"]').forEach(el => { el.innerHTML = ''; el.style.flexDirection = ''; });

    for (const [msgId, uids] of Object.entries(readMap)) {
        const slot = document.getElementById(`readSlot-${msgId}`);
        if (!slot) continue;

        slot.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;gap:2px;min-width:0;';

        // ── 아바타 행
        const avatarRow = document.createElement('div');
        avatarRow.style.cssText = 'display:flex;gap:2px;align-items:center;justify-content:flex-end;';

        const MAX_SHOW = 3; // 아바타 최대 표시 수
        uids.slice(0, MAX_SHOW).forEach(chatUid => {
            const photo = photoCache[chatUid];
            const av    = document.createElement('div');
            av.title    = nameCache[chatUid] || '읽음';
            if (photo) {
                av.innerHTML = `<img src="${photo}"
                    style="width:16px;height:16px;border-radius:50%;object-fit:cover;
                    border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.18);display:block;">`;
            } else {
                av.style.cssText = `width:16px;height:16px;border-radius:50%;background:#c62828;
                    display:flex;align-items:center;justify-content:center;
                    border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.18);flex-shrink:0;`;
                const initial = (nameCache[chatUid] || '?')[0].toUpperCase();
                av.innerHTML = `<span style="font-size:7px;color:white;font-weight:700;">${initial}</span>`;
            }
            avatarRow.appendChild(av);
        });

        // 초과 아바타 수 표시
        if (uids.length > MAX_SHOW) {
            const more = document.createElement('div');
            more.style.cssText = `width:16px;height:16px;border-radius:50%;background:#bdbdbd;
                display:flex;align-items:center;justify-content:center;font-size:7px;
                color:white;font-weight:700;border:1.5px solid white;`;
            more.textContent = `+${uids.length - MAX_SHOW}`;
            avatarRow.appendChild(more);
        }

        slot.appendChild(avatarRow);

        // ── 이름 텍스트 행
        const nameEl   = document.createElement('div');
        nameEl.style.cssText = 'font-size:10px;color:#aaa;text-align:right;max-width:110px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

        const names = uids.map(uid => nameCache[uid] || '').filter(Boolean);

        let labelText = '';
        if (!isGroup) {
            // 1:1 채팅: 이름만
            labelText = (names[0] || '') + ' 읽음';
        } else {
            // 그룹 채팅
            if (names.length <= 2) {
                labelText = names.join(', ') + ' 읽음';
            } else {
                labelText = `${names[0]} 외 ${names.length - 1}명 읽음`;
            }
        }

        nameEl.textContent  = labelText;
        nameEl.title        = names.join(', ') + ' 읽음'; // 전체 이름 툴팁
        slot.appendChild(nameEl);
    }
};

// window.updateReadAvatars를 _chat 네임스페이스의 새 함수로 동기화
// (위 1281줄에서 window._chat.updateReadAvatars는 이미 새 함수로 교체됨)
window.updateReadAvatars = function(msgs, myUid, roomId) {
    return window._chat.updateReadAvatars(msgs, myUid, roomId);
};

// ===== ✅ 이미지 전체화면 모달 =====
// chat.js의 openChatImageModal은 dataset.img(대용량 base64)를 attribute에서 읽는데
// 브라우저가 큰 attribute를 잘라내면 src가 깨짐 → _lastMsgs에서 직접 읽도록 재정의
window.openChatImageModal = function(msgId) { cu_openImgModal(msgId); };

window.cu_openImgModal = function(msgId) {
    document.getElementById('_chatImgModal')?.remove();
    const msg = (window._lastMsgs || {})[msgId];
    const src = msg?.imageBase64;
    if (!src) { cu_showToast('이미지를 불러올 수 없습니다.'); return; }
    const ext = src.startsWith('data:image/png')  ? 'png'
              : src.startsWith('data:image/gif')  ? 'gif'
              : src.startsWith('data:image/webp') ? 'webp' : 'jpg';
    const modal = document.createElement('div');
    modal.id = '_chatImgModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.93);z-index:999999;' +
        'display:flex;flex-direction:column;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <img src="${src}"
            style="max-width:95vw;max-height:82vh;border-radius:10px;object-fit:contain;
                   cursor:zoom-out;-webkit-tap-highlight-color:transparent;"
            onclick="document.getElementById('_chatImgModal').remove()">
        <div style="display:flex;gap:12px;margin-top:18px;">
            <button onclick="cu_downloadImg('${msgId}')"
                style="background:rgba(255,255,255,0.18);border:none;color:white;
                padding:11px 24px;border-radius:24px;font-size:14px;cursor:pointer;
                display:flex;align-items:center;gap:8px;font-weight:700;">
                <i class="fas fa-download"></i> 다운로드
            </button>
            <button onclick="document.getElementById('_chatImgModal').remove()"
                style="background:rgba(255,255,255,0.1);border:none;color:white;
                padding:11px 24px;border-radius:24px;font-size:14px;cursor:pointer;font-weight:600;">
                닫기
            </button>
        </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    const esc = (e) => { if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', esc); }};
    document.addEventListener('keydown', esc);
    document.body.appendChild(modal);
};

window.cu_downloadImg = function(msgId) {
    const msg = (window._lastMsgs || {})[msgId];
    const src = msg?.imageBase64;
    if (!src) { cu_showToast('이미지를 찾을 수 없습니다.'); return; }
    const ext = src.startsWith('data:image/png')  ? 'png'
              : src.startsWith('data:image/gif')  ? 'gif'
              : src.startsWith('data:image/webp') ? 'webp' : 'jpg';
    const a = document.createElement('a');
    a.href = src;
    a.download = `chat_image_${msgId}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    cu_showToast('✅ 다운로드 시작!');
};

console.log('✅ chat-upgrade.js 업그레이드 적용 완료');
}); // _waitForChat 끝

console.log('✅ chat-upgrade.js 로드 완료 (초기화 대기 중)');
})();