// ===== 카카오톡형 채팅 메신저 =====
// IIFE로 전체 감싸서 전역 스코프 오염 방지 (script.js의 const firebaseConfig 등과 충돌 해결)
(function () {
'use strict';
console.log('💬 chat.js 로드 중...');

// ===== CSS 주입 (hideAll() 인라인 스타일 버그 수정) =====
(function injectChatCSS() {
    if (document.getElementById('_chatSectionStyle')) return;
    const s = document.createElement('style');
    s.id = '_chatSectionStyle';
    s.textContent = `
        #chatSection { display: none !important; }
        #chatSection.active {
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            height: calc(100vh - 0px) !important;
            padding: 0 !important;
        }
    `;
    document.head.appendChild(s);
})();

// ===== ✅ 새 채팅 전용 Firebase 프로젝트 Config =====
// 🔧 Firebase Console에서 새 프로젝트 만든 후 아래 값을 교체하세요
const CHAT_FIREBASE_CONFIG = {
    apiKey:            "AIzaSyDZeLJhtBevB--i9tzNxgWbNsZtXMS0pgA",
    authDomain:        "hsj-message.firebaseapp.com",
    databaseURL:       "https://hsj-message-default-rtdb.firebaseio.com",
    projectId:         "hsj-message",
    storageBucket:     "hsj-message.firebasestorage.app",
    messagingSenderId: "63565000380",
    appId:             "1:63565000380:web:8bcb367bd1ca08da352ab9",
    measurementId:     "G-8BRF3Q37G0"
};

// ===== chatApp 인스턴스 =====
let chatDb   = null;
let _chatApp = null;

function getChatApp() {
    if (_chatApp) return _chatApp;
    const existing = firebase.apps.find(a => a.name === 'chatApp');
    _chatApp = existing || firebase.initializeApp(CHAT_FIREBASE_CONFIG, 'chatApp');
    return _chatApp;
}
function getChatDb() {
    if (!chatDb) chatDb = getChatApp().database();
    return chatDb;
}
function getChatAuth() {
    return getChatApp().auth();
}
function isChatAuthReady() {
    return !!getChatAuth().currentUser;
}
// ✅ chatApp 전용 UID (메인 앱 UID와 별개)
function getChatUserId() {
    const user = getChatAuth().currentUser;
    return user ? user.uid : null;
}

// ===== ✅ chatApp Auth 동기화 =====
// 별도 Firebase 프로젝트는 OAuth client ID가 달라 토큰 공유 불가
// → chatApp에서 직접 독립 팝업으로 로그인
// ✅ chatApp onAuthStateChanged가 resolve될 때까지 대기 (자동로그인 감지)
function waitForChatAuth(timeoutMs = 3000) {
    return new Promise((resolve) => {
        const unsubscribe = getChatAuth().onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
        setTimeout(() => { unsubscribe(); resolve(null); }, timeoutMs);
    });
}

async function syncChatAuth(mainUser) {
    const chatAuthInst = getChatAuth();

    // 로그아웃 → chatApp도 로그아웃
    if (!mainUser) {
        if (chatAuthInst.currentUser) await chatAuthInst.signOut();
        return;
    }

    // ✅ 자동로그인: Firebase가 로컬 세션 복원할 때까지 잠깐 대기
    let chatUser = chatAuthInst.currentUser;
    if (!chatUser) {
        console.log('🔄 chatApp 세션 복원 대기 중...');
        chatUser = await waitForChatAuth(3000);
    }

    // 이미 로그인됨 → chatUid가 메인 DB에 없으면 저장
    if (chatUser) {
        const mainUid = mainUser.uid;
        const snap = await db.ref(`users/${mainUid}/chatUid`).once('value');
        if (!snap.val()) {
            await db.ref(`users/${mainUid}/chatUid`).set(chatUser.uid);
            console.log('✅ chatUid 보완 저장:', chatUser.uid);
        }
        return;
    }

    // 세션 복원 실패 → 팝업으로 로그인 시도
    await _signInChatAppSilently();
}

// ===== chatApp 전용 팝업 인증 =====
// 브라우저에 Google 세션이 있으면 팝업이 순간 떴다 자동으로 닫힘
window._signInChatAppSilently = async function _signInChatAppSilently() {
    if (getChatAuth().currentUser) return;
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await getChatAuth().signInWithPopup(provider);
        console.log('✅ chatApp 인증 완료:', result.user.email);
        document.getElementById('_chatAuthBanner')?.remove();
        // ✅ 메인 DB에 chatUid 저장 (상대방이 채팅 시작할 때 사용)
        const mainUid = auth.currentUser?.uid;
        if (mainUid) {
            await db.ref(`users/${mainUid}/chatUid`).set(result.user.uid);
            console.log('✅ chatUid 메인DB 저장 완료');
        }
    } catch (e) {
        if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
            return;
        }
        console.warn('⚠️ chatApp 인증 실패:', e.code);
        _showChatAuthExpiredBanner();
    }
};

