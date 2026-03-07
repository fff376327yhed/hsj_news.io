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
            height: 100dvh !important;
            max-height: 100dvh !important;
            padding: 0 !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: 1000 !important;
            background: white !important;
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
                    <button onclick="showChatNotifSettings()"
                        style="background:rgba(255,255,255,0.18);border:none;color:white;
                        padding:8px 14px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:600;">
                        <i class="fas fa-bell"></i>
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
            const isGroup = !!chat.isGroup;
            let displayName, photoHTML, friendUid, friendMainUid;

            if (isGroup) {
                displayName = chat.groupName || '그룹 채팅';
                photoHTML = `<div style="width:52px;height:52px;min-width:52px;border-radius:50%;
                    background:linear-gradient(135deg,#c62828,#e53935);flex-shrink:0;display:flex;
                    align-items:center;justify-content:center;border:2px solid #dadce0;">
                    <i class="fas fa-users" style="color:white;font-size:20px;"></i></div>`;
                friendUid = null; friendMainUid = null;
            } else {
                const friendChatUid = Object.keys(chat.participants || {}).find(u => u !== myUid);
                friendMainUid = chat.mainUids?.[friendChatUid] ||
                    Object.keys(usersData).find(uid => usersData[uid]?.chatUid === friendChatUid) || null;
                const friend = usersData[friendMainUid] || {};
                displayName  = resolveNickname(friend);
                const friendPhoto = friend.profilePhoto || null;
                friendUid = friendChatUid;
                photoHTML = friendPhoto
                    ? `<img src="${friendPhoto}" style="width:52px;height:52px;min-width:52px;
                        border-radius:50%;object-fit:cover;border:2px solid #dadce0;flex-shrink:0;">`
                    : `<div style="width:52px;height:52px;min-width:52px;border-radius:50%;
                        background:#f1f3f4;flex-shrink:0;display:flex;align-items:center;
                        justify-content:center;border:2px solid #dadce0;">
                        <i class="fas fa-user" style="color:#9aa0a6;font-size:20px;"></i></div>`;
            }
            const friendName = displayName;

            let unread = 0;
            if (chat.messages)
                unread = Object.values(chat.messages).filter(m => !m.read && m.senderId !== myUid).length;

            const timeStr = chat.lastMessageAt ? formatChatTime(chat.lastMessageAt) : '';
            const lastMsg = chat.lastMessage || '대화를 시작해보세요';

            const item = document.createElement('div');
            item.style.cssText = 'display:flex;align-items:center;padding:14px 16px;gap:12px;cursor:pointer;border-bottom:1px solid #f5f5f5;transition:background 0.15s;background:white;';
            item.onmouseover = () => item.style.background = '#f8f9fa';
            item.onmouseout  = () => item.style.background = 'white';
            item.onclick     = () => openChatRoom(roomId, friendUid, friendName, null, friendMainUid);
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

    // 그룹 여부 판단 (roomId 접두사로 빠르게 확인)
    const isGroupRoom = roomId.startsWith('group_');
    const groupIconHTML = `<div style="width:36px;height:36px;min-width:36px;border-radius:50%;
        background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;">
        <i class="fas fa-users" style="color:white;font-size:16px;"></i></div>`;

    const leaveBtn = isGroupRoom
        ? `<button onclick="leaveGroupChat('${roomId}')"
            style="background:rgba(255,255,255,0.18);border:none;color:white;
            padding:6px 12px;border-radius:14px;cursor:pointer;font-size:12px;font-weight:600;flex-shrink:0;">
            나가기
           </button>`
        : '';

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
                ${isGroupRoom ? groupIconHTML : photoHTML}
                <span style="color:white;font-weight:700;font-size:16px;flex:1;">${escapeHTML(friendName)}</span>
                <button onclick="showRoomMenu('${roomId}','${isGroupRoom}')"
                    style="background:rgba(255,255,255,0.18);border:none;color:white;
                    width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:16px;
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
            <div id="chatMessages"
                style="flex:1;overflow-y:auto;padding:16px 14px;background-color:#e5ddd5;
                background-image:url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9b99a' fill-opacity='0.18'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\");
                display:flex;flex-direction:column;gap:4px;min-height:0;-webkit-overflow-scrolling:touch;">
                <div style="text-align:center;color:#888;margin:auto;">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            </div>
            <div style="background:white;border-top:1px solid #eee;flex-shrink:0;">
                <div id="pcHint_${roomId}" style="display:none;padding:2px 16px 0;font-size:11px;color:#adb5bd;">
                    Shift+Enter로 줄바꿈
                </div>
                <!-- 파일 미리보기 -->
                <div id="chatFilePreview_${roomId}" style="display:none;padding:8px 12px 4px;gap:6px;flex-wrap:wrap;border-bottom:1px solid #f5f5f5;"></div>
                <input type="file" id="chatFileInput" multiple accept="*/*"
                    style="display:none;" onchange="previewChatFiles(this,'${roomId}')">
                <div id="chatImgPreview" style="display:none;padding:8px 12px 0;position:relative;">
                    <img id="chatImgPreviewImg"
                        style="max-height:100px;max-width:200px;border-radius:10px;
                        object-fit:cover;border:1.5px solid #dee2e6;">
                    <button onclick="clearChatImage()"
                        style="position:absolute;top:4px;right:8px;background:rgba(0,0,0,0.55);
                        color:white;border:none;border-radius:50%;width:22px;height:22px;
                        font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding:10px 12px;display:flex;gap:8px;align-items:flex-end;">
                    <input type="file" id="chatImageInput" accept="image/*" style="display:none;"
                        onchange="previewChatImage(this)">
                    <button onclick="document.getElementById('chatImageInput').click()"
                        style="background:#f1f3f4;border:none;color:#555;width:38px;height:38px;
                        border-radius:50%;cursor:pointer;font-size:15px;flex-shrink:0;
                        display:flex;align-items:center;justify-content:center;" title="사진">
                        <i class="fas fa-camera"></i>
                    </button>
                    <button onclick="document.getElementById('chatFileInput').click()" title="파일 첨부"
                        style="background:#f1f3f4;border:none;color:#555;width:38px;height:38px;
                        border-radius:50%;cursor:pointer;font-size:15px;flex-shrink:0;
                        display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-paperclip"></i>
                    </button>
                    <button onclick="insertChatNewline()" title="줄바꿈"
                        style="background:#f1f3f4;border:none;color:#555;width:36px;height:36px;
                        border-radius:50%;cursor:pointer;font-size:13px;flex-shrink:0;
                        display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-level-down-alt fa-rotate-90"></i>
                    </button>
                    <textarea id="chatInput" placeholder="메시지를 입력하세요..." rows="1"
                        style="flex:1;border:1.5px solid #dee2e6;border-radius:22px;
                        padding:10px 16px;font-size:14px;resize:none;outline:none;
                        font-family:inherit;max-height:120px;overflow-y:auto;line-height:1.5;
                        transition:border-color 0.2s;box-sizing:border-box;"
                        onfocus="this.style.borderColor='#c62828'" onblur="this.style.borderColor='#dee2e6'"
                        onkeydown="handleChatKeydown(event,'${roomId}')"
                        oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'">
                    </textarea>
                    <button onclick="sendChatMessage('${roomId}')"
                        style="background:#c62828;border:none;color:white;width:44px;height:44px;
                        border-radius:50%;cursor:pointer;font-size:15px;flex-shrink:0;
                        display:flex;align-items:center;justify-content:center;
                        box-shadow:0 2px 6px rgba(198,40,40,0.35);"
                        onmouseover="this.style.background='#b71c1c'" onmouseout="this.style.background='#c62828'">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>`;

    // readReceipts 실시간 리스너 (방 변경 시 초기화)
    if (window._readReceiptListener && window._readReceiptRoomId) {
        getChatDb().ref(`chats/${window._readReceiptRoomId}/readReceipts`).off('value', window._readReceiptListener);
    }
    window._readReceiptRoomId = roomId;
    window._readReceipts = {};

    window._readReceiptListener = getChatDb().ref(`chats/${roomId}/readReceipts`)
        .on('value', (snap) => {
            window._readReceipts = snap.val() || {};
            // 현재 메시지 목록이 있으면 아바타만 업데이트
            if (window._lastMsgs) updateReadAvatars(window._lastMsgs, myUid, roomId);
        });

    chatMsgListener = getChatDb().ref(`chats/${roomId}/messages`)
        .orderByChild('timestamp')
        .limitToLast(200)
        .on('value', (snap) => {
            window._lastMsgs = snap.val() || {};
            renderChatMessages(window._lastMsgs, myUid, roomId);
            markMessagesAsRead(roomId, myUid);
        });

    setTimeout(() => document.getElementById('chatInput')?.focus(), 100);

    // PC에서만 Shift+Enter 힌트 표시
    const hint = document.getElementById(`pcHint_${roomId}`);
    if (hint && !/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        hint.style.display = 'block';
    }
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
        let bubbleContent = '';
        if (msg.text) bubbleContent += escapeHTML(msg.text).replace(/\n/g, '<br>');
        if (msg.imageBase64) {
            bubbleContent += `${msg.text ? '<br>' : ''}<img src="${msg.imageBase64}"
                onclick="openChatImageModal('${msgId}')"
                style="max-width:220px;max-height:220px;border-radius:10px;
                display:block;margin-top:${msg.text ? '6px' : '0'};cursor:zoom-in;object-fit:cover;">`;
        }
        if (msg.fileName) {
            const icon = getChatFileIcon(msg.fileType || '');
            const sizeStr = msg.fileSize > 1048576
                ? (msg.fileSize / 1048576).toFixed(1) + ' MB'
                : Math.round(msg.fileSize / 1024) + ' KB';
            bubble.style.cssText = bubble.style.cssText.replace('max-width:72%','max-width:80%');
            bubbleContent = `
                <div style="display:flex;align-items:center;gap:10px;min-width:180px;max-width:240px;">
                    <div style="width:40px;height:40px;border-radius:8px;flex-shrink:0;
                        background:${isMe ? 'rgba(255,255,255,0.2)' : '#f0f4ff'};
                        display:flex;align-items:center;justify-content:center;font-size:20px;">${icon}</div>
                    <div style="min-width:0;flex:1;">
                        <div style="font-size:13px;font-weight:600;
                            white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                            color:${isMe ? 'white' : '#212529'};">${escapeHTML(msg.fileName)}</div>
                        <div style="font-size:11px;margin-top:2px;
                            color:${isMe ? 'rgba(255,255,255,0.7)' : '#aaa'};">${sizeStr}</div>
                    </div>
                    <button onclick="downloadChatFile('${msgId}')"
                        style="width:32px;height:32px;border-radius:50%;flex-shrink:0;border:none;cursor:pointer;
                        background:${isMe ? 'rgba(255,255,255,0.25)' : '#e8f0fe'};
                        color:${isMe ? 'white' : '#1565c0'};display:flex;align-items:center;justify-content:center;"
                        title="다운로드">
                        <i class="fas fa-download" style="font-size:13px;"></i>
                    </button>
                </div>`;
            bubble.dataset.fileId = msgId;
        }
        bubble.innerHTML = bubbleContent;
        bubble.dataset.img = msg.imageBase64 || '';
        if (msg.imageBase64) bubble.style.padding = '6px';
        if (isMe) bubble.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') return; // 이미지 클릭은 모달로
            showChatMsgMenu(msgId, roomId, bubble);
        });

        const timeEl = document.createElement('span');
        timeEl.style.cssText = 'font-size:10px;color:#888;flex-shrink:0;margin-bottom:2px;';
        timeEl.textContent   = timeStr;

        msgEl.id = `msgEl-${msgId}`;
        msgEl.appendChild(bubble);
        msgEl.appendChild(timeEl);
        // 읽음 아바타 슬롯 (내 메시지에만)
        if (isMe) {
            const avatarSlot = document.createElement('div');
            avatarSlot.id = `readSlot-${msgId}`;
            avatarSlot.style.cssText = 'display:flex;gap:2px;align-items:center;margin-bottom:2px;min-width:0;';
            msgEl.insertBefore(avatarSlot, bubble); // row-reverse라 bubble 앞이 오른쪽
        }
        container.appendChild(msgEl);
    }

    if (wasAtBottom) container.scrollTop = container.scrollHeight;

    // 읽음 아바타 렌더링
    updateReadAvatars(msgs, myUid, roomId);
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
    if (!confirm('이 메시지를 삭제하시겠습니까?\n(모든 참여자에게서 삭제됩니다)')) return;
    try {
        await getChatDb().ref(`chats/${roomId}/messages/${msgId}`).remove();
        showChatToast('✅ 메시지가 삭제되었습니다');
    } catch (e) {
        showChatToast('❌ 삭제 실패: ' + e.message);
    }
};

