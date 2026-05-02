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

// ✅ 모바일 여부 판단
function _isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

async function syncChatAuth(mainUser) {
    const chatAuthInst = getChatAuth();

    if (!mainUser) {
        if (chatAuthInst.currentUser) await chatAuthInst.signOut();
        return;
    }

    try {
        const result = await chatAuthInst.getRedirectResult();
        if (result && result.user) {
            console.log('✅ chatApp redirect 인증 완료:', result.user.email);
            document.getElementById('_chatAuthBanner')?.remove();
            
            // ✅ 수정: auth.currentUser 대신 이미 검증된 파라미터 mainUser.uid 사용
            const mainUid = mainUser.uid;
            if (mainUid) {
                await db.ref(`users/${mainUid}/chatUid`).set(result.user.uid);
                console.log('✅ chatUid 메인DB 저장 완료 (redirect)');
            }
            return;
        }
    } catch (e) {
        // getRedirectResult 오류는 무시
    }

    // ✅ 자동로그인: Firebase가 로컬 세션 복원할 때까지 잠깐 대기
    let chatUser = chatAuthInst.currentUser;
    if (!chatUser) {
        console.log('🔄 chatApp 세션 복원 대기 중...');
        chatUser = await waitForChatAuth(3000);
    }

    if (chatUser) {
        const mainUid = mainUser.uid;
        const snap = await db.ref(`users/${mainUid}/chatUid`).once('value');
        if (!snap.val()) {
            await db.ref(`users/${mainUid}/chatUid`).set(chatUser.uid);
        }

        // ✅ 메인 DB에서 관리자 여부 직접 조회 → 전역 캐싱
        const adminSnap = await db.ref(`users/${mainUid}/isAdmin`).once('value');
        window._chatIsAdmin = adminSnap.val() === true;
        console.log('✅ 채팅 관리자 캐싱:', window._chatIsAdmin);
        return;
    }

    // ✅ 자동 redirect/popup 로그인 제거 → 사용자가 채팅 탭 클릭 시 명시적 로그인 UI 표시
    // (모바일 redirect 무한 루프 방지)
    console.log('ℹ️ chatApp 미인증 - 채팅 탭 클릭 시 로그인 안내됩니다.');
}

// ===== chatApp 전용 인증 =====
// ✅ 모바일/PC 모두 popup 방식 사용 (redirect 루프 완전 제거)
// 반드시 사용자 직접 클릭 이벤트 핸들러 내에서만 호출해야 팝업이 열림
window._signInChatAppSilently = async function _signInChatAppSilently(mainUser) {
    if (getChatAuth().currentUser) return;
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await getChatAuth().signInWithPopup(provider);
        console.log('✅ chatApp 인증 완료:', result.user.email);
        document.getElementById('_chatAuthBanner')?.remove();
        
        const mainUid = mainUser?.uid ?? auth.currentUser?.uid;
        if (mainUid) {
            await db.ref(`users/${mainUid}/chatUid`).set(result.user.uid);
            console.log('✅ chatUid 메인DB 저장 완료');

            // ✅ 관리자 여부 캐싱
            const adminSnap = await db.ref(`users/${mainUid}/isAdmin`).once('value');
            window._chatIsAdmin = adminSnap.val() === true;
            console.log('✅ 채팅 관리자 캐싱 (popup):', window._chatIsAdmin);
        }

        // ✅ 관리자라면 채팅 DB admins 노드에 등록
        if (typeof isAdmin === 'function' && isAdmin()) {
            await getChatDb().ref(`admins/${result.user.uid}`).set(true);
            console.log('✅ 채팅 DB 관리자 등록 (popup):', result.user.uid);
        }
    } catch (e) {
        if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
        console.warn('⚠️ chatApp 인증 실패:', e.code);
        _showChatAuthExpiredBanner();
    }
};