// ===== 토큰 만료 안내 배너 =====
function _showChatAuthExpiredBanner() {
    if (document.getElementById('_chatAuthBanner')) return;
    const banner = document.createElement('div');
    banner.id = '_chatAuthBanner';
    banner.style.cssText = `
        position:fixed; bottom:70px; left:50%; transform:translateX(-50%);
        background:#fff3cd; color:#856404; border:1px solid #ffc107;
        padding:10px 18px; border-radius:12px; font-size:13px;
        z-index:99998; display:flex; align-items:center; gap:10px;
        box-shadow:0 2px 8px rgba(0,0,0,0.12); white-space:nowrap;
    `;
    banner.innerHTML = `
        ⚠️ 채팅 연결이 필요해요.
        <button onclick="_signInChatAppSilently()" style="
            background:#856404;color:white;border:none;
            padding:4px 10px;border-radius:8px;cursor:pointer;font-size:12px;">
            채팅 연결
        </button>
        <button onclick="this.parentElement.remove()" style="
            background:none;border:none;cursor:pointer;font-size:16px;color:#856404;">✕</button>
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner?.remove(), 10000);
}

// ===== 메인 Auth 상태 변경 시 chatApp Auth 동기화 =====
auth.onAuthStateChanged(async (user) => {
    await syncChatAuth(user);
    if (user) setTimeout(updateChatBadge, 1500);
});

// ===== 닉네임 헬퍼 =====
function resolveNickname(userObj) {
    if (!userObj) return '알 수 없음';
    // newNickname: 닉네임 변경한 경우 / nickname: 레거시 / email 앞부분: 폴백
    return userObj.newNickname || userObj.nickname || userObj.displayName
        || (userObj.email ? userObj.email.split('@')[0] : '알 수 없음');
}
function getMyNickname() {
    const user = auth.currentUser;
    if (!user) return '알 수 없음';
    return user.displayName || user.email.split('@')[0];
}

// ===== 도배 방지 =====
const CHAT_RATE = { count: 0, lastReset: Date.now(), MAX: 5, WINDOW: 5000 };

// ===== 활성 리스너 관리 =====
let activeChatRoomId = null;
let chatMsgListener  = null;

// ===== 채팅 목록 페이지 =====
window.showChatPage = async function () {
    if (!isLoggedIn()) { alert('로그인이 필요합니다!'); return; }

    // chatApp 인증 확인
    if (!isChatAuthReady()) {
        showChatToast('⚠️ 채팅 인증 중... 잠시 후 다시 시도해주세요.');
        await syncChatAuth(auth.currentUser);
        if (!isChatAuthReady()) { _showChatAuthExpiredBanner(); return; }
    }

    if (chatMsgListener && activeChatRoomId) {
        getChatDb().ref(`chats/${activeChatRoomId}/messages`).off('value', chatMsgListener);
        chatMsgListener = null;
        activeChatRoomId = null;
    }

    document.querySelectorAll('.page-section').forEach(sec => { sec.style.cssText = ''; });
    hideAll();
    window.scrollTo(0, 0);

    let section = document.getElementById('chatSection');
    if (!section) {
        section = document.createElement('section');
        section.id = 'chatSection';
        section.className = 'page-section';
        (document.querySelector('main') || document.body).appendChild(section);
    }
    section.classList.add('active');

    section.innerHTML = `
        <div style="max-width:600px;width:100%;margin:0 auto;
            display:flex;flex-direction:column;height:100%;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#c62828,#e53935);
                padding:16px 20px;display:flex;align-items:center;
                justify-content:space-between;flex-shrink:0;">
                <h2 style="color:white;margin:0;font-size:20px;font-weight:800;
                    display:flex;align-items:center;gap:10px;">
                    <i class="fas fa-comment-dots"></i> 채팅
                </h2>
                <div style="display:flex;gap:8px;">
                    <button onclick="showNewChatModal()"
                        style="background:rgba(255,255,255,0.2);border:none;color:white;
                        padding:8px 14px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:600;">
                        <i class="fas fa-edit"></i> 새 채팅
                    </button>
                    <button onclick="showMoreMenu()"
                        style="background:rgba(255,255,255,0.18);border:none;color:white;
                        padding:8px 14px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:600;">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                </div>
            </div>
            <div id="chatRoomList"
                style="flex:1;overflow-y:auto;background:white;-webkit-overflow-scrolling:touch;">
                <div style="text-align:center;padding:60px 20px;color:#adb5bd;">
                    <i class="fas fa-spinner fa-spin" style="font-size:32px;"></i>
                    <p style="margin-top:15px;">채팅 목록 불러오는 중...</p>
                </div>
            </div>
        </div>`;

    updateURL('chat');
    await loadChatRoomList();
    updateChatBadge();
};

// ===== 채팅방 목록 로드 =====
async function loadChatRoomList() {
    const myUid  = getChatUserId();
    const listEl = document.getElementById('chatRoomList');
    if (!listEl) return;

    try {
        const myRoomsSnap = await getChatDb().ref(`userChats/${myUid}`).once('value');
        const myRoomIds   = Object.keys(myRoomsSnap.val() || {});

        if (myRoomIds.length === 0) {
            listEl.innerHTML = `
                <div style="text-align:center;padding:60px 20px;color:#adb5bd;">
                    <i class="fas fa-comment-slash" style="font-size:48px;margin-bottom:16px;display:block;"></i>
                    <p style="font-size:15px;">아직 채팅이 없어요.</p>
                    <button onclick="showNewChatModal()"
                        style="margin-top:16px;background:#c62828;color:white;border:none;
                        padding:10px 24px;border-radius:20px;cursor:pointer;font-size:14px;font-weight:600;">
                        <i class="fas fa-edit"></i> 새 채팅 시작
                    </button>
                </div>`;
            return;
        }

        const [chatSnaps, usersSnap] = await Promise.all([
            Promise.all(myRoomIds.map(id => getChatDb().ref(`chats/${id}`).once('value'))),
            db.ref('users').once('value')
        ]);

        const usersData = usersSnap.val() || {};
        const rooms = chatSnaps
            .map(s => [s.key, s.val()])
            .filter(([_, c]) => c !== null)
            .sort((a, b) => (b[1].lastMessageAt || 0) - (a[1].lastMessageAt || 0));

        listEl.innerHTML = '';

        for (const [roomId, chat] of rooms) {
            const friendChatUid = Object.keys(chat.participants || {}).find(u => u !== myUid);
            // ✅ chatUID → mainUID 역매핑 (mainUids 저장값 또는 chatUid 필드로 검색)
            const friendMainUid = chat.mainUids?.[friendChatUid] ||
                Object.keys(usersData).find(uid => usersData[uid]?.chatUid === friendChatUid) || null;
            const friend      = usersData[friendMainUid] || {};
            const friendName  = resolveNickname(friend);
            const friendPhoto = friend.profilePhoto || null;
            const friendUid   = friendChatUid;

            const photoHTML = friendPhoto
                ? `<img src="${friendPhoto}" style="width:52px;height:52px;min-width:52px;
                    border-radius:50%;object-fit:cover;border:2px solid #dadce0;flex-shrink:0;">`
                : `<div style="width:52px;height:52px;min-width:52px;border-radius:50%;
                    background:#f1f3f4;flex-shrink:0;display:flex;align-items:center;
                    justify-content:center;border:2px solid #dadce0;">
                    <i class="fas fa-user" style="color:#9aa0a6;font-size:20px;"></i></div>`;

            let unread = 0;
            if (chat.messages)
                unread = Object.values(chat.messages).filter(m => !m.read && m.senderId !== myUid).length;

            const timeStr = chat.lastMessageAt ? formatChatTime(chat.lastMessageAt) : '';
            const lastMsg = chat.lastMessage || '대화를 시작해보세요';

            const item = document.createElement('div');
            item.style.cssText = 'display:flex;align-items:center;padding:14px 16px;gap:12px;cursor:pointer;border-bottom:1px solid #f5f5f5;transition:background 0.15s;background:white;';
            item.onmouseover = () => item.style.background = '#f8f9fa';
            item.onmouseout  = () => item.style.background = 'white';
            item.onclick     = () => openChatRoom(roomId, friendUid, friendName, friendPhoto, friendMainUid);
            item.innerHTML   = `
                ${photoHTML}
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-weight:700;font-size:15px;color:#212529;">${escapeHTML(friendName)}</span>
                        <span style="font-size:11px;color:#adb5bd;flex-shrink:0;margin-left:8px;">${timeStr}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:13px;color:#6c757d;white-space:nowrap;overflow:hidden;
                            text-overflow:ellipsis;max-width:220px;">${escapeHTML(lastMsg)}</span>
                        ${unread > 0
                            ? `<span style="background:#c62828;color:white;border-radius:12px;
                                padding:2px 7px;font-size:11px;font-weight:700;flex-shrink:0;
                                min-width:20px;text-align:center;">${unread > 99 ? '99+' : unread}</span>`
                            : ''}
                    </div>
                </div>`;
            listEl.appendChild(item);
        }
    } catch (err) {
        console.error('채팅 목록 로드 실패:', err);
        listEl.innerHTML = `<div style="text-align:center;padding:40px;color:#c62828;">❌ 로드 실패: ${err.message}</div>`;
    }
}

// ===== 채팅방 열기 =====
window.openChatRoom = async function (roomId, friendUid, friendName, friendPhoto, friendMainUid) {
    if (chatMsgListener && activeChatRoomId) {
        getChatDb().ref(`chats/${activeChatRoomId}/messages`).off('value', chatMsgListener);
        chatMsgListener = null;
    }
    activeChatRoomId = roomId;

    const myUid = getChatUserId();
    let section = document.getElementById('chatSection');
    if (!section) {
        section = document.createElement('section');
        section.id = 'chatSection';
        section.className = 'page-section';
        (document.querySelector('main') || document.body).appendChild(section);
    }
    section.classList.add('active');

    const photoHTML = friendPhoto
        ? `<img src="${friendPhoto}" style="width:36px;height:36px;min-width:36px;
            border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.5);">`
        : `<div style="width:36px;height:36px;min-width:36px;border-radius:50%;
            background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;">
            <i class="fas fa-user" style="color:white;font-size:16px;"></i></div>`;

    section.innerHTML = `
        <div style="max-width:600px;width:100%;margin:0 auto;
            display:flex;flex-direction:column;height:100%;overflow:hidden;">
            <div style="background:linear-gradient(135deg,#c62828,#e53935);
                padding:12px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0;">
                <button onclick="showChatPage()"
                    style="background:none;border:none;color:white;font-size:20px;
                    cursor:pointer;padding:4px 8px;display:flex;align-items:center;">
                    <i class="fas fa-arrow-left"></i>
                </button>
                ${photoHTML}
                <span style="color:white;font-weight:700;font-size:16px;flex:1;">${escapeHTML(friendName)}</span>
            </div>
            <div id="chatMessages"
                style="flex:1;overflow-y:auto;padding:16px 14px;background-color:#e5ddd5;
                background-image:url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9b99a' fill-opacity='0.18'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\");
                display:flex;flex-direction:column;gap:4px;min-height:0;-webkit-overflow-scrolling:touch;">
                <div style="text-align:center;color:#888;margin:auto;">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            </div>
            <div style="background:white;padding:10px 12px;display:flex;gap:8px;
                align-items:flex-end;border-top:1px solid #eee;flex-shrink:0;">
                <textarea id="chatInput" placeholder="메시지를 입력하세요..." rows="1"
                    style="flex:1;border:1.5px solid #dee2e6;border-radius:22px;
                    padding:10px 16px;font-size:14px;resize:none;outline:none;
                    font-family:inherit;max-height:120px;overflow-y:auto;line-height:1.5;
                    transition:border-color 0.2s;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#c62828'" onblur="this.style.borderColor='#dee2e6'"
                    onkeydown="handleChatKeydown(event,'${roomId}','${friendUid}')"
                    oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'">
                </textarea>
                <button onclick="sendChatMessage('${roomId}','${friendUid}')"
                    style="background:#c62828;border:none;color:white;width:44px;height:44px;
                    border-radius:50%;cursor:pointer;font-size:15px;flex-shrink:0;
                    display:flex;align-items:center;justify-content:center;
                    box-shadow:0 2px 6px rgba(198,40,40,0.35);"
                    onmouseover="this.style.background='#b71c1c'" onmouseout="this.style.background='#c62828'">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>`;

    chatMsgListener = getChatDb().ref(`chats/${roomId}/messages`)
        .orderByChild('timestamp')
        .limitToLast(200)
        .on('value', (snap) => {
            renderChatMessages(snap.val() || {}, myUid, roomId);
            markMessagesAsRead(roomId, myUid);
        });

    setTimeout(() => document.getElementById('chatInput')?.focus(), 100);
};