// ===== 메시지 전송 =====
window.sendChatMessage = async function (roomId) {
    if (!isLoggedIn()) return;

    if (!isChatAuthReady()) {
        showChatToast('⚠️ 채팅 인증이 필요해요. 재로그인해주세요.');
        _showChatAuthExpiredBanner();
        return;
    }

    const input      = document.getElementById('chatInput');
    const imageInput = document.getElementById('chatImageInput');
    const fileInput  = document.getElementById('chatFileInput');
    const text       = input?.value.trim();
    const hasImage   = imageInput?.files?.[0];
    const hasFiles   = fileInput?.files?.length > 0;

    if (!text && !hasImage && !hasFiles) return;

    const now = Date.now();
    if (now - CHAT_RATE.lastReset > CHAT_RATE.WINDOW) { CHAT_RATE.count = 0; CHAT_RATE.lastReset = now; }
    CHAT_RATE.count++;
    if (CHAT_RATE.count > CHAT_RATE.MAX) {
        showChatToast('⚠️ 너무 빠르게 보내고 있어요.'); return;
    }
    if (text.length > 500) {
        showChatToast('⚠️ 메시지는 500자 이하로 입력해주세요.'); return;
    }

    // 이미지 압축
    let imageBase64 = null;
    if (hasImage) {
        try {
            imageBase64 = await compressChatImage(imageInput.files[0]);
        } catch(e) {
            showChatToast('❌ 이미지 처리 실패'); return;
        }
    }

    // 파일 처리 (파일별로 별도 메시지 전송)
    let filesToSend = [];
    if (hasFiles) {
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        for (const file of Array.from(fileInput.files)) {
            if (file.size > MAX_SIZE) {
                showChatToast(`❌ ${file.name} — 5MB 초과`); continue;
            }
            try {
                const b64 = await readFileAsBase64(file);
                filesToSend.push({ name: file.name, size: file.size, type: file.type, data: b64 });
            } catch(e) {
                showChatToast(`❌ ${file.name} 읽기 실패`);
            }
        }
    }

    if (input) { input.value = ''; input.style.height = 'auto'; }
    clearChatImage();
    clearChatFiles();

    const myUid  = getChatUserId();
    const myName = getMyNickname();
    const ts     = Date.now();

    try {
        const messagesRef = getChatDb().ref(`chats/${roomId}/messages`);
        let preview = '';

        // 텍스트+이미지 메시지
        if (text || imageBase64) {
            const msgData = { senderId: myUid, senderName: myName, text: text || '', timestamp: ts, read: false };
            if (imageBase64) msgData.imageBase64 = imageBase64;
            await messagesRef.push(msgData);
            preview = imageBase64 && !text ? '📷 사진' : (text.length > 30 ? text.substring(0, 30) + '...' : text);
        }

        // 파일 메시지 (각각 별도 전송)
        for (const f of filesToSend) {
            const fileMsg = {
                senderId: myUid, senderName: myName, text: '', timestamp: Date.now(),
                read: false,
                fileName: f.name, fileSize: f.size, fileType: f.type, fileData: f.data
            };
            await messagesRef.push(fileMsg);
            preview = `📎 ${f.name}`;
        }

        if (!preview) preview = '메시지';
        await getChatDb().ref(`chats/${roomId}`).update({
            lastMessage: preview, lastMessageAt: ts, lastSenderId: myUid
        });

        const roomSnap     = await getChatDb().ref(`chats/${roomId}`).once('value');
        const roomData     = roomSnap.val() || {};
        const mainUids     = roomData.mainUids || {};
        const participants = Object.keys(roomData.participants || {});
        const notifTargets = participants.filter(uid => uid !== myUid);
        await Promise.all(notifTargets.map(async uid => {
            const targetMainUid = mainUids[uid];
            if (targetMainUid) await sendChatNotification(targetMainUid, myName, preview, roomId, auth.currentUser?.uid);
        }));

        // ✅ 백그라운드 FCM 푸시 트리거 (GitHub Actions)
        if (notifTargets.length > 0 && typeof triggerGithubNotification === 'function') {
            triggerGithubNotification(true);
        }

        updateChatBadge();
    } catch (e) {
        console.error('전송 실패:', e);
        showChatToast('❌ 전송 실패: ' + e.message);
        if (input) input.value = text;
    }
};

    

// ===== 채팅 알림 전송 (메인 DB) =====
// toUid: 수신자의 메인앱 UID, senderMainUid: 발신자의 메인앱 UID
async function sendChatNotification(toUid, fromName, text, roomId, senderMainUid) {
    try {
        const [globalSnap, roomSnap, filterSnap] = await Promise.all([
            db.ref(`users/${toUid}/notificationTypes/chat`).once('value'),
            db.ref(`users/${toUid}/notificationTypes/chatRooms/${roomId}`).once('value'),
            senderMainUid
                ? db.ref(`users/${toUid}/notificationTypes/chatFilterUsers/${senderMainUid}`).once('value')
                : Promise.resolve({ val: () => null })
        ]);

        // 전체 채팅 알림 꺼짐
        if (globalSnap.val() === false) return;
        // 이 방 알림 꺼짐
        if (roomSnap.val() === false) return;
        // 이 발신자 알림 꺼짐
        if (filterSnap.val() === false) return;

        const notifId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        await db.ref(`notifications/${toUid}/${notifId}`).set({
            type: 'chat', title: `💬 ${fromName}`,
            text: text.length > 50 ? text.substring(0, 50) + '...' : text,
            timestamp: Date.now(), read: false, pushed: false, roomId
        });
    } catch (e) { console.warn('채팅 알림 전송 실패:', e.message); }
}

