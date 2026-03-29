// =====================================================================
// ⚙️ 로딩 팁 설정 — 여기서 메세지를 자유롭게 추가/수정/삭제하세요!
// 여러 개 입력 가능, 5초마다 랜덤으로 하나씩 표시됩니다.
// =====================================================================
const SITE_LOADING_TIPS = [
    "그거 아세요? 정아영은 외계인이래요!",
    "버그가 있다면 버그제보탭에 제보해주세요.",
    "알림 설정에서 원하는 알림만 받을 수 있어요.",
    "검색으로 원하는 기사를 빠르게 찾아보세요.",
    "프로필을 설정해서 나를 표현해보세요!",
    "관리자가 고정한 기사를 놓치지 마세요.",
    "많이 읽힌 기사는 핫 기사로 표시돼요.",
    "더보기에 채팅창에 들어가 대화를 나누세요!",
    "개선할 점이 있다면 개선제보함에 제보해주세요.",
    "설정에서 다크모드 등 테마를 바꿀 수 있어요.",
    "설정에서 좋아요 효과음 등 효과음을 바꿀 수 있어요.",
    "댓글 또는 채팅에서 사진을 업로드 해보세요.",
    "설정에서 프로필 사진을 바꿔보세요!",
    "그거 아세요? 명석이는 명석이에요.",
    "그거 아세요? 밥에서는 밥맛이 나요.",
    "그거 아세요? 밥에서는 쌀맛이 나요.",
    "설정에서 기기모드를 탭하여 현재 기기로 설정하세요.",
    "더보기에 투표탭을 사용해보세요!",
    "항상 버그 수정 항목 기사를 놓치지 마세요.",
    "관리자는 신입니다.",
    "관리자는 해정이입니다.",
    "관리자는 착하고 잘생겼습니다.",
    "버그 수정을 할 때 짜증납니다.",
    "현재 24번째에 있는 해당 메세지를 보고 있습니다.",
    "관리자는 항상 최선을 다 해 노력하고 있습니다.",
    "더보기에 활동중 탭을 가보세요!",
    "마크 탭에는 행동팩 등과 같은 유용한 기사들이 있어요!",
    "예전 해정뉴스 버전에서는 카지노와, 주식을 제작하려 했다네요.",
    "관리자는 Claude AI를 사용합니다.",
    "작성할 때 기사 설정을 해보세요!",
    "이것은 31번째에 있는 마지막 메세지입니다."
];

// ── 로딩 화면 표시/숨김 ──
let _loadingTipTimer = null;

function showPageLoadingScreen() {
    if (document.getElementById('_pageLoadingScreen')) return;
    const overlay = document.createElement('div');
    overlay.id = '_pageLoadingScreen';
    overlay.style.cssText = [
        'position:fixed','top:0','left:0','width:100%','height:100%',
        'background:#fff','z-index:999998',
        'display:flex','flex-direction:column',
        'align-items:center','justify-content:center',
        'transition:opacity 0.4s ease'
    ].join(';');

    overlay.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:0 32px;">
            <img src="favicon.ico" onerror="this.style.display='none'"
                style="width:56px;height:56px;border-radius:14px;object-fit:cover;box-shadow:0 2px 12px rgba(0,0,0,0.12);">
            <div style="width:44px;height:44px;border:4px solid #f0f0f0;
                border-top:4px solid #c62828;border-radius:50%;
                animation:_plsSpin 0.9s linear infinite;"></div>
            <div style="font-size:17px;font-weight:700;color:#212121;letter-spacing:-0.3px;">로딩 중...</div>
            <div id="_loadingTip"
                style="font-size:13px;color:#888;text-align:center;max-width:280px;
                line-height:1.6;min-height:42px;transition:opacity 0.4s ease;">
            </div>
        </div>
        <style>
            @keyframes _plsSpin { to { transform:rotate(360deg); } }
        </style>
    `;
    document.body.appendChild(overlay);

    // 첫 팁 즉시 표시 후 5초마다 랜덤 교체
    function _rotateTip() {
        const el = document.getElementById('_loadingTip');
        if (!el || !SITE_LOADING_TIPS.length) return;
        el.style.opacity = '0';
        setTimeout(() => {
            el.textContent = SITE_LOADING_TIPS[Math.floor(Math.random() * SITE_LOADING_TIPS.length)];
            el.style.opacity = '1';
        }, 300);
    }
    _rotateTip();
    _loadingTipTimer = setInterval(_rotateTip, 5000);
}

function hidePageLoadingScreen() {
    clearInterval(_loadingTipTimer);
    const overlay = document.getElementById('_pageLoadingScreen');
    if (!overlay) return;
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 420);
}

// ===== Part 1: 기본 설정 및 Firebase 초기화 =====

const firebaseConfig = {
  apiKey: "AIzaSyDgooYtVr8-jm15-fx_WvGLCDxonLpNPuU",
  authDomain: "hsj-news.firebaseapp.com",
  databaseURL: "https://hsj-news-default-rtdb.firebaseio.com",
  projectId: "hsj-news",
  storageBucket: "hsj-news.firebasestorage.app",
  messagingSenderId: "437842430700",
  appId: "1:437842430700:web:e3822bde4cfecdc04633c9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// 전역 캐시 객체
const globalCache = {
    users: new Map(),
    profilePhotos: new Map(),
    decorations: new Map(),
    settings: null,
    lastUpdate: 0,
    CACHE_DURATION: 5 * 60 * 1000
};

// Toast 알림 시스템
let toastQueue = [];
let isToastShowing = false;

function showToastNotification(title, message, articleId = null) {
    toastQueue.push({ title, message, articleId });
    if (!isToastShowing) processToastQueue();
}

function processToastQueue() {
    if (toastQueue.length === 0) {
        isToastShowing = false;
        return;
    }
    
    isToastShowing = true;
    const { title, message, articleId } = toastQueue.shift();
    
    const existingToast = document.getElementById('toastNotification');
    if(existingToast) existingToast.remove();
    
    const toastHTML = `
        <div id="toastNotification" class="toast-notification" onclick="${articleId ? `showArticleDetail('${articleId}')` : 'closeToast()'}">
            <div class="toast-icon">🔔</div>
            <div class="toast-content">
                <div class="toast-title">${escapeHTML ? escapeHTML(title) : title}</div>
                <div class="toast-message">${escapeHTML ? escapeHTML(message) : message}</div>
            </div>
            <button class="toast-close" onclick="event.stopPropagation(); closeToast();">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', toastHTML);
    
    setTimeout(() => {
        closeToast();
        setTimeout(processToastQueue, 300);
    }, 5000);
}

function closeToast() {
    const toast = document.getElementById('toastNotification');
    if(toast) {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }
}

// 인증 지속성 설정
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => console.error("❌ 인증 지속성 설정 실패:", error));

// ✅ 인증 초기화 완료를 기다리는 Promise (Race Condition 방지)
let _authReadyResolve;
const authReady = new Promise(resolve => { _authReadyResolve = resolve; });

// ===== Firebase Messaging 초기화 (Service Worker 준비 후) =====
let messaging = null;

async function initializeMessaging() {
    try {
        // 1. Messaging 지원 여부 확인
        if (!firebase.messaging.isSupported || !firebase.messaging.isSupported()) {
            console.warn("⚠️ 이 브라우저는 Firebase Messaging을 지원하지 않습니다.");
            return;
        }
        
        // 2. Service Worker가 준비될 때까지 대기
        console.log("⏳ Service Worker 준비 대기 중...");
        const swRegistration = await navigator.serviceWorker.ready;
        console.log("✅ Service Worker 준비 완료:", swRegistration.scope);
        
        // 3. Firebase Messaging 초기화
        messaging = firebase.messaging();
        window.messaging = messaging; // 전역 변수로 저장
        console.log("✅ Firebase Messaging 초기화 성공!");
        
        // 4. 포그라운드 메시지 수신 핸들러 설정
        messaging.onMessage((payload) => {
            console.log('📨 포그라운드 메시지 수신:', payload);
            
            const title = payload.data?.title || payload.notification?.title || '📰 해정뉴스';
            const body = payload.data?.body || payload.data?.text || payload.notification?.body || '새로운 알림';
            const articleId = payload.data?.articleId || null;
            
            if (typeof showToastNotification === 'function') {
                showToastNotification(title, body, articleId);
            }
        });
        
    } catch(error) {
        console.error("❌ Firebase Messaging 초기화 실패:", error);
        console.error("상세 오류:", error.code, error.message);
    }
}

// Service Worker가 등록된 후 Messaging 초기화
if ('serviceWorker' in navigator) {
    initializeMessaging();
} else {
    console.warn("⚠️ Service Worker를 지원하지 않는 브라우저입니다.");
}


// 전역 변수
// ===== Part 1 초반에 추가 =====
let currentCategory = "자유게시판";
let currentScrollPosition = 0;
window.isEditingArticle = false;
let currentArticlePage = 1;
const ARTICLES_PER_PAGE = 5;
let currentCommentPage = 1;
const COMMENTS_PER_PAGE = 10;
let currentCommentSort = 'latest'; // 댓글 정렬 방식
let currentArticleId = null;
let currentSortMethod = 'latest';
let filteredArticles = [];
let allArticles = [];
let bannedWordsList = [];
let currentFreeboardPage = 1;
let currentFreeboardSortMethod = 'latest';
let filteredFreeboardArticles = [];
let originalUserTheme = null;
window.profilePhotoCache = new Map(); // window 객체에 직접 할당하여 다른 함수에서도 접근 가능하도록
let maintenanceChecked = false;
let isEasterEggActive = false; // ✨ 추가: 이스터에그 활성 상태
let _isBannedUser = false; // ✅ [BUG FIX] 차단 유저 재로그인 방지 플래그

// 로딩 인디케이터
function showLoadingIndicator(message = "로딩 중...") {
    const existing = document.getElementById("loadingIndicator");
    if(existing) return;
    
    const html = `
        <div id="loadingIndicator" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:99999;">
            <div style="background:white;padding:30px 40px;border-radius:12px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
                <div style="width:50px;height:50px;border:4px solid #f3f3f3;border-top:4px solid #c62828;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 20px;"></div>
                <div style="color:#333;font-weight:600;font-size:16px;">${message}</div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function hideLoadingIndicator() {
    const indicator = document.getElementById("loadingIndicator");
    if(indicator) indicator.remove();
}

// 사용자 정보
function getNickname() {
    const user = auth.currentUser;
    return user ? user.displayName || user.email.split('@')[0] : "익명";
}

function getUserEmail() {
    const user = auth.currentUser;
    return user ? user.email : null;
}

function getUserId() {
    const user = auth.currentUser;
    return user ? user.uid : 'anonymous';
}

function isLoggedIn() {
    return auth.currentUser !== null;
}

let _cachedAdminStatus = null;
let _adminCacheTime = 0;
const ADMIN_CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

async function isAdminAsync() {
    const user = auth.currentUser;
    if (!user) return false;
    if (_cachedAdminStatus !== null && Date.now() - _adminCacheTime < ADMIN_CACHE_DURATION) {
        return _cachedAdminStatus;
    }
    try {
        const snap = await db.ref(`users/${user.uid}/isAdmin`).once("value");
        _cachedAdminStatus = snap.val() === true;
        _adminCacheTime = Date.now();
        return _cachedAdminStatus;
    } catch (e) {
        return false;
    }
}

function isAdmin() {
    // 캐시가 유효하면 캐시 반환, 아니면 false (안전한 기본값)
    if (_cachedAdminStatus !== null && Date.now() - _adminCacheTime < ADMIN_CACHE_DURATION) {
        return _cachedAdminStatus;
    }
    return false;
}

// 쿠키 관리
function setCookie(n, v, days = 365) { 
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${n}=${v};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

function getCookie(n) {
    const m = document.cookie.match(new RegExp(`(^| )${n}=([^;]+)`));
    return m ? m[2] : null;
}

function deleteCookie(n) { 
    document.cookie = n + '=; Max-Age=0; path=/'; 
}

// ✅ XSS 방어용 함수들
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function sanitizeHTML(dirty) {
    if (!dirty) return '';
    if (typeof DOMPurify === 'undefined') {
        // DOMPurify가 없을 때 안전한 폴백
        const div = document.createElement('div');
        div.textContent = dirty;
        return div.innerHTML;
    }
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's',
            'h1', 'h2', 'h3', 'ul', 'ol', 'li',
            'blockquote', 'a', 'img', 'span', 'div', 'pre', 'code'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel'],
        ALLOW_DATA_ATTR: false
    });
}

// 금지어 관리
let bannedWordsCache = { words: [], lastUpdate: 0 };

function loadBannedWords() {
    db.ref("adminSettings/bannedWords").on("value", snapshot => {
        const val = snapshot.val();
        bannedWordsCache.words = val ? val.split(',').map(s => s.trim()).filter(s => s !== "") : [];
        bannedWordsCache.lastUpdate = Date.now();
        bannedWordsList = bannedWordsCache.words;
    });
}

function checkBannedWords(text) {
    if (!text) return null;
    for (const word of bannedWordsList) {
        if (text.includes(word)) return word;
    }
    return null;
}

function addWarningToCurrentUser() {
    const user = auth.currentUser;
    if (!user) return;
    
    db.ref("users/" + user.uid).once("value").then(snapshot => {
        const data = snapshot.val() || {};
        const currentWarnings = (data.warningCount || 0) + 1;
        
        let updates = { warningCount: currentWarnings };
        
        if (currentWarnings >= 3) {
            updates.isBanned = true;
            updates.bannedAt = Date.now();
            alert("🚨 누적 경고 3회로 인해 계정이 차단됩니다.");
        } else {
            alert(`현재 누적 경고: ${currentWarnings}회`);
        }
        
        db.ref("users/" + user.uid).update(updates).then(() => {
            if (currentWarnings >= 3) {
                auth.signOut().then(() => location.reload());
            }
        });
    });
}

console.log("✅ Part 1 초기화 완료");

// ✅ [PATCH 1 추가 시작]
// 마지막 접속 시간 포맷 함수
function formatLastSeen(timestamp) {
    if (!timestamp) return '⚫ 기록 없음';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours   = Math.floor(diff / 3600000);
    const days    = Math.floor(diff / 86400000);

    if (minutes < 3)   return '<span style="color:#1aab1a;font-weight:700;">🟢 현재 활동중</span>';
    if (minutes < 60)  return `<span style="color:#f59f00;">🟡 ${minutes}분 전</span>`;
    if (hours   < 24)  return `<span style="color:#f59f00;">🟡 ${hours}시간 전</span>`;
    if (days    < 2)   return `<span style="color:#868e96;">⚫ 1일 전</span>`;
    if (days    < 100) return `<span style="color:#868e96;">⚫ ${days}일 전</span>`;
    return '<span style="color:#c62828;font-weight:700;">👻 실종됨</span>';
}

async function updateLastSeen() {
    const user = auth.currentUser;
    if (!user) return;
    try {
        await db.ref(`users/${user.uid}/lastSeen`).set(Date.now());
    } catch(e) {}
}
// ✅ [PATCH 1 추가 끝]


// ===== Part 2: URL 관리 및 라우팅 =====

// 민감한 페이지 암호화
function encryptSensitivePage(pageName) {
    const sensitivePages = ["users", "adminSettings", "eventManager", "management"];
    
    if (!sensitivePages.includes(pageName)) {
        return pageName;
    }
    
    const base64 = btoa(pageName);
    const timestamp = Date.now().toString(36);
    const randomKey = Math.random().toString(36).substring(2, 8);
    
    return `${timestamp}_${base64}_${randomKey}`;
}

function decryptSensitivePage(encodedPage) {
    if (!encodedPage || !encodedPage.includes('_')) {
        return encodedPage;
    }
    
    try {
        const parts = encodedPage.split('_');
        if (parts.length === 3) {
            return atob(parts[1]);
        }
        return encodedPage;
    } catch(e) {
        console.error("복호화 실패:", e);
        return null;
    }
}

// URL 파라미터 읽기
let urlParamsCache = null;

function getURLParams() {
    if (urlParamsCache && urlParamsCache.url === window.location.search) {
        return urlParamsCache.params;
    }
    
    const params = new URLSearchParams(window.location.search);
    let page = params.get('page');
    
    if (page) {
        const decrypted = decryptSensitivePage(page);
        if (decrypted) page = decrypted;
    }

    const result = {
        page: page,
        articleId: params.get('id'),
        section: params.get('section'),
        userEmail: params.get('user')
    };
    
    urlParamsCache = {
        url: window.location.search,
        params: result
    };
    
    return result;
}

// URL 업데이트
function updateURL(page, articleId = null, section = null) {
    let urlPage = encryptSensitivePage(page);
    
    let url = `?page=${urlPage}`;
    if (articleId) url += `&id=${articleId}`;
    if (section) url += `&section=${section}`;
    
    if (window.location.search !== url) {
        window.history.pushState({ page, articleId, section }, '', url);
    }
}

// 라우팅 함수
function routeToPage(page, articleId = null, section = null) {
    const adminPages = ['users', 'adminSettings', 'eventManager', 'management', 'errorlogs'];
    
    if (adminPages.includes(page) && !isAdmin()) {
        alert("🚫 관리자 권한이 필요합니다.");
        showArticles();
        return;
    }
    
    const routes = {
        'home': () => showArticles(),
        'freeboard': () => typeof showFreeboard === 'function' ? showFreeboard() : showArticles(),
        'write': () => showWritePage(),
        'settings': () => showSettings(),
        'profileSettings': () => typeof showProfileSettingsPage === 'function' ? showProfileSettingsPage() : showSettings(),
        'article': () => articleId ? showArticleDetail(articleId) : showArticles(),
        'profile': () => section ? (typeof showUserProfile === 'function' ? showUserProfile(section) : showArticles()) : showArticles(),
        'qna': () => typeof showQnA === 'function' ? showQnA() : showSettings(),
        'patchnotes': () => typeof showPatchNotesPage === 'function' ? showPatchNotesPage() : showSettings(),
        'users': () => typeof showUserManagement === 'function' ? showUserManagement() : showMoreMenu(),
        'admin': () => typeof showAdminEvent === 'function' ? showAdminEvent() : showArticles(),
        'more': () => showMoreMenu(),
        'messenger': () => typeof showMessenger === 'function' ? showMessenger() : showMoreMenu(),
        'chat': () => typeof showChatPage === 'function' ? showChatPage() : showMoreMenu(),
        'friends': () => typeof showFriendsPage === 'function' ? showFriendsPage() : showMoreMenu(),
        'friendRequests': () => typeof showFriendRequestsPage === 'function' ? showFriendRequestsPage() : showMoreMenu(),
        'bugreport': () => typeof showBugReportPage === 'function' ? showBugReportPage() : showMoreMenu(),
        'improvement': () => typeof showImprovementPage === 'function' ? showImprovementPage() : showMoreMenu(),
        'notification-settings': () => typeof showNotificationSettings === 'function' ? showNotificationSettings() : showSettings(),
        'errorlogs': () => showErrorLogs()
    };
    
    const routeFunction = routes[page];
    if(routeFunction) {
        try {
            routeFunction();
        } catch(error) {
            console.error(`라우팅 오류 (${page}):`, error);
            showArticles();
        }
    } else {
        // ✅ 알 수 없는 페이지: article ID처럼 생긴 값이면 기사 상세로 시도
        // Firebase push 알림이 ?page=<articleId> 형태로 링크를 만드는 경우 대응
        const looksLikeArticleId = /^[A-Za-z0-9_-]{8,30}$/.test(page);
        if (looksLikeArticleId) {
            console.info(`🔀 알 수 없는 페이지 "${page}" → 기사 ID로 시도`);
            try {
                showArticleDetail(page);
            } catch(e) {
                console.warn('기사 라우팅 실패:', e);
                showArticles();
            }
        } else {
            console.warn(`알 수 없는 페이지: ${page}`);
            showArticles();
        }
    }
}

// 초기 라우팅
function initialRoute() {
    const params = getURLParams();
    
    if (params.page) {
        routeToPage(params.page, params.articleId, params.section);
    } else {
        showArticles();
    }
}

// 브라우저 뒤로/앞으로 가기
window.addEventListener('popstate', (event) => {
    urlParamsCache = null;
    
    if (event.state) {
        routeToPage(event.state.page, event.state.articleId, event.state.section);
    } else {
        const params = getURLParams();
        if (params.page) {
            routeToPage(params.page, params.articleId, params.section);
        } else {
            showArticles();
        }
    }
});

// 로그아웃
function logoutAdmin(){
    if(!confirm("로그아웃 하시겠습니까?")) return;
    
    showLoadingIndicator("로그아웃 중...");
    
    auth.signOut().then(() => {
        deleteCookie("is_admin");
        sessionStorage.clear();
        
        globalCache.users.clear();
        globalCache.profilePhotos.clear();
        globalCache.decorations.clear();
        profilePhotoCache.clear();
        
        hideLoadingIndicator();
        alert("로그아웃 되었습니다.");
        location.reload();
    }).catch(error => {
        hideLoadingIndicator();
        console.error("로그아웃 오류:", error);
        alert("로그아웃 중 오류가 발생했습니다.");
    });
}

// Google 로그인
function googleLogin() {
    // ✅ [BUG FIX] 차단 유저는 재로그인 불가
    if (_isBannedUser) {
        alert("🚫 차단된 계정입니다. 다른 계정으로 시도하거나 관리자에게 문의하세요.");
        return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log("Google 로그인 성공:", result.user.email);
            // ✅ [BUG FIX] alert 제거 — 로그인 환영 메시지는 onAuthStateChanged의
            // showToastNotification에서 처리하므로 중복 alert 제거 (루프 방지)
        })
        .catch((error) => {
            console.error("Google 로그인 오류:", error);
            
            const errorMessages = {
                'auth/popup-closed-by-user': "로그인 창이 닫혔습니다.",
                'auth/popup-blocked': "팝업이 차단되었습니다. 팝업 차단을 해제해주세요.",
                'auth/cancelled-popup-request': "이미 로그인 진행 중입니다.",
                'auth/network-request-failed': "네트워크 연결을 확인해주세요."
            };
            
            const errorMessage = errorMessages[error.code] || `로그인 실패: ${error.message}`;
            alert(errorMessage);
        });
}

// 리디렉션 로그인
function googleLoginRedirect() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    
    auth.signInWithRedirect(provider);
}

// 리디렉션 결과 처리
auth.getRedirectResult()
    .then((result) => {
        if (result.user) {
            console.log("Google 로그인 성공 (리디렉션):", result.user.email);
            // ✅ [BUG FIX] alert 제거 — 로그인 환영 메시지는 onAuthStateChanged의
            // showToastNotification에서 처리하므로 중복 alert 제거 (루프 방지)
        }
    })
    .catch((error) => {
        console.error("Google 로그인 오류 (리디렉션):", error);
        if(error.code !== 'auth/popup-closed-by-user') {
            alert("로그인 실패: " + error.message);
        }
    });

// 관리자 모드 해제
async function disableAdminMode() {
    if(!confirm("관리자 모드를 해제하시겠습니까?\n\n일반 사용자 모드로 전환됩니다.")) return;
    
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        // DB에서 isAdmin 직접 false로 기록
        await db.ref(`users/${user.uid}/isAdmin`).set(false);
        
        // 메모리 캐시 즉시 초기화
        _cachedAdminStatus = null;
        _adminCacheTime = 0;
        
        deleteCookie("is_admin");
        alert("관리자 모드가 해제되었습니다.");
        location.reload();
    } catch(error) {
        console.error("관리자 해제 실패:", error);
        alert("해제 실패: " + error.message);
    }
}

// 공유 가능한 링크 복사
function copyArticleLink(articleId) {
    const url = `${window.location.origin}${window.location.pathname}?page=article&id=${articleId}`;
    navigator.clipboard.writeText(url).then(() => {
        alert('📋 링크가 복사되었습니다!\n\n' + url);
    }).catch(err => {
        console.error('링크 복사 실패:', err);
        prompt('이 링크를 복사하세요:', url);
    });
}

// 뒤로가기
function goBack() {
    if(typeof restoreUserTheme === 'function') {
        restoreUserTheme();
    }
    
    // ✅ 수정: 현재 스크롤 위치 저장
    currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    showArticles();
}

console.log("✅ Part 2 URL 관리 완료");

// ===== Part 3: 관리자 인증 및 프로필 관리 =====

// 관리자 인증 모달 열기
function openAdminAuthModal() {
    console.log("🔐 관리자 로그인 모달 열기");
    
    const existingModal = document.getElementById("adminAuthModal");
    if(existingModal) {
        existingModal.remove();
    }
    
    const modalHTML = `
        <div id="adminAuthModal" class="modal active">
            <div class="modal-content" style="max-width:400px;">
                <h3 style="color:#c62828; margin-bottom:20px; text-align:center;">🔐 관리자 로그인</h3>
                <form id="adminAuthForm" onsubmit="handleAdminLogin(event); return false;">
                    <div class="form-group">
                        <label>이메일</label>
                        <input type="email" id="adminEmail" class="form-control" required autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label>비밀번호</label>
                        <input type="password" id="adminPw" class="form-control" required autocomplete="current-password">
                    </div>
                    <button type="submit" class="btn-primary btn-block">로그인</button>
                    <button type="button" onclick="closeAdminAuthModal()" class="btn-secondary btn-block" style="margin-top:10px;">취소</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeAdminAuthModal() {
    const modal = document.getElementById("adminAuthModal");
    if(modal) modal.remove();
}

async function handleAdminLogin(e) {
    if(e) e.preventDefault();
    
    const emailInput = document.getElementById("adminEmail");
    const pwInput = document.getElementById("adminPw");
    
    if(!emailInput || !pwInput) {
        console.error("입력 필드를 찾을 수 없습니다.");
        return;
    }
    
    const email = emailInput.value.trim();
    const pw = pwInput.value;
    
    if(!email || !pw) {
        alert("이메일과 비밀번호를 입력하세요.");
        return;
    }
    
    showLoadingIndicator("로그인 중...");
    
    try {
    const userCredential = await auth.signInWithEmailAndPassword(email, pw);
    console.log("✅ 인증 성공:", userCredential.user.email);
    
    // ✅ Firebase에 관리자 플래그 저장
    const uid = userCredential.user.uid;
    await db.ref(`users/${uid}`).update({
       isAdmin: true,
       lastAdminLogin: Date.now()
   });
   
   // ✅ 쿠키 방식 완전 제거 — DB만 사용
   // ❌ 제거됨: setCookie("is_admin", "true", 365);
   _cachedAdminStatus = null; // 캐시 무효화
   await isAdminAsync();      // 즉시 DB에서 재확인
   
   hideLoadingIndicator();
   closeAdminAuthModal();
   
   alert("✅ 관리자 로그인 성공!");
        
        setTimeout(() => {
            location.reload();
        }, 500);
        
    } catch(err) {
        hideLoadingIndicator();
        console.error("❌ 로그인 실패:", err);
        
        let errorMsg = "로그인 실패: ";
        switch(err.code) {
            case 'auth/user-not-found':
                errorMsg += "존재하지 않는 계정입니다.";
                break;
            case 'auth/wrong-password':
                errorMsg += "비밀번호가 올바르지 않습니다.";
                break;
            case 'auth/invalid-email':
                errorMsg += "이메일 형식이 올바르지 않습니다.";
                break;
            case 'auth/too-many-requests':
                errorMsg += "너무 많은 시도가 있었습니다. 잠시 후 다시 시도하세요.";
                break;
            default:
                errorMsg += err.message;
        }
        
        alert(errorMsg);
    }
}

window.openAdminAuthModal = openAdminAuthModal;
window.closeAdminAuthModal = closeAdminAuthModal;
window.handleAdminLogin = handleAdminLogin;

// 알림 전송 함수
async function sendNotification(type, data) {
    console.log("📤 알림 전송 시작:", type, data);
    
    try {
        let targetUsers = [];
        
        const usersSnapshot = await db.ref("users").once("value");
        const usersData = usersSnapshot.val() || {};
        
        if (type === 'article') {
            const authorEmailKey = btoa(data.authorEmail).replace(/=/g, '');
            
            Object.entries(usersData).forEach(([uid, userData]) => {
                if(userData.notificationsEnabled !== false) {
                    const following = userData.following || {};
                    if(following[authorEmailKey]) {
                        targetUsers.push(uid);
                    }
                }
            });
        } 
        else if (type === 'myArticleComment') {
            Object.entries(usersData).forEach(([uid, userData]) => {
                if(userData.email === data.articleAuthorEmail && userData.notificationsEnabled !== false) {
                    targetUsers.push(uid);
                }
            });
        }
        
        if(targetUsers.length === 0) {
            console.log("🔭 알림 받을 대상이 없습니다");
            return;
        }
        
        const timestamp = Date.now();
        const updates = {};
        
        const notificationData = {
            type: type,
            timestamp: timestamp,
            read: false,
            articleId: data.articleId
        };
        
        if(type === 'article') {
            notificationData.title = '📰 새 기사';
            notificationData.text = `${data.authorName}님이 새 기사를 작성했습니다: "${data.title}"`;
        } else if(type === 'myArticleComment') {
            notificationData.title = '💭 내 기사에 새 댓글';
            notificationData.text = `${data.commenterName}님이 당신의 기사에 댓글을 남겼습니다: "${data.content.substring(0, 50)}..."`;
        }
        
        targetUsers.forEach(uid => {
            const notifId = `notif_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
            updates[`notifications/${uid}/${notifId}`] = notificationData;
        });
        
        await db.ref().update(updates);
        console.log(`✅ ${targetUsers.length}개의 알림 전송 완료`);
        
    } catch(error) {
        console.error("❌ 알림 전송 실패:", error);
    }
}

// 프로필 사진 생성 함수 (간소화)
async function createProfilePhoto(photoUrl, size) {
    if(!photoUrl) {
        return `<div style="width:${size}px; height:${size}px; border-radius:50%; background:#f1f3f4; display:inline-flex; align-items:center; justify-content:center; border:2px solid #dadce0;">
            <i class="fas fa-user" style="font-size:${size/2}px; color:#9aa0a6;"></i>
        </div>`;
    }
    
    return `<img src="${photoUrl}" style="width:${size}px; height:${size}px; min-width:${size}px; min-height:${size}px; border-radius:50%; object-fit:cover; object-position:center; border:2px solid #dadce0; flex-shrink:0; image-rendering:auto; -webkit-transform:translateZ(0); transform:translateZ(0);">`;
}

// 프로필 드롭다운 토글
function toggleProfileMenu() {
    const dropdown = document.getElementById("profileDropdown");
    const isActive = dropdown.classList.contains("active");
    
    if (isActive) {
        dropdown.classList.remove("active");
    } else {
        updateProfileDropdown();
        dropdown.classList.add("active");
    }
}

async function updateProfileDropdown() {
    const content = document.getElementById("profileDropdownContent");
    const user = auth.currentUser;
    
    if(!content) return;
    
    if(user) {
        try {
            const snapshot = await db.ref("users/" + user.uid).once("value");
            const userData = snapshot.val() || {};
            
            const photoUrl = userData.profilePhoto || null;
            const profilePhotoHTML = await createProfilePhoto(photoUrl, 48);
            
            content.innerHTML = `
                <div class="profile-info">
                    <div style="cursor:pointer;" onclick="openProfilePhotoModal()">
                        ${profilePhotoHTML}
                    </div>
                    <div class="profile-details">
                        <h4 style="color:#000; font-weight:700;">${getNickname()}</h4>
                        <p>${user.email}</p>
                    </div>
                </div>
                
                <button onclick="openProfilePhotoModal(); event.stopPropagation();" class="btn-block" style="background:#fff; border:1px solid #ddd; color:#333; text-align:left; padding:10px; margin-bottom:8px;">
                    <i class="fas fa-camera" style="margin-right:8px;"></i> 프로필 사진 변경
                </button>
                
                <button onclick="logoutAdmin()" class="btn-block" style="background:#fff; border:1px solid #ddd; color:#333; text-align:left; padding:10px;">
                    <i class="fas fa-sign-out-alt" style="margin-right:8px;"></i> 로그아웃
                </button>
            `;
        } catch(error) {
            console.error("프로필 드롭다운 로드 실패:", error);
            content.innerHTML = '<p style="padding:15px; color:#f44336; text-align:center;">로드 실패</p>';
        }
    } else {
        content.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <p style="margin-bottom:15px; color:#5f6368;">로그인이 필요합니다</p>
                <button onclick="googleLogin()" class="btn-primary btn-block">Google 로그인</button>
            </div>
        `;
    }
}

// 외부 클릭 시 드롭다운 닫기
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById("profileDropdown");
    const profileBtn = document.getElementById("headerProfileBtn");
    
    if (dropdown && profileBtn) {
        if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove("active");
        }
    }
});

// 닉네임 변경
async function changeNickname() {
    const user = auth.currentUser;
    if(!user) return alert("로그인이 필요합니다!");
    
    const nicknameChangeSnapshot = await db.ref("users/" + user.uid + "/nicknameChanged").once("value");
    const hasChangedNickname = nicknameChangeSnapshot.val() || false;
    
    if(hasChangedNickname) {
        return alert("닉네임은 1번만 변경할 수 있습니다. 이미 변경 기회를 사용하셨습니다.");
    }
    
    const currentNickname = getNickname();
    const newNickname = prompt(`현재 닉네임: ${currentNickname}\n\n새로운 닉네임을 입력하세요 (2-20자):`);
    
    if(!newNickname) return;
    
    const trimmed = newNickname.trim();
    if(trimmed.length < 2 || trimmed.length > 20) {
        return alert("닉네임은 2자 이상 20자 이하여야 합니다!");
    }
    
    if(trimmed === currentNickname) {
        return alert("현재 닉네임과 동일합니다!");
    }
    
    const foundWord = checkBannedWords(trimmed);
    if (foundWord) {
        alert("금지어가 포함된 닉네임은 사용할 수 없습니다.");
        return;
    }
    
    if(!confirm(`정말 닉네임을 "${trimmed}"로 변경하시겠습니까?\n\n⚠️ 닉네임은 1번만 변경할 수 있습니다!`)) {
        return;
    }
    
    try {
        showLoadingIndicator("닉네임 변경 중...");
        
        await user.updateProfile({
            displayName: trimmed
        });
        
        await db.ref("users/" + user.uid).update({
            nicknameChanged: true,
            newNickname: trimmed,
            oldNickname: currentNickname,
            changedAt: new Date().toLocaleString()
        });
        
        await updateUserContentNickname(currentNickname, trimmed, user.email);
        
        hideLoadingIndicator();
        alert("닉네임이 성공적으로 변경되었습니다!");
        
        globalCache.users.clear();
        
        location.reload();
    } catch(error) {
        hideLoadingIndicator();
        alert("닉네임 변경 실패: " + error.message);
        console.error(error);
    }
}

async function updateUserContentNickname(oldNickname, newNickname, userEmail) {
    const updates = {};
    
    const articlesSnapshot = await db.ref("articles").once("value");
    const articlesData = articlesSnapshot.val() || {};
    
    Object.entries(articlesData).forEach(([id, article]) => {
        if(article.author === oldNickname && article.authorEmail === userEmail) {
            updates[`articles/${id}/author`] = newNickname;
        }
    });
    
    const commentsSnapshot = await db.ref("comments").once("value");
    const commentsData = commentsSnapshot.val() || {};
    
    Object.entries(commentsData).forEach(([articleId, articleComments]) => {
        Object.entries(articleComments).forEach(([commentId, comment]) => {
            if(comment.author === oldNickname && comment.authorEmail === userEmail) {
                updates[`comments/${articleId}/${commentId}/author`] = newNickname;
            }
        });
    });
    
    if(Object.keys(updates).length > 0) {
        await db.ref().update(updates);
    }
}

console.log("✅ Part 3 프로필 관리 완료");

// ===== Part 4: 알림 시스템 (간소화) =====

// ===================================================
// ⚠️ script.js 의 registerFCMToken 함수를 아래로 교체하세요
// ===================================================

let _fcmRegistering = false;
let _fcmRegistered = false;

async function registerFCMToken() {
    console.log('📱 FCM 토큰 등록 시작...');

    if (_fcmRegistering) {
        console.log('⏳ FCM 등록 이미 진행 중 - 중복 실행 방지');
        return;
    }
    if (_fcmRegistered) {
        console.log('✅ FCM 토큰 이미 등록됨 - 건너뜀');
        return;
    }
    _fcmRegistering = true;

    // 1. 브라우저 지원 확인
    if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Worker 미지원 브라우저');
        return;
    }
    if (!('Notification' in window)) {
        console.warn('⚠️ 알림 미지원 브라우저');
        return;
    }

    // 2. 로그인 확인
    if (!isLoggedIn()) {
        console.log('ℹ️ 비로그인 상태 - FCM 등록 건너뜀');
        return;
    }

    // 3. messaging 초기화 대기 (최대 10초)
    let attempts = 0;
    while (!window.messaging && attempts < 50) {
        await new Promise(r => setTimeout(r, 200));
        attempts++;
    }
    if (!window.messaging) {
        console.warn('⚠️ Firebase Messaging 초기화 실패 - FCM 등록 불가');
        return;
    }

    try {
        // 4. 알림 권한 확인/요청
        let permission = Notification.permission;
        console.log('🔔 현재 알림 권한:', permission);

        if (permission === 'default') {
            permission = await Notification.requestPermission();
            console.log('🔔 권한 요청 결과:', permission);
        }

        if (permission !== 'granted') {
            console.log('❌ 알림 권한 거부됨 - FCM 토큰 등록 불가');
            return;
        }

        // 5. Service Worker 준비 대기
        const swRegistration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker 준비:', swRegistration.scope);

        // 6. FCM 토큰 가져오기
        const token = await window.messaging.getToken({
            vapidKey: 'BFJBBAv_qOw_aklFbE89r_cuCArMJkMK56Ryj9M1l1a3qv8CuHCJ-fKALtOn4taF7Pjwo2bjfoOuewEKBqRBtCo',
            serviceWorkerRegistration: swRegistration
        });

        if (!token) {
            console.warn('⚠️ FCM 토큰을 가져올 수 없습니다');
            return;
        }

        console.log('📱 FCM 토큰 획득 완료 (앞 30자):', token.substring(0, 30) + '...');

        // 7. DB에 저장 (이미 저장된 토큰인지 확인)
        const uid = getUserId();
        const tokenKey = btoa(token).substring(0, 20).replace(/[^a-zA-Z0-9]/g, '');

        // ✅ 항상 set()으로 덮어씀 (토큰이 서버에서 삭제된 경우도 복구됨)
        await db.ref(`users/${uid}/fcmTokens/${tokenKey}`).set({
            token: token,
            createdAt: Date.now(),
            lastSeen: Date.now(),
            userAgent: navigator.userAgent.substring(0, 100),
            browser: getBrowserInfo()
        });
        console.log('✅ FCM 토큰 저장/갱신 완료');
        _fcmRegistered = true;

        // 8. notificationsEnabled 확인 및 자동 활성화
        const userSnap = await db.ref(`users/${uid}/notificationsEnabled`).once('value');
        if (userSnap.val() === null) {
            // 처음 등록 시 자동으로 활성화
            await db.ref(`users/${uid}`).update({ notificationsEnabled: true });
            console.log('✅ 알림 자동 활성화');
        }

    } catch (error) {
        console.error('❌ FCM 토큰 등록 실패:', error.code, error.message);

        // 흔한 오류 안내
        if (error.code === 'messaging/permission-blocked') {
            console.warn('💡 브라우저 설정에서 이 사이트의 알림을 허용해주세요.');
        } else if (error.code === 'messaging/unsupported-browser') {
            console.warn('💡 이 브라우저는 웹 푸시를 지원하지 않습니다.');
        }
    } finally {
        _fcmRegistering = false;
    }
}

// ===================================================
// ⚠️ firebase-messaging-sw.js 파일을 아래 내용으로 만들거나 교체하세요
//    (루트 경로에 위치해야 합니다)
// ===================================================
/*
파일명: firebase-messaging-sw.js
경로: / (루트, index.html과 같은 위치)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDgooYtVr8-jm15-fx_WvGLCDxonLpNPuU",
  authDomain: "hsj-news.firebaseapp.com",
  databaseURL: "https://hsj-news-default-rtdb.firebaseio.com",
  projectId: "hsj-news",
  storageBucket: "hsj-news.firebasestorage.app",
  messagingSenderId: "437842430700",
  appId: "1:437842430700:web:e3822bde4cfecdc04633c9"
});

const messaging = firebase.messaging();

// 백그라운드 메시지 수신
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 백그라운드 메시지:', payload);

  const title = payload.data?.title || payload.notification?.title || '📰 해정뉴스';
  const body  = payload.data?.body  || payload.data?.text || payload.notification?.body || '새로운 알림';
  const link  = payload.data?.articleId
    ? `https://fff376327yhed.github.io/hsj_news.io/?page=article&id=${payload.data.articleId}`
    : 'https://fff376327yhed.github.io/hsj_news.io/';

  self.registration.showNotification(title, {
    body:    body,
    icon:    '/favicon/android-icon-192x192.png',
    badge:   '/favicon/favicon-16x16.png',
    tag:     payload.data?.notificationId || 'hsj-news',
    renotify: true,
    data:    { link }
  });
});

// 알림 클릭 시 해당 페이지 열기
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || 'https://fff376327yhed.github.io/hsj_news.io/';
  event.waitUntil(clients.openWindow(link));
});
*/

// 브라우저 정보 가져오기 (옵션)
function getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
}

function getDeviceType() {
    const ua = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
        if (/iPad/i.test(ua)) return '태블릿';
        return '모바일';
    }
    return 'PC';
}

function getOSInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown';
}

// ✅ 오류 Firebase에 저장
async function logErrorToFirebase(errorInfo) {
    try {
        const user = auth?.currentUser;
        const nav  = window.navigator;
        const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

        const logEntry = {
            message:       errorInfo.message || '알 수 없는 오류',
            stack:         (errorInfo.stack || '').substring(0, 3000),
            type:          errorInfo.type || 'runtime',
            level:         errorInfo.level || 'error',  // 'error' | 'warn'
            page:          window.location.href,
            referrer:      document.referrer || '-',
            timestamp:     Date.now(),
            uid:           user ? user.uid : 'anonymous',
            email:         user ? (user.email || '이메일 없음') : '비로그인',
            device:        getDeviceType(),
            browser:       getBrowserInfo(),
            os:            getOSInfo(),
            userAgent:     nav.userAgent.substring(0, 300),
            screenSize:    `${window.screen.width}x${window.screen.height}`,
            viewport:      `${window.innerWidth}x${window.innerHeight}`,
            language:      nav.language || '-',
            online:        nav.onLine,
            networkType:   conn ? (conn.effectiveType || conn.type || '-') : '-',
            memoryMB:      window.performance?.memory
                ? Math.round(window.performance.memory.usedJSHeapSize / 1048576)
                : null,
            context:       errorInfo.context || null,   // 추가 컨텍스트 (선택)
        };
        await db.ref('errorLogs').push(logEntry);
    } catch (e) {
        // 로깅 자체 실패는 무시
    }
}

// ✅ 전역 오류 자동 감지
window.onerror = function(message, source, lineno, colno, error) {
    // ✅ 크로스오리진 CDN 스크립트 에러는 "Script error." 메시지만 오고 정보가 없음 → 무시
    if (message === 'Script error.' && lineno === 0 && colno === 0) return true;
    // ✅ Service worker referrer 에러도 필터
    if (source && source.includes('firebase-messaging-sw')) return true;
    logErrorToFirebase({
        message: message,
        stack: error?.stack || `${source} ${lineno}:${colno}`,
        type: 'uncaught'
    });
    return false;
};

window.onunhandledrejection = function(event) {
    logErrorToFirebase({
        message: event.reason?.message || String(event.reason) || 'Promise rejection',
        stack: event.reason?.stack || '',
        type: 'unhandledrejection',
        level: 'error'
    });
};

// ✅ console.warn 가로채서 경고도 로그에 기록
(function interceptConsole() {
    const _warn = console.warn.bind(console);
    console.warn = function (...args) {
        _warn(...args);
        const msg = args.map(a => {
            try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
            catch { return String(a); }
        }).join(' ');
        // Firebase 내부 경고 등 노이즈 필터링
        if (msg.includes('@firebase') || msg.includes('FIREBASE WARNING')) return;
        // ✅ 알 수 없는 페이지는 라우터가 이미 처리 — 에러로 기록 불필요
        if (msg.startsWith('알 수 없는 페이지:')) return;
        try {
            const stack = new Error().stack || '';
            logErrorToFirebase({ message: msg, stack, type: 'console.warn', level: 'warn' });
        } catch {}
    };
})();

// 포그라운드 메시지 수신 핸들러
if (messaging) {
    messaging.onMessage((payload) => {
        console.log('📨 포그라운드 메시지 수신:', payload);
        
        const title = payload.data?.title || payload.notification?.title || '📰 해정뉴스';
        const body = payload.data?.body || payload.data?.text || payload.notification?.body || '새로운 알림';
        const articleId = payload.data?.articleId || null;
        
        showToastNotification(title, body, articleId);
    });
}

// ===== 기존 setupNotificationListener 함수 수정 =====
let notificationListenerActive = false;

function setupNotificationListener(uid) {
    if (!uid || notificationListenerActive) return;
    
    // ✅ registerFCMToken()을 여기서 호출하지 않음
    // onAuthStateChanged에서 직접 호출하므로 중복/누락 없이 항상 실행됨
    
    db.ref("notifications/" + uid).off();
    
    const shownNotifications = new Set();
    const pageLoadTime = Date.now();
    
    db.ref("notifications/" + uid)
        .orderByChild("read")
        .equalTo(false)
        .on("child_added", (snapshot) => {
            const notification = snapshot.val();
            const notifId = snapshot.key;
            
            if (shownNotifications.has(notifId)) return;
            if (notification.timestamp < pageLoadTime) return;
            
            if (!notification.read) {
                shownNotifications.add(notifId);
                showToastNotification(notification.title, notification.text, notification.articleId);
                
                setTimeout(() => {
                    db.ref("notifications/" + uid + "/" + notifId).remove();
                }, 5000);
            }
        });
    
    notificationListenerActive = true;
}

// ✅ 알림 전송 함수 (알림 타입 설정 반영)
async function sendNotification(type, data) {
    console.log("📤 알림 전송:", type, data);
    
    try {
        let targetUsers = [];
        const usersSnapshot = await db.ref("users").once("value");
        const usersData = usersSnapshot.val() || {};
        
        if (type === 'article') {
            const authorUid    = Object.keys(usersData).find(id => usersData[id]?.email === data.authorEmail);
            const articleCat   = data.category || '';

            Object.entries(usersData).forEach(([uid, userData]) => {
                if (!userData) return; // ✅ null 유저 방어
                if(userData.notificationsEnabled === false) return;
                if(userData.email === data.authorEmail) return;

                const types = userData.notificationTypes || {};
                if(types.article === false) return;

                const filterUsers = types.articleFilterUsers || null;
                if(filterUsers !== null && authorUid && filterUsers[authorUid] === false) return;

                const filterCats = types.articleFilterCategories || null;
                if(filterCats !== null && articleCat && filterCats[articleCat] === false) return;

                targetUsers.push(uid);
            });
        } 
        else if (type === 'myArticleComment') {
            const commenterUid = Object.keys(usersData).find(id => usersData[id]?.email === data.commenterEmail);
            const articleCat   = data.articleCategory || '';

            Object.entries(usersData).forEach(([uid, userData]) => {
                if (!userData) return; // ✅ null 유저 방어
                if(userData.email !== data.articleAuthorEmail) return;
                if(userData.notificationsEnabled === false) return;

                const types = userData.notificationTypes || {};
                if(types.comment === false) return;

                const filterUsers = types.commentFilterUsers || null;
                if(filterUsers !== null && commenterUid && filterUsers[commenterUid] === false) return;

                const filterCats = types.commentFilterCategories || null;
                if(filterCats !== null && articleCat && filterCats[articleCat] === false) return;

                targetUsers.push(uid);
            });
        }
        else if (type === 'replyToComment') {
            Object.entries(usersData).forEach(([uid, userData]) => {
                if (!userData) return; // ✅ null 유저 방어
                if(userData.email !== data.targetEmail) return;
                if(userData.notificationsEnabled === false) return;
                const types = userData.notificationTypes || {};
                if(types.comment === false) return;
                targetUsers.push(uid);
            });
        }
        else if (type === 'replyToReply') {
            Object.entries(usersData).forEach(([uid, userData]) => {
                if (!userData) return; // ✅ null 유저 방어
                if(userData.email !== data.targetEmail) return;
                if(userData.notificationsEnabled === false) return;
                const types = userData.notificationTypes || {};
                if(types.comment === false) return;
                targetUsers.push(uid);
            });
        }
        
        if(targetUsers.length === 0) {
            console.log("🔭 알림 받을 대상이 없습니다");
            return;
        }
        
        const timestamp = Date.now();
        const updates = {};

        let notifTitle, notifText;
        if (type === 'article') {
            const authorDisplay = data.anonymous ? '익명 유저' : data.authorName;
            notifTitle = '📰 새 기사';
            notifText  = `${authorDisplay}님이 새 기사를 작성했습니다: "${data.title}"`;
        } else if (type === 'myArticleComment') {
            const commenterDisplay = data.anonymous ? '익명 유저' : data.commenterName;
            notifTitle = '💬 내 기사에 새 댓글';
            notifText  = `${commenterDisplay}님이 댓글을 남겼습니다: "${(data.content || '').substring(0, 50)}"`;
        } else if (type === 'replyToComment') {
            const replierDisplay = data.anonymous ? '익명 유저' : data.replierName;
            notifTitle = '↩️ 내 댓글에 답글';
            notifText  = `${replierDisplay}님이 답글을 달았습니다: "${(data.content || '').substring(0, 50)}"`;
        } else if (type === 'replyToReply') {
            const replierDisplay2 = data.anonymous ? '익명 유저' : data.replierName;
            notifTitle = '↩️ 내 답글에 대댓글';
            notifText  = `${replierDisplay2}님이 대댓글을 달았습니다: "${(data.content || '').substring(0, 50)}"`;
        } else {
            notifTitle = '🔔 알림';
            notifText  = '';
        }

        const notificationData = {
            type: type,
            timestamp: timestamp,
            read: false,
            pushed: false,
            articleId: data.articleId || '',
            title: notifTitle,
            text:  notifText
        };
        
        targetUsers.forEach(uid => {
            const notifId = `notif_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
            updates[`notifications/${uid}/${notifId}`] = notificationData;
        });
        
        await db.ref().update(updates);
        console.log(`✅ ${targetUsers.length}개의 알림 DB 저장 완료`);
        
    } catch(error) {
        // ✅ PERMISSION_DENIED면 Firebase Rules 문제임을 명확히 로그
        if (error.code === 'PERMISSION_DENIED' || (error.message && error.message.includes('permission_denied'))) {
            console.error("🚫 알림 전송 권한 없음 — Firebase Rules의 notifications.$uid.write 를 'auth != null'로 변경해야 합니다:", error.message);
        } else {
            console.error("❌ 알림 전송 실패:", error);
        }
    }
}

// ✅ 프로필 사진 생성 (간소화)
async function createProfilePhoto(photoUrl, size) {
    if(!photoUrl) {
        return `<div style="width:${size}px; height:${size}px; border-radius:50%; background:#f1f3f4; display:inline-flex; align-items:center; justify-content:center; border:2px solid #dadce0;">
            <i class="fas fa-user" style="font-size:${size/2}px; color:#9aa0a6;"></i>
        </div>`;
    }
    return `<img src="${photoUrl}" style="width:${size}px; height:${size}px; min-width:${size}px; min-height:${size}px; border-radius:50%; object-fit:cover; object-position:center; border:2px solid #dadce0; flex-shrink:0; image-rendering:auto; -webkit-transform:translateZ(0); transform:translateZ(0);">`;
}

    // ✅ 알림 리스너 시작
function startNotificationListener(uid) {
    db.ref("notifications/" + uid).off();
    
    const shownNotifications = new Set();
    const pageLoadTime = Date.now();
    
    db.ref("notifications/" + uid)
        .orderByChild("read")
        .equalTo(false)
        .on("child_added", (snapshot) => {
            const notification = snapshot.val();
            const notifId = snapshot.key;
            
            if (shownNotifications.has(notifId)) return;
            if (notification.timestamp < pageLoadTime) return;
            
            if (!notification.read) {
                shownNotifications.add(notifId);
                showToastNotification(notification.title, notification.text, notification.articleId);
                
                setTimeout(() => {
                    db.ref("notifications/" + uid + "/" + notifId).remove();
                }, 5000);
            }
        });

        notificationListenerActive = true;
}



console.log("✅ Part 4 알림 시스템 완료");

// ===== Part 5: 인증 상태 관리 (간소화) =====

  auth.onAuthStateChanged(async user => {
    console.log("🔐 인증 상태:", user ? user.email : "로그아웃");
    _authReadyResolve(); // ✅ 인증 초기화 완료 신호
    
    _cachedAdminStatus = null;
    _adminCacheTime = 0;
    
    if (user) {
        // ✅ 로그인 시 프로필 사진 캐시 초기화 (인증 전 null 캐시 제거)
        if (window.profilePhotoCache) window.profilePhotoCache.clear();

        // ✅ [BUG FIX] 로딩 인디케이터를 await 전에 먼저 표시
        showLoadingIndicator("로그인 확인 중...");

        await isAdminAsync();

        const userRef = db.ref("users/" + user.uid);
        const snap = await userRef.once("value");
        let data = snap.val() || {};
        
        if (!data.email) {
            await userRef.update({
                email: user.email,
                createdAt: Date.now()
            });
        }
        
        if (data.isBanned) {
            // ✅ [BUG FIX] await signOut + 재로그인 방지 플래그
            // 기존: auth.signOut() 비동기 무시 → onAuthStateChanged(null) 즉시 발동
            //       → "로그인이 필요합니다" UI 표시 → 유저가 반복 로그인 시도 → 루프
            _isBannedUser = true;
            hideLoadingIndicator();
            await auth.signOut();
            // 차단 화면 렌더링 (설정 섹션을 직접 덮어씀)
            const el = document.getElementById("profileNickname");
            if (el) {
                el.innerHTML = `<div style="background:#fff3f3;border:2px solid #c62828;border-radius:12px;padding:24px;text-align:center;">
                    <div style="font-size:48px;margin-bottom:12px;">🚫</div>
                    <div style="font-size:18px;font-weight:800;color:#c62828;margin-bottom:8px;">계정이 차단되었습니다</div>
                    <div style="font-size:14px;color:#666;line-height:1.6;">관리자에게 문의하세요.<br><small style="color:#aaa;">이 계정으로는 로그인할 수 없습니다.</small></div>
                </div>`;
            }
            alert("🚫 차단된 계정입니다. 관리자에게 문의하세요.");
            return;
        }

        setupNotificationListener(user.uid);
        _fcmRegistered = false; // 로그인마다 재등록 허용
        registerFCMToken(); // ✅ 로그인마다 FCM 토큰 갱신

        // ✅ 타이밍 문제로 첫 등록 실패한 경우 탭 포커스 시 재시도
        // ✅ [BUG FIX] onAuthStateChanged가 여러 번 호출될 때 리스너 중복 등록 방지
        if (!window._fcmVisibilityListenerAdded) {
            window._fcmVisibilityListenerAdded = true;
            document.addEventListener('visibilitychange', function _fcmRetryOnVisible() {
                if (document.visibilityState === 'visible' && !_fcmRegistered && isLoggedIn()) {
                    console.log('👁️ 탭 포커스 복귀 - FCM 등록 재시도');
                    registerFCMToken();
                }
            });
        }

        updateHeaderProfileButton(user);
        updateLastSeen();
        
        hideLoadingIndicator();
        
        if (!sessionStorage.getItem('login_shown')) {
            showToastNotification("✅ 로그인 완료", `환영합니다, ${getNickname()}님!`, null);
            sessionStorage.setItem('login_shown', 'true');
        }
    } else {
        // ✅ 로그아웃 처리 (기존코드는 if(user) 안에 중첩돼 절대 실행 안 됐음)
        notificationListenerActive = false;
        const headerBtn = document.getElementById("headerProfileBtn");
        if (headerBtn) {
            headerBtn.innerHTML = `<i class="fas fa-user-circle"></i>`;
        }
    }

    updateSettings();
    
    if (document.getElementById("articlesSection")?.classList.contains("active")) {
        searchArticles(false);
    }
});

// ✅ 팔로우 사용자 로드
async function loadFollowUsers() {
    if(!isLoggedIn()) return;
    
    const followSection = document.getElementById("followUsersSection");
    if(!followSection) return;
    
    followSection.innerHTML = '<p style="text-align:center;color:#868e96;">로딩 중...</p>';
    
    const currentEmail = getUserEmail();
    const uid = getUserId();
    
    const [articlesSnapshot, followSnapshot] = await Promise.all([
        db.ref("articles").once("value"),
        db.ref("users/" + uid + "/following").once("value")
    ]);
    
    const articlesData = articlesSnapshot.val() || {};
    const articles = Object.values(articlesData);
    const followingData = followSnapshot.val() || {};
    
    const usersMap = new Map();
    
    articles.forEach(article => {
        if(article.author && article.author !== "익명" && 
           article.authorEmail && article.authorEmail !== currentEmail) {
            if(!usersMap.has(article.authorEmail)) {
                usersMap.set(article.authorEmail, {
                    nickname: article.author,
                    email: article.authorEmail
                });
            }
        }
    });
    
    if(usersMap.size === 0) {
        followSection.innerHTML = '<p style="text-align:center;color:#868e96;font-size:13px;margin-top:15px;">팔로우 가능한 사용자가 없습니다.</p>';
        return;
    }
    
    const usersList = Array.from(usersMap.values());
    
    followSection.innerHTML = `
        <div style="border-top:1px solid #eee;padding-top:15px;margin-top:15px;">
            <h4 style="margin:0 0 12px 0;color:#202124;font-size:14px;">👥 알림 받을 사용자 선택</h4>
            <div style="max-height:200px;overflow-y:auto;">
                ${usersList.map(u => {
                    const emailKey = btoa(u.email).replace(/=/g, '');
                    const isFollowing = followingData[emailKey] ? true : false;
                    return `
                        <label style="display:flex;align-items:center;padding:8px;background:#f8f9fa;border-radius:4px;margin-bottom:6px;cursor:pointer;">
                            <input type="checkbox" 
                                   ${isFollowing ? 'checked' : ''} 
                                   onchange="toggleFollowUser('${u.email}', this.checked)"
                                   style="margin-right:10px;">
                            <span style="flex:1;color:#333;">${u.nickname}</span>
                            <small style="color:#868e96;">${u.email}</small>
                        </label>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// ✅ 팔로우 토글
async function toggleFollowUser(userEmail, isFollowing) {
    if(!isLoggedIn()) return;
    
    const uid = getUserId();
    const emailKey = btoa(userEmail).replace(/=/g, '');
    
    if(isFollowing) {
        await db.ref("users/" + uid + "/following/" + emailKey).set(userEmail);
    } else {
        await db.ref("users/" + uid + "/following/" + emailKey).remove();
    }
}

// ✅ 설정 업데이트
async function updateSettings() {
    const el = document.getElementById("profileNickname");
    if (!el) return;
    
    const user = auth.currentUser;
    
    if(user) {
        try {
            const [nicknameSnapshot, userSnapshot] = await Promise.all([
                db.ref("users/" + user.uid + "/nicknameChanged").once("value"),
                db.ref("users/" + user.uid).once("value")
            ]);
            
            const hasChangedNickname = nicknameSnapshot.val() || false;
            const userData = userSnapshot.val() || {};
            const warningCount = userData.warningCount || 0;
            const notificationsEnabled = userData.notificationsEnabled !== false;
            
            const photoUrl = userData.profilePhoto || null;
            const profilePhotoHTML = await createProfilePhoto(photoUrl, 120);
            
            el.innerHTML = `
                <div style="background:#fff; border:1px solid #dadce0; padding:20px; border-radius:8px; margin-bottom:20px;">
                    <h4 style="margin:0 0 15px 0; color:#202124;">내 정보</h4>
                    
                    <div style="text-align:center; margin-bottom:20px;">
                        <div id="userProfilePhotoPreview" style="margin-bottom:15px;">
                            ${profilePhotoHTML}
                        </div>
                        <button onclick="openProfilePhotoModal()" class="btn-secondary" style="font-size:13px;">
                            <i class="fas fa-camera"></i> 프로필 사진 변경
                        </button>
                    </div>
                    
                    <p style="margin:8px 0; color:#5f6368;"><strong>이름:</strong> ${user.displayName || getNickname() || '미설정'}</p>
                    <p style="margin:8px 0; color:#5f6368;"><strong>이메일:</strong> ${user.email || '미설정'}</p>
                    ${warningCount > 0 ? `<p style="margin:8px 0; color:#d93025;"><strong>⚠️ 경고:</strong> ${warningCount}회</p>` : ''}
                    ${hasChangedNickname ? 
                        '<p style="margin:8px 0; color:#9aa0a6; font-size:13px;">닉네임 변경 완료됨</p>' : 
                        '<button onclick="changeNickname()" class="btn-block" style="margin-top:15px; background:#fff; border:1px solid #dadce0;">닉네임 변경 (1회)</button>'
                    }
                </div>
            `;
            
            const notificationToggle = document.getElementById("notificationToggle");
            if(notificationToggle) {
                notificationToggle.checked = notificationsEnabled;
                if(notificationsEnabled) {
                    document.getElementById("notificationStatus").innerHTML = '<p style="color:var(--success-color);margin-top:10px;">✅ 알림이 활성화되었습니다.</p>';
                }
                // 알림 타입 체크박스 로드
                await loadNotificationTypeSettings();
            }
        } catch(error) {
            console.error("설정 로드 오류:", error);
        }
    } else {
        el.innerHTML = `<div style="background:#fff; border:1px solid #dadce0; padding:20px; border-radius:8px; text-align:center;">
            <p style="color:#5f6368;">로그인이 필요합니다.</p>
            <button onclick="googleLogin()" class="btn-primary" style="width:100%; margin-top:15px;">Google 로그인</button>
        </div>`;
    }
    
    const adminIndicator = document.getElementById("adminModeIndicator");
if(adminIndicator) {
    if(isAdmin()) {
        adminIndicator.innerHTML = `
            <div style="background:#e8f0fe; border:1px solid #1967d2; padding:15px; border-radius:8px; margin:20px 0;">
                <h4 style="margin:0 0 10px 0; color:#1967d2;">🛡️ 관리자 모드 ON</h4>
                <button onclick="disableAdminMode()" class="btn-block" style="background:#fff; color:#1967d2; border:1px solid #1967d2;">모드 해제</button>
            </div>
        `;
    } else {
        adminIndicator.innerHTML = '';
    }
}

// ✅ 추가: 관리자 전용 조회수 관리 섹션 표시
const viewsSection = document.getElementById("viewsManagementSection");
if(viewsSection) {
    if(isAdmin()) {
        viewsSection.style.display = 'block';
    } else {
        viewsSection.style.display = 'none';
    }
}}

// ✅ 알림 토글
async function toggleNotifications() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    const isEnabled = document.getElementById("notificationToggle").checked;
    const statusDiv = document.getElementById("notificationStatus");
    const uid = getUserId();
    
    await db.ref("users/" + uid).update({
        notificationsEnabled: isEnabled
    });
    
    if(isEnabled) {
        statusDiv.innerHTML = '<p style="color:var(--success-color);margin-top:10px;">✅ 알림이 활성화되었습니다.</p>';
        setupNotificationListener(uid);
        await loadNotificationTypeSettings();
    } else {
        statusDiv.innerHTML = '<p style="color:var(--text-secondary);margin-top:10px;">알림이 비활성화되었습니다.</p>';
        const typeSection = document.getElementById("notificationTypeSection");
        if(typeSection) typeSection.innerHTML = '';
        db.ref("notifications/" + uid).off();
        notificationListenerActive = false;
    }
}

// ✅ 알림 타입 설정 로드 및 렌더링
async function loadNotificationTypeSettings() {
    if(!isLoggedIn()) return;
    const uid = getUserId();
    const section = document.getElementById("notificationTypeSection");
    if(!section) return;
    
    const snap = await db.ref("users/" + uid + "/notificationTypes").once("value");
    const types = snap.val() || {};
    
    const articleEnabled = types.article !== false;
    const commentEnabled = types.comment !== false;
    
    section.innerHTML = `
        <div style="background:#fff; border:1px solid #dadce0; padding:20px; border-radius:8px; margin-top:16px;">
            <h4 style="margin:0 0 14px 0; color:#202124; font-size:15px;">📋 알림 받을 항목</h4>
            
            <!-- 새 기사 알림 -->
            <div style="margin-bottom:10px;">
                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:#f8f9fa; border-radius:6px;">
                    <label style="display:flex; align-items:center; gap:12px; cursor:pointer; flex:1;">
                        <input type="checkbox" id="notifType_article"
                            ${articleEnabled ? 'checked' : ''}
                            onchange="saveNotificationTypes()"
                            style="width:18px; height:18px; cursor:pointer; accent-color:#c62828;">
                        <div>
                            <div style="font-weight:600; color:#202124;">📰 새 기사 알림</div>
                            <div style="font-size:12px; color:#5f6368; margin-top:2px;">누군가 새 기사를 올렸을 때</div>
                        </div>
                    </label>
                    <button onclick="toggleNotifDetail('article')" id="notifDetailBtn_article"
                        style="padding:5px 12px; font-size:12px; font-weight:600; border:1.5px solid #c62828;
                               background:white; color:#c62828; border-radius:5px; cursor:pointer; white-space:nowrap; margin-left:10px;"
                        onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">
                        자세히 ▾
                    </button>
                </div>
                <!-- 기사 알림 사용자 필터 패널 -->
                <div id="notifDetail_article" style="display:none; border:1.5px solid #e9ecef; border-top:none; border-radius:0 0 6px 6px; background:#fff; padding:12px;">
                    
                    <!-- ① 카테고리 필터 -->
                    <div style="margin-bottom:14px;">
                        <div style="font-size:12px; font-weight:700; color:#495057; margin-bottom:6px;">📂 카테고리 필터</div>
                        <div style="font-size:11px; color:#868e96; margin-bottom:8px;">체크한 카테고리의 새 기사만 알림을 받습니다. (기본: 전체 선택)</div>
                        <div style="display:flex; gap:6px; margin-bottom:8px;">
                            <button onclick="selectAllNotifCategoryFilter('article', true)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #c62828; background:white; color:#c62828; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">전체선택</button>
                            <button onclick="selectAllNotifCategoryFilter('article', false)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #dee2e6; background:white; color:#868e96; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">전체해제</button>
                        </div>
                        <div id="notifCategoryFilterList_article" style="display:flex; flex-wrap:wrap; gap:6px; padding:8px; border:1px solid #e9ecef; border-radius:6px; background:#fafafa;">
                            <div style="font-size:12px; color:#adb5bd;">불러오는 중...</div>
                        </div>
                    </div>

                    <hr style="border:none; border-top:1px solid #e9ecef; margin:0 0 12px 0;">

                    <!-- ② 사용자 필터 -->
                    <div>
                        <div style="font-size:12px; font-weight:700; color:#495057; margin-bottom:6px;">👤 사용자 필터</div>
                        <div style="font-size:11px; color:#868e96; margin-bottom:8px;">체크한 사용자가 <b>새 기사를 올릴 때만</b> 알림을 받습니다. (기본: 전체 선택)</div>
                        <div style="display:flex; gap:6px; margin-bottom:8px;">
                            <button onclick="selectAllNotifFilter('article', true)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #c62828; background:white; color:#c62828; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">전체선택</button>
                            <button onclick="selectAllNotifFilter('article', false)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #dee2e6; background:white; color:#868e96; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">전체해제</button>
                            <span style="margin-left:auto; font-size:11px; color:#adb5bd; align-self:center;">선택: <span id="notifFilterCount_article" style="font-weight:700; color:#adb5bd;">0</span>명</span>
                        </div>
                        <div id="notifFilterList_article" style="max-height:200px; overflow-y:auto; border:1px solid #e9ecef; border-radius:6px; padding:4px; background:#fafafa;">
                            <div style="padding:20px; text-align:center; color:#adb5bd; font-size:13px;">불러오는 중...</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 새 댓글 알림 -->
            <div>
                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:#f8f9fa; border-radius:6px;">
                    <label style="display:flex; align-items:center; gap:12px; cursor:pointer; flex:1;">
                        <input type="checkbox" id="notifType_comment"
                            ${commentEnabled ? 'checked' : ''}
                            onchange="saveNotificationTypes()"
                            style="width:18px; height:18px; cursor:pointer; accent-color:#c62828;">
                        <div>
                            <div style="font-weight:600; color:#202124;">💬 댓글 알림</div>
                            <div style="font-size:12px; color:#5f6368; margin-top:2px;">내 기사에 댓글이 달렸을 때</div>
                        </div>
                    </label>
                    <button onclick="toggleNotifDetail('comment')" id="notifDetailBtn_comment"
                        style="padding:5px 12px; font-size:12px; font-weight:600; border:1.5px solid #c62828;
                               background:white; color:#c62828; border-radius:5px; cursor:pointer; white-space:nowrap; margin-left:10px;"
                        onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">
                        자세히 ▾
                    </button>
                </div>
                <!-- 댓글 알림 사용자 필터 패널 -->
                <div id="notifDetail_comment" style="display:none; border:1.5px solid #e9ecef; border-top:none; border-radius:0 0 6px 6px; background:#fff; padding:12px;">

                    <!-- ① 카테고리 필터 -->
                    <div style="margin-bottom:14px;">
                        <div style="font-size:12px; font-weight:700; color:#495057; margin-bottom:6px;">📂 카테고리 필터</div>
                        <div style="font-size:11px; color:#868e96; margin-bottom:8px;">체크한 카테고리의 기사에 달린 댓글만 알림을 받습니다. (기본: 전체 선택)</div>
                        <div style="display:flex; gap:6px; margin-bottom:8px;">
                            <button onclick="selectAllNotifCategoryFilter('comment', true)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #c62828; background:white; color:#c62828; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">전체선택</button>
                            <button onclick="selectAllNotifCategoryFilter('comment', false)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #dee2e6; background:white; color:#868e96; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">전체해제</button>
                        </div>
                        <div id="notifCategoryFilterList_comment" style="display:flex; flex-wrap:wrap; gap:6px; padding:8px; border:1px solid #e9ecef; border-radius:6px; background:#fafafa;">
                            <div style="font-size:12px; color:#adb5bd;">불러오는 중...</div>
                        </div>
                    </div>

                    <hr style="border:none; border-top:1px solid #e9ecef; margin:0 0 12px 0;">

                    <!-- ② 사용자 필터 -->
                    <div>
                        <div style="font-size:12px; font-weight:700; color:#495057; margin-bottom:6px;">👤 사용자 필터</div>
                        <div style="font-size:11px; color:#868e96; margin-bottom:8px;">체크한 사용자가 <b>내 기사에 댓글을 달 때만</b> 알림을 받습니다. (기본: 전체 선택)</div>
                        <div style="display:flex; gap:6px; margin-bottom:8px;">
                            <button onclick="selectAllNotifFilter('comment', true)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #c62828; background:white; color:#c62828; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">전체선택</button>
                            <button onclick="selectAllNotifFilter('comment', false)" style="padding:3px 10px; font-size:11px; font-weight:600; border:1.5px solid #dee2e6; background:white; color:#868e96; border-radius:5px; cursor:pointer;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">전체해제</button>
                            <span style="margin-left:auto; font-size:11px; color:#adb5bd; align-self:center;">선택: <span id="notifFilterCount_comment" style="font-weight:700; color:#adb5bd;">0</span>명</span>
                        </div>
                        <div id="notifFilterList_comment" style="max-height:200px; overflow-y:auto; border:1px solid #e9ecef; border-radius:6px; padding:4px; background:#fafafa;">
                            <div style="padding:20px; text-align:center; color:#adb5bd; font-size:13px;">불러오는 중...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ✅ 알림 타입 설정 저장
window.saveNotificationTypes = async function() {
    if(!isLoggedIn()) return;
    const uid = getUserId();
    
    const articleEl = document.getElementById("notifType_article");
    const commentEl = document.getElementById("notifType_comment");
    
    const types = {
        article: articleEl ? articleEl.checked : true,
        comment: commentEl ? commentEl.checked : true
    };
    
    await db.ref("users/" + uid + "/notificationTypes").set(types);
    
    // 저장 피드백
    const statusDiv = document.getElementById("notificationStatus");
    if(statusDiv) {
        statusDiv.innerHTML = '<p style="color:var(--success-color);margin-top:10px;">✅ 알림 설정이 저장되었습니다.</p>';
        setTimeout(() => {
            statusDiv.innerHTML = '<p style="color:var(--success-color);margin-top:10px;">✅ 알림이 활성화되었습니다.</p>';
        }, 2000);
    }
    
   console.log("✅ 알림 타입 저장:", types);
};

// ✅ 알림 자세히 패널 토글
window.toggleNotifDetail = async function(type) {
    const panel = document.getElementById(`notifDetail_${type}`);
    const btn   = document.getElementById(`notifDetailBtn_${type}`);
    if(!panel) return;

    const isOpen = panel.style.display !== 'none';
    if(isOpen) {
        panel.style.display = 'none';
        btn.textContent = '자세히 ▾';
    } else {
        panel.style.display = 'block';
        btn.textContent = '닫기 ▴';
        // 사용자 필터 + 카테고리 필터 동시 로드
        await Promise.all([
            loadNotifFilterUsers(type),
            loadNotifCategoryFilter(type)
        ]);
    }
};

// ✅ 알림 필터 사용자 목록 불러오기 및 체크박스 렌더링
window.loadNotifFilterUsers = async function(type) {
    if(!isLoggedIn()) return;
    const uid = getUserId();
    const myEmail = getUserEmail();
    const listEl = document.getElementById(`notifFilterList_${type}`);
    if(!listEl) return;

    listEl.innerHTML = '<div style="padding:20px; text-align:center; color:#adb5bd; font-size:13px;">불러오는 중...</div>';

    const [usersSnap, filterSnap] = await Promise.all([
        db.ref("users").once("value"),
        db.ref(`users/${uid}/notificationTypes/${type}FilterUsers`).once("value")
    ]);

    const usersData   = usersSnap.val()  || {};
    const savedFilter = filterSnap.val() || null; // null = 미설정 (기본: 전체)

    // 이메일 기준 중복 제거
    const emailMap = new Map();
    Object.entries(usersData)
        .filter(([, d]) => d.email && d.email !== myEmail)
        .forEach(([id, d]) => {
            const existing = emailMap.get(d.email);
            if(!existing || (d.lastSeen || 0) > (existing.lastSeen || 0)) {
                emailMap.set(d.email, { uid: id, email: d.email,
                    nickname: d.newNickname || d.displayName || d.email.split('@')[0] });
            }
        });

    const users = Array.from(emailMap.values()).sort((a,b) => a.email.localeCompare(b.email));

    if(users.length === 0) {
        listEl.innerHTML = '<div style="padding:20px; text-align:center; color:#adb5bd; font-size:13px;">표시할 사용자가 없습니다.</div>';
        return;
    }

    listEl.innerHTML = users.map(u => {
        // savedFilter가 null이면 기본 전체 체크, 아니면 저장된 값 사용
        const isChecked = savedFilter === null ? true : (savedFilter[u.uid] !== false);
        return `
            <label style="display:flex; align-items:center; gap:10px; padding:7px 10px; border-radius:5px; cursor:pointer;"
                   onmouseover="this.style.background='#f1f3f5'" onmouseout="this.style.background=''">
                <input type="checkbox"
                    class="notifFilter_${type}_cb"
                    value="${u.uid}"
                    ${isChecked ? 'checked' : ''}
                    onchange="saveNotifFilterUsers('${type}')"
                    style="width:15px; height:15px; cursor:pointer; accent-color:#c62828; flex-shrink:0;">
                <span style="font-size:13px; color:#333;">
                    <b>${u.nickname}</b>
                    <span style="color:#868e96; font-size:11px; margin-left:4px;">${u.email}</span>
                </span>
            </label>
        `;
    }).join('');

    updateNotifFilterCount(type);
};

// ✅ 알림 필터 사용자 선택 저장
window.saveNotifFilterUsers = async function(type) {
    if(!isLoggedIn()) return;
    const uid = getUserId();
    const checkboxes = document.querySelectorAll(`.notifFilter_${type}_cb`);
    const filterMap = {};
    checkboxes.forEach(cb => {
        filterMap[cb.value] = cb.checked;
    });
    await db.ref(`users/${uid}/notificationTypes/${type}FilterUsers`).set(filterMap);
    updateNotifFilterCount(type);
};

// ✅ 선택된 사용자 수 카운터
function updateNotifFilterCount(type) {
    const countEl = document.getElementById(`notifFilterCount_${type}`);
    if(!countEl) return;
    const total   = document.querySelectorAll(`.notifFilter_${type}_cb`).length;
    const checked = document.querySelectorAll(`.notifFilter_${type}_cb:checked`).length;
    countEl.textContent = checked;
    countEl.style.color = checked > 0 ? '#c62828' : '#adb5bd';
}

// ✅ 알림 필터 전체선택 / 전체해제
window.selectAllNotifFilter = async function(type, checked) {
    document.querySelectorAll(`.notifFilter_${type}_cb`).forEach(cb => { cb.checked = checked; });
    await saveNotifFilterUsers(type);
};

// ✅ 카테고리 필터 불러오기 및 렌더링
const ALL_CATEGORIES = ['자유게시판', '논란', '연애', '정아영', '게넥도', '게임', '마크'];

window.loadNotifCategoryFilter = async function(type) {
    if(!isLoggedIn()) return;
    const uid = getUserId();
    const listEl = document.getElementById(`notifCategoryFilterList_${type}`);
    if(!listEl) return;

    const snap = await db.ref(`users/${uid}/notificationTypes/${type}FilterCategories`).once("value");
    const savedFilter = snap.val() || null; // null = 미설정 (기본: 전체 선택)

    listEl.innerHTML = ALL_CATEGORIES.map(cat => {
        const isChecked = savedFilter === null ? true : (savedFilter[cat] !== false);
        return `
            <label style="display:inline-flex; align-items:center; gap:5px; padding:5px 10px;
                           background:${isChecked ? '#fff0f0' : '#f8f9fa'}; border:1.5px solid ${isChecked ? '#c62828' : '#dee2e6'};
                           border-radius:20px; cursor:pointer; font-size:12px; font-weight:600;
                           color:${isChecked ? '#c62828' : '#adb5bd'}; transition:all 0.15s;"
                   id="notifCatLabel_${type}_${cat.replace(/\s/g,'_')}">
                <input type="checkbox"
                    class="notifCatFilter_${type}_cb"
                    value="${cat}"
                    ${isChecked ? 'checked' : ''}
                    onchange="onNotifCategoryChange('${type}', '${cat}', this)"
                    style="display:none;">
                ${cat}
            </label>
        `;
    }).join('');
};

// ✅ 카테고리 체크 변경 시 스타일 업데이트 + 저장
window.onNotifCategoryChange = async function(type, cat, cb) {
    const labelId = `notifCatLabel_${type}_${cat.replace(/\s/g,'_')}`;
    const label = document.getElementById(labelId);
    if(label) {
        label.style.background    = cb.checked ? '#fff0f0' : '#f8f9fa';
        label.style.border        = `1.5px solid ${cb.checked ? '#c62828' : '#dee2e6'}`;
        label.style.color         = cb.checked ? '#c62828' : '#adb5bd';
    }
    await saveNotifFilterCategories(type);
};

// ✅ 카테고리 필터 저장
window.saveNotifFilterCategories = async function(type) {
    if(!isLoggedIn()) return;
    const uid = getUserId();
    const checkboxes = document.querySelectorAll(`.notifCatFilter_${type}_cb`);
    const filterMap = {};
    checkboxes.forEach(cb => {
        filterMap[cb.value] = cb.checked;
    });
    await db.ref(`users/${uid}/notificationTypes/${type}FilterCategories`).set(filterMap);
};

// ✅ 카테고리 필터 전체선택 / 전체해제
window.selectAllNotifCategoryFilter = async function(type, checked) {
    document.querySelectorAll(`.notifCatFilter_${type}_cb`).forEach(cb => {
        cb.checked = checked;
        const cat = cb.value;
        const labelId = `notifCatLabel_${type}_${cat.replace(/\s/g,'_')}`;
        const label = document.getElementById(labelId);
        if(label) {
            label.style.background = checked ? '#fff0f0' : '#f8f9fa';
            label.style.border     = `1.5px solid ${checked ? '#c62828' : '#dee2e6'}`;
            label.style.color      = checked ? '#c62828' : '#adb5bd';
        }
    });
    await saveNotifFilterCategories(type);
};

// ✅ 헤더 프로필 버튼 업데이트
async function updateHeaderProfileButton(user) {
    const headerBtn = document.getElementById("headerProfileBtn");
    if(!headerBtn) return;
    
    if(user) {
        const photoSnapshot = await db.ref("users/" + user.uid + "/profilePhoto").once("value");
        const photoUrl = photoSnapshot.val();
        
        if(photoUrl) {
            headerBtn.innerHTML = `<img src="${photoUrl}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">`;
        } else {
            headerBtn.innerHTML = `<i class="fas fa-user-circle"></i>`;
        }
    } else {
        headerBtn.innerHTML = `<i class="fas fa-user-circle"></i>`;
    }
}

console.log("✅ Part 5 인증 관리 완료");

// ===== Part 6: 네비게이션 및 페이지 표시 =====

// ✅ 모든 섹션 숨기기
function hideAll() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    
    const dropdown = document.getElementById("profileDropdown");
    if(dropdown) dropdown.classList.remove("active");
}

function showArticles() {
    hideAll();
    
    document.getElementById("articlesSection").classList.add("active");
    
    const header = document.querySelector('header');
    if(header) header.style.display = 'block';
    
    // ✅ 수정: 카테고리 상태 복원 (저장된 카테고리 사용)
    document.getElementById("searchCategory").value = currentCategory;
    document.getElementById("searchKeyword").value = "";
    
    // ✅ 수정: 현재 카테고리로 필터링
    const category = currentCategory;
    filteredArticles = allArticles.filter(a => a.category === category);
    
    renderArticles();
    
    updateURL('home');
    
    // ✅ 스크롤 위치 복원
    setTimeout(() => {
        if(currentScrollPosition > 0) {
            window.scrollTo(0, currentScrollPosition);
        }
        setupCategoryChangeListener();
    }, 100);
}

// ===== 🔥 핫 기사 점수 계산 =====
function calcHotScore(article) {
    const views    = article.views       || 0;
    const likes    = article.likes       || article.likeCount    || 0;
    const dislikes = article.dislikes    || article.dislikeCount || 0;
    const comments = article.commentCount || 0;
    // 조회수×1 + 좋아요×3 + 댓글×2 - 싫어요×2
    return views * 1 + likes * 3 + comments * 2 - dislikes * 2;
}

// ===== 🔥 핫 기사 렌더링 (전체 또는 카테고리별) =====
// articles: 배열(allArticles) 또는 객체(Firebase val) 모두 지원
// ===== 🔥 핫 기사 렌더링 (전체 또는 카테고리별) =====
// articles: allArticles 배열, commentCounts: {id: count} 객체
function renderHotArticle(articles, containerId, category, commentCounts) {
    const el = document.getElementById(containerId);
    if (!el) return;

    // allArticles 배열 기준, 고정 기사 제외
    const pinnedIds = window._pinnedArticleIds || new Set();
    const candidates = (Array.isArray(articles) ? articles : Object.values(articles))
        .filter(a => {
            if (!a || a.deleted) return false;
            if (pinnedIds.has(a.id)) return false;
            if (category && a.category !== category) return false;
            return true;
        });

    if (candidates.length === 0) {
        el.innerHTML = '';
        window._currentHotArticleId = null; // 핫 기사 없음
        return;
    }

    // commentCounts 반영
    if (commentCounts) {
        candidates.forEach(a => {
            if (!a.commentCount) a.commentCount = commentCounts[a.id] || 0;
        });
    }

    // 점수순 정렬
    candidates.sort((a, b) => calcHotScore(b) - calcHotScore(a));
    const hot = candidates[0];

    // 핫 기사 ID 저장 (일반 목록에서 제외용)
    window._currentHotArticleId = hot.id;
    el.innerHTML = buildArticleCardHTML(hot, commentCounts, 'hot');
}

// ===== 🔥 핫 기사 로드 (articles 로드 후 호출) =====
// window._allArticles 에 전체 기사 객체가 있다고 가정
// 없으면 db.ref('articles') 에서 직접 로드
window.loadAndRenderHotArticle = async function (category) {
    try {
        let articles = window._allArticles;
        if (!articles) {
            const snap = await db.ref('articles').orderByChild('deleted').equalTo(null).limitToLast(200).once('value');
            articles = snap.val() || {};
            window._allArticles = articles;
        }
        renderHotArticle(articles, 'featuredArticle', category || null);
    } catch (e) { console.warn('핫 기사 로드 실패:', e); }
};

// ===== 🔴 카테고리별 새 기사 dot 관리 =====
const CAT_NEW_KEY = '_catLastSeen'; // localStorage key prefix
const NON_FREE_CATS = ['논란', '연애', '정아영', '게넥도', '게임', '마크'];

window.initCategoryNewDots = async function () {
    try {
        const snap = await db.ref('articles')
            .orderByChild('timestamp')
            .limitToLast(50)
            .once('value');
        const articles = snap.val() || {};

        // 카테고리별 가장 최신 timestamp 수집
        const catLatest = {};
        Object.values(articles).forEach(a => {
            if (!a || a.deleted || !NON_FREE_CATS.includes(a.category)) return;
            if (!catLatest[a.category] || a.timestamp > catLatest[a.category]) {
                catLatest[a.category] = a.timestamp;
            }
        });

        let anyNew = false;
        NON_FREE_CATS.forEach(cat => {
            const lastSeen = parseInt(localStorage.getItem(CAT_NEW_KEY + '_' + cat) || '0');
            const latest   = catLatest[cat] || 0;
            const hasNew   = latest > lastSeen;
            if (hasNew) anyNew = true;

            // 드롭다운 아이템 dot 업데이트
            const item = document.querySelector(`#catDropdownMenu [data-cat="${cat}"]`);
            if (item) {
                const dot = item.querySelector('._catDot');
                if (dot) dot.style.display = hasNew ? 'block' : 'none';
            }
        });

        // 드롭다운 버튼 위 dot
        const btnDot = document.getElementById('catBtnDot');
        if (btnDot) btnDot.style.display = anyNew ? 'block' : 'none';

    } catch (e) { console.warn('카테고리 dot 초기화 실패:', e); }
};

// 카테고리 선택 시 dot 제거 + 기존 필터 연동
window.selectCategory = function (cat) {
    // 기존 select 값 동기화 (기존 showArticles 로직 호환)
    const sel = document.getElementById('searchCategory');
    if (sel) {
        sel.value = cat;
        sel.dispatchEvent(new Event('change'));
    }
    // 드롭다운 닫기 + 레이블 변경
    document.getElementById('catDropdownLabel').textContent = cat;
    document.getElementById('catDropdownMenu').style.display = 'none';
    document.getElementById('catDropdownArrow').style.transform = '';

    // 선택한 카테고리 dot 제거 + localStorage 업데이트
    if (NON_FREE_CATS.includes(cat)) {
        localStorage.setItem(CAT_NEW_KEY + '_' + cat, Date.now());
        const item = document.querySelector(`#catDropdownMenu [data-cat="${cat}"]`);
        if (item) { const d = item.querySelector('._catDot'); if (d) d.style.display = 'none'; }
        // 남은 dot 있는지 확인 후 버튼 dot 갱신
        const anyLeft = NON_FREE_CATS.some(c => {
            const it = document.querySelector(`#catDropdownMenu [data-cat="${c}"]`);
            return it && it.querySelector('._catDot')?.style.display !== 'none';
        });
        const btnDot = document.getElementById('catBtnDot');
        if (btnDot) btnDot.style.display = anyLeft ? 'block' : 'none';
    }

    // 기존 기사 목록 갱신 (showArticles 또는 filterByCategory 함수 호출)
    if (typeof showArticles === 'function') showArticles();
};

window.toggleCatDropdown = function () {
    const menu  = document.getElementById('catDropdownMenu');
    const arrow = document.getElementById('catDropdownArrow');
    const isOpen = menu.style.display !== 'none';
    menu.style.display  = isOpen ? 'none' : 'block';
    arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
    if (!isOpen) {
        // 외부 클릭 시 닫기
        setTimeout(() => {
            document.addEventListener('click', function closeDrop(e) {
                if (!document.getElementById('catDropdownWrapper')?.contains(e.target)) {
                    menu.style.display = 'none';
                    arrow.style.transform = '';
                    document.removeEventListener('click', closeDrop);
                }
            });
        }, 10);
    }
};

// ===== 대댓글 textarea 줄바꿈 허용 =====
// 대댓글 input 동적 생성 시 이 핸들러를 적용
window.handleReplyKey = function (e, articleId, commentId) {
    if (e.key === 'Enter') {
        const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
        if (isMobile) {
            // 모바일: Enter = 전송
            e.preventDefault();
            if (typeof submitReply === 'function') submitReply(articleId, commentId);
        } else {
            // PC: Shift+Enter = 줄바꿈, Enter = 전송
            if (!e.shiftKey) {
                e.preventDefault();
                if (typeof submitReply === 'function') submitReply(articleId, commentId);
            }
            // shiftKey 있으면 기본 동작(줄바꿈) 허용
        }
    }
};

function setupCategoryChangeListener() {
    const categorySelect = document.getElementById("searchCategory");
    if (!categorySelect) return;
    
    // 기존 이벤트 리스너 제거 방지를 위해 한 번만 등록
    if (categorySelect.dataset.listenerAdded === 'true') return;
    
    categorySelect.addEventListener('change', function() {
        console.log("✅ 카테고리 변경:", this.value);
        // ✅ 수정: 현재 카테고리 상태 저장
        currentCategory = this.value;
        currentScrollPosition = 0; // 카테고리 변경 시 스크롤 초기화
        searchArticles(true); // 자동으로 검색 실행
    });
    
    categorySelect.dataset.listenerAdded = 'true';
}

// 4. 글 작성 페이지 (기존 함수 덮어쓰기)
async function showWritePage() {
    // ✅ [BUG FIX] Firebase auth 초기화 완료 대기
    // 페이지 첫 로드 시 auth.onAuthStateChanged가 아직 안 불렸으면
    // isLoggedIn()이 false를 반환해 googleLogin()이 자동 실행되는 버그 방지
    await authReady;
    if(!isLoggedIn()) { 
        alert("기사 작성은 로그인 후 가능합니다!"); 
        googleLogin(); 
        return; 
    }
    
    // ✅ 핵심: 수정 모드 완전히 해제
    window.isEditingArticle = false;
    window.editingArticleId = null;
    
    hideAll();
    window.scrollTo(0, 0);
    
    document.getElementById("writeSection").classList.add("active");

    // ✅ 관리자 전용: 대리 작성 박스 표시 및 초기화
    const impBox = document.getElementById('adminImpersonateBox');
    if (impBox) {
        impBox.style.display = isAdmin() ? 'block' : 'none';
        window._adminClearImpersonate();
    }
    
    setTimeout(() => {
        // ✅ 항상 새로운 폼으로 초기화
        setupArticleForm();
        
        // ✅ 폼 필드 강제 초기화
        const categoryEl = document.getElementById("category");
        const titleEl = document.getElementById("title");
        const summaryEl = document.getElementById("summary");
        
        if (categoryEl) categoryEl.value = '자유게시판';
        if (titleEl) titleEl.value = '';
        if (summaryEl) summaryEl.value = '';
        
        // ✅ Quill 에디터 초기화
        if (window.quillEditor && window.quillEditor.setText) {
            window.quillEditor.setText('');
        }
        
        // ✅ 썸네일 초기화
        const preview = document.getElementById('thumbnailPreview');
        const uploadText = document.getElementById('uploadText');
        if (preview) {
            preview.src = '';
            preview.style.display = 'none';
        }
        if (uploadText) {
            uploadText.innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
        }
        
        console.log("✅ 새 기사 작성 모드 - 수정 모드 해제됨");
    }, 100);
    
    updateURL('write'); 
}


// ✅ 설정 페이지
function showSettings() {
    hideAll();
    window.scrollTo(0, 0);
    
    const settingsSection = document.getElementById("settingsSection");
    settingsSection.classList.add("active");
    
    updateSettings();
    updateURL('settings');
}

// 5. 더보기 메뉴 (기존 함수 덮어쓰기)
function showMoreMenu() {
    hideAll();
    window.scrollTo(0, 0);
    
    const section = document.getElementById("moreMenuSection");
    if(!section) return;
    
    section.classList.add("active");
    
    section.innerHTML = `
        <div class="more-menu-container" style="max-width:600px; margin:0 auto; padding:20px;">
            <h2 style="color:#00376b; text-align:center; margin-bottom:30px; font-size:24px; font-weight:800;">
                <i class="fas fa-bars"></i> 더보기 메뉴
            </h2>
            
            <div class="menu-section" style="background:white; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <h3 style="color:#495057; margin:0 0 15px 0; font-size:16px; font-weight:700;">
                    <i class="fas fa-comments"></i> 커뮤니티
                </h3>
                <div style="display:grid; gap:10px;">
                    <button onclick="showCategoryArticles('자유게시판')" class="more-menu-btn">
                        <i class="fas fa-list"></i> 자유게시판
                    </button>
                    <button onclick="showCategoryArticles('마크')" class="more-menu-btn">
                        <i class="fas fa-cube"></i> 마크
                    </button>
                    <button onclick="showMessenger()" class="more-menu-btn">
                        <i class="fas fa-envelope"></i> 알림함
                        <span class="notification-badge" id="messengerBadgeMore" style="display:none; position:absolute; right:12px; top:12px; background:#dc3545; color:white; border-radius:12px; padding:2px 6px; font-size:10px; font-weight:700; min-width:18px; text-align:center;"></span>
                    </button>
                    <button onclick="showChatPage()" class="more-menu-btn" style="position:relative;">
                        <i class="fas fa-comment-dots"></i> 채팅
                        <span class="notification-badge" id="chatBadgeMore" style="display:none; position:absolute; right:12px; top:12px; background:#dc3545; color:white; border-radius:12px; padding:2px 6px; font-size:10px; font-weight:700; min-width:18px; text-align:center;"></span>
                    </button>
                    <button onclick="typeof showVotePage === 'function' ? showVotePage() : alert('투표 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.')" class="more-menu-btn">
                        <i class="fas fa-poll-h"></i> 투표
                    </button>
                </div>
            </div>
            
            <div class="menu-section" style="background:white; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <h3 style="color:#495057; margin:0 0 15px 0; font-size:16px; font-weight:700;">
                    <i class="fas fa-info-circle"></i> 정보
                </h3>
                <div style="display:grid; gap:10px;">
                    <button onclick="showQnA()" class="more-menu-btn">
                        <i class="fas fa-question-circle"></i> QnA
                    </button>
                    <button onclick="showPatchNotesPage()" class="more-menu-btn">
                        <i class="fas fa-file-alt"></i> 패치노트
                    </button>
                    <button onclick="showActivityStatus()" class="more-menu-btn">
                        <i class="fas fa-users"></i> 활동중
                    </button>
                    <button onclick="showBugReportPage()" class="more-menu-btn">
                        <i class="fas fa-bug"></i> 버그 제보
                    </button>
                    <button onclick="showImprovementPage()" class="more-menu-btn">
                        <i class="fas fa-lightbulb"></i> 개선 제보
                    </button>
                </div>
            </div>

            ${isLoggedIn() ? `
            <div class="menu-section" style="background:white; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <h3 style="color:#495057; margin:0 0 15px 0; font-size:16px; font-weight:700;">
                    <i class="fas fa-bell"></i> 알림
                </h3>
                <div style="display:grid; gap:10px;">
                    <button onclick="manualTriggerPush(this)" class="more-menu-btn">
                        <i class="fas fa-paper-plane"></i> 푸쉬 알림 즉시 전송
                        <span style="font-size:11px; color:#999; margin-left:auto;">읽지 않은 알림을 지금 전송</span>
                    </button>
                </div>
            </div>` : ''}

            ${isAdmin() ? `
            <div class="menu-section" style="background:#fff8f8; border:1px solid #ffcdd2; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <h3 style="color:#c62828; margin:0 0 15px 0; font-size:16px; font-weight:700;">
                    <i class="fas fa-shield-alt"></i> 관리자
                </h3>
                <div style="display:grid; gap:10px;">
                    <button onclick="showUserManagement()" class="more-menu-btn" style="border-color:#ffcdd2;">
                        <i class="fas fa-users-cog" style="color:#c62828;"></i> 유저 관리
                    </button>
                    <button onclick="showPinnedArticleManager()" class="more-menu-btn" style="border-color:#ffcdd2;">
                        <i class="fas fa-thumbtack" style="color:#c62828;"></i> 기사 고정 관리
                    </button>
                    <button onclick="showMaintenanceModeManager()" class="more-menu-btn" style="border-color:#ffcdd2;">
                        <i class="fas fa-tools" style="color:#c62828;"></i> 점검모드 관리
                    </button>
                    <button onclick="showBannedWordManager()" class="more-menu-btn" style="border-color:#ffcdd2;">
                        <i class="fas fa-ban" style="color:#c62828;"></i> 금지어 관리
                    </button>
                    <button onclick="showErrorLogs()" class="more-menu-btn" style="border-color:#ffcdd2;">
                        <i class="fas fa-bug" style="color:#c62828;"></i> 오류 로그
                    </button>
                    <button onclick="resetAllViews()" class="more-menu-btn" style="border-color:#ffcdd2;">
                        <i class="fas fa-redo" style="color:#c62828;"></i> 전체 조회수 초기화
                    </button>
                    <button onclick="clearMyViewHistory()" class="more-menu-btn" style="border-color:#ffcdd2;">
                        <i class="fas fa-trash-alt" style="color:#c62828;"></i> 내 조회 기록 삭제
                    </button>
                    <button onclick="showManualNotificationSender()" class="more-menu-btn" style="border-color:#ffcdd2;">
                        <i class="fas fa-paper-plane" style="color:#c62828;"></i> 수동 알림 전송
                    </button>
                    <button onclick="showAdminBugReports()" class="more-menu-btn" style="border-color:#ffcdd2;">
                        <i class="fas fa-bug" style="color:#c62828;"></i> 버그 제보 관리
                    </button>
                    <button onclick="showAdminImprovements()" class="more-menu-btn" style="border-color:#ffcdd2;">
                        <i class="fas fa-lightbulb" style="color:#c62828;"></i> 개선 제보 관리
                    </button>
                    <button onclick="showAdminMemo()" class="more-menu-btn" style="border-color:#ffcdd2;">
                        <i class="fas fa-sticky-note" style="color:#c62828;"></i> 관리자 메모장
                    </button>
                    <button onclick="migrateCommentCounts()" class="more-menu-btn" style="border-color:#ffcdd2;">
                        <i class="fas fa-sync-alt" style="color:#c62828;"></i> 댓글 수 일괄 복구
                    </button>
                </div>
            </div>` : ''}
            
        </div>
        
        <style>
            .more-menu-btn {
                display: flex;
                align-items: center;
                gap: 12px;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                padding: 15px;
                border-radius: 8px;
                font-size: 15px;
                color: #495057;
                cursor: pointer;
                transition: all 0.3s;
                font-weight: 500;
                position: relative;
            }
            
            .more-menu-btn:hover {
                background: #e9ecef;
                transform: translateX(5px);
            }
            
            .more-menu-btn i {
                font-size: 18px;
                color: #00376b;
                width: 24px;
                text-align: center;
            }
        </style>
    `;
    
    updateURL('more');
    updateMessengerBadge();
}

// 더보기 - 수동 푸쉬 트리거 버튼 핸들러
async function manualTriggerPush(btn) {
    if (!isLoggedIn()) { alert('로그인이 필요합니다.'); return; }
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 요청 중...';
    const ok = await triggerGithubNotification(false);
    if (ok) {
        btn.innerHTML = '<i class="fas fa-check" style="color:#2e7d32;"></i> 전송 요청 완료!';
    } else {
        btn.innerHTML = '<i class="fas fa-clock" style="color:#888;"></i> 잠시 후 자동 전송 예정';
    }
    setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 3000);
}

// 6. 카테고리별 기사 표시
function showCategoryArticles(category) {
    hideAll();
    window.scrollTo(0, 0);
    
    const section = document.getElementById("articlesSection");
    section.classList.add("active");
    
    // ✅ 수정: 현재 카테고리 상태 저장
    currentCategory = category;
    currentScrollPosition = 0; // 새 카테고리 선택 시 스크롤 초기화
    
    document.getElementById("searchCategory").value = category;
    document.getElementById("searchKeyword").value = "";
    
    searchArticles(true);
    updateURL('home');
}

// 7. 메신저 알림 배지
async function updateMessengerBadge() {
    if (!isLoggedIn()) return;
    
    const myUid = getUserId();
    const badge = document.getElementById("messengerBadgeMore");
    
    if (!badge) return;
    
    try {
        const friendsSnapshot = await db.ref(`friends/${myUid}`).once('value');
        const friendsData = friendsSnapshot.val() || {};
        
        let totalUnread = 0;
        
        for (const friendUid of Object.keys(friendsData)) {
            const roomId = [myUid, friendUid].sort().join('_');
            
            const unreadSnapshot = await db.ref(`messages/${roomId}`)
                .orderByChild('read')
                .equalTo(false)
                .once('value');
            
            unreadSnapshot.forEach(child => {
                if (child.val().toUid === myUid) {
                    totalUnread++;
                }
            });
        }
        
        if (totalUnread > 0) {
            badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    } catch (error) {
        console.error("메신저 배지 업데이트 실패:", error);
    }
}

// ===== script.js에서 찾아서 추가/교체할 부분 3: QnA 및 패치노트 =====
// 위치: script.js의 약 2000-2100번째 줄 근처
// 아래 함수들을 찾아서 교체하거나, 없으면 추가하세요

// QnA 페이지 표시
window.showQnA = function() {
    hideAll();
    window.scrollTo(0, 0);
    
    const section = document.getElementById("qnaSection");
    if(!section) {
        console.error("❌ qnaSection을 찾을 수 없습니다");
        return;
    }
    
    section.classList.add("active");
    loadQnAFromFile();
    
    updateURL('qna');
};

// QnA 파일 로드
function loadQnAFromFile() {
    const qnaList = document.getElementById("qnaList");
    if(!qnaList) {
        console.error("❌ qnaList를 찾을 수 없습니다");
        return;
    }
    
    qnaList.innerHTML = '<p style="text-align:center; color:#868e96; padding:40px;">QnA 내용을 불러오는 중...</p>';
    
    fetch('./html/qna.html')
        .then(response => {
            if(!response.ok) throw new Error('QnA 파일을 찾을 수 없습니다.');
            return response.text();
        })
        .then(html => {
            qnaList.innerHTML = html;
            console.log("✅ QnA 로드 완료");
        })
        .catch(error => {
            console.error("❌ QnA 로드 실패:", error);
            qnaList.innerHTML = `
                <div style="text-align:center; padding:60px 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size:48px; color:#f44336; margin-bottom:20px;"></i>
                    <p style="color:#f44336; margin-bottom:20px;">QnA 파일을 불러올 수 없습니다.</p>
                    <p style="color:#868e96; font-size:14px;">파일 경로: ./html/qna.html</p>
                    <button onclick="loadQnAFromFile()" class="btn-primary" style="margin-top:20px;">
                        다시 시도
                    </button>
                </div>
            `;
        });
}

// 패치노트 페이지 표시
window.showPatchNotesPage = function() {
    hideAll();
    window.scrollTo(0, 0);
    
    const section = document.getElementById("patchnotesSection");
    if(!section) {
        console.error("❌ patchnotesSection을 찾을 수 없습니다");
        return;
    }
    
    section.classList.add("active");
    
    const listElement = document.getElementById("patchNotesList");
    if(listElement) {
        loadPatchNotesToContainer(listElement);
    } else {
        console.error("❌ patchNotesList를 찾을 수 없습니다");
    }
    
    updateURL('patchnotes');
};

// 패치노트 로드
function loadPatchNotesToContainer(container) {
    if(!container) {
        console.error("❌ 패치노트 컨테이너가 없습니다");
        return;
    }
    
    container.innerHTML = '<div style="text-align:center; padding:20px;">로딩 중...</div>';

    db.ref('patchNotes').orderByChild('date').once('value').then(snapshot => {
        container.innerHTML = '';
        
        // 관리자인 경우 추가 버튼 표시
        if (isAdmin()) {
            const addBtn = document.createElement('div');
            addBtn.className = 'admin-patch-controls';
            addBtn.style.marginBottom = '20px';
            addBtn.innerHTML = `<button onclick="openPatchNoteModal()" class="btn-primary btn-block">
                <i class="fas fa-plus"></i> 새 패치노트 작성
            </button>`;
            container.appendChild(addBtn);
        }

        const notes = [];
        snapshot.forEach(child => {
            notes.push({ id: child.key, ...child.val() });
        });

        if (notes.length === 0) {
            container.innerHTML += '<p style="text-align:center; color:#888;">등록된 패치노트가 없습니다.</p>';
            return;
        }

        notes.reverse().forEach(note => {
            const card = document.createElement('div');
            card.className = 'qna-card'; 
            
            let adminBtns = '';
            if (isAdmin()) {
                adminBtns = `
                    <div style="margin-top:10px; border-top:1px solid #eee; padding-top:10px; text-align:right;">
                        <button onclick="openPatchNoteModal('${note.id}')" class="btn-secondary" style="padding:4px 8px; font-size:11px;">수정</button>
                        <button onclick="deletePatchNote('${note.id}')" class="btn-danger" style="padding:4px 8px; font-size:11px;">삭제</button>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="qna-header">
                    <i class="fas fa-tag"></i> ${note.version} 
                    <span style="font-size:12px; margin-left:auto; opacity:0.8;">${note.date}</span>
                </div>
                <div class="qna-body">
                    <div class="a-part" style="white-space: pre-wrap;">${note.content}</div>
                    ${adminBtns}
                </div>
            `;
            container.appendChild(card);
        });
        
        console.log("✅ 패치노트 로드 완료");
    }).catch(error => {
        console.error("❌ 패치노트 로드 실패:", error);
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:#f44336;">
                <p>패치노트를 불러오는데 실패했습니다.</p>
                <button onclick="loadPatchNotesToContainer(this.parentElement.parentElement)" class="btn-primary" style="margin-top:20px;">
                    다시 시도
                </button>
            </div>
        `;
    });
}

// 패치노트 모달 열기
window.openPatchNoteModal = function(id = null) {
    const modal = document.getElementById('patchNoteModal');
    if(!modal) {
        console.error("❌ patchNoteModal을 찾을 수 없습니다");
        return;
    }
    
    const form = document.getElementById('patchNoteForm');
    if(form) {
        form.reset();
    }
    
    const editIdInput = document.getElementById('editPatchId');
    if(editIdInput) {
        editIdInput.value = '';
    }

    if (id) {
        db.ref('patchNotes/' + id).once('value').then(snap => {
            const data = snap.val();
            if(editIdInput) editIdInput.value = id;
            
            const versionInput = document.getElementById('patchVersion');
            const dateInput = document.getElementById('patchDate');
            const contentInput = document.getElementById('patchContent');
            
            if(versionInput) versionInput.value = data.version;
            if(dateInput) dateInput.value = data.date;
            if(contentInput) contentInput.value = data.content;
            
            modal.classList.add('active');
        });
    } else {
        const dateInput = document.getElementById('patchDate');
        if(dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        modal.classList.add('active');
    }
};

window.closePatchNoteModal = function() {
    const modal = document.getElementById('patchNoteModal');
    if(modal) {
        modal.classList.remove('active');
    }
};

// 패치노트 저장
window.savePatchNote = function(e) {
    e.preventDefault();
    if (!isAdmin()) return alert("관리자만 가능합니다.");

    const id = document.getElementById('editPatchId')?.value;
    const data = {
        version: document.getElementById('patchVersion')?.value,
        date: document.getElementById('patchDate')?.value,
        content: document.getElementById('patchContent')?.value
    };

    if (id) {
        db.ref('patchNotes/' + id).update(data);
    } else {
        db.ref('patchNotes').push(data);
    }
    
    closePatchNoteModal();
    
    if(document.getElementById("patchnotesSection")?.classList.contains("active")) {
        showPatchNotesPage();
    }
};

// 패치노트 삭제
window.deletePatchNote = function(id) {
    if(!isAdmin()) return;
    if(confirm('정말 삭제하시겠습니까?')) {
        db.ref('patchNotes/' + id).remove().then(() => {
            if(document.getElementById("patchnotesSection")?.classList.contains("active")) {
                showPatchNotesPage();
            }
        });
    }
};

console.log("✅ QnA 및 패치노트 기능 로드 완료");

// ===== Part 7: 기사 렌더링 =====

function getProfilePlaceholder(photoUrl, size) {
    if (photoUrl) {
        return `<img src="${photoUrl}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;object-position:center;border:2px solid #dadce0;flex-shrink:0;image-rendering:auto;-webkit-transform:translateZ(0);transform:translateZ(0);">`;
    }
    return `<span style="width:${size}px;height:${size}px;border-radius:50%;background:#f1f3f4;display:inline-flex;align-items:center;justify-content:center;border:2px solid #dadce0;flex-shrink:0;">
        <i class="fas fa-user" style="font-size:${size/2}px;color:#9aa0a6;"></i>
    </span>`;
}

// ✅ 사용자 프로필 사진 가져오기
async function getUserProfilePhoto(email) {
    if (!email) return null;
    
    if (window.profilePhotoCache.has(email)) {
        return window.profilePhotoCache.get(email);
    }
    
    await authReady; // ✅ 인증 초기화 대기 (null 캐싱 방지)
    // ✅ 비로그인 시 프로필 사진 로드 건너뜀
    if (!isLoggedIn()) {
        window.profilePhotoCache.set(email, null);
        return null;
    }
    
    try {
        const snap = await db.ref("users").orderByChild("email").equalTo(email).limitToFirst(1).once("value");
        const val = snap.val();
        if (val) {
            const userData = Object.values(val)[0];
            const photoUrl = userData.profilePhoto || null;
            window.profilePhotoCache.set(email, photoUrl);
            return photoUrl;
        }
        window.profilePhotoCache.set(email, null);
        return null;
    } catch (error) {
        window.profilePhotoCache.set(email, null);
        return null;
    }
}

// ===== 공통 기사 카드 HTML 빌더 =====
// badge: 'pinned' | 'hot' | null
function buildArticleCardHTML(a, commentCounts, badge) {
    const views        = getArticleViews(a);
    const votes        = getArticleVoteCounts(a);
    const commentCount = (commentCounts && commentCounts[a.id]) || a.commentCount || 0;
    // ✅ 익명 게시글이면 홈 카드에서 관리자 포함 무조건 기본 프로필
    const photoUrl    = a.anonymous ? null : (window.profilePhotoCache?.get(a.authorEmail) || null);
    const authorPhoto = getProfilePlaceholder(photoUrl, 48);

    let badgeHTML = '';
    let borderStyle = 'cursor:pointer;';
    if (badge === 'pinned') {
        badgeHTML   = `<span class="pinned-badge">📌 고정</span>`;
        borderStyle = 'border-left:4px solid #ffd700; cursor:pointer;';
    } else if (badge === 'hot') {
        badgeHTML   = `<span style="display:inline-flex;align-items:center;gap:4px;
            background:linear-gradient(90deg,#ff5722,#ff9800);color:white;
            font-size:11px;font-weight:800;padding:2px 9px;border-radius:20px;
            margin-right:4px;">🔥 핫</span>`;
        borderStyle = 'border-left:4px solid #ff5722; cursor:pointer;';
    }

    return `<div class="article-card" onclick="showArticleDetail('${a.id}')" style="${borderStyle}">
        ${a.thumbnail ? `<img src="${a.thumbnail}" class="article-thumbnail" alt="썸네일">` : ''}
        <div class="article-content">
            <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:4px;">
                <span class="category-badge">${escapeHTML(a.category)}</span>
                ${a.anonymous ? `<span style="display:inline-flex;align-items:center;gap:3px;
                    background:#f5f5f5;color:#757575;
                    font-size:11px;font-weight:800;padding:2px 8px;border-radius:20px;">🕵️ 익명</span>` : ''}
                ${badgeHTML}
            </div>
            <h3 class="article-title">${escapeHTML(a.title)}</h3>
            ${a.summary ? `<p class="article-summary">${escapeHTML(a.summary)}</p>` : ''}
            <div class="article-meta" style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                <div style="display:flex;align-items:center;gap:8px;">
                    ${authorPhoto}
                    <span>${a.anonymous ? '익명' : escapeHTML(a.author || '')}</span>
                </div>
                <div class="article-stats" style="display:flex;gap:12px;">
                    <span class="stat-item">👁️ ${views}</span>
                    <span class="stat-item">💬 ${commentCount}</span>
                    <span class="stat-item">👍 ${votes.likes}</span>
                    ${votes.dislikes > 0 ? `<span class="stat-item">👎 ${votes.dislikes}</span>` : ''}
                </div>
            </div>
        </div>
    </div>`;
}

async function renderArticles() {
    // ✅ [최적화] authReady 대기 제거 — 기사 목록 즉시 렌더링 후 프로필 사진만 비동기 보완
    // await authReady; // 제거: 이 한 줄이 2~4초 블로킹의 주범이었음
    const list = getSortedArticles();
    
    const grid = document.getElementById("articlesGrid");
    const featured = document.getElementById("featuredArticle");
    const pinnedSection = document.getElementById("pinnedSection");
    const loadMore = document.getElementById("loadMoreContainer");

    if(!grid || !featured || !pinnedSection || !loadMore) {
        console.error("필수 요소를 찾을 수 없습니다.");
        return;
    }
    
    if(!window.profilePhotoCache) {
        window.profilePhotoCache = new Map();
    }
    
    // ✅ 수정: 현재 선택된 카테고리 가져오기
    const currentCategory = document.getElementById("searchCategory")?.value || "자유게시판";
    
    // 고정 기사
    // ✅ [최적화] 60초 캐시 사용 (매 렌더링마다 DB 쿼리 제거)
    const pinnedData = await getPinnedArticles();
    const pinnedIds = Object.keys(pinnedData);

    const pinnedArticles = [];
    const unpinnedArticles = [];

    list.forEach(article => {
        if (article.category !== currentCategory) return;   // ← 카테고리 가드 추가
        
        if (pinnedIds.includes(article.id)) {
            article.pinnedAt = pinnedData[article.id].pinnedAt;
            pinnedArticles.push(article);
        } else {
            unpinnedArticles.push(article);
        }
    });

    pinnedArticles.sort((a, b) => b.pinnedAt - a.pinnedAt);

    if (list.length === 0) {
        featured.innerHTML = `<div style="text-align:center;padding:60px 20px;background:#fff;border-radius:8px;">
            <p style="color:#868e96;font-size:16px;">등록된 기사가 없습니다.</p>
        </div>`;
        grid.innerHTML = "";
        loadMore.innerHTML = "";
        pinnedSection.innerHTML = "";
        return;
    }

    // ✅ [수정] allArticles의 commentCount를 commentCounts에 직접 매핑
    // articles/{id}/commentCount 트랜잭션 값이 정확히 반영됨
    const commentCounts = {};
    allArticles.forEach(a => {
        if (a.id && a.commentCount) {
            commentCounts[a.id] = a.commentCount;
        }
    });

    // 고정 기사 렌더링
// ✅ 핫 기사 후보 1위 먼저 계산
    const pinnedIdSet = new Set(pinnedIds);
    const hotCandidate = allArticles
        .filter(a => a && !a.deleted && !pinnedIdSet.has(a.id) && a.category === currentCategory)
        .sort((a, b) => calcHotScore(b) - calcHotScore(a))[0];
    const hotId = hotCandidate ? hotCandidate.id : null;
    window._currentHotArticleId = hotId;

    const filteredUnpinned = hotId
        ? unpinnedArticles.filter(a => a.id !== hotId)
        : unpinnedArticles;

    const endIdx = currentArticlePage * ARTICLES_PER_PAGE;
    const displayArticles = filteredUnpinned.slice(0, endIdx);

    // ✅ 프로필 사진 캐시 먼저 로드 (고정/일반/핫 기사 모두 포함)
    const allDisplayEmails = [...displayArticles, ...pinnedArticles];
    if (hotCandidate) allDisplayEmails.push(hotCandidate);
    // ✅ 익명 게시글 저자는 프로필 사진 로드 자체를 제외 (카드에서 기본 프로필 표시)
    const emails = [...new Set(
        allDisplayEmails
            .filter(a => !a.anonymous)
            .map(a => a.authorEmail).filter(Boolean)
    )];
    const uncachedEmails = emails.filter(email => !window.profilePhotoCache.has(email));

    if (uncachedEmails.length > 0) {
        await authReady; // ✅ 인증 초기화 대기
        if (isLoggedIn()) {
            try {
                // UID 있는 것과 없는 것 분리
                const emailToUid = {};
                allDisplayEmails.forEach(a => { if (a.authorUid && a.authorEmail) emailToUid[a.authorEmail] = a.authorUid; });

                const withUid    = uncachedEmails.filter(e => emailToUid[e]);
                const withoutUid = uncachedEmails.filter(e => !emailToUid[e]);

                // UID 있는 것: 병렬 직접 조회 (빠름)
                const uidPromises = withUid.map(async email => {
                    try {
                        const snap = await db.ref("users/" + emailToUid[email] + "/profilePhoto").once("value");
                        window.profilePhotoCache.set(email, snap.val() || null);
                    } catch(e) { window.profilePhotoCache.set(email, null); }
                });

                // UID 없는 구 기사: 이메일 인덱스 쿼리 (병렬)
                const emailPromises = withoutUid.map(async email => {
                    try {
                        const snap = await db.ref("users").orderByChild("email").equalTo(email).limitToFirst(1).once("value");
                        const v = snap.val();
                        const u = v ? Object.values(v)[0] : null;
                        window.profilePhotoCache.set(email, u ? (u.profilePhoto || null) : null);
                    } catch(e) { window.profilePhotoCache.set(email, null); }
                });

                await Promise.all([...uidPromises, ...emailPromises]);
            } catch (error) {
                console.warn("프로필 사진 배치 로드 실패:", error);
            }
        }
    }

    // ✅ 캐시 완성 후 고정 기사 렌더링
    if (pinnedArticles.length > 0) {
        pinnedSection.innerHTML = pinnedArticles
            .map(a => buildArticleCardHTML(a, commentCounts, 'pinned'))
            .join('');
    } else {
        pinnedSection.innerHTML = '';
    }

    // ✅ 핫 기사 렌더링
    renderHotArticle(allArticles, 'featuredArticle', currentCategory, commentCounts);

    // ✅ [최적화] 기사 렌더링 완료 → 로딩 화면 숨김
    hidePageLoadingScreen();

    // ✅ 일반 기사 렌더링
    const articlesHTML = displayArticles.map((a) =>
        buildArticleCardHTML(a, commentCounts, null)
    );
    grid.innerHTML = articlesHTML.join('');
    
    if(endIdx < filteredUnpinned.length) {
        loadMore.innerHTML = `<button onclick="loadMoreArticles()" class="btn-block" style="background:#fff; border:1px solid #ddd; color:#555;">
            더 보기 (${filteredUnpinned.length - endIdx})</button>`;
    } else {
        loadMore.innerHTML = "";
    }
}

console.log("✅ Part 7 기사 렌더링 완료");

// ===== Part 8: 기사 상세보기 및 작성/수정 =====

async function showArticleDetail(id) {
    hideAll();
    const detailSection = document.getElementById("articleDetailSection");
    detailSection.classList.add("active");
    
    const root = document.getElementById("articleDetail");
    root.innerHTML = `
        <div style="padding:60px 20px; text-align:center;">
            <div style="width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #c62828; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 20px;"></div>
            <p style="color:#666;">기사를 불러오는 중입니다...</p>
        </div>
    `;
    
    document.getElementById("comments").innerHTML = "";
    document.getElementById("commentCount").textContent = "";

    updateURL('article', id);

    try {
        const snapshot = await db.ref("articles/" + id).once("value");
        const A = snapshot.val();
        
        if(!A) { 
            alert("존재하지 않는 기사입니다!");
            showArticles();
            return;
        }
        
        if (currentArticleId !== id) {
            incrementView(id, A.viewsResetAt || 0, A.views || 0);
            currentArticleId = id;
        }
        
        currentCommentPage = 1;
        
        const currentUser = getNickname();
        const canEdit = isLoggedIn() && ((A.author === currentUser) || isAdmin());
        
        const viewsSnapshot = await db.ref(`articles/${id}/views`).once("value");
        const views = viewsSnapshot.val() || 0;
        
        const votes = getArticleVoteCounts(A);
        
        const [userVote, authorPhoto] = await Promise.all([
            checkUserVote(id),
            getUserProfilePhoto(A.authorEmail)
        ]);
        
        const authorPhotoHTML = await createProfilePhoto(authorPhoto, 40);

        // ✅ 수정됨 표시 추가
        const editedBadge = A.lastModified ? 
            `<span class="edited-badge"><i class="fas fa-edit"></i> 수정됨</span>` : '';

        // ✅ 익명 모드 처리
        // 관리자: window._adminRevealAnonymous[id] === true이면 실명 표시, 아니면 익명 유지
        if (!window._adminRevealAnonymous) window._adminRevealAnonymous = {};
        const _isRevealedByAdmin = isAdmin() && !!window._adminRevealAnonymous[id];
        const displayAuthor = A.anonymous
            ? (_isRevealedByAdmin ? `${escapeHTML(A.author)} <span style="font-size:11px;background:#fff3e0;color:#e65100;padding:1px 7px;border-radius:8px;font-weight:600;">🔓 익명해제(관리자)</span>` : '익명')
            : escapeHTML(A.author);
        const displayPhoto  = (A.anonymous && !_isRevealedByAdmin) ? await createProfilePhoto(null, 40) : authorPhotoHTML;

        // ✅ 추천/비추천 영역 (hideVotes 처리)
        const voteSection = A.hideVotes && !isAdmin()
            ? `<div style="text-align:center;color:#aaa;font-size:13px;padding:16px 0;">🙈 이 기사는 추천/비추천이 숨겨져 있습니다.</div>`
            : `<div style="display:flex;gap:10px;padding-top:20px;margin-top:20px;border-top:1px solid #eee;justify-content:center;">
                <button id="like-btn-${A.id}" onclick="toggleVote('${A.id}', 'like')" class="vote-btn ${userVote === 'like' ? 'active' : ''}">
                    👍 추천 ${votes.likes}
                </button>
                <button id="dislike-btn-${A.id}" onclick="toggleVote('${A.id}', 'dislike')" class="vote-btn dislike ${userVote === 'dislike' ? 'active' : ''}">
                    👎 비추천 ${votes.dislikes}
                </button>
               </div>`;

        // ✅ 관리자 전용 기사 관리 패널
        // 관리자 전용 익명 해제 상태: window._adminRevealAnonymous[articleId]
        if (!window._adminRevealAnonymous) window._adminRevealAnonymous = {};
        const _adminRevealed = !!window._adminRevealAnonymous[A.id];

        const adminArticlePanel = isAdmin() ? `
            <div style="margin-top:20px; background:#fff8e1; border:1px solid #ffe082; border-radius:10px; padding:14px 16px;">
                <div style="font-size:13px; font-weight:700; color:#795548; margin-bottom:10px;">🛠️ 관리자 기사 관리</div>
                <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
                    <button onclick="adminResetArticleViews('${A.id}')" style="padding:6px 12px; background:#e3f2fd; color:#1565c0; border:1px solid #90caf9; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">👁️ 조회수 초기화</button>
                    <button onclick="adminResetArticleVotes('${A.id}')" style="padding:6px 12px; background:#fce4ec; color:#c62828; border:1px solid #f48fb1; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">👍 추천/비추천 초기화</button>
                    <button onclick="adminShowArticleReaders('${A.id}')" style="padding:6px 12px; background:#e8f5e9; color:#2e7d32; border:1px solid #a5d6a7; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">📖 독자 목록</button>
                    <button onclick="adminShowArticleVoters('${A.id}')" style="padding:6px 12px; background:#f3e5f5; color:#6a1b9a; border:1px solid #ce93d8; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;">🗳️ 투표 현황</button>
                    ${A.anonymous ? `
                    <button id="_adminAnonBtn_${A.id}"
                        onclick="adminToggleAnonymousReveal('${A.id}')"
                        style="padding:6px 12px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;
                        border:1px solid ${_adminRevealed ? '#a5d6a7' : '#ffcc80'};
                        background:${_adminRevealed ? '#e8f5e9' : '#fff3e0'};
                        color:${_adminRevealed ? '#2e7d32' : '#e65100'};">
                        ${_adminRevealed ? '🔓 익명 해제 중 (클릭 시 복원)' : '🔒 익명 해제 보기'}
                    </button>` : ''}
                </div>
                <div id="_adminAnonInfo_${A.id}" style="font-size:11px; color:#888;">
                    ${A.anonymous ? '🕵️ 익명 게시됨 | 실제 작성자: <strong>' + escapeHTML(A.author) + '</strong> (' + escapeHTML(A.authorEmail || '') + ')' : ''}
                    ${A.hideVotes ? '&nbsp;&nbsp;🙈 추천/비추천 숨김 설정됨' : ''}
                </div>

                <!-- ✅ 수치 직접 조작 -->
                <div style="margin-top:12px; border-top:1px solid #ffe082; padding-top:12px;">
                    <div style="font-size:12px; font-weight:700; color:#795548; margin-bottom:8px;">📊 수치 직접 조작</div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:flex-end;">
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-size:11px;color:#888;">👁️ 조회수</label>
                            <input id="_adminViewsInput_${A.id}" type="number" min="0" value="${views}"
                                style="width:90px;padding:5px 8px;border:1px solid #ffe082;border-radius:6px;font-size:13px;text-align:center;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-size:11px;color:#888;">👍 좋아요</label>
                            <input id="_adminLikesInput_${A.id}" type="number" min="0" value="${votes.likes}"
                                style="width:90px;padding:5px 8px;border:1px solid #ffe082;border-radius:6px;font-size:13px;text-align:center;">
                        </div>
                        <div style="display:flex;flex-direction:column;gap:3px;">
                            <label style="font-size:11px;color:#888;">👎 싫어요</label>
                            <input id="_adminDislikesInput_${A.id}" type="number" min="0" value="${votes.dislikes}"
                                style="width:90px;padding:5px 8px;border:1px solid #ffe082;border-radius:6px;font-size:13px;text-align:center;">
                        </div>
                        <button onclick="adminSetArticleStats('${A.id}')"
                            style="padding:6px 16px;background:#795548;color:white;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;height:30px;">
                            ✅ 적용
                        </button>
                    </div>
                </div>
            </div>` : '';

        root.innerHTML = `<div style="background:#fff;padding:20px;border-radius:8px;">
            <span class="category-badge">${A.category}</span>
            <h1 style="font-size:22px;font-weight:700;margin:15px 0;line-height:1.4;">
                ${escapeHTML(A.title)}
                ${editedBadge}
                ${A.anonymous ? '<span style="font-size:12px;background:#eee;color:#666;padding:2px 8px;border-radius:10px;font-weight:500;">🕵️ 익명</span>' : ''}
            </h1>
            ${isAdmin() ? `
                <div style="display:inline-flex; align-items:center; gap:6px; background:#e8f0fe; border:1px solid #c5d4f5; padding:4px 10px; border-radius:6px; margin-bottom:10px; cursor:pointer;"
                     onclick="copyArticleLink('${A.id}')" title="클릭하면 링크 복사">
                    <span style="font-size:11px; color:#1967d2; font-weight:700;">🔑 기사 링크 ID</span>
                    <code style="font-size:11px; color:#1967d2; font-family:monospace;">${A.id}</code>
                    <span style="font-size:10px; color:#5f6368;">📋</span>
                </div>
            ` : ''}
            
            <div class="article-meta" style="border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:20px; display:flex; align-items:center; gap:12px;">
                ${displayPhoto}
                <div style="flex:1;">
                    <div style="font-weight:600; color:#202124;">${displayAuthor}</div>
                    <div style="color:#5f6368; font-size:13px;">${escapeHTML(A.date)}</div>
                </div>
                <span style="color:#5f6368;" id="viewCountDisplay">👁️ ${views}</span>
            </div>
            
            ${A.thumbnail ? `<img src="${A.thumbnail}" style="width:100%;border-radius:8px;margin-bottom:20px;" alt="이미지">` : ''}
            
            <div style="font-size:16px;line-height:1.8;color:#333;">${sanitizeHTML(A.content)}</div>
            
            ${voteSection}
            
            <!-- ✨ AI 요약 버튼 -->
            <div id="_aiSummaryWrap" style="margin:14px 0 4px;">
                <button id="_aiSummaryBtn" onclick="window._aiSummarize()" style="width:100%;padding:11px 18px;border:1.5px solid #c62828;background:white;color:#c62828;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .15s;">✨ AI 요약 보기<span style="font-size:11px;font-weight:400;color:#aaa;">Puter AI</span></button>
                <div id="_aiSummaryResult" style="display:none;margin-top:10px;background:#fff8f8;border:1.5px solid #ffcdd2;border-radius:10px;padding:14px 16px;font-size:14px;line-height:1.75;color:#333;"></div>
            </div>
            
            ${adminArticlePanel}

            ${canEdit ? `<div style="margin-top:20px;text-align:right;">
                <button onclick="editArticle('${A.id}')" class="btn-secondary">수정</button>
                <button onclick="deleteArticle('${A.id}')" class="btn-danger">삭제</button>
            </div>` : ''}
        </div>`;
        
        // ✅ 기사 설정을 전역 캐싱 (A가 정의된 이 스코프에서 처리)
        window._currentArticleSettings = {
            anonymous: A.anonymous || false,
            hideVotes: A.hideVotes || false
        };

        loadCommentsWithProfile(id);

        if(typeof addImageClickHandlersToArticle === 'function') {
            setTimeout(() => addImageClickHandlersToArticle(), 300);
        }
        
    } catch(error) {
        console.error("기사 로드 실패:", error);
        root.innerHTML = `<div style="padding:60px 20px; text-align:center;">
            <p style="color:#f44336;">기사를 불러오는 중 오류가 발생했습니다.</p>
            <button onclick="showArticles()" class="btn-primary" style="margin-top:20px;">목록으로</button>
        </div>`;
    }
}

// ✅ 기사 삭제
function deleteArticle(id) {
    db.ref("articles/" + id).once("value").then(snapshot => {
        const A = snapshot.val();
        if(!A) return alert("없는 기사!");
        
        const currentUser = getNickname();
        if(!isLoggedIn() || (A.author !== currentUser && !isAdmin())) {
            return alert("삭제 권한이 없습니다!");
        }
        
        if(!confirm("정말 이 기사를 삭제하시겠습니까?")) return;
        
        deleteArticleFromDB(id, () => {
            alert("기사가 삭제되었습니다.");
            showArticles();
        });
    });
}

// ✅ 기사 수정
function editArticle(id) {
    console.log("📝 기사 수정 시작:", id);
    
    db.ref("articles/" + id).once("value").then(snapshot => {
        const article = snapshot.val();
        
        if(!article) {
            alert("존재하지 않는 기사입니다!");
            return;
        }
        
        const currentUser = getNickname();
        if(!isLoggedIn() || (article.author !== currentUser && !isAdmin())) {
            alert("수정 권한이 없습니다!");
            return;
        }
        
        console.log("📄 수정할 기사:", {
            id: id,
            title: article.title,
            contentLength: article.content ? article.content.length : 0
        });
        
        // ✅ 수정: 임시저장 비활성화
        if (typeof draftSaveEnabled !== 'undefined') {
            window.draftSaveEnabled = false;
        }
        localStorage.removeItem('draft_article');
        
        hideAll();
        document.getElementById("writeSection").classList.add("active");
        
        // ✅ 수정: 수정 모드 플래그 설정
        window.isEditingArticle = true;
        window.editingArticleId = id;
        
        setTimeout(() => {
            // 1. Quill 에디터 강제 재초기화
            window.quillEditor = null;
            if (typeof editorInitialized !== 'undefined') {
                window.editorInitialized = false;
            }
            
            // 2. 에디터 초기화
            if (typeof initQuillEditor === 'function') {
                initQuillEditor();
            }
            
            // 3. 에디터 준비 대기 및 내용 로드
            const waitForEditor = (attempts = 0) => {
                if (window.quillEditor && window.quillEditor.root) {
                    console.log("✅ Quill 에디터 준비 완료");
                    
                    // 4. 폼 필드 값 설정
                    const categoryEl = document.getElementById("category");
                    const titleEl = document.getElementById("title");
                    const summaryEl = document.getElementById("summary");
                    
                    if (categoryEl) categoryEl.value = article.category || '자유게시판';
                    if (titleEl) titleEl.value = article.title || '';
                    if (summaryEl) summaryEl.value = article.summary || '';
                    
                    // 5. Quill 에디터에 내용 로드 (HTML 형식)
                    try {
                        const contentToLoad = article.content || '';
                        window.quillEditor.root.innerHTML = contentToLoad;
                        
                        console.log("✅ 에디터 내용 로드 완료:", {
                            length: contentToLoad.length,
                            preview: contentToLoad.substring(0, 100)
                        });
                        
                        // ✅ 내용 검증
                        setTimeout(() => {
                            const loadedContent = window.quillEditor.root.innerHTML;
                            if (loadedContent !== contentToLoad) {
                                console.warn("⚠️ 로드된 내용이 원본과 다릅니다!");
                                window.quillEditor.root.innerHTML = contentToLoad;
                            }
                        }, 100);
                        
                    } catch(error) {
                        console.error("❌ Quill 에디터 내용 로드 실패:", error);
                        alert("내용을 불러오는데 실패했습니다: " + error.message);
                        return;
                    }
                    
                    // 6. 썸네일 처리
                    if(article.thumbnail) {
                        const preview = document.getElementById('thumbnailPreview');
                        const uploadText = document.getElementById('uploadText');
                        if (preview && uploadText) {
                            preview.src = article.thumbnail;
                            preview.style.display = 'block';
                            uploadText.innerHTML = '<i class="fas fa-check"></i><p>기존 이미지 (클릭하여 변경)</p>';
                        }
                    }
                    
                    // 7. 수정 폼 설정 (이벤트 바인딩)
                    setupEditForm(article, id);
                    
                } else if (attempts < 50) {
                    setTimeout(() => waitForEditor(attempts + 1), 100);
                } else {
                    console.error("❌ Quill 에디터 초기화 대기 시간 초과");
                    alert("에디터 초기화에 실패했습니다. 페이지를 새로고침해주세요.");
                }
            };
            
            waitForEditor();
        }, 200);
        
    }).catch(error => {
        console.error("❌ 기사 수정 로드 실패:", error);
        alert("기사를 불러오는데 실패했습니다: " + error.message);
    });
}

function setupEditForm(article, articleId) {
    const form = document.getElementById("articleForm");
    
    // ✅ 기존 폼 이벤트 완전히 제거하고 새로 바인딩
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    const titleInput = newForm.querySelector("#title");
    const summaryInput = newForm.querySelector("#summary");
    const warningEl = newForm.querySelector("#bannedWordWarning");
    
    // ✅ 수정: 수정 모드임을 명시적으로 표시
    window.isEditingArticle = true;
    window.editingArticleId = articleId;
    
    console.log("✏️ 수정 모드 활성화:", articleId);
    
    function checkInputs() {
        if (!window.quillEditor || !window.quillEditor.getText) return;
        
        const editorContent = window.quillEditor.getText();
        const combinedText = titleInput.value + " " + summaryInput.value + " " + editorContent;
        const foundWord = checkBannedWords(combinedText);
        
        if (foundWord) {
            warningEl.textContent = `🚫 금지어: "${foundWord}"`;
            warningEl.style.display = "block";
        } else {
            warningEl.style.display = "none";
        }
    }
    
    titleInput.addEventListener("input", checkInputs);
    summaryInput.addEventListener("input", checkInputs);
    
    if (window.quillEditor) {
        window.quillEditor.off('text-change');
        window.quillEditor.on('text-change', checkInputs);
    }
    
    const fileInput = newForm.querySelector('#thumbnailInput');
    fileInput.addEventListener('change', previewThumbnail);
    
    // ✅ 수정: 새로운 폼에 이벤트 바인딩
    newForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        // ✅ 수정: Quill 에디터 내용 확실히 가져오기
        const title = titleInput.value;
        const summary = summaryInput.value;
        const content = window.quillEditor && window.quillEditor.root 
            ? window.quillEditor.root.innerHTML 
            : '';
        
        console.log("🔍 수정 내용:", {
            title: title.substring(0, 30),
            summary: summary.substring(0, 30),
            contentLength: content.length,
            articleId: articleId // ✅ 명시적으로 기존 ID 사용
        });
        
        // 금지어 체크
        const foundWord = checkBannedWords(title + " " + content + " " + summary);
        if (foundWord) {
            alert(`⚠️ 금지어("${foundWord}")가 포함되어 있습니다.`);
            addWarningToCurrentUser();
            return;
        }
        
        // 내용 검증
        if (!title || !content || content === '<p><br></p>') {
            alert("제목과 내용을 입력해주세요.");
            return;
        }
        
        showLoadingIndicator("기사 수정 중...");
        
        // 썸네일 처리
        if (fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                article.thumbnail = e.target.result;
                saveUpdatedArticle();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveUpdatedArticle();
        }
        
        function saveUpdatedArticle() {
            // ✅ 수정: 기사 객체 업데이트 (ID 유지)
            const updatedArticle = {
                ...article,
                id: articleId, // ✅ 중요: 기사 ID 명시적으로 유지
                category: newForm.querySelector("#category").value,
                title: title,
                summary: summary,
                content: content, // ✅ Quill HTML 내용
                date: new Date().toLocaleString() + " (수정됨)",
                lastModified: Date.now()
            };
            
            console.log("💾 저장할 기사:", {
                id: updatedArticle.id,
                title: updatedArticle.title.substring(0, 30),
                contentLength: updatedArticle.content.length
            });
            
            // ✅ 수정: saveArticle 함수로 저장
            saveArticle(updatedArticle, () => {
                hideLoadingIndicator();
                
                // 폼 초기화
                newForm.reset();
                if (window.quillEditor && window.quillEditor.setText) {
                    window.quillEditor.setText('');
                }
                
                const preview = document.getElementById('thumbnailPreview');
                const uploadText = document.getElementById('uploadText');
                if (preview) preview.style.display = 'none';
                if (uploadText) uploadText.innerHTML = '<i class="fas fa-camera"></i><p>이미지 업로드</p>';
                
                warningEl.style.display = "none";
                
                // ✅ 수정 모드 해제
                window.isEditingArticle = false;
                window.editingArticleId = null;
                
                // 임시저장 삭제
                if (typeof clearDraftContent === 'function') {
                    clearDraftContent();
                }
                
                alert("✅ 기사가 수정되었습니다!");
                showArticleDetail(articleId);
            });
        }
    });
}

async function previewThumbnail(event) {
    const file = event.target.files[0];
    if (!file) return;

    // ✅ 파일 검증 (validateImageFile은 script2.js에 정의됨)
    const errors = await validateImageFile(file);
    if (errors.length > 0) {
        alert('❌ 이미지 오류:\n' + errors.join('\n'));
        event.target.value = ''; // 파일 선택 초기화
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('thumbnailPreview');
        const uploadText = document.getElementById('uploadText');
        if (preview && uploadText) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            uploadText.innerHTML = '<i class="fas fa-check"></i><p>이미지 선택됨 (클릭하여 변경)</p>';
        }
    };
    reader.readAsDataURL(file);
}


// ===== 작성 중인 내용 저장 및 복원 =====

// 작성 중인 내용 임시 저장
function saveDraftContent() {
    if (!window.quillEditor) return;
    
    try {
        const draftData = {
            category: document.getElementById("category")?.value || '',
            title: document.getElementById("title")?.value || '',
            summary: document.getElementById("summary")?.value || '',
            content: window.quillEditor.root.innerHTML || '',
            thumbnail: document.getElementById('thumbnailPreview')?.src || '',
            timestamp: Date.now()
        };
        
        localStorage.setItem('articleDraft', JSON.stringify(draftData));
    } catch(error) {
        console.error("임시 저장 실패:", error);
    }
}

// 저장된 임시 내용 복원
function restoreDraftContent() {
    try {
        const savedDraft = localStorage.getItem('articleDraft');
        if (!savedDraft) return;
        
        const draftData = JSON.parse(savedDraft);
        
        // 5분 이내의 임시 저장만 복원
        if (Date.now() - draftData.timestamp > 5 * 60 * 1000) {
            localStorage.removeItem('articleDraft');
            return;
        }
        
        // Quill 에디터가 준비될 때까지 대기
        const waitForEditor = () => {
            if (!window.quillEditor || !window.quillEditor.root) {
                setTimeout(waitForEditor, 100);
                return;
            }
            
            // 폼 필드 복원
            const categoryEl = document.getElementById("category");
            const titleEl = document.getElementById("title");
            const summaryEl = document.getElementById("summary");
            
            if (categoryEl && draftData.category) categoryEl.value = draftData.category;
            if (titleEl && draftData.title) titleEl.value = draftData.title;
            if (summaryEl && draftData.summary) summaryEl.value = draftData.summary;
            
            // Quill 에디터 내용 복원
            if (draftData.content) {
                window.quillEditor.root.innerHTML = draftData.content;
            }
            
            // 썸네일 복원
            if (draftData.thumbnail && draftData.thumbnail.startsWith('data:')) {
                const preview = document.getElementById('thumbnailPreview');
                const uploadText = document.getElementById('uploadText');
                if (preview && uploadText) {
                    preview.src = draftData.thumbnail;
                    preview.style.display = 'block';
                    uploadText.innerHTML = '<i class="fas fa-check"></i><p>기존 이미지 (클릭하여 변경)</p>';
                }
            }
            
            console.log("✅ 임시 저장된 내용 복원 완료");
        };
        
        waitForEditor();
    } catch(error) {
        console.error("임시 내용 복원 실패:", error);
    }
}

// 임시 저장 내용 삭제
function clearDraftContent() {
    localStorage.removeItem('articleDraft');
}


// ===== Quill 에디터 초기화 및 글 작성 폼 설정 =====

// 전역 변수 선언
window.quillEditor = null;
let editorInitialized = false;

function initQuillEditor() {
    console.log("Quill 에디터 초기화 시작...");
    
    const container = document.getElementById('quillEditor');
    if (!container) {
        console.error("quillEditor 컨테이너를 찾을 수 없습니다");
        return null;
    }
    
    // ✅ 수정: 이미 초기화된 에디터가 있으면 재사용
    if (window.quillEditor && editorInitialized) {
        console.log("✅ 기존 Quill 에디터 재사용");
        return window.quillEditor;
    }
    
    // ✅ 수정: 기존 에디터가 있으면 완전히 제거
    if (window.quillEditor) {
        try {
            if (window.quillEditor.theme && window.quillEditor.theme.tooltip) {
                window.quillEditor.theme.tooltip.hide();
            }
            // Quill 이벤트 리스너 모두 제거
            window.quillEditor.off('text-change');
            window.quillEditor = null;
        } catch(e) {
            console.warn("기존 에디터 정리 중 오류:", e);
        }
    }
    
    // ✅ 수정: 툴바도 완전히 제거
    const existingToolbar = document.querySelector('.ql-toolbar');
    if (existingToolbar) {
        existingToolbar.remove();
    }
    
    // DOM 완전히 초기화
    container.innerHTML = '';
    editorInitialized = false;
    
try {
    // ✅ 수정: 마크다운 스타일 바인딩 추가
    const bindings = {
        // ### 큰 제목
        header1: {
            key: '#',
            prefix: /^###\s$/,
            handler: function(range, context) {
                this.quill.formatLine(range.index, 1, 'header', 1);
                this.quill.deleteText(range.index - 4, 4);
            }
        },
        // ## 중간 제목
        header2: {
            key: '#',
            prefix: /^##\s$/,
            handler: function(range, context) {
                this.quill.formatLine(range.index, 1, 'header', 2);
                this.quill.deleteText(range.index - 3, 3);
            }
        },
        // # 작은 제목
        header3: {
            key: '#',
            prefix: /^#\s$/,
            handler: function(range, context) {
                this.quill.formatLine(range.index, 1, 'header', 3);
                this.quill.deleteText(range.index - 2, 2);
            }
        },
        // - 목록
        list: {
            key: ' ',
            prefix: /^-$/,
            handler: function(range, context) {
                this.quill.formatLine(range.index, 1, 'list', 'bullet');
                this.quill.deleteText(range.index - 1, 1);
            }
        },
        // **굵게**
        bold: {
            key: '*',
            prefix: /\*\*(.+)\*\*$/,
            handler: function(range, context) {
                const match = context.prefix.match(/\*\*(.+)\*\*$/);
                if (match) {
                    const text = match[1];
                    const startIndex = range.index - match[0].length;
                    this.quill.deleteText(startIndex, match[0].length);
                    this.quill.insertText(startIndex, text, { bold: true });
                    this.quill.setSelection(startIndex + text.length);
                }
            }
        },
        // *기울임*
        italic: {
            key: '*',
            prefix: /\*(.+)\*$/,
            handler: function(range, context) {
                const match = context.prefix.match(/\*(.+)\*$/);
                if (match && !context.prefix.includes('**')) {
                    const text = match[1];
                    const startIndex = range.index - match[0].length;
                    this.quill.deleteText(startIndex, match[0].length);
                    this.quill.insertText(startIndex, text, { italic: true });
                    this.quill.setSelection(startIndex + text.length);
                }
            }
        },
        // > 인용
        blockquote: {
            key: ' ',
            prefix: /^>$/,
            handler: function(range, context) {
                this.quill.formatLine(range.index, 1, 'blockquote', true);
                this.quill.deleteText(range.index - 1, 1);
            }
        }
    };
    
    // ✅ Quill 에디터 생성
    window.quillEditor = new Quill('#quillEditor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['blockquote'],
                [{ 'align': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            keyboard: {
                bindings: bindings
            }
        },
        placeholder: '' // 플레이스홀더 제거
    });

    editorInitialized = true;
    
    // DOM 업데이트 후 툴바 버튼에 툴팁 추가 (선택사항)
    setTimeout(() => {
        try {
            addQuillTooltips(container);
        } catch(e) {
            // 툴팁 추가 실패해도 무시
        }
    }, 200);
    
    console.log("✅ Quill 에디터 초기화 완료");
    
    // 커스텀 이벤트 발생
    window.dispatchEvent(new Event('quillEditorReady'));
    
    return window.quillEditor;
    
} catch (error) {
    console.error("❌ Quill 에디터 초기화 실패:", error);
    return null;
}}

// Quill 툴바 툴팁 추가 함수
function addQuillTooltips(container, retryCount = 0) {
    setTimeout(() => {
        const toolbar = container.querySelector('.ql-toolbar');
        if (!toolbar) {
            // 최대 2번까지 재시도
            if (retryCount < 2) {
                addQuillTooltips(container, retryCount + 1);
                return;
            } else {
                // 조용히 실패 (툴팁은 선택사항이므로)
                return;
            }
        }
        
        // 툴팁 매핑
        const tooltips = {
            'bold': '굵게',
            'italic': '기울임꼴',
            'underline': '밑줄',
            'strike': '취소선',
            'link': '링크 삽입',
            'image': '이미지 삽입',
            'video': '동영상 삽입',
            'clean': '서식 지우기'
        };
        
        // 각 클래스에 대해 title 속성 추가
        Object.entries(tooltips).forEach(([className, tooltip]) => {
            const buttons = toolbar.querySelectorAll('.ql-' + className);
            buttons.forEach(btn => {
                btn.setAttribute('title', tooltip);
            });
        });
        
        // 헤더 버튼
        toolbar.querySelectorAll('.ql-header').forEach(btn => {
            const value = btn.getAttribute('value');
            if (value === '1') btn.setAttribute('title', '큰 제목');
            else if (value === '2') btn.setAttribute('title', '중간 제목');
            else if (value === '3') btn.setAttribute('title', '작은 제목');
            else if (!value || value === 'false') btn.setAttribute('title', '일반 텍스트');
        });
        
        // 목록 버튼
        toolbar.querySelectorAll('.ql-list').forEach(btn => {
            const value = btn.getAttribute('value');
            if (value === 'ordered') btn.setAttribute('title', '번호 목록');
            else if (value === 'bullet') btn.setAttribute('title', '글머리 기호 목록');
        });
        
        // 정렬 버튼
        toolbar.querySelectorAll('.ql-align').forEach(btn => {
            const value = btn.getAttribute('value');
            if (!value) btn.setAttribute('title', '왼쪽 정렬');
            else if (value === 'center') btn.setAttribute('title', '가운데 정렬');
            else if (value === 'right') btn.setAttribute('title', '오른쪽 정렬');
            else if (value === 'justify') btn.setAttribute('title', '양쪽 정렬');
        });
        
        // 색상 피커
        toolbar.querySelectorAll('.ql-color').forEach(btn => {
            btn.setAttribute('title', '글자 색상');
        });
        
        toolbar.querySelectorAll('.ql-background').forEach(btn => {
            btn.setAttribute('title', '배경 색상');
        });
        
        console.log("Quill 툴바 툴팁 추가 완료");
    }, 200);
}

function setupArticleForm() {
    console.log("🔧 setupArticleForm 시작");
    
    // ✅ 수정 모드 강제 해제
    if (window.isEditingArticle) {
        console.warn("⚠️ 수정 모드가 활성화되어 있었습니다. 강제 해제합니다.");
        window.isEditingArticle = false;
        window.editingArticleId = null;
    }
    
    const form = document.getElementById("articleForm");
    if (!form) {
        console.error("❌ articleForm을 찾을 수 없습니다");
        return;
    }
    
    // ✅ 에디터가 이미 초기화되어 있으면 재사용
    let editor = window.quillEditor;
    if (!editor || !editorInitialized) {
        editor = initQuillEditor();
    } else {
        console.log("✅ 기존 Quill 에디터 재사용");
    }
    
    // ✅ 폼 완전히 초기화
    form.reset();
    
    // ✅ 에디터 내용 초기화
    setTimeout(() => {
        if (window.quillEditor) {
            window.quillEditor.setText('');
        }
        clearDraftContent();
    }, 100);
    
    const preview = document.getElementById('thumbnailPreview');
    const uploadText = document.getElementById('uploadText');
    if (preview) preview.style.display = 'none';
    if (uploadText) uploadText.innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
    
    // 작성 중인 내용 자동 저장 (3초마다)
    if (window.autoSaveInterval) {
        clearInterval(window.autoSaveInterval);
    }
    window.autoSaveInterval = setInterval(() => {
        if (!window.isEditingArticle) {
            saveDraftContent();
        }
    }, 3000);
    
    // 금지어 체크 함수
    function checkInputs() {
        const titleInput = document.getElementById("title");
        const summaryInput = document.getElementById("summary");
        const warningEl = document.getElementById("bannedWordWarning");
        
        if (!window.quillEditor || !titleInput || !summaryInput) return;
        
        const editorContent = window.quillEditor.getText();
        const combinedText = (titleInput.value + " " + summaryInput.value + " " + editorContent);
        const foundWord = checkBannedWords(combinedText);
        
        if (foundWord) {
            warningEl.textContent = `금지어가 포함되어 있습니다: "${foundWord}"`;
            warningEl.style.display = "block";
        } else {
            warningEl.style.display = "none";
        }
    }
    
    // ✅ 이벤트 리스너 추가 (기존 리스너 제거)
    const titleInput = document.getElementById("title");
    const summaryInput = document.getElementById("summary");
    
    if (titleInput) {
        const newTitleInput = titleInput.cloneNode(true);
        titleInput.parentNode.replaceChild(newTitleInput, titleInput);
        newTitleInput.addEventListener("input", checkInputs);
    }
    
    if (summaryInput) {
        const newSummaryInput = summaryInput.cloneNode(true);
        summaryInput.parentNode.replaceChild(newSummaryInput, summaryInput);
        newSummaryInput.addEventListener("input", checkInputs);
    }
    
    // Quill 에디터 변경 감지
    if (window.quillEditor) {
        window.quillEditor.off('text-change');
        window.quillEditor.on('text-change', checkInputs);
    }
    
    // 파일 입력 이벤트
    const fileInput = document.getElementById('thumbnailInput');
    if (fileInput) {
        const newFileInput = fileInput.cloneNode(true);
        fileInput.parentNode.replaceChild(newFileInput, fileInput);
        newFileInput.addEventListener('change', previewThumbnail);
    }
    
    // ✅ 폼 제출 이벤트 - onsubmit 사용 (addEventListener 대신)
    form.onsubmit = async function(e) {
        e.preventDefault();
        
        // ✅ 중복 제출 방지
        if (window.isSubmitting) {
            console.warn("⚠️ 이미 제출 중입니다!");
            return;
        }
        window.isSubmitting = true;

        form.onsubmit = async function(e) {
        e.preventDefault();
        if (window.isSubmitting) {
            console.warn("⚠️ 이미 제출 중입니다!");
            return;
        }
        window.isSubmitting = true;

        // ✅ 속도 제한 (10분에 3개)
        if (!rateLimiter.check('article', 3, 10 * 60 * 1000)) {
            alert("⚠️ 기사를 너무 빠르게 작성하고 있습니다. 잠시 후 다시 시도해주세요.");
            window.isSubmitting = false;
            return;
        }}
        
        // ✅ 제출 시점에 요소를 다시 찾기
        const titleInput = document.getElementById("title");
        const summaryInput = document.getElementById("summary");
        const categoryInput = document.getElementById("category");
        const warningEl = document.getElementById("bannedWordWarning");
        
        // ✅ 중요: 수정 모드인지 확인
        if (window.isEditingArticle && window.editingArticleId) {
            console.warn("⚠️ 수정 모드가 활성화되어 있습니다. 새 기사 작성이 아닙니다!");
            alert("⚠️ 현재 수정 모드입니다. 새 기사를 작성하려면 '작성' 메뉴를 다시 클릭해주세요.");
            window.isSubmitting = false;
            return;
        }
        
        if (!isLoggedIn()) {
            alert("기사 작성은 로그인 후 가능합니다!");
            window.isSubmitting = false;
            return;
        }

        if (!window.quillEditor) {
            alert("에디터가 초기화되지 않았습니다. 페이지를 새로고침해주세요.");
            window.isSubmitting = false;
            return;
        }

        const title = titleInput ? titleInput.value.trim() : '';
        const content = window.quillEditor.root ? window.quillEditor.root.innerHTML : '';
        const summary = summaryInput ? summaryInput.value.trim() : '';
        const category = categoryInput ? categoryInput.value : '자유게시판';

        console.log("📝 입력값 확인:", {
            title: title,
            titleLength: title.length,
            content: content.substring(0, 50),
            contentLength: content.length,
            summary: summary
        });

        if (!title || !content || content === '<p><br></p>' || content === '<p></p>') {
            alert("제목과 내용을 입력해주세요.");
            window.isSubmitting = false;
            return;
        }

        // 금지어 체크
        const foundWord = checkBannedWords(title + " " + content + " " + summary);
        if (foundWord) {
            alert(`금지어("${foundWord}")가 포함되어 업로드가 차단되고 경고 1회가 누적됩니다.`);
            addWarningToCurrentUser();
            window.isSubmitting = false;
            return;
        }
        
        // ✅ 항상 새로운 ID 생성
        const _imp = isAdmin() && window._adminImpersonateUser;
        const article = {
            id: Date.now().toString(),
            category: category,
            title: title,
            summary: summary,
            content: content,
            author:      _imp ? _imp.nick  : getNickname(),
            authorEmail: _imp ? _imp.email : getUserEmail(),
            authorUid:   _imp ? _imp.uid   : getUserId(),
            date: new Date().toLocaleString(),
            createdAt: Date.now(), 
            views: 0,
            likeCount: 0,
            dislikeCount: 0,
            thumbnail: null,
            anonymous: document.getElementById('articleAnonymous')?.checked || false,
            hideVotes: document.getElementById('articleHideVotes')?.checked || false,
            noNotify: document.getElementById('articleNoNotify')?.checked || false
        };

        console.log("📝 새 기사 작성:", article.id);
        
        const fileInputSubmit = document.getElementById('thumbnailInput');
        if (fileInputSubmit && fileInputSubmit.files[0]) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                article.thumbnail = e.target.result;
                saveArticle(article, async () => {
                    resetFormAfterSubmit();
                    window.isSubmitting = false;
                    
                    if (!article.noNotify) {
                        await sendNotification('article', {
                            authorEmail: article.authorEmail,
                            authorName: article.anonymous ? '익명 유저' : article.author,
                            title: article.title,
                            articleId: article.id,
                            anonymous: article.anonymous || false
                        });
                        triggerGithubNotification(true); // ✅ noNotify가 아닐 때만 트리거
                    }
                    showArticles();
                });
            };
            reader.readAsDataURL(fileInputSubmit.files[0]);
        } else {
            saveArticle(article, async () => {
                resetFormAfterSubmit();
                window.isSubmitting = false;
                
                if (!article.noNotify) {
                    await sendNotification('article', {
                        authorEmail: article.authorEmail,
                        authorName: article.anonymous ? '익명 유저' : article.author,
                        title: article.title,
                        articleId: article.id,
                        category: article.category,
                        anonymous: article.anonymous || false
                    });
                    triggerGithubNotification(true); // ✅ noNotify가 아닐 때만 트리거
                }
                showArticles();
            });
        }
    };
    
    // ✅ 폼 리셋 함수
    function resetFormAfterSubmit() {
        const form = document.getElementById("articleForm");
        if (form) form.reset();
        
        if (window.quillEditor) {
            window.quillEditor.setText('');
        }
        
        const preview = document.getElementById('thumbnailPreview');
        const uploadText = document.getElementById('uploadText');
        if (preview) preview.style.display = 'none';
        if (uploadText) uploadText.innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
        
        const warningEl = document.getElementById("bannedWordWarning");
        if (warningEl) warningEl.style.display = "none";
        
        clearDraftContent();
        
        alert("기사가 발행되었습니다!");
    }
    
    console.log("✅ setupArticleForm 완료");
}

// ✅ 기사 수정 폼 설정 (setupEditForm도 수정)
function setupEditForm(article, articleId) {
    const form = document.getElementById("articleForm");
    
    const titleInput = document.getElementById("title");
    const summaryInput = document.getElementById("summary");
    const warningEl = document.getElementById("bannedWordWarning");
    
    function checkInputs() {
        if (!window.quillEditor?.getText) return;
        
        const editorContent = window.quillEditor.getText();
        const combinedText = titleInput.value + " " + summaryInput.value + " " + editorContent;
        const foundWord = checkBannedWords(combinedText);
        
        if (foundWord) {
            warningEl.textContent = `🚫 금지어: "${foundWord}"`;
            warningEl.style.display = "block";
        } else {
            warningEl.style.display = "none";
        }
    }
    
    titleInput.addEventListener("input", checkInputs);
    summaryInput.addEventListener("input", checkInputs);
    
    const fileInput = document.getElementById('thumbnailInput');
    fileInput.addEventListener('change', previewThumbnail);
    
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const title = titleInput.value;
        const summary = summaryInput.value;
        const content = window.quillEditor?.root?.innerHTML || '';
        
        const foundWord = checkBannedWords(title + " " + content + " " + summary);
        if (foundWord) {
            alert(`⚠️ 금지어("${foundWord}")가 포함되어 있습니다.`);
            addWarningToCurrentUser();
            return;
        }
        
        if (fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                article.thumbnail = e.target.result;
                saveUpdatedArticle();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveUpdatedArticle();
        }
        
        function saveUpdatedArticle() {
            article.category = document.getElementById("category").value;
            article.title = title;
            article.summary = summary;
            article.content = content;
            article.date = new Date().toLocaleString() + " (수정됨)";
            
            saveArticle(article, () => {
                form.reset();
                if (window.quillEditor?.setText) {
                    window.quillEditor.setText('');
                }
                const preview = document.getElementById('thumbnailPreview');
                const uploadText = document.getElementById('uploadText');
                if (preview) preview.style.display = 'none';
                if (uploadText) uploadText.innerHTML = '<i class="fas fa-camera"></i><p>이미지 업로드</p>';
                warningEl.style.display = "none";
                
                clearDraftContent();
                
                alert("기사가 수정되었습니다!");
                showArticleDetail(articleId);
            });
        }
    };
}

console.log("✅ Quill 에디터 시스템 로드 완료");

// ===== Part 9: 댓글 관리 =====

const rateLimiter = {
    _records: {},
    check(action, limit, windowMs) {
        const key = `${getUserId()}_${action}`;
        const now = Date.now();
        if (!this._records[key]) this._records[key] = [];
        this._records[key] = this._records[key].filter(t => now - t < windowMs);
        if (this._records[key].length >= limit) return false;
        this._records[key].push(now);
        return true;
    }
};

// ✅ 댓글 로드 (프로필 사진 포함)
async function loadCommentsWithProfile(id) {
    await authReady; // ✅ 인증 초기화 대기 (프로필 사진 캐시 오염 방지)
    const currentUser = getNickname();
    const currentEmail = getUserEmail();
    const myUid = getUserId();
    
    try {
        const [commentsSnap, votesSnap] = await Promise.all([
            db.ref("comments/" + id).once("value"),
            isLoggedIn() ? db.ref(`commentVotes/${id}`).once("value") : Promise.resolve(null)
        ]);

        const val = commentsSnap.val() || {};
        const votesData = votesSnap ? (votesSnap.val() || {}) : {};

        let commentsList = Object.entries(val);

        // 정렬
        // commentsList의 key가 Date.now() 기반이라 숫자 비교로 정렬
if (currentCommentSort === 'oldest') {
    commentsList.sort((a,b) => Number(a[0]) - Number(b[0]));
} else if (currentCommentSort === 'likes') {
    commentsList.sort((a,b) => (b[1].likeCount||0) - (a[1].likeCount||0));
} else {
    commentsList.sort((a,b) => Number(b[0]) - Number(a[0]));
}
        
        const root = document.getElementById("comments");
        const countEl = document.getElementById("commentCount");
        if(countEl) countEl.textContent = `(${commentsList.length})`;

        if (!commentsList.length) {
            root.innerHTML = "<p style='color:#868e96;text-align:center;padding:30px;'>첫 댓글을 남겨보세요!</p>";
            document.getElementById("loadMoreComments").innerHTML = "";
            return;
        }

        const endIdx = currentCommentPage * COMMENTS_PER_PAGE;
        const displayComments = commentsList.slice(0, endIdx);

        // 프로필 사진 캐시
        const emails = [...new Set(displayComments.map(([_, c]) => c.authorEmail).filter(Boolean))];
        displayComments.forEach(([_, comment]) => {
            if (comment.replies) {
                Object.values(comment.replies).forEach(r => { if (r.authorEmail) emails.push(r.authorEmail); });
            }
        });
        const uniqueEmails = [...new Set(emails)];
        const uncachedEmails = uniqueEmails.filter(e => !window.profilePhotoCache.has(e));
        if (uncachedEmails.length > 0) {
            if (isLoggedIn()) {
                // ✅ email → uid 맵 구성 (댓글/답글에 authorUid 있으면 직접 조회, 없으면 email 쿼리)
                const emailToUid = {};
                displayComments.forEach(([_, comment]) => {
                    if (comment.authorEmail && comment.authorUid) emailToUid[comment.authorEmail] = comment.authorUid;
                    if (comment.replies) {
                        Object.values(comment.replies).forEach(r => {
                            if (r.authorEmail && r.authorUid) emailToUid[r.authorEmail] = r.authorUid;
                        });
                    }
                });
                try {
                    await Promise.all(uncachedEmails.map(async email => {
                        try {
                            const uid = emailToUid[email];
                            if (uid) {
                                // ✅ UID로 직접 조회 (빠르고 안정적)
                                const snap = await db.ref("users/" + uid + "/profilePhoto").once("value");
                                window.profilePhotoCache.set(email, snap.val() || null);
                            } else {
                                // fallback: 이메일 쿼리 (authorUid 없는 구댓글)
                                const snap = await db.ref("users").orderByChild("email").equalTo(email).limitToFirst(1).once("value");
                                const v = snap.val();
                                const u = v ? Object.values(v)[0] : null;
                                window.profilePhotoCache.set(email, u ? (u.profilePhoto||null) : null);
                            }
                        } catch(e) { window.profilePhotoCache.set(email, null); }
                    }));
                } catch(e) {
                    uncachedEmails.forEach(email => window.profilePhotoCache.set(email, null));
                }
            }
            // ✅ 비로그인 시에는 null로 캐싱하지 않음 — authReady 이후 재호출되면 정상 로드됨
        }

        // ── 답글 트리 렌더 헬퍼 (재귀) ──
        function renderReplies(repliesObj, commentId) {
            if (!repliesObj) return '';
            // 전체 flat 정렬
            const all = Object.entries(repliesObj).sort((a,b) => new Date(a[1].timestamp) - new Date(b[1].timestamp));

            // replyId → author 이름 빠른 조회용
            const replyAuthorMap = {};
            all.forEach(([rid, r]) => { replyAuthorMap[rid] = r.author; });

            // 트리 구조: 루트 + childMap 구성 (렌더 순서용)
            const roots = all.filter(([_, r]) => !r.parentReplyId);
            const childMap = {};
            all.forEach(([rid, r]) => {
                if (r.parentReplyId) {
                    if (!childMap[r.parentReplyId]) childMap[r.parentReplyId] = [];
                    childMap[r.parentReplyId].push([rid, r]);
                }
            });

            // 재귀적으로 트리 순서로 flat 배열로 펼침
            const ordered = [];
            function flatten([replyId, reply]) {
                ordered.push([replyId, reply]);
                (childMap[replyId] || []).forEach(flatten);
            }
            roots.forEach(flatten);

            return ordered.map(([replyId, reply]) => {
                const isMyReply = isLoggedIn() && (reply.authorEmail === currentEmail || isAdmin());
                // ✅ 익명 답글: 관리자 해제 상태 확인
                const _rRevealedByAdmin = isAdmin() && !!(window._adminRevealAnonymous || {})[id];
                const _rIsAnon = !!(_settings && _settings.anonymous);
                const rPhotoHTML = (_rIsAnon && !_rRevealedByAdmin)
                    ? getProfilePlaceholder(null, 24)
                    : getProfilePlaceholder(window.profilePhotoCache.get(reply.authorEmail)||null, 24);
                const editedBadge = reply.edited ? `<span class="edited-badge"><i class="fas fa-edit"></i> 수정됨</span>` : '';

                // depth 무관하게 들여쓰기 고정: 최대 1단계(20px)만
                const isChild = !!reply.parentReplyId;
                const indent = isChild ? 20 : 0;

                // 누구에게 답한 건지 @멘션 표시
                const mentionName = isChild ? (replyAuthorMap[reply.parentReplyId] || null) : null;
                const mentionBadge = mentionName
                    ? `<span style="color:#c62828;font-size:12px;font-weight:600;margin-right:4px;">@${escapeHTML(mentionName)}</span>`
                    : '';

                return `
                    <div class="reply-item" id="reply-${commentId}-${replyId}" style="margin-left:${indent}px;">
                        <div class="reply-header">
                            ${rPhotoHTML}
                            <span class="reply-author">↳ ${
                                _rIsAnon
                                    ? (_rRevealedByAdmin
                                        ? `${escapeHTML(reply.author)} <span style="font-size:10px;background:#fff3e0;color:#e65100;padding:1px 6px;border-radius:8px;font-weight:600;">🔓</span>`
                                        : '익명')
                                    : escapeHTML(reply.author)
                            }</span>
                            <span class="reply-time">${escapeHTML(reply.timestamp)}</span>
                            ${editedBadge}
                        </div>
                        <div class="reply-content" id="replyContent-${commentId}-${replyId}" style="white-space:pre-wrap;">${mentionBadge}${escapeHTML(reply.text)}</div>
${reply.imageBase64 ? `
    <div style="margin-top:6px;">
        <img src="${reply.imageBase64}" onclick="openImageModal('${reply.imageBase64}')" style="max-width:100%; max-height:200px; border-radius:8px; cursor:pointer; object-fit:cover;">
    </div>
` : ''}
                        <div class="reply-edit-form" id="replyEditForm-${commentId}-${replyId}" style="display:none;">
                            <textarea id="replyEditInput-${commentId}-${replyId}" class="reply-input" style="resize:none; overflow:hidden; min-height:36px; max-height:100px; line-height:1.4; border-radius:16px; padding:8px 12px; width:100%; box-sizing:border-box;" onkeydown="if(event.key==='Enter' && !event.shiftKey){ event.preventDefault(); saveReplyEdit('${id}', '${commentId}', '${replyId}'); }" oninput="autoResizeTextarea(this)">${reply.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                            <div style="display:flex; gap:5px; margin-top:5px;">
                                <button onclick="saveReplyEdit('${id}', '${commentId}', '${replyId}')" class="btn-text" style="color:#1976d2;">저장</button>
                                <button onclick="cancelReplyEdit('${commentId}', '${replyId}')" class="btn-text">취소</button>
                            </div>
                        </div>
                        <div class="reply-actions">
                            <button onclick="toggleNestedReplyForm('${commentId}', '${replyId}')" class="btn-text" style="font-size:11px;">💬 답글</button>
                            ${isMyReply ? `
                                <button onclick="editReply('${commentId}', '${replyId}')" class="btn-text" style="font-size:11px;">✏️ 수정</button>
                                <button onclick="deleteReply('${id}', '${commentId}', '${replyId}')" class="btn-text-danger" style="font-size:11px;">삭제</button>
                            ` : ''}
                        </div>
                        <div id="nestedReplyForm-${commentId}-${replyId}" class="reply-input-area" style="display:none; margin-left:8px; flex-direction:column; gap:6px;">
    <div id="nestedReplyImagePreview-${commentId}-${replyId}" style="display:none; position:relative;">
        <img id="nestedReplyImagePreviewImg-${commentId}-${replyId}" style="max-height:100px; max-width:100%; border-radius:8px; object-fit:contain; border:1px solid #dee2e6;">
        <button onclick="clearNestedReplyImage('${commentId}','${replyId}')" style="position:absolute; top:3px; right:3px; background:rgba(0,0,0,0.55); color:white; border:none; border-radius:50%; width:20px; height:20px; font-size:11px; cursor:pointer; display:flex; align-items:center; justify-content:center;"><i class="fas fa-times"></i></button>
    </div>
    <div style="display:flex; align-items:flex-end; gap:6px;">
        <textarea id="nestedReplyInput-${commentId}-${replyId}" class="reply-input" placeholder="답글 입력..." rows="1"
            style="resize:none; overflow:hidden; min-height:36px; max-height:100px; line-height:1.4; flex:1; border-radius:16px; padding:8px 12px;"
            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();submitNestedReply('${id}','${commentId}','${replyId}')}"
            oninput="autoResizeTextarea(this)"></textarea>
        <input type="file" id="nestedReplyImageInput-${commentId}-${replyId}" accept="image/*" style="display:none;" onchange="previewNestedReplyImage(this,'${commentId}','${replyId}')">
        <button onclick="document.getElementById('nestedReplyImageInput-${commentId}-${replyId}').click()" class="btn-reply-submit" style="background:#f0f4f8; color:#495057;"><i class="fas fa-camera"></i></button>
        <button onclick="submitNestedReply('${id}', '${commentId}', '${replyId}')" class="btn-reply-submit"><i class="fas fa-paper-plane"></i></button>
    </div>
</div>
                    </div>
                `;
            }).join('');
        }
        const _settings = window._currentArticleSettings || {};
        const commentsHTML = displayComments.map(([commentId, comment]) => {
            const isMyComment = isLoggedIn() && (comment.authorEmail === currentEmail || isAdmin());

            // ✅ 익명 처리
            // ✅ 익명 댓글: 관리자 해제 상태 확인
            const _cRevealedByAdmin = isAdmin() && !!(window._adminRevealAnonymous || {})[currentArticleId];
            const displayCommentAuthor = _settings.anonymous
                ? (_cRevealedByAdmin
                    ? `${escapeHTML(comment.author)} <span style="font-size:10px;background:#fff3e0;color:#e65100;padding:1px 6px;border-radius:8px;font-weight:600;">🔓</span>`
                    : '익명')
                : escapeHTML(comment.author);
            const photoUrl = (_settings.anonymous && !_cRevealedByAdmin) ? null : (window.profilePhotoCache.get(comment.authorEmail) || null);
            const authorPhotoHTML = getProfilePlaceholder(photoUrl, 32);

            const commentEditedBadge = comment.edited ? `<span class="edited-badge"><i class="fas fa-edit"></i> 수정됨</span>` : '';

            const myCommentVote = votesData[commentId] ? (votesData[commentId][myUid] || null) : null;
            const likeCount = comment.likeCount || 0;
            const dislikeCount = comment.dislikeCount || 0;
            const likeActive = myCommentVote === 'like' ? 'background:#e3f2fd; color:#1565c0; border-color:#1565c0;' : '';
            const dislikeActive = myCommentVote === 'dislike' ? 'background:#fce4ec; color:#c62828; border-color:#c62828;' : '';

            // ✅ 추천/비추천 숨김 처리
            const commentVoteHTML = _settings.hideVotes && !isAdmin()
                ? ''
                : `<button id="clike-${commentId}" onclick="toggleCommentVote('${id}','${commentId}','like')" style="border:1px solid #ddd; border-radius:20px; padding:3px 10px; font-size:12px; background:#fff; cursor:pointer; ${likeActive}">👍 ${likeCount}</button>
                   <button id="cdislike-${commentId}" onclick="toggleCommentVote('${id}','${commentId}','dislike')" style="border:1px solid #ddd; border-radius:20px; padding:3px 10px; font-size:12px; background:#fff; cursor:pointer; ${dislikeActive}">👎 ${dislikeCount}</button>`;

            const repliesHTML = renderReplies(comment.replies, commentId);

            return `
                <div class="comment-card" id="comment-${commentId}">
                    <div class="comment-header">
                        ${authorPhotoHTML}
                        <span class="comment-author">${displayCommentAuthor}</span>
                        <span class="comment-time">${escapeHTML(comment.timestamp)}</span>
                        ${commentEditedBadge}
                    </div>
                   <div class="comment-body" id="commentBody-${commentId}" style="white-space: pre-wrap;">${escapeHTML(comment.text)}</div>
${comment.imageBase64 ? `
    <div class="comment-media" style="margin-top:8px;">
        <img src="${comment.imageBase64}" onclick="openImageModal('${comment.imageBase64}')" style="max-width:100%; max-height:300px; border-radius:8px; cursor:pointer; object-fit:cover;">
    </div>
` : comment.mediaUrl ? `
    <div class="comment-media" style="margin-top:8px;">
        ${comment.mediaType === 'video'
            ? `<video src="${comment.mediaUrl}" controls style="max-width:100%; max-height:300px; border-radius:8px;"></video>`
            : `<img src="${comment.mediaUrl}" onclick="openImageModal('${comment.mediaUrl}')" style="max-width:100%; max-height:300px; border-radius:8px; cursor:pointer; object-fit:cover;">`
        }
    </div>
` : ''}
                    
                    <div class="comment-edit-form" id="commentEditForm-${commentId}" style="display:none;">
                        <textarea id="commentEditInput-${commentId}" class="comment-edit-textarea" onkeydown="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); saveCommentEdit('${id}', '${commentId}'); }">${comment.text}</textarea>
                        <div style="display:flex; gap:10px; margin-top:10px;">
                            <button onclick="saveCommentEdit('${id}', '${commentId}')" class="btn-primary" style="padding:8px 16px; font-size:13px;">저장</button>
                            <button onclick="cancelCommentEdit('${commentId}')" class="btn-secondary" style="padding:8px 16px; font-size:13px;">취소</button>
                        </div>
                    </div>
                    
                    <div class="comment-footer" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        ${commentVoteHTML}
                        <button onclick="toggleReplyForm('${commentId}')" class="btn-text">💬 답글</button>
                        ${isMyComment ? `
                            <button onclick="editComment('${commentId}')" class="btn-text">✏️ 수정</button>
                            <button onclick="deleteComment('${id}', '${commentId}', '${comment.author}')" class="btn-text text-danger">삭제</button>
                        ` : ''}
                    </div>

                    <div class="replies-container">
                        ${repliesHTML}
                    </div>

                    <div id="replyForm-${commentId}" class="reply-input-area" style="display:none; flex-direction:column; gap:6px;">
    <div id="replyImagePreview-${commentId}" style="display:none; position:relative;">
        <img id="replyImagePreviewImg-${commentId}" style="max-height:100px; max-width:100%; border-radius:8px; object-fit:contain; border:1px solid #dee2e6;">
        <button onclick="clearReplyImage('${commentId}')" style="position:absolute; top:3px; right:3px; background:rgba(0,0,0,0.55); color:white; border:none; border-radius:50%; width:20px; height:20px; font-size:11px; cursor:pointer; display:flex; align-items:center; justify-content:center;"><i class="fas fa-times"></i></button>
    </div>
    <div style="display:flex; align-items:flex-end; gap:6px;">
       <textarea id="replyInput-${commentId}" class="reply-input" placeholder="답글을 입력하세요" rows="1"
            style="resize:none; overflow:hidden; min-height:36px; max-height:100px; line-height:1.4; flex:1; border-radius:16px; padding:8px 12px;"
            onkeydown="(function(e){ if(e.key==='Enter'){ const mob=/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent); if(mob){e.preventDefault();submitReply('${id}','${commentId}');}else if(!e.shiftKey){e.preventDefault();submitReply('${id}','${commentId}');} } })(event)"
            oninput="autoResizeTextarea(this)"></textarea>
        <input type="file" id="replyImageInput-${commentId}" accept="image/*" style="display:none;" onchange="previewReplyImage(this,'${commentId}')">
        <button onclick="document.getElementById('replyImageInput-${commentId}').click()" class="btn-reply-submit" style="background:#f0f4f8; color:#495057;"><i class="fas fa-camera"></i></button>
        <button onclick="submitReply('${id}', '${commentId}')" class="btn-reply-submit"><i class="fas fa-paper-plane"></i></button>
    </div>
</div>
                </div>
            `;
        }).join('');

        root.innerHTML = commentsHTML;

        const loadMoreBtn = document.getElementById("loadMoreComments");
        if (endIdx < commentsList.length) {
            loadMoreBtn.innerHTML = `<button onclick="loadMoreComments()" class="btn-secondary btn-block">댓글 더보기 (${commentsList.length - endIdx}+)</button>`;
        } else {
            loadMoreBtn.innerHTML = "";
        }
        
    } catch(error) {
        console.error("댓글 로드 실패:", error);
        document.getElementById("comments").innerHTML = "<p style='color:#f44336;text-align:center;padding:30px;'>댓글을 불러오는 중 오류가 발생했습니다.</p>";
    }
}

// ✅ 댓글 수정 모드로 전환
window.editComment = function(commentId) {
    const commentBody = document.getElementById(`commentBody-${commentId}`);
    const editForm = document.getElementById(`commentEditForm-${commentId}`);
    
    if(!commentBody || !editForm) return;
    
    // 댓글 내용 숨기고 수정 폼 표시
    commentBody.style.display = 'none';
    editForm.style.display = 'block';
    
    // 입력창에 포커스
    const input = document.getElementById(`commentEditInput-${commentId}`);
    if(input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
};

window.saveCommentEdit = async function(articleId, commentId) {
    if (!isLoggedIn()) {
        alert("로그인이 필요합니다.");
        return;
    }

    const input = document.getElementById(`commentEditInput-${commentId}`);
    if (!input) return;

    const newText = input.value.trim();
    if (!newText) {
        alert("댓글 내용을 입력해주세요!");
        return;
    }

    // ✅ 길이 제한
    if (newText.length > 1000) {
        alert("댓글은 1000자 이하로 입력해주세요.");
        return;
    }

    // ✅ 수정 전 DB에서 소유자 재확인 (클라이언트 신뢰 불가)
    try {
        const snap = await db.ref(`comments/${articleId}/${commentId}`).once('value');
        const commentData = snap.val();

        if (!commentData) {
            alert("댓글을 찾을 수 없습니다.");
            return;
        }

        const currentEmail = getUserEmail();
        const isOwner = commentData.authorEmail === currentEmail;
        const adminStatus = await isAdminAsync(); // ✅ 쿠키 대신 DB 확인

        if (!isOwner && !adminStatus) {
            alert("🚫 수정 권한이 없습니다.");
            return;
        }

        // 금지어 체크
        const foundWord = checkBannedWords(newText);
        if (foundWord) {
            alert(`⚠️ 금지어("${foundWord}")가 포함되어 있습니다.`);
            addWarningToCurrentUser();
            return;
        }

        // ✅ 개별 필드 3번 호출 → update 1번으로 변경 (원자적 처리)
        await db.ref(`comments/${articleId}/${commentId}`).update({
            text: newText,
            edited: true,
            editedAt: new Date().toLocaleString()
        });

        loadComments(articleId);

    } catch (error) {
        console.error("댓글 수정 실패:", error);
        alert("댓글 수정 중 오류가 발생했습니다: " + error.message);
    }
};

// ✅ 댓글 수정 취소
window.cancelCommentEdit = function(commentId) {
    const commentBody = document.getElementById(`commentBody-${commentId}`);
    const editForm = document.getElementById(`commentEditForm-${commentId}`);
    
    if(!commentBody || !editForm) return;
    
    // 수정 폼 숨기고 원래 내용 표시
    editForm.style.display = 'none';
    commentBody.style.display = 'block';
};

// ✅ 답글 수정 모드로 전환
window.editReply = function(commentId, replyId) {
    const replyContent = document.getElementById(`replyContent-${commentId}-${replyId}`);
    const editForm = document.getElementById(`replyEditForm-${commentId}-${replyId}`);
    
    if(!replyContent || !editForm) return;
    
    // 답글 내용 숨기고 수정 폼 표시
    replyContent.style.display = 'none';
    editForm.style.display = 'block';
    
    // 입력창에 포커스
    const input = document.getElementById(`replyEditInput-${commentId}-${replyId}`);
    if(input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
};

// ✅ 답글 수정 저장
window.saveReplyEdit = async function(articleId, commentId, replyId) {
    const input = document.getElementById(`replyEditInput-${commentId}-${replyId}`);
    if(!input) return;
    
    const newText = input.value.trim();
    
    if(!newText) {
        alert("답글 내용을 입력해주세요!");
        return;
    }
    
    // 금지어 체크
    const foundWord = checkBannedWords(newText);
    if(foundWord) {
        alert(`⚠️ 금지어("${foundWord}")가 포함되어 있습니다.`);
        return;
    }
    
    try {
        // Firebase에 업데이트
        await db.ref(`comments/${articleId}/${commentId}/replies/${replyId}/text`).set(newText);
        await db.ref(`comments/${articleId}/${commentId}/replies/${replyId}/edited`).set(true);
        await db.ref(`comments/${articleId}/${commentId}/replies/${replyId}/editedAt`).set(new Date().toLocaleString());
        
        // 화면 새로고침
        loadComments(articleId);
        
        console.log("✅ 답글 수정 완료");
        
    } catch(error) {
        console.error("답글 수정 실패:", error);
        alert("답글 수정 중 오류가 발생했습니다: " + error.message);
    }
};

// ✅ 답글 수정 취소
window.cancelReplyEdit = function(commentId, replyId) {
    const replyContent = document.getElementById(`replyContent-${commentId}-${replyId}`);
    const editForm = document.getElementById(`replyEditForm-${commentId}-${replyId}`);
    
    if(!replyContent || !editForm) return;
    
    // 수정 폼 숨기고 원래 내용 표시
    editForm.style.display = 'none';
    replyContent.style.display = 'block';
};

// ✅ 댓글 로드 (호환성)
function loadComments(id) {
    // _currentArticleSettings는 showArticleDetail에서 세팅됨
    // 혹시 세팅 안 된 경우(직접 호출 등)를 대비해 DB에서 재조회
    if (!window._currentArticleSettings) {
        db.ref("articles/" + id).once("value").then(snap => {
            const article = snap.val() || {};
            window._currentArticleSettings = {
                anonymous: article.anonymous || false,
                hideVotes: article.hideVotes || false
            };
            loadCommentsWithProfile(id);
        });
    } else {
        loadCommentsWithProfile(id);
    }
}

// ✅ 댓글 더보기
function loadMoreComments() {
    currentCommentPage++;
    loadComments(currentArticleId);
}

// ✅ 댓글 입력창 자동 높이 조절
window.autoResizeTextarea = function(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
};

// ✅ 댓글 Enter 키 핸들러 (Enter=전송, Shift+Enter=줄바꿈)
window.handleCommentKey = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitCommentFromDetail();
    }
    // Shift+Enter는 기본 동작(줄바꿈) 그대로
};

// ✅ 댓글 제출
function submitCommentFromDetail() {
    submitComment(currentArticleId);
}

async function submitComment(id){
    await authReady; // ✅ 인증 초기화 완료 대기 (Race Condition 방지)
    if(!isLoggedIn()) {
        alert("댓글 작성은 로그인 후 가능합니다!");
        return;
    }

    if (!rateLimiter.check('comment', 5, 30 * 1000)) {
        alert("⚠️ 댓글을 너무 빠르게 작성하고 있습니다. 잠시 후 다시 시도해주세요.");
        return;
    }

    const txt = document.getElementById("commentInput").value.trim();
    const imageInput = document.getElementById("commentImageInput");

    if (!txt && (!imageInput || !imageInput.files || !imageInput.files[0])) {
        alert("댓글 내용 또는 이미지를 입력해주세요.");
        return;
    }

    if (txt.length > 1000) {
        alert("댓글은 1000자 이하로 입력해주세요.");
        return;
    }

    if (txt) {
        const foundWord = checkBannedWords(txt);
        if (foundWord) {
            alert(`⚠️ 금지어("${foundWord}")가 포함되어 등록할 수 없으며, 경고 1회가 누적됩니다.`);
            addWarningToCurrentUser();
            return;
        }
    }

    const submitBtns = document.querySelectorAll('.comment-submit-btn');
    submitBtns.forEach(b => b.disabled = true);

    try {
        let imageBase64 = null;
        if (imageInput && imageInput.files && imageInput.files[0]) {
            imageBase64 = await compressImageToBase64(imageInput.files[0], 800, 0.72);
        }

        const cid = Date.now().toString();
        const _cimp = isAdmin() && window._adminCommentImpersonateUser;
        const C = {
            author: _cimp ? _cimp.nick  : getNickname(),
            authorEmail: _cimp ? _cimp.email : getUserEmail(),
            authorUid: _cimp ? _cimp.uid  : getUserId(),
            text: txt,
            timestamp: new Date().toLocaleString(),
        };
        if (imageBase64) C.imageBase64 = imageBase64;

        await db.ref("comments/" + id + "/" + cid).set(C);
        // ✅ [최적화] 댓글 수 카운터 증가 (전체 comments 로드 불필 제거)
        await db.ref("articles/" + id + "/commentCount").transaction(n => (n || 0) + 1);

        const articleSnapshot = await db.ref("articles/" + id).once("value");
        const article = articleSnapshot.val();

        if(article && article.authorEmail !== C.authorEmail) {
            await sendNotification('myArticleComment', {
                articleAuthorEmail: article.authorEmail,
                commenterEmail: C.authorEmail,
                // ✅ 익명 게시글이면 댓글 알림도 익명 유저로 표시
                commenterName: article.anonymous ? '익명 유저' : C.author,
                content: txt || '[이미지]',
                articleId: id,
                articleCategory: article.category || '',
                anonymous: article.anonymous || false
            });
        }

        document.getElementById("commentInput").value = "";
        autoResizeTextarea(document.getElementById("commentInput"));
        if (imageInput) imageInput.value = "";
        clearCommentImage();
        currentCommentPage = 1;
        triggerGithubNotification(true); // 댓글 작성 시 자동 트리거
        loadComments(id);

    } catch(error) {
        console.error("댓글 작성 실패:", error);
        alert("댓글 작성 중 오류가 발생했습니다: " + error.message);
    } finally {
        submitBtns.forEach(b => b.disabled = false);
    }
}

// ✅ 댓글 삭제
function deleteComment(aid, cid, author){
    const currentUser = getNickname();
    if(!isLoggedIn() || (author !== currentUser && !isAdmin())) {
        return alert("삭제 권한이 없습니다!");
    }
    
    if(!confirm("정말 이 댓글을 삭제하시겠습니까?")) return;
    
    db.ref("comments/" + aid + "/" + cid).remove().then(() => {
        // ✅ [최적화] 댓글 수 -1
        db.ref("articles/" + aid + "/commentCount").transaction(n => Math.max((n || 0) - 1, 0));
        alert("댓글이 삭제되었습니다.");
        loadComments(aid);
    }).catch(error => {
        alert("삭제 실패: " + error.message);
    });
}

// ✅ 답글 입력창 토글
window.toggleReplyForm = function(commentId) {
    if(!isLoggedIn()) return alert("로그인이 필요합니다.");
    
    const form = document.getElementById(`replyForm-${commentId}`);
    if(form) {
        form.style.display = form.style.display === 'none' ? 'flex' : 'none';
        if(form.style.display === 'flex') {
            document.getElementById(`replyInput-${commentId}`).focus();
        }
    }
}

// ✅ 답글 등록
window.submitReply = async function(articleId, commentId) {
    if(!isLoggedIn()) return alert("로그인이 필요합니다.");

    const input = document.getElementById(`replyInput-${commentId}`);
    const text = input.value.trim();
    const imageInput = document.getElementById(`replyImageInput-${commentId}`);

    if(!text && (!imageInput || !imageInput.files || !imageInput.files[0])) return;

    if(text) {
        const foundWord = checkBannedWords(text);
        if(foundWord) {
            alert(`금지어("${foundWord}")가 포함되어 있습니다.`);
            return;
        }
    }

    try {
        let imageBase64 = null;
        if (imageInput && imageInput.files && imageInput.files[0]) {
            imageBase64 = await compressImageToBase64(imageInput.files[0], 800, 0.72);
        }

        const _rimp = isAdmin() && window._adminCommentImpersonateUser;
        const reply = {
            author: _rimp ? _rimp.nick  : getNickname(),
            authorEmail: _rimp ? _rimp.email : getUserEmail(),
            authorUid: _rimp ? _rimp.uid  : getUserId(),
            text: text,
            timestamp: new Date().toLocaleString()
        };
        if (imageBase64) reply.imageBase64 = imageBase64;

        await db.ref(`comments/${articleId}/${commentId}/replies`).push(reply);
        // ✅ [최적화] 댓글 수 +1
        await db.ref(`articles/${articleId}/commentCount`).transaction(n => (n || 0) + 1);

        // ✅ 댓글 작성자에게 답글 알림 전송
        try {
            const commentSnap = await db.ref(`comments/${articleId}/${commentId}`).once('value');
            const commentData = commentSnap.val();
            if (commentData && commentData.authorEmail && commentData.authorEmail !== reply.authorEmail) {
                await sendNotification('replyToComment', {
                    targetEmail: commentData.authorEmail,
                    replierName: reply.author,
                    content: text || '[이미지]',
                    articleId: articleId
                });
            }
        } catch(notifError) {
            console.warn("답글 알림 전송 실패:", notifError);
        }

        input.value = "";
        if (imageInput) imageInput.value = "";
        clearReplyImage(commentId);
        document.getElementById(`replyForm-${commentId}`).style.display = 'none';
        triggerGithubNotification(true); // 답글 작성 시 자동 트리거
        loadComments(articleId);

    } catch(error) {
        console.error("답글 등록 실패:", error);
        alert("답글 등록 중 오류가 발생했습니다.");
    }
}

// ✅ 답글 삭제
window.deleteReply = async function(articleId, commentId, replyId) {
    if(!confirm("이 답글을 삭제하시겠습니까?")) return;
    
    try {
        await db.ref(`comments/${articleId}/${commentId}/replies/${replyId}`).remove();
        // ✅ [최적화] 댓글 수 -1
        await db.ref(`articles/${articleId}/commentCount`).transaction(n => Math.max((n || 0) - 1, 0));
        loadComments(articleId);
    } catch(error) {
        alert("삭제 실패: " + error.message);
    }
}

// ✅ 댓글 정렬 변경
window.setCommentSort = function(method) {
    currentCommentSort = method;
    currentCommentPage = 1;
    loadComments(currentArticleId);
};

// ✅ 댓글 좋아요/싫어요
// ✅ [BUG FIX] 댓글 추천/비추천 연속 클릭 방지용 잠금 Set
const _commentVotingInProgress = new Set();

window.toggleCommentVote = function(articleId, commentId, voteType) {
    if (!isLoggedIn()) return alert("로그인이 필요합니다!");

    // ✅ 이미 처리 중인 댓글은 중복 실행 차단
    const lockKey = `${commentId}_${getUserId()}`;
    if (_commentVotingInProgress.has(lockKey)) return;
    _commentVotingInProgress.add(lockKey);

    // ✅ 버튼 즉시 비활성화 (UI 피드백)
    const likeBtn    = document.getElementById(`clike-${commentId}`);
    const dislikeBtn = document.getElementById(`cdislike-${commentId}`);
    if (likeBtn)    likeBtn.disabled = true;
    if (dislikeBtn) dislikeBtn.disabled = true;

    const uid = getUserId();
    const voteRef = db.ref(`commentVotes/${articleId}/${commentId}/${uid}`);
    // ✅ [BUG FIX] 기존: comments/${articleId}/${commentId} 전체 트랜잭션 → 작성자/관리자만 쓰기 가능해 일반 유저 차단됨
    // 수정: likeCount/dislikeCount 필드만 개별 트랜잭션 실행 → "auth != null" 규칙(Firebase Rules 추가)으로 가능
    const likeCountRef    = db.ref(`comments/${articleId}/${commentId}/likeCount`);
    const dislikeCountRef = db.ref(`comments/${articleId}/${commentId}/dislikeCount`);

    function _unlock() {
        _commentVotingInProgress.delete(lockKey);
        if (likeBtn)    likeBtn.disabled = false;
        if (dislikeBtn) dislikeBtn.disabled = false;
    }

    voteRef.once('value').then(snap => {
        const current = snap.val();
        const isCancelling = current === voteType;

        const likeTransaction = likeCountRef.transaction(count => {
            count = count || 0;
            if (isCancelling && voteType === 'like') return count - 1;
            if (!isCancelling && current === 'like') return count - 1;
            if (!isCancelling && voteType === 'like') return count + 1;
            return count;
        });

        const dislikeTransaction = dislikeCountRef.transaction(count => {
            count = count || 0;
            if (isCancelling && voteType === 'dislike') return count - 1;
            if (!isCancelling && current === 'dislike') return count - 1;
            if (!isCancelling && voteType === 'dislike') return count + 1;
            return count;
        });

        Promise.all([likeTransaction, dislikeTransaction]).then(([likeResult, dislikeResult]) => {
            const newLikeCount    = likeResult.snapshot.val()    || 0;
            const newDislikeCount = dislikeResult.snapshot.val() || 0;

            const votePromise = isCancelling ? voteRef.remove() : voteRef.set(voteType);
            votePromise.then(() => voteRef.once('value')).then(s => {
                const newVote = s.val();
                if (likeBtn) {
                    likeBtn.style.cssText = `border:1px solid ${newVote==='like'?'#1565c0':'#ddd'}; border-radius:20px; padding:3px 10px; font-size:12px; cursor:pointer; background:${newVote==='like'?'#e3f2fd':'#fff'}; color:${newVote==='like'?'#1565c0':'inherit'};`;
                    likeBtn.innerHTML = `👍 ${newLikeCount}`;
                }
                if (dislikeBtn) {
                    dislikeBtn.style.cssText = `border:1px solid ${newVote==='dislike'?'#c62828':'#ddd'}; border-radius:20px; padding:3px 10px; font-size:12px; cursor:pointer; background:${newVote==='dislike'?'#fce4ec':'#fff'}; color:${newVote==='dislike'?'#c62828':'inherit'};`;
                    dislikeBtn.innerHTML = `👎 ${newDislikeCount}`;
                }
            }).finally(_unlock);
        }).catch(_unlock);
    }).catch(_unlock);
};

// ✅ 답글의 답글 폼 토글
window.toggleNestedReplyForm = function(commentId, replyId) {
    if (!isLoggedIn()) return alert("로그인이 필요합니다.");
    const form = document.getElementById(`nestedReplyForm-${commentId}-${replyId}`);
    if (!form) return;
    form.style.display = form.style.display === 'none' ? 'flex' : 'none';
    if (form.style.display === 'flex') {
        document.getElementById(`nestedReplyInput-${commentId}-${replyId}`)?.focus();
    }
};

// ✅ 답글의 답글 등록
window.submitNestedReply = async function(articleId, commentId, parentReplyId) {
    if (!isLoggedIn()) return alert("로그인이 필요합니다.");
    const input = document.getElementById(`nestedReplyInput-${commentId}-${parentReplyId}`);
    const text = input?.value.trim();
    const imageInput = document.getElementById(`nestedReplyImageInput-${commentId}-${parentReplyId}`);

    if (!text && (!imageInput || !imageInput.files || !imageInput.files[0])) return;

    if (text) {
        const foundWord = checkBannedWords(text);
        if (foundWord) { alert(`금지어("${foundWord}")가 포함되어 있습니다.`); return; }
    }

    try {
        let imageBase64 = null;
        if (imageInput && imageInput.files && imageInput.files[0]) {
            imageBase64 = await compressImageToBase64(imageInput.files[0], 800, 0.72);
        }

        const reply = {
            author: getNickname(),
            authorEmail: getUserEmail(),
            text: text,
            timestamp: new Date().toLocaleString(),
            parentReplyId: parentReplyId
        };
        if (imageBase64) reply.imageBase64 = imageBase64;

       await db.ref(`comments/${articleId}/${commentId}/replies`).push(reply);

        // ✅ 부모 답글 작성자에게 대댓글 알림 전송
        try {
            const parentSnap = await db.ref(`comments/${articleId}/${commentId}/replies/${parentReplyId}`).once('value');
            const parentReply = parentSnap.val();
            if (parentReply && parentReply.authorEmail && parentReply.authorEmail !== reply.authorEmail) {
                await sendNotification('replyToReply', {
                    targetEmail: parentReply.authorEmail,
                    replierName: reply.author,
                    content: text || '[이미지]',
                    articleId: articleId
                });
            }
        } catch(notifError) {
            console.warn("대댓글 알림 전송 실패:", notifError);
        }

        triggerGithubNotification(true); // ✅ 누락 수정

        if (input) input.value = '';
        if (imageInput) imageInput.value = '';
        clearNestedReplyImage(commentId, parentReplyId);
        const form = document.getElementById(`nestedReplyForm-${commentId}-${parentReplyId}`);
        if (form) form.style.display = 'none';
        loadComments(articleId);
    } catch(e) {
        console.error("중첩 답글 등록 실패:", e);
        alert("답글 등록 중 오류가 발생했습니다.");
    }
};

console.log("✅ Part 9 댓글 시스템 완료");

// ===== Part 10: 패치노트 시스템 =====

// ✅ 패치노트 로드
function loadPatchNotesToContainer(container) {
    container.innerHTML = '<div style="text-align:center; padding:20px;">로딩 중...</div>';

    db.ref('patchNotes').orderByChild('date').once('value').then(snapshot => {
        container.innerHTML = '';
        
        if (isAdmin()) {
            const addBtn = document.createElement('div');
            addBtn.className = 'admin-patch-controls';
            addBtn.style.marginBottom = '20px';
            addBtn.innerHTML = `<button onclick="openPatchNoteModal()" class="btn-primary btn-block"><i class="fas fa-plus"></i> 새 패치노트 작성</button>`;
            container.appendChild(addBtn);
        }

        const notes = [];
        snapshot.forEach(child => {
            notes.push({ id: child.key, ...child.val() });
        });

        if (notes.length === 0) {
            container.innerHTML += '<p style="text-align:center; color:#888;">등록된 패치노트가 없습니다.</p>';
        }

        notes.reverse().forEach(note => {
            const card = document.createElement('div');
            card.className = 'qna-card'; 
            
            let adminBtns = '';
            if (isAdmin()) {
                adminBtns = `
                    <div style="margin-top:10px; border-top:1px solid #eee; padding-top:10px; text-align:right;">
                        <button onclick="openPatchNoteModal('${note.id}')" class="btn-secondary" style="padding:4px 8px; font-size:11px;">수정</button>
                        <button onclick="deletePatchNote('${note.id}')" class="btn-danger" style="padding:4px 8px; font-size:11px;">삭제</button>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="qna-header">
                    <i class="fas fa-tag"></i> ${note.version} <span style="font-size:12px; margin-left:auto; opacity:0.8;">${note.date}</span>
                </div>
                <div class="qna-body">
                    <div class="a-part" style="white-space: pre-wrap;">${note.content}</div>
                    ${adminBtns}
                </div>
            `;
            container.appendChild(card);
        });
    });
}

// ✅ 패치노트 모달
window.openPatchNoteModal = function(id = null) {
    const modal = document.getElementById('patchNoteModal');
    const form = document.getElementById('patchNoteForm');
    form.reset();
    document.getElementById('editPatchId').value = '';

    if (id) {
        db.ref('patchNotes/' + id).once('value').then(snap => {
            const data = snap.val();
            document.getElementById('editPatchId').value = id;
            document.getElementById('patchVersion').value = data.version;
            document.getElementById('patchDate').value = data.date;
            document.getElementById('patchContent').value = data.content;
            modal.classList.add('active');
        });
    } else {
        document.getElementById('patchDate').value = new Date().toISOString().split('T')[0];
        modal.classList.add('active');
    }
}

window.closePatchNoteModal = function() {
    document.getElementById('patchNoteModal').classList.remove('active');
}

// ✅ 패치노트 저장
window.savePatchNote = function(e) {
    e.preventDefault();
    if (!isAdmin()) return alert("관리자만 가능합니다.");

    const id = document.getElementById('editPatchId').value;
    const data = {
        version: document.getElementById('patchVersion').value,
        date: document.getElementById('patchDate').value,
        content: document.getElementById('patchContent').value
    };

    if (id) {
        db.ref('patchNotes/' + id).update(data);
    } else {
        db.ref('patchNotes').push(data);
    }
    
    closePatchNoteModal();
    if(document.getElementById("patchnotesSection").classList.contains("active")) {
        showPatchNotesPage();
    }
}

// ✅ 패치노트 삭제
window.deletePatchNote = function(id) {
    if(!isAdmin()) return;
    if(confirm('정말 삭제하시겠습니까?')) {
        db.ref('patchNotes/' + id).remove().then(() => {
            if(document.getElementById("patchnotesSection").classList.contains("active")) {
                showPatchNotesPage();
            }
        });
    }
}

console.log("✅ Part 10 패치노트 완료");

// ===== Part 11: 사용자 관리 시스템 (간소화) =====

// ✅ 사용자 관리 페이지
window.showUserManagement = async function(){
    if(!isAdmin()) return alert("관리자 권한 필요!");
    
    hideAll();
    
    const section = document.getElementById("userManagementSection");
    if(!section) {
        console.error("❌ userManagementSection을 찾을 수 없습니다!");
        return;
    }
    
    section.classList.add("active");
    
    const root = document.getElementById("usersList");
    if(!root) {
        console.error("❌ usersList 요소를 찾을 수 없습니다!");
        return;
    }
    
    root.innerHTML = "<p style='text-align:center;color:#868e96;'>사용자 정보 로딩 중...</p>";
    
    updateURL('users');
    
    try {
        const [articlesSnapshot, commentsSnapshot, usersSnapshot] = await Promise.all([
            db.ref("articles").once("value"),
            db.ref("comments").once("value"),
            db.ref("users").once("value")
        ]);
        
        const articlesData = articlesSnapshot.val() || {};
        const articles = Object.values(articlesData);
        
        const commentsData = commentsSnapshot.val() || {};
        const usersMap = new Map();
        
        // 기사 작성자 수집
        articles.forEach(article => {
            if(article.author && article.author !== "익명" && article.authorEmail) {
                if(!usersMap.has(article.authorEmail)) {
                    usersMap.set(article.authorEmail, {
                        nickname: article.author,
                        email: article.authorEmail,
                        articles: [],
                        comments: [],
                        lastActivity: article.date
                    });
                }
                usersMap.get(article.authorEmail).articles.push(article);
            }
        });
        
        // 댓글 작성자 수집
        Object.entries(commentsData).forEach(([articleId, articleComments]) => {
            Object.entries(articleComments).forEach(([commentId, comment]) => {
                if(comment.author && comment.author !== "익명" && comment.authorEmail) {
                    if(!usersMap.has(comment.authorEmail)) {
                        usersMap.set(comment.authorEmail, {
                            nickname: comment.author,
                            email: comment.authorEmail,
                            articles: [],
                            comments: [],
                            lastActivity: comment.timestamp
                        });
                    }
                    usersMap.get(comment.authorEmail).comments.push({...comment,articleId,commentId});
                    usersMap.get(comment.authorEmail).lastActivity = comment.timestamp;
                }
            });
        });
        
        const currentUserEmail = getUserEmail();
        const currentNickname = getNickname();
        if(currentUserEmail && currentNickname !== "익명" && !usersMap.has(currentUserEmail)) {
            usersMap.set(currentUserEmail, {
                nickname: currentNickname,
                email: currentUserEmail,
                articles: [],
                comments: [],
                lastActivity: new Date().toLocaleString()
            });
        }
        
        const usersData = usersSnapshot.val() || {};
        
        if(usersMap.size === 0) {
            root.innerHTML = "<p style='text-align:center;color:#868e96;'>등록된 사용자가 없습니다.</p>";
            return;
        }
        
        const usersList = Array.from(usersMap.values());
        
        root.innerHTML = usersList.map(u => {
            let userData = null;
            let uid = null;
            for (const [key, val] of Object.entries(usersData)) {
                if (val.email === u.email) {
                    userData = val;
                    uid = key;
                    break;
                }
            }
            const warningCount = userData ? (userData.warningCount || 0) : 0;
            const isBanned = userData ? (userData.isBanned || false) : false;
            const safeUid = uid || 'email_' + btoa(u.email).replace(/=/g, '');
            
            const isCurrentUser = (u.email === getUserEmail());

            return `
            <div class="user-card" style="opacity: ${isBanned ? '0.7' : '1'}; border-left-color: ${isBanned ? '#343a40' : '#c62828'};">
                <h4 style="color:${isCurrentUser ? '#000000' : (isBanned ? '#343a40' : '#c62828')};">
                    ${u.nickname}${isCurrentUser ? ' <span style="background:#000;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;">👤 나</span>' : ''}
                    ${isBanned ? ' <span style="background:#343a40;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;">🚫 차단됨</span>' : ''}
                </h4>
                <div class="user-info">
                    📧 이메일: <strong>${u.email}</strong><br>
                    📰 기사: <strong>${u.articles.length}</strong> | 💬 댓글: <strong>${u.comments.length}</strong><br>
                    ⚠️ 누적 경고: <strong>${warningCount}회</strong><br>
                    🕐 마지막 활동: ${u.lastActivity}<br>
                    🔵 접속: ${userData && userData.lastSeen
                        ? formatLastSeen(userData.lastSeen)
                        : '<span style="color:#adb5bd;">기록 없음</span>'}

                </div>
                <div class="user-actions">
                    <button onclick="showUserDetail('${u.nickname}')" class="btn-info">상세</button>
                    <button onclick="changeWarning('${safeUid}', '${u.email}', 1)" class="btn-warning">경고 +1</button>
                    <button onclick="changeWarning('${safeUid}', '${u.email}', -1)" class="btn-secondary">경고 -1</button>
                    ${isBanned ?
                        `<button onclick="toggleBan('${safeUid}', '${u.email}', false)" class="btn-success">차단해제</button>` :
                        `<button onclick="toggleBan('${safeUid}', '${u.email}', true)" class="btn-dark">차단하기</button>`
                    }
                    <button onclick="deleteUserCompletely('${u.nickname}')" class="btn-danger">삭제</button>
                </div>
            </div>
        `}).join('');
    } catch(error) {
        console.error("❌ 사용자 관리 오류:", error);
        root.innerHTML = `<p style="color:#dc3545;text-align:center;">오류: ${error.message}</p>`;
    }
}

// ✅ 경고 변경
window.changeWarning = async function(uid, email, amount) {
    if(!isAdmin()) return;
    
    if(uid.startsWith('email_')) {
        await db.ref("users/" + uid).update({ email: email });
    }

    const snap = await db.ref("users/" + uid).once("value");
    const data = snap.val() || {};
    let current = data.warningCount || 0;
    
    let nextVal = current + amount;
    if (nextVal < 0) nextVal = 0;
    
    let updates = { warningCount: nextVal, email: email }; 
    if (nextVal >= 3 && !data.isBanned) {
        updates.isBanned = true;
        alert("🚨 누적 경고 3회 도달로 인해 차단됩니다.");
    }

    await db.ref("users/" + uid).update(updates);
    showUserManagement();
}

// ✅ 차단/차단 해제
window.toggleBan = async function(uid, email, shouldBan) {
    if(!isAdmin()) return;
    const action = shouldBan ? "차단" : "차단 해제";
    if(!confirm(`정말 이 사용자를 ${action}하시겠습니까?`)) return;

    if(uid.startsWith('email_')) {
        await db.ref("users/" + uid).update({ email: email });
    }

    await db.ref("users/" + uid).update({
        isBanned: shouldBan,
        email: email
    });
    
    alert(`${action} 완료되었습니다.`);
    showUserManagement();
}

// ✅ 사용자 상세 정보
window.showUserDetail = async function(nickname) {
    showLoadingIndicator("사용자 정보 로딩 중...");
    
    const [articlesSnapshot, commentsSnapshot] = await Promise.all([
        db.ref("articles").once("value"),
        db.ref("comments").once("value")
    ]);
    
    const articlesData = articlesSnapshot.val() || {};
    const articles = Object.values(articlesData).filter(a => a.author === nickname);
    
    const commentsData = commentsSnapshot.val() || {};
    const userComments = [];
    
    Object.entries(commentsData).forEach(([articleId, articleComments]) => {
        Object.entries(articleComments).forEach(([commentId, comment]) => {
            if(comment.author === nickname) {
                userComments.push({...comment, articleId, commentId});
            }
        });
    });
    
    let userEmail = "미확인";
    if(articles.length > 0 && articles[0].authorEmail) userEmail = articles[0].authorEmail;
    else if(userComments.length > 0 && userComments[0].authorEmail) userEmail = userComments[0].authorEmail;
    
    hideLoadingIndicator();
    
    const modal = document.getElementById("userDetailModal");
    const content = document.getElementById("userDetailContent");
    content.innerHTML = `
        <div style="padding:20px;">
            <h3 style="margin-top:0;color:#c62828;font-size:22px;">👤 ${nickname}</h3>
            <p style="margin-bottom:20px;color:#6c757d;">Email: ${userEmail}</p>
            <div style="margin-top:25px;">
                <h4 style="color:#1976d2;margin-bottom:15px;">📰 작성 기사 (${articles.length}개)</h4>
                ${articles.length > 0 ? articles.map(a => `
                    <div style="background:#f8f9fa;padding:12px;margin-bottom:8px;border-left:3px solid #c62828;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="flex:1;">${a.title}</span>
                        <button onclick="deleteArticleFromAdmin('${a.id}', '${nickname}')" class="btn-secondary" style="padding:6px 12px;font-size:11px;">삭제</button>
                    </div>`).join('') : '<p style="color:#868e96;text-align:center;padding:20px;">작성한 기사가 없습니다.</p>'}
            </div>
            <div style="margin-top:20px;">
                <h4 style="color:#1976d2;margin-bottom:15px;">💬 작성 댓글 (${userComments.length}개)</h4>
                ${userComments.length > 0 ? userComments.map(c => `
                    <div style="background:#f8f9fa;padding:12px;margin-bottom:8px;border-left:3px solid #6c757d;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="flex:1;">${c.text}</span>
                        <button onclick="deleteCommentFromAdmin('${c.articleId}', '${c.commentId}', '${nickname}')" class="btn-secondary" style="padding:6px 12px;font-size:11px;">삭제</button>
                    </div>`).join('') : '<p style="color:#868e96;text-align:center;padding:20px;">작성한 댓글이 없습니다.</p>'}
            </div>
        </div>
    `;
    modal.classList.add("active");
}

// ✅ 사용자 상세 모달 닫기
window.closeUserDetail = function() {
    document.getElementById("userDetailModal").classList.remove("active");
}

// ✅ 관리자 권한으로 기사 삭제
window.deleteArticleFromAdmin = function(id, nickname) {
    if(!confirm("이 기사를 삭제하시겠습니까?")) return;
    deleteArticleFromDB(id, () => {
        db.ref("comments/" + id).remove();
        alert("삭제되었습니다.");
        closeUserDetail();
        showUserDetail(nickname);
    });
}

// =====================================================================
// ✅ 관리자 기사 관리 패널 함수 4종
// =====================================================================

// ① 조회수 초기화
window.adminResetArticleViews = async function(articleId) {
    if (!isAdmin()) { alert('관리자 권한이 필요합니다.'); return; }
    if (!confirm('이 기사의 조회수를 0으로 초기화하시겠습니까?\n독자 기록도 함께 삭제됩니다.')) return;
    try {
        const now = Date.now();
        await Promise.all([
            db.ref(`articles/${articleId}/views`).set(0),
            db.ref(`articles/${articleId}/viewsResetAt`).set(now),  // ✅ 초기화 시각 기록 → 모든 사용자 이전 방문 무효화
            db.ref(`articleReaders/${articleId}`).remove()
        ]);
        // 화면 즉시 반영
        const el = document.getElementById('viewCountDisplay');
        if (el) el.innerHTML = '👁️ 0';
        alert('✅ 조회수가 초기화되었습니다.');
    } catch(e) {
        alert('❌ 초기화 실패: ' + e.message);
    }
};

// ✅ 관리자 대리 작성 — 공통 유저 목록 로드
async function _adminLoadUserList() {
    const snap = await db.ref('users').once('value');
    const users = snap.val() || {};
    // 기사에서 실제 닉네임 가져오기 (displayName 보완)
    const articleSnap = await db.ref('articles').limitToLast(200).once('value');
    const articles = articleSnap.val() || {};
    const emailToNick = {};
    Object.values(articles).forEach(a => {
        if (a.authorEmail && a.author) emailToNick[a.authorEmail] = a.author;
    });
    return Object.entries(users).map(([uid, u]) => {
        const email = u.email || '';
        const nick = u.newNickname || emailToNick[email] || u.nickname || email.split('@')[0] || '알 수 없음';
        return { uid, nick, email, photoURL: u.photoURL || '' };
    }).filter(u => u.email).sort((a, b) => a.nick.localeCompare(b.nick));
}

function _adminRenderUserRadios(users, listId, name, onSelect) {
    const list = document.getElementById(listId);
    if (!list) return;
    if (users.length === 0) {
        list.innerHTML = `<div style="padding:10px;font-size:12px;color:#aaa;text-align:center;">유저 없음</div>`;
        return;
    }
    list.innerHTML = users.map(u => `
        <label style="display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-bottom:1px solid #fff8e1;"
            onmouseover="this.style.background='#fffde7'" onmouseout="this.style.background='white'">
            <input type="radio" name="${name}" value="${u.uid}"
                data-nick="${u.nick.replace(/"/g,'&quot;')}"
                data-email="${u.email.replace(/"/g,'&quot;')}"
                data-photo="${(u.photoURL||'').replace(/"/g,'&quot;')}"
                onchange="${onSelect}(this)"
                style="width:15px;height:15px;accent-color:#795548;flex-shrink:0;">
            <img src="${u.photoURL||''}" onerror="this.style.display='none'"
                style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;">
            <div>
                <div style="font-size:13px;font-weight:700;color:#333;">${escapeHTML(u.nick)}</div>
                <div style="font-size:11px;color:#888;">${escapeHTML(u.email)}</div>
            </div>
        </label>`).join('');
}

// ── 기사 대리 작성 ──
window._adminImpersonateUser = null;

window._adminClearImpersonate = function() {
    window._adminImpersonateUser = null;
    const toggle = document.getElementById('adminImpersonateToggle');
    const list   = document.getElementById('adminImpersonateUserList');
    if (toggle) toggle.checked = false;
    if (list)   list.style.display = 'none';
};

window._adminToggleImpersonate = async function(checked) {
    const list = document.getElementById('adminImpersonateUserList');
    if (!list) return;
    if (!checked) {
        window._adminImpersonateUser = null;
        list.style.display = 'none';
        return;
    }
    list.style.display = 'block';
    list.innerHTML = `<div style="padding:10px;font-size:12px;color:#aaa;text-align:center;">불러오는 중...</div>`;
    const users = await _adminLoadUserList();
    _adminRenderUserRadios(users, 'adminImpersonateUserList', 'adminImpUser', 'window._adminPickImpersonate');
};

window._adminPickImpersonate = function(radio) {
    window._adminImpersonateUser = {
        uid: radio.value,
        nick: radio.dataset.nick,
        email: radio.dataset.email,
        photoURL: radio.dataset.photo
    };
};

// ── 댓글 대리 작성 ──
window._adminCommentImpersonateUser = null;

window._adminClearCommentImpersonate = function() {
    window._adminCommentImpersonateUser = null;
    const toggle = document.getElementById('adminCommentImpersonateToggle');
    const list   = document.getElementById('adminCommentImpersonateUserList');
    if (toggle) toggle.checked = false;
    if (list)   list.style.display = 'none';
};

window._adminCommentToggleImpersonate = async function(checked) {
    const list = document.getElementById('adminCommentImpersonateUserList');
    if (!list) return;
    if (!checked) {
        window._adminCommentImpersonateUser = null;
        list.style.display = 'none';
        return;
    }
    list.style.display = 'block';
    list.innerHTML = `<div style="padding:8px;font-size:12px;color:#aaa;text-align:center;">불러오는 중...</div>`;
    const users = await _adminLoadUserList();
    _adminRenderUserRadios(users, 'adminCommentImpersonateUserList', 'adminImpCommentUser', 'window._adminPickCommentImpersonate');
};

window._adminPickCommentImpersonate = function(radio) {
    window._adminCommentImpersonateUser = {
        uid: radio.value,
        nick: radio.dataset.nick,
        email: radio.dataset.email,
        photoURL: radio.dataset.photo
    };
};

// 기사 상세 로드 시 관리자 댓글 박스 표시
(function _hookArticleDetailForCommentImp() {
    const _orig = window.showArticleDetail;
    if (typeof _orig !== 'function' || _orig._commentImpHooked) return;
    window.showArticleDetail = async function(id) {
        const result = await _orig.apply(this, arguments);
        setTimeout(() => {
            const box = document.getElementById('adminCommentImpersonateBox');
            if (box) {
                box.style.display = isAdmin() ? 'block' : 'none';
                window._adminClearCommentImpersonate();
            }
        }, 200);
        return result;
    };
    window.showArticleDetail._commentImpHooked = true;
})();


// ✅ 수치 직접 조작 (조회수 / 좋아요 / 싫어요)
window.adminSetArticleStats = async function(articleId) {
    if (!isAdmin()) { alert('관리자 권한이 필요합니다.'); return; }

    const viewsEl    = document.getElementById(`_adminViewsInput_${articleId}`);
    const likesEl    = document.getElementById(`_adminLikesInput_${articleId}`);
    const dislikesEl = document.getElementById(`_adminDislikesInput_${articleId}`);
    if (!viewsEl || !likesEl || !dislikesEl) return;

    const newViews    = Math.max(0, parseInt(viewsEl.value)    || 0);
    const newLikes    = Math.max(0, parseInt(likesEl.value)    || 0);
    const newDislikes = Math.max(0, parseInt(dislikesEl.value) || 0);

    if (!confirm(`수치를 다음과 같이 변경하시겠습니까?\n\n👁️ 조회수: ${newViews}\n👍 좋아요: ${newLikes}\n👎 싫어요: ${newDislikes}`)) return;

    try {
        await db.ref(`articles/${articleId}`).update({
            views:        newViews,
            likeCount:    newLikes,
            dislikeCount: newDislikes
        });

        // 화면 즉시 반영
        const viewEl = document.getElementById('viewCountDisplay');
        if (viewEl) viewEl.innerHTML = `👁️ ${newViews}`;

        const likeBtn    = document.getElementById(`like-btn-${articleId}`);
        const dislikeBtn = document.getElementById(`dislike-btn-${articleId}`);
        if (likeBtn)    likeBtn.innerHTML    = `👍 추천 ${newLikes}`;
        if (dislikeBtn) dislikeBtn.innerHTML = `👎 비추천 ${newDislikes}`;

        alert('✅ 수치가 변경되었습니다.');
    } catch(e) {
        alert('❌ 변경 실패: ' + e.message);
    }
};


// ② 추천/비추천 초기화
window.adminResetArticleVotes = async function(articleId) {
    if (!isAdmin()) { alert('관리자 권한이 필요합니다.'); return; }
    if (!confirm('이 기사의 추천/비추천을 모두 초기화하시겠습니까?\n투표 기록도 함께 삭제됩니다.')) return;
    try {
        await Promise.all([
            db.ref(`articles/${articleId}/likeCount`).set(0),
            db.ref(`articles/${articleId}/dislikeCount`).set(0),
            db.ref(`votes/${articleId}`).remove()
        ]);
        // 화면 즉시 반영
        const likeBtn    = document.getElementById(`like-btn-${articleId}`);
        const dislikeBtn = document.getElementById(`dislike-btn-${articleId}`);
        if (likeBtn)    likeBtn.innerHTML    = '👍 추천 0';
        if (dislikeBtn) dislikeBtn.innerHTML = '👎 비추천 0';
        alert('✅ 추천/비추천이 초기화되었습니다.');
    } catch(e) {
        alert('❌ 초기화 실패: ' + e.message);
    }
};

// ③ 독자 목록 모달
window.adminShowArticleReaders = async function(articleId) {
    if (!isAdmin()) { alert('관리자 권한이 필요합니다.'); return; }
    document.getElementById('_adminReadersModal')?.remove();

    const snap = await db.ref(`articleReaders/${articleId}`).once('value');
    const data = snap.val() || {};
    const readers = Object.values(data).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const rows = readers.length === 0
        ? `<div style="text-align:center;color:#aaa;padding:30px 0;font-size:14px;">독자 기록이 없습니다.</div>`
        : readers.map((r, i) => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;
                border-bottom:1px solid #f5f5f5;">
                <div style="width:28px;height:28px;border-radius:50%;background:#c62828;
                    display:flex;align-items:center;justify-content:center;
                    color:white;font-size:12px;font-weight:700;flex-shrink:0;">
                    ${(r.name || '?')[0].toUpperCase()}
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:14px;font-weight:600;color:#212121;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${escapeHTML(r.name || '알 수 없음')}
                    </div>
                    <div style="font-size:11px;color:#888;">${escapeHTML(r.email || '')}</div>
                </div>
                <div style="font-size:11px;color:#aaa;flex-shrink:0;text-align:right;">
                    ${escapeHTML(r.readAt || '')}
                </div>
            </div>`).join('');

    const modal = document.createElement('div');
    modal.id = '_adminReadersModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';
    modal.innerHTML = `
        <div style="background:white;width:100%;max-width:600px;border-radius:20px 20px 0 0;
            max-height:70vh;display:flex;flex-direction:column;
            box-shadow:0 -4px 24px rgba(0,0,0,0.15);">
            <div style="padding:16px 20px 12px;border-bottom:1px solid #f0f0f0;flex-shrink:0;">
                <div style="width:36px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 14px;"></div>
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div style="font-size:16px;font-weight:800;color:#212121;">
                        📖 독자 목록 <span style="font-size:13px;color:#888;font-weight:500;">(${readers.length}명)</span>
                    </div>
                    <button onclick="document.getElementById('_adminReadersModal').remove()"
                        style="border:none;background:none;font-size:20px;color:#aaa;cursor:pointer;">✕</button>
                </div>
            </div>
            <div style="flex:1;overflow-y:auto;padding:0 20px;">
                ${rows}
            </div>
        </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
};

// ④ 투표 현황 모달
window.adminShowArticleVoters = async function(articleId) {
    if (!isAdmin()) { alert('관리자 권한이 필요합니다.'); return; }
    document.getElementById('_adminVotersModal')?.remove();

    const [votesSnap, articleSnap] = await Promise.all([
        db.ref(`votes/${articleId}`).once('value'),
        db.ref(`articles/${articleId}`).once('value')
    ]);
    const votes   = votesSnap.val()   || {};
    const article = articleSnap.val() || {};
    const likeCount    = article.likeCount    || 0;
    const dislikeCount = article.dislikeCount || 0;
    const total = likeCount + dislikeCount;

    // uid → 유저 이름 조회
    const uids = Object.keys(votes);
    const userSnaps = await Promise.all(uids.map(uid => db.ref(`users/${uid}`).once('value')));
    const userMap = {};
    uids.forEach((uid, i) => { userMap[uid] = userSnaps[i].val() || {}; });

    const likers    = uids.filter(uid => votes[uid] === 'like');
    const dislikers = uids.filter(uid => votes[uid] === 'dislike');

    function voterRow(uid) {
        const u = userMap[uid] || {};
        const name  = u.newNickname || u.nickname || u.displayName || (u.email ? u.email.split('@')[0] : '알 수 없음');
        const email = u.email || '';
        return `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f5f5f5;">
                <div style="width:26px;height:26px;border-radius:50%;background:#e0e0e0;
                    display:flex;align-items:center;justify-content:center;
                    font-size:11px;font-weight:700;color:#555;flex-shrink:0;">
                    ${(name)[0].toUpperCase()}
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:600;color:#212121;">${escapeHTML(name)}</div>
                    <div style="font-size:11px;color:#aaa;">${escapeHTML(email)}</div>
                </div>
            </div>`;
    }

    const barW = total > 0 ? Math.round((likeCount / total) * 100) : 50;

    const modal = document.createElement('div');
    modal.id = '_adminVotersModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';
    modal.innerHTML = `
        <div style="background:white;width:100%;max-width:600px;border-radius:20px 20px 0 0;
            max-height:75vh;display:flex;flex-direction:column;
            box-shadow:0 -4px 24px rgba(0,0,0,0.15);">
            <div style="padding:16px 20px 12px;border-bottom:1px solid #f0f0f0;flex-shrink:0;">
                <div style="width:36px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 14px;"></div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
                    <div style="font-size:16px;font-weight:800;color:#212121;">🗳️ 투표 현황</div>
                    <button onclick="document.getElementById('_adminVotersModal').remove()"
                        style="border:none;background:none;font-size:20px;color:#aaa;cursor:pointer;">✕</button>
                </div>
                <!-- 요약 바 -->
                <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:6px;">
                    <span style="color:#1565c0;">👍 추천 ${likeCount}</span>
                    <span style="color:#c62828;">비추천 ${dislikeCount} 👎</span>
                </div>
                <div style="background:#fce4ec;border-radius:999px;height:10px;overflow:hidden;">
                    <div style="background:#1565c0;height:100%;width:${barW}%;border-radius:999px;transition:width 0.4s;"></div>
                </div>
                <div style="font-size:11px;color:#aaa;text-align:center;margin-top:4px;">총 ${total}표</div>
            </div>
            <div style="flex:1;overflow-y:auto;padding:0 20px;">
                ${likers.length > 0 ? `
                    <div style="font-size:12px;font-weight:700;color:#1565c0;padding:12px 0 4px;">
                        👍 추천 (${likers.length}명)
                    </div>
                    ${likers.map(voterRow).join('')}` : ''}
                ${dislikers.length > 0 ? `
                    <div style="font-size:12px;font-weight:700;color:#c62828;padding:12px 0 4px;">
                        👎 비추천 (${dislikers.length}명)
                    </div>
                    ${dislikers.map(voterRow).join('')}` : ''}
                ${uids.length === 0 ? `<div style="text-align:center;color:#aaa;padding:30px 0;font-size:14px;">투표 기록이 없습니다.</div>` : ''}
            </div>
        </div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
};

// =====================================================================
// ✅ 관리자 전용 — 익명 해제 토글 (DB 변경 없이 관리자 화면에서만 적용)
// =====================================================================
window.adminToggleAnonymousReveal = function(articleId) {
    if (!isAdmin()) return;
    if (!window._adminRevealAnonymous) window._adminRevealAnonymous = {};

    // 토글
    window._adminRevealAnonymous[articleId] = !window._adminRevealAnonymous[articleId];
    const revealed = window._adminRevealAnonymous[articleId];

    // 버튼 텍스트 즉시 교체
    const btn = document.getElementById(`_adminAnonBtn_${articleId}`);
    if (btn) {
        btn.textContent = revealed ? '🔓 익명 해제 중 (클릭 시 복원)' : '🔒 익명 해제 보기';
        btn.style.background    = revealed ? '#e8f5e9' : '#fff3e0';
        btn.style.borderColor   = revealed ? '#a5d6a7' : '#ffcc80';
        btn.style.color         = revealed ? '#2e7d32' : '#e65100';
    }

    // 기사 작성자 / 댓글 / 답글 재렌더링 (showArticleDetail 재호출)
    if (typeof showArticleDetail === 'function') {
        showArticleDetail(articleId);
    }
};



// ✅ 관리자 권한으로 댓글 삭제
window.deleteCommentFromAdmin = function(articleId, commentId, nickname) {
    if(!confirm("이 댓글을 삭제하시겠습니까?")) return;
    db.ref("comments/" + articleId + "/" + commentId).remove().then(() => {
        // ✅ [최적화] 댓글 수 -1
        db.ref("articles/" + articleId + "/commentCount").transaction(n => Math.max((n || 0) - 1, 0));
        alert("삭제되었습니다.");
        closeUserDetail();
        showUserDetail(nickname);
    });
}

// ✅ 사용자 완전 삭제
window.deleteUserCompletely = async function(nick){
    if(!confirm(`"${nick}" 사용자를 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 해당 사용자의 모든 기사와 댓글이 삭제됩니다.`)) return;
    
    showLoadingIndicator("사용자 삭제 중...");
    
    try {
        const updates = {};
        
        const articlesSnapshot = await db.ref("articles").once("value");
        const articlesData = articlesSnapshot.val() || {};
        Object.entries(articlesData).forEach(([id, article]) => {
            if(article.author === nick) {
                updates[`articles/${id}`] = null;
                updates[`comments/${id}`] = null;
                updates[`votes/${id}`] = null;
            }
        });
        
        const commentsSnapshot = await db.ref("comments").once("value");
        const val = commentsSnapshot.val() || {};
        Object.entries(val).forEach(([aid, group]) => {
            Object.entries(group).forEach(([cid, c]) => {
                if(c.author === nick) {
                    updates[`comments/${aid}/${cid}`] = null;
                }
            });
        });
        
        await db.ref().update(updates);
        
        hideLoadingIndicator();
        alert(`"${nick}" 사용자가 삭제되었습니다.`);
        showUserManagement();
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("사용자 삭제 실패:", error);
        alert("삭제 중 오류가 발생했습니다: " + error.message);
    }
}

// ===== 조회수 관리 함수들 =====

// ✅ 전체 조회수 초기화 (관리자 전용)
window.resetAllViews = async function() {
    if(!isAdmin()) {
        alert("🚫 관리자 권한이 필요합니다!");
        return;
    }
    
    if(!confirm("⚠️ 정말 모든 기사의 조회수를 0으로 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!")) {
        return;
    }
    
    if(!confirm("⚠️ 다시 한 번 확인합니다.\n정말 진행하시겠습니까?")) {
        return;
    }
    
    showLoadingIndicator("조회수 초기화 중...");
    
    try {
        const snapshot = await db.ref("articles").once("value");
        const articlesData = snapshot.val() || {};
        
        const updates = {};
        let count = 0;
        
        const now = Date.now();
        Object.keys(articlesData).forEach(articleId => {
            updates[`articles/${articleId}/views`] = 0;
            updates[`articles/${articleId}/viewsResetAt`] = now;  // ✅ 초기화 시각 기록 → 모든 사용자 이전 방문 무효화
            count++;
        });
        
        if(count === 0) {
            hideLoadingIndicator();
            alert("초기화할 기사가 없습니다.");
            return;
        }
        
        await db.ref().update(updates);
        
        hideLoadingIndicator();
        alert(`✅ ${count}개 기사의 조회수가 초기화되었습니다!`);
        
        // 현재 페이지가 기사 목록이면 새로고침
        if(document.getElementById("articlesSection")?.classList.contains("active")) {
            if(typeof renderArticles === 'function') {
                renderArticles();
            }
        }
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("❌ 조회수 초기화 실패:", error);
        alert("초기화 실패: " + error.message);
    }
};

// ✅ 내 조회 기록 삭제 (수동)
window.clearMyViewHistory = function() {
    if(!confirm("⚠️ 영구 저장된 조회 기록을 삭제하시겠습니까?\n\n삭제 후 모든 기사를 다시 조회할 수 있습니다.")) {
        return;
    }
    
    try {
        localStorage.removeItem('viewedArticles');
        alert("✅ 조회 기록이 삭제되었습니다!");
        console.log("✅ 영구 조회 기록 삭제 완료");
    } catch(error) {
        console.error("❌ 조회 기록 삭제 실패:", error);
        alert("삭제 실패: " + error.message);
    }
};

// ✅ 조회 기록 통계 확인
window.getViewStats = function() {
    try {
        const viewedArticles = getViewedArticles();
        const articleIds = Object.keys(viewedArticles);
        
        console.log("📊 조회 기록 통계:");
        console.log("- 총 조회한 기사:", articleIds.length);
        console.log("- 상세 기록:", viewedArticles);
        
        return {
            totalViewed: articleIds.length,
            articles: viewedArticles
        };
    } catch(error) {
        console.error("통계 확인 실패:", error);
        return null;
    }
};

console.log("✅ 조회수 관리 시스템 로드 완료");

console.log("✅ Part 11 사용자 관리 완료");

// ===== Part 12: 금지어 관리 =====

// ✅ 금지어 관리 모달
window.showBannedWordManager = function() {
    const modal = document.getElementById("bannedWordsModal");
    const input = document.getElementById("bannedWordsInput");
    
    input.value = bannedWordsList.join(', ');
    modal.classList.add("active");
}

window.closeBannedWordsModal = function() {
    document.getElementById("bannedWordsModal").classList.remove("active");
}

// ✅ 금지어 저장
window.saveBannedWords = function() {
    const input = document.getElementById("bannedWordsInput").value;
    const newList = input.split(',').map(s => s.trim()).filter(s => s !== "");
    
    db.ref("adminSettings/bannedWords").set(newList.join(',')).then(() => {
        alert("금지어 목록이 저장되었습니다.");
        closeBannedWordsModal();
    }).catch(err => alert("저장 실패: " + err.message));
}

console.log("✅ Part 12 금지어 관리 완료");

// ===== Part 13: Firebase 리스너 및 데이터 관리 =====

// ✅ Firebase 실시간 리스너
let articlesListenerActive = false;

// ✅ [최적화] pinnedArticles 60초 캐시
let _pinnedCache = null;
let _pinnedCacheTime = 0;
const PINNED_CACHE_TTL = 60_000;
async function getPinnedArticles() {
    if (_pinnedCache && Date.now() - _pinnedCacheTime < PINNED_CACHE_TTL) return _pinnedCache;
    const snap = await db.ref("pinnedArticles").once("value");
    _pinnedCache = snap.val() || {};
    _pinnedCacheTime = Date.now();
    return _pinnedCache;
}
// 관리자꬀ 고정 변하면 캐시 초기화
function invalidatePinnedCache() { _pinnedCache = null; }


// ===== 댓글 수 일괄 복구 (기존 기사 commentCount 마이그레이션) =====
window.migrateCommentCounts = async function() {
    if (!isAdmin()) { alert('관리자만 실행 가능합니다.'); return; }
    if (!confirm('모든 기사의 댓글 수를 실제 댓글 수로 업데이트합니다.\n시간이 걸릴 수 있습니다. 계속할까요?')) return;

    showLoadingIndicator('댓글 수 집계 중...');
    try {
        const [commentsSnap, articlesSnap] = await Promise.all([
            db.ref('comments').once('value'),
            db.ref('articles').once('value')
        ]);

        const commentsData = commentsSnap.val() || {};
        const articlesData = articlesSnap.val() || {};

        const updates = {};
        let updated = 0;

        // 모든 기사에 대해 실제 댓글 수 집계
        for (const articleId of Object.keys(articlesData)) {
            const articleComments = commentsData[articleId] || {};
            // 삭제된 댓글(deleted:true) 제외
            const realCount = Object.values(articleComments)
                .filter(c => c && !c.deleted).length;
            const storedCount = articlesData[articleId].commentCount || 0;

            if (realCount !== storedCount) {
                updates[`articles/${articleId}/commentCount`] = realCount;
                updated++;
            }
        }

        if (Object.keys(updates).length === 0) {
            hideLoadingIndicator();
            alert('✅ 모든 기사의 댓글 수가 이미 정확합니다.');
            return;
        }

        await db.ref().update(updates);
        hideLoadingIndicator();
        alert(`✅ ${updated}개 기사의 댓글 수가 업데이트되었습니다.`);
    } catch (e) {
        hideLoadingIndicator();
        alert('❌ 오류: ' + e.message);
        console.error(e);
    }
};

function setupArticlesListener() {
    if(articlesListenerActive) return;
    
    db.ref("articles").on("value", snapshot => {
        const val = snapshot.val() || {};
        allArticles = Object.entries(val).map(([key, a]) => {
            const { content: _c, ...rest } = a;
            // ✅ id 필드가 없으면 Firebase key로 보완
            if (!rest.id) rest.id = key;
            return rest;
        });
        // ✅ [최적화] 기사 데이터 수신 즉시 로딩화면 숨김 + 렌더링
        hidePageLoadingScreen();
        if(document.getElementById("articlesSection")?.classList.contains("active")) {
            searchArticles(false);
        }
    });
    
    articlesListenerActive = true;
}

// ✅ 기사 저장
function saveArticle(article, callback) {
    // ✅ 수정: 기사 ID 검증
    if (!article.id) {
        console.error("❌ 기사 ID가 없습니다!", article);
        alert("저장 실패: 기사 ID가 없습니다.");
        return;
    }
    
    // 기본값 설정
    if (!article.views) article.views = 0;
    if (!article.likeCount) article.likeCount = 0;
    if (!article.dislikeCount) article.dislikeCount = 0;
    
    console.log("💾 기사 저장 시작:", {
        id: article.id,
        title: article.title.substring(0, 30),
        contentLength: article.content ? article.content.length : 0
    });
    
    db.ref("articles/" + article.id).set(article).then(() => {
        console.log("✅ 기사 저장 완료:", article.id);
        if(callback) callback();
    }).catch(error => {
        console.error("❌ 기사 저장 실패:", error);
        alert("저장 실패: " + error.message);
    });
}

// ✅ 기사 삭제
function deleteArticleFromDB(articleId, callback) {
    Promise.all([
        db.ref('articles/' + articleId).remove(),
        db.ref('votes/' + articleId).remove(),
        db.ref('comments/' + articleId).remove()
    ]).then(() => {
        if(callback) callback();
    }).catch(error => {
        alert("삭제 실패: " + error.message);
    });
}

// ✅ 조회 기록 관리 함수들 추가
function getViewedArticles() {
    try {
        const viewed = localStorage.getItem('viewedArticles');
        return viewed ? JSON.parse(viewed) : {};
    } catch(error) {
        console.error("조회 기록 로드 실패:", error);
        return {};
    }
}

function hasViewedArticle(articleId, resetAt, currentDbViews) {
    const viewedArticles = getViewedArticles();
    const viewRecord = viewedArticles[articleId];
    if (!viewRecord) return false;
    // ✅ Firebase 조회수가 0이면 → 초기화된 것이므로 localStorage 기록 무효화 (재집계 허용)
    if (typeof currentDbViews === 'number' && currentDbViews === 0) return false;
    // ✅ resetAt이 있고, 내 방문 시각이 그 이전이면 → 초기화된 것으로 보고 재집계 허용
    if (resetAt && (!viewRecord.timestamp || viewRecord.timestamp < resetAt)) return false;
    return true;
}

function markArticleAsViewed(articleId) {
    try {
        const viewedArticles = getViewedArticles();
        viewedArticles[articleId] = {
            timestamp: Date.now(),
            viewedAt: new Date().toLocaleString(),
            permanent: true
        };
        localStorage.setItem('viewedArticles', JSON.stringify(viewedArticles));
        console.log("✅ 조회 기록 영구 저장:", articleId);
    } catch(error) {
        console.error("조회 기록 저장 실패:", error);
    }
}

function incrementView(id, resetAt, currentDbViews) {
    if (hasViewedArticle(id, resetAt, currentDbViews)) {
        console.log("ℹ️ 이미 조회한 기사입니다 (영구 기록):", id);
        return;
    }
    
    const viewRef = db.ref(`articles/${id}/views`);
    viewRef.transaction((currentViews) => {
        return (currentViews || 0) + 1;
    }).then((result) => {
        markArticleAsViewed(id);
        const newViewCount = result.snapshot.val();
        console.log("✅ 조회수 증가 완료:", id, "→", newViewCount);
        updateViewCountOnScreen(newViewCount);

        // ✅ 로그인 유저라면 독자 기록 저장 (관리자 확인용)
        const uid = getUserId();
        if (uid) {
            db.ref(`articleReaders/${id}/${uid}`).set({
                name: getNickname(),
                email: getUserEmail(),
                timestamp: Date.now(),
                readAt: new Date().toLocaleString()
            }).catch(() => {});
        }
    }).catch(error => {
        console.error("❌ 조회수 증가 실패:", error);
    });
}

// ✅ 화면에 조회수 실시간 반영 (개선 버전)
function updateViewCountOnScreen(newViewCount) {
    // 방법 1: ID로 직접 찾기
    const viewCountDisplay = document.getElementById('viewCountDisplay');
    if (viewCountDisplay) {
        // 애니메이션 효과
        viewCountDisplay.style.transition = 'all 0.3s ease';
        viewCountDisplay.style.transform = 'scale(1.3)';
        viewCountDisplay.style.color = '#c62828';
        viewCountDisplay.style.fontWeight = '700';
        
        // 조회수 업데이트
        viewCountDisplay.innerHTML = `👁️ ${newViewCount}`;
        
        // 0.3초 후 원래대로
        setTimeout(() => {
            viewCountDisplay.style.transform = 'scale(1)';
            viewCountDisplay.style.color = '#5f6368';
            viewCountDisplay.style.fontWeight = '400';
        }, 300);
        
        console.log("✅ 화면 조회수 실시간 반영:", newViewCount);
        return;
    }
    
    // 방법 2: 백업 - article-meta에서 찾기
    const articleMeta = document.querySelector('.article-meta');
    if (!articleMeta) {
        // 기사 페이지를 벗어난 뒤 비동기 응답이 도착한 경우 — 정상 상황, 무시
        return;
    }
    
    const spans = articleMeta.querySelectorAll('span');
    spans.forEach(span => {
        if (span.textContent.includes('👁️')) {
            span.style.transition = 'all 0.3s ease';
            span.style.transform = 'scale(1.3)';
            span.style.color = '#c62828';
            span.textContent = `👁️ ${newViewCount}`;
            
            setTimeout(() => {
                span.style.transform = 'scale(1)';
                span.style.color = '#5f6368';
            }, 300);
            
            console.log("✅ 화면 조회수 실시간 반영 (백업):", newViewCount);
        }
    });
}
// ✅ 조회수 가져오기
function getArticleViews(article) {
    return article.views || 0;
}

// ✅ 타임스탬프
function getArticleTimestamp(a) {
    if (!a) return 0;
    if (a.createdAt) return Number(a.createdAt);
    if (a.date) {
        return new Date(a.date).getTime() || 0;
    }
    return 0;
}

// ✅ 투표 확인
async function checkUserVote(articleId) {
    if (!isLoggedIn()) return null;
    const uid = getUserId();
    const snap = await db.ref(`votes/${articleId}/${uid}`).once('value');
    return snap.val(); 
}

// ✅ 투표 토글
// ✅ [BUG FIX] 연속 클릭으로 인한 중복 트랜잭션 방지용 잠금 Set
const _votingInProgress = new Set();

function toggleVote(articleId, voteType) {
    if(!isLoggedIn()) {
        alert("추천/비추천은 로그인 후 가능합니다!");
        return;
    }

    // ✅ 이미 처리 중인 기사는 중복 실행 차단
    const lockKey = `${articleId}_${getUserId()}`;
    if (_votingInProgress.has(lockKey)) return;
    _votingInProgress.add(lockKey);

    // ✅ 버튼 즉시 비활성화 (UI 피드백)
    const likeBtn    = document.getElementById(`like-btn-${articleId}`);
    const dislikeBtn = document.getElementById(`dislike-btn-${articleId}`);
    if (likeBtn)    likeBtn.disabled = true;
    if (dislikeBtn) dislikeBtn.disabled = true;

    const uid = getUserId();
    const voteRef = db.ref(`votes/${articleId}/${uid}`);
    // ✅ [BUG FIX] 기존: articles/${articleId} 전체 트랜잭션 → 작성자/관리자만 쓰기 가능해 일반 유저 차단됨
    // 수정: likeCount/dislikeCount 필드만 개별 트랜잭션 실행 → "auth != null" 규칙으로 모든 로그인 유저 가능
    const likeCountRef    = db.ref(`articles/${articleId}/likeCount`);
    const dislikeCountRef = db.ref(`articles/${articleId}/dislikeCount`);

    function _unlock() {
        _votingInProgress.delete(lockKey);
        if (likeBtn)    likeBtn.disabled = false;
        if (dislikeBtn) dislikeBtn.disabled = false;
    }

    voteRef.once('value').then(snapshot => {
        const currentVote = snapshot.val();
        const isCancelling = currentVote === voteType;

        const likeTransaction = likeCountRef.transaction(count => {
            count = count || 0;
            if (isCancelling && voteType === 'like') return count - 1;
            if (!isCancelling && currentVote === 'like') return count - 1;
            if (!isCancelling && voteType === 'like') return count + 1;
            return count;
        });

        const dislikeTransaction = dislikeCountRef.transaction(count => {
            count = count || 0;
            if (isCancelling && voteType === 'dislike') return count - 1;
            if (!isCancelling && currentVote === 'dislike') return count - 1;
            if (!isCancelling && voteType === 'dislike') return count + 1;
            return count;
        });

        Promise.all([likeTransaction, dislikeTransaction]).then(([likeResult, dislikeResult]) => {
            const newLikeCount    = likeResult.snapshot.val()    || 0;
            const newDislikeCount = dislikeResult.snapshot.val() || 0;

            // ✅ 트랜잭션 커밋 완료 후에 voteRef 업데이트
            const votePromise = isCancelling ? voteRef.remove() : voteRef.set(voteType);

            votePromise.then(() => voteRef.once('value')).then(snap => {
                const newVote = snap.val();
                if (likeBtn) {
                    likeBtn.className = `vote-btn${newVote === 'like' ? ' active' : ''}`;
                    likeBtn.innerHTML = `👍 추천 ${newLikeCount}`;
                }
                if (dislikeBtn) {
                    dislikeBtn.className = `vote-btn dislike${newVote === 'dislike' ? ' active' : ''}`;
                    dislikeBtn.innerHTML = `👎 비추천 ${newDislikeCount}`;
                }
            }).finally(_unlock);
        }).catch(_unlock);
    }).catch(_unlock);
}

// ✅ 투표 수
function getArticleVoteCounts(article) {
    return {
        likes: article.likeCount || 0,
        dislikes: article.dislikeCount || 0
    };
}

// ✅ 검색
let searchTimeout = null;

function searchArticles(resetPage = true) {
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
        const category = document.getElementById("searchCategory").value;
        const keyword = document.getElementById("searchKeyword").value.toLowerCase();
        let articles = [...allArticles];
        
        if(category) {
            articles = articles.filter(a => a.category === category);
        }
        if(keyword) {
            articles = articles.filter(a =>
                a.title.toLowerCase().includes(keyword) ||
                (a.summary && a.summary.toLowerCase().includes(keyword)) ||
                (a.author && a.author.toLowerCase().includes(keyword))
            );
        }
        
        filteredArticles = articles;
        if(resetPage) currentArticlePage = 1;
        renderArticles();
    }, 300);
}

// ✅ 정렬
function sortArticles(method, btn) {
    currentSortMethod = method;
    currentArticlePage = 1;
    document.querySelectorAll('#articlesSection .chip').forEach(b => b.classList.remove('active'));
    if (btn && btn.classList) btn.classList.add('active');
    renderArticles();
}

// ✅ 정렬된 기사
function getSortedArticles() {
    let articles = Array.isArray(filteredArticles) ? [...filteredArticles] : [];
    
    const sortFunctions = {
        'latest': (a, b) => getArticleTimestamp(b) - getArticleTimestamp(a),
        'oldest': (a, b) => getArticleTimestamp(a) - getArticleTimestamp(b),
        'views': (a, b) => (b.views || 0) - (a.views || 0),
        'likes': (a, b) => (b.likeCount || 0) - (a.likeCount || 0)
    };
    
    const sortFunction = sortFunctions[currentSortMethod] || sortFunctions['latest'];
    articles.sort(sortFunction);
    
    return articles;
}

// ✅ 기사 더보기
function loadMoreArticles() {
    // ✅ 수정: 더보기 전 스크롤 위치 저장
    const beforeHeight = document.documentElement.scrollHeight;
    const beforeScroll = window.pageYOffset;
    
    currentArticlePage++;
    renderArticles();
    
    // ✅ 수정: 렌더링 후 스크롤 위치 복원
    setTimeout(() => {
        const afterHeight = document.documentElement.scrollHeight;
        const heightDiff = afterHeight - beforeHeight;
        window.scrollTo(0, beforeScroll + heightDiff - 100); // 새 콘텐츠 시작점으로 스크롤
    }, 100);
}

window.showActivityStatus = async function() {
    hideAll();
    window.scrollTo(0, 0);

    let section = document.getElementById('activityStatusSection');
    if (!section) {
        section = document.createElement('section');
        section.id = 'activityStatusSection';
        section.className = 'page-section';
        document.querySelector('main').appendChild(section);
    }
    section.classList.add('active');

    section.innerHTML = `
        <div style="max-width:700px; margin:0 auto; padding:20px;">
            <div style="background:white; border-radius:14px; box-shadow:0 2px 12px rgba(0,0,0,0.09); overflow:hidden;">
                <div style="background:linear-gradient(135deg,#1565c0,#1976d2); padding:18px 20px; display:flex; align-items:center; justify-content:space-between;">
                    <h2 style="color:white; margin:0; font-size:20px; font-weight:800; display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-users"></i> 사용자 활동 현황
                    </h2>
                    <button onclick="showMoreMenu()" style="background:rgba(255,255,255,0.18); border:none; color:white; padding:8px 14px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px;">
                        <i class="fas fa-arrow-left"></i> 뒤로
                    </button>
                </div>
                <div style="padding:11px 18px; background:#f8f9fa; border-bottom:1px solid #eee; display:flex; gap:16px; flex-wrap:wrap; font-size:12px; color:#6c757d;">
                    <span>🟢 현재 활동중 (3분 이내)</span>
                    <span>🟡 하루 이내</span>
                    <span>⚫ 오래 됨</span>
                    <span>👻 실종됨 (100일+)</span>
                </div>
                <div id="activityUserList" style="padding:8px 0;">
                    <div style="text-align:center; padding:40px; color:#868e96;">
                        <i class="fas fa-spinner fa-spin" style="font-size:28px;"></i>
                        <p style="margin-top:12px;">불러오는 중...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    updateURL('activity');

    // ===== 수정 후 코드 =====
    try {
        const [usersSnapshot, articlesSnapshot] = await Promise.all([
            db.ref('users').once('value'),
            db.ref('articles').once('value')
        ]);
        const usersData = usersSnapshot.val() || {};

        // articles의 author 필드로 이메일 → 닉네임 맵 구성
        const emailToNickname = {};
        const articlesData = articlesSnapshot.val() || {};
        Object.values(articlesData).forEach(article => {
            if (article.authorEmail && article.author) {
                emailToNickname[article.authorEmail] = article.author;
            }
        });

        // ✅ 이메일 기준 중복 제거 (lastSeen이 가장 최신인 항목만 유지)
        const emailMap = new Map();
        Object.entries(usersData)
            .filter(([uid, data]) => data.email)
            .forEach(([uid, data]) => {
                const email = data.email;
                const thisLastSeen = data.lastSeen || 0;
                const existing = emailMap.get(email);
                if (!existing || thisLastSeen > (existing.lastSeen || 0)) {
                    emailMap.set(email, {
                        uid,
                        email,
                        nickname: data.newNickname || data.displayName || emailToNickname[email] || email.split('@')[0],
                        lastSeen: data.lastSeen || null,
                        isBanned: data.isBanned || false
                    });
                }
            });

        const users = Array.from(emailMap.values())
            .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));

        if (users.length === 0) {
            document.getElementById('activityUserList').innerHTML =
                '<p style="text-align:center;color:#adb5bd;padding:40px;">사용자 정보가 없습니다.</p>';
            return;
        }

        document.getElementById('activityUserList').innerHTML = users.map(u => {
            const lastSeenHTML = formatLastSeen(u.lastSeen);
            const bannedBadge  = u.isBanned
                ? '<span style="background:#343a40;color:white;padding:2px 7px;border-radius:10px;font-size:10px;margin-left:6px;">차단</span>'
                : '';
            return `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid #f0f0f0;"
                     onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background=''">
                    <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
                        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#e3f2fd,#bbdefb);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <i class="fas fa-user" style="color:#1976d2;font-size:14px;"></i>
                        </div>
                        <div style="min-width:0;">
                            <div style="font-weight:600;color:#212529;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                                ${escapeHTML(u.nickname)}${bannedBadge}
                            </div>
                            <div style="font-size:11px;color:#adb5bd;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(u.email)}</div>
                        </div>
                    </div>
                    <div style="font-size:13px;white-space:nowrap;margin-left:12px;">${lastSeenHTML}</div>
                </div>
            `;
        }).join('');

    } catch(err) {
        document.getElementById('activityUserList').innerHTML =
            `<p style="color:#f44336;text-align:center;padding:30px;">로드 실패: ${err.message}</p>`;
    }
};

console.log("✅ Part 13 Firebase 리스너 완료");

// ===== Part 23: 메신저 시스템 (1대1 채팅) =====

// ===== 2. 메신저 → 알림 확인 기능으로 변경 =====

// ⭐ showMessenger 함수를 알림 목록 표시로 변경
window.showMessenger = async function() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    hideAll();
    
    let section = document.getElementById("messengerSection");
    if(!section) {
        const container = document.querySelector("main") || document.body;
        section = document.createElement("section");
        section.id = "messengerSection";
        section.className = "page-section";
        container.appendChild(section);
    }
    
    section.classList.add("active");
    
section.innerHTML = `
    <div style="max-width:800px; margin:0 auto; padding:20px;">

        <div style="background:white; border-radius:14px; box-shadow:0 2px 12px rgba(0,0,0,0.09); margin-bottom:20px; overflow:hidden;">
            <div style="background:linear-gradient(135deg,#c62828,#e53935); padding:18px 20px; display:flex; align-items:center; justify-content:space-between;">
                <h2 style="color:white; margin:0; font-size:20px; font-weight:800; display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-bell" style="font-size:18px;"></i> 알림
                </h2>
                <button onclick="showMoreMenu()" style="background:rgba(255,255,255,0.18); border:none; color:white; padding:8px 14px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px;">
                    <i class="fas fa-arrow-left"></i> 뒤로
                </button>
            </div>
            <div style="padding:12px 16px; display:flex; gap:8px; flex-wrap:wrap; border-top:1px solid #f0f0f0; background:#fafafa; align-items:center;">
                <button onclick="toggleSelectionMode()" id="toggleSelectionBtn"
                    style="background:white; border:1.5px solid #dee2e6; color:#495057; padding:7px 14px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px;">
                    <i class="fas fa-check-square"></i> 선택
                </button>
                <button onclick="deleteSelectedNotifications()" id="deleteSelectedBtn"
                    style="display:none; background:#ffebee; border:1.5px solid #ef9a9a; color:#c62828; padding:7px 14px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; align-items:center; gap:6px;">
                    <i class="fas fa-trash"></i> 선택 삭제
                </button>
                <button onclick="markAllNotificationsAsRead()"
                    style="background:white; border:1.5px solid #dee2e6; color:#495057; padding:7px 14px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px;">
                    <i class="fas fa-check-double"></i> 모두 읽음
                </button>
                ${isAdmin() ? `
                <button onclick="showAdminNotificationManager()"
                    style="background:#fff8e1; border:1.5px solid #ffe082; color:#856404; padding:7px 14px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px; margin-left:auto;">
                    <i class="fas fa-shield-alt"></i> 관리자 삭제
                </button>
                ` : ''}
            </div>
        </div>
            
            <!-- 필터 버튼 -->
            <div class="messenger-filters" style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
                <button onclick="filterNotifications('all')" class="filter-chip active" data-filter="all">
                    전체
                </button>
                <button onclick="filterNotifications('article')" class="filter-chip" data-filter="article">
                    새 기사
                </button>
                <button onclick="filterNotifications('comment')" class="filter-chip" data-filter="comment">
                    댓글
                </button>
                <button onclick="filterNotifications('myArticleComment')" class="filter-chip" data-filter="myArticleComment">
                    내 기사
                </button>
            </div>
            
            <!-- 알림 목록 -->
            <div id="notificationsList" style="background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <div style="text-align:center; padding:40px 20px; color:#868e96;">
                    <i class="fas fa-spinner fa-spin" style="font-size:32px;"></i>
                    <p style="margin-top:15px;">알림을 불러오는 중...</p>
                </div>
            </div>
        </div>
        
        <style>
            .filter-chip {
                padding: 8px 16px;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
                color: #495057;
            }
            
            .filter-chip:hover {
                background: #e9ecef;
            }
            
            .filter-chip.active {
                background: #c62828;
                color: white;
                border-color: #c62828;
            }
            
            .notification-item {
                padding: 15px;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: background 0.2s;
                display: flex;
                gap: 12px;
                align-items: flex-start;
            }
            
            .notification-item:hover {
                background: #f8f9fa;
            }
            
            .notification-item.unread {
                background: #fff3cd;
            }
            
            .notification-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                font-size: 18px;
            }
            
            .notification-content {
                flex: 1;
                min-width: 0;
            }
            
            .notification-title {
                font-weight: 600;
                color: #212529;
                margin-bottom: 4px;
            }
            
            .notification-text {
                color: #6c757d;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .notification-time {
                font-size: 12px;
                color: #868e96;
                margin-top: 4px;
            }
        </style>
    `;
    
    updateURL('messenger');
    await loadNotificationsList();
};

// ⭐ 알림 목록 로드
let currentFilter = 'all';

async function loadNotificationsList(filter = 'all') {
    currentFilter = filter;
    const myUid = getUserId();
    const listEl = document.getElementById("notificationsList");
    
    if(!listEl) return;
    
    listEl.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:#868e96;">
            <i class="fas fa-spinner fa-spin" style="font-size:32px;"></i>
            <p style="margin-top:15px;">알림을 불러오는 중...</p>
        </div>
    `;
    
    try {
        const snapshot = await db.ref(`notifications/${myUid}`).once('value');
        const notificationsData = snapshot.val() || {};
        
        let notifications = Object.entries(notificationsData)
            .map(([id, notif]) => ({ id, ...notif }))
            .sort((a, b) => b.timestamp - a.timestamp);
        
        // 필터 적용
        if (filter !== 'all') {
            notifications = notifications.filter(n => n.type === filter);
        }
        
        if (notifications.length === 0) {
            listEl.innerHTML = `
                <div style="text-align:center; padding:60px 20px;">
                    <i class="fas fa-bell-slash" style="font-size:64px; color:#dee2e6;"></i>
                    <p style="color:#868e96; margin-top:20px; font-size:16px;">
                        ${filter === 'all' ? '알림이 없습니다' : '해당 유형의 알림이 없습니다'}
                    </p>
                </div>
            `;
            return;
        }
        
        listEl.innerHTML = notifications.map(notif => {
    const icon = getNotificationIcon(notif.type);
    const bgColor = getNotificationColor(notif.type);
    const timeAgo = getTimeAgo(notif.timestamp);
    
    return `
        <div class="notification-item ${!notif.read ? 'unread' : ''}" 
             data-notification-id="${notif.id}"
             onclick="handleNotificationClick('${notif.id}', '${notif.articleId || ''}')">
            
            <!-- ✅ 체크박스 추가 (선택 모드일 때만 표시) -->
            <div class="notification-checkbox" style="display:none; margin-right:12px;">
                <input type="checkbox" 
                       class="notification-select-checkbox"
                       data-notif-id="${notif.id}"
                       onclick="event.stopPropagation();"
                       style="width:18px; height:18px; cursor:pointer;">
            </div>
            
            <div class="notification-icon" style="background:${bgColor}; color:white;">
                <i class="fas ${icon}"></i>
            </div>
                    <div class="notification-content">
                        <div class="notification-title">${notif.title || '알림'}</div>
                        <div class="notification-text">${notif.text || ''}</div>
                        <div class="notification-time">
                            ${timeAgo}
                            ${!notif.read ? ' <span style="color:#c62828;">• 읽지 않음</span>' : ''}
                        </div>
                    </div>
                    <!-- ✅ 개별 삭제 버튼 추가 -->
            <div style="display:flex; gap:8px; margin-left:auto;">
                ${!notif.read ? `
                    <button onclick="event.stopPropagation(); markNotificationAsRead('${notif.id}')" 
                            class="notif-action-btn"
                            style="padding:6px 12px; background:#e9ecef; border:none; border-radius:4px; font-size:12px; cursor:pointer;">
                        읽음
                    </button>
                ` : ''}
                
                <button onclick="event.stopPropagation(); deleteNotification('${notif.id}')"
                        class="notif-action-btn"
                        style="padding:6px 12px; background:#ffebee; color:#c62828; border:none; border-radius:4px; font-size:12px; cursor:pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}).join('');
        
    } catch(error) {
        console.error("알림 로드 실패:", error);
        listEl.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:#f44336;">
                <i class="fas fa-exclamation-circle" style="font-size:48px;"></i>
                <p style="margin-top:15px;">알림을 불러오는데 실패했습니다</p>
            </div>
        `;
    }
}

// ⭐ 알림 아이콘
function getNotificationIcon(type) {
    const icons = {
        'article': 'fa-newspaper',
        'comment': 'fa-comment',
        'myArticleComment': 'fa-comments',
        'stock_alert': 'fa-chart-line',
        'notification': 'fa-bell'
    };
    return icons[type] || 'fa-bell';
}

// ⭐ 알림 색상
function getNotificationColor(type) {
    const colors = {
        'article': '#c62828',
        'comment': '#1976d2',
        'myArticleComment': '#388e3c',
        'stock_alert': '#f57c00',
        'notification': '#6c757d'
    };
    return colors[type] || '#6c757d';
}

// ⭐ 시간 표시
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return new Date(timestamp).toLocaleDateString('ko-KR');
}

// ⭐ 알림 클릭 처리
window.handleNotificationClick = async function(notificationId, articleId) {
    const myUid = getUserId();
    await db.ref(`notifications/${myUid}/${notificationId}`).remove();
    await updateMessengerBadge();
    await loadNotificationsList(currentFilter);
    
    if (articleId) {
        showArticleDetail(articleId);
    }
};

// ⭐ 알림 읽음 처리
window.markNotificationAsRead = async function(notificationId) {
    const myUid = getUserId();
    
    try {
        await db.ref(`notifications/${myUid}/${notificationId}`).update({
            read: true,
            readAt: Date.now()
        });
        
        await loadNotificationsList(currentFilter);
        await updateMessengerBadge();
    } catch(error) {
        console.error("알림 읽음 처리 실패:", error);
    }
};

// ⭐ 모든 알림 읽음 처리
window.markAllNotificationsAsRead = async function() {
    if (!confirm('모든 알림을 읽음으로 표시하시겠습니까?')) return;
    
    const myUid = getUserId();
    
    try {
        const snapshot = await db.ref(`notifications/${myUid}`).once('value');
        const notifications = snapshot.val() || {};
        
        const updates = {};
        Object.keys(notifications).forEach(notifId => {
            updates[`notifications/${myUid}/${notifId}/read`] = true;
            updates[`notifications/${myUid}/${notifId}/readAt`] = Date.now();
        });
        
        await db.ref().update(updates);
        await loadNotificationsList(currentFilter);
        await updateMessengerBadge();
        
    } catch(error) {
        console.error("모든 알림 읽음 처리 실패:", error);
        alert("처리 중 오류가 발생했습니다.");
    }
};

// ⭐ 필터 변경
window.filterNotifications = function(filter) {
    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.filter-chip[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    loadNotificationsList(filter);
};

// ⭐ 메신저 배지 업데이트 (읽지 않은 알림 수)
async function updateMessengerBadge() {
    if (!isLoggedIn()) return;
    
    const myUid = getUserId();
    const badges = document.querySelectorAll('#messengerBadge, #messengerBadgeMore');
    
    try {
        const snapshot = await db.ref(`notifications/${myUid}`)
            .orderByChild('read')
            .equalTo(false)
            .once('value');
        
        const unreadCount = snapshot.numChildren();
        
        badges.forEach(badge => {
    if (!badge) return;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
});

// 하단 더보기 버튼 빨간 점 업데이트
const moreMenuDot = document.getElementById('moreMenuDot');
if (moreMenuDot) {
    moreMenuDot.style.display = unreadCount > 0 ? 'block' : 'none';
}
    } catch (error) {
        console.error("메신저 배지 업데이트 실패:", error);
    }
}

console.log("✅ 메신저 → 알림 확인 기능으로 변경 완료");

// ===== 알림 삭제 기능들 =====

// 전역 변수: 선택 모드 상태
let isSelectionMode = false;

// ⭐ 선택 모드 토글
window.toggleSelectionMode = function() {
    isSelectionMode = !isSelectionMode;
    
    const toggleBtn = document.getElementById('toggleSelectionBtn');
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    const checkboxes = document.querySelectorAll('.notification-checkbox');
    
    if (isSelectionMode) {
        // 선택 모드 활성화
        toggleBtn.innerHTML = '<i class="fas fa-times"></i> 취소';
        toggleBtn.classList.add('active');
        deleteBtn.style.display = 'inline-flex';
        
        checkboxes.forEach(cb => cb.style.display = 'flex');
        
        // 알림 클릭 비활성화
        document.querySelectorAll('.notification-item').forEach(item => {
            item.style.cursor = 'default';
            const onclick = item.getAttribute('onclick');
            if (onclick) {
                item.setAttribute('data-original-onclick', onclick);
                item.removeAttribute('onclick');
            }
        });
    } else {
        // 선택 모드 비활성화
        toggleBtn.innerHTML = '<i class="fas fa-check-square"></i> 선택';
        toggleBtn.classList.remove('active');
        deleteBtn.style.display = 'none';
        
        checkboxes.forEach(cb => {
            cb.style.display = 'none';
            cb.querySelector('input').checked = false;
        });
        
        // 알림 클릭 복원
        document.querySelectorAll('.notification-item').forEach(item => {
            item.style.cursor = 'pointer';
            const onclick = item.getAttribute('data-original-onclick');
            if (onclick) {
                item.setAttribute('onclick', onclick);
                item.removeAttribute('data-original-onclick');
            }
        });
    }
};

// ⭐ 개별 알림 삭제
window.deleteNotification = async function(notificationId) {
    // ✅ confirm 제거 - 즉시 삭제
    
    const myUid = getUserId();
    
    try {
        await db.ref(`notifications/${myUid}/${notificationId}`).remove();
        
        // 화면에서 제거
        const notifElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notifElement) {
            notifElement.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                loadNotificationsList(currentFilter);
            }, 300);
        }
        
        await updateMessengerBadge();
        
    } catch(error) {
        console.error("알림 삭제 실패:", error);
        alert("삭제 중 오류가 발생했습니다.");
    }
};

// ⭐ 선택된 알림들 삭제
window.deleteSelectedNotifications = async function() {
    const selectedCheckboxes = document.querySelectorAll('.notification-select-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('삭제할 알림을 선택해주세요.');
        return;
    }
    
    if (!confirm(`선택한 ${selectedCheckboxes.length}개의 알림을 삭제하시겠습니까?`)) return;
    
    const myUid = getUserId();
    const updates = {};
    
    selectedCheckboxes.forEach(checkbox => {
        const notifId = checkbox.getAttribute('data-notif-id');
        updates[`notifications/${myUid}/${notifId}`] = null;
    });
    
    try {
        await db.ref().update(updates);
        
        // 선택 모드 해제
        toggleSelectionMode();
        
        // 목록 새로고침
        await loadNotificationsList(currentFilter);
        await updateMessengerBadge();
        
        if (typeof showToastNotification === 'function') {
            showToastNotification('삭제 완료', `${selectedCheckboxes.length}개의 알림이 삭제되었습니다.`);
        }
        
    } catch(error) {
        console.error("알림 삭제 실패:", error);
        alert("삭제 중 오류가 발생했습니다.");
    }
};

// ⭐ 관리자 전용: 전체 사용자 알림 관리 모달
window.showAdminNotificationManager = async function() {
    if (!isAdmin()) {
        alert("🚫 관리자 권한이 필요합니다!");
        return;
    }
    
    showLoadingIndicator("알림 목록 로딩 중...");
    
    try {
        // 모든 사용자의 알림 수집
        const usersSnapshot = await db.ref('users').once('value');
        const usersData = usersSnapshot.val() || {};
        
        const notificationMap = new Map(); // notificationId -> { count, users[], data }
        
        for (const [uid, userData] of Object.entries(usersData)) {
            const notificationsSnapshot = await db.ref(`notifications/${uid}`).once('value');
            const notifications = notificationsSnapshot.val() || {};
            
            for (const [notifId, notifData] of Object.entries(notifications)) {
                // timestamp 기준으로 같은 알림 그룹화
                const key = `${notifData.timestamp}_${notifData.title}_${notifData.articleId || 'none'}`;
                
                if (!notificationMap.has(key)) {
                    notificationMap.set(key, {
                        sampleId: notifId,
                        data: notifData,
                        users: [],
                        count: 0
                    });
                }
                
                const group = notificationMap.get(key);
                group.users.push({ uid, notifId });
                group.count++;
            }
        }
        
        hideLoadingIndicator();
        
        // 모달 생성
        const existingModal = document.getElementById('adminNotificationModal');
        if (existingModal) existingModal.remove();
        
        const notifications = Array.from(notificationMap.entries())
            .sort((a, b) => b[1].data.timestamp - a[1].data.timestamp);
        
        const modalHTML = `
            <div id="adminNotificationModal" class="modal active">
                <div class="modal-content" style="max-width:900px; max-height:80vh; overflow-y:auto;">
                    <div class="modal-header">
                        <h3 style="color:#c62828;">
                            <i class="fas fa-shield-alt"></i> 관리자 알림 관리
                        </h3>
                        <button onclick="closeAdminNotificationModal()" class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div style="padding:20px;">
                        <div style="background:#fff3cd; padding:12px; border-radius:8px; margin-bottom:20px; border:1px solid #ffc107;">
                            <i class="fas fa-exclamation-triangle" style="color:#856404;"></i>
                            <strong>주의:</strong> 선택한 알림이 모든 사용자에게서 삭제됩니다.
                        </div>
                        
                        ${notifications.length === 0 ? `
                            <div style="text-align:center; padding:60px 20px; color:#868e96;">
                                <i class="fas fa-inbox" style="font-size:48px; margin-bottom:15px; display:block;"></i>
                                <p>전송된 알림이 없습니다.</p>
                            </div>
                        ` : notifications.map(([key, group]) => {
                            const timeAgo = getTimeAgo(group.data.timestamp);
                            const icon = getNotificationIcon(group.data.type);
                            const bgColor = getNotificationColor(group.data.type);
                            
                            return `
                                <div style="background:#f8f9fa; padding:16px; border-radius:8px; margin-bottom:12px; border:1px solid #dee2e6;">
                                    <div style="display:flex; gap:12px; align-items:flex-start;">
                                        <div style="width:40px; height:40px; border-radius:50%; background:${bgColor}; color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                            <i class="fas ${icon}"></i>
                                        </div>
                                        
                                        <div style="flex:1;">
                                            <div style="font-weight:600; color:#212529; margin-bottom:4px;">
                                                ${group.data.title}
                                            </div>
                                            <div style="font-size:14px; color:#6c757d; margin-bottom:8px;">
                                                ${group.data.text}
                                            </div>
                                            <div style="font-size:12px; color:#868e96;">
                                                <i class="fas fa-users"></i> ${group.count}명에게 전송 · ${timeAgo}
                                                ${group.data.articleId ? ` · 기사 ID: ${group.data.articleId}` : ''}
                                            </div>
                                        </div>
                                        
                                        <button onclick="deleteNotificationForAllUsers('${key}')" 
                                                class="btn-danger" 
                                                style="padding:8px 16px; white-space:nowrap;">
                                            <i class="fas fa-trash"></i> 전체 삭제
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes fadeOut {
                    to {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 전역 변수에 저장 (삭제 시 사용)
        window.adminNotificationMap = notificationMap;
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("관리자 알림 목록 로딩 실패:", error);
        alert("알림 목록을 불러오는데 실패했습니다.");
    }
};

// ⭐ 모든 사용자에게서 특정 알림 삭제
window.deleteNotificationForAllUsers = async function(notificationKey) {
    if (!isAdmin()) {
        alert("🚫 관리자 권한이 필요합니다!");
        return;
    }
    
    const group = window.adminNotificationMap.get(notificationKey);
    
    if (!group) {
        alert("알림 정보를 찾을 수 없습니다.");
        return;
    }
    
    if (!confirm(`이 알림을 ${group.count}명의 사용자에게서 모두 삭제하시겠습니까?\n\n"${group.data.title}"`)) {
        return;
    }
    
    showLoadingIndicator("삭제 중...");
    
    try {
        const updates = {};
        
        group.users.forEach(({ uid, notifId }) => {
            updates[`notifications/${uid}/${notifId}`] = null;
        });
        
        await db.ref().update(updates);
        
        hideLoadingIndicator();
        
        if (typeof showToastNotification === 'function') {
            showToastNotification('삭제 완료', `${group.count}명의 사용자에게서 알림이 삭제되었습니다.`);
        }
        
        // 모달 닫고 다시 열기
        closeAdminNotificationModal();
        setTimeout(() => showAdminNotificationManager(), 300);
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("알림 삭제 실패:", error);
        alert("삭제 중 오류가 발생했습니다: " + error.message);
    }
};

// ⭐ 관리자 알림 모달 닫기
window.closeAdminNotificationModal = function() {
    const modal = document.getElementById('adminNotificationModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
};

console.log("✅ 알림 삭제 기능 추가 완료");

// ===== Part 14: 최종 초기화 =====

window.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 시스템 초기화 (DOMContentLoaded - 최적화)...");

    // ✅ [최적화] 로딩 화면 즉시 표시
    showPageLoadingScreen();
    // 안전장치: 10초 후에도 남아있으면 강제 숨김
    setTimeout(() => hidePageLoadingScreen(), 10000);

    setupArticlesListener();
    
    Promise.all([
        loadBannedWords()
    ]).then(() => {
        console.log("📦 모든 설정 로드 완료");
    });
    
    setupArticleForm();
    
    // ✅ [PATCH 3] 3분마다 lastSeen 갱신 (누수 방지: interval ID 저장)
    if (window._lastSeenInterval) clearInterval(window._lastSeenInterval);
    window._lastSeenInterval = setInterval(updateLastSeen, 3 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') updateLastSeen();
    });
    // ✅ 페이지 언로드 시 interval 정리
    window.addEventListener('beforeunload', () => {
        clearInterval(window._lastSeenInterval);
    }, { once: true });

    // ✅ 카테고리 자동 적용 리스너 등록
    setupCategoryChangeListener();
    
    // ✅ 수정: 세션 스토리지에서 카테고리 복원
    const savedCategory = sessionStorage.getItem('currentCategory');
    if(savedCategory) {
        currentCategory = savedCategory;
    }
    
    // ✅ 삭제됨: cleanupOldViewRecords() 호출 제거
    
    // ✅ [BUG FIX] authReady 이후에 라우팅 실행
    // Firebase 세션 복원이 완료된 후 initialRoute를 실행해야
    // showWritePage 등에서 isLoggedIn()이 정확한 값을 반환한다
    authReady.then(() => {
        initialRoute();
    });
});

// ✅ 추가: 페이지 언로드 시 카테고리 저장
window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('currentCategory', currentCategory);
});

// ============================================================
// 🎨 Part 15: 테마 시스템 (기본/붉은말/크리스마스/가나디)
// ============================================================

console.log("🎨 Part 15: 멀티 테마 시스템 시작");

// 테마 CSS 링크 엘리먼트
let themeStylesheet = null;
let currentAppliedTheme = null;

// 현재 테마 가져오기
function getCurrentTheme() {
    const theme = localStorage.getItem('selectedTheme') || 'default';
    return theme;
}

// 테마 저장하기
function saveTheme(themeName) {
    localStorage.setItem('selectedTheme', themeName);
    console.log('💾 테마 저장:', themeName);
}

// ❄️ 눈 내리는 효과 함수들
function initSnowfall() {
    console.log('❄️ 눈 내리는 효과 초기화 시작');
    
    const container = document.getElementById('snowfall-container');
    if (!container) {
        console.warn('⚠️ snowfall-container를 찾을 수 없습니다.');
        const newContainer = document.createElement('div');
        newContainer.id = 'snowfall-container';
        document.body.appendChild(newContainer);
        setTimeout(() => initSnowfall(), 100);
        return;
    }
    
    container.innerHTML = '';
    
    const isMobile = window.innerWidth <= 768;
    const snowflakeCount = isMobile ? 40 : 60;
    const snowflakeShapes = ['❄', '❅', '❆', '•', '∗'];
    
    for (let i = 0; i < snowflakeCount; i++) {
        createSnowflake(container, snowflakeShapes);
    }
    
    console.log(`✅ 크리스마스 눈 내리는 효과 시작! ${snowflakeCount}개의 눈송이 ❄️`);
}

function createSnowflake(container, shapes) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    snowflake.textContent = randomShape;
    
    const randomLeft = Math.random() * 100;
    snowflake.style.left = randomLeft + '%';
    
    const randomSize = Math.random() * 1 + 0.5;
    snowflake.style.fontSize = randomSize + 'em';
    
    const randomDuration = Math.random() * 10 + 5;
    snowflake.style.animationDuration = randomDuration + 's';
    
    const randomDelay = Math.random() * 2;
    snowflake.style.animationDelay = randomDelay + 's';
    
    const randomOpacity = Math.random() * 0.5 + 0.5;
    snowflake.style.opacity = randomOpacity;
    
    container.appendChild(snowflake);
}

function removeSnowfall() {
    const container = document.getElementById('snowfall-container');
    if (container) {
        container.innerHTML = '';
        console.log('❄️ 눈 효과 제거됨');
    }
}

// 🐴 붉은 말 인사 배너
function showHorseGreeting() {
    if (document.getElementById('horseGreeting')) return;
    
    const greeting = document.createElement('div');
    greeting.id = 'horseGreeting';
    greeting.className = 'horse-greeting';
    greeting.innerHTML = `
        <div class="horse-greeting-text">
            <div class="horse-greeting-title">🎊 2026년 병오년(丙午年) 새해 복 많이 받으세요!</div>
            <div class="horse-greeting-desc">붉은 말이 여러분의 해정뉴스 탐험을 안내합니다 ✨</div>
        </div>
        <button class="horse-greeting-close" onclick="hideHorseGreeting()">×</button>
    `;
    
    const mainContent = document.querySelector('main');
    if (mainContent && mainContent.firstChild) {
        mainContent.insertBefore(greeting, mainContent.firstChild);
        setTimeout(() => {
            greeting.style.animation = 'slideDown 0.5s ease';
        }, 100);
        console.log('🐴 붉은 말 인사 배너 표시');
    }
}

window.hideHorseGreeting = function() {
    const greeting = document.getElementById('horseGreeting');
    if (greeting) {
        greeting.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            greeting.remove();
            localStorage.setItem('horseGreetingDismissed', 'true');
            console.log('🐴 붉은 말 인사 배너 닫기');
        }, 300);
    }
};

// 🐶 가나디 인사 배너
function showGanadiGreeting() {
    if (document.getElementById('ganadiGreeting')) return;
    
    const greeting = document.createElement('div');
    greeting.id = 'ganadiGreeting';
    greeting.className = 'ganadi-greeting';
    greeting.innerHTML = `
        <div class="ganadi-greeting-text">
            <div class="ganadi-greeting-title">🐶 듀... 가나디 테마에 오신 것을 환영합니다!</div>
            <div class="ganadi-greeting-desc">듀..? 가나디는 숨어있답니다! 찾아보세요! 💧</div>
        </div>
        <button class="ganadi-greeting-close" onclick="hideGanadiGreeting()">×</button>
    `;
    
    const mainContent = document.querySelector('main');
    if (mainContent && mainContent.firstChild) {
        mainContent.insertBefore(greeting, mainContent.firstChild);
        setTimeout(() => {
            greeting.style.animation = 'slideDown 0.5s ease';
        }, 100);
        console.log('🐶 가나디 인사 배너 표시');
    }
}

window.hideGanadiGreeting = function() {
    const greeting = document.getElementById('ganadiGreeting');
    if (greeting) {
        greeting.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            greeting.remove();
            localStorage.setItem('ganadiGreetingDismissed', 'true');
            console.log('🐶 가나디 인사 배너 닫기');
        }, 300);
    }
};

// ============================================
// 🐶 수정된 applyTheme 함수 (가나디 테마 클래스 지원)
// 이 함수를 기존 script.js의 applyTheme 함수와 교체하세요
// ============================================

function applyTheme(themeName) {
    console.log('🎨 테마 적용 시도:', themeName);
    
    if (currentAppliedTheme === themeName) {
        console.log('✅ 이미 적용된 테마:', themeName);
        return;
    }
    
    // 기존 테마 스타일시트 제거
    if (themeStylesheet && themeStylesheet.parentNode) {
        console.log('🗑️ 기존 테마 스타일시트 제거');
        themeStylesheet.parentNode.removeChild(themeStylesheet);
        themeStylesheet = null;
    }
    
    // 모든 특수 효과 및 배너 제거
    removeSnowfall();
    const horseGreeting = document.getElementById('horseGreeting');
    if (horseGreeting) horseGreeting.remove();
    const ganadiGreeting = document.getElementById('ganadiGreeting');
    if (ganadiGreeting) ganadiGreeting.remove();
    
    // ✨ 모든 테마 클래스 제거 (새 테마 적용 전 초기화)
    document.body.classList.remove('ganadi-theme');
    document.body.classList.remove('dark-theme');
    
    // 테마별 처리
    if (themeName === 'red-horse') {
        // 🐴 붉은 말 테마
        let style2 = document.querySelector('link[href*="style2.css"]');
        
        if (!style2) {
            themeStylesheet = document.createElement('link');
            themeStylesheet.rel = 'stylesheet';
            themeStylesheet.href = 'css/style2.css';
            themeStylesheet.id = 'red-horse-theme';
            document.head.appendChild(themeStylesheet);
            console.log('🐴 붉은 말 테마 로드');
            
            themeStylesheet.onload = function() {
                console.log('✅ 붉은 말 테마 로드 완료!');
                currentAppliedTheme = themeName;
                if (!localStorage.getItem('horseGreetingDismissed')) {
                    setTimeout(showHorseGreeting, 500);
                }
            };
        } else {
            style2.disabled = false;
            themeStylesheet = style2;
            console.log('♻️ 기존 붉은 말 테마 활성화');
            currentAppliedTheme = themeName;
            if (!localStorage.getItem('horseGreetingDismissed')) {
                setTimeout(showHorseGreeting, 500);
            }
        }
        
    } else if (themeName === 'christmas') {
        // 🎄 크리스마스 테마
        let style1 = document.querySelector('link[href*="style1.css"]');
        
        if (!style1) {
            themeStylesheet = document.createElement('link');
            themeStylesheet.rel = 'stylesheet';
            themeStylesheet.href = 'css/style1.css';
            themeStylesheet.id = 'christmas-theme';
            document.head.appendChild(themeStylesheet);
            console.log('🎄 크리스마스 테마 로드');
            
            themeStylesheet.onload = function() {
                console.log('✅ 크리스마스 테마 로드 완료!');
                currentAppliedTheme = themeName;
                setTimeout(() => initSnowfall(), 100);
            };
        } else {
            style1.disabled = false;
            themeStylesheet = style1;
            console.log('♻️ 기존 크리스마스 테마 활성화');
            currentAppliedTheme = themeName;
            setTimeout(() => initSnowfall(), 100);
        }
        
    } else if (themeName === 'ganadi') {
        // 🐶 가나디 테마
        let style3 = document.querySelector('link[href*="style3.css"]');
        
        if (!style3) {
            themeStylesheet = document.createElement('link');
            themeStylesheet.rel = 'stylesheet';
            themeStylesheet.href = 'css/style3.css';
            themeStylesheet.id = 'ganadi-theme';
            document.head.appendChild(themeStylesheet);
            console.log('🐶 가나디 테마 로드');
            
            themeStylesheet.onload = function() {
                console.log('✅ 가나디 테마 로드 완료!');
                currentAppliedTheme = themeName;
                document.body.classList.add('ganadi-theme'); // ✨ 가나디 테마 클래스 추가!
                if (!localStorage.getItem('ganadiGreetingDismissed')) {
                    setTimeout(showGanadiGreeting, 500);
                }
            };
        } else {
            style3.disabled = false;
            themeStylesheet = style3;
            console.log('♻️ 기존 가나디 테마 활성화');
            currentAppliedTheme = themeName;
            document.body.classList.add('ganadi-theme'); // ✨ 가나디 테마 클래스 추가!
            if (!localStorage.getItem('ganadiGreetingDismissed')) {
                setTimeout(showGanadiGreeting, 500);
            }
        }
        
    } else if (themeName === 'dark') {
        // 🌙 다크 테마
        let style4 = document.querySelector('link[href*="style4.css"]');
        
        if (!style4) {
            themeStylesheet = document.createElement('link');
            themeStylesheet.rel = 'stylesheet';
            themeStylesheet.href = 'css/style4.css';
            themeStylesheet.id = 'dark-theme';
            document.head.appendChild(themeStylesheet);
            console.log('🌙 다크 테마 로드');
            
            themeStylesheet.onload = function() {
                console.log('✅ 다크 테마 로드 완료!');
                currentAppliedTheme = themeName;
                document.body.classList.add('dark-theme');
            };
        } else {
            style4.disabled = false;
            themeStylesheet = style4;
            currentAppliedTheme = themeName;
            document.body.classList.add('dark-theme');
            console.log('♻️ 기존 다크 테마 활성화');
        }
        
    } else {
        // 📰 기본 테마
        const style1 = document.querySelector('link[href*="style1.css"]');
        const style2 = document.querySelector('link[href*="style2.css"]');
        const style3 = document.querySelector('link[href*="style3.css"]');
        const style4 = document.querySelector('link[href*="style4.css"]');
        
        if (style1) style1.disabled = true;
        if (style2) style2.disabled = true;
        if (style3) style3.disabled = true;
        if (style4) style4.disabled = true;
        
        // ✨ 모든 테마 클래스 제거
        document.body.classList.remove('ganadi-theme');
        document.body.classList.remove('dark-theme');
        
        currentAppliedTheme = themeName;
        console.log('📰 기본 테마로 복원');
    }
    
    document.body.style.transition = 'opacity 0.3s';
    document.body.style.opacity = '0.9';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 150);
}

// 초기 테마 적용
function applyInitialTheme() {
    const savedTheme = getCurrentTheme();
    console.log('⚡ 초기 테마 적용:', savedTheme);
    
    if (savedTheme === 'red-horse') {
        let style2 = document.querySelector('link[href*="style2.css"]');
        if (!style2) {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = 'css/style2.css';
            newLink.id = 'red-horse-theme';
            document.head.appendChild(newLink);
            themeStylesheet = newLink;
            newLink.onload = () => {
                console.log('✅ 붉은 말 테마 초기 로드 완료');
                currentAppliedTheme = 'red-horse';
                // ✨ 가나디 클래스 제거
                document.body.classList.remove('ganadi-theme');
            };
        } else {
            style2.disabled = false;
            themeStylesheet = style2;
            currentAppliedTheme = 'red-horse';
            // ✨ 가나디 클래스 제거
            document.body.classList.remove('ganadi-theme');
        }
    } else if (savedTheme === 'christmas') {
        let style1 = document.querySelector('link[href*="style1.css"]');
        if (!style1) {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = 'css/style1.css';
            newLink.id = 'christmas-theme';
            document.head.appendChild(newLink);
            themeStylesheet = newLink;
            newLink.onload = () => {
                console.log('✅ 크리스마스 테마 초기 로드 완료');
                currentAppliedTheme = 'christmas';
                // ✨ 가나디 클래스 제거
                document.body.classList.remove('ganadi-theme');
                setTimeout(() => initSnowfall(), 100);
            };
        } else {
            style1.disabled = false;
            themeStylesheet = style1;
            currentAppliedTheme = 'christmas';
            // ✨ 가나디 클래스 제거
            document.body.classList.remove('ganadi-theme');
            setTimeout(() => initSnowfall(), 100);
        }
    } else if (savedTheme === 'ganadi') {
        let style3 = document.querySelector('link[href*="style3.css"]');
        if (!style3) {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = 'css/style3.css';
            newLink.id = 'ganadi-theme';
            document.head.appendChild(newLink);
            themeStylesheet = newLink;
            newLink.onload = () => {
                console.log('✅ 가나디 테마 초기 로드 완료');
                currentAppliedTheme = 'ganadi';
                // ✨ 가나디 테마 클래스 추가!
                document.body.classList.add('ganadi-theme');
            };
        } else {
            style3.disabled = false;
            themeStylesheet = style3;
            currentAppliedTheme = 'ganadi';
            // ✨ 가나디 테마 클래스 추가!
            document.body.classList.add('ganadi-theme');
        }
    } else if (savedTheme === 'dark') {
        let style4 = document.querySelector('link[href*="style4.css"]');
        if (!style4) {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = 'css/style4.css';
            newLink.id = 'dark-theme';
            document.head.appendChild(newLink);
            themeStylesheet = newLink;
            newLink.onload = () => {
                console.log('✅ 다크 테마 초기 로드 완료');
                currentAppliedTheme = 'dark';
                document.body.classList.add('dark-theme');
            };
        } else {
            style4.disabled = false;
            themeStylesheet = style4;
            currentAppliedTheme = 'dark';
            document.body.classList.add('dark-theme');
        }
    } else {
        // ✨ 기본 테마일 때 모든 테마 클래스 제거
        document.body.classList.remove('ganadi-theme');
        document.body.classList.remove('dark-theme');
        currentAppliedTheme = 'default';
        console.log('✅ 기본 테마 사용');
    }
}

// ============================================
// 🐶 가나디 이스터에그 시스템
// ============================================

let ganadiClickCount = 0;
let ganadiClickTimer = null;
const GANADI_CLICK_THRESHOLD = 5; // 5번 클릭
const GANADI_CLICK_TIMEOUT = 3000; // 3초 내

function resetGanadiClickCount() {
    ganadiClickCount = 0;
    if (ganadiClickTimer) {
        clearTimeout(ganadiClickTimer);
        ganadiClickTimer = null;
    }
}

// ✅ 수정 후 코드
function incrementGanadiClick() {
    // 🎯 가나디 테마일 때만 카운트
    const currentTheme = getCurrentTheme();
    if (currentTheme !== 'ganadi') {
        console.log('⚠️ 가나디 테마가 아니므로 이스터에그 카운트 안 함');
        return;
    }
    
    // 🚫 이미 이스터에그가 활성화 중이면 카운트 안 함
    if (isEasterEggActive) {
        console.log('⚠️ 이스터에그가 이미 진행 중입니다');
        return;
    }
    
    ganadiClickCount++;
    console.log(`🐶 가나디 클릭 카운트: ${ganadiClickCount}/${GANADI_CLICK_THRESHOLD}`);
    
    // 타이머 리셋
    if (ganadiClickTimer) {
        clearTimeout(ganadiClickTimer);
    }
    
    // 3초 후 카운트 초기화
    ganadiClickTimer = setTimeout(() => {
        resetGanadiClickCount();
    }, GANADI_CLICK_TIMEOUT);
    
    // 5번 클릭 시 이스터에그 발동
    if (ganadiClickCount >= GANADI_CLICK_THRESHOLD) {
        activateGanadiEasterEgg();
        resetGanadiClickCount();
    }
}

// ✅ 수정 후 코드
function activateGanadiEasterEgg() {
    // 🎯 가나디 테마 확인
    const currentTheme = getCurrentTheme();
    if (currentTheme !== 'ganadi') {
        console.log('⚠️ 가나디 테마가 아니므로 이스터에그 발동 안 함');
        return;
    }
    
    // 🚫 이미 활성화 중이면 리턴
    if (isEasterEggActive) {
        console.log('⚠️ 이스터에그가 이미 진행 중입니다');
        return;
    }
    
    console.log('🎉🐶 가나디 이스터에그 발동! 특별 모드 시작!');
    
    // ✨ 이스터에그 활성화
    isEasterEggActive = true;
    
    // 1. 특별 알림 표시
    showGanadiEasterEggAlert();
    
    // 2. 숨겨진 가나디 캐릭터들 소환
    setTimeout(() => {
        summonGanadiCharacters();
    }, 1000);
    
    // 3. 특별 배경 효과
    createGanadiRainEffect();
    
    // 4. 특별 사운드 효과
    playGanadiSound();
    
    // ⏱️ 20초 후 이스터에그 종료 및 재발동 가능
    setTimeout(() => {
        endGanadiEasterEgg();
    }, 20000);
}

// ✨ 새 함수 추가: 이스터에그 종료
function endGanadiEasterEgg() {
    console.log('🐶 가나디 이스터에그 종료 - 다시 발동 가능');
    
    // 이스터에그 비활성화
    isEasterEggActive = false;
    
    // 모든 가나디 캐릭터 제거
    document.querySelectorAll('.ganadi-character').forEach(el => {
        el.style.animation = 'ganadiDisappear 0.8s ease-out';
        setTimeout(() => el.remove(), 800);
    });
    
    // 눈물비 컨테이너 제거
    const rainContainer = document.getElementById('ganadiRainContainer');
    if (rainContainer) {
        rainContainer.style.opacity = '0';
        rainContainer.style.transition = 'opacity 1s';
        setTimeout(() => rainContainer.remove(), 1000);
    }
}

// ✅ 수정 후 코드
function summonGanadiCharacters() {
    console.log('🐶 가나디 캐릭터 소환!');
    
    // 기존 가나디들 제거
    document.querySelectorAll('.ganadi-character').forEach(el => el.remove());
    
    // 🎪 헤더 가나디 (상단 우측) - 빙빙 돌면서 커졌다 작아졌다
    createGanadiCharacter({
        position: 'fixed',
        top: '80px',
        right: '100px',
        size: '80px',
        delay: 0,
        animation: 'ganadiSpinScale 3s ease-in-out infinite'
    });
    
    // 🎪 좌측 하단 가나디
    createGanadiCharacter({
        position: 'fixed',
        bottom: '100px',
        left: '50px',
        size: '100px',
        delay: 200,
        animation: 'ganadiSpinScale 2.5s ease-in-out infinite'
    });
    
    // 🎪 우측 중앙 가나디
    createGanadiCharacter({
        position: 'fixed',
        top: '50%',
        right: '30px',
        size: '70px',
        delay: 400,
        animation: 'ganadiSpinScale 3.5s ease-in-out infinite',
        transform: 'translateY(-50%)'
    });
    
    // 🎪 좌측 상단 가나디
    createGanadiCharacter({
        position: 'fixed',
        top: '150px',
        left: '80px',
        size: '60px',
        delay: 600,
        animation: 'ganadiSpinScale 2s ease-in-out infinite'
    });
    
    // 🎪 중앙 하단 가나디 (큰 것)
    createGanadiCharacter({
        position: 'fixed',
        bottom: '50px',
        left: '50%',
        size: '120px',
        delay: 800,
        animation: 'ganadiSpinScale 4s ease-in-out infinite',
        transform: 'translateX(-50%)'
    });
}

function createGanadiCharacter(config) {
    const ganadi = document.createElement('div');
    ganadi.className = 'ganadi-character';
    ganadi.style.cssText = `
        position: ${config.position};
        top: ${config.top || 'auto'};
        bottom: ${config.bottom || 'auto'};
        left: ${config.left || 'auto'};
        right: ${config.right || 'auto'};
        width: ${config.size};
        height: ${config.size};
        pointer-events: none;
        z-index: 9998;
        opacity: 0;
        transform: ${config.transform || 'scale(0)'};
        transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        filter: drop-shadow(2px 2px 8px rgba(255, 182, 193, 0.4));
    `;
    
    // ✅ 수정 후 코드
ganadi.innerHTML = `
    <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #B3D9FF 0%, #87CEEB 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: calc(${config.size} * 0.5);
        position: relative;
        box-shadow: 0 4px 12px rgba(135, 206, 235, 0.3);
        border: 3px solid rgba(179, 217, 255, 0.5);
    ">
        <span style="position: relative; z-index: 2;">🐶</span>
        <div style="
            position: absolute;
            top: 20%;
            right: 15%;
            font-size: calc(${config.size} * 0.3);
        ">💧</div>
    </div>
`;
    
    document.body.appendChild(ganadi);
    
// ✅ 수정 후 코드
setTimeout(() => {
    ganadi.style.opacity = '0.8';
    
    // ✨ transform과 animation을 함께 적용
    if (config.transform) {
        // translateX나 translateY가 있는 경우
        ganadi.style.transformOrigin = 'center';
    }
    
    ganadi.style.transform = config.transform || 'scale(1)';
    ganadi.style.animation = config.animation;
}, config.delay);

// 호버 효과도 회전 유지하도록 수정
ganadi.addEventListener('mouseenter', () => {
    ganadi.style.animationPlayState = 'paused';
    ganadi.style.transform = (config.transform || '') + ' scale(1.4)';
    ganadi.style.opacity = '1';
});

ganadi.addEventListener('mouseleave', () => {
    ganadi.style.animationPlayState = 'running';
    ganadi.style.opacity = '0.8';
});
    
    // 호버 효과
    ganadi.addEventListener('mouseenter', () => {
        ganadi.style.transform = (config.transform || 'scale(1)') + ' scale(1.2)';
        ganadi.style.opacity = '1';
    });
    
    ganadi.addEventListener('mouseleave', () => {
        ganadi.style.transform = config.transform || 'scale(1)';
        ganadi.style.opacity = '0.8';
    });
}

// 💧 가나디 눈물 비 효과
function createGanadiRainEffect() {
    console.log('💧 가나디 눈물비 효과 시작!');
    
    const rainContainer = document.createElement('div');
    rainContainer.id = 'ganadiRainContainer';
    rainContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9997;
        overflow: hidden;
    `;
    
    document.body.appendChild(rainContainer);
    
    // 30개의 눈물 방울 생성
    for (let i = 0; i < 30; i++) {
        createTearDrop(rainContainer, i);
    }
    
    // 20초 후 효과 제거
    setTimeout(() => {
        if (rainContainer.parentNode) {
            rainContainer.style.opacity = '0';
            rainContainer.style.transition = 'opacity 2s';
            setTimeout(() => rainContainer.remove(), 2000);
        }
    }, 20000);
}

function createTearDrop(container, index) {
    const tear = document.createElement('div');
    tear.className = 'ganadi-tear';
    
    const randomLeft = Math.random() * 100;
    const randomSize = Math.random() * 20 + 15;
    const randomDuration = Math.random() * 3 + 2;
    const randomDelay = Math.random() * 2;
    
    tear.style.cssText = `
        position: absolute;
        left: ${randomLeft}%;
        top: -50px;
        font-size: ${randomSize}px;
        animation: tearFall ${randomDuration}s linear ${randomDelay}s infinite;
        opacity: 0.7;
    `;
    
    tear.textContent = '💧';
    container.appendChild(tear);
}

// 🔊 가나디 사운드 (선택사항)
function playGanadiSound() {
    // 간단한 비프음 (Web Audio API 사용)
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 귀여운 멜로디 재생
        const notes = [
            { freq: 523.25, time: 0 },    // C
            { freq: 659.25, time: 0.2 },  // E
            { freq: 783.99, time: 0.4 },  // G
            { freq: 1046.50, time: 0.6 }  // C (높은음)
        ];
        
        notes.forEach(note => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = note.freq;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, note.time * 1000);
        });
    } catch (error) {
        console.log('사운드 재생 불가:', error);
    }
}

// ✅ 수정 후 코드
const style = document.createElement('style');
style.textContent = `
    /* 눈물 떨어지는 애니메이션 */
    @keyframes tearFall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.7;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    /* 🎪 가나디 빙빙 돌면서 커졌다 작아졌다 */
    @keyframes ganadiSpinScale {
        0% {
            transform: rotate(0deg) scale(1);
        }
        25% {
            transform: rotate(90deg) scale(1.3);
        }
        50% {
            transform: rotate(180deg) scale(0.8);
        }
        75% {
            transform: rotate(270deg) scale(1.3);
        }
        100% {
            transform: rotate(360deg) scale(1);
        }
    }
    
    /* 가나디 사라지는 애니메이션 */
    @keyframes ganadiDisappear {
        0% {
            opacity: 0.8;
            transform: scale(1) rotate(0deg);
        }
        100% {
            opacity: 0;
            transform: scale(0) rotate(720deg);
        }
    }
    
    /* 부드러운 바운스 (예비용) */
    @keyframes gentle-bounce {
        0%, 100% { 
            transform: translateY(0) rotate(0deg); 
        }
        50% { 
            transform: translateY(-15px) rotate(5deg); 
        }
    }
`;
document.head.appendChild(style);

// ✅ 수정: showGanadiEasterEggAlert 함수 교체
function showGanadiEasterEggAlert() {
    const existingAlert = document.getElementById('ganadiEasterEggAlert');
    if (existingAlert) existingAlert.remove();
    
    const alertHTML = `
        <div id="ganadiEasterEggAlert" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #FFB6C1 0%, #B3D9FF 100%);
            border: 4px solid #FFFFFF;
            border-radius: 30px;
            padding: 50px;
            box-shadow: 0 12px 48px rgba(255, 182, 193, 0.6);
            z-index: 99999;
            text-align: center;
            animation: easterEggPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            max-width: 500px;
        ">
            <div style="font-size: 96px; margin-bottom: 20px; animation: wiggle 1s infinite;">
                🐶
            </div>
            <div style="font-size: 28px; font-weight: 900; color: #4A4A4A; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.5);">
                듀... 이스터에그 발견!
            </div>
            <div style="font-size: 18px; color: #4A4A4A; margin-bottom: 25px; line-height: 1.6;">
                축하합니다! 숨겨진 가나디들을 깨웠어요! 💧<br>
                <span style="font-size: 14px; opacity: 0.8;">이제 가나디들이 함께할 거예요...</span>
            </div>
            <button onclick="closeGanadiEasterEgg()" style="
                background: white;
                border: 3px solid #FFB6C1;
                padding: 15px 35px;
                border-radius: 15px;
                font-size: 18px;
                font-weight: 700;
                color: #4A4A4A;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            " onmouseover="this.style.background='#FFB6C1'; this.style.color='white'; this.style.transform='scale(1.05)';" 
               onmouseout="this.style.background='white'; this.style.color='#4A4A4A'; this.style.transform='scale(1)';">
                확인 💖
            </button>
        </div>
        
        <style>
            @keyframes easterEggPop {
                0% {
                    transform: translate(-50%, -50%) scale(0) rotate(-180deg);
                    opacity: 0;
                }
                70% {
                    transform: translate(-50%, -50%) scale(1.1) rotate(10deg);
                }
                100% {
                    transform: translate(-50%, -50%) scale(1) rotate(0deg);
                    opacity: 1;
                }
            }
            
            @keyframes wiggle {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-10deg); }
                75% { transform: rotate(10deg); }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', alertHTML);
    
    // 자동 닫기 제거 - 사용자가 직접 닫게
}

window.closeGanadiEasterEgg = function() {
    const alert = document.getElementById('ganadiEasterEggAlert');
    if (alert) {
        alert.style.animation = 'easterEggPop 0.3s reverse';
        setTimeout(() => alert.remove(), 300);
    }
};

// 테마 선택 이벤트 리스너
function initThemeSelector() {
    console.log('🎨 테마 선택기 초기화 시작');
    
    const defaultRadio = document.getElementById('themeDefault');
    const redHorseRadio = document.getElementById('themeRedHorse');
    const christmasRadio = document.getElementById('themeChristmas');
    const ganadiRadio = document.getElementById('themeGanadi');
    const darkRadio = document.getElementById('themeDark');
    
    if (!defaultRadio || !redHorseRadio) {
        console.log('⚠️ 라디오 버튼을 찾을 수 없음. 1초 후 재시도...');
        setTimeout(initThemeSelector, 1000);
        return;
    }
    
    const savedTheme = getCurrentTheme();
    console.log('💾 저장된 테마:', savedTheme);
    
    // 라디오 버튼 상태 설정
    defaultRadio.checked = (savedTheme === 'default');
    redHorseRadio.checked = (savedTheme === 'red-horse');
    if (christmasRadio) christmasRadio.checked = (savedTheme === 'christmas');
    if (ganadiRadio) ganadiRadio.checked = (savedTheme === 'ganadi');
    if (darkRadio) darkRadio.checked = (savedTheme === 'dark');
    
    applyTheme(savedTheme);
    
    // 이벤트 리스너 등록
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        const newRadio = radio.cloneNode(true);
        radio.parentNode.replaceChild(newRadio, radio);
    });
    
    // ✅ 수정 후 코드 (변경 없음 - 이미 올바름)
document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', function(e) {
        const selectedTheme = e.target.value;
        console.log('🎨 테마 변경:', selectedTheme);
        
        // 테마 저장 및 적용
        saveTheme(selectedTheme);
        applyTheme(selectedTheme);
        
        // 🎉 이스터에그: 가나디 테마 선택 시에만 카운트
        if (selectedTheme === 'ganadi') {
            // 테마 적용 후 카운트 (다음 틱에서)
            setTimeout(() => {
                incrementGanadiClick();
            }, 100);
        } else {
            resetGanadiClickCount();
        }
        
        const messages = {
            'red-horse': '🐴 붉은 말이 안내하는 새해 테마가 적용되었습니다!',
            'christmas': '🎄 메리 크리스마스! 눈 내리는 테마가 적용되었습니다!',
            'ganadi': '🐶 가나디 테마가 적용되었습니다! 듀...',
            'dark': '🌙 다크 테마가 적용되었습니다!',
            'default': '📰 기본 테마로 돌아왔습니다!'
        };

        const message = messages[selectedTheme] || messages['default'];
        
        if (typeof showToastNotification === 'function') {
            showToastNotification('테마 변경', message);
        }
        
        // 인사 배너 초기화
        if (selectedTheme === 'red-horse') {
            localStorage.removeItem('horseGreetingDismissed');
        } else if (selectedTheme === 'ganadi') {
            localStorage.removeItem('ganadiGreetingDismissed');
        }
    });
});
    
    console.log('✅ 테마 선택기 초기화 완료!');
}

// 창 크기 변경 시 눈송이 재조정
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (getCurrentTheme() === 'christmas') {
            const container = document.getElementById('snowfall-container');
            if (container && container.children.length > 0) {
                initSnowfall();
            }
        }
    }, 500);
});

// 즉시 초기 테마 적용
applyInitialTheme();

// DOM 로드 완료 시 테마 선택기 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initThemeSelector, 100);
        if (getCurrentTheme() === 'christmas') {
            setTimeout(() => initSnowfall(), 200);
        }
    });
} else {
    setTimeout(initThemeSelector, 100);
    if (getCurrentTheme() === 'christmas') {
        setTimeout(() => initSnowfall(), 200);
    }
}

console.log("✅ Part 15: 멀티 테마 시스템 로드 완료");

// ===== Part 16: 점검모드 시스템 =====

console.log("🔧 Part 16: 점검모드 시스템 시작");

// ✅ 하드코딩 이메일 완전 제거 — DB 기반으로만 확인
   async function isMaintenanceAdmin() {
       return await isAdminAsync(); // ② 에서 추가한 isAdminAsync 함수 사용
   }

// 점검모드 상태 확인 및 화면 표시
async function checkMaintenanceMode() {
    try {
        const snapshot = await db.ref('maintenanceMode').once('value');
        const data = snapshot.val();
        
        if (!data || !data.enabled) {
            hideMaintenanceScreen();
            return;
        }
        
        // 관리자는 점검모드 무시
        if (await isMaintenanceAdmin()) {
            console.log('✅ 관리자 계정 - 점검모드 무시');
            hideMaintenanceScreen();
            showAdminMaintenanceBadge();
            return;
        }
        
        // 일반 사용자에게 점검 화면 표시
        showMaintenanceScreen(data);
        
    } catch (error) {
        console.error('❌ 점검모드 확인 실패:', error);
        hideMaintenanceScreen();
    }
}

// 점검 화면 표시
function showMaintenanceScreen(data) {
    const screen = document.getElementById('maintenanceScreen');
    if (!screen) return;
    
    const titleEl = document.getElementById('maintenanceTitle');
    const contentEl = document.getElementById('maintenanceContent');
    const imageContainer = document.getElementById('maintenanceImageContainer');
    
    if (titleEl) titleEl.textContent = data.title || '🔧 점검 중입니다';
    if (contentEl) contentEl.textContent = data.content || '시스템 점검 중입니다.\n잠시 후 다시 이용해주세요.';
    
    if (imageContainer) {
        if (data.image) {
            imageContainer.innerHTML = `<img src="${data.image}" style="max-width:100%; height:auto; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">`;
        } else {
            imageContainer.innerHTML = '';
        }
    }
    
    screen.style.display = 'block';
    console.log('🔧 점검 화면 표시');
}

// 점검 화면 숨기기
function hideMaintenanceScreen() {
    const screen = document.getElementById('maintenanceScreen');
    if (screen) {
        screen.style.display = 'none';
    }
    removeAdminMaintenanceBadge();
}

// 관리자 점검모드 배지 표시
function showAdminMaintenanceBadge() {
    const existingBadge = document.getElementById('adminMaintenanceBadge');
    if (existingBadge) return;
    
    const badge = document.createElement('div');
    badge.id = 'adminMaintenanceBadge';
    badge.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: linear-gradient(135deg, #FF6F00, #c62828);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(198, 40, 40, 0.3);
        animation: pulse 2s infinite;
    `;
    badge.innerHTML = '🔧 점검모드 ON';
    
    document.body.appendChild(badge);
}

// 관리자 배지 제거
function removeAdminMaintenanceBadge() {
    const badge = document.getElementById('adminMaintenanceBadge');
    if (badge) badge.remove();
}

// 점검모드 관리 모달 열기
window.showMaintenanceModeManager = async function() {
    if (!isAdmin()) {
        alert('🚫 관리자 권한이 필요합니다!');
        return;
    }
    
    showLoadingIndicator('점검모드 설정 로드 중...');
    
    try {
        const snapshot = await db.ref('maintenanceMode').once('value');
        const data = snapshot.val() || {};
        
        hideLoadingIndicator();
        
        const modal = document.getElementById('maintenanceModeModal');
        if (!modal) {
            console.error('❌ maintenanceModeModal을 찾을 수 없습니다');
            return;
        }
        
        // 기존 값 로드
        const toggleEl = document.getElementById('maintenanceToggle');
        const titleEl = document.getElementById('maintenanceTitle');
        const contentEl = document.getElementById('maintenanceContent');
        const previewEl = document.getElementById('maintenanceImagePreview');
        const uploadTextEl = document.getElementById('maintenanceImageUploadText');
        
        if (toggleEl) toggleEl.checked = data.enabled || false;
        if (titleEl) titleEl.value = data.title || '';
        if (contentEl) contentEl.value = data.content || '';
        
        if (previewEl && uploadTextEl) {
            if (data.image) {
                previewEl.src = data.image;
                previewEl.style.display = 'block';
                uploadTextEl.innerHTML = '<i class="fas fa-check"></i><p>기존 이미지</p>';
            } else {
                previewEl.style.display = 'none';
                uploadTextEl.innerHTML = '<i class="fas fa-image"></i><p>클릭하여 이미지 업로드</p>';
            }
        }
        
        modal.classList.add('active');
        
        // 이미지 업로드 이벤트
        const imageInput = document.getElementById('maintenanceImageInput');
        if (imageInput) {
            const newInput = imageInput.cloneNode(true);
            imageInput.parentNode.replaceChild(newInput, imageInput);
            
            newInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        if (previewEl && uploadTextEl) {
                            previewEl.src = event.target.result;
                            previewEl.style.display = 'block';
                            uploadTextEl.innerHTML = '<i class="fas fa-check"></i><p>이미지 선택됨</p>';
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
    } catch (error) {
        hideLoadingIndicator();
        console.error('❌ 점검모드 설정 로드 실패:', error);
        alert('설정을 불러오는데 실패했습니다: ' + error.message);
    }
};

// 점검모드 관리 모달 닫기
window.closeMaintenanceModeModal = function() {
    const modal = document.getElementById('maintenanceModeModal');
    if (modal) modal.classList.remove('active');
};

// 점검모드 설정 저장
window.saveMaintenanceMode = async function() {
    if (!isAdmin()) {
        alert('🚫 관리자 권한이 필요합니다!');
        return;
    }
    
    const enabled = document.getElementById('maintenanceToggle')?.checked || false;
    const title = document.getElementById('maintenanceTitle')?.value.trim() || '🔧 점검 중입니다';
    const content = document.getElementById('maintenanceContent')?.value.trim() || '시스템 점검 중입니다.\n잠시 후 다시 이용해주세요.';
    const imageInput = document.getElementById('maintenanceImageInput');
    const previewEl = document.getElementById('maintenanceImagePreview');
    
    showLoadingIndicator('점검모드 설정 저장 중...');
    
    try {
        const data = {
            enabled: enabled,
            title: title,
            content: content,
            image: '',
            updatedAt: Date.now()
        };
        
        // 이미지 처리
        if (imageInput && imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            const imageData = await new Promise((resolve, reject) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(imageInput.files[0]);
            });
            data.image = imageData;
        } else if (previewEl && previewEl.src && !previewEl.src.includes('data:,')) {
            data.image = previewEl.src;
        }
        
        await db.ref('maintenanceMode').set(data);
        
        hideLoadingIndicator();
        closeMaintenanceModeModal();
        
        alert(`✅ 점검모드가 ${enabled ? '활성화' : '비활성화'}되었습니다!`);
        
        // 즉시 적용
        checkMaintenanceMode();
        
    } catch (error) {
        hideLoadingIndicator();
        console.error('❌ 점검모드 저장 실패:', error);
        alert('저장 중 오류가 발생했습니다: ' + error.message);
    }
};

// 인증 상태 변경 시 점검모드 확인
auth.onAuthStateChanged(async (user) => {
    setTimeout(async () => {
        await checkMaintenanceMode();
    }, 800); // 캐시 초기화 대기 시간 늘림
});

// 페이지 로드 시 점검모드 확인
window.addEventListener('load', () => {
    setTimeout(() => {
        checkMaintenanceMode();
    }, 1000);
});

// 점검모드 실시간 리스너 (async 처리 수정)
db.ref('maintenanceMode').on('value', async (snapshot) => {
    const data = snapshot.val();
    const adminStatus = await isAdminAsync(); // ← await 필수

    if (data && data.enabled && !adminStatus) {
        showMaintenanceScreen(data);
    } else {
        hideMaintenanceScreen();
        if (adminStatus && data && data.enabled) {
            showAdminMaintenanceBadge();
        }
    }
});

console.log("✅ Part 16: 점검모드 시스템 로드 완료");

// ================================================================
// 관리자 전용 모바일 콘솔
// script.js 맨 끝에 추가하세요
// ================================================================

(function() {
    'use strict';

    // ── 로그 저장소 ──
    const MAX_LOGS = 300;
    const logs = [];
    let isConsoleOpen = false;
    let filterType = 'all';
    let searchKeyword = '';

    // ── 원본 콘솔 가로채기 ──
    const _orig = {
        log:   console.log.bind(console),
        warn:  console.warn.bind(console),
        error: console.error.bind(console),
        info:  console.info.bind(console)
    };

    function capture(type, args) {
        const text = args.map(a => {
            if (a === null) return 'null';
            if (a === undefined) return 'undefined';
            if (typeof a === 'object') {
                try { return JSON.stringify(a, null, 2); } catch { return String(a); }
            }
            return String(a);
        }).join(' ');

        logs.push({ type, text, time: new Date().toLocaleTimeString('ko-KR') });
        if (logs.length > MAX_LOGS) logs.shift();

        if (isConsoleOpen) renderLogs();

        // 에러는 FAB 배지 표시
        if (type === 'error') updateFabBadge();
    }

    console.log   = (...a) => { _orig.log(...a);   capture('log',   a); };
    console.warn  = (...a) => { _orig.warn(...a);  capture('warn',  a); };
    console.error = (...a) => { _orig.error(...a); capture('error', a); };
    console.info  = (...a) => { _orig.info(...a);  capture('info',  a); };

    window.addEventListener('error', e => {
        capture('error', [`[Uncaught] ${e.message}`, `${e.filename}:${e.lineno}`]);
    });
    window.addEventListener('unhandledrejection', e => {
        capture('error', [`[Promise] ${e.reason}`]);
    });

    // ── 에러 카운트 배지 ──
    let errorCount = 0;
    function updateFabBadge() {
        errorCount++;
        const badge = document.getElementById('_mcBadge');
        if (badge) {
            badge.textContent = errorCount > 99 ? '99+' : errorCount;
            badge.style.display = 'flex';
        }
    }

    // ── 로그 색상 ──
    const TYPE_STYLE = {
        log:   { color: '#e2e8f0', bg: 'transparent',  icon: '›', label: 'LOG'  },
        info:  { color: '#63b3ed', bg: 'rgba(99,179,237,0.08)', icon: 'ℹ', label: 'INF'  },
        warn:  { color: '#f6ad55', bg: 'rgba(246,173,85,0.08)',  icon: '⚠', label: 'WRN'  },
        error: { color: '#fc8181', bg: 'rgba(252,129,129,0.10)', icon: '✕', label: 'ERR'  },
    };

    // ── 로그 렌더링 ──
    function renderLogs() {
        const container = document.getElementById('_mcLogs');
        if (!container) return;

        const filtered = logs.filter(l => {
            if (filterType !== 'all' && l.type !== filterType) return false;
            if (searchKeyword && !l.text.toLowerCase().includes(searchKeyword)) return false;
            return true;
        });

        if (filtered.length === 0) {
            container.innerHTML = `<div style="color:#4a5568;text-align:center;padding:40px 0;font-size:13px;">로그 없음</div>`;
            return;
        }

        container.innerHTML = filtered.map((l, i) => {
            const s = TYPE_STYLE[l.type] || TYPE_STYLE.log;
            const escaped = l.text
                .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            return `<div style="
                display:flex;gap:8px;align-items:flex-start;
                padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.04);
                background:${s.bg};animation:_mcFadeIn 0.15s ease;
            ">
                <span style="color:${s.color};font-size:11px;font-weight:700;
                    flex-shrink:0;margin-top:1px;font-family:monospace;">${s.label}</span>
                <span style="color:#718096;font-size:10px;flex-shrink:0;margin-top:2px;
                    font-family:monospace;">${l.time}</span>
                <pre style="color:${s.color};font-size:11px;font-family:monospace;
                    margin:0;white-space:pre-wrap;word-break:break-all;flex:1;
                    line-height:1.5;">${escaped}</pre>
            </div>`;
        }).join('');

        // 맨 아래로 스크롤
        container.scrollTop = container.scrollHeight;
    }

    // ── UI 삽입 ──
    function injectConsoleUI() {
        if (document.getElementById('_mcFab')) return;

        const css = document.createElement('style');
        css.textContent = `
            @keyframes _mcFadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
            @keyframes _mcSlideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
            #_mcPanel {
                animation: _mcSlideUp 0.25s cubic-bezier(.16,1,.3,1);
                font-family: 'SF Mono', 'Fira Code', monospace;
            }
            #_mcFab { transition: transform 0.2s, box-shadow 0.2s; }
            #_mcFab:active { transform: scale(0.92) !important; }
            ._mcFilterBtn { transition: all 0.15s; }
            ._mcFilterBtn:hover { opacity:1 !important; }
            #_mcSearch {
                background: rgba(255,255,255,0.06);
                border: 1px solid rgba(255,255,255,0.12);
                border-radius: 6px;
                color: #e2e8f0;
                font-size: 12px;
                padding: 5px 10px;
                outline: none;
                width: 100%;
                box-sizing: border-box;
                font-family: monospace;
            }
            #_mcSearch::placeholder { color: #4a5568; }
            #_mcSearch:focus { border-color: rgba(255,255,255,0.3); }
        `;
        document.head.appendChild(css);

        // FAB 버튼
        const fab = document.createElement('div');
        fab.id = '_mcFab';
        fab.style.cssText = `
            position:fixed;bottom:80px;right:16px;z-index:99990;
            width:46px;height:46px;border-radius:14px;
            background:linear-gradient(135deg,#1a202c,#2d3748);
            box-shadow:0 4px 16px rgba(0,0,0,0.5);
            display:flex;align-items:center;justify-content:center;
            cursor:pointer;user-select:none;
        `;
        fab.innerHTML = `
            <span style="font-size:18px;line-height:1;">⌨️</span>
            <div id="_mcBadge" style="
                display:none;position:absolute;top:-4px;right:-4px;
                background:#fc8181;color:white;font-size:9px;font-weight:700;
                border-radius:8px;padding:2px 5px;min-width:16px;
                text-align:center;font-family:monospace;
                border:2px solid #0d0d0d;
            "></div>
        `;
        fab.addEventListener('click', toggleConsole);
        document.body.appendChild(fab);

        // 패널
        const panel = document.createElement('div');
        panel.id = '_mcPanel';
        panel.style.cssText = `
            display:none;position:fixed;bottom:0;left:0;right:0;z-index:99991;
            height:65vh;background:#0d1117;
            border-top:1px solid rgba(255,255,255,0.1);
            border-radius:20px 20px 0 0;
            box-shadow:0 -8px 40px rgba(0,0,0,0.6);
            flex-direction:column;overflow:hidden;
        `;
        panel.innerHTML = `
            <!-- 드래그 핸들 -->
            <div style="text-align:center;padding:10px 0 6px;cursor:grab;" id="_mcHandle">
                <div style="width:36px;height:4px;border-radius:2px;
                    background:rgba(255,255,255,0.2);display:inline-block;"></div>
            </div>

            <!-- 헤더 -->
            <div style="display:flex;align-items:center;gap:10px;
                padding:0 14px 8px;border-bottom:1px solid rgba(255,255,255,0.07);">
                <span style="color:#e2e8f0;font-size:13px;font-weight:700;letter-spacing:1px;">
                    🛡️ ADMIN CONSOLE
                </span>
                <span id="_mcCount" style="color:#4a5568;font-size:11px;margin-left:auto;"></span>
                <button onclick="window._mcClear()" style="
                    background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
                    color:#718096;font-size:11px;border-radius:6px;padding:4px 10px;
                    cursor:pointer;font-family:monospace;">CLR</button>
                <button onclick="window._mcCopy()" style="
                    background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
                    color:#718096;font-size:11px;border-radius:6px;padding:4px 10px;
                    cursor:pointer;font-family:monospace;">CPY</button>
                <button onclick="window._mcClose()" style="
                    background:rgba(252,129,129,0.15);border:1px solid rgba(252,129,129,0.2);
                    color:#fc8181;font-size:13px;border-radius:6px;padding:4px 10px;
                    cursor:pointer;font-family:monospace;">✕</button>
            </div>

            <!-- 검색 + 필터 -->
            <div style="padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.05);
                display:flex;flex-direction:column;gap:6px;">
                <input id="_mcSearch" placeholder="🔍 로그 검색..." autocomplete="off"
                    oninput="window._mcFilter(this.value)">
                <div style="display:flex;gap:6px;">
                    ${['all','log','info','warn','error'].map(t => `
                        <button class="_mcFilterBtn" data-type="${t}" onclick="window._mcSetFilter('${t}')"
                            style="flex:1;background:rgba(255,255,255,0.05);
                            border:1px solid rgba(255,255,255,0.1);
                            color:${t==='all'?'#e2e8f0':TYPE_STYLE[t]?.color||'#718096'};
                            font-size:10px;font-weight:700;letter-spacing:0.5px;
                            border-radius:6px;padding:4px 0;cursor:pointer;
                            font-family:monospace;text-transform:uppercase;">
                            ${t==='all'?'ALL':t}
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- 로그 목록 -->
            <div id="_mcLogs" style="flex:1;overflow-y:auto;overscroll-behavior:contain;"></div>
        `;
        document.body.appendChild(panel);
        renderLogs();
    }

    function toggleConsole() {
        isConsoleOpen = !isConsoleOpen;
        const panel = document.getElementById('_mcPanel');
        const fab   = document.getElementById('_mcFab');
        if (!panel) return;

        if (isConsoleOpen) {
            panel.style.display = 'flex';
            // 에러 배지 초기화
            errorCount = 0;
            const badge = document.getElementById('_mcBadge');
            if (badge) badge.style.display = 'none';
        } else {
            panel.style.display = 'none';
        }
        renderLogs();
        updateCount();
    }

    function updateCount() {
        const el = document.getElementById('_mcCount');
        if (el) el.textContent = `${logs.length}/${MAX_LOGS}`;
    }

    // 전역 함수
    window._mcClose  = () => { isConsoleOpen = false; const p = document.getElementById('_mcPanel'); if(p) p.style.display='none'; };
    window._mcClear  = () => { logs.length = 0; renderLogs(); updateCount(); };
    window._mcCopy   = () => {
        const text = logs.map(l => `[${l.time}][${l.type.toUpperCase()}] ${l.text}`).join('\n');
        navigator.clipboard.writeText(text).then(() => alert('✅ 로그 복사 완료!')).catch(() => prompt('로그:', text));
    };
    window._mcFilter = (kw) => { searchKeyword = kw.toLowerCase(); renderLogs(); };
    window._mcSetFilter = (type) => {
        filterType = type;
        document.querySelectorAll('._mcFilterBtn').forEach(btn => {
            const isActive = btn.dataset.type === type;
            btn.style.background    = isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)';
            btn.style.borderColor   = isActive ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)';
            btn.style.opacity       = isActive ? '1' : '0.6';
        });
        renderLogs();
    };

    // ── 관리자 확인 후 삽입 ──
    function tryInject() {
        if (typeof isAdmin === 'function' && isAdmin()) {
            injectConsoleUI();
            return;
        }
        // isAdminAsync 시도
        if (typeof isAdminAsync === 'function') {
            isAdminAsync().then(ok => { if (ok) injectConsoleUI(); });
        }
    }

    // 인증 상태 변경 감지
    if (typeof auth !== 'undefined' && auth.onAuthStateChanged) {
        auth.onAuthStateChanged(user => {
            if (user) {
                // 캐시 채워질 때까지 잠깐 대기
                setTimeout(tryInject, 1000);
            } else {
                // 로그아웃 시 콘솔 UI 제거
                const fab   = document.getElementById('_mcFab');
                const panel = document.getElementById('_mcPanel');
                if (fab)   fab.remove();
                if (panel) panel.remove();
                isConsoleOpen = false;
            }
        });
    } else {
        // auth 없으면 DOM 로드 후 시도
        window.addEventListener('load', () => setTimeout(tryInject, 2000));
    }

})();

// ===== 관리자 오류 로그 페이지 =====
async function showErrorLogs() {
    if (!isAdmin()) {
        alert('🚫 관리자 권한이 필요합니다.');
        showArticles();
        return;
    }

    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));

    let section = document.getElementById('errorLogsSection');
    if (!section) {
        section = document.createElement('div');
        section.id = 'errorLogsSection';
        section.className = 'page-section';
        document.querySelector('main')?.appendChild(section);
    }
    section.classList.add('active');

    section.innerHTML = `
        <div style="max-width:1100px;margin:0 auto;padding:20px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:gap;">
                <h2 style="margin:0;font-size:22px;font-weight:700;">🛠️ 오류 로그</h2>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <select id="errFilterDevice" onchange="renderErrorLogs()" style="padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
                        <option value="">전체 디바이스</option>
                        <option value="PC">PC</option>
                        <option value="모바일">모바일</option>
                        <option value="태블릿">태블릿</option>
                    </select>
                   <select id="errFilterLevel" onchange="renderErrorLogs()" style="padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
                        <option value="">오류+경고</option>
                        <option value="error">🔴 오류만</option>
                        <option value="warn">🟡 경고만</option>
                    </select>
                    <select id="errFilterType" onchange="renderErrorLogs()" style="padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;">
                        <option value="">전체 타입</option>
                        <option value="uncaught">uncaught</option>
                        <option value="unhandledrejection">promise</option>
                        <option value="runtime">runtime</option>
                        <option value="console.warn">console.warn</option>
                    </select>
                    <input id="errFilterUser" oninput="renderErrorLogs()" placeholder="이메일/메시지 검색" style="padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:180px;">
                    <button onclick="clearErrorLogs()" style="padding:6px 14px;background:#c62828;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">🗑️ 전체 삭제</button>
                </div>
            </div>
            <div id="errSummary" style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;"></div>
            <div id="errTableWrap" style="overflow-x:auto;">
                <div style="text-align:center;padding:40px;color:#999;">⏳ 불러오는 중...</div>
            </div>
        </div>`;

    try {
        const snap = await db.ref('errorLogs').orderByChild('timestamp').once('value');
        const raw = snap.val() || {};
        window._errorLogsData = Object.entries(raw)
            .map(([id, v]) => ({ id, ...v }))
            .sort((a, b) => b.timestamp - a.timestamp);
        renderErrorLogs();
    } catch (e) {
        document.getElementById('errTableWrap').innerHTML = `<p style="color:red;">오류 로드 실패: ${e.message}</p>`;
    }
}

function renderErrorLogs() {
    const data        = window._errorLogsData || [];
    const filterDevice = document.getElementById('errFilterDevice')?.value || '';
    const filterType   = document.getElementById('errFilterType')?.value || '';
    const filterLevel  = document.getElementById('errFilterLevel')?.value || '';
    const filterUser   = (document.getElementById('errFilterUser')?.value || '').toLowerCase();

    const filtered = data.filter(e =>
        (!filterDevice || e.device === filterDevice) &&
        (!filterType   || e.type === filterType) &&
        (!filterLevel  || (e.level || 'error') === filterLevel) &&
        (!filterUser   || (e.email || '').toLowerCase().includes(filterUser)
                       || (e.message || '').toLowerCase().includes(filterUser))
    );

    // 요약 카드
    const summary = document.getElementById('errSummary');
    if (summary) {
        const total   = filtered.length;
        const errors  = filtered.filter(e => (e.level || 'error') === 'error').length;
        const warns   = filtered.filter(e => e.level === 'warn').length;
        const today   = filtered.filter(e => e.timestamp > Date.now() - 86400000).length;
        const mobile  = filtered.filter(e => e.device === '모바일').length;
        summary.innerHTML = [
            ['전체',   total,  '#1565c0'],
            ['오류',   errors, '#c62828'],
            ['경고',   warns,  '#e65100'],
            ['오늘',   today,  '#2e7d32'],
            ['모바일', mobile, '#6a1b9a']
        ].map(([label, count, color]) => `
            <div style="background:#fff;border:1px solid #eee;border-radius:8px;padding:12px 20px;
                min-width:72px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.06);">
                <div style="font-size:22px;font-weight:700;color:${color};">${count}</div>
                <div style="font-size:12px;color:#666;margin-top:2px;">${label}</div>
            </div>`).join('');
    }

    const wrap = document.getElementById('errTableWrap');
    if (!wrap) return;

    if (filtered.length === 0) {
        wrap.innerHTML = `<div style="text-align:center;padding:60px;color:#999;">로그가 없습니다.</div>`;
        return;
    }

    const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const rows = filtered.map(e => {
        const date    = new Date(e.timestamp);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}<br>
            <span style="color:#adb5bd;">${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}:${String(date.getSeconds()).padStart(2,'0')}</span>`;

        const isWarn      = e.level === 'warn';
        const rowBg       = isWarn ? '#fffde7' : '#fff';
        const levelBadge  = isWarn
            ? `<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:#fff3e0;color:#e65100;font-weight:700;margin-right:4px;">WARN</span>`
            : `<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:#ffebee;color:#c62828;font-weight:700;margin-right:4px;">ERR</span>`;

        const typeColors = {
            uncaught: '#c62828', unhandledrejection: '#e65100',
            runtime: '#1565c0', 'console.warn': '#e65100'
        };
        const typeColor   = typeColors[e.type] || '#555';
        const deviceIcon  = e.device === 'PC' ? '🖥️' : e.device === '모바일' ? '📱' : '📟';

        // 스택 첫 줄만 미리보기
        const stackLines  = (e.stack || '').split('\n').filter(l => l.trim());
        const stackPrev   = stackLines[0] || '-';

        return `
            <tr style="border-bottom:1px solid #f0f0f0;background:${rowBg};cursor:pointer;"
                onclick="toggleErrDetail('${e.id}')">
                <td style="padding:10px 12px;font-size:11px;color:#555;white-space:nowrap;">${dateStr}</td>
                <td style="padding:10px 12px;font-size:12px;">${levelBadge}<br>
                    <span style="font-size:11px;padding:2px 6px;border-radius:4px;
                    background:${typeColor}18;color:${typeColor};font-weight:600;">${e.type||'-'}</span></td>
                <td style="padding:10px 12px;font-size:12px;">${deviceIcon} ${e.device||'-'}<br>
                    <span style="font-size:11px;color:#888;">${e.os||'-'}</span></td>
                <td style="padding:10px 12px;font-size:11px;color:#555;">${e.browser||'-'}<br>
                    <span style="color:#adb5bd;">${e.networkType||'-'} ${e.online===false?'🔴오프라인':''}</span></td>
                <td style="padding:10px 12px;font-size:12px;color:#333;">${esc(e.email)||'비로그인'}</td>
                <td style="padding:10px 12px;font-size:12px;max-width:260px;">
                    <div style="color:${isWarn?'#e65100':'#c62828'};font-weight:600;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;"
                        title="${esc(e.message)}">${esc(e.message)||'-'}</div>
                    <div style="font-size:10px;color:#aaa;margin-top:2px;
                        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;"
                        title="${esc(stackPrev)}">${esc(stackPrev)}</div>
                </td>
                <td style="padding:10px 12px;">
                    <button onclick="event.stopPropagation();deleteErrorLog('${e.id}')"
                        style="padding:3px 8px;background:#ffebee;color:#c62828;border:none;
                        border-radius:4px;cursor:pointer;font-size:11px;">삭제</button>
                </td>
            </tr>
            <tr id="errDetail-${e.id}" style="display:none;background:#f8f9fa;">
                <td colspan="7" style="padding:16px 20px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:12px;color:#333;margin-bottom:12px;">
                        <div><strong>📍 페이지</strong><br><span style="color:#1565c0;word-break:break-all;">${esc(e.page)||'-'}</span></div>
                        <div><strong>🔗 레퍼러</strong><br><span style="color:#555;">${esc(e.referrer)||'-'}</span></div>
                        <div><strong>🔑 UID</strong><br><code style="font-size:11px;">${esc(e.uid)||'-'}</code></div>
                        <div><strong>📐 화면 / 뷰포트</strong><br>${esc(e.screenSize)||'-'} / ${esc(e.viewport)||'-'}</div>
                        <div><strong>🌐 언어</strong><br>${esc(e.language)||'-'}</div>
                        <div><strong>💾 메모리 사용</strong><br>${e.memoryMB != null ? e.memoryMB + ' MB' : '-'}</div>
                        <div><strong>📶 네트워크</strong><br>${esc(e.networkType)||'-'} · ${e.online===false?'<span style="color:#c62828;">오프라인</span>':'온라인'}</div>
                        <div><strong>🕐 타임스탬프</strong><br>${new Date(e.timestamp).toLocaleString('ko-KR')}</div>
                    </div>
                    <div style="margin-bottom:8px;font-size:12px;font-weight:700;color:#333;">🖥️ User-Agent</div>
                    <pre style="margin:0 0 12px;padding:8px 12px;background:#f0f0f0;border-radius:4px;
                        font-size:10px;overflow-x:auto;white-space:pre-wrap;color:#444;">${esc(e.userAgent)||'-'}</pre>
                    <div style="margin-bottom:8px;font-size:12px;font-weight:700;color:#333;">📋 스택 트레이스</div>
                    <pre style="margin:0;padding:12px;background:#1e1e1e;color:#d4d4d4;border-radius:6px;
                        font-size:11px;overflow-x:auto;white-space:pre-wrap;line-height:1.6;">${esc(e.stack||'-')}</pre>
                    ${e.context ? `<div style="margin-top:12px;font-size:12px;font-weight:700;color:#333;">🔍 컨텍스트</div>
                    <pre style="margin:4px 0 0;padding:10px;background:#f5f5f5;border-radius:4px;font-size:11px;overflow-x:auto;">${esc(JSON.stringify(e.context,null,2))}</pre>` : ''}
                </td>
            </tr>`;
    }).join('');

    wrap.innerHTML = `
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;
            overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
            <thead>
                <tr style="background:#f8f9fa;border-bottom:2px solid #eee;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#555;white-space:nowrap;">시간</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#555;">레벨 / 타입</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#555;">디바이스 / OS</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#555;">브라우저 / 네트워크</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#555;">계정</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;color:#555;">메시지 / 스택 미리보기</th>
                    <th style="padding:10px 12px;"></th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>`;
}

function toggleErrDetail(id) {
    const row = document.getElementById(`errDetail-${id}`);
    if (!row) return;
    row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
}

async function deleteErrorLog(id) {
    if (!confirm('이 오류 로그를 삭제할까요?')) return;
    await db.ref(`errorLogs/${id}`).remove();
    window._errorLogsData = (window._errorLogsData || []).filter(e => e.id !== id);
    renderErrorLogs();
}

async function clearErrorLogs() {
    if (!confirm('⚠️ 모든 오류 로그를 삭제할까요?')) return;
    await db.ref('errorLogs').remove();
    window._errorLogsData = [];
    renderErrorLogs();
}

// ===== 수동 알림 전송 =====
async function showManualNotificationSender() {
    if (!isAdmin()) { alert('🚫 관리자 권한이 필요합니다.'); return; }

    // 기존 모달 제거
    document.getElementById('_manualNotifModal')?.remove();

    // 유저 목록 로드
    const usersSnap = await db.ref('users').once('value');
    const usersData = usersSnap.val() || {};
    const userOptions = Object.entries(usersData)
        .filter(([_, u]) => u && u.email)
        .map(([uid, u]) => `<option value="${uid}">${u.email}</option>`)
        .join('');

    const modal = document.createElement('div');
    modal.id = '_manualNotifModal';
    modal.style.cssText = `
        position:fixed; top:0; left:0; width:100%; height:100%;
        background:rgba(0,0,0,0.5); z-index:99999;
        display:flex; align-items:center; justify-content:center; padding:16px;
    `;
    modal.innerHTML = `
        <div style="background:#fff; border-radius:14px; padding:28px; width:100%; max-width:480px; max-height:90vh; overflow-y:auto; box-shadow:0 8px 32px rgba(0,0,0,0.2);">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
                <h3 style="margin:0; font-size:18px; font-weight:700;">📢 수동 알림 전송</h3>
                <button onclick="document.getElementById('_manualNotifModal').remove()"
                    style="background:none; border:none; font-size:22px; cursor:pointer; color:#888; line-height:1;">✕</button>
            </div>

            <!-- 대상 -->
            <div style="margin-bottom:16px;">
                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">📌 전송 대상</label>
                <select id="_notifTarget" onchange="toggleManualNotifUserSelect()" style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px;">
                    <option value="all">전체 유저</option>
                    <option value="specific">특정 유저 선택</option>
                </select>
            </div>
            <div id="_notifUserSelectWrap" style="display:none; margin-bottom:16px;">
                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">👤 유저 선택</label>
                <select id="_notifTargetUser" style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px;">
                    ${userOptions}
                </select>
            </div>

            <!-- 제목 -->
            <div style="margin-bottom:16px;">
                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">📋 제목</label>
                <input id="_notifTitle" type="text" placeholder="알림 제목을 입력하세요"
                    style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box;">
            </div>

            <!-- 내용 -->
            <div style="margin-bottom:16px;">
                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">💬 내용</label>
                <textarea id="_notifBody" placeholder="알림 내용을 입력하세요" rows="3"
                    style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; resize:vertical; box-sizing:border-box;"></textarea>
            </div>

            <!-- 링크 기사 (선택) -->
            <div style="margin-bottom:20px;">
                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">🔗 기사 ID <span style="font-weight:400; color:#999;">(선택, 클릭 시 이동)</span></label>
                <input id="_notifArticleId" type="text" placeholder="기사 ID (없으면 홈으로 이동)"
                    style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box;">
            </div>

            <div id="_notifResult" style="margin-bottom:12px; font-size:13px;"></div>

            <button onclick="sendManualNotification()"
                style="width:100%; padding:12px; background:#c62828; color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:700; cursor:pointer;">
                📢 알림 전송
            </button>
        </div>
    `;
    document.body.appendChild(modal);

    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function toggleManualNotifUserSelect() {
    const target = document.getElementById('_notifTarget')?.value;
    const wrap = document.getElementById('_notifUserSelectWrap');
    if (wrap) wrap.style.display = target === 'specific' ? 'block' : 'none';
}

async function sendManualNotification() {
    const target    = document.getElementById('_notifTarget')?.value;
    const title     = document.getElementById('_notifTitle')?.value.trim();
    const body      = document.getElementById('_notifBody')?.value.trim();
    const articleId = document.getElementById('_notifArticleId')?.value.trim();
    const resultEl  = document.getElementById('_notifResult');

    if (!title) { resultEl.innerHTML = '<span style="color:#c62828;">⚠️ 제목을 입력해주세요.</span>'; return; }
    if (!body)  { resultEl.innerHTML = '<span style="color:#c62828;">⚠️ 내용을 입력해주세요.</span>'; return; }

    resultEl.innerHTML = '<span style="color:#888;">⏳ 전송 중...</span>';

    try {
        const usersSnap = await db.ref('users').once('value');
        const usersData = usersSnap.val() || {};

        let targetUids = [];

        if (target === 'all') {
            targetUids = Object.keys(usersData).filter(uid => usersData[uid]);
        } else {
            const specificUid = document.getElementById('_notifTargetUser')?.value;
            if (specificUid) targetUids = [specificUid];
        }

        if (targetUids.length === 0) {
            resultEl.innerHTML = '<span style="color:#c62828;">⚠️ 전송 대상이 없습니다.</span>';
            return;
        }

        const timestamp = Date.now();
        const updates = {};

        targetUids.forEach(uid => {
            const notifId = `notif_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
            updates[`notifications/${uid}/${notifId}`] = {
                type: 'admin',
                title: title,
                text: body,
                articleId: articleId || '',
                timestamp: timestamp,
                read: false,
                pushed: false
            };
        });

        await db.ref().update(updates);

        resultEl.innerHTML = `<span style="color:#2e7d32;">✅ ${targetUids.length}명에게 알림 전송 완료!</span>`;

    } catch (error) {
        console.error('수동 알림 전송 실패:', error);
        resultEl.innerHTML = `<span style="color:#c62828;">❌ 전송 실패: ${error.message}</span>`;
    }
}

// ===== 수동 알림 전송 =====
async function showManualNotificationSender() {
    if (!isAdmin()) { alert('🚫 관리자 권한이 필요합니다.'); return; }

    document.getElementById('_manualNotifModal')?.remove();

    const usersSnap = await db.ref('users').once('value');
    const usersData = usersSnap.val() || {};

    // FCM 토큰이 등록된 유저만 필터링
    const fcmUsers = Object.entries(usersData)
        .filter(([_, u]) => u && u.email && u.fcmTokens && Object.keys(u.fcmTokens).length > 0)
        .map(([uid, u]) => ({ uid, email: u.email }));

    const modal = document.createElement('div');
    modal.id = '_manualNotifModal';
    modal.style.cssText = `
        position:fixed; top:0; left:0; width:100%; height:100%;
        background:rgba(0,0,0,0.5); z-index:99999;
        display:flex; align-items:center; justify-content:center; padding:16px;
    `;
    modal.innerHTML = `
        <div style="background:#fff; border-radius:14px; padding:28px; width:100%; max-width:480px; max-height:90vh; overflow-y:auto; box-shadow:0 8px 32px rgba(0,0,0,0.2);">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
                <h3 style="margin:0; font-size:18px; font-weight:700;">📢 수동 알림 전송</h3>
                <button onclick="document.getElementById('_manualNotifModal').remove()"
                    style="background:none; border:none; font-size:22px; cursor:pointer; color:#888; line-height:1;">✕</button>
            </div>

            <!-- 대상 -->
            <div style="margin-bottom:16px;">
                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">📌 전송 대상</label>
                <select id="_notifTarget" onchange="toggleManualNotifUserSelect()" style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px;">
                    <option value="all">전체 유저</option>
                    <option value="specific">특정 유저 선택</option>
                </select>
            </div>

            <!-- 특정 유저 선택 (체크박스) -->
            <div id="_notifUserSelectWrap" style="display:none; margin-bottom:16px;">
                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">
                    👤 유저 선택
                    <span style="font-weight:400; color:#999;">(FCM 등록 유저만 표시 · 복수 선택 가능)</span>
                </label>
                <div style="display:flex; gap:6px; margin-bottom:8px; align-items:center;">
                    <button type="button" onclick="selectAllNotifUsers(true)"
                        style="padding:4px 10px; font-size:12px; border:1px solid #c62828; background:#fff; color:#c62828; border-radius:5px; cursor:pointer;">전체 선택</button>
                    <button type="button" onclick="selectAllNotifUsers(false)"
                        style="padding:4px 10px; font-size:12px; border:1px solid #ddd; background:#fff; color:#888; border-radius:5px; cursor:pointer;">전체 해제</button>
                    <span id="_notifSelectedCount" style="font-size:12px; color:#888; margin-left:4px;">0명 선택됨</span>
                </div>
                <div id="_notifUserCheckList"
                    style="max-height:200px; overflow-y:auto; border:1px solid #ddd; border-radius:8px; padding:8px; background:#fafafa; display:flex; flex-direction:column; gap:2px;">
                    ${fcmUsers.length === 0
                        ? `<p style="color:#999; font-size:13px; text-align:center; margin:10px 0;">FCM 토큰이 등록된 유저가 없습니다.</p>`
                        : fcmUsers.map(u => `
                            <label style="display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:6px; cursor:pointer; font-size:13px; background:transparent; transition:background 0.15s;"
                                onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='transparent'">
                                <input type="checkbox" value="${u.uid}" onchange="updateNotifSelectedCount()"
                                    style="width:15px; height:15px; accent-color:#c62828; cursor:pointer; flex-shrink:0;">
                                <span style="color:#333;">${u.email}</span>
                            </label>`).join('')
                    }
                </div>
            </div>

            <!-- 제목 -->
            <div style="margin-bottom:16px;">
                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">📋 제목</label>
                <input id="_notifTitle" type="text" placeholder="알림 제목을 입력하세요"
                    style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box;">
            </div>

            <!-- 내용 -->
            <div style="margin-bottom:16px;">
                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">💬 내용</label>
                <textarea id="_notifBody" placeholder="알림 내용을 입력하세요" rows="3"
                    style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; resize:vertical; box-sizing:border-box;"></textarea>
            </div>

            <!-- 기사 ID (선택) -->
            <div style="margin-bottom:20px;">
                <label style="font-size:13px; font-weight:600; color:#333; display:block; margin-bottom:6px;">
                    🔗 기사 ID
                    <span style="font-weight:400; color:#999;">(선택 · 클릭 시 해당 기사로 이동)</span>
                </label>
                <input id="_notifArticleId" type="text" placeholder="기사 ID (없으면 홈으로 이동)"
                    style="width:100%; padding:9px 12px; border:1px solid #ddd; border-radius:8px; font-size:14px; box-sizing:border-box;">
            </div>

            <div id="_notifResult" style="margin-bottom:12px; font-size:13px; min-height:20px;"></div>

            <button onclick="sendManualNotification()"
                style="width:100%; padding:12px; background:#c62828; color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:700; cursor:pointer;">
                📢 알림 전송
            </button>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function toggleManualNotifUserSelect() {
    const target = document.getElementById('_notifTarget')?.value;
    const wrap = document.getElementById('_notifUserSelectWrap');
    if (wrap) wrap.style.display = target === 'specific' ? 'block' : 'none';
    updateNotifSelectedCount();
}

function selectAllNotifUsers(selectAll) {
    document.querySelectorAll('#_notifUserCheckList input[type="checkbox"]')
        .forEach(cb => cb.checked = selectAll);
    updateNotifSelectedCount();
}

function updateNotifSelectedCount() {
    const count = document.querySelectorAll('#_notifUserCheckList input[type="checkbox"]:checked').length;
    const el = document.getElementById('_notifSelectedCount');
    if (el) el.textContent = `${count}명 선택됨`;
}

async function sendManualNotification() {
    const target    = document.getElementById('_notifTarget')?.value;
    const title     = document.getElementById('_notifTitle')?.value.trim();
    const body      = document.getElementById('_notifBody')?.value.trim();
    const articleId = document.getElementById('_notifArticleId')?.value.trim();
    const resultEl  = document.getElementById('_notifResult');

    if (!title) { resultEl.innerHTML = '<span style="color:#c62828;">⚠️ 제목을 입력해주세요.</span>'; return; }
    if (!body)  { resultEl.innerHTML = '<span style="color:#c62828;">⚠️ 내용을 입력해주세요.</span>'; return; }

    resultEl.innerHTML = '<span style="color:#888;">⏳ 전송 중...</span>';

    try {
        let targetUids = [];

        if (target === 'all') {
            const usersSnap = await db.ref('users').once('value');
            const usersData = usersSnap.val() || {};
            targetUids = Object.keys(usersData).filter(uid => usersData[uid]);
        } else {
            const checkboxes = document.querySelectorAll('#_notifUserCheckList input[type="checkbox"]:checked');
            targetUids = Array.from(checkboxes).map(cb => cb.value);
            if (targetUids.length === 0) {
                resultEl.innerHTML = '<span style="color:#c62828;">⚠️ 유저를 1명 이상 선택해주세요.</span>';
                return;
            }
        }

        const timestamp = Date.now();
        const updates = {};

        targetUids.forEach(uid => {
            const notifId = `notif_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
            updates[`notifications/${uid}/${notifId}`] = {
                type: 'admin',
                title: title,
                text: body,
                articleId: articleId || '',
                timestamp: timestamp,
                read: false,
                pushed: false
            };
        });

        await db.ref().update(updates);

        const triggered = await triggerGithubNotification(false);
        resultEl.innerHTML = `<span style="color:#2e7d32;">✅ ${targetUids.length}명에게 알림 전송 완료! ${triggered ? '(즉시 FCM 푸시 요청됨)' : '(5분 내 FCM 푸시 예정)'}</span>`;

    } catch (error) {
        console.error('수동 알림 전송 실패:', error);
        resultEl.innerHTML = `<span style="color:#c62828;">❌ 전송 실패: ${error.message}</span>`;
        logErrorToFirebase({ message: error.message, stack: error.stack, type: 'manual-notification' });
    }
}

// ===== GitHub Action 트리거 (알림 즉시 전송) =====
async function triggerGithubNotification(silent = false) {
    try {
        // 쿨다운: 1분에 1회만 허용
        const lastTrigger = parseInt(localStorage.getItem('lastGithubTrigger') || '0');
        if (Date.now() - lastTrigger < 60 * 1000) {
            if (!silent) console.log('⏳ GitHub 트리거 쿨다운 중 (1분)');
            return false;
        }

        const snap = await db.ref('siteSettings/githubDispatch').once('value');
        const config = snap.val();
        if (!config?.owner || !config?.repo || !config?.token) {
            console.warn('⚠️ GitHub Dispatch 설정 없음 (siteSettings/githubDispatch)');
            return false;
        }

        const response = await fetch(
            `https://api.github.com/repos/${config.owner}/${config.repo}/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Accept': 'application/vnd.github+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ event_type: 'send-notification' })
            }
        );

        if (response.status === 204) {
            localStorage.setItem('lastGithubTrigger', Date.now().toString());
            console.log('✅ GitHub Action 트리거 성공');
            return true;
        } else {
            console.warn('⚠️ GitHub Action 트리거 실패:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ GitHub Action 트리거 오류:', error.message);
        return false;
    }
}

// ✅ 이미지 Canvas 압축 → base64
function compressImageToBase64(file, maxPx = 800, quality = 0.72) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                let w = img.width, h = img.height;
                if (w > maxPx || h > maxPx) {
                    if (w > h) { h = Math.round(h * maxPx / w); w = maxPx; }
                    else { w = Math.round(w * maxPx / h); h = maxPx; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ===== 댓글/답글 이미지 미리보기 헬퍼 =====

window.previewCommentImage = function(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.getElementById('commentImagePreview');
        const img = document.getElementById('commentImagePreviewImg');
        if (preview && img) {
            img.src = e.target.result;
            preview.style.display = 'block';
        }
    };
    reader.readAsDataURL(input.files[0]);
};

window.clearCommentImage = function() {
    const preview = document.getElementById('commentImagePreview');
    const input = document.getElementById('commentImageInput');
    if (preview) preview.style.display = 'none';
    if (input) input.value = '';
};

window.previewReplyImage = function(input, commentId) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.getElementById(`replyImagePreview-${commentId}`);
        const img = document.getElementById(`replyImagePreviewImg-${commentId}`);
        if (preview && img) {
            img.src = e.target.result;
            preview.style.display = 'block';
        }
    };
    reader.readAsDataURL(input.files[0]);
};

window.clearReplyImage = function(commentId) {
    const preview = document.getElementById(`replyImagePreview-${commentId}`);
    const input = document.getElementById(`replyImageInput-${commentId}`);
    if (preview) preview.style.display = 'none';
    if (input) input.value = '';
};

window.previewNestedReplyImage = function(input, commentId, replyId) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.getElementById(`nestedReplyImagePreview-${commentId}-${replyId}`);
        const img = document.getElementById(`nestedReplyImagePreviewImg-${commentId}-${replyId}`);
        if (preview && img) {
            img.src = e.target.result;
            preview.style.display = 'block';
        }
    };
    reader.readAsDataURL(input.files[0]);
};

window.clearNestedReplyImage = function(commentId, replyId) {
    const preview = document.getElementById(`nestedReplyImagePreview-${commentId}-${replyId}`);
    const input = document.getElementById(`nestedReplyImageInput-${commentId}-${replyId}`);
    if (preview) preview.style.display = 'none';
    if (input) input.value = '';
};

console.log("✅ script1.js 최적화 버전 완료 (Parts 1-14 통합)");

// ===== 버그 제보 시스템 =====

// 유저 - 버그 제보 페이지 (다중 제보 지원)
window._bugReportList = [];

window.showBugReportPage = function() {
    hideAll();
    window.scrollTo(0, 0);
    window._bugReportList = [];
    const section = document.getElementById('moreMenuSection');
    if (!section) return;
    section.classList.add('active');

    const deviceInfo = `${navigator.platform} / ${navigator.userAgent.match(/(Chrome|Safari|Firefox|Edge|Opera)[\\/\\s][\\d.]+/)?.[0] || '알 수 없음'}`;
    const now = new Date().toLocaleString('ko-KR');

    section.innerHTML = `
        <div style="max-width:600px; margin:0 auto; padding:20px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                <button onclick="showMoreMenu()" style="background:none; border:none; font-size:20px; cursor:pointer; color:#495057;">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2 style="margin:0; font-size:20px; font-weight:800; color:#00376b;">
                    <i class="fas fa-bug"></i> 버그 제보
                </h2>
            </div>

            <div style="background:#fff3cd; border:1px solid #ffc107; border-radius:10px; padding:12px 16px; margin-bottom:20px; font-size:13px; color:#856404;">
                <i class="fas fa-info-circle"></i> 버그를 여러 개 추가한 뒤 한 번에 전송할 수 있어요!
            </div>

            <div style="background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08); display:flex; flex-direction:column; gap:14px; margin-bottom:16px;">
                <input type="hidden" id="bugDevice" value="${deviceInfo}">
                <input type="hidden" id="bugTime" value="${now}">

                <div>
                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📝 제목 <span style="color:#dc3545;">*</span></label>
                    <input type="text" id="bugTitle" placeholder="버그를 간단히 설명해주세요" maxlength="100"
                        style="width:100%; padding:10px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; box-sizing:border-box; outline:none;"
                        onfocus="this.style.borderColor='#00376b'" onblur="this.style.borderColor='#dee2e6'">
                </div>

                <div>
                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📄 상세 내용 <span style="color:#dc3545;">*</span></label>
                    <textarea id="bugContent" placeholder="버그가 발생한 상황, 재현 방법 등을 자세히 적어주세요" rows="4"
                        style="width:100%; padding:10px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; resize:vertical; font-family:inherit; box-sizing:border-box; outline:none;"
                        onfocus="this.style.borderColor='#00376b'" onblur="this.style.borderColor='#dee2e6'"></textarea>
                </div>

                <div>
                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📷 스크린샷 (선택)</label>
                    <div id="bugImagePreviewArea" onclick="document.getElementById('bugImageInput').click()"
                        style="border:2px dashed #dee2e6; border-radius:8px; padding:16px; text-align:center; cursor:pointer; background:#fafafa; transition:all 0.2s;"
                        onmouseover="this.style.borderColor='#00376b'" onmouseout="this.style.borderColor='#dee2e6'">
                        <i class="fas fa-camera" style="font-size:22px; color:#adb5bd;"></i>
                        <p style="margin:6px 0 0; font-size:13px; color:#adb5bd;">클릭하여 이미지 첨부</p>
                    </div>
                    <input type="file" id="bugImageInput" accept="image/*" style="display:none;" onchange="previewBugImage(this)">
                </div>

                <button onclick="addBugToList()"
                    style="background:linear-gradient(135deg,#00376b,#005fa3); color:white; border:none; padding:12px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; width:100%;">
                    <i class="fas fa-plus-circle"></i> 목록에 추가
                </button>
            </div>

            <div id="bugQueueArea" style="display:none; margin-bottom:16px;">
                <div style="font-size:13px; font-weight:700; color:#495057; margin-bottom:8px;">
                    📋 제보 목록 <span id="bugQueueCount" style="background:#00376b; color:white; border-radius:10px; padding:1px 8px; font-size:12px;">0</span>
                </div>
                <div id="bugQueueList" style="display:flex; flex-direction:column; gap:8px;"></div>
            </div>

            <button id="bugSubmitAllBtn" onclick="submitBugReport()" style="display:none;
                background:linear-gradient(135deg,#c62828,#e53935); color:white; border:none; padding:14px;
                border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; width:100%; margin-bottom:8px;">
                <i class="fas fa-paper-plane"></i> 전체 전송 (<span id="bugSubmitCount">0</span>건)
            </button>

            <div id="bugSubmitMsg" style="margin-top:8px; text-align:center;"></div>
        </div>
    `;
    updateURL('bugreport');
};

// 버그 목록에 추가
window.addBugToList = async function() {
    const title = document.getElementById('bugTitle').value.trim();
    const content = document.getElementById('bugContent').value.trim();
    const imageInput = document.getElementById('bugImageInput');

    if (!title) { alert('제목을 입력해주세요.'); return; }
    if (!content) { alert('상세 내용을 입력해주세요.'); return; }

    let imageBase64 = null;
    if (imageInput.files && imageInput.files[0]) {
        imageBase64 = await compressImageToBase64(imageInput.files[0], 800, 0.72);
    }

    window._bugReportList.push({
        id: Date.now(),
        title,
        content,
        device: document.getElementById('bugDevice').value,
        time: document.getElementById('bugTime').value,
        imageBase64
    });

    // 입력 초기화
    document.getElementById('bugTitle').value = '';
    document.getElementById('bugContent').value = '';
    imageInput.value = '';
    document.getElementById('bugImagePreviewArea').innerHTML = '<i class="fas fa-camera" style="font-size:22px; color:#adb5bd;"></i><p style="margin:6px 0 0; font-size:13px; color:#adb5bd;">클릭하여 이미지 첨부</p>';

    renderBugQueue();
};

// 큐 렌더링
window.renderBugQueue = function() {
    const list = window._bugReportList;
    const area = document.getElementById('bugQueueArea');
    const queueList = document.getElementById('bugQueueList');
    const submitBtn = document.getElementById('bugSubmitAllBtn');
    if (!area || !queueList) return;

    if (list.length === 0) {
        area.style.display = 'none';
        submitBtn.style.display = 'none';
        return;
    }

    area.style.display = 'block';
    submitBtn.style.display = 'block';
    document.getElementById('bugQueueCount').textContent = list.length;
    document.getElementById('bugSubmitCount').textContent = list.length;

    queueList.innerHTML = list.map((item, idx) => `
        <div style="background:white; border-radius:10px; padding:12px 14px; box-shadow:0 1px 4px rgba(0,0,0,0.08);
            display:flex; align-items:flex-start; gap:10px; border-left:3px solid #00376b;">
            <div style="flex:1; min-width:0;">
                <div style="font-size:14px; font-weight:700; color:#202124; margin-bottom:2px;">${escapeHTML(item.title)}</div>
                <div style="font-size:12px; color:#868e96; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(item.content)}</div>
                ${item.imageBase64 ? '<div style="font-size:11px; color:#00376b; margin-top:3px;"><i class="fas fa-image"></i> 이미지 첨부됨</div>' : ''}
            </div>
            <button onclick="removeBugFromList(${idx})"
                style="background:#fff0f0; border:none; color:#dc3545; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:12px; flex-shrink:0;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
};

// 목록에서 제거
window.removeBugFromList = function(idx) {
    window._bugReportList.splice(idx, 1);
    renderBugQueue();
};

// 이미지 미리보기
window.previewBugImage = function(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
        const area = document.getElementById('bugImagePreviewArea');
        area.innerHTML = `
            <img src="${e.target.result}" style="max-width:100%; max-height:200px; border-radius:8px; object-fit:contain;">
            <p style="margin:8px 0 0; font-size:12px; color:#868e96;">클릭하여 변경</p>
        `;
    };
    reader.readAsDataURL(input.files[0]);
};

// 버그 제보 전체 전송
window.submitBugReport = async function() {
    if (!isLoggedIn()) { alert('로그인 후 이용해주세요.'); return; }
    const list = window._bugReportList || [];
    if (list.length === 0) { alert('제보할 버그를 먼저 추가해주세요.'); return; }

    const btn = document.getElementById('bugSubmitAllBtn');
    const msgEl = document.getElementById('bugSubmitMsg');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 중...'; }

    try {
        const user = auth.currentUser;
        const authorName = getNickname();
        const authorEmail = getUserEmail();
        const baseTime = Date.now();

        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            await db.ref('bugReports').push({
                title: item.title,
                content: item.content,
                device: item.device,
                time: item.time,
                authorName,
                authorEmail,
                authorUid: user.uid,
                imageBase64: item.imageBase64 || null,
                status: 'pending',
                createdAt: baseTime + i
            });
        }

        window._bugReportList = [];
        showToastNotification('🐛 버그 제보 완료', `${list.length}건 제보 감사합니다! 빠르게 수정할게요 🙏`);
        setTimeout(() => showMoreMenu(), 1200);

    } catch(e) {
        console.error(e);
        if (msgEl) msgEl.innerHTML = '<div style="background:#f8d7da; color:#721c24; padding:12px 16px; border-radius:8px; font-size:14px;"><i class="fas fa-exclamation-circle"></i> 전송 실패. 다시 시도해주세요.</div>';
        if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fas fa-paper-plane"></i> 전체 전송 (${list.length}건)`; }
    }
};

// 관리자 - 버그 제보 목록 보기
window._allBugReports = [];

window.showAdminBugReports = async function() {
    if (!isAdmin()) { alert('관리자만 접근 가능합니다.'); return; }
    hideAll();
    window.scrollTo(0, 0);
    const section = document.getElementById('moreMenuSection');
    section.classList.add('active');

    section.innerHTML = `
        <div style="max-width:700px; margin:0 auto; padding:20px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                <button onclick="showMoreMenu()" style="background:none; border:none; font-size:20px; cursor:pointer; color:#495057;">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2 style="margin:0; font-size:20px; font-weight:800; color:#c62828; flex:1;">
                    <i class="fas fa-bug"></i> 버그 제보 관리
                </h2>
                <span id="bugTotalCount" style="font-size:13px; color:#868e96;"></span>
            </div>
            <div style="display:flex; gap:8px; margin-bottom:16px;">
                <input id="bugSearchInput" type="text" placeholder="제목, 내용, 작성자 검색..."
                    oninput="filterAdminBugs()"
                    style="flex:1; padding:10px 14px; border:1.5px solid #dee2e6; border-radius:10px; font-size:14px; outline:none; box-sizing:border-box;"
                    onfocus="this.style.borderColor='#c62828'" onblur="this.style.borderColor='#dee2e6'">
                <select id="bugStatusFilter" onchange="filterAdminBugs()"
                    style="padding:10px 12px; border:1.5px solid #dee2e6; border-radius:10px; font-size:14px; outline:none; background:white; cursor:pointer;">
                    <option value="all">전체</option>
                    <option value="pending">대기중</option>
                    <option value="fixed">수정완료</option>
                </select>
            </div>
            <div id="adminBugList" style="display:flex; flex-direction:column; gap:14px;">
                <div style="text-align:center; padding:40px; color:#adb5bd;">
                    <i class="fas fa-spinner fa-spin" style="font-size:24px;"></i>
                    <p>불러오는 중...</p>
                </div>
            </div>
        </div>
    `;

    try {
        const snap = await db.ref('bugReports').once('value');
        const reports = [];
        snap.forEach(child => { reports.push({ id: child.key, ...child.val() }); });
        reports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        window._allBugReports = reports;
        const countEl = document.getElementById('bugTotalCount');
        if (countEl) countEl.textContent = `총 ${reports.length}건`;

        renderAdminBugList(reports);
    } catch(e) {
        console.error(e);
        const listEl = document.getElementById('adminBugList');
        if (listEl) listEl.innerHTML = `<p style="color:#dc3545; text-align:center;">불러오기 실패: ${e.message}</p>`;
    }
};

window.filterAdminBugs = function() {
    const kw = (document.getElementById('bugSearchInput')?.value || '').toLowerCase();
    const status = document.getElementById('bugStatusFilter')?.value || 'all';
    const filtered = (window._allBugReports || []).filter(r => {
        const matchStatus = status === 'all' || r.status === status || (status === 'pending' && !r.status);
        const matchKw = !kw
            || (r.title || '').toLowerCase().includes(kw)
            || (r.content || '').toLowerCase().includes(kw)
            || (r.authorName || '').toLowerCase().includes(kw)
            || (r.authorEmail || '').toLowerCase().includes(kw);
        return matchStatus && matchKw;
    });
    renderAdminBugList(filtered);
};

window.renderAdminBugList = function(reports) {
    const listEl = document.getElementById('adminBugList');
    if (!listEl) return;

    if (reports.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; padding:60px 20px; color:#adb5bd;"><i class="fas fa-inbox" style="font-size:40px;"></i><p style="margin-top:12px;">검색 결과가 없습니다</p></div>`;
        return;
    }

    listEl.innerHTML = reports.map(r => {
        const statusBadge = r.status === 'fixed'
            ? `<span style="background:#d4edda; color:#155724; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:700;"><i class="fas fa-check"></i> 수정완료</span>`
            : `<span style="background:#fff3cd; color:#856404; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:700;"><i class="fas fa-clock"></i> 대기중</span>`;
        const date = new Date(r.createdAt).toLocaleString('ko-KR');
        return `
            <div id="bugCard-${r.id}" style="background:white; border-radius:12px; padding:18px; box-shadow:0 2px 8px rgba(0,0,0,0.08); border-left:4px solid ${r.status === 'fixed' ? '#28a745' : '#ffc107'};">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; gap:8px;">
                    <div style="flex:1;">
                        <div style="font-size:15px; font-weight:700; color:#202124; margin-bottom:4px;">${escapeHTML(r.title || '')}</div>
                        <div style="font-size:12px; color:#868e96;">👤 ${escapeHTML(r.authorName || '알 수 없음')} &nbsp;|&nbsp; 🕐 ${escapeHTML(r.time || '')}</div>
                    </div>
                    ${statusBadge}
                </div>
                <div style="font-size:13px; color:#495057; white-space:pre-wrap; background:#f8f9fa; border-radius:8px; padding:10px 12px; margin-bottom:10px; line-height:1.6;">${escapeHTML(r.content || '')}</div>
                <div style="font-size:12px; color:#adb5bd; margin-bottom:10px;">📱 ${escapeHTML(r.device || '')} &nbsp;|&nbsp; 📅 접수: ${date}</div>
                ${r.imageBase64 ? `<div style="margin-bottom:12px;"><img src="${r.imageBase64}" onclick="openImageModal('${r.imageBase64}')" style="max-width:100%; max-height:200px; border-radius:8px; cursor:pointer; object-fit:contain; border:1px solid #dee2e6;"></div>` : ''}
                ${r.status !== 'fixed' ? `
                <button onclick="markBugFixed('${r.id}', '${r.authorUid || ''}', '${(r.title || '').replace(/'/g, "\\'")}')"
                    style="background:linear-gradient(135deg, #28a745, #20c997); color:white; border:none; padding:10px 20px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; width:100%;">
                    <i class="fas fa-check-circle"></i> 수정 완료 처리 & 유저 알림
                </button>` : `
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="flex:1; text-align:center; font-size:13px; color:#28a745; font-weight:600; padding:8px;"><i class="fas fa-check-circle"></i> 수정 완료됨</div>
                    <button onclick="deleteBugReport('${r.id}')"
                        style="background:#dc3545; color:white; border:none; padding:8px 16px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap;">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>`}
            </div>`;
    }).join('');
};

// 관리자 - 수정 완료 처리 및 유저 알림
window.markBugFixed = async function(reportId, authorUid, reportTitle) {
    if (!isAdmin()) return;
    if (!confirm(`"${reportTitle}" 버그를 수정 완료 처리하고 해당 유저에게 알림을 보내시겠습니까?`)) return;

    try {
        await db.ref(`bugReports/${reportId}/status`).set('fixed');
        await db.ref(`bugReports/${reportId}/fixedAt`).set(Date.now());

        if (authorUid) {
            const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await db.ref(`notifications/${authorUid}/${notifId}`).set({
                type: 'bugFixed',
                title: '🐛 버그 수정 완료',
                text: `제보하신 버그 "${reportTitle}"가 수정되었습니다! 감사합니다 🙏`,
                timestamp: Date.now(),
                read: false
            });
        }

        // ✅ 배열 상태 업데이트 후 재렌더링
        const target = (window._allBugReports || []).find(r => r.id === reportId);
        if (target) target.status = 'fixed';
        filterAdminBugs();

        alert('✅ 수정 완료 처리 및 유저 알림 전송 완료!');

    } catch(e) {
        console.error(e);
        alert('처리 중 오류가 발생했습니다.');
    }
};

// 관리자 - 수정완료 버그 삭제
window.deleteBugReport = async function(reportId) {
    if (!isAdmin()) return;
    if (!confirm('이 버그 제보를 삭제하시겠습니까?')) return;
    try {
        await db.ref(`bugReports/${reportId}`).remove();

        // ✅ 배열에서도 제거 후 즉시 재렌더링
        window._allBugReports = (window._allBugReports || []).filter(r => r.id !== reportId);
        const countEl = document.getElementById('bugTotalCount');
        if (countEl) countEl.textContent = `총 ${window._allBugReports.length}건`;
        filterAdminBugs();

    } catch(e) {
        console.error(e);
        alert('삭제 중 오류가 발생했습니다.');
    }
};

// 관리자 전용 메모장
window.showAdminMemo = async function() {
    if (!isAdmin()) { alert('관리자만 접근 가능합니다.'); return; }
    hideAll();
    window.scrollTo(0, 0);
    const section = document.getElementById('moreMenuSection');
    section.classList.add('active');

    section.innerHTML = `
        <div style="max-width:700px; margin:0 auto; padding:20px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                <button onclick="showMoreMenu()" style="background:none; border:none; font-size:20px; cursor:pointer; color:#495057;">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h2 style="margin:0; font-size:20px; font-weight:800; color:#c62828;">
                    <i class="fas fa-sticky-note"></i> 관리자 메모장
                </h2>
            </div>

            <div style="background:#fff8dc; border:1px solid #ffc107; border-radius:10px; padding:12px 16px; margin-bottom:20px; font-size:13px; color:#856404;">
                <i class="fas fa-lock"></i> 관리자만 볼 수 있는 메모입니다. Firebase에 저장됩니다.
            </div>

            <div style="background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08); margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <label style="font-size:14px; font-weight:700; color:#495057;">📋 메모 목록</label>
                    <button onclick="addAdminMemoItem()"
                        style="background:#c62828; color:white; border:none; padding:7px 14px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer;">
                        <i class="fas fa-plus"></i> 새 메모
                    </button>
                </div>
                <div id="adminMemoList" style="display:flex; flex-direction:column; gap:10px;">
                    <div style="text-align:center; padding:30px; color:#adb5bd;">
                        <i class="fas fa-spinner fa-spin"></i> 불러오는 중...
                    </div>
                </div>
            </div>
        </div>
    `;

    await loadAdminMemos();
};

async function loadAdminMemos() {
    const listEl = document.getElementById('adminMemoList');
    if (!listEl) return;
    try {
        const snap = await db.ref('adminMemos').orderByChild('createdAt').once('value');
        const memos = [];
        snap.forEach(child => memos.push({ id: child.key, ...child.val() }));
        memos.reverse();

        if (memos.length === 0) {
            listEl.innerHTML = `<div style="text-align:center; padding:40px; color:#adb5bd;"><i class="fas fa-sticky-note" style="font-size:32px;"></i><p style="margin-top:10px;">메모가 없습니다. 새 메모를 추가해보세요!</p></div>`;
            return;
        }

        listEl.innerHTML = memos.map(m => `
            <div id="memoCard-${m.id}" style="background:#fffde7; border:1px solid #ffe082; border-radius:10px; padding:14px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                    <div style="flex:1;">
                        <div style="font-size:13px; font-weight:700; color:#5d4037; margin-bottom:6px;">${escapeHTML(m.title || '제목 없음')}</div>
                        <div style="font-size:13px; color:#6d4c41; white-space:pre-wrap; line-height:1.6;">${escapeHTML(m.content || '')}</div>
                        <div style="font-size:11px; color:#bcaaa4; margin-top:8px;">📅 ${new Date(m.createdAt).toLocaleString('ko-KR')}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:6px; flex-shrink:0;">
                        <button onclick="editAdminMemo('${m.id}', \`${m.title ? m.title.replace(/`/g,'\\`') : ''}\`, \`${m.content ? m.content.replace(/`/g,'\\`') : ''}\`)"
                            style="background:#ffa000; color:white; border:none; padding:5px 10px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:700;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteAdminMemo('${m.id}')"
                            style="background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:700;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch(e) {
        if (listEl) listEl.innerHTML = `<p style="color:#dc3545; text-align:center;">불러오기 실패</p>`;
    }
}

window.addAdminMemoItem = function() {
    const listEl = document.getElementById('adminMemoList');
    if (!listEl) return;
    const formId = `memoForm-new-${Date.now()}`;
    const formHTML = `
        <div id="${formId}" style="background:#fff8e1; border:2px solid #ffc107; border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:10px;">
            <input id="${formId}-title" type="text" placeholder="제목" maxlength="100"
                style="padding:8px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; width:100%; box-sizing:border-box;">
            <textarea id="${formId}-content" placeholder="내용을 입력하세요..." rows="4"
                style="padding:8px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; resize:vertical; font-family:inherit; width:100%; box-sizing:border-box;"></textarea>
            <div style="display:flex; gap:8px;">
                <button onclick="saveAdminMemo('${formId}', null)"
                    style="background:#c62828; color:white; border:none; padding:9px 18px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; flex:1;">
                    <i class="fas fa-save"></i> 저장
                </button>
                <button onclick="document.getElementById('${formId}').remove()"
                    style="background:#6c757d; color:white; border:none; padding:9px 18px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer;">
                    취소
                </button>
            </div>
        </div>
    `;
    listEl.insertAdjacentHTML('afterbegin', formHTML);
};

window.editAdminMemo = function(memoId, title, content) {
    const card = document.getElementById(`memoCard-${memoId}`);
    if (!card) return;
    const formId = `memoForm-edit-${memoId}`;
    card.outerHTML = `
        <div id="${formId}" style="background:#fff8e1; border:2px solid #ffc107; border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:10px;">
            <input id="${formId}-title" type="text" value="${title.replace(/"/g,'&quot;')}" maxlength="100"
                style="padding:8px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; width:100%; box-sizing:border-box;">
            <textarea id="${formId}-content" rows="4"
                style="padding:8px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; resize:vertical; font-family:inherit; width:100%; box-sizing:border-box;">${content}</textarea>
            <div style="display:flex; gap:8px;">
                <button onclick="saveAdminMemo('${formId}', '${memoId}')"
                    style="background:#c62828; color:white; border:none; padding:9px 18px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; flex:1;">
                    <i class="fas fa-save"></i> 저장
                </button>
                <button onclick="loadAdminMemos()"
                    style="background:#6c757d; color:white; border:none; padding:9px 18px; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer;">
                    취소
                </button>
            </div>
        </div>
    `;
};

window.saveAdminMemo = async function(formId, memoId) {
    const title = document.getElementById(`${formId}-title`)?.value.trim();
    const content = document.getElementById(`${formId}-content`)?.value.trim();
    if (!title && !content) { alert('제목 또는 내용을 입력해주세요.'); return; }
    try {
        if (memoId) {
            await db.ref(`adminMemos/${memoId}`).update({ title: title || '', content: content || '', updatedAt: Date.now() });
        } else {
            await db.ref('adminMemos').push({ title: title || '', content: content || '', createdAt: Date.now() });
        }
        await loadAdminMemos();
    } catch(e) {
        alert('저장 실패. 다시 시도해주세요.');
    }
};

window.deleteAdminMemo = async function(memoId) {
    if (!confirm('이 메모를 삭제하시겠습니까?')) return;
    try {
        await db.ref(`adminMemos/${memoId}`).remove();
        const card = document.getElementById(`memoCard-${memoId}`);
        if (card) {
            card.style.transition = 'all 0.3s';
            card.style.opacity = '0';
            card.style.transform = 'translateX(30px)';
            setTimeout(() => card.remove(), 300);
        }
    } catch(e) {
        alert('삭제 실패. 다시 시도해주세요.');
    }
};

// ===================================================================
// 🔊 Part 16: 효과음 시스템
// ===================================================================

const SOUND_PACKS = [
    { value: 'none',          label: '효과음 없음', desc: '모든 효과음을 사용하지 않습니다', icon: '🔇' },
    { value: 'MP3/sfx1.mp3',  label: '좋아요',   desc: '좋아요 좋아요!!',                    icon: '🔔' },

];

const SOUND_ACTIONS = [
    { key: 'articleClick',   icon: '📰', label: '기사 클릭',          desc: '기사 카드를 눌렀을 때' },
    { key: 'articlePublish', icon: '🚀', label: '기사 발행',          desc: '기사를 작성·발행했을 때' },
    { key: 'searchClick',    icon: '🔍', label: '검색 버튼 클릭',     desc: '검색 버튼을 눌렀을 때' },
    { key: 'commentSend',    icon: '💬', label: '댓글 전송',          desc: '댓글을 작성해서 보낼 때' },
    { key: 'commentLike',    icon: '👍', label: '댓글 좋아요/비추천', desc: '댓글에 좋아요/비추천을 눌렀을 때' },
    { key: 'articleVote',    icon: '🗳️', label: '기사 추천/비추천',   desc: '기사에 추천/비추천을 눌렀을 때' },
    { key: 'chatSend',       icon: '💌', label: '채팅 메시지 전송',   desc: '채팅방에서 메시지를 보낼 때' },
    { key: 'navigate',       icon: '🧭', label: '탭/페이지 이동',     desc: '하단 탭 메뉴를 눌러 이동할 때' },
    { key: 'loadMore',       icon: '⬇️', label: '더보기 클릭',        desc: '기사·댓글 더보기 버튼을 눌렀을 때' },
    { key: 'imageUpload',    icon: '🖼️', label: '이미지 업로드',      desc: '이미지를 업로드했을 때' },
    { key: 'login',          icon: '🔑', label: '로그인',             desc: '로그인에 성공했을 때' },
    { key: 'logout',         icon: '🚪', label: '로그아웃',           desc: '로그아웃했을 때' },
    { key: 'notification',   icon: '🔔', label: '알림 수신',          desc: '새 알림 토스트가 나타날 때' },
    { key: 'categoryChange', icon: '📂', label: '카테고리 변경',      desc: '카테고리 드롭다운에서 선택할 때' },
    { key: 'sortChange',     icon: '🔀', label: '정렬 방식 변경',     desc: '최신순·인기순 등 정렬을 바꿀 때' },
    { key: 'modalOpen',      icon: '🪟', label: '모달/팝업 열기',     desc: '설정, 로그인 등 팝업이 열릴 때' },
    { key: 'themeChange',    icon: '🎨', label: '테마 변경',          desc: '다른 테마를 선택했을 때' },
    { key: 'goBack',         icon: '◀️', label: '뒤로가기',           desc: '뒤로가기 버튼을 눌렀을 때' },
];

let soundSettings = {};

function loadSoundSettings() {
    try { soundSettings = JSON.parse(localStorage.getItem('soundSettings') || '{}'); } catch(e) { soundSettings = {}; }
    if (!soundSettings.selectedPack) soundSettings.selectedPack = 'none';
    if (!soundSettings.actions) soundSettings.actions = {};
    SOUND_ACTIONS.forEach(a => { if (soundSettings.actions[a.key] === undefined) soundSettings.actions[a.key] = false; });
}

function saveSoundSettings() {
    try { localStorage.setItem('soundSettings', JSON.stringify(soundSettings)); } catch(e) {}
}

let _sharedAudio = null;
function playSound(key) {
    if (soundSettings.selectedPack === 'none') return;
    if (!soundSettings.actions[key]) return;
    try {
        if (!_sharedAudio || _sharedAudio._pack !== soundSettings.selectedPack) {
            _sharedAudio = new Audio(soundSettings.selectedPack);
            _sharedAudio._pack = soundSettings.selectedPack;
            _sharedAudio.volume = 0.6;
        }
        _sharedAudio.currentTime = 0;
        _sharedAudio.play().catch(() => {});
    } catch(e) {}
}

function toggleSettingsAccordion(id) {
    const panel = document.getElementById(id);
    const btn   = document.getElementById(id + 'Btn');
    if (!panel) return;
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'block';
    if (btn) btn.textContent = isOpen ? '더보기 ▾' : '접기 ▴';
    if (!isOpen && id === 'soundAccordion') renderSoundSettings();
}

function renderSoundSettings() {
    loadSoundSettings();
    const container = document.getElementById('soundSettingsList');
    if (!container) return;
    container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
            ${SOUND_PACKS.map(p => `
            <label style="display:flex;align-items:center;padding:12px;border:2px solid ${soundSettings.selectedPack===p.value?'#c62828':'#dadce0'};border-radius:10px;cursor:pointer;transition:all 0.2s;background:${soundSettings.selectedPack===p.value?'#fff8f8':'white'};">
                <input type="radio" name="soundPack" value="${p.value}"
                       ${soundSettings.selectedPack===p.value?'checked':''}
                       onchange="onSoundPackChange('${p.value}')"
                       style="margin-right:12px;width:20px;height:20px;cursor:pointer;accent-color:#c62828;">
                <span style="font-size:22px;margin-right:12px;flex-shrink:0;">${p.icon}</span>
                <div style="flex:1;">
                    <div style="font-weight:600;color:#202124;margin-bottom:3px;">${p.label}</div>
                    <div style="font-size:12px;color:#5f6368;">${p.desc}</div>
                    ${p.value!=='none'?`<div style="font-size:11px;color:#adb5bd;margin-top:2px;">${p.value}</div>`:''}
                </div>
                ${p.value!=='none'?`<button onclick="event.preventDefault();previewSoundPack('${p.value}')"
                    style="padding:5px 10px;font-size:11px;font-weight:700;border:1.5px solid #c62828;background:white;color:#c62828;border-radius:6px;cursor:pointer;flex-shrink:0;"
                    onmouseover="this.style.background='#fff5f5'" onmouseout="this.style.background='white'">▶ 미리듣기</button>`:''}
            </label>`).join('')}
        </div>
        <div style="border-top:1px solid #f0f0f0;margin:4px 0 14px;"></div>
        <div style="font-size:13px;font-weight:700;color:#495057;margin-bottom:10px;">⚙️ 효과음 울릴 동작 선택</div>
        <div style="display:flex;flex-direction:column;gap:2px;">
            ${SOUND_ACTIONS.map(a => `
            <label style="display:flex;align-items:center;gap:12px;padding:9px 12px;border-radius:8px;cursor:pointer;"
                   onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background=''">
                <input type="checkbox" id="sfx_${a.key}" ${soundSettings.actions[a.key]?'checked':''}
                       onchange="onSoundToggle('${a.key}',this.checked)"
                       style="width:17px;height:17px;cursor:pointer;accent-color:#c62828;flex-shrink:0;">
                <span style="font-size:17px;flex-shrink:0;">${a.icon}</span>
                <div style="flex:1;">
                    <div style="font-weight:600;font-size:14px;color:#202124;">${a.label}</div>
                    <div style="font-size:11px;color:#868e96;">${a.desc}</div>
                </div>
            </label>`).join('')}
        </div>
    `;
}

window.onSoundPackChange = function(value) {
    soundSettings.selectedPack = value;
    saveSoundSettings();
    renderSoundSettings();
};

window.previewSoundPack = function(file) {
    try { const a = new Audio(file); a.volume = 0.6; a.play().catch(()=>{}); } catch(e) {}
};

window.onSoundToggle = function(key, checked) {
    soundSettings.actions[key] = checked;
    saveSoundSettings();
};

window.selectAllSounds = function(checked) {
    SOUND_ACTIONS.forEach(a => {
        soundSettings.actions[a.key] = checked;
        const el = document.getElementById('sfx_'+a.key);
        if (el) el.checked = checked;
    });
    saveSoundSettings();
};

loadSoundSettings();

// ---- 훅 ----
(function(){const _o=window.showArticleDetail||(typeof showArticleDetail==='function'?showArticleDetail:null);if(_o)window.showArticleDetail=function(id){playSound('articleClick');return _o.call(this,id);};})();
(function(){const _o=window.searchArticles||(typeof searchArticles==='function'?searchArticles:null);if(_o)window.searchArticles=function(r){playSound('searchClick');return _o.call(this,r);};})();
(function(){const _o=window.submitComment||(typeof submitComment==='function'?submitComment:null);if(_o)window.submitComment=async function(id){playSound('commentSend');return _o.call(this,id);};})();
(function(){const _o=window.toggleVote||(typeof toggleVote==='function'?toggleVote:null);if(_o)window.toggleVote=function(a,v){playSound('articleVote');return _o.call(this,a,v);};})();
(function(){const _o=window.toggleCommentVote;if(_o)window.toggleCommentVote=function(a,c,v){playSound('commentLike');return _o.call(this,a,c,v);};})();
(function(){const _o=window.loadMoreArticles||(typeof loadMoreArticles==='function'?loadMoreArticles:null);if(_o)window.loadMoreArticles=function(){playSound('loadMore');return _o.call(this);};})();
(function(){const _o=window.loadMoreComments||(typeof loadMoreComments==='function'?loadMoreComments:null);if(_o)window.loadMoreComments=function(){playSound('loadMore');return _o.call(this);};})();
(function(){const _o=window.sortArticles||(typeof sortArticles==='function'?sortArticles:null);if(_o)window.sortArticles=function(m,b){playSound('sortChange');return _o.call(this,m,b);};})();
(function(){
    const _oH=window.showArticles||(typeof showArticles==='function'?showArticles:null);
    const _oW=window.showWritePage||(typeof showWritePage==='function'?showWritePage:null);
    const _oS=window.showSettings||(typeof showSettings==='function'?showSettings:null);
    const _oM=window.showMoreMenu||(typeof showMoreMenu==='function'?showMoreMenu:null);
    if(_oH)window.showArticles=function(){playSound('navigate');return _oH.call(this);};
    if(_oW)window.showWritePage=function(){playSound('navigate');return _oW.call(this);};
    if(_oS)window.showSettings=function(){playSound('navigate');return _oS.call(this);};
    if(_oM)window.showMoreMenu=function(){playSound('navigate');return _oM.call(this);};
})();
(function(){const _o=window.selectCategory||(typeof selectCategory==='function'?selectCategory:null);if(_o)window.selectCategory=function(c){playSound('categoryChange');return _o.call(this,c);};})();
(function(){const _o=window.logoutAdmin||(typeof logoutAdmin==='function'?logoutAdmin:null);if(_o)window.logoutAdmin=function(){playSound('logout');return _o.call(this);};})();
(function(){const _o=window.openAdminAuthModal||(typeof openAdminAuthModal==='function'?openAdminAuthModal:null);if(_o)window.openAdminAuthModal=function(){playSound('modalOpen');return _o.call(this);};})();
(function(){const _o=window.showToastNotification||(typeof showToastNotification==='function'?showToastNotification:null);if(_o)window.showToastNotification=function(t,m,a){playSound('notification');return _o.call(this,t,m,a);};})();
(function(){const _o=window.goBack||(typeof goBack==='function'?goBack:null);if(_o)window.goBack=function(){playSound('goBack');return _o.call(this);};})();

document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('input[name="theme"]').forEach(r=>r.addEventListener('change',()=>playSound('themeChange')));
    const form=document.getElementById('articleForm');
    if(form)form.addEventListener('submit',()=>playSound('articlePublish'));
});
document.addEventListener('change',function(e){
    if(['thumbnailInput','commentImageInput','maintenanceImageInput'].includes(e.target?.id)&&e.target.files?.length>0)playSound('imageUpload');
});
document.addEventListener('click',function(e){
    const s=document.getElementById('chatSection');
    if(!s||!s.contains(e.target))return;
    const btn=e.target.closest('button');
    if(!btn)return;
    const ic=btn.querySelector('i');
    if(ic&&(ic.className.includes('paper-plane')||ic.className.includes('send')))playSound('chatSend');
});
document.addEventListener('chatMessageSent',()=>playSound('chatSend'));
if(typeof auth!=='undefined'){
    auth.onAuthStateChanged(function(user){
        if(user&&!window._sfxLoginFired){window._sfxLoginFired=true;playSound('login');}
        if(!user)window._sfxLoginFired=false;
    });
}
// ===== 개선 제보 시스템 =====

window._improvementList = [];

window.showImprovementPage = function() {
    hideAll();
    window.scrollTo(0, 0);
    window._improvementList = [];
    const section = document.getElementById('moreMenuSection');
    if (!section) return;
    section.classList.add('active');
    const now = new Date().toLocaleString('ko-KR');
    section.innerHTML = `
        <div style="max-width:600px; margin:0 auto; padding:20px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
                <button onclick="showMoreMenu()" style="background:none; border:none; font-size:20px; cursor:pointer; color:#495057;"><i class="fas fa-arrow-left"></i></button>
                <h2 style="margin:0; font-size:20px; font-weight:800; color:#e65100;"><i class="fas fa-lightbulb"></i> 개선 제보</h2>
            </div>
            <div style="background:#fff8e1; border:1px solid #ffca28; border-radius:10px; padding:12px 16px; margin-bottom:20px; font-size:13px; color:#795548;">
                <i class="fas fa-info-circle"></i> 사이트를 더 좋게 만들 아이디어나 불편한 점을 알려주세요! 여러 개 추가 후 한 번에 전송할 수 있어요.
            </div>
            <div style="background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08); display:flex; flex-direction:column; gap:14px; margin-bottom:16px;">
                <input type="hidden" id="improveTime" value="${now}">
                <div>
                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📝 제목 <span style="color:#dc3545;">*</span></label>
                    <input type="text" id="improveTitle" placeholder="개선 아이디어를 간단히 설명해주세요" maxlength="100"
                        style="width:100%; padding:10px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; box-sizing:border-box; outline:none;"
                        onfocus="this.style.borderColor='#e65100'" onblur="this.style.borderColor='#dee2e6'">
                </div>
                <div>
                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📂 분류</label>
                    <select id="improveCategory" style="width:100%; padding:10px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; box-sizing:border-box; outline:none; background:white; cursor:pointer;"
                        onfocus="this.style.borderColor='#e65100'" onblur="this.style.borderColor='#dee2e6'">
                        <option value="UI/UX">🎨 UI/UX 개선</option>
                        <option value="기능">⚙️ 새 기능 추가</option>
                        <option value="성능">⚡ 성능 개선</option>
                        <option value="콘텐츠">📰 콘텐츠 관련</option>
                        <option value="기타">💬 기타</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📄 상세 내용 <span style="color:#dc3545;">*</span></label>
                    <textarea id="improveContent" placeholder="어떻게 개선하면 좋을지 자세히 알려주세요" rows="4"
                        style="width:100%; padding:10px 12px; border:1px solid #dee2e6; border-radius:8px; font-size:14px; resize:vertical; font-family:inherit; box-sizing:border-box; outline:none;"
                        onfocus="this.style.borderColor='#e65100'" onblur="this.style.borderColor='#dee2e6'"></textarea>
                </div>
                <div>
                    <label style="font-size:13px; font-weight:600; color:#495057; display:block; margin-bottom:6px;">📷 참고 이미지 (선택)</label>
                    <div id="improveImagePreviewArea" onclick="document.getElementById('improveImageInput').click()"
                        style="border:2px dashed #dee2e6; border-radius:8px; padding:16px; text-align:center; cursor:pointer; background:#fafafa;"
                        onmouseover="this.style.borderColor='#e65100'" onmouseout="this.style.borderColor='#dee2e6'">
                        <i class="fas fa-camera" style="font-size:22px; color:#adb5bd;"></i>
                        <p style="margin:6px 0 0; font-size:13px; color:#adb5bd;">클릭하여 이미지 첨부</p>
                    </div>
                    <input type="file" id="improveImageInput" accept="image/*" style="display:none;" onchange="previewImproveImage(this)">
                </div>
                <button onclick="addImproveToList()"
                    style="background:linear-gradient(135deg,#e65100,#ff8f00); color:white; border:none; padding:12px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; width:100%;">
                    <i class="fas fa-plus-circle"></i> 목록에 추가
                </button>
            </div>
            <div id="improveQueueArea" style="display:none; margin-bottom:16px;">
                <div style="font-size:13px; font-weight:700; color:#495057; margin-bottom:8px;">
                    📋 제보 목록 <span id="improveQueueCount" style="background:#e65100; color:white; border-radius:10px; padding:1px 8px; font-size:12px;">0</span>
                </div>
                <div id="improveQueueList" style="display:flex; flex-direction:column; gap:8px;"></div>
            </div>
            <button id="improveSubmitAllBtn" onclick="submitImprovementReport()" style="display:none;
                background:linear-gradient(135deg,#e65100,#ff6d00); color:white; border:none; padding:14px;
                border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; width:100%; margin-bottom:8px;">
                <i class="fas fa-paper-plane"></i> 전체 전송 (<span id="improveSubmitCount">0</span>건)
            </button>
            <div id="improveSubmitMsg" style="margin-top:8px; text-align:center;"></div>
        </div>
    `;
    updateURL('improvement');
};

window.addImproveToList = async function() {
    const title = document.getElementById('improveTitle').value.trim();
    const content = document.getElementById('improveContent').value.trim();
    const category = document.getElementById('improveCategory').value;
    const imageInput = document.getElementById('improveImageInput');
    if (!title) { alert('제목을 입력해주세요.'); return; }
    if (!content) { alert('상세 내용을 입력해주세요.'); return; }
    let imageBase64 = null;
    if (imageInput.files && imageInput.files[0]) {
        imageBase64 = await compressImageToBase64(imageInput.files[0], 800, 0.72);
    }
    window._improvementList.push({ id: Date.now(), title, content, category, time: document.getElementById('improveTime').value, imageBase64 });
    document.getElementById('improveTitle').value = '';
    document.getElementById('improveContent').value = '';
    imageInput.value = '';
    document.getElementById('improveImagePreviewArea').innerHTML = '<i class="fas fa-camera" style="font-size:22px; color:#adb5bd;"></i><p style="margin:6px 0 0; font-size:13px; color:#adb5bd;">클릭하여 이미지 첨부</p>';
    renderImproveQueue();
};

window.renderImproveQueue = function() {
    const list = window._improvementList;
    const area = document.getElementById('improveQueueArea');
    const queueList = document.getElementById('improveQueueList');
    const submitBtn = document.getElementById('improveSubmitAllBtn');
    if (!area || !queueList) return;
    if (list.length === 0) { area.style.display = 'none'; submitBtn.style.display = 'none'; return; }
    area.style.display = 'block';
    submitBtn.style.display = 'block';
    document.getElementById('improveQueueCount').textContent = list.length;
    document.getElementById('improveSubmitCount').textContent = list.length;
    queueList.innerHTML = list.map((item, idx) => `
        <div style="background:white; border-radius:10px; padding:12px 14px; box-shadow:0 1px 4px rgba(0,0,0,0.08); display:flex; align-items:flex-start; gap:10px; border-left:3px solid #e65100;">
            <div style="flex:1; min-width:0;">
                <div style="font-size:11px; color:#e65100; font-weight:700; margin-bottom:2px;">${escapeHTML(item.category)}</div>
                <div style="font-size:14px; font-weight:700; color:#202124; margin-bottom:2px;">${escapeHTML(item.title)}</div>
                <div style="font-size:12px; color:#868e96; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(item.content)}</div>
                ${item.imageBase64 ? '<div style="font-size:11px; color:#e65100; margin-top:3px;"><i class="fas fa-image"></i> 이미지 첨부됨</div>' : ''}
            </div>
            <button onclick="removeImproveFromList(${idx})" style="background:#fff0f0; border:none; color:#dc3545; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:12px; flex-shrink:0;"><i class="fas fa-times"></i></button>
        </div>`).join('');
};

window.removeImproveFromList = function(idx) {
    window._improvementList.splice(idx, 1);
    renderImproveQueue();
};

window.previewImproveImage = function(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
        const area = document.getElementById('improveImagePreviewArea');
        area.innerHTML = `<img src="${e.target.result}" style="max-width:100%; max-height:200px; border-radius:8px; object-fit:contain;"><p style="margin:8px 0 0; font-size:12px; color:#868e96;">클릭하여 변경</p>`;
    };
    reader.readAsDataURL(input.files[0]);
};

window.submitImprovementReport = async function() {
    if (!isLoggedIn()) { alert('로그인 후 이용해주세요.'); return; }
    const list = window._improvementList || [];
    if (list.length === 0) { alert('제보할 내용을 먼저 추가해주세요.'); return; }
    const btn = document.getElementById('improveSubmitAllBtn');
    const msgEl = document.getElementById('improveSubmitMsg');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 중...'; }
    try {
        const user = auth.currentUser;
        const baseTime = Date.now();
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            await db.ref('improvements').push({ title: item.title, content: item.content, category: item.category, time: item.time, authorName: getNickname(), authorEmail: getUserEmail(), authorUid: user.uid, imageBase64: item.imageBase64 || null, status: 'pending', createdAt: baseTime + i });
        }
        window._improvementList = [];
        showToastNotification('💡 개선 제보 완료', `${list.length}건 제보 감사합니다! 검토 후 반영할게요 🙏`);
        setTimeout(() => showMoreMenu(), 1200);
    } catch(e) {
        console.error(e);
        if (msgEl) msgEl.innerHTML = '<div style="background:#f8d7da; color:#721c24; padding:12px 16px; border-radius:8px; font-size:14px;"><i class="fas fa-exclamation-circle"></i> 전송 실패. 다시 시도해주세요.</div>';
        if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fas fa-paper-plane"></i> 전체 전송 (${list.length}건)`; }
    }
};

window._allImprovements = [];

window.showAdminImprovements = async function() {
    if (!isAdmin()) { alert('관리자만 접근 가능합니다.'); return; }
    hideAll();
    window.scrollTo(0, 0);
    const section = document.getElementById('moreMenuSection');
    section.classList.add('active');
    section.innerHTML = `
        <div style="max-width:700px; margin:0 auto; padding:20px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                <button onclick="showMoreMenu()" style="background:none; border:none; font-size:20px; cursor:pointer; color:#495057;"><i class="fas fa-arrow-left"></i></button>
                <h2 style="margin:0; font-size:20px; font-weight:800; color:#e65100; flex:1;"><i class="fas fa-lightbulb"></i> 개선 제보 관리</h2>
                <span id="improveTotalCount" style="font-size:13px; color:#868e96;"></span>
            </div>
            <div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;">
                <input id="improveSearchInput" type="text" placeholder="제목, 내용, 작성자 검색..."
                    oninput="filterAdminImprovements()"
                    style="flex:1; min-width:160px; padding:10px 14px; border:1.5px solid #dee2e6; border-radius:10px; font-size:14px; outline:none; box-sizing:border-box;"
                    onfocus="this.style.borderColor='#e65100'" onblur="this.style.borderColor='#dee2e6'">
                <select id="improveStatusFilter" onchange="filterAdminImprovements()"
                    style="padding:10px 12px; border:1.5px solid #dee2e6; border-radius:10px; font-size:14px; outline:none; background:white; cursor:pointer;">
                    <option value="all">전체 상태</option>
                    <option value="pending">검토중</option>
                    <option value="accepted">반영 예정</option>
                    <option value="done">반영 완료</option>
                    <option value="rejected">미반영</option>
                </select>
                <select id="improveCategoryFilter" onchange="filterAdminImprovements()"
                    style="padding:10px 12px; border:1.5px solid #dee2e6; border-radius:10px; font-size:14px; outline:none; background:white; cursor:pointer;">
                    <option value="all">전체 분류</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="기능">새 기능</option>
                    <option value="성능">성능</option>
                    <option value="콘텐츠">콘텐츠</option>
                    <option value="기타">기타</option>
                </select>
            </div>
            <div id="adminImproveList" style="display:flex; flex-direction:column; gap:14px;">
                <div style="text-align:center; padding:40px; color:#adb5bd;"><i class="fas fa-spinner fa-spin" style="font-size:24px;"></i><p>불러오는 중...</p></div>
            </div>
        </div>`;
    try {
        const snap = await db.ref('improvements').once('value');
        const reports = [];
        snap.forEach(child => { reports.push({ id: child.key, ...child.val() }); });
        reports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        window._allImprovements = reports;
        const countEl = document.getElementById('improveTotalCount');
        if (countEl) countEl.textContent = `총 ${reports.length}건`;
        renderAdminImproveList(reports);
    } catch(e) {
        const listEl = document.getElementById('adminImproveList');
        if (listEl) listEl.innerHTML = `<p style="color:#dc3545; text-align:center;">불러오기 실패: ${e.message}</p>`;
    }
};

window.filterAdminImprovements = function() {
    const kw = (document.getElementById('improveSearchInput')?.value || '').toLowerCase();
    const status = document.getElementById('improveStatusFilter')?.value || 'all';
    const category = document.getElementById('improveCategoryFilter')?.value || 'all';
    const filtered = (window._allImprovements || []).filter(r => {
        const matchStatus = status === 'all' || r.status === status || (status === 'pending' && !r.status);
        const matchCat = category === 'all' || r.category === category;
        const matchKw = !kw || (r.title||'').toLowerCase().includes(kw) || (r.content||'').toLowerCase().includes(kw) || (r.authorName||'').toLowerCase().includes(kw);
        return matchStatus && matchCat && matchKw;
    });
    renderAdminImproveList(filtered);
};

window.renderAdminImproveList = function(reports) {
    const listEl = document.getElementById('adminImproveList');
    if (!listEl) return;
    if (reports.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; padding:60px 20px; color:#adb5bd;"><i class="fas fa-inbox" style="font-size:40px;"></i><p style="margin-top:12px;">검색 결과가 없습니다</p></div>`;
        return;
    }
    const statusConfig = {
        pending:  { label: '검토중',    bg: '#fff3cd', color: '#856404', icon: 'fa-clock',        border: '#ffc107' },
        accepted: { label: '반영 예정', bg: '#cce5ff', color: '#004085', icon: 'fa-thumbs-up',    border: '#007bff' },
        done:     { label: '반영 완료', bg: '#d4edda', color: '#155724', icon: 'fa-check-circle', border: '#28a745' },
        rejected: { label: '미반영',    bg: '#f8d7da', color: '#721c24', icon: 'fa-times-circle', border: '#dc3545' }
    };
    const catEmoji = { 'UI/UX':'🎨', '기능':'⚙️', '성능':'⚡', '콘텐츠':'📰', '기타':'💬' };
    listEl.innerHTML = reports.map(r => {
        const cur = statusConfig[r.status] || statusConfig.pending;
        const cat = r.category || '기타';
        const date = new Date(r.createdAt).toLocaleString('ko-KR');
        const statusBtns = Object.entries(statusConfig).map(([s, c]) => {
            const active = (r.status || 'pending') === s;
            return `<button onclick="updateImproveStatus('${r.id}','${s}','${r.authorUid||''}','${(r.title||'').replace(/'/g,"\\'")}')"
                style="padding:6px 12px; border-radius:8px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid ${active ? c.border : '#dee2e6'}; background:${active ? c.bg : '#fff'}; color:${active ? c.color : '#868e96'};">
                <i class="fas ${c.icon}"></i> ${c.label}</button>`;
        }).join('');
        return `
            <div id="improveCard-${r.id}" style="background:white; border-radius:12px; padding:18px; box-shadow:0 2px 8px rgba(0,0,0,0.08); border-left:4px solid ${cur.border};">
                <div style="display:flex; align-items:flex-start; gap:8px; margin-bottom:10px;">
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                            <span style="font-size:11px; background:#fff8e1; color:#e65100; padding:2px 8px; border-radius:10px; font-weight:700;">${catEmoji[cat]||'💬'} ${escapeHTML(cat)}</span>
                            <span style="background:${cur.bg}; color:${cur.color}; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700;"><i class="fas ${cur.icon}"></i> ${cur.label}</span>
                        </div>
                        <div style="font-size:15px; font-weight:700; color:#202124; margin-bottom:4px;">${escapeHTML(r.title||'')}</div>
                        <div style="font-size:12px; color:#868e96;">👤 ${escapeHTML(r.authorName||'알 수 없음')} &nbsp;|&nbsp; 📅 ${date}</div>
                    </div>
                </div>
                <div style="font-size:13px; color:#495057; white-space:pre-wrap; background:#f8f9fa; border-radius:8px; padding:10px 12px; margin-bottom:12px; line-height:1.6;">${escapeHTML(r.content||'')}</div>
                ${r.imageBase64 ? `<div style="margin-bottom:12px;"><img src="${r.imageBase64}" onclick="openImageModal('${r.imageBase64}')" style="max-width:100%; max-height:200px; border-radius:8px; cursor:pointer; object-fit:contain; border:1px solid #dee2e6;"></div>` : ''}
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">${statusBtns}</div>
                <button onclick="deleteImprovement('${r.id}')" style="background:#f8f9fa; color:#868e96; border:1px solid #dee2e6; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; width:100%;"><i class="fas fa-trash"></i> 삭제</button>
            </div>`;
    }).join('');
};

window.updateImproveStatus = async function(reportId, newStatus, authorUid, reportTitle) {
    if (!isAdmin()) return;
    try {
        await db.ref(`improvements/${reportId}/status`).set(newStatus);
        const msgs = {
            accepted: `제보하신 개선 사항 "${reportTitle}"이 반영 예정 목록에 추가되었습니다! 🎉`,
            done:     `제보하신 개선 사항 "${reportTitle}"이 반영 완료되었습니다! 감사합니다 🙏`,
            rejected: `제보하신 개선 사항 "${reportTitle}"은 이번에는 반영이 어렵습니다. 소중한 의견 감사합니다.`
        };
        if (authorUid && msgs[newStatus]) {
            const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
            await db.ref(`notifications/${authorUid}/${notifId}`).set({ type: 'improvementUpdate', title: '💡 개선 제보 상태 업데이트', text: msgs[newStatus], timestamp: Date.now(), read: false });
        }
        const target = (window._allImprovements || []).find(r => r.id === reportId);
        if (target) target.status = newStatus;
        filterAdminImprovements();
    } catch(e) {
        alert('처리 중 오류가 발생했습니다.');
    }
};

window.deleteImprovement = async function(reportId) {
    if (!isAdmin()) return;
    if (!confirm('이 개선 제보를 삭제하시겠습니까?')) return;
    try {
        await db.ref(`improvements/${reportId}`).remove();
        window._allImprovements = (window._allImprovements || []).filter(r => r.id !== reportId);
        const countEl = document.getElementById('improveTotalCount');
        if (countEl) countEl.textContent = `총 ${window._allImprovements.length}건`;
        filterAdminImprovements();
    } catch(e) {
        alert('삭제 중 오류가 발생했습니다.');
    }
};