// ===== 메시지 렌더링 =====
function renderChatMessages(msgs, myUid, roomId) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const msgList     = Object.entries(msgs).sort((a, b) => a[1].timestamp - b[1].timestamp);
    const wasAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 140;
    container.innerHTML = '';

    if (msgList.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;color:#888;margin:auto;padding:40px 20px;
                background:rgba(255,255,255,0.65);border-radius:14px;max-width:200px;align-self:center;">
                <i class="fas fa-comment" style="font-size:36px;margin-bottom:12px;display:block;opacity:0.4;"></i>
                첫 메시지를 보내보세요 👋
            </div>`;
        return;
    }

    let lastDateStr = '';
    for (const [msgId, msg] of msgList) {
        if (!msg) continue;

        if (msg.deleted) {
            const delEl = document.createElement('div');
            delEl.style.cssText = 'display:flex;justify-content:center;margin:4px 0;';
            delEl.innerHTML = `<span style="font-size:11px;color:#999;background:rgba(255,255,255,0.6);
                padding:3px 14px;border-radius:10px;font-style:italic;">메시지가 삭제되었습니다</span>`;
            container.appendChild(delEl);
            continue;
        }

        const isMe    = msg.senderId === myUid;
        const msgDate = new Date(msg.timestamp).toLocaleDateString('ko-KR',
            { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

        if (msgDate !== lastDateStr) {
            lastDateStr = msgDate;
            const sep = document.createElement('div');
            sep.style.cssText = 'text-align:center;margin:12px 0 8px;';
            sep.innerHTML = `<span style="background:rgba(255,255,255,0.78);color:#666;
                font-size:11px;padding:4px 14px;border-radius:12px;
                box-shadow:0 1px 2px rgba(0,0,0,0.08);">${msgDate}</span>`;
            container.appendChild(sep);
        }

        const timeStr = new Date(msg.timestamp).toLocaleTimeString('ko-KR',
            { hour: '2-digit', minute: '2-digit' });

        const msgEl = document.createElement('div');
        msgEl.style.cssText = `display:flex;align-items:flex-end;gap:6px;
            ${isMe ? 'flex-direction:row-reverse;' : ''}margin:2px 0;`;

        const bubble = document.createElement('div');
        bubble.dataset.msgid = msgId;
        bubble.style.cssText = `max-width:72%;
            background:${isMe ? '#c62828' : 'white'};color:${isMe ? 'white' : '#212529'};
            padding:10px 14px;border-radius:${isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px'};
            font-size:14px;line-height:1.55;word-break:break-word;
            box-shadow:0 1px 3px rgba(0,0,0,0.12);${isMe ? 'cursor:pointer;user-select:none;' : ''}`;
        bubble.innerHTML = escapeHTML(msg.text).replace(/\n/g, '<br>');
        if (isMe) bubble.addEventListener('click', () => showChatMsgMenu(msgId, roomId, bubble));

        const timeEl = document.createElement('span');
        timeEl.style.cssText = 'font-size:10px;color:#888;flex-shrink:0;margin-bottom:2px;';
        timeEl.textContent   = timeStr;

        msgEl.appendChild(bubble);
        msgEl.appendChild(timeEl);
        container.appendChild(msgEl);
    }

    if (wasAtBottom) container.scrollTop = container.scrollHeight;
}