// ===== 엔터키 =====
window.handleChatKeydown = function (e, roomId) {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (e.key === 'Enter') {
        if (isMobile) {
            // 모바일: Enter는 항상 전송 (줄바꿈은 버튼으로)
            e.preventDefault();
            sendChatMessage(roomId);
        } else {
            // PC: Shift+Enter 줄바꿈, Enter만 전송
            if (!e.shiftKey) { e.preventDefault(); sendChatMessage(roomId); }
        }
    }
};

// ===== 채팅 이미지 압축 =====
function compressChatImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const MAX = 1024;
                let w = img.width, h = img.height;
                if (w > MAX || h > MAX) {
                    if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                    else       { w = Math.round(w * MAX / h); h = MAX; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.75));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

window.previewChatImage = function (input) {
    if (!input.files?.[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.getElementById('chatImgPreview');
        const img     = document.getElementById('chatImgPreviewImg');
        if (img) img.src = e.target.result;
        if (preview) preview.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
};

window.clearChatImage = function () {
    const preview    = document.getElementById('chatImgPreview');
    const imageInput = document.getElementById('chatImageInput');
    const img        = document.getElementById('chatImgPreviewImg');
    if (preview) preview.style.display = 'none';
    if (img) img.src = '';
    if (imageInput) imageInput.value = '';
};

// ===== 파일 첨부 헬퍼 =====
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload  = e => resolve(e.target.result);
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}

function getChatFileIcon(mimeType) {
    if (!mimeType) return '📎';
    if (mimeType.startsWith('image/'))                              return '🖼️';
    if (mimeType.startsWith('video/'))                              return '🎬';
    if (mimeType.startsWith('audio/'))                              return '🎵';
    if (mimeType.includes('pdf'))                                   return '📄';
    if (mimeType.includes('word') || mimeType.includes('msword'))   return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet') || mimeType.includes('csv')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📑';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('tar')) return '🗜️';
    if (mimeType.startsWith('text/'))                               return '📃';
    if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('xml')) return '💾';
    return '📎';
}

window.clearChatFiles = function () {
    const input = document.getElementById('chatFileInput');
    if (input) input.value = '';
    document.querySelectorAll('[id^="chatFilePreview_"]').forEach(el => {
        el.innerHTML = '';
        el.style.display = 'none';
    });
};

window.previewChatFiles = function (input, roomId) {
    const preview = document.getElementById(`chatFilePreview_${roomId}`);
    if (!preview) return;
    preview.innerHTML = '';
    preview.style.display = 'none';
    if (!input.files?.length) return;

    const MAX = 5 * 1024 * 1024;
    Array.from(input.files).forEach(file => {
        const icon    = getChatFileIcon(file.type);
        const sizeStr = file.size > 1048576
            ? (file.size / 1048576).toFixed(1) + ' MB'
            : Math.round(file.size / 1024) + ' KB';
        const isOver = file.size > MAX;
        const chip = document.createElement('div');
        chip.style.cssText = `display:inline-flex;align-items:center;gap:6px;
            background:${isOver ? '#ffebee' : '#f0f4ff'};
            border:1px solid ${isOver ? '#ffcdd2' : '#c5cae9'};
            border-radius:20px;padding:4px 10px 4px 8px;font-size:12px;`;
        chip.innerHTML = `
            <span style="font-size:15px;">${icon}</span>
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;
                color:${isOver ? '#c62828' : '#1565c0'};">${escapeHTML(file.name)}</span>
            <span style="color:#aaa;flex-shrink:0;">${sizeStr}${isOver ? ' ⚠️' : ''}</span>`;
        preview.appendChild(chip);
    });
    preview.style.display = 'flex';
};

window.downloadChatFile = function (msgId) {
    const msgs = window._lastMsgs || {};
    const msg  = msgs[msgId];
    if (!msg?.fileData) { showChatToast('❌ 파일을 찾을 수 없습니다'); return; }
    const a    = document.createElement('a');
    a.href     = msg.fileData;
    a.download = msg.fileName || 'file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// ===== 채팅 이미지 전체보기 모달 =====
window.openChatImageModal = function (msgId) {
    document.getElementById('_chatImgModal')?.remove();
    const bubble = document.querySelector(`[data-msgid="${msgId}"]`);
    const src    = bubble?.dataset?.img;
    if (!src) return;
    const modal = document.createElement('div');
    modal.id = '_chatImgModal';
    modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.92);z-index:999999;display:flex;align-items:center;
        justify-content:center;cursor:zoom-out;`;
    modal.innerHTML = `<img src="${src}"
        style="max-width:95vw;max-height:90vh;border-radius:10px;object-fit:contain;">`;
    modal.addEventListener('click', () => modal.remove());
    document.body.appendChild(modal);
};

window.insertChatNewline = function () {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const start = input.selectionStart;
    const end   = input.selectionEnd;
    input.value = input.value.substring(0, start) + '\n' + input.value.substring(end);
    input.selectionStart = input.selectionEnd = start + 1;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    input.focus();
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

        // ✅ 마지막으로 읽은 메시지 ID 저장 (readReceipts)
        const allSnap = await getChatDb().ref(`chats/${roomId}/messages`)
            .orderByChild('timestamp').limitToLast(1).once('value');
        allSnap.forEach(child => {
            getChatDb().ref(`chats/${roomId}/readReceipts/${myUid}`).set(child.key);
        });
    } catch (e) {}
}

// ===== 읽음 아바타 업데이트 =====
async function updateReadAvatars(msgs, myUid, roomId) {
    const receipts = window._readReceipts || {};
    // 나 제외한 참여자별 lastReadMsgId
    const others = Object.entries(receipts).filter(([uid]) => uid !== myUid);
    if (others.length === 0) return;

    // msgId → 읽은 사람 chatUid[] 매핑
    const readMap = {};
    others.forEach(([uid, msgId]) => {
        if (!readMap[msgId]) readMap[msgId] = [];
        readMap[msgId].push(uid);
    });

    // 프로필 사진: mainUids 통해 메인DB에서 가져옴 (캐시)
    if (!window._chatAvatarCache) window._chatAvatarCache = {};
    const cache = window._chatAvatarCache;

    // 필요한 uid 프로필 로드
    const roomSnap = await getChatDb().ref(`chats/${roomId}/mainUids`).once('value');
    const mainUids = roomSnap.val() || {};

    for (const [chatUid] of others) {
        if (cache[chatUid] !== undefined) continue;
        const mainUid = mainUids[chatUid];
        if (!mainUid) { cache[chatUid] = null; continue; }
        try {
            const userSnap = await db.ref(`users/${mainUid}/profilePhoto`).once('value');
            cache[chatUid] = userSnap.val() || null;
        } catch { cache[chatUid] = null; }
    }

    // 기존 아바타 슬롯 초기화
    document.querySelectorAll('[id^="readSlot-"]').forEach(el => el.innerHTML = '');

    // 각 msgId 슬롯에 아바타 추가
    for (const [msgId, uids] of Object.entries(readMap)) {
        const slot = document.getElementById(`readSlot-${msgId}`);
        if (!slot) continue;
        uids.slice(0, 5).forEach(chatUid => {
            const photo = cache[chatUid];
            const avatar = document.createElement('div');
            avatar.title = '읽음';
            if (photo) {
                avatar.innerHTML = `<img src="${photo}"
                    style="width:16px;height:16px;border-radius:50%;object-fit:cover;
                    border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.2);">`;
            } else {
                avatar.style.cssText = `width:16px;height:16px;border-radius:50%;
                    background:#c62828;display:flex;align-items:center;justify-content:center;
                    border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.2);`;
                avatar.innerHTML = `<i class="fas fa-user" style="font-size:8px;color:white;"></i>`;
            }
            slot.appendChild(avatar);
        });
    }
}