// ===== ✅ 채팅 로그인 오버레이 (채팅 탭 클릭 시 미인증 상태용) =====
// 사용자 직접 버튼 클릭 → signInWithPopup → 모바일/PC 모두 안정적으로 동작
function _showChatLoginOverlay() {
    if (document.getElementById('_chatLoginOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = '_chatLoginOverlay';
    overlay.style.cssText = [
        'position:fixed','top:0','left:0','right:0','bottom:0',
        'background:white','z-index:99999',
        'display:flex','flex-direction:column',
        'align-items:center','justify-content:center',
        'padding:40px 24px'
    ].join(';');

    overlay.innerHTML = `
        <div style="max-width:320px;width:100%;text-align:center;">
            <div style="font-size:52px;margin-bottom:20px;">💬</div>
            <h2 style="font-size:22px;font-weight:800;color:#212121;margin:0 0 10px;">채팅 연결이 필요해요</h2>
            <p style="font-size:14px;color:#777;margin:0 0 36px;line-height:1.7;">
                채팅 서비스는 별도 계정 연결이 필요합니다.<br>
                Google 계정으로 한 번만 연결하면<br>다음부터는 자동으로 접속됩니다.
            </p>
            <button id="_chatLoginBtn" style="
                width:100%;padding:15px;border:none;border-radius:14px;
                background:#c62828;color:white;font-size:15px;font-weight:700;
                cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;
                box-shadow:0 4px 14px rgba(198,40,40,0.3);
                transition:opacity 0.15s;
            ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 채팅 연결하기
            </button>
            <button id="_chatLoginCancelBtn" style="
                width:100%;padding:13px;border:none;border-radius:14px;
                background:none;color:#999;font-size:14px;cursor:pointer;margin-top:10px;
            ">취소</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // 취소 버튼
    document.getElementById('_chatLoginCancelBtn').addEventListener('click', () => {
        overlay.remove();
        if (typeof showMoreMenu === 'function') showMoreMenu();
    });

    // 로그인 버튼 (사용자 직접 클릭 → popup 차단 없음)
    document.getElementById('_chatLoginBtn').addEventListener('click', async () => {
        const btn = document.getElementById('_chatLoginBtn');
        if (!btn) return;
        btn.style.opacity = '0.7';
        btn.innerHTML = `<span style="display:inline-block;
            width:18px;height:18px;border:3px solid rgba(255,255,255,0.4);
            border-top-color:white;border-radius:50%;
            animation:_plsSpin 0.8s linear infinite;"></span>
            &nbsp;연결 중...`;
        btn.disabled = true;

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await getChatAuth().signInWithPopup(provider);
            console.log('✅ chatApp 로그인 성공:', result.user.email);

            const mainUid = auth.currentUser?.uid;
            if (mainUid) {
                await db.ref(`users/${mainUid}/chatUid`).set(result.user.uid);
                console.log('✅ chatUid 저장 완료');
            }

            overlay.remove();
            // 인증 완료 → 채팅 페이지 정상 로드
            window.showChatPage();

        } catch (e) {
            const isCancelled = e.code === 'auth/popup-closed-by-user'
                || e.code === 'auth/cancelled-popup-request';
            console.warn('⚠️ 채팅 로그인 실패:', e.code);
            if (btn) {
                btn.style.opacity = '1';
                btn.disabled = false;
                btn.innerHTML = isCancelled
                    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                       </svg> 다시 시도`
                    : `⚠️ 연결 실패 - 다시 시도`;
            }
            if (!isCancelled) {
                showChatToast('⚠️ 채팅 연결에 실패했습니다. 다시 시도해주세요.');
            }
        }
    });
}

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
// ✅ IIFE 외부 파일(Chat-upgrade.js)에서 접근 가능하도록 전역 노출
window._showChatAuthExpiredBanner = _showChatAuthExpiredBanner;

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

    // ✅ chatApp 미인증 시 → 명시적 로그인 오버레이 표시 (redirect 루프 방지)
    if (!isChatAuthReady()) {
        _showChatLoginOverlay();
        return;
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
            display:flex;flex-direction:column;height:100%;overflow:hidden;background:#fafafa;">
            <div style="background:white;padding:14px 20px 12px;display:flex;align-items:center;
                justify-content:space-between;flex-shrink:0;
                border-bottom:1px solid #dbdbdb;">
                <h2 style="color:#262626;margin:0;font-size:22px;font-weight:800;
                    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                    letter-spacing:-0.5px;">
                    채팅
                </h2>
                <div style="display:flex;gap:2px;align-items:center;">
                    <button onclick="showMoreMenu()"
                        style="background:none;border:none;color:#262626;width:40px;height:40px;
                        border-radius:50%;cursor:pointer;font-size:18px;
                        display:flex;align-items:center;justify-content:center;
                        transition:background 0.15s;"
                        onmouseover="this.style.background='#f5f5f5'"
                        onmouseout="this.style.background='none'"
                        title="뒤로가기">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <button onclick="showChatNotifSettings()"
                        style="background:none;border:none;color:#262626;width:40px;height:40px;
                        border-radius:50%;cursor:pointer;font-size:20px;
                        display:flex;align-items:center;justify-content:center;
                        transition:background 0.15s;"
                        onmouseover="this.style.background='#f5f5f5'"
                        onmouseout="this.style.background='none'"
                        title="알림 설정">
                        <i class="fas fa-bell"></i>
                    </button>
                    <button onclick="showNewChatModal()"
                        style="background:none;border:none;color:#262626;width:40px;height:40px;
                        border-radius:50%;cursor:pointer;font-size:20px;
                        display:flex;align-items:center;justify-content:center;
                        transition:background 0.15s;"
                        onmouseover="this.style.background='#f5f5f5'"
                        onmouseout="this.style.background='none'"
                        title="새 채팅">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            <line x1="12" y1="10" x2="12" y2="14"/><line x1="10" y1="12" x2="14" y2="12"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div id="chatRoomList"
                style="flex:1;overflow-y:auto;background:#fafafa;-webkit-overflow-scrolling:touch;">
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
// ===== 채팅방 순서 저장/로드 (메인DB users/{mainUid}/chatRoomOrder) =====
async function loadChatRoomOrder(mainUid) {
    try {
        const snap = await db.ref(`users/${mainUid}/chatRoomOrder`).once('value');
        return snap.val() || null; // null = 저장된 순서 없음
    } catch (e) { return null; }
}
async function saveChatRoomOrder(mainUid, roomIds) {
    try {
        await db.ref(`users/${mainUid}/chatRoomOrder`).set(roomIds);
    } catch (e) { console.warn('순서 저장 실패:', e); }
}

async function loadChatRoomList() {
    const myUid    = getChatUserId();
    const mainUid  = auth.currentUser?.uid;
    const listEl   = document.getElementById('chatRoomList');
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

        // [최적화] users 전체 로드 제거 — participantInfo 우선 참조
        const [chatSnaps, savedOrder] = await Promise.all([
            Promise.all(myRoomIds.map(id => getChatDb().ref(`chats/${id}`).once('value'))),
            loadChatRoomOrder(mainUid)
        ]);

        // participantInfo 없는 채팅방 대비 최소 쿼리 캐시
        const _roomUserCache = new Map();
        async function _getRoomUser(uid) {
            if (!uid) return {};
            if (_roomUserCache.has(uid)) return _roomUserCache.get(uid);
            try {
                const snap = await db.ref('users/' + uid).once('value');
                const data = snap.val() || {};
                _roomUserCache.set(uid, data);
                return data;
            } catch(e) { return {}; }
        }
        const usersData = {}; // 호환성 유지

        // 기본 정렬: lastMessageAt 내림차순
        let rooms = chatSnaps
            .map(s => [s.key, s.val()])
            .filter(([_, c]) => c !== null)
            .sort((a, b) => (b[1].lastMessageAt || 0) - (a[1].lastMessageAt || 0));

        // 저장된 순서가 있으면 적용 (목록에 없는 새 방은 맨 뒤에 추가)
        if (savedOrder && savedOrder.length > 0) {
            const orderMap = new Map(savedOrder.map((id, i) => [id, i]));
            rooms.sort((a, b) => {
                const ia = orderMap.has(a[0]) ? orderMap.get(a[0]) : 9999;
                const ib = orderMap.has(b[0]) ? orderMap.get(b[0]) : 9999;
                if (ia !== ib) return ia - ib;
                return (b[1].lastMessageAt || 0) - (a[1].lastMessageAt || 0);
            });
        }

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
                friendMainUid = chat.mainUids?.[friendChatUid] || null;
                // [최적화] participantInfo 우선 사용, 없으면 uid별 개별 쿼리
                let friend = {};
                if (chat.participantInfo?.[friendChatUid]) {
                    friend = chat.participantInfo[friendChatUid];
                } else if (friendMainUid) {
                    friend = await _getRoomUser(friendMainUid);
                }
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
            item.dataset.roomId = roomId;
            item.style.cssText = 'display:flex;align-items:center;padding:12px 16px;gap:12px;border-bottom:1px solid #f5f5f5;background:white;transition:background 0.15s,opacity 0.15s,transform 0.15s;touch-action:none;';

            // ── 드래그 핸들 (왼쪽 세로 점 3개)
            const handle = document.createElement('div');
            handle.className = '_chatDragHandle';
            handle.style.cssText = 'color:#ccc;font-size:14px;cursor:grab;flex-shrink:0;padding:4px 2px;display:flex;align-items:center;user-select:none;-webkit-user-select:none;';
            handle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
            handle.title = '길게 눌러 순서 변경';

            // ── 클릭 영역 (핸들 제외)
            const body = document.createElement('div');
            body.style.cssText = 'display:flex;align-items:center;gap:12px;flex:1;min-width:0;cursor:pointer;';
            body.onclick = () => openChatRoom(roomId, friendUid, friendName, null, friendMainUid);
            body.onmouseover = () => { item.style.background = '#f8f9fa'; };
            body.onmouseout  = () => { item.style.background = 'white'; };
            body.innerHTML = `
                ${photoHTML}
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-weight:700;font-size:15px;color:#212529;">${escapeHTML(friendName)}</span>
                        <span style="font-size:11px;color:#adb5bd;flex-shrink:0;margin-left:8px;">${timeStr}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:13px;color:#6c757d;white-space:nowrap;overflow:hidden;
                            text-overflow:ellipsis;max-width:210px;">${escapeHTML(lastMsg)}</span>
                        ${unread > 0
                            ? `<span style="background:#c62828;color:white;border-radius:12px;
                                padding:2px 7px;font-size:11px;font-weight:700;flex-shrink:0;
                                min-width:20px;text-align:center;">${unread > 99 ? '99+' : unread}</span>`
                            : ''}
                    </div>
                </div>`;

            item.appendChild(handle);
            item.appendChild(body);
            listEl.appendChild(item);
        }

        // ── 드래그 앤 드롭 초기화
        _initChatRoomDnD(listEl, mainUid);

    } catch (err) {
        console.error('채팅 목록 로드 실패:', err);
        listEl.innerHTML = `<div style="text-align:center;padding:40px;color:#c62828;">❌ 로드 실패: ${err.message}</div>`;
    }
}

// ===== 드래그 앤 드롭 초기화 (마우스 + 터치 통합) =====
function _initChatRoomDnD(listEl, mainUid) {
    let dragging    = null;   // 현재 드래그 중인 item el
    let placeholder = null;   // 삽입 위치 표시 div
    let startY      = 0;
    let offsetY     = 0;      // 터치 시작 시 손가락과 아이템 상단의 차이
    let longPressTimer = null;
    let isDragging  = false;
    let ghost       = null;   // 드래그 중 따라다니는 복사본

    function getItems() {
        return [...listEl.querySelectorAll('[data-room-id]')];
    }

    function createPlaceholder(height) {
        const ph = document.createElement('div');
        ph.style.cssText = `height:${height}px;background:linear-gradient(90deg,#ffebee,#fff);
            border-left:3px solid #c62828;border-radius:4px;margin:2px 0;
            transition:height 0.15s;pointer-events:none;`;
        return ph;
    }

    function insertPlaceholderAt(clientY) {
        const items = getItems().filter(el => el !== dragging);
        let inserted = false;
        for (const el of items) {
            const rect = el.getBoundingClientRect();
            const mid  = rect.top + rect.height / 2;
            if (clientY < mid) {
                listEl.insertBefore(placeholder, el);
                inserted = true;
                break;
            }
        }
        if (!inserted) listEl.appendChild(placeholder);
    }

    function finalizeOrder() {
        if (!dragging || !placeholder) return;
        listEl.insertBefore(dragging, placeholder);
        placeholder.remove();
        placeholder = null;

        dragging.style.opacity    = '1';
        dragging.style.transform  = '';
        dragging.style.zIndex     = '';
        dragging.style.position   = '';
        dragging.style.pointerEvents = '';
        dragging.style.boxShadow  = '';
        dragging.style.background = 'white';
        dragging = null;
        isDragging = false;

        if (ghost) { ghost.remove(); ghost = null; }

        // 새 순서 저장
        const newOrder = getItems().map(el => el.dataset.roomId);
        saveChatRoomOrder(mainUid, newOrder);
    }

    function cancelDrag() {
        if (placeholder) { placeholder.remove(); placeholder = null; }
        if (dragging) {
            dragging.style.opacity    = '1';
            dragging.style.transform  = '';
            dragging.style.zIndex     = '';
            dragging.style.position   = '';
            dragging.style.pointerEvents = '';
            dragging.style.boxShadow  = '';
            dragging = null;
        }
        isDragging = false;
        if (ghost) { ghost.remove(); ghost = null; }
    }

    // ── 마우스 이벤트 (드래그 핸들에만)
    listEl.addEventListener('mousedown', (e) => {
        const handle = e.target.closest('._chatDragHandle');
        if (!handle) return;
        const item = handle.closest('[data-room-id]');
        if (!item) return;

        e.preventDefault();
        dragging = item;
        startY   = e.clientY;
        const rect = item.getBoundingClientRect();
        offsetY  = e.clientY - rect.top;
        placeholder = createPlaceholder(rect.height);
        isDragging  = true;

        item.style.opacity    = '0.4';
        item.style.pointerEvents = 'none';

        // 유령 복사본
        ghost = item.cloneNode(true);
        ghost.style.cssText += `position:fixed;left:${rect.left}px;top:${rect.top}px;
            width:${rect.width}px;z-index:99999;pointer-events:none;opacity:0.92;
            box-shadow:0 8px 24px rgba(0,0,0,0.18);border-radius:10px;background:white;`;
        document.body.appendChild(ghost);

        listEl.insertBefore(placeholder, item.nextSibling);
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !ghost) return;
        ghost.style.top = (e.clientY - offsetY) + 'px';
        insertPlaceholderAt(e.clientY);
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        finalizeOrder();
    });

    // ── 터치 이벤트 (꾹 누르기 → 드래그)
    listEl.addEventListener('touchstart', (e) => {
        const handle = e.target.closest('._chatDragHandle');
        if (!handle) return;
        const item = handle.closest('[data-room-id]');
        if (!item) return;

        const touch = e.touches[0];
        startY = touch.clientY;
        const rect = item.getBoundingClientRect();
        offsetY = touch.clientY - rect.top;

        // 300ms 꾹 누르기로 드래그 시작
        longPressTimer = setTimeout(() => {
            dragging    = item;
            placeholder = createPlaceholder(rect.height);
            isDragging  = true;

            item.style.opacity    = '0.4';
            item.style.pointerEvents = 'none';

            ghost = item.cloneNode(true);
            ghost.style.cssText += `position:fixed;left:${rect.left}px;top:${rect.top}px;
                width:${rect.width}px;z-index:99999;pointer-events:none;opacity:0.92;
                box-shadow:0 8px 24px rgba(0,0,0,0.18);border-radius:10px;background:white;`;
            document.body.appendChild(ghost);

            listEl.insertBefore(placeholder, item.nextSibling);

            // 진동 피드백 (지원 기기)
            if (navigator.vibrate) navigator.vibrate(40);
        }, 300);
    }, { passive: true });

    listEl.addEventListener('touchmove', (e) => {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
        if (!isDragging || !ghost) return;
        e.preventDefault();
        const touch = e.touches[0];
        ghost.style.top = (touch.clientY - offsetY) + 'px';
        insertPlaceholderAt(touch.clientY);
    }, { passive: false });

    listEl.addEventListener('touchend', () => {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
        if (!isDragging) return;
        finalizeOrder();
    });

    listEl.addEventListener('touchcancel', () => {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
        cancelDrag();
    });
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
                <!-- ✅ 다중 사진 미리보기 -->
                <div id="chatImgPreview" style="display:none;padding:8px 12px 0;position:relative;padding-right:32px;">
                    <div id="chatImgPreviewGrid" style="display:flex;flex-wrap:wrap;gap:4px;"></div>
                    <button onclick="clearChatImage()"
                        style="position:absolute;top:4px;right:8px;background:rgba(0,0,0,0.55);
                        color:white;border:none;border-radius:50%;width:22px;height:22px;
                        font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <!-- ✅ 영상 미리보기 -->
                <div id="chatVideoPreview" style="display:none;padding:8px 12px 0;position:relative;padding-right:32px;">
                    <video id="chatVideoPreviewEl" controls
                        style="max-height:80px;max-width:160px;border-radius:8px;border:1.5px solid #dee2e6;"></video>
                    <button onclick="clearChatVideo()"
                        style="position:absolute;top:4px;right:8px;background:rgba(0,0,0,0.55);
                        color:white;border:none;border-radius:50%;width:22px;height:22px;
                        font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <!-- ✅ 영상 업로드 진행 바 -->
                <div id="chatVideoUploadProgress" style="display:none;padding:4px 14px 2px;">
                    <div style="font-size:12px;color:#c62828;font-weight:600;margin-bottom:3px;">🎬 YouTube 업로드 중...</div>
                    <div style="background:#f0f0f0;border-radius:8px;height:6px;overflow:hidden;">
                        <div id="chatVideoProgressBar" style="background:linear-gradient(90deg,#c62828,#e53935);height:100%;width:0%;border-radius:8px;transition:width 0.3s;"></div>
                    </div>
                    <div id="chatVideoProgressText" style="font-size:11px;color:#999;text-align:right;margin-top:2px;">0%</div>
                </div>
                <div style="padding:10px 12px;display:flex;gap:8px;align-items:flex-end;">
                    <!-- ✅ multiple 추가 -->
                    <input type="file" id="chatImageInput" accept="image/*" multiple style="display:none;"
                        onchange="previewChatImage(this)">
                    <!-- ✅ 신규: 영상 입력 -->
                    <input type="file" id="chatVideoInput" accept="video/*" style="display:none;"
                        onchange="previewChatVideo(this)">
                    <button onclick="document.getElementById('chatImageInput').click()"
                        style="background:#f1f3f4;border:none;color:#555;width:38px;height:38px;
                        border-radius:50%;cursor:pointer;font-size:15px;flex-shrink:0;
                        display:flex;align-items:center;justify-content:center;" title="사진 (여러 장 선택 가능)">
                        <i class="fas fa-camera"></i>
                    </button>
                    <!-- ✅ 신규: 영상 버튼 -->
                    <button onclick="document.getElementById('chatVideoInput').click()" title="동영상"
                        style="background:#f1f3f4;border:none;color:#555;width:38px;height:38px;
                        border-radius:50%;cursor:pointer;font-size:15px;flex-shrink:0;
                        display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-video"></i>
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
        msgEl.style.cssText = `display:flex;align-items:flex-start;gap:8px;
            ${isMe ? 'flex-direction:row-reverse;' : ''}margin:${isMe ? '2px 0' : '4px 0'};`;

        // ── 발신자 프로필 아바타 (상대방 메시지에만)
        if (!isMe) {
            const senderPhoto = window._chatAvatarCache?.[msg.senderId];
            const avatarEl = document.createElement('div');
            avatarEl.style.cssText = 'width:34px;height:34px;min-width:34px;border-radius:50%;overflow:hidden;flex-shrink:0;margin-top:2px;border:1.5px solid #efefef;';
            if (senderPhoto) {
                avatarEl.innerHTML = `<img src="${senderPhoto}" style="width:100%;height:100%;object-fit:cover;">`;
            } else {
                const initial = (msg.senderName || '?')[0].toUpperCase();
                const palette = ['#f56040','#fcaf45','#bc2a8d','#405de6','#5851db','#e1306c'];
                const bg = palette[initial.charCodeAt(0) % palette.length];
                avatarEl.style.cssText += `background:${bg};display:flex;align-items:center;justify-content:center;`;
                avatarEl.innerHTML = `<span style="color:white;font-size:14px;font-weight:700;">${escapeHTML(initial)}</span>`;
            }
            msgEl.appendChild(avatarEl);
        }

        // ── 말풍선 + 이름 래퍼
        const bubbleWrap = document.createElement('div');
        bubbleWrap.style.cssText = `display:flex;flex-direction:column;gap:3px;max-width:72%;
            ${isMe ? 'align-items:flex-end;' : 'align-items:flex-start;'}`;

        // ── 발신자 이름 (상대방 메시지에만)
        if (!isMe) {
            const nameEl = document.createElement('span');
            nameEl.style.cssText = 'font-size:12px;font-weight:700;color:#8e8e8e;padding-left:4px;';
            nameEl.textContent = msg.senderName || '';
            bubbleWrap.appendChild(nameEl);
        }

        const bubble = document.createElement('div');
        bubble.dataset.msgid = msgId;
        bubble.style.cssText = `max-width:100%;
            background:${isMe ? '#262626' : 'white'};color:${isMe ? 'white' : '#262626'};
            padding:10px 14px;border-radius:${isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px'};
            font-size:14px;line-height:1.55;word-break:break-word;
            box-shadow:0 1px 2px rgba(0,0,0,0.08);
            cursor:pointer;user-select:none;-webkit-user-select:none;
            touch-action:manipulation;-webkit-tap-highlight-color:transparent;pointer-events:auto;`;
        let bubbleContent = '';
        if (msg.text) bubbleContent += escapeHTML(msg.text).replace(/\n/g, '<br>');
       // ✅ 수정 후 코드
const _imgSrc = msg.imageUrl || msg.imageBase64;
if (_imgSrc) {
    bubbleContent += `${msg.text ? '<br>' : ''}
        <div style="position:relative;display:inline-block;margin-top:${msg.text ? '6px' : '0'};">
            <img src="${_imgSrc}"
                        onclick="openChatImageModal('${msgId}')"
                        style="max-width:220px;max-height:220px;border-radius:10px;
                        display:block;cursor:zoom-in;object-fit:cover;">
                    <button onclick="event.stopPropagation();downloadChatImage('${msgId}')"
                        title="다운로드"
                        style="position:absolute;bottom:6px;right:6px;
                        width:30px;height:30px;border-radius:50%;border:none;cursor:pointer;
                        background:rgba(0,0,0,0.45);color:white;
                        display:flex;align-items:center;justify-content:center;">
                        <i class="fas fa-download" style="font-size:12px;pointer-events:none;"></i>
                    </button>
                </div>`;
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
        // ✅ 수정 후 코드
// ✅ 다중 이미지 렌더링
if (msg.imageUrls?.length > 0) {
    const cols = msg.imageUrls.length === 1 ? 1 : msg.imageUrls.length <= 4 ? 2 : 3;
    bubbleContent += `${msg.text ? '<br>' : ''}
        <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:3px;
            margin-top:${msg.text ? '6px' : '0'};max-width:220px;">
        ${msg.imageUrls.map((url, i) => `
            <img src="${url}" onclick="openChatImageModal('${msgId}',${i})"
                style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px;cursor:zoom-in;">`
        ).join('')}
        </div>`;
    bubble.style.padding = '6px';
}

// ✅ 영상 렌더링 (YouTube iframe)
if (msg.videoUrl) {
    bubbleContent += `${msg.text ? '<br>' : ''}
        <div style="margin-top:${msg.text ? '6px' : '0'};">
            <iframe src="${msg.videoUrl}" frameborder="0"
                allow="autoplay; encrypted-media" allowfullscreen
                style="width:220px;height:130px;border-radius:10px;display:block;"></iframe>
        </div>`;
    bubble.style.padding = '6px';
}

bubble.dataset.img = msg.imageUrl || msg.imageBase64 || '';
if (msg.imageUrl || msg.imageBase64) bubble.style.padding = '6px';

        // ✅ 내 메시지: bubble 직접 클릭
        if (isMe) {
            bubble.onclick = function(e) {
                console.log('🟢 [내 메시지] bubble 클릭 — msgId:', msgId, '| target:', e.target.tagName);
                e.stopPropagation();
                if (e.target.tagName === 'IMG') { console.log('🟢 IMG 클릭 → 메뉴 차단'); return; }
                console.log('🟢 showChatMsgMenu 호출 (isMe=true)');
                showChatMsgMenu(msgId, roomId, bubble, true, msg.text || '');
            };
        }

        const timeEl = document.createElement('span');
        timeEl.style.cssText = 'font-size:10px;color:#888;flex-shrink:0;margin-bottom:2px;';
        timeEl.textContent   = timeStr;

       // 말풍선 + 시간을 가로로 묶기
        const bubbleRow = document.createElement('div');
        bubbleRow.style.cssText = `display:flex;align-items:flex-end;gap:5px;
            ${isMe ? 'flex-direction:row-reverse;' : ''}`;
        bubbleRow.appendChild(bubble);
        bubbleRow.appendChild(timeEl);

        // 읽음 아바타 슬롯 (내 메시지에만)
        if (isMe) {
            const avatarSlot = document.createElement('div');
            avatarSlot.id = `readSlot-${msgId}`;
            avatarSlot.style.cssText = 'display:flex;gap:2px;align-items:center;min-width:0;';
            bubbleRow.insertBefore(avatarSlot, bubble);
        }

        bubbleWrap.appendChild(bubbleRow);

        // ✅ 상대방 메시지: bubbleWrap 전체를 클릭 영역으로 (이름·말풍선·시간 어디 눌러도 반응)
        // 수정/삭제 버튼은 isMe=false이므로 showChatMsgMenu 내에서 자동 제외됨
        if (!isMe) {
            bubbleWrap.style.cursor = 'pointer';
            bubbleWrap.onclick = function(e) {
                console.log('🔵 [상대 메시지] bubbleWrap 클릭 — msgId:', msgId, '| target:', e.target.tagName, e.target);
                e.stopPropagation();
                if (e.target.tagName === 'IMG') { console.log('🔵 IMG 클릭 → 메뉴 차단'); return; }
                console.log('🔵 showChatMsgMenu 호출 (isMe=false)');
                showChatMsgMenu(msgId, roomId, bubble, false, msg.text || '');
            };
            // 혹시 bubbleWrap onclick이 아예 안 잡히는 경우를 대비해 bubble에도 동일 등록
            bubble.onclick = function(e) {
                console.log('🔵 [상대 메시지] bubble 직접 클릭 — msgId:', msgId, '| target:', e.target.tagName);
                e.stopPropagation();
                if (e.target.tagName === 'IMG') return;
                console.log('🔵 bubble onclick → showChatMsgMenu (isMe=false)');
                showChatMsgMenu(msgId, roomId, bubble, false, msg.text || '');
            };
        }
        const reactions = msg.reactions || {};
        const reactionSummary = {};
        const myReactedEmoji = [];
        for (const [emoji, reactors] of Object.entries(reactions)) {
            const count = Object.keys(reactors).length;
            if (count > 0) {
                reactionSummary[emoji] = count;
                if (reactors[myUid]) myReactedEmoji.push(emoji);
            }
        }
        if (Object.keys(reactionSummary).length > 0) {
            const reactionBar = document.createElement('div');
            reactionBar.id = `reactionBar-${msgId}`;
            reactionBar.style.cssText = `display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;
                ${isMe ? 'justify-content:flex-end;' : 'justify-content:flex-start;padding-left:4px;'}`;
            for (const [emoji, count] of Object.entries(reactionSummary)) {
                const isMine = myReactedEmoji.includes(emoji);
                const chip = document.createElement('button');
                chip.title = `${emoji} ${count}명`;
                chip.style.cssText = `display:inline-flex;align-items:center;gap:3px;
                    padding:2px 8px;border-radius:12px;font-size:13px;cursor:pointer;
                    border:1.5px solid ${isMine ? '#c62828' : '#e0e0e0'};
                    background:${isMine ? '#fff0f0' : 'white'};
                    color:${isMine ? '#c62828' : '#555'};
                    transition:all 0.15s;`;
                chip.innerHTML = `${emoji}<span style="font-size:11px;font-weight:700;">${count}</span>`;
                chip.onclick = (e) => {
                    e.stopPropagation();
                    toggleChatReaction(msgId, roomId, emoji);
                };
                reactionBar.appendChild(chip);
            }
            bubbleWrap.appendChild(reactionBar);
        }

        msgEl.id = `msgEl-${msgId}`;
        msgEl.appendChild(bubbleWrap);
        container.appendChild(msgEl);
    }

    if (wasAtBottom) container.scrollTop = container.scrollHeight;

    // 읽음 아바타 렌더링
    updateReadAvatars(msgs, myUid, roomId);
}

// ===== 메시지 메뉴 (이모지 반응 + 복사 + 수정/삭제) =====
window.showChatMsgMenu = function (msgId, roomId, el, isMe, msgText) {
    console.log('🟡 showChatMsgMenu 진입 — msgId:', msgId, '| isMe:', isMe, '| roomId:', roomId);
    document.getElementById('_chatMsgMenu')?.remove();
    const rect = el.getBoundingClientRect();
    const EMOJIS = ['❤️','😂','😮','😢','😡','👍','👎','🔥'];
    const myUid  = getChatUserId();

    // 기존 내 반응 파악 (이미 누른 것 표시)
    const msgs    = window._lastMsgs || {};
    const msgData = msgs[msgId] || {};
    const reactions = msgData.reactions || {};
    const myReacted = EMOJIS.filter(e => reactions[e]?.[myUid]);

    // ✅ 바텀시트 방식 (모바일에서 확실히 동작)
    const overlay = document.createElement('div');
    overlay.id = '_chatMsgMenu';
    overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.4);z-index:99999;display:flex;align-items:flex-end;`;

    // 이모지 반응 행
    const emojiRow = EMOJIS.map(e => {
        const active = myReacted.includes(e);
        return `<button onclick="toggleChatReaction('${msgId}','${roomId}','${e}')"
            style="width:40px;height:40px;border:none;cursor:pointer;font-size:20px;
            border-radius:10px;background:${active ? '#fff0f0' : '#f8f9fa'};
            outline:${active ? '2px solid #c62828' : 'none'};flex-shrink:0;
            transition:transform 0.1s,background 0.15s;display:flex;align-items:center;justify-content:center;"
            onmouseover="this.style.transform='scale(1.2)'"
            onmouseout="this.style.transform='scale(1)'">${e}</button>`;
    }).join('');

    // 복사 버튼 (텍스트 있을 때만)
    const copyBtn = msgText ? `
        <button onclick="copyChatMessage('${msgId}')"
            style="display:flex;align-items:center;gap:10px;width:100%;padding:14px 20px;
            border:none;background:none;cursor:pointer;font-size:15px;color:#262626;font-weight:600;
            border-top:1px solid #f5f5f5;text-align:left;"
            onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='none'">
            <i class="fas fa-copy" style="color:#1565c0;width:20px;font-size:16px;"></i> 복사
        </button>` : '';

    // 수정/삭제 (내 메시지) + 관리자는 남의 메시지도 삭제 가능
    const _isAdmin = window._chatIsAdmin === true;
    const editDeleteBtns = isMe ? `
        <button onclick="editChatMessage('${msgId}','${roomId}')"
            style="display:flex;align-items:center;gap:10px;width:100%;padding:14px 20px;
            border:none;background:none;cursor:pointer;font-size:15px;color:#262626;font-weight:600;
            border-top:1px solid #f5f5f5;text-align:left;"
            onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='none'">
            <i class="fas fa-pencil-alt" style="color:#405de6;width:20px;font-size:16px;"></i> 수정
        </button>
        <button onclick="deleteChatMessage('${msgId}','${roomId}')"
            style="display:flex;align-items:center;gap:10px;width:100%;padding:14px 20px;
            border:none;background:none;cursor:pointer;font-size:15px;color:#c62828;font-weight:600;
            text-align:left;"
            onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='none'">
            <i class="fas fa-trash-alt" style="width:20px;font-size:16px;"></i> 삭제
        </button>`
    : (_isAdmin ? `
        <button onclick="deleteChatMessage('${msgId}','${roomId}')"
            style="display:flex;align-items:center;gap:10px;width:100%;padding:14px 20px;
            border:none;background:none;cursor:pointer;font-size:15px;color:#c62828;font-weight:600;
            border-top:1px solid #f5f5f5;text-align:left;"
            onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='none'">
            <i class="fas fa-shield-alt" style="width:20px;font-size:16px;"></i> 🛡️ 관리자 삭제
        </button>` : '');

    overlay.innerHTML = `
        <div style="background:white;width:100%;max-width:600px;margin:0 auto;
            border-radius:20px 20px 0 0;padding-bottom:env(safe-area-inset-bottom,0px);
            box-shadow:0 -4px 24px rgba(0,0,0,0.15);">
            <div style="width:40px;height:4px;background:#dee2e6;border-radius:2px;margin:12px auto 6px;"></div>
            <div style="display:flex;justify-content:space-around;align-items:center;
                padding:10px 12px 12px;border-bottom:1px solid #f5f5f5;">
                ${emojiRow}
            </div>
            ${copyBtn}
            ${editDeleteBtns}
        </div>`;

    console.log('🟡 overlay DOM에 추가 — emojiRow 길이:', emojiRow.length, '| copyBtn 있음:', !!copyBtn, '| editDeleteBtns 있음:', !!editDeleteBtns);
    // ✅ setTimeout으로 현재 클릭 이벤트가 끝난 뒤 리스너 등록 (즉시 닫힘 방지)
    document.body.appendChild(overlay);
    console.log('🟡 overlay 추가 완료 — body에 존재:', !!document.getElementById("_chatMsgMenu"));
    setTimeout(() => {
        overlay.addEventListener('click', e => {
            console.log('🟡 overlay 클릭 — target:', e.target === overlay ? 'overlay 배경(닫힘)' : '내부 요소');
            if (e.target === overlay) overlay.remove();
        });
    }, 0);
};

// ===== 메시지 복사 =====
window.copyChatMessage = function (msgId) {
    document.getElementById('_chatMsgMenu')?.remove();
    const msgs = window._lastMsgs || {};
    const text = msgs[msgId]?.text || '';
    if (!text) { showChatToast('⚠️ 복사할 텍스트가 없습니다.'); return; }
    navigator.clipboard?.writeText(text)
        .then(() => showChatToast('✅ 복사되었습니다'))
        .catch(() => {
            // fallback for older browsers
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            showChatToast('✅ 복사되었습니다');
        });
};

// ===== 이모지 반응 토글 =====
window.toggleChatReaction = async function (msgId, roomId, emoji) {
    document.getElementById('_chatMsgMenu')?.remove();
    const myUid = getChatUserId();
    if (!myUid) { showChatToast('⚠️ 로그인이 필요합니다.'); return; }

    try {
        const reactionRef = getChatDb().ref(`chats/${roomId}/messages/${msgId}/reactions`);
        const snap = await reactionRef.once('value');
        const reactions = snap.val() || {};

        const updates = {};
        // 같은 이모지 누르면 토글 OFF
        if (reactions[emoji]?.[myUid]) {
            updates[`${emoji}/${myUid}`] = null;
        } else {
            // 다른 이모지 반응 제거 (하나만 선택 가능)
            for (const [e, reactors] of Object.entries(reactions)) {
                if (e !== emoji && reactors?.[myUid]) {
                    updates[`${e}/${myUid}`] = null;
                }
            }
            updates[`${emoji}/${myUid}`] = true;
        }
        await reactionRef.update(updates);
    } catch (e) {
        showChatToast('❌ 반응 저장 실패: ' + e.message);
    }
};

window.deleteChatMessage = async function (msgId, roomId) {
    document.getElementById('_chatMsgMenu')?.remove();
    if (!confirm('이 메시지를 삭제하시겠습니까?\n(모든 참여자에게서 삭제됩니다)')) return;
    try {
        await getChatDb().ref(`chats/${roomId}/messages/${msgId}`).remove();
        showChatToast('✅ 메시지가 삭제되었습니다');

        // ✅ 채팅 목록 미리보기 갱신: 삭제 후 실제 마지막 메시지로 업데이트
        const snap = await getChatDb().ref(`chats/${roomId}/messages`)
            .orderByChild('timestamp').limitToLast(1).once('value');
        const remaining = snap.val();
        if (remaining) {
            const last = Object.values(remaining)[0];
            let preview = '';
            if (last.deleted) preview = '메시지가 삭제되었습니다';
            else if (last.videoUrl) preview = '🎬 동영상';
            else if (last.imageUrls?.length > 0) preview = last.text ? last.text : `📷 사진 ${last.imageUrls.length}장`;
            else if (last.imageUrl || last.imageBase64) preview = last.text ? last.text : '📷 사진';
            else if (last.fileName) preview = `📎 ${last.fileName}`;
            else preview = last.text?.length > 30 ? last.text.substring(0, 30) + '...' : (last.text || '메시지');
            await getChatDb().ref(`chats/${roomId}`).update({
                lastMessage: preview,
                lastMessageAt: last.timestamp
            });
        } else {
            // 메시지가 하나도 없으면 미리보기 비움
            await getChatDb().ref(`chats/${roomId}`).update({ lastMessage: '', lastMessageAt: 0 });
        }
    } catch (e) {
        showChatToast('❌ 삭제 실패: ' + e.message);
    }
};

// ===== 메시지 수정 =====
window.editChatMessage = function (msgId, roomId) {
    document.getElementById('_chatMsgMenu')?.remove();
    const msgs = window._lastMsgs || {};
    const msg  = msgs[msgId];
    if (!msg?.text) { showChatToast('⚠️ 텍스트 메시지만 수정할 수 있습니다.'); return; }

    document.getElementById('_editMsgModal')?.remove();
    const modal = document.createElement('div');
    modal.id = '_editMsgModal';
    modal.style.cssText = `position:fixed;bottom:0;left:0;width:100%;
        background:rgba(0,0,0,0.45);z-index:99999;display:flex;
        align-items:flex-end;justify-content:center;`;
    modal.innerHTML = `
        <div style="background:white;width:100%;max-width:600px;border-radius:20px 20px 0 0;
            padding:20px 20px 32px;box-shadow:0 -4px 24px rgba(0,0,0,0.15);">
            <div style="width:40px;height:4px;background:#dbdbdb;border-radius:2px;margin:0 auto 18px;"></div>
            <div style="font-size:15px;font-weight:700;color:#262626;margin-bottom:12px;">
                <i class="fas fa-pencil-alt" style="color:#405de6;margin-right:8px;"></i>메시지 수정
            </div>
            <textarea id="_editMsgInput"
                style="width:100%;border:1.5px solid #dbdbdb;border-radius:12px;
                padding:12px 14px;font-size:14px;resize:none;outline:none;
                font-family:inherit;min-height:80px;box-sizing:border-box;line-height:1.5;"
                onfocus="this.style.borderColor='#405de6'"
                onblur="this.style.borderColor='#dbdbdb'">${escapeHTML(msg.text)}</textarea>
            <div style="display:flex;gap:10px;margin-top:12px;">
                <button onclick="document.getElementById('_editMsgModal').remove()"
                    style="flex:1;padding:12px;border:1.5px solid #dbdbdb;border-radius:12px;
                    background:white;font-size:14px;font-weight:600;color:#262626;cursor:pointer;">
                    취소
                </button>
                <button onclick="confirmEditChatMessage('${msgId}','${roomId}')"
                    style="flex:1;padding:12px;border:none;border-radius:12px;
                    background:#262626;font-size:14px;font-weight:700;color:white;cursor:pointer;">
                    수정 완료
                </button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    setTimeout(() => {
        const ta = document.getElementById('_editMsgInput');
        if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
    }, 50);
};

window.confirmEditChatMessage = async function (msgId, roomId) {
    const newText = document.getElementById('_editMsgInput')?.value.trim();
    if (!newText) { showChatToast('⚠️ 내용을 입력해주세요.'); return; }
    if (newText.length > 500) { showChatToast('⚠️ 500자 이하로 입력해주세요.'); return; }
    document.getElementById('_editMsgModal').remove();
    try {
        await getChatDb().ref(`chats/${roomId}/messages/${msgId}`).update({
            text: newText,
            edited: true,
            editedAt: Date.now()
        });
        showChatToast('✅ 메시지가 수정되었습니다');
    } catch (e) {
        showChatToast('❌ 수정 실패: ' + e.message);
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
    const videoInput = document.getElementById('chatVideoInput');
    const text       = input?.value.trim();
    const hasImage   = imageInput?.files?.length > 0;
    const hasFiles   = fileInput?.files?.length > 0;
    const hasVideo   = !!videoInput?.files?.[0];

    if (!text && !hasImage && !hasFiles && !hasVideo) return;

    const now = Date.now();
    if (now - CHAT_RATE.lastReset > CHAT_RATE.WINDOW) { CHAT_RATE.count = 0; CHAT_RATE.lastReset = now; }
    CHAT_RATE.count++;
    if (CHAT_RATE.count > CHAT_RATE.MAX) {
        showChatToast('⚠️ 너무 빠르게 보내고 있어요.'); return;
    }
    if (text.length > 500) {
        showChatToast('⚠️ 메시지는 500자 이하로 입력해주세요.'); return;
    }

   // ✅ 이미지 처리 (여러 장 지원)
    let imageResults = [];
    if (hasImage) {
        for (const file of Array.from(imageInput.files)) {
            try {
                const result = await compressChatImage(file);
                imageResults.push(result);
            } catch(e) {
                showChatToast(`❌ ${file.name} 이미지 처리 실패`);
            }
        }
    }

    // ✅ 영상 처리 — YouTube 업로드
    let videoUrl = null;
    if (hasVideo) {
        const progWrap = document.getElementById('chatVideoUploadProgress');
        const progBar  = document.getElementById('chatVideoProgressBar');
        const progText = document.getElementById('chatVideoProgressText');
        if (progWrap) progWrap.style.display = 'block';
        try {
            videoUrl = await uploadVideoToYouTube(videoInput.files[0], (pct) => {
                if (progBar)  progBar.style.width  = pct + '%';
                if (progText) progText.textContent = pct + '%';
            });
        } catch(e) {
            if (progWrap) progWrap.style.display = 'none';
            showChatToast('❌ 영상 업로드 실패: ' + e.message);
            return;
        }
        if (progWrap) progWrap.style.display = 'none';
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
    clearChatVideo(); // ✅ 영상 미리보기 초기화

    const myUid  = getChatUserId();
    const myName = getMyNickname();
    const ts     = Date.now();

    try {
        const messagesRef = getChatDb().ref(`chats/${roomId}/messages`);
        let preview = '';

        // ✅ 텍스트 + 이미지(단일/다중) 메시지
        if (text || imageResults.length > 0) {
            const msgData = { senderId: myUid, senderName: myName, text: text || '', timestamp: ts, read: false };
            if (imageResults.length === 1) {
                // 단일 이미지 → 기존 방식 유지
                const r = imageResults[0];
                if (r.isUrl) { msgData.imageUrl    = r.url; }
                else         { msgData.imageBase64  = r.url; }
            } else if (imageResults.length > 1) {
                // 다중 이미지 → imageUrls 배열
                msgData.imageUrls = imageResults.map(r => r.url);
            }
            await messagesRef.push(msgData);
            preview = imageResults.length > 0 && !text
                ? `📷 사진 ${imageResults.length}장`
                : (text.length > 30 ? text.substring(0, 30) + '...' : text);
        }

        // ✅ 영상 메시지
        if (videoUrl) {
            const videoMsg = {
                senderId: myUid, senderName: myName, text: '',
                timestamp: Date.now(), read: false, videoUrl
            };
            await messagesRef.push(videoMsg);
            preview = '🎬 동영상';
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
// ===== 채팅 알림 전송 — 같은 방의 미발송 알림은 묶어서 갱신 =====
// pushed:false & read:false 인 같은 roomId 알림이 있으면 덮어쓰고
// count(메시지 수)를 누적해 "N개의 새 메시지" 형태로 표시합니다.
async function sendChatNotification(toUid, fromName, text, roomId, senderMainUid) {
    // ✅ 메인 앱 인증이 없으면 알림 전송 불가 (main db는 main auth 필요)
    if (!auth.currentUser) {
        console.log('ℹ️ 메인 인증 없음 — 채팅 알림 스킵');
        return;
    }

    try {
        const [globalSnap, roomSnap, filterSnap] = await Promise.all([
            db.ref(`users/${toUid}/notificationTypes/chat`).once('value'),
            db.ref(`users/${toUid}/notificationTypes/chatRooms/${roomId}`).once('value'),
            senderMainUid
                ? db.ref(`users/${toUid}/notificationTypes/chatFilterUsers/${senderMainUid}`).once('value')
                : Promise.resolve({ val: () => null })
        ]);

        if (globalSnap.val() === false) return;
        if (roomSnap.val() === false)   return;
        if (filterSnap.val() === false) return;

        const shortText = text.length > 50 ? text.substring(0, 50) + '...' : text;
        const now       = Date.now();

        // ── 수신자 notifications는 읽기 권한이 없으므로 항상 새 알림 생성
        // (번들링은 서버 트리거에서 처리)
        const notifId = `chat_${now}_${Math.random().toString(36).substr(2, 6)}`;
        await db.ref(`notifications/${toUid}/${notifId}`).set({
            type:      'chat',
            title:     `💬 ${fromName}`,
            text:      shortText,
            count:     1,
            timestamp: now,
            read:      false,
            pushed:    false,
            roomId
        });
    } catch (e) {
        if (e.code === 'PERMISSION_DENIED' || (e.message && e.message.includes('permission_denied'))) {
            console.warn('⚠️ 채팅 알림 권한 없음:', e.message);
        } else {
            console.warn('채팅 알림 전송 실패:', e.message);
        }
    }
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

// ✅ 수정 후 코드 — imgBB 업로드 추가
async function compressChatImage(file) {
    // 1단계: Canvas로 리사이즈 + 압축 → base64
    const base64 = await new Promise((resolve, reject) => {
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

    // 2단계: imgBB API에 업로드 → URL 반환
    try {
        const pureBase64 = base64.split(',')[1];
        const formData = new FormData();
        formData.append('image', pureBase64);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        const json = await res.json();
        if (json.success && json.data?.url) {
            return { url: json.data.url, isUrl: true }; // ✅ URL 반환
        }
        console.warn('⚠️ imgBB 업로드 실패, base64 폴백:', json);
        return { url: base64, isUrl: false }; // 폴백
    } catch (err) {
        console.warn('⚠️ imgBB 업로드 오류, base64 폴백:', err);
        return { url: base64, isUrl: false }; // 폴백
    }
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
    const grid       = document.getElementById('chatImgPreviewGrid');
    if (preview) preview.style.display = 'none';
    if (grid) grid.innerHTML = '';
    if (imageInput) imageInput.value = '';
};

// ✅ 신규: 영상 미리보기 초기화
window.previewChatVideo = function (input) {
    if (!input.files?.[0]) return;
    const preview = document.getElementById('chatVideoPreview');
    const video   = document.getElementById('chatVideoPreviewEl');
    if (video) video.src = URL.createObjectURL(input.files[0]);
    if (preview) preview.style.display = 'block';
};

// ✅ 신규: 영상 미리보기 제거
window.clearChatVideo = function () {
    const preview    = document.getElementById('chatVideoPreview');
    const videoInput = document.getElementById('chatVideoInput');
    const video      = document.getElementById('chatVideoPreviewEl');
    const progWrap   = document.getElementById('chatVideoUploadProgress');
    if (video && video.src) { URL.revokeObjectURL(video.src); video.src = ''; }
    if (preview)  preview.style.display  = 'none';
    if (progWrap) progWrap.style.display = 'none';
    if (videoInput) videoInput.value = '';
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

window.getChatFileIcon = function getChatFileIcon(mimeType) {
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

// ===== 채팅 이미지 다운로드 =====
window.downloadChatImage = function (msgId) {
    const msgs = window._lastMsgs || {};
    const msg  = msgs[msgId];
    // ✅ 수정 후 코드
const src = msg?.imageUrl || msg?.imageBase64 || document.querySelector(`[data-msgid="${msgId}"]`)?.dataset?.img;
    if (!src) { showChatToast('❌ 이미지를 찾을 수 없습니다'); return; }
    const ext = src.startsWith('data:image/png') ? 'png' : 'jpg';
    const a   = document.createElement('a');
    a.href     = src;
    a.download = `chat_image_${msgId}.${ext}`;
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
    const ext  = src.startsWith('data:image/png') ? 'png' : 'jpg';
    const modal = document.createElement('div');
    modal.id = '_chatImgModal';
    modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.92);z-index:999999;display:flex;flex-direction:column;
        align-items:center;justify-content:center;`;
    modal.innerHTML = `
        <img src="${src}"
            style="max-width:95vw;max-height:82vh;border-radius:10px;object-fit:contain;cursor:zoom-out;"
            onclick="document.getElementById('_chatImgModal').remove()">
        <div style="display:flex;gap:12px;margin-top:16px;">
            <button onclick="
                (function(){
                    const a=document.createElement('a');
                    a.href='${src}';
                    a.download='chat_image_${msgId}.${ext}';
                    document.body.appendChild(a);a.click();document.body.removeChild(a);
                })()"
                style="background:rgba(255,255,255,0.18);border:none;color:white;
                padding:10px 22px;border-radius:22px;font-size:14px;cursor:pointer;
                display:flex;align-items:center;gap:8px;font-weight:600;">
                <i class="fas fa-download"></i> 다운로드
            </button>
            <button onclick="document.getElementById('_chatImgModal').remove()"
                style="background:rgba(255,255,255,0.12);border:none;color:white;
                padding:10px 22px;border-radius:22px;font-size:14px;cursor:pointer;font-weight:600;">
                닫기
            </button>
        </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
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
                <div onclick="document.getElementById('_roomMenu').remove();renameChatRoom('${roomId}')"
                    style="display:flex;align-items:center;gap:12px;padding:14px 0;
                    border-bottom:1px solid #f5f5f5;cursor:pointer;"
                    onmouseover="this.style.background='#f8f9fa'"
                    onmouseout="this.style.background='white'">
                    <i class="fas fa-pencil-alt" style="color:#405de6;width:20px;text-align:center;"></i>
                    <span style="font-size:15px;font-weight:600;color:#212529;">채팅방 이름 변경</span>
                    <i class="fas fa-chevron-right" style="color:#ccc;margin-left:auto;font-size:12px;"></i>
                </div>
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

// ===== 채팅방 이름 변경 =====
window.renameChatRoom = function (roomId) {
    document.getElementById('_renameModal')?.remove();
    const modal = document.createElement('div');
    modal.id = '_renameModal';
    modal.style.cssText = `position:fixed;bottom:0;left:0;width:100%;
        background:rgba(0,0,0,0.45);z-index:99999;display:flex;
        align-items:flex-end;justify-content:center;`;
    modal.innerHTML = `
        <div style="background:white;width:100%;max-width:600px;border-radius:20px 20px 0 0;
            padding:20px 20px 32px;box-shadow:0 -4px 24px rgba(0,0,0,0.15);">
            <div style="width:40px;height:4px;background:#dbdbdb;border-radius:2px;margin:0 auto 18px;"></div>
            <div style="font-size:15px;font-weight:700;color:#262626;margin-bottom:12px;">
                <i class="fas fa-pencil-alt" style="color:#405de6;margin-right:8px;"></i>채팅방 이름 변경
            </div>
            <input id="_renameInput" type="text" placeholder="새 이름을 입력하세요..."
                maxlength="40"
                style="width:100%;border:1.5px solid #dbdbdb;border-radius:12px;
                padding:12px 14px;font-size:15px;outline:none;
                font-family:inherit;box-sizing:border-box;"
                onfocus="this.style.borderColor='#405de6'"
                onblur="this.style.borderColor='#dbdbdb'"
                onkeydown="if(event.key==='Enter'){event.preventDefault();confirmRenameRoom('${roomId}');}">
            <div style="display:flex;gap:10px;margin-top:14px;">
                <button onclick="document.getElementById('_renameModal').remove()"
                    style="flex:1;padding:12px;border:1.5px solid #dbdbdb;border-radius:12px;
                    background:white;font-size:14px;font-weight:600;color:#262626;cursor:pointer;">
                    취소
                </button>
                <button onclick="confirmRenameRoom('${roomId}')"
                    style="flex:1;padding:12px;border:none;border-radius:12px;
                    background:#262626;font-size:14px;font-weight:700;color:white;cursor:pointer;">
                    변경
                </button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    setTimeout(() => document.getElementById('_renameInput')?.focus(), 50);
};

window.confirmRenameRoom = async function (roomId) {
    const newName = document.getElementById('_renameInput')?.value.trim();
    if (!newName) { showChatToast('⚠️ 이름을 입력해주세요.'); return; }
    document.getElementById('_renameModal').remove();
    try {
        const isGroup = roomId.startsWith('group_');
        const field   = isGroup ? 'groupName' : 'customName';
        await getChatDb().ref(`chats/${roomId}`).update({ [field]: newName });
        // 헤더 타이틀 즉시 반영
        const titleEl = document.querySelector('#chatSection span[data-roomtitle]');
        if (titleEl) titleEl.textContent = newName;
        showChatToast('✅ 채팅방 이름이 변경되었습니다');
    } catch (e) {
        showChatToast('❌ 변경 실패: ' + e.message);
    }
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
        // ✅ 수정 후 코드
const photos = msgs.filter(m => m.imageUrl || m.imageBase64);
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
                            // ✅ 수정 후 코드
<img src="${m.imageUrl || m.imageBase64}"
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
    const _galSrc = m.imageUrl || m.imageBase64 || '';
const ext = _galSrc.startsWith('data:image/png') ? 'png' : 'jpg';
    modal.innerHTML = `
        <div style="color:white;font-size:13px;margin-bottom:12px;opacity:0.8;">
            ${escapeHTML(m.senderName||'')} · ${dateStr}
        </div>
        <img src="${_galSrc}"
            style="max-width:95vw;max-height:76vh;border-radius:10px;object-fit:contain;cursor:zoom-out;"
            onclick="this.closest('div').remove()">
        <div style="display:flex;gap:12px;margin-top:16px;">
            <button onclick="(function(){
                    const a=document.createElement('a');
                    a.href='${_galSrc}';
                    a.download='chat_image_${msgId}.${ext}';
                    document.body.appendChild(a);a.click();document.body.removeChild(a);
                })()"
                style="background:rgba(255,255,255,0.18);border:none;color:white;
                padding:10px 22px;border-radius:22px;font-size:14px;cursor:pointer;
                display:flex;align-items:center;gap:8px;font-weight:600;">
                <i class="fas fa-download"></i> 다운로드
            </button>
            <button onclick="this.closest('div[style]').remove()"
                style="background:rgba(255,255,255,0.12);border:none;color:white;
                padding:10px 22px;border-radius:22px;font-size:14px;cursor:pointer;font-weight:600;">
                닫기
            </button>
        </div>`;
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
                // ✅ 수정 후 코드
${(m.imageUrl || m.imageBase64) ? `<div style="margin-top:8px;font-size:11px;color:#aaa;">📷 사진 포함</div>` : ''}
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

// ================================================================
// ✅ chat-upgrade.js 호환용 window._chat 전역 노출 (IIFE 내부)
// ================================================================

window._chat = {
    // 함수
    isChatAuthReady:   () => isChatAuthReady(),
    getChatUserId:     () => getChatUserId(),
    getChatDb:         () => getChatDb(),
    getChatApp:        () => getChatApp(),
    getChatAuth:       () => getChatAuth(),
    syncChatAuth:      (u) => syncChatAuth(u),
    resolveNickname:   (u) => resolveNickname(u),
    getMyNickname:     ()  => getMyNickname(),
    markAsRead:        (r, u) => markMessagesAsRead(r, u),
    updateReadAvatars: (m, u, r) => updateReadAvatars(m, u, r),
    updateBadge:       () => updateChatBadge(),
    showToast:         (msg) => showChatToast(msg),
    formatTime:        (ts) => formatChatTime(ts),

    // 변경 가능한 변수: getter / setter
    get activeChatRoomId()    { return activeChatRoomId; },
    set activeChatRoomId(v)   { activeChatRoomId = v; },
    get chatMsgListener()     { return chatMsgListener; },
    set chatMsgListener(v)    { chatMsgListener = v; },
};

// chat.js IIFE 하단 window._chat 노출 부분 근처에 추가
window.getChatFileIcon = getChatFileIcon;

console.log('✅ window._chat 전역 노출 완료');

// 📍 chat.js 맨 마지막 줄
window.dispatchEvent(new CustomEvent('chatReady'));

})(); // IIFE 끝