// ===== 메시지 삭제 메뉴 =====
window.showChatMsgMenu = function (msgId, roomId, el) {
    document.getElementById('_chatMsgMenu')?.remove();
    const rect = el.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.id = '_chatMsgMenu';
    menu.style.cssText = `position:fixed;top:${rect.bottom + 6}px;right:${window.innerWidth - rect.right}px;
        background:white;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.18);
        z-index:99999;overflow:hidden;min-width:120px;`;
    menu.innerHTML = `
        <button onclick="deleteChatMessage('${msgId}','${roomId}')"
            style="display:flex;align-items:center;gap:8px;width:100%;padding:12px 16px;
            border:none;background:none;cursor:pointer;font-size:14px;color:#c62828;font-weight:600;"
            onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='none'">
            <i class="fas fa-trash-alt"></i> 삭제
        </button>`;
    document.body.appendChild(menu);
    setTimeout(() => {
        document.addEventListener('click', function h(e) {
            if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', h); }
        });
    }, 50);
};

window.deleteChatMessage = async function (msgId, roomId) {
    document.getElementById('_chatMsgMenu')?.remove();
    if (!confirm('이 메시지를 삭제하시겠습니까?\n(상대방에게도 삭제됩니다)')) return;
    try {
        await getChatDb().ref(`chats/${roomId}/messages/${msgId}`)
            .update({ deleted: true, text: '' });
    } catch (e) {
        showChatToast('❌ 삭제 실패: ' + e.message);
    }
};