// ===== 새 채팅 모달 =====
window.showNewChatModal = async function () {
    document.getElementById('_newChatModal')?.remove();
    const usersSnap = await db.ref('users').once('value');
    const usersData = usersSnap.val() || {};
    const myMainUid = auth.currentUser?.uid;  // ✅ 메인앱 UID로 본인 제외
    const myUid     = getChatUserId();

    // ✅ 이메일 기준 중복 제거 - chatUid 있는 항목 우선 보존
    const emailBestMap = new Map();
    for (const [uid, u] of Object.entries(usersData)) {
        if (uid === myMainUid || !u || !u.email) continue;
        const key = u.email.toLowerCase();
        const existing = emailBestMap.get(key);
        // chatUid 있는 항목이 없거나, 현재 항목이 chatUid를 가지면 교체
        if (!existing || (!existing[1].chatUid && u.chatUid)) {
            emailBestMap.set(key, [uid, u]);
        }
    }
    const userItems = Array.from(emailBestMap.values())
        // ✅ 내 chatUid와 같은 항목 제거 (자기 자신 방어)
        .filter(([uid, u]) => !u.chatUid || u.chatUid !== myUid)
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
                <div style="display:flex;gap:8px;align-items:center;">
                    <button onclick="document.getElementById('_newChatModal').remove();showNewGroupModal()"
                        style="background:rgba(255,255,255,0.22);border:none;color:white;
                        padding:6px 12px;border-radius:14px;cursor:pointer;font-size:12px;font-weight:600;">
                        <i class="fas fa-users"></i> 그룹
                    </button>
                    <button onclick="document.getElementById('_newChatModal').remove()"
                        style="background:none;border:none;color:white;font-size:22px;cursor:pointer;line-height:1;">✕</button>
                </div>
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

// ===== 그룹 채팅 생성 모달 =====
window.showNewGroupModal = async function () {
    document.getElementById('_newGroupModal')?.remove();
    const usersSnap = await db.ref('users').once('value');
    const usersData = usersSnap.val() || {};
    const myMainUid = auth.currentUser?.uid;
    const myUid     = getChatUserId();

    const emailBestMap = new Map();
    for (const [uid, u] of Object.entries(usersData)) {
        if (uid === myMainUid || !u || !u.email || !u.chatUid) continue;
        const key = u.email.toLowerCase();
        const ex  = emailBestMap.get(key);
        if (!ex || (!ex[1].chatUid && u.chatUid)) emailBestMap.set(key, [uid, u]);
    }
    const userItems = Array.from(emailBestMap.values())
        .filter(([, u]) => u.chatUid !== myUid)
        .sort(([, a], [, b]) => resolveNickname(a).localeCompare(resolveNickname(b), 'ko'))
        .map(([uid, u]) => {
            const name  = resolveNickname(u);
            const photo = u.profilePhoto;
            const photoHTML = photo
                ? `<img src="${photo}" style="width:38px;height:38px;min-width:38px;border-radius:50%;object-fit:cover;border:1.5px solid #dadce0;">`
                : `<div style="width:38px;height:38px;min-width:38px;border-radius:50%;background:#f1f3f4;display:flex;align-items:center;justify-content:center;border:1.5px solid #dadce0;"><i class="fas fa-user" style="color:#9aa0a6;font-size:15px;"></i></div>`;
            return `
                <label data-name="${name.toLowerCase()}" data-email="${u.email.toLowerCase()}"
                    style="display:flex;align-items:center;gap:12px;padding:11px 16px;cursor:pointer;
                    border-bottom:1px solid #f5f5f5;transition:background 0.15s;"
                    onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                    <input type="checkbox" value="${u.chatUid}" data-mainuid="${uid}" data-name="${escapeHTML(name)}"
                        style="width:18px;height:18px;cursor:pointer;accent-color:#c62828;flex-shrink:0;">
                    ${photoHTML}
                    <div>
                        <div style="font-weight:600;font-size:14px;color:#212529;">${escapeHTML(name)}</div>
                        <div style="font-size:12px;color:#adb5bd;">${escapeHTML(u.email)}</div>
                    </div>
                </label>`;
        }).join('');

    const modal = document.createElement('div');
    modal.id = '_newGroupModal';
    modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;
        justify-content:center;padding:16px;`;
    modal.innerHTML = `
        <div style="background:white;border-radius:16px;width:100%;max-width:420px;
            max-height:85vh;overflow:hidden;display:flex;flex-direction:column;
            box-shadow:0 8px 32px rgba(0,0,0,0.2);">
            <div style="background:linear-gradient(135deg,#c62828,#e53935);
                padding:16px 20px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                <h3 style="color:white;margin:0;font-size:16px;font-weight:700;">
                    <i class="fas fa-users"></i> 그룹 채팅 만들기
                </h3>
                <button onclick="document.getElementById('_newGroupModal').remove()"
                    style="background:none;border:none;color:white;font-size:22px;cursor:pointer;line-height:1;">✕</button>
            </div>
            <div style="padding:12px 16px;border-bottom:1px solid #f0f0f0;flex-shrink:0;">
                <input id="_groupNameInput" type="text" placeholder="그룹 이름 입력..."
                    style="width:100%;padding:10px 16px;border:1.5px solid #dee2e6;
                    border-radius:22px;font-size:14px;outline:none;box-sizing:border-box;margin-bottom:8px;"
                    onfocus="this.style.borderColor='#c62828'" onblur="this.style.borderColor='#dee2e6'">
                <input id="_groupSearch" type="text" placeholder="멤버 검색..."
                    oninput="filterGroupUsers(this.value)"
                    style="width:100%;padding:10px 16px;border:1.5px solid #dee2e6;
                    border-radius:22px;font-size:14px;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#c62828'" onblur="this.style.borderColor='#dee2e6'">
            </div>
            <div id="_groupUserList" style="overflow-y:auto;flex:1;">
                ${userItems || '<p style="text-align:center;color:#adb5bd;padding:30px;">초대할 수 있는 유저가 없습니다.</p>'}
            </div>
            <div style="padding:12px 16px;border-top:1px solid #f0f0f0;flex-shrink:0;">
                <button onclick="startNewGroup()"
                    style="width:100%;background:#c62828;color:white;border:none;
                    padding:12px;border-radius:22px;cursor:pointer;font-size:15px;font-weight:700;">
                    <i class="fas fa-check"></i> 그룹 만들기
                </button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    setTimeout(() => document.getElementById('_groupNameInput')?.focus(), 50);
};

window.filterGroupUsers = function (kw) {
    const q = kw.toLowerCase();
    document.querySelectorAll('#_groupUserList > label').forEach(el => {
        el.style.display =
            ((el.dataset.name || '').includes(q) || (el.dataset.email || '').includes(q)) ? 'flex' : 'none';
    });
};

window.startNewGroup = async function () {
    const groupName = document.getElementById('_groupNameInput')?.value.trim();
    if (!groupName) { showChatToast('⚠️ 그룹 이름을 입력해주세요.'); return; }

    const checked = [...document.querySelectorAll('#_groupUserList input[type=checkbox]:checked')];
    if (checked.length < 1) { showChatToast('⚠️ 멤버를 1명 이상 선택해주세요.'); return; }

    document.getElementById('_newGroupModal').remove();

    const myUid     = getChatUserId();
    const myMainUid = auth.currentUser?.uid;
    const roomId    = 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const participants = { [myUid]: true };
    const mainUids     = { [myUid]: myMainUid };
    checked.forEach(cb => {
        participants[cb.value] = true;
        mainUids[cb.value]     = cb.dataset.mainuid;
    });

    try {
        await getChatDb().ref(`chats/${roomId}`).set({
            isGroup: true,
            groupName,
            participants,
            mainUids,
            createdAt: Date.now(), lastMessage: '', lastMessageAt: Date.now()
        });
        await Promise.all(Object.keys(participants).map(uid =>
            getChatDb().ref(`userChats/${uid}/${roomId}`).set(true)
        ));
        openChatRoom(roomId, null, groupName, null, null);
    } catch (e) {
        showChatToast('❌ 그룹 생성 실패: ' + e.message);
    }
};

// ===== 그룹 초대 모달 =====
window.showGroupInviteModal = async function (roomId) {
    document.getElementById('_groupInviteModal')?.remove();

    const [roomSnap, usersSnap] = await Promise.all([
        getChatDb().ref(`chats/${roomId}`).once('value'),
        db.ref('users').once('value')
    ]);
    const roomData     = roomSnap.val() || {};
    const participants = roomData.participants || {};
    const mainUids     = roomData.mainUids || {};
    const usersData    = usersSnap.val() || {};
    const myMainUid    = auth.currentUser?.uid;
    const myUid        = getChatUserId();

    // 현재 참여자의 mainUid 목록
    const existingMainUids = new Set(Object.values(mainUids));

    // 초대 가능한 유저 (chatUid 있고, 이미 참여 중이 아닌)
    const emailBestMap = new Map();
    for (const [uid, u] of Object.entries(usersData)) {
        if (uid === myMainUid || !u || !u.email || !u.chatUid) continue;
        if (existingMainUids.has(uid)) continue; // 이미 참여 중
        const key = u.email.toLowerCase();
        const ex  = emailBestMap.get(key);
        if (!ex || (!ex[1].chatUid && u.chatUid)) emailBestMap.set(key, [uid, u]);
    }

    const userItems = Array.from(emailBestMap.values())
        .filter(([, u]) => u.chatUid !== myUid)
        .sort(([, a], [, b]) => resolveNickname(a).localeCompare(resolveNickname(b), 'ko'))
        .map(([uid, u]) => {
            const name  = resolveNickname(u);
            const photo = u.profilePhoto;
            const photoHTML = photo
                ? `<img src="${photo}" style="width:38px;height:38px;min-width:38px;border-radius:50%;object-fit:cover;border:1.5px solid #dadce0;">`
                : `<div style="width:38px;height:38px;min-width:38px;border-radius:50%;background:#f1f3f4;display:flex;align-items:center;justify-content:center;border:1.5px solid #dadce0;"><i class="fas fa-user" style="color:#9aa0a6;font-size:15px;"></i></div>`;
            return `
                <label data-name="${name.toLowerCase()}" data-email="${u.email.toLowerCase()}"
                    style="display:flex;align-items:center;gap:12px;padding:11px 16px;cursor:pointer;
                    border-bottom:1px solid #f5f5f5;transition:background 0.15s;"
                    onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                    <input type="checkbox" value="${u.chatUid}" data-mainuid="${uid}" data-name="${escapeHTML(name)}"
                        style="width:18px;height:18px;cursor:pointer;accent-color:#c62828;flex-shrink:0;">
                    ${photoHTML}
                    <div>
                        <div style="font-weight:600;font-size:14px;color:#212529;">${escapeHTML(name)}</div>
                        <div style="font-size:12px;color:#adb5bd;">${escapeHTML(u.email)}</div>
                    </div>
                </label>`;
        }).join('');

    const modal = document.createElement('div');
    modal.id = '_groupInviteModal';
    modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;
        justify-content:center;padding:16px;`;
    modal.innerHTML = `
        <div style="background:white;border-radius:16px;width:100%;max-width:420px;
            max-height:85vh;overflow:hidden;display:flex;flex-direction:column;
            box-shadow:0 8px 32px rgba(0,0,0,0.2);">
            <div style="background:linear-gradient(135deg,#c62828,#e53935);
                padding:16px 20px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                <h3 style="color:white;margin:0;font-size:16px;font-weight:700;">
                    <i class="fas fa-user-plus"></i> 멤버 초대
                </h3>
                <button onclick="document.getElementById('_groupInviteModal').remove()"
                    style="background:none;border:none;color:white;font-size:22px;cursor:pointer;line-height:1;">✕</button>
            </div>
            <div style="padding:12px 16px;border-bottom:1px solid #f0f0f0;flex-shrink:0;">
                <input id="_inviteSearch" type="text" placeholder="멤버 검색..."
                    oninput="filterInviteUsers(this.value)"
                    style="width:100%;padding:10px 16px;border:1.5px solid #dee2e6;
                    border-radius:22px;font-size:14px;outline:none;box-sizing:border-box;"
                    onfocus="this.style.borderColor='#c62828'" onblur="this.style.borderColor='#dee2e6'">
            </div>
            <div id="_inviteUserList" style="overflow-y:auto;flex:1;">
                ${userItems || '<p style="text-align:center;color:#adb5bd;padding:30px;">초대할 수 있는 유저가 없습니다.</p>'}
            </div>
            <div style="padding:12px 16px;border-top:1px solid #f0f0f0;flex-shrink:0;">
                <button onclick="confirmGroupInvite('${roomId}')"
                    style="width:100%;background:#c62828;color:white;border:none;
                    padding:12px;border-radius:22px;cursor:pointer;font-size:15px;font-weight:700;">
                    <i class="fas fa-check"></i> 초대하기
                </button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    setTimeout(() => document.getElementById('_inviteSearch')?.focus(), 50);
};

window.filterInviteUsers = function (kw) {
    const q = kw.toLowerCase();
    document.querySelectorAll('#_inviteUserList > label').forEach(el => {
        el.style.display =
            ((el.dataset.name || '').includes(q) || (el.dataset.email || '').includes(q)) ? 'flex' : 'none';
    });
};

window.confirmGroupInvite = async function (roomId) {
    const checked = [...document.querySelectorAll('#_inviteUserList input[type=checkbox]:checked')];
    if (checked.length === 0) { showChatToast('⚠️ 초대할 멤버를 선택해주세요.'); return; }

    document.getElementById('_groupInviteModal').remove();
    try {
        const updates = {};
        checked.forEach(cb => {
            updates[`chats/${roomId}/participants/${cb.value}`]    = true;
            updates[`chats/${roomId}/mainUids/${cb.value}`]        = cb.dataset.mainuid;
            updates[`userChats/${cb.value}/${roomId}`]             = true;
        });
        await getChatDb().ref().update(updates);
        const names = checked.map(cb => cb.dataset.name).join(', ');
        showChatToast(`✅ ${names}님을 초대했습니다`);
        // 시스템 메시지
        const myName = getMyNickname();
        await getChatDb().ref(`chats/${roomId}/messages`).push({
            senderId: '__system__', senderName: '시스템',
            text: `${myName}님이 ${names}님을 초대했습니다.`,
            timestamp: Date.now(), read: false
        });
        await getChatDb().ref(`chats/${roomId}`).update({
            lastMessage: `${myName}님이 ${names}님을 초대했습니다.`,
            lastMessageAt: Date.now()
        });
    } catch (e) {
        showChatToast('❌ 초대 실패: ' + e.message);
    }
};

// ===== 그룹 나가기 =====
window.leaveGroupChat = async function (roomId) {
    if (!confirm('그룹에서 나가시겠습니까?\n(내 채팅 목록에서만 제거됩니다)')) return;
    const myUid = getChatUserId();
    try {
        await getChatDb().ref(`chats/${roomId}/participants/${myUid}`).remove();
        await getChatDb().ref(`chats/${roomId}/mainUids/${myUid}`).remove();
        await getChatDb().ref(`userChats/${myUid}/${roomId}`).remove();

        // 남은 참여자가 없으면 방 삭제
        const snap = await getChatDb().ref(`chats/${roomId}/participants`).once('value');
        if (!snap.exists() || Object.keys(snap.val() || {}).length === 0) {
            await getChatDb().ref(`chats/${roomId}`).remove();
        }
        showChatPage();
    } catch (e) {
        showChatToast('❌ 나가기 실패: ' + e.message);
    }
};

// ===== 채팅방 더보기 메뉴 =====
window.showRoomMenu = async function (roomId, isGroupStr) {
    document.getElementById('_roomMenu')?.remove();
    const isGroup = isGroupStr === 'true' || isGroupStr === true;
    const myUid   = getChatUserId();
    const myMainUid = auth.currentUser?.uid;

    // 현재 이 방 알림 설정 읽기
    const notifSnap = await db.ref(`users/${myMainUid}/notificationTypes/chatRooms/${roomId}`).once('value');
    const roomNotifOn = notifSnap.val() !== false; // 기본 true

    // 그룹이면 멤버 목록 로드
    let memberListHTML = '';
    if (isGroup) {
        try {
            const [roomSnap, usersSnap] = await Promise.all([
                getChatDb().ref(`chats/${roomId}`).once('value'),
                db.ref('users').once('value')
            ]);
            const roomData = roomSnap.val() || {};
            const mainUids = roomData.mainUids || {};
            const participants = Object.keys(roomData.participants || {});
            const usersData = usersSnap.val() || {};

            const memberItems = participants.map(chatUid => {
                const mainUid = mainUids[chatUid];
                const u = usersData[mainUid] || {};
                const name = resolveNickname(u) || '알 수 없음';
                const photo = u.profilePhoto;
                const isMe = chatUid === myUid;
                const photoHTML = photo
                    ? `<img src="${photo}" style="width:32px;height:32px;min-width:32px;border-radius:50%;object-fit:cover;border:1.5px solid #dadce0;">`
                    : `<div style="width:32px;height:32px;min-width:32px;border-radius:50%;background:#f1f3f4;display:flex;align-items:center;justify-content:center;border:1.5px solid #dadce0;"><i class="fas fa-user" style="color:#9aa0a6;font-size:13px;"></i></div>`;
                return `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;">
                    ${photoHTML}
                    <span style="font-size:14px;font-weight:600;color:#212529;">${escapeHTML(name)}</span>
                    ${isMe ? '<span style="font-size:11px;color:#aaa;margin-left:4px;">(나)</span>' : ''}
                </div>`;
            }).join('');

            memberListHTML = `
                <div style="padding:14px 0;border-bottom:1px solid #f5f5f5;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                        <span style="font-size:13px;font-weight:700;color:#6c757d;">
                            <i class="fas fa-users" style="color:#c62828;margin-right:6px;"></i>멤버 (${participants.length}명)
                        </span>
                        <button onclick="document.getElementById('_roomMenu').remove();showGroupInviteModal('${roomId}')"
                            style="background:#c62828;border:none;color:white;padding:5px 12px;
                            border-radius:14px;cursor:pointer;font-size:12px;font-weight:600;">
                            <i class="fas fa-user-plus"></i> 초대
                        </button>
                    </div>
                    <div style="max-height:160px;overflow-y:auto;">${memberItems}</div>
                </div>`;
        } catch (e) {
            console.warn('멤버 로드 실패:', e);
        }
    }

    const menu = document.createElement('div');
    menu.id = '_roomMenu';
    menu.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.4);z-index:99999;display:flex;align-items:flex-end;`;
    menu.innerHTML = `
        <div style="background:white;width:100%;border-radius:20px 20px 0 0;padding:20px 0 32px;
            box-shadow:0 -4px 24px rgba(0,0,0,0.15);max-width:600px;margin:0 auto;">
            <div style="width:40px;height:4px;background:#dee2e6;border-radius:2px;margin:0 auto 20px;"></div>
            <div style="padding:0 20px;">
                ${memberListHTML}
                <div onclick="document.getElementById('_roomMenu').remove();showChatSearch('${roomId}')"
                    style="display:flex;align-items:center;gap:12px;padding:14px 0;
                    border-bottom:1px solid #f5f5f5;cursor:pointer;">
                    <i class="fas fa-search" style="color:#1565c0;width:20px;text-align:center;"></i>
                    <span style="font-size:15px;font-weight:600;color:#212529;">메시지 검색</span>
                    <i class="fas fa-chevron-right" style="color:#ccc;margin-left:auto;font-size:12px;"></i>
                </div>
                <div onclick="document.getElementById('_roomMenu').remove();showChatMediaGallery('${roomId}')"
                    style="display:flex;align-items:center;gap:12px;padding:14px 0;
                    border-bottom:1px solid #f5f5f5;cursor:pointer;">
                    <i class="fas fa-photo-video" style="color:#6a1b9a;width:20px;text-align:center;"></i>
                    <span style="font-size:15px;font-weight:600;color:#212529;">사진·링크·파일 모아보기</span>
                    <i class="fas fa-chevron-right" style="color:#ccc;margin-left:auto;font-size:12px;"></i>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:14px 0;border-bottom:1px solid #f5f5f5;">
                    <span style="font-size:15px;font-weight:600;color:#212529;">
                        <i class="fas fa-bell" style="color:#c62828;margin-right:10px;"></i>이 채팅 알림
                    </span>
                    <label style="position:relative;display:inline-block;width:46px;height:26px;cursor:pointer;">
                        <input type="checkbox" id="_roomNotifToggle" ${roomNotifOn ? 'checked' : ''}
                            onchange="saveRoomNotifSetting('${roomId}', this.checked)"
                            style="opacity:0;width:0;height:0;">
                        <span style="position:absolute;top:0;left:0;right:0;bottom:0;
                            background:${roomNotifOn ? '#c62828' : '#dee2e6'};border-radius:26px;
                            transition:0.3s;" id="_roomNotifTrack">
                            <span style="position:absolute;height:20px;width:20px;left:${roomNotifOn ? '23px' : '3px'};
                                bottom:3px;background:white;border-radius:50%;transition:0.3s;"
                                id="_roomNotifThumb"></span>
                        </span>
                    </label>
                </div>
                ${isGroup ? `
                <div style="padding:14px 0;border-bottom:1px solid #f5f5f5;">
                    <button onclick="document.getElementById('_roomMenu').remove();leaveGroupChat('${roomId}')"
                        style="width:100%;background:none;border:none;text-align:left;font-size:15px;
                        font-weight:600;color:#c62828;cursor:pointer;padding:0;display:flex;align-items:center;gap:10px;">
                        <i class="fas fa-sign-out-alt"></i> 그룹 나가기
                    </button>
                </div>` : ''}
            </div>
        </div>`;
    document.body.appendChild(menu);

    // 토글 시각 효과
    const toggle = document.getElementById('_roomNotifToggle');
    toggle.addEventListener('change', function() {
        const track = document.getElementById('_roomNotifTrack');
        const thumb = document.getElementById('_roomNotifThumb');
        track.style.background = this.checked ? '#c62828' : '#dee2e6';
        thumb.style.left       = this.checked ? '23px' : '3px';
    });

    menu.addEventListener('click', e => { if (e.target === menu) menu.remove(); });
};

window.saveRoomNotifSetting = async function (roomId, enabled) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await db.ref(`users/${uid}/notificationTypes/chatRooms/${roomId}`).set(enabled);
    showChatToast(enabled ? '🔔 이 채팅 알림 켜짐' : '🔕 이 채팅 알림 꺼짐');
};

// ===== 📷 사진·링크 모아보기 =====
window.showChatMediaGallery = async function (roomId) {
    document.getElementById('_mediaGallery')?.remove();

    const modal = document.createElement('div');
    modal.id = '_mediaGallery';
    modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:flex-end;`;
    modal.innerHTML = `
        <div style="background:#f8f9fa;width:100%;border-radius:20px 20px 0 0;
            height:88vh;display:flex;flex-direction:column;
            box-shadow:0 -4px 24px rgba(0,0,0,0.18);max-width:600px;margin:0 auto;overflow:hidden;">
            <div style="background:white;padding:16px 20px 0;flex-shrink:0;">
                <div style="width:40px;height:4px;background:#dee2e6;border-radius:2px;margin:0 auto 16px;"></div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                    <h3 style="margin:0;font-size:17px;font-weight:700;">사진·링크·파일 모아보기</h3>
                    <button onclick="document.getElementById('_mediaGallery').remove()"
                        style="background:none;border:none;font-size:22px;cursor:pointer;color:#888;line-height:1;">✕</button>
                </div>
                <div style="display:flex;gap:0;border-bottom:2px solid #f0f0f0;">
                    <button id="_galleryTabPhoto" onclick="switchGalleryTab('photo')"
                        style="flex:1;padding:10px;border:none;background:none;font-size:14px;font-weight:700;
                        color:#c62828;border-bottom:2px solid #c62828;margin-bottom:-2px;cursor:pointer;">
                        🖼️ 사진
                    </button>
                    <button id="_galleryTabLink" onclick="switchGalleryTab('link')"
                        style="flex:1;padding:10px;border:none;background:none;font-size:14px;font-weight:600;
                        color:#999;cursor:pointer;">
                        🔗 링크
                    </button>
                    <button id="_galleryTabFile" onclick="switchGalleryTab('file')"
                        style="flex:1;padding:10px;border:none;background:none;font-size:14px;font-weight:600;
                        color:#999;cursor:pointer;">
                        📎 파일
                    </button>
                </div>
            </div>
            <div id="_galleryBody" style="flex:1;overflow-y:auto;padding:16px;">
                <div style="text-align:center;padding:40px;color:#aaa;">⏳ 불러오는 중...</div>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    // 메시지 전체 로드
    try {
        const snap = await getChatDb().ref(`chats/${roomId}/messages`)
            .orderByChild('timestamp').once('value');
        const msgs = [];
        snap.forEach(child => { msgs.push({ id: child.key, ...child.val() }); });
        window._galleryMsgs = msgs;
        window._galleryRoomId = roomId;
        switchGalleryTab('photo');
    } catch (e) {
        document.getElementById('_galleryBody').innerHTML =
            `<p style="color:red;text-align:center;">로드 실패: ${e.message}</p>`;
    }
};

window.switchGalleryTab = function (tab) {
    // 탭 스타일
    const photoBtn = document.getElementById('_galleryTabPhoto');
    const linkBtn  = document.getElementById('_galleryTabLink');
    if (!photoBtn || !linkBtn) return;
    const fileBtn  = document.getElementById('_galleryTabFile');
    [photoBtn, linkBtn, fileBtn].forEach(btn => { if (btn) btn.style.cssText += 'color:#999;border-bottom:none;font-weight:600;'; });
    const activeBtn = tab === 'photo' ? photoBtn : tab === 'link' ? linkBtn : fileBtn;
    if (activeBtn) activeBtn.style.cssText += 'color:#c62828;border-bottom:2px solid #c62828;font-weight:700;';

    const msgs  = window._galleryMsgs || [];
    const body  = document.getElementById('_galleryBody');
    if (!body) return;

    const URL_RE = /https?:\/\/[^\s<>"']+/g;

    const fmt = ts => {
        const d = new Date(ts);
        return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`;
    };
    const fmtFull = ts => {
        const d = new Date(ts);
        return `${fmt(ts)} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    };

    if (tab === 'photo') {
        const photos = msgs.filter(m => m.imageBase64);
        if (photos.length === 0) {
            body.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#aaa;">
                <i class="fas fa-image" style="font-size:40px;display:block;margin-bottom:12px;opacity:0.3;"></i>
                공유된 사진이 없습니다</div>`;
            return;
        }
        // 날짜별 그룹핑
        const groups = {};
        photos.forEach(m => {
            const key = fmt(m.timestamp);
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
        });
        body.innerHTML = Object.entries(groups).reverse().map(([date, items]) => `
            <div style="margin-bottom:20px;">
                <div style="font-size:12px;font-weight:700;color:#888;margin-bottom:10px;
                    padding:4px 0;border-bottom:1px solid #eee;">${date}</div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;">
                    ${items.map(m => `
                        <div style="position:relative;aspect-ratio:1;overflow:hidden;border-radius:8px;cursor:pointer;"
                            onclick="openGalleryImage('${m.id}')" title="${fmtFull(m.timestamp)} · ${escapeHTML(m.senderName||'')}">
                            <img src="${m.imageBase64}"
                                style="width:100%;height:100%;object-fit:cover;display:block;transition:opacity 0.2s;"
                                onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
                            <div style="position:absolute;bottom:0;left:0;right:0;padding:4px 6px;
                                background:linear-gradient(transparent,rgba(0,0,0,0.45));
                                font-size:10px;color:white;">${String(new Date(m.timestamp).getHours()).padStart(2,'0')}:${String(new Date(m.timestamp).getMinutes()).padStart(2,'0')}</div>
                        </div>`).join('')}
                </div>
            </div>`).join('');
        window._galleryPhotoMap = {};
        photos.forEach(m => { window._galleryPhotoMap[m.id] = m; });

    } else if (tab === 'link') {
        // 링크 추출
        const links = [];
        msgs.forEach(m => {
            if (!m.text) return;
            const found = m.text.match(URL_RE);
            if (found) found.forEach(url => links.push({ url, msg: m }));
        });
        if (links.length === 0) {
            body.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#aaa;">
                <i class="fas fa-link" style="font-size:40px;display:block;margin-bottom:12px;opacity:0.3;"></i>
                공유된 링크가 없습니다</div>`;
            return;
        }
        // 날짜별 그룹핑
        const groups = {};
        links.forEach(({ url, msg }) => {
            const key = fmt(msg.timestamp);
            if (!groups[key]) groups[key] = [];
            groups[key].push({ url, msg });
        });
        body.innerHTML = Object.entries(groups).reverse().map(([date, items]) => `
            <div style="margin-bottom:20px;">
                <div style="font-size:12px;font-weight:700;color:#888;margin-bottom:10px;
                    padding:4px 0;border-bottom:1px solid #eee;">${date}</div>
                ${items.map(({ url, msg }) => {
                    const short = url.replace(/^https?:\/\/(www\.)?/,'').split('/')[0];
                    return `
                    <a href="${url}" target="_blank" rel="noopener"
                        style="display:flex;align-items:center;gap:12px;padding:12px;
                        background:white;border-radius:10px;margin-bottom:8px;text-decoration:none;
                        box-shadow:0 1px 3px rgba(0,0,0,0.08);transition:background 0.15s;"
                        onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                        <div style="width:40px;height:40px;border-radius:8px;background:#f0f4ff;
                            display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <i class="fas fa-external-link-alt" style="color:#1565c0;font-size:16px;"></i>
                        </div>
                        <div style="min-width:0;flex:1;">
                            <div style="font-size:13px;font-weight:600;color:#1565c0;
                                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${short}</div>
                            <div style="font-size:11px;color:#aaa;margin-top:2px;
                                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${url}</div>
                            <div style="font-size:11px;color:#bbb;margin-top:3px;">
                                ${fmtFull(msg.timestamp)} · ${escapeHTML(msg.senderName||'')}</div>
                        </div>
                    </a>`}).join('')}
            </div>`).join('');
    } else if (tab === 'file') {
        const files = msgs.filter(m => m.fileName);
        if (files.length === 0) {
            body.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#aaa;">
                <i class="fas fa-paperclip" style="font-size:40px;display:block;margin-bottom:12px;opacity:0.3;"></i>
                공유된 파일이 없습니다</div>`;
            return;
        }
        const groups = {};
        files.forEach(m => {
            const key = fmt(m.timestamp);
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
        });
        body.innerHTML = Object.entries(groups).reverse().map(([date, items]) => `
            <div style="margin-bottom:20px;">
                <div style="font-size:12px;font-weight:700;color:#888;margin-bottom:10px;
                    padding:4px 0;border-bottom:1px solid #eee;">${date}</div>
                ${items.map(m => {
                    const icon    = getChatFileIcon(m.fileType || '');
                    const sizeStr = m.fileSize > 1048576
                        ? (m.fileSize / 1048576).toFixed(1) + ' MB'
                        : Math.round((m.fileSize||0) / 1024) + ' KB';
                    return `
                    <div style="display:flex;align-items:center;gap:12px;padding:12px;
                        background:white;border-radius:10px;margin-bottom:8px;
                        box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                        <div style="width:44px;height:44px;border-radius:10px;background:#f0f4ff;
                            display:flex;align-items:center;justify-content:center;
                            font-size:22px;flex-shrink:0;">${icon}</div>
                        <div style="min-width:0;flex:1;">
                            <div style="font-size:13px;font-weight:600;color:#212529;
                                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(m.fileName)}</div>
                            <div style="font-size:11px;color:#aaa;margin-top:2px;">
                                ${sizeStr} · ${escapeHTML(m.senderName||'')} · ${fmtFull(m.timestamp)}</div>
                        </div>
                        <button onclick="(function(){const a=document.createElement('a');a.href='${m.fileData}';a.download='${escapeHTML(m.fileName)}';a.click();})()"
                            style="width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;
                            background:#e8f0fe;color:#1565c0;display:flex;align-items:center;justify-content:center;
                            flex-shrink:0;" title="다운로드">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>`}).join('')}
            </div>`).join('');
    }
};

window.openGalleryImage = function (msgId) {
    const m = (window._galleryPhotoMap || {})[msgId];
    if (!m) return;
    const modal = document.createElement('div');
    modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.92);z-index:999999;display:flex;flex-direction:column;
        align-items:center;justify-content:center;`;
    const d = new Date(m.timestamp);
    const dateStr = `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 `+
        `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    modal.innerHTML = `
        <div style="color:white;font-size:13px;margin-bottom:12px;opacity:0.8;">
            ${escapeHTML(m.senderName||'')} · ${dateStr}
        </div>
        <img src="${m.imageBase64}"
            style="max-width:95vw;max-height:80vh;border-radius:10px;object-fit:contain;">
        <button onclick="this.closest('div[style]').remove()"
            style="margin-top:16px;background:rgba(255,255,255,0.15);border:none;color:white;
            padding:10px 28px;border-radius:22px;font-size:15px;cursor:pointer;">닫기</button>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
};