// ===== 메시지 전송 =====
window.sendChatMessage = async function (roomId, friendUid) {
    if (!isLoggedIn()) return;

    if (!isChatAuthReady()) {
        showChatToast('⚠️ 채팅 인증이 필요해요. 재로그인해주세요.');
        _showChatAuthExpiredBanner();
        return;
    }

    const input = document.getElementById('chatInput');
    const text  = input?.value.trim();
    if (!text) return;

    const now = Date.now();
    if (now - CHAT_RATE.lastReset > CHAT_RATE.WINDOW) { CHAT_RATE.count = 0; CHAT_RATE.lastReset = now; }
    CHAT_RATE.count++;
    if (CHAT_RATE.count > CHAT_RATE.MAX) {
        showChatToast('⚠️ 너무 빠르게 보내고 있어요.'); return;
    }
    if (text.length > 500) {
        showChatToast('⚠️ 메시지는 500자 이하로 입력해주세요.'); return;
    }

    input.value = '';
    input.style.height = 'auto';

    const myUid  = getChatUserId();
    const myName = getMyNickname();
    const ts     = Date.now();

    try {
        await getChatDb().ref(`chats/${roomId}/messages`).push({
            senderId: myUid, senderName: myName,
            text, timestamp: ts, read: false, deleted: false
        });
        const preview = text.length > 30 ? text.substring(0, 30) + '...' : text;
        await getChatDb().ref(`chats/${roomId}`).update({
            lastMessage: preview, lastMessageAt: ts, lastSenderId: myUid
        });
        // ✅ 알림은 메인앱 UID로 전송 (mainUids에서 조회)
        const roomSnap = await getChatDb().ref(`chats/${roomId}/mainUids/${friendUid}`).once('value');
        const friendMainUidForNotif = roomSnap.val();
        if (friendMainUidForNotif) await sendChatNotification(friendMainUidForNotif, myName, text, roomId);
        updateChatBadge();
    } catch (e) {
        console.error('전송 실패:', e);
        showChatToast('❌ 전송 실패: ' + e.message);
        if (input) input.value = text;
    }
};

// ===== 채팅 알림 전송 (메인 DB) =====
async function sendChatNotification(toUid, fromName, text, roomId) {
    try {
        const settingSnap = await db.ref(`users/${toUid}/notificationTypes/chat`).once('value');
        if (settingSnap.val() === false) return;
        const notifId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        await db.ref(`notifications/${toUid}/${notifId}`).set({
            type: 'chat', title: `💬 ${fromName}`,
            text: text.length > 50 ? text.substring(0, 50) + '...' : text,
            timestamp: Date.now(), read: false, pushed: false, roomId
        });
    } catch (e) { console.warn('채팅 알림 전송 실패:', e.message); }
}

// ===== 엔터키 =====
window.handleChatKeydown = function (e, roomId, friendUid) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(roomId, friendUid); }
};

// ===== 읽음 처리 =====
async function markMessagesAsRead(roomId, myUid) {
    try {
        const snap    = await getChatDb().ref(`chats/${roomId}/messages`)
            .orderByChild('read').equalTo(false).once('value');
        const updates = {};
        snap.forEach(child => {
            if (child.val().senderId !== myUid)
                updates[`chats/${roomId}/messages/${child.key}/read`] = true;
        });
        if (Object.keys(updates).length > 0) {
            await getChatDb().ref().update(updates);
            updateChatBadge();
        }
    } catch (e) {}
}