// ===== 🔍 메시지 검색 =====
window.showChatSearch = async function (roomId) {
    document.getElementById('_chatSearchModal')?.remove();

    const modal = document.createElement('div');
    modal.id = '_chatSearchModal';
    modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:flex-end;`;
    modal.innerHTML = `
        <div style="background:#f8f9fa;width:100%;border-radius:20px 20px 0 0;
            height:88vh;display:flex;flex-direction:column;
            box-shadow:0 -4px 24px rgba(0,0,0,0.18);max-width:600px;margin:0 auto;overflow:hidden;">
            <div style="background:white;padding:16px 20px 12px;flex-shrink:0;">
                <div style="width:40px;height:4px;background:#dee2e6;border-radius:2px;margin:0 auto 16px;"></div>
                <div style="display:flex;gap:10px;align-items:center;">
                    <div style="position:relative;flex:1;">
                        <i class="fas fa-search" style="position:absolute;left:12px;top:50%;
                            transform:translateY(-50%);color:#aaa;font-size:14px;"></i>
                        <input id="_chatSearchInput" type="text" placeholder="메시지 검색..."
                            oninput="doChatSearch()"
                            style="width:100%;padding:10px 16px 10px 36px;border:1.5px solid #dee2e6;
                            border-radius:22px;font-size:14px;outline:none;box-sizing:border-box;"
                            onfocus="this.style.borderColor='#c62828'"
                            onblur="this.style.borderColor='#dee2e6'">
                    </div>
                    <button onclick="document.getElementById('_chatSearchModal').remove()"
                        style="background:none;border:none;font-size:15px;color:#888;cursor:pointer;
                        white-space:nowrap;font-weight:600;">닫기</button>
                </div>
                <div id="_chatSearchCount" style="font-size:12px;color:#aaa;margin-top:8px;min-height:16px;"></div>
            </div>
            <div id="_chatSearchResults" style="flex:1;overflow-y:auto;padding:12px 16px;">
                <div style="text-align:center;padding:60px 20px;color:#aaa;">
                    <i class="fas fa-search" style="font-size:36px;display:block;margin-bottom:12px;opacity:0.2;"></i>
                    검색어를 입력하세요
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    try {
        const snap = await getChatDb().ref(`chats/${roomId}/messages`)
            .orderByChild('timestamp').once('value');
        const msgs = [];
        snap.forEach(child => { msgs.push({ id: child.key, ...child.val() }); });
        window._searchMsgs = msgs;
    } catch (e) {}

    setTimeout(() => document.getElementById('_chatSearchInput')?.focus(), 100);
};