// ===== 새 채팅 모달 =====
window.showNewChatModal = async function () {
    document.getElementById('_newChatModal')?.remove();
    const usersSnap = await db.ref('users').once('value');
    const usersData = usersSnap.val() || {};
    const myMainUid = auth.currentUser?.uid;  // ✅ 메인앱 UID로 본인 제외
    const myUid     = getChatUserId();

    // ✅ 이메일 기준 중복 제거 (같은 사람이 여러 UID로 가입된 경우)
    const seenEmails = new Set();
    const userItems = Object.entries(usersData)
        .filter(([uid, u]) => {
            if (uid === myMainUid || !u || !u.email) return false;
            if (seenEmails.has(u.email.toLowerCase())) return false;
            seenEmails.add(u.email.toLowerCase());
            return true;
        })
        .sort(([, a], [, b]) => {
            const nameA = (a.newNickname || a.nickname || a.displayName || a.email.split('@')[0]).toLowerCase();
            const nameB = (b.newNickname || b.nickname || b.displayName || b.email.split('@')[0]).toLowerCase();
            return nameA.localeCompare(nameB, 'ko');
        })
        .map(([uid, u]) => {
            const name  = resolveNickname(u);
            const photo = u.profilePhoto;
            // ✅ chatUid가 없으면 채팅 불가 표시
            const chatFriendUid = u.chatUid || null;
            const photoHTML = photo
                ? `<img src="${photo}" style="width:42px;height:42px;min-width:42px;
                    border-radius:50%;object-fit:cover;border:1.5px solid #dadce0;">`
                : `<div style="width:42px;height:42px;min-width:42px;border-radius:50%;
                    background:#f1f3f4;display:flex;align-items:center;justify-content:center;border:1.5px solid #dadce0;">
                    <i class="fas fa-user" style="color:#9aa0a6;font-size:17px;"></i></div>`;
            if (!chatFriendUid) {
                return `
                <div data-name="${name.toLowerCase()}" data-email="${u.email.toLowerCase()}"
                    style="display:flex;align-items:center;gap:12px;padding:12px 16px;
                    border-bottom:1px solid #f5f5f5;background:#fafafa;opacity:0.5;cursor:not-allowed;"
                    title="상대방이 아직 채팅을 시작하지 않았습니다">
                    ${photoHTML}
                    <div>
                        <div style="font-weight:600;font-size:14px;color:#212529;">${escapeHTML(name)}</div>
                        <div style="font-size:12px;color:#adb5bd;">${escapeHTML(u.email)} · 채팅 미설정</div>
                    </div>
                </div>`;
            }
            return `
                <div onclick="startNewChat('${chatFriendUid}','${name.replace(/'/g, "\\'")}',${photo ? `'${photo}'` : 'null'},'${uid}')"
                    data-name="${name.toLowerCase()}" data-email="${u.email.toLowerCase()}"
                    style="display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;
                    border-bottom:1px solid #f5f5f5;transition:background 0.15s;background:white;"
                    onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                    ${photoHTML}
                    <div>
                        <div style="font-weight:600;font-size:14px;color:#212529;">${escapeHTML(name)}</div>
                        <div style="font-size:12px;color:#adb5bd;">${escapeHTML(u.email)}</div>
                    </div>
                </div>`;
        }).join('');

    const modal = document.createElement('div');
    modal.id = '_newChatModal';
    modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;
        justify-content:center;padding:16px;`;
    modal.innerHTML = `
        <div style="background:white;border-radius:16px;width:100%;max-width:420px;
            max-height:80vh;overflow:hidden;display:flex;flex-direction:column;
            box-shadow:0 8px 32px rgba(0,0,0,0.2);">
            <div style="background:linear-gradient(135deg,#c62828,#e53935);
                padding:16px 20px;display:flex;justify-content:space-between;align-items:center;">
                <h3 style="color:white;margin:0;font-size:16px;font-weight:700;">
                    <i class="fas fa-edit"></i> 새 채팅 시작
                </h3>
                <button onclick="document.getElementById('_newChatModal').remove()"
                    style="background:none;border:none;color:white;font-size:22px;cursor:pointer;line-height:1;">✕</button>
            </div>
            <div style="padding:12px 16px;border-bottom:1px solid #f0f0f0;">
                <input id="_chatSearch" type="text" placeholder="닉네임 또는 이메일 검색..."
                    oninput="filterChatUsers(this.value)"
                    style="width:100%;padding:10px 16px;border:1.5px solid #dee2e6;
                    border-radius:22px;font-size:14px;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#c62828'" onblur="this.style.borderColor='#dee2e6'">
            </div>
            <div id="_chatUserList" style="overflow-y:auto;flex:1;">
                ${userItems || '<p style="text-align:center;color:#adb5bd;padding:30px;">유저가 없습니다.</p>'}
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    setTimeout(() => document.getElementById('_chatSearch')?.focus(), 50);
};

window.filterChatUsers = function (kw) {
    const q = kw.toLowerCase();
    document.querySelectorAll('#_chatUserList > div').forEach(el => {
        el.style.display =
            ((el.dataset.name || '').includes(q) || (el.dataset.email || '').includes(q)) ? 'flex' : 'none';
    });
};

// friendUid: 상대방의 chatApp UID, friendMainUid: 상대방의 메인앱 UID (알림용)
window.startNewChat = async function (friendUid, friendName, friendPhoto, friendMainUid) {
    document.getElementById('_newChatModal')?.remove();
    const myUid  = getChatUserId();
    const roomId = [myUid, friendUid].sort().join('_');

    const snap = await getChatDb().ref(`chats/${roomId}`).once('value');
    if (!snap.exists()) {
        await getChatDb().ref(`chats/${roomId}`).set({
            participants:  { [myUid]: true, [friendUid]: true },
            // ✅ 메인앱 UID도 저장 (알림 전송용)
            mainUids: { [myUid]: auth.currentUser?.uid || '', [friendUid]: friendMainUid || '' },
            createdAt:     Date.now(), lastMessage: '', lastMessageAt: Date.now()
        });
        await Promise.all([
            getChatDb().ref(`userChats/${myUid}/${roomId}`).set(true),
            getChatDb().ref(`userChats/${friendUid}/${roomId}`).set(true)
        ]);
    }
    openChatRoom(roomId, friendUid, friendName, friendPhoto, friendMainUid);
};

// ===== 채팅 배지 =====
async function updateChatBadge() {
    if (!isLoggedIn() || !isChatAuthReady()) return;
    const myUid = getChatUserId();
    try {
        const myRoomsSnap = await getChatDb().ref(`userChats/${myUid}`).once('value');
        const myRoomIds   = Object.keys(myRoomsSnap.val() || {});
        if (!myRoomIds.length) return;
        const snaps = await Promise.all(myRoomIds.map(id => getChatDb().ref(`chats/${id}`).once('value')));
        let total = 0;
        for (const s of snaps) {
            const c = s.val();
            if (c?.messages)
                total += Object.values(c.messages).filter(m => !m.read && m.senderId !== myUid).length;
        }
        const badge = document.getElementById('chatBadgeMore');
        if (badge) {
            badge.textContent   = total > 99 ? '99+' : total;
            badge.style.display = total > 0 ? 'inline-block' : 'none';
        }
    } catch (e) {}
}

// ===== 시간 포맷 =====
function formatChatTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000)    return '방금';
    if (diff < 3600000)  return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    return new Date(ts).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}

// ===== 토스트 =====
function showChatToast(msg) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
        background:rgba(0,0,0,0.75);color:white;padding:10px 20px;border-radius:20px;
        font-size:13px;z-index:99999;pointer-events:none;white-space:nowrap;`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// ===== 알림 설정 채팅 토글 =====
const _origLoadNotifTypes = window.loadNotificationTypeSettings;
window.loadNotificationTypeSettings = async function () {
    if (typeof _origLoadNotifTypes === 'function') await _origLoadNotifTypes();
    if (!isLoggedIn()) return;
    const section = document.getElementById('notificationTypeSection');
    if (!section || document.getElementById('notifType_chat')) return;
    const uid  = auth.currentUser?.uid;
    const snap = await db.ref(`users/${uid}/notificationTypes/chat`).once('value');
    const chatEnabled = snap.val() !== false;
    const wrap = section.querySelector('div');
    if (!wrap) return;
    const chatRow = document.createElement('div');
    chatRow.style.marginTop = '10px';
    chatRow.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;
            padding:12px;background:#f8f9fa;border-radius:6px;">
            <label style="display:flex;align-items:center;gap:12px;cursor:pointer;flex:1;">
                <input type="checkbox" id="notifType_chat" ${chatEnabled ? 'checked' : ''}
                    onchange="saveChatNotifSetting()"
                    style="width:18px;height:18px;cursor:pointer;accent-color:#c62828;">
                <div>
                    <div style="font-weight:600;color:#202124;">💬 채팅 알림</div>
                    <div style="font-size:12px;color:#5f6368;margin-top:2px;">새 채팅 메시지를 받았을 때</div>
                </div>
            </label>
        </div>`;
    wrap.appendChild(chatRow);
};

window.saveChatNotifSetting = async function () {
    if (!isLoggedIn()) return;
    const uid     = auth.currentUser?.uid;
    const enabled = document.getElementById('notifType_chat')?.checked ?? true;
    await db.ref(`users/${uid}/notificationTypes/chat`).set(enabled);
    showChatToast(enabled ? '✅ 채팅 알림 켜짐' : '🔕 채팅 알림 꺼짐');
};

console.log('✅ chat.js 로드 완료 (완전 Auth 분리 버전)');

})(); // IIFE 끝