window.doChatSearch = function () {
    const kw      = (document.getElementById('_chatSearchInput')?.value || '').trim().toLowerCase();
    const results = document.getElementById('_chatSearchResults');
    const count   = document.getElementById('_chatSearchCount');
    if (!results) return;

    if (!kw) {
        results.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#aaa;">
            <i class="fas fa-search" style="font-size:36px;display:block;margin-bottom:12px;opacity:0.2;"></i>
            검색어를 입력하세요</div>`;
        if (count) count.textContent = '';
        return;
    }

    const msgs   = window._searchMsgs || [];
    const found  = msgs.filter(m => m.text && m.text.toLowerCase().includes(kw));

    if (count) count.textContent = found.length > 0 ? `${found.length}개 결과` : '결과 없음';

    if (found.length === 0) {
        results.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#aaa;">
            <i class="fas fa-inbox" style="font-size:36px;display:block;margin-bottom:12px;opacity:0.2;"></i>
            검색 결과가 없습니다</div>`;
        return;
    }

    const hl = (text, kw) => {
        const re = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
        return escapeHTML(text).replace(re, `<mark style="background:#fff176;border-radius:2px;padding:0 1px;">$1</mark>`);
    };

    results.innerHTML = [...found].reverse().map(m => {
        const d   = new Date(m.timestamp);
        const ts  = `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()} `+
            `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        const preview = m.text.length > 120 ? m.text.substring(0, 120) + '…' : m.text;
        return `
            <div style="background:white;border-radius:12px;padding:14px 16px;margin-bottom:10px;
                box-shadow:0 1px 3px rgba(0,0,0,0.08);cursor:pointer;transition:background 0.15s;"
                onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <span style="font-size:13px;font-weight:700;color:#212529;">${escapeHTML(m.senderName||'')}</span>
                    <span style="font-size:11px;color:#aaa;">${ts}</span>
                </div>
                <div style="font-size:13px;color:#444;line-height:1.55;word-break:keep-all;">
                    ${hl(preview, kw)}
                </div>
                ${m.imageBase64 ? `<div style="margin-top:8px;font-size:11px;color:#aaa;">📷 사진 포함</div>` : ''}
            </div>`;
    }).join('');
};

// ===== 채팅 전체 알림 설정 모달 (유저별 필터) =====
window.showChatNotifSettings = async function () {
    document.getElementById('_chatNotifModal')?.remove();
    const myMainUid = auth.currentUser?.uid;

    const [globalSnap, filterSnap, usersSnap] = await Promise.all([
        db.ref(`users/${myMainUid}/notificationTypes/chat`).once('value'),
        db.ref(`users/${myMainUid}/notificationTypes/chatFilterUsers`).once('value'),
        db.ref('users').once('value')
    ]);

    const globalOn  = globalSnap.val() !== false;
    const filterObj = filterSnap.val() || {};   // { mainUid: false } 형태로 저장 (false = 차단)
    const usersData = usersSnap.val() || {};
    const myUid     = getChatUserId();

    const userItems = Object.entries(usersData)
        .filter(([uid, u]) => uid !== myMainUid && u?.email && u?.chatUid && u.chatUid !== myUid)
        .sort(([, a], [, b]) => resolveNickname(a).localeCompare(resolveNickname(b), 'ko'))
        .map(([uid, u]) => {
            const name   = resolveNickname(u);
            const photo  = u.profilePhoto;
            const isOn   = filterObj[uid] !== false; // 기본 true
            const photoHTML = photo
                ? `<img src="${photo}" style="width:38px;height:38px;min-width:38px;border-radius:50%;object-fit:cover;">`
                : `<div style="width:38px;height:38px;min-width:38px;border-radius:50%;background:#f1f3f4;
                    display:flex;align-items:center;justify-content:center;">
                    <i class="fas fa-user" style="color:#9aa0a6;font-size:16px;"></i></div>`;
            return `
                <div style="display:flex;align-items:center;gap:12px;padding:11px 20px;
                    border-bottom:1px solid #f5f5f5;">
                    ${photoHTML}
                    <span style="flex:1;font-size:14px;font-weight:600;color:#212529;">${escapeHTML(name)}</span>
                    <label style="position:relative;display:inline-block;width:42px;height:24px;cursor:pointer;flex-shrink:0;">
                        <input type="checkbox" data-uid="${uid}" ${isOn ? 'checked' : ''}
                            onchange="toggleChatUserNotif('${uid}', this)"
                            style="opacity:0;width:0;height:0;">
                        <span style="position:absolute;top:0;left:0;right:0;bottom:0;
                            background:${isOn ? '#c62828' : '#dee2e6'};border-radius:24px;transition:0.3s;"
                            id="_uNotifTrack_${uid}">
                            <span style="position:absolute;height:18px;width:18px;
                                left:${isOn ? '21px' : '3px'};bottom:3px;background:white;
                                border-radius:50%;transition:0.3s;" id="_uNotifThumb_${uid}"></span>
                        </span>
                    </label>
                </div>`;
        }).join('');

    const modal = document.createElement('div');
    modal.id = '_chatNotifModal';
    modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;
        justify-content:center;padding:16px;`;
    modal.innerHTML = `
        <div style="background:white;border-radius:16px;width:100%;max-width:420px;
            max-height:85vh;overflow:hidden;display:flex;flex-direction:column;
            box-shadow:0 8px 32px rgba(0,0,0,0.2);">
            <div style="background:linear-gradient(135deg,#c62828,#e53935);
                padding:16px 20px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                <h3 style="color:white;margin:0;font-size:16px;font-weight:700;">
                    <i class="fas fa-bell"></i> 채팅 알림 설정
                </h3>
                <button onclick="document.getElementById('_chatNotifModal').remove()"
                    style="background:none;border:none;color:white;font-size:22px;cursor:pointer;line-height:1;">✕</button>
            </div>
            <!-- 전체 채팅 알림 토글 -->
            <div style="padding:14px 20px;border-bottom:2px solid #f0f0f0;display:flex;
                align-items:center;justify-content:space-between;flex-shrink:0;">
                <div>
                    <div style="font-size:15px;font-weight:700;color:#212529;">채팅 알림 전체</div>
                    <div style="font-size:12px;color:#adb5bd;margin-top:2px;">모든 채팅 알림을 켜거나 끕니다</div>
                </div>
                <label style="position:relative;display:inline-block;width:46px;height:26px;cursor:pointer;">
                    <input type="checkbox" id="_globalChatNotif" ${globalOn ? 'checked' : ''}
                        onchange="saveGlobalChatNotif(this.checked)"
                        style="opacity:0;width:0;height:0;">
                    <span style="position:absolute;top:0;left:0;right:0;bottom:0;
                        background:${globalOn ? '#c62828' : '#dee2e6'};border-radius:26px;transition:0.3s;"
                        id="_globalChatTrack">
                        <span style="position:absolute;height:20px;width:20px;
                            left:${globalOn ? '23px' : '3px'};bottom:3px;background:white;
                            border-radius:50%;transition:0.3s;" id="_globalChatThumb"></span>
                    </span>
                </label>
            </div>
            <!-- 유저별 필터 -->
            <div style="padding:10px 20px 6px;flex-shrink:0;">
                <div style="font-size:13px;font-weight:700;color:#6c757d;">유저별 알림</div>
                <div style="font-size:12px;color:#adb5bd;">끄면 해당 유저의 채팅 알림을 받지 않습니다</div>
            </div>
            <div style="overflow-y:auto;flex:1;">
                ${userItems || '<p style="text-align:center;color:#adb5bd;padding:30px;">유저가 없습니다.</p>'}
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    // 전체 토글 시각 효과
    document.getElementById('_globalChatNotif').addEventListener('change', function() {
        document.getElementById('_globalChatTrack').style.background = this.checked ? '#c62828' : '#dee2e6';
        document.getElementById('_globalChatThumb').style.left       = this.checked ? '23px' : '3px';
    });
};

window.saveGlobalChatNotif = async function (enabled) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await db.ref(`users/${uid}/notificationTypes/chat`).set(enabled);
    showChatToast(enabled ? '🔔 채팅 알림 켜짐' : '🔕 채팅 알림 꺼짐');
};

window.toggleChatUserNotif = async function (targetMainUid, checkbox) {
    const uid   = auth.currentUser?.uid;
    if (!uid) return;
    const track = document.getElementById(`_uNotifTrack_${targetMainUid}`);
    const thumb = document.getElementById(`_uNotifThumb_${targetMainUid}`);
    if (track) track.style.background = checkbox.checked ? '#c62828' : '#dee2e6';
    if (thumb) thumb.style.left       = checkbox.checked ? '21px' : '3px';
    if (checkbox.checked) {
        await db.ref(`users/${uid}/notificationTypes/chatFilterUsers/${targetMainUid}`).remove();
    } else {
        await db.ref(`users/${uid}/notificationTypes/chatFilterUsers/${targetMainUid}`).set(false);
    }
    showChatToast(checkbox.checked ? '🔔 알림 켜짐' : '🔕 알림 꺼짐');
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
        if (!myRoomIds.length) {
            _applyNavDot(0);
            return;
        }
        const snaps = await Promise.all(myRoomIds.map(id => getChatDb().ref(`chats/${id}`).once('value')));
        let total = 0;
        for (const s of snaps) {
            const c = s.val();
            if (c?.messages)
                total += Object.values(c.messages).filter(m => !m.read && m.senderId !== myUid).length;
        }
        // 더보기 메뉴 내 배지
        const badge = document.getElementById('chatBadgeMore');
        if (badge) {
            badge.textContent   = total > 99 ? '99+' : total;
            badge.style.display = total > 0 ? 'inline-block' : 'none';
        }
        _applyNavDot(total);
    } catch (e) {}
}

// 하단 채팅 탭 + 더보기 탭에 파란 점 표시
function _applyNavDot(total) {
    // 채팅 탭 nav-btn
    const chatNavBtn = document.querySelector('.nav-btn[onclick*="showChatPage"]');
    if (chatNavBtn) {
        let dot = chatNavBtn.querySelector('.chat-unread-dot');
        if (!dot) {
            dot = document.createElement('span');
            dot.className = 'chat-unread-dot';
            dot.style.cssText = [
                'position:absolute', 'top:6px', 'right:10px',
                'width:9px', 'height:9px',
                'background:#2196F3', 'border-radius:50%',
                'border:2px solid white',
                'pointer-events:none', 'display:none'
            ].join(';');
            chatNavBtn.style.position = 'relative';
            chatNavBtn.appendChild(dot);
        }
        dot.style.display = total > 0 ? 'block' : 'none';
    }
    // 더보기 탭 nav-btn
    const moreNavBtn = document.querySelector('.nav-btn[onclick*="showMoreMenu"]');
    if (moreNavBtn) {
        let dot = moreNavBtn.querySelector('.chat-unread-dot');
        if (!dot) {
            dot = document.createElement('span');
            dot.className = 'chat-unread-dot';
            dot.style.cssText = [
                'position:absolute', 'top:6px', 'right:10px',
                'width:9px', 'height:9px',
                'background:#2196F3', 'border-radius:50%',
                'border:2px solid white',
                'pointer-events:none', 'display:none'
            ].join(';');
            moreNavBtn.style.position = 'relative';
            moreNavBtn.appendChild(dot);
        }
        dot.style.display = total > 0 ? 'block' : 'none';
    }
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
