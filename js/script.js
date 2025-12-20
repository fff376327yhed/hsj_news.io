// ===== Part 1: 기본 설정 및 Firebase 초기화 (최적화) =====

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

// ✅ 전역 캐시 객체 (메모리 최적화)
const globalCache = {
    users: new Map(),
    profilePhotos: new Map(),
    decorations: new Map(),
    settings: null,
    lastUpdate: 0,
    CACHE_DURATION: 5 * 60 * 1000 // 5분
};

// ✅ Toast 알림 시스템 (최적화)
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
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
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

// ✅ 인증 지속성 설정
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => console.error("❌ 인증 지속성 설정 실패:", error));

// ✅ FCM Messaging 초기화
let messaging = null;
try {
    if (firebase.messaging.isSupported && firebase.messaging.isSupported()) {
        messaging = firebase.messaging();
        console.log("✅ Firebase Messaging 초기화 성공");
    }
} catch(err) {
    console.warn("⚠️ Firebase Messaging 초기화 실패:", err.message);
}

// ✅ 전역 변수 (최적화)
let currentArticlePage = 1;
const ARTICLES_PER_PAGE = 5;
let currentCommentPage = 1;
const COMMENTS_PER_PAGE = 10;
let currentArticleId = null;
let currentSortMethod = 'latest';
let filteredArticles = [];
let allArticles = [];
let bannedWordsList = [];
let currentFreeboardPage = 1;
let currentFreeboardSortMethod = 'latest';
let filteredFreeboardArticles = [];
let originalUserTheme = null;
let profilePhotoCache = new Map();
let catchMindGames = [];
let currentGame = null;
let currentDifficulty = 'easy';
let gameTimer = null;
let timeRemaining = 0;
let usedHints = 0;
let hintPenalty = 20;
let currentReward = 0;
let couponsConfig = [];
let maintenanceChecked = false;

// ✅ 로딩 인디케이터 (최적화)
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

// ✅ 사용자 정보 (캐싱)
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

function isAdmin(){
    return getCookie("is_admin") === "true";
}

// ✅ 쿠키 관리
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

// ✅ 금지어 관리 (캐싱)
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

// ===== Part 2: URL 관리 및 라우팅 (보안 강화 + 최적화 + 친구 시스템 추가) =====

// 🔐 민감한 페이지 암호화 함수
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

// 🔓 민감한 페이지 복호화 함수
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

// ✅ URL 파라미터 읽기 (캐싱)
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

// ✅ URL 업데이트 (최적화)
function updateURL(page, articleId = null, section = null) {
    let urlPage = encryptSensitivePage(page);
    
    let url = `?page=${urlPage}`;
    if (articleId) url += `&id=${articleId}`;
    if (section) url += `&section=${section}`;
    
    // 중복 히스토리 방지
    if (window.location.search !== url) {
        window.history.pushState({ page, articleId, section }, '', url);
    }
}

// ===== Part 2 수정: 라우팅 함수 (안전성 강화 + 쿠폰/버그제보 추가) =====

// ✅ 라우팅 함수 (안전성 강화)
function routeToPage(page, articleId = null, section = null) {
    const adminPages = ['users', 'adminSettings', 'eventManager', 'management'];
    
    if (adminPages.includes(page) && !isAdmin()) {
        alert("🚫 관리자 권한이 필요합니다.");
        showArticles();
        return;
    }
    
    // 라우팅 맵 - 존재하지 않는 함수는 조건부로 처리
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
        'users': () => typeof showUserManagement === 'function' ? showUserManagement() : showArticles(),
        'admin': () => typeof showAdminEvent === 'function' ? showAdminEvent() : showArticles(),
        'more': () => showMoreMenu(),
        'messenger': () => typeof showMessenger === 'function' ? showMessenger() : showMoreMenu(),
        'event': () => typeof showEventMenu === 'function' ? showEventMenu() : showMoreMenu(),
        'catchmind': () => typeof showCatchMind === 'function' ? showCatchMind() : showEventMenu(),
        'coupon': () => typeof showCouponPage === 'function' ? showCouponPage() : showEventMenu(),
        'friends': () => typeof showFriendsPage === 'function' ? showFriendsPage() : showMoreMenu(),
        'friendRequests': () => typeof showFriendRequestsPage === 'function' ? showFriendRequestsPage() : (typeof showFriendsPage === 'function' ? showFriendsPage() : showMoreMenu()),
        'inventory': () => typeof showInventoryPage === 'function' ? showInventoryPage() : showMoreMenu(),
        'bugreport': () => typeof showBugReportPage === 'function' ? showBugReportPage() : showMoreMenu(),  // ✅ 추가
        'shop': () => typeof showStorePage === 'function' ? showStorePage() : showMoreMenu()  // ✅ 추가
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
        console.warn(`알 수 없는 페이지: ${page}`);
        showArticles();
    }
}


// ✅ 초기 라우팅
function initialRoute() {
    const params = getURLParams();
    
    if (params.page) {
        routeToPage(params.page, params.articleId, params.section);
    } else {
        showArticles();
    }
}

// ✅ 브라우저 뒤로/앞으로 가기 (최적화)
window.addEventListener('popstate', (event) => {
    urlParamsCache = null; // 캐시 무효화
    
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

// ✅ 로그아웃 (최적화)
function logoutAdmin(){
    if(!confirm("로그아웃 하시겠습니까?")) return;
    
    showLoadingIndicator("로그아웃 중...");
    
    auth.signOut().then(() => {
        deleteCookie("is_admin");
        sessionStorage.clear();
        
        // 캐시 초기화
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

// ✅ Google 로그인 (최적화)
function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    
    auth.signInWithPopup(provider)
        .then((result) => {
            console.log("Google 로그인 성공:", result.user.email);
            alert(`환영합니다, ${result.user.displayName || result.user.email}님!`);
        })
        .catch((error) => {
            console.error("Google 로그인 오류:", error);
            
            let errorMessage = "로그인 중 오류가 발생했습니다.";
            
            const errorMessages = {
                'auth/popup-closed-by-user': "로그인 창이 닫혔습니다.",
                'auth/popup-blocked': "팝업이 차단되었습니다. 팝업 차단을 해제해주세요.",
                'auth/cancelled-popup-request': "이미 로그인 진행 중입니다.",
                'auth/network-request-failed': "네트워크 연결을 확인해주세요."
            };
            
            errorMessage = errorMessages[error.code] || `로그인 실패: ${error.message}`;
            alert(errorMessage);
        });
}

// ✅ 리디렉션 로그인 (대체 방법)
function googleLoginRedirect() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    
    auth.signInWithRedirect(provider);
}

// ✅ 리디렉션 결과 처리
auth.getRedirectResult()
    .then((result) => {
        if (result.user) {
            console.log("Google 로그인 성공 (리디렉션):", result.user.email);
            alert(`환영합니다, ${result.user.displayName || result.user.email}님!`);
        }
    })
    .catch((error) => {
        console.error("Google 로그인 오류 (리디렉션):", error);
        if(error.code !== 'auth/popup-closed-by-user') {
            alert("로그인 실패: " + error.message);
        }
    });

// ✅ 관리자 모드 해제
function disableAdminMode() {
    if(!confirm("관리자 모드를 해제하시겠습니까?\n\n일반 사용자 모드로 전환됩니다.")) return;
    deleteCookie("is_admin");
    alert("관리자 모드가 해제되었습니다.");
    location.reload();
}

// ✅ 공유 가능한 링크 복사
function copyArticleLink(articleId) {
    const url = `${window.location.origin}${window.location.pathname}?page=article&id=${articleId}`;
    navigator.clipboard.writeText(url).then(() => {
        alert('📋 링크가 복사되었습니다!\n\n' + url);
    }).catch(err => {
        console.error('링크 복사 실패:', err);
        prompt('이 링크를 복사하세요:', url);
    });
}

// ✅ 뒤로가기 (테마 복원 포함)
function goBack() {
    if(typeof restoreUserTheme === 'function') {
        restoreUserTheme();
    }
    
    showArticles();
}

console.log("✅ Part 2 URL 관리 완료");

// ===== Part 3: 관리자 인증 및 프로필 관리 (오류 처리 강화 + 장식 시스템) =====

// ✅ 관리자 인증 모달 열기
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

// ✅ 관리자 인증 모달 닫기
function closeAdminAuthModal() {
    const modal = document.getElementById("adminAuthModal");
    if(modal) modal.remove();
}

// ✅ 관리자 로그인 처리
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
        console.log("🔐 Firebase 인증 시도:", email);
        
        const userCredential = await auth.signInWithEmailAndPassword(email, pw);
        console.log("✅ 인증 성공:", userCredential.user.email);
        
        setCookie("is_admin", "true", 365);
        
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

// ✅ 전역 스코프에 함수 등록
window.openAdminAuthModal = openAdminAuthModal;
window.closeAdminAuthModal = closeAdminAuthModal;
window.handleAdminLogin = handleAdminLogin;

// ✅ 알림 전송 함수
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
        else if (type === 'comment') {
            const commenterEmailKey = btoa(data.authorEmail).replace(/=/g, '');
            
            Object.entries(usersData).forEach(([uid, userData]) => {
                if(userData.notificationsEnabled !== false) {
                    const following = userData.following || {};
                    if(following[commenterEmailKey]) {
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
        } else if(type === 'comment') {
            notificationData.title = '💬 새 댓글';
            notificationData.text = `${data.authorName}님이 새 댓글을 작성했습니다: "${data.content.substring(0, 50)}..."`;
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

// 🔥 프로필 사진 + 장식 생성 함수 (핵심 추가!)
async function createProfilePhotoWithDecorations(photoUrl, size, identifier) {
    if(!photoUrl) {
        return `<div style="width:${size}px; height:${size}px; border-radius:50%; background:#f1f3f4; display:inline-flex; align-items:center; justify-content:center; border:2px solid #dadce0;">
            <i class="fas fa-user" style="font-size:${size/2}px; color:#9aa0a6;"></i>
        </div>`;
    }
    
    try {
        // 사용자의 활성 장식 로드
        const usersSnapshot = await db.ref("users").once("value");
        const usersData = usersSnapshot.val() || {};
        
        let userUid = null;
        for(const [uid, userData] of Object.entries(usersData)) {
            if(userData && userData.email === identifier) {
                userUid = uid;
                break;
            }
        }
        
        let decorHTML = '';
        
        if(userUid) {
            const decorSnap = await db.ref(`users/${userUid}/activeDecorations`).once('value');
            let activeDecorations = decorSnap.val() || [];
            
            if(!Array.isArray(activeDecorations)) {
                activeDecorations = Object.values(activeDecorations);
            }
            
            // 장식 정의 (간단한 이모지 기반)
            const decorations = {
                'decoration_santa_hat': { emoji: '🎅', position: 'top:-8px; right:-8px;', size: `${size * 0.4}px` },
                'decoration_snowflake': { emoji: '❄️', position: 'top:-8px; left:-8px;', size: `${size * 0.35}px` },
                'decoration_antlers': { emoji: '🦌', position: 'top:-10px; right:-10px;', size: `${size * 0.45}px` },
                'decoration_lights': { emoji: '💡', position: 'bottom:-5px; right:-5px;', size: `${size * 0.3}px` },
                'decoration_snowman': { emoji: '⛄', position: 'bottom:-5px; left:-5px;', size: `${size * 0.35}px` },
                'decoration_gift': { emoji: '🎁', position: 'top:0; right:-10px;', size: `${size * 0.3}px` }
            };
            
            activeDecorations.forEach(decorId => {
                const decor = decorations[decorId];
                if(decor) {
                    decorHTML += `<div style="position:absolute; ${decor.position}; font-size:${decor.size}; z-index:10; pointer-events:none;">${decor.emoji}</div>`;
                }
            });
        }
        
        return `<div style="position:relative; width:${size}px; height:${size}px; display:inline-block;">
            <img src="${photoUrl}" style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; border:2px solid #dadce0;">
            ${decorHTML}
        </div>`;
        
    } catch(error) {
        console.error("장식 로드 실패:", error);
        return `<img src="${photoUrl}" style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; border:2px solid #dadce0;">`;
    }
}

// ✅ 프로필 드롭다운 토글
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

// 🔥 프로필 드롭다운 업데이트 (오류 처리 강화 + 장식 적용)
async function updateProfileDropdown() {
    const content = document.getElementById("profileDropdownContent");
    const user = auth.currentUser;
    
    if(!content) return;
    
    if(user) {
        try {
            const snapshot = await db.ref("users/" + user.uid).once("value");
            const userData = snapshot.val() || {};
            
            await renderProfileDropdown(content, user, userData);
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

// 🔥 프로필 드롭다운 렌더링 (장식 적용)
async function renderProfileDropdown(content, user, userData) {
    const isVIP = userData.isVIP || false;
    const photoUrl = userData.profilePhoto || null;
    
    // 🔥 장식 적용된 프로필 사진 생성
    const profilePhotoHTML = await createProfilePhotoWithDecorations(photoUrl, 48, user.email);
    
    content.innerHTML = `
        <div class="profile-info">
            <div style="cursor:pointer;" onclick="openProfilePhotoModal()">
                ${profilePhotoHTML}
            </div>
            <div class="profile-details">
                <h4 style="color:#000; font-weight:700;">${getNickname()}${isVIP ? ' <span class="vip-badge">⭐ VIP</span>' : ''}</h4>
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
}

// ✅ 외부 클릭 시 드롭다운 닫기
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById("profileDropdown");
    const profileBtn = document.getElementById("headerProfileBtn");
    
    if (dropdown && profileBtn) {
        if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove("active");
        }
    }
});

// ✅ 닉네임 변경 (1회 제한)
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

// ✅ 사용자 컨텐츠의 닉네임 업데이트
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

console.log("✅ Part 3 프로필 관리 완료 (오류 처리 강화 + 장식 시스템 추가)");

// ===== Part 4: 경제 시스템 및 알림 (최적화) =====

// ✅ 사용자 돈 가져오기 (캐싱)
let userMoneyCache = { amount: 0, lastUpdate: 0, uid: null };

async function getUserMoney() {
    if(!isLoggedIn()) return 0;
    const uid = getUserId();
    
    const now = Date.now();
    if(userMoneyCache.uid === uid && (now - userMoneyCache.lastUpdate < 30000)) {
        return userMoneyCache.amount;
    }
    
    try {
        const snapshot = await db.ref("users/" + uid + "/money").once("value");
        const money = snapshot.val() || 0;
        
        userMoneyCache = {
            amount: money,
            lastUpdate: now,
            uid: uid
        };
        
        console.log("💰 현재 보유 포인트:", money);
        return money;
    } catch(error) {
        console.error("포인트 로드 실패:", error);
        return 0;
    }
}

// ✅ 사용자 돈 업데이트 (최적화)
async function updateUserMoney(amount, reason = "") {
    if(!isLoggedIn()) return;
    const uid = getUserId();
    
    try {
        const currentMoney = await getUserMoney();
        const newMoney = currentMoney + amount;
        
        // 배치 업데이트
        const updates = {
            [`users/${uid}/money`]: newMoney
        };
        
        // 거래 기록 저장
        if(reason) {
            const transactionId = Date.now().toString();
            updates[`users/${uid}/transactions/${transactionId}`] = {
                amount: amount,
                reason: reason,
                timestamp: Date.now(),
                balanceAfter: newMoney
            };
        }
        
        await db.ref().update(updates);
        
        // 캐시 업데이트
        userMoneyCache.amount = newMoney;
        userMoneyCache.lastUpdate = Date.now();
        
        // UI 업데이트
        updateMoneyDisplay();
        
        // 알림 표시
        if(amount > 0) {
            showToastNotification("💰 포인트 획득", `+${amount}원 (${reason})`, null);
        }
    } catch(error) {
        console.error("포인트 업데이트 실패:", error);
    }
}

// ✅ 헤더 돈 표시 업데이트
async function updateMoneyDisplay() {
    const moneyEl = document.getElementById("moneyAmount");
    if(moneyEl && isLoggedIn()) {
        const money = await getUserMoney();
        moneyEl.textContent = money.toLocaleString();
    }
}

// ✅ 돈 상세 정보 표시
async function showMoneyDetail() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    showLoadingIndicator("거래 내역 로딩 중...");
    
    const money = await getUserMoney();
    const uid = getUserId();
    
    // 최근 거래 내역 가져오기
    const transSnapshot = await db.ref("users/" + uid + "/transactions")
        .limitToLast(10)
        .once("value");
    
    const transactions = [];
    transSnapshot.forEach(child => {
        transactions.unshift({id: child.key, ...child.val()});
    });
    
    hideLoadingIndicator();
    
    const modalHTML = `
        <div id="moneyDetailModal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>💰 내 포인트</h3>
                    <button onclick="closeMoneyDetail()" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding:20px;">
                    <div style="background:linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding:30px; border-radius:12px; text-align:center; margin-bottom:20px;">
                        <div style="font-size:14px; color:#000; opacity:0.8; margin-bottom:5px;">보유 포인트</div>
                        <div style="font-size:36px; font-weight:900; color:#000;">${money.toLocaleString()}원</div>
                    </div>
                    
                    <h4 style="margin-bottom:15px;">💳 최근 거래 내역</h4>
                    ${transactions.length > 0 ? transactions.map(t => `
                        <div style="background:#f8f9fa; padding:12px; border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-weight:600; margin-bottom:4px;">${t.reason}</div>
                                <div style="font-size:11px; color:#868e96;">${new Date(t.timestamp).toLocaleString()}</div>
                            </div>
                            <div style="font-size:16px; font-weight:900; color:${t.amount > 0 ? '#4caf50' : '#f44336'};">
                                ${t.amount > 0 ? '+' : ''}${t.amount}원
                            </div>
                        </div>
                    `).join('') : '<p style="text-align:center; color:#868e96; padding:20px;">거래 내역이 없습니다.</p>'}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.closeMoneyDetail = function() {
    const modal = document.getElementById("moneyDetailModal");
    if(modal) modal.remove();
}

// ✅ 알림 리스너 설정 (중복 방지 최적화)
let notificationListenerActive = false;

function setupNotificationListener(uid) {
    if (!uid || notificationListenerActive) return;
    
    console.log("알림 리스너 설정 시작:", uid);
    
    // 이전 리스너 제거
    db.ref("notifications/" + uid).off();
    
    const shownNotifications = new Set();
    const pageLoadTime = Date.now();
    
    // 새 알림 리스너
    db.ref("notifications/" + uid)
        .orderByChild("read")
        .equalTo(false)
        .on("child_added", async (snapshot) => {
            const notification = snapshot.val();
            const notifId = snapshot.key;
            
            // 중복 체크
            if (shownNotifications.has(notifId)) return;
            if (notification.timestamp < pageLoadTime) return;
            if (notification.pushed) return;
            
            console.log("🆕 새 알림 감지:", notification);
            
            if (!notification.read) {
                shownNotifications.add(notifId);
                
                showToastNotification(
                    notification.type === 'article' ? '📰 새 기사' : 
                    notification.type === 'comment' ? '💬 새 댓글' : 
                    '📢 알림',
                    notification.text,
                    notification.articleId
                );
                
                // 5초 후 자동 읽음 처리
                setTimeout(() => {
                    db.ref("notifications/" + uid + "/" + notifId).update({ read: true });
                }, 5000);
            }
        });
    
    notificationListenerActive = true;
}

// ✅ 알림 권한 체크 및 요청
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('이 브라우저는 알림을 지원하지 않습니다.');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    return false;
}

// ✅ FCM 토큰 등록 (최적화)
function getBasePath() {
    const path = window.location.pathname;
    const match = path.match(/^(\/[^\/]+)/);
    return match ? match[1] : '';
}

async function registerFCMToken(uid) {
    if(!messaging) {
        console.log("⚠️ Messaging not available");
        return;
    }
    
    try {
        console.log("📱 FCM 토큰 등록 시작...");
        
        const basePath = getBasePath();
        const permission = await Notification.requestPermission();
        
        if(permission !== 'granted') {
            console.log("❌ 알림 권한 거부됨");
            showNotificationPermissionPrompt();
            return;
        }
        
        const swPath = basePath ? `${basePath}/firebase-messaging-sw.js` : '/firebase-messaging-sw.js';
        const swScope = basePath ? `${basePath}/` : '/';
        
        // Service Worker 등록
        let registration = await navigator.serviceWorker.register(swPath, {
            scope: swScope,
            updateViaCache: 'none'
        });
        
        await navigator.serviceWorker.ready;
        
        // FCM 토큰 발급
        const token = await messaging.getToken({
            serviceWorkerRegistration: registration,
            vapidKey: "BFJBBAv_qOw_aklFbE89r_cuCArMJkMK56Ryj9M1l1a3qv8CuHCJ-fKALtOn4taF7Pjwo2bjfoOuewEKBqRBtCo"
        });
        
        if(!token) throw new Error("토큰 발급 실패");
        
        console.log("✅ FCM 토큰 발급 성공!");
        
        // 토큰을 Firebase DB에 저장
        const tokenKey = btoa(token).substring(0, 20).replace(/[^a-zA-Z0-9]/g, '');
        await db.ref("users/" + uid + "/fcmTokens/" + tokenKey).set({
            token: token,
            updatedAt: Date.now(),
            browser: navigator.userAgent.substring(0, 100),
            platform: navigator.platform,
            deviceType: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
            lastUsed: Date.now(),
            basePath: basePath || '/'
        });
        
        // 포그라운드 메시지 리스너
        messaging.onMessage((payload) => {
            console.log("📨 포그라운드 메시지 수신:", payload);
            
            const title = payload.data?.title || payload.notification?.title || '📰 해정뉴스';
            const body = payload.data?.body || payload.data?.text || payload.notification?.body || '';
            const articleId = payload.data?.articleId || '';
            
            showToastNotification(title, body, articleId);
        });
        
        // Service Worker 메시지 리스너
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        
        localStorage.setItem('fcm_token_registered', 'true');
        localStorage.setItem('fcm_token_time', Date.now().toString());
        localStorage.setItem('fcm_base_path', basePath);
        
    } catch(error) {
        console.error("❌ FCM 초기화 오류:", error);
    }
}

// ✅ Service Worker 메시지 핸들러
function handleServiceWorkerMessage(event) {
    console.log('📬 Service Worker 메시지:', event.data);
    
    if (event.data.type === 'NOTIFICATION_CLICK') {
        const articleId = event.data.articleId;
        if (articleId) {
            showArticleDetail(articleId);
        }
    }
}

// ✅ 알림 권한 요청 프롬프트
function showNotificationPermissionPrompt() {
    const promptHTML = `
        <div id="notificationPrompt" style="position:fixed;bottom:20px;right:20px;background:white;border:2px solid #c62828;border-radius:12px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:10000;max-width:350px;">
            <div style="display:flex;align-items:start;gap:12px;">
                <div style="font-size:32px;">🔔</div>
                <div style="flex:1;">
                    <h3 style="margin:0 0 8px 0;color:#c62828;">알림 권한 필요</h3>
                    <p style="margin:0 0 12px 0;color:#5f6368;font-size:14px;">새 기사와 댓글 알림을 받으려면 알림 권한을 허용해주세요.</p>
                    <div style="display:flex;gap:8px;">
                        <button onclick="retryNotificationPermission()" style="flex:1;background:#c62828;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;font-weight:bold;">허용하기</button>
                        <button onclick="closeNotificationPrompt()" style="background:#f1f3f4;color:#5f6368;border:none;padding:8px;border-radius:6px;cursor:pointer;">나중에</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('notificationPrompt');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', promptHTML);
}

window.retryNotificationPermission = async function() {
    closeNotificationPrompt();
    const user = auth.currentUser;
    if (user) await registerFCMToken(user.uid);
}

window.closeNotificationPrompt = function() {
    const prompt = document.getElementById('notificationPrompt');
    if (prompt) prompt.remove();
}

// ✅ 토큰 갱신 함수
async function refreshFCMToken() {
    const user = auth.currentUser;
    if (!user) return;
    
    const lastRegistered = localStorage.getItem('fcm_token_time');
    const savedBasePath = localStorage.getItem('fcm_base_path');
    const currentBasePath = getBasePath();
    const now = Date.now();
    
    // 경로가 변경되었거나 7일이 지난 경우 토큰 갱신
    if (savedBasePath !== currentBasePath || 
        !lastRegistered || 
        (now - parseInt(lastRegistered)) > 7 * 24 * 60 * 60 * 1000) {
        console.log("🔄 FCM 토큰 갱신 시작...");
        await registerFCMToken(user.uid);
    }
}

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

console.log("✅ Part 4 경제 시스템 완료");

// ===== Part 5: 인증 상태 관리 및 팔로우 시스템 + 고유 ID 생성 (수정됨) =====

// ✅ 고유 ID 생성 함수
async function generateUserID() {
    const prefix = "USER";
    const snapshot = await db.ref("userIDs").once("value");
    const existingIDs = snapshot.val() || {};
    
    let newID;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4자리 숫자
        newID = `${prefix}_${randomNum}`;
        attempts++;
    } while (existingIDs[newID] && attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
        // 타임스탬프 기반으로 생성
        newID = `${prefix}_${Date.now().toString().slice(-6)}`;
    }
    
    return newID;
}

// ✅ 사용자 고유 ID 확인 및 생성
async function ensureUserID(user) {
    if (!user) return null;
    
    const uid = user.uid;
    const userRef = db.ref(`users/${uid}`);
    
    try {
        const snapshot = await userRef.once("value");
        const userData = snapshot.val() || {};
        
        // 이미 ID가 있으면 반환
        if (userData.userID) {
            return userData.userID;
        }
        
        // 없으면 새로 생성
        const newUserID = await generateUserID();
        
        // userIDs 테이블에 등록
        await db.ref(`userIDs/${newUserID}`).set(uid);
        
        // users 테이블에 저장
        await userRef.update({ userID: newUserID });
        
        console.log(`✅ 새 사용자 ID 생성: ${newUserID}`);
        return newUserID;
        
    } catch(error) {
        console.error("❌ 사용자 ID 생성 실패:", error);
        return null;
    }
}

// ✅ 인증 상태 변경 (기존 auth.onAuthStateChanged 수정)
auth.onAuthStateChanged(async user => {
    console.log("🔐 인증 상태 변경:", user ? user.email : "로그아웃");
    
    if (user) {
        console.log("✅ 자동 로그인 성공:", user.email);

        const loadPromises = [];
        
        if (typeof loadAndApplyUserTheme === 'function') {
            loadPromises.push(loadAndApplyUserTheme());
        }
        
        if (typeof loadAndApplyUserSounds === 'function') {
            loadPromises.push(loadAndApplyUserSounds());
        }

        if (typeof initSoundSystem === 'function') {
            loadPromises.push(initSoundSystem());
        }
        
        loadPromises.push(updateHeaderProfileButton(user));
        
        await Promise.all(loadPromises);
        
        showLoadingIndicator("로그인 중...");

        const userRef = db.ref("users/" + user.uid);
        const snap = await userRef.once("value");
        let data = snap.val() || {};
        
        if(!data.email) {
            const updates = {
                email: user.email,
                createdAt: Date.now(),
                money: 0
            };
            await userRef.update(updates);
            data = { ...data, ...updates };
        }
        
        if(data.money === undefined) {
            await userRef.update({ money: 0 });
        }
        
        // 🔥 고유 ID 확인 및 생성
        await ensureUserID(user);
        
        if (data.isBanned) {
            hideLoadingIndicator();
            alert("🚫 차단된 계정입니다.");
            auth.signOut();
            return;
        }

        checkLegalAgreement(user);
        await registerFCMToken(user.uid);
        setupNotificationListener(user.uid);
        setupMessengerBadgeListener();
        updateMoneyDisplay();
        
        hideLoadingIndicator();
        
        if(!sessionStorage.getItem('login_shown')) {
            showToastNotification("✅ 로그인 완료", `환영합니다, ${getNickname()}님!`, null);
            sessionStorage.setItem('login_shown', 'true');
        }
    } else {
        console.log("❌ 로그아웃 상태");
        hideLoadingIndicator();
        notificationListenerActive = false;
        
        const headerBtn = document.getElementById("headerProfileBtn");
        if(headerBtn) {
            headerBtn.innerHTML = `<i class="fas fa-user-circle"></i>`;
        }
    }

    updateSettings();
    
    const adminEventBtn = document.getElementById("moreEventBtn");
    if(adminEventBtn) {
        if(user) {
            const snap = await db.ref("users/" + user.uid).once("value");
            const userData = snap.val() || {};
            const isVIP = userData.isVIP || false;
            
            adminEventBtn.style.display = (isAdmin() || isVIP) ? "block" : "none";
        } else {
            adminEventBtn.style.display = "none";
        }
    }

    await checkMaintenanceMode();
    
    if(document.getElementById("articlesSection")?.classList.contains("active")) {
        filteredArticles = allArticles;
        renderArticles();
    }
});

// ✅ 팔로우 가능한 사용자 목록 로드 (최적화)
async function loadFollowUsers() {
    if(!isLoggedIn()) return;
    
    const followSection = document.getElementById("followUsersSection");
    followSection.innerHTML = '<p style="text-align:center;color:#868e96;">로딩 중...</p>';
    
    const currentEmail = getUserEmail();
    const uid = getUserId();
    
    // 병렬 처리
    const [articlesSnapshot, followSnapshot] = await Promise.all([
        db.ref("articles").once("value"),
        db.ref("users/" + uid + "/following").once("value")
    ]);
    
    const articlesData = articlesSnapshot.val() || {};
    const articles = Object.values(articlesData);
    const followingData = followSnapshot.val() || {};
    
    const usersMap = new Map();
    
    // 사용자 맵 생성
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

// ✅ 사용자 팔로우/언팔로우 토글
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

// ===== Part 5: 인증 상태 관리 및 팔로우 시스템 (설정 페이지 장식 적용) =====

// ✅ 설정 업데이트 (장식 적용)
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
            const isVIP = userData.isVIP || false;
            const warningCount = userData.warningCount || 0;
            const isBanned = userData.isBanned || false;
            const notificationsEnabled = userData.notificationsEnabled !== false;
            
            // 장식 적용된 프로필 사진 HTML 생성
            const photoUrl = userData.profilePhoto || null;
            let profilePhotoHTML = '';
            
            if(photoUrl) {
                profilePhotoHTML = await createProfilePhotoWithDecorations(photoUrl, 120, user.email);
            } else {
                profilePhotoHTML = `<div style="width:120px; height:120px; border-radius:50%; background:#f1f3f4; display:inline-flex; align-items:center; justify-content:center; border:3px solid #dadce0; margin:0 auto;">
                    <i class="fas fa-user" style="font-size:50px; color:#9aa0a6;"></i>
                </div>`;
            }
            
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
                    
                    <p style="margin:8px 0; color:#5f6368;"><strong>이름:</strong> ${user.displayName || getNickname() || '미설정'}${isVIP ? ' <span class="vip-badge">⭐ VIP</span>' : ''}</p>
                    <p style="margin:8px 0; color:#5f6368;"><strong>이메일:</strong> ${user.email || '미설정'}</p>
                    ${warningCount > 0 ? `<p style="margin:8px 0; color:#d93025;"><strong>⚠️ 경고:</strong> ${warningCount}회</p>` : ''}
                    ${hasChangedNickname ? 
                        '<p style="margin:8px 0; color:#9aa0a6; font-size:13px;">닉네임 변경 완료됨</p>' : 
                        '<button onclick="changeNickname()" class="btn-block" style="margin-top:15px; background:#fff; border:1px solid #dadce0;">닉네임 변경 (1회)</button>'
                    }
                </div>
            `;
            
            // 알림 토글 상태 업데이트
            const notificationToggle = document.getElementById("notificationToggle");
            if(notificationToggle) {
                notificationToggle.checked = notificationsEnabled;
                if(notificationsEnabled) {
                    document.getElementById("notificationStatus").innerHTML = '<p style="color:var(--success-color);margin-top:10px;">✅ 알림이 활성화되었습니다.</p>';
                    loadFollowUsers();
                }
            }
        } catch(error) {
            console.error("설정 로드 오류:", error);
            el.innerHTML = `<div style="background:#fff; border:1px solid #dadce0; padding:20px; border-radius:8px; text-align:center;">
                <p style="color:#f44336;">설정을 불러오는 중 오류가 발생했습니다.</p>
            </div>`;
        }
    } else {
        el.innerHTML = `<div style="background:#fff; border:1px solid #dadce0; padding:20px; border-radius:8px; text-align:center;">
            <p style="color:#5f6368;">로그인이 필요합니다.</p>
            <button onclick="googleLogin()" class="btn-primary" style="width:100%; margin-top:15px;">Google 로그인</button>
        </div>`;
    }
    
    // 관리자 모드 표시
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
}

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
        loadFollowUsers();
        setupNotificationListener(uid);
    } else {
        statusDiv.innerHTML = '<p style="color:var(--text-secondary);margin-top:10px;">알림이 비활성화되었습니다.</p>';
        document.getElementById("followUsersSection").innerHTML = '';
        db.ref("notifications/" + uid).off();
        notificationListenerActive = false;
    }
}

// ✅ 메신저 배지 리스너 설정 (중복 방지)
let messengerBadgeListenerActive = false;

function setupMessengerBadgeListener() {
    const uid = getUserId();
    if(!uid || uid === 'anonymous' || messengerBadgeListenerActive) return;
    
    // 이전 리스너 제거
    db.ref("notifications/" + uid).off('value');
    
    // 한 번만 리스너 등록
    db.ref("notifications/" + uid).on("value", snapshot => {
        const notificationsData = snapshot.val() || {};
        const unreadCount = Object.values(notificationsData).filter(n => !n.read).length;
        updateMessengerBadge(unreadCount);
    });
    
    messengerBadgeListenerActive = true;
}

// ✅ 메신저 배지 업데이트
function updateMessengerBadge(count) {
    const badge = document.getElementById("messengerBadge");
    if(badge) {
        if(count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

console.log("✅ Part 5 인증 및 팔로우 완료");

// ===== Part 6 (후반부): 메신저 및 알림 시스템 추가 =====

// ✅ QnA 페이지 표시
function showQnA() {
    hideAll();
    window.scrollTo(0, 0);
    
    const section = document.getElementById("qnaSection");
    if(!section) {
        console.error("❌ qnaSection을 찾을 수 없습니다!");
        return;
    }
    
    section.classList.add("active");
    loadQnAFromFile();
    
    updateURL('qna');  // ✅ 올바른 페이지명 전달
}

// 🔥 QnA 파일 로드 함수 추가 (경로 수정)
function loadQnAFromFile() {
    const qnaList = document.getElementById("qnaList");
    if(!qnaList) return;
    
    qnaList.innerHTML = '<p style="text-align:center; color:#868e96; padding:40px;">QnA 내용을 불러오는 중...</p>';
    
    // ✅ 깃허브 대응 경로: ./html/qna.html
    fetch('./html/qna.html')
        .then(response => {
            if(!response.ok) throw new Error('QnA 파일을 찾을 수 없습니다.');
            return response.text();
        })
        .then(html => {
            qnaList.innerHTML = html;
        })
        .catch(error => {
            console.error("QnA 로드 실패:", error);
            qnaList.innerHTML = `
                <div style="text-align:center; padding:60px 20px;">
                    <p style="color:#f44336; margin-bottom:20px;">❌ QnA 파일을 불러올 수 없습니다.</p>
                    <p style="color:#868e96; font-size:14px;">html 폴더에 qna.html 파일이 있는지 확인해주세요.</p>
                    <p style="color:#adb5bd; font-size:12px; margin-top:10px;">경로: ./html/qna.html</p>
                </div>
            `;
        });
}

// ✅ 메신저 표시
async function showMessenger() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    hideAll();
    window.scrollTo(0, 0);
    
    const messengerSection = document.getElementById("messengerSection");
    if(!messengerSection) {
        console.error("❌ messengerSection을 찾을 수 없습니다!");
        return;
    }
    
    messengerSection.classList.add("active");
    
    messengerSection.innerHTML = `
        <div style="max-width:900px; margin:0 auto; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="color:#c62828;"><i class="fas fa-envelope"></i> 알림 센터</h2>
                <div style="display:flex; gap:10px;">
                    <button onclick="markAllAsRead()" class="btn-secondary btn-sm">
                        <i class="fas fa-check-double"></i> 모두 읽음
                    </button>
                    <button onclick="showMoreMenu()" class="btn-secondary btn-sm">
                        <i class="fas fa-arrow-left"></i> 뒤로가기
                    </button>
                </div>
            </div>
            
            <div class="filter-tabs" style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap;">
                <button class="filter-chip active" onclick="filterNotifications('all')">전체</button>
                <button class="filter-chip" onclick="filterNotifications('article')">📰 새 기사</button>
                <button class="filter-chip" onclick="filterNotifications('comment')">💬 새 댓글</button>
                <button class="filter-chip" onclick="filterNotifications('myArticleComment')">💭 내 기사 댓글</button>
            </div>
            
            <div id="notificationsList" style="background:white; border-radius:12px; padding:20px; min-height:400px;">
                <p style="text-align:center; color:#868e96;">로딩 중...</p>
            </div>
        </div>
    `;
    
    updateURL('messenger');  // ✅ 올바른 페이지명
    await loadNotifications();
}

// ✅ 상점 표시
function showShop() {
    showStorePage();
}

// ✅ 이벤트 메뉴 표시 (이미 있지만 확인)
function showEventMenu() {
    hideAll();
    window.scrollTo(0, 0);
    
    const section = document.getElementById("eventMenuSection");
    if(!section) {
        console.error("❌ eventMenuSection을 찾을 수 없습니다!");
        return;
    }
    
    section.classList.add("active");
    updateURL('event');  // ✅ 올바른 페이지명
}

// ✅ 패치노트 페이지 표시
function showPatchNotesPage() {
    hideAll();
    window.scrollTo(0, 0);
    
    const section = document.getElementById("patchnotesSection");
    if(!section) {
        console.error("❌ patchnotesSection을 찾을 수 없습니다!");
        return;
    }
    
    section.classList.add("active");
    loadPatchNotesToContainer(document.getElementById("patchNotesList"));
    
    updateURL('patchnotes');  // ✅ 올바른 페이지명
}

// 🔥 알림 로드 함수 추가 (오류 수정)
async function loadNotifications(filterType = 'all') {
    if(!isLoggedIn()) return;
    
    const uid = getUserId();
    const listEl = document.getElementById("notificationsList");
    
    if(!listEl) {
        console.error("❌ notificationsList 요소를 찾을 수 없습니다!");
        return;
    }
    
    listEl.innerHTML = '<p style="text-align:center; padding:30px; color:#868e96;">알림을 불러오는 중...</p>';
    
    try {
        const snapshot = await db.ref("notifications/" + uid).once("value");
        const notificationsData = snapshot.val() || {};
        
        let notifications = Object.entries(notificationsData)
            .map(([id, data]) => ({id, ...data}))
            .sort((a, b) => b.timestamp - a.timestamp);
        
        // 필터 적용
        if(filterType !== 'all') {
            notifications = notifications.filter(n => n.type === filterType);
        }
        
        if(notifications.length === 0) {
            listEl.innerHTML = '<p style="text-align:center; padding:40px; color:#868e96;">알림이 없습니다.</p>';
            return;
        }
        
        listEl.innerHTML = notifications.map(notif => {
            const isRead = notif.read;
            const timeAgo = getTimeAgo(notif.timestamp);
            
            return `
                <div class="notification-item ${isRead ? 'read' : 'unread'}" 
                     onclick="handleNotificationClick('${notif.id}', '${notif.articleId}')"
                     style="background:${isRead ? '#f8f9fa' : '#fff'}; padding:15px; margin-bottom:10px; border-radius:8px; border-left:4px solid ${isRead ? '#dee2e6' : '#c62828'}; cursor:pointer; transition:all 0.3s;">
                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                        <strong style="color:${isRead ? '#6c757d' : '#212529'}; font-size:14px;">${notif.title}</strong>
                        <small style="color:#868e96; font-size:11px; white-space:nowrap; margin-left:10px;">${timeAgo}</small>
                    </div>
                    <p style="margin:0; color:${isRead ? '#868e96' : '#495057'}; font-size:13px; line-height:1.5;">${notif.text}</p>
                    ${!isRead ? '<div style="margin-top:8px;"><span style="background:#c62828; color:white; padding:3px 8px; border-radius:10px; font-size:10px;">새 알림</span></div>' : ''}
                </div>
            `;
        }).join('');
        
    } catch(error) {
        console.error("알림 로드 실패:", error);
        listEl.innerHTML = '<p style="text-align:center; padding:30px; color:#f44336;">알림을 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// 🔥 알림 클릭 핸들러
async function handleNotificationClick(notifId, articleId) {
    if(!isLoggedIn()) return;
    
    const uid = getUserId();
    
    try {
        // 읽음 처리
        await db.ref(`notifications/${uid}/${notifId}`).update({ read: true });
        
        // 기사로 이동
        if(articleId) {
            showArticleDetail(articleId);
        }
    } catch(error) {
        console.error("알림 처리 실패:", error);
    }
}

// 🔥 알림 필터링
window.filterNotifications = function(filterType) {
    // 필터 버튼 활성화 상태 변경
    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 필터 적용하여 다시 로드
    loadNotifications(filterType);
}

// 🔥 모두 읽음 처리
window.markAllAsRead = async function() {
    if(!isLoggedIn()) return;
    if(!confirm("모든 알림을 읽음 처리하시겠습니까?")) return;
    
    const uid = getUserId();
    
    try {
        showLoadingIndicator("처리 중...");
        
        const snapshot = await db.ref("notifications/" + uid).once("value");
        const notificationsData = snapshot.val() || {};
        
        const updates = {};
        Object.keys(notificationsData).forEach(notifId => {
            updates[`notifications/${uid}/${notifId}/read`] = true;
        });
        
        await db.ref().update(updates);
        
        hideLoadingIndicator();
        alert("✅ 모든 알림을 읽음 처리했습니다.");
        
        loadNotifications();
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("읽음 처리 실패:", error);
        alert("오류가 발생했습니다.");
    }
}

// 🔥 시간 경과 표시 유틸리티
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if(days > 0) return `${days}일 전`;
    if(hours > 0) return `${hours}시간 전`;
    if(minutes > 0) return `${minutes}분 전`;
    return '방금 전';
}

console.log("✅ Part 6 메신저/알림 시스템 추가 완료");

// ✅ 모든 섹션 숨기기 (스크롤 초기화 추가)
function hideAll() {
    // 페이지 최상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    
    const dropdown = document.getElementById("profileDropdown");
    if(dropdown) dropdown.classList.remove("active");
}

// ✅ 홈(기사 목록) 표시
function showArticles() {
    restoreUserTheme();
    hideAll();
    
    // 즉시 스크롤 최상단으로
    window.scrollTo(0, 0);
    
    document.getElementById("articlesSection").classList.add("active");
    
    const header = document.querySelector('header');
    if(header) header.style.display = 'block';
    
    currentArticlePage = 1;
    document.getElementById("searchCategory").value = "";
    document.getElementById("searchKeyword").value = "";
    filteredArticles = allArticles;
    renderArticles();
    
    updateURL('home');
}

// ✅ 자유게시판 표시
function showFreeboard() {
    hideAll();
    window.scrollTo(0, 0);
    
    document.getElementById("freeboardSection").classList.add("active");
    
    currentFreeboardPage = 1;
    document.getElementById("freeboardSearchKeyword").value = "";
    filteredFreeboardArticles = allArticles.filter(a => a.category === "자유게시판");
    renderFreeboardArticles();
    
    updateURL('freeboard');
}

// ✅ 글쓰기 페이지 표시
function showWritePage() {
    if(!isLoggedIn()) { 
        alert("기사 작성은 로그인 후 가능합니다!"); 
        googleLogin(); 
        return; 
    }
    
    hideAll();
    window.scrollTo(0, 0);
    
    document.getElementById("writeSection").classList.add("active"); 
    setupArticleForm();
    
    updateURL('write'); 
}

// ✅ 설정 페이지 표시
function showSettings() {
    hideAll();
    window.scrollTo(0, 0);
    
    const settingsSection = document.getElementById("settingsSection");
    settingsSection.classList.add("active");
    
    updateSettings();
    updateURL('settings');
}

// ===== Part 6 수정: 더보기 메뉴 재구성 =====

// ✅ 더보기 메뉴 표시 (수정됨)
function showMoreMenu() {
    hideAll();
    window.scrollTo(0, 0);
    
    const section = document.getElementById("moreMenuSection");
    if(!section) {
        console.error("❌ moreMenuSection을 찾을 수 없습니다!");
        alert("더보기 메뉴를 로드할 수 없습니다.");
        return;
    }
    
    section.classList.add("active");
    
    // 🔥 더보기 메뉴 재구성
    const menuHTML = `
        <div class="more-menu-container" style="max-width:600px; margin:0 auto; padding:20px;">
            <h2 style="color:#c62828; text-align:center; margin-bottom:30px;">
                <i class="fas fa-bars"></i> 더보기 메뉴
            </h2>
            
            <!-- 사용자 정보 섹션 -->
            <div class="menu-section" style="background:white; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <h3 style="color:#495057; margin:0 0 15px 0; font-size:16px; border-bottom:2px solid #e9ecef; padding-bottom:10px;">
                    <i class="fas fa-user"></i> 내 정보
                </h3>
                <div style="display:grid; gap:10px;">
                    <button onclick="showProfileSettingsPage()" class="more-menu-btn">
                        <i class="fas fa-user-cog"></i> 프로필 설정
                    </button>
                    <button onclick="showInventoryPage()" class="more-menu-btn">
                        <i class="fas fa-box-open"></i> 인벤토리
                    </button>
                </div>
            </div>
            
            <!-- 소통 섹션 -->
            <div class="menu-section" style="background:white; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <h3 style="color:#495057; margin:0 0 15px 0; font-size:16px; border-bottom:2px solid #e9ecef; padding-bottom:10px;">
                    <i class="fas fa-comments"></i> 소통
                </h3>
                <div style="display:grid; gap:10px;">
                    <button onclick="showFreeboard()" class="more-menu-btn">
                        <i class="fas fa-comment-dots"></i> 자유게시판
                    </button>
                    <button onclick="showMessenger()" class="more-menu-btn">
                        <i class="fas fa-envelope"></i> 메신저
                        <span class="notification-badge" id="messengerBadge" style="display:none;"></span>
                    </button>
                    <button onclick="showFriendsPage()" class="more-menu-btn">
                        <i class="fas fa-user-friends"></i> 친구
                    </button>
                </div>
            </div>
            
            <!-- 활동 섹션 -->
            <div class="menu-section" style="background:white; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <h3 style="color:#495057; margin:0 0 15px 0; font-size:16px; border-bottom:2px solid #e9ecef; padding-bottom:10px;">
                    <i class="fas fa-gamepad"></i> 활동
                </h3>
                <div style="display:grid; gap:10px;">
                    <button onclick="showShop()" class="more-menu-btn">
                        <i class="fas fa-shopping-bag"></i> 상점
                    </button>
                    <button onclick="showEventMenu()" class="more-menu-btn">
                        <i class="fas fa-gift"></i> 이벤트
                    </button>
                    <button onclick="showCouponPage()" class="more-menu-btn">
                        <i class="fas fa-ticket-alt"></i> 쿠폰
                    </button>
                </div>
            </div>
            
            <!-- 정보 섹션 -->
            <div class="menu-section" style="background:white; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <h3 style="color:#495057; margin:0 0 15px 0; font-size:16px; border-bottom:2px solid #e9ecef; padding-bottom:10px;">
                    <i class="fas fa-info-circle"></i> 정보
                </h3>
                <div style="display:grid; gap:10px;">
                    <button onclick="showQnA()" class="more-menu-btn">
                        <i class="fas fa-question-circle"></i> QnA
                    </button>
                    <button onclick="showPatchNotesPage()" class="more-menu-btn">
                        <i class="fas fa-file-alt"></i> 패치노트
                    </button>
                    <button onclick="showBugReportPage()" class="more-menu-btn" style="background:#607d8b; color:white;">
                        <i class="fas fa-bug"></i> 버그 제보
                    </button>
                </div>
            </div>
            
            <!-- 관리 섹션 (VIP/관리자만) -->
            ${(isAdmin() || (isLoggedIn() && auth.currentUser)) ? `
                <div class="menu-section" id="adminMenuSection" style="background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08); display:none;">
                    <h3 style="color:#c62828; margin:0 0 15px 0; font-size:16px; border-bottom:2px solid #ffcdd2; padding-bottom:10px;">
                        <i class="fas fa-crown"></i> VIP 전용
                    </h3>
                    <div style="display:grid; gap:10px;">
                        <button onclick="showAdminEvent()" class="more-menu-btn" style="background:#c62828; color:white;">
                            <i class="fas fa-tools"></i> VIP 관리
                        </button>
                    </div>
                </div>
            ` : ''}
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
            }
            
            .more-menu-btn:hover {
                background: #e9ecef;
                transform: translateX(5px);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .more-menu-btn i {
                font-size: 18px;
                color: #c62828;
                width: 24px;
                text-align: center;
            }
        </style>
    `;
    
    section.innerHTML = menuHTML;
    
    // VIP/관리자 메뉴 표시 여부 확인
    if(isLoggedIn()) {
        const uid = getUserId();
        db.ref(`users/${uid}`).once('value').then(snap => {
            const userData = snap.val() || {};
            const adminSection = document.getElementById('adminMenuSection');
            if(adminSection && (isAdmin() || userData.isVIP)) {
                adminSection.style.display = 'block';
            }
        });
    }
    
    updateURL('more');
}

// ✅ Firebase 실시간 리스너 설정 (중복 방지)
let articlesListenerActive = false;

function setupArticlesListener() {
    if(articlesListenerActive) return;
    
    db.ref("articles").on("value", snapshot => {
        const val = snapshot.val() || {};
        allArticles = Object.values(val);
        
        // 현재 활성화된 섹션에 따라 자동 업데이트
        if(document.getElementById("articlesSection")?.classList.contains("active")) {
            searchArticles(false);
        }
        if(document.getElementById("freeboardSection")?.classList.contains("active")) {
            filteredFreeboardArticles = allArticles.filter(a => a.category === "자유게시판");
            renderFreeboardArticles();
        }
    });
    
    articlesListenerActive = true;
}

// ✅ 기사 저장
function saveArticle(article, callback) {
    if (!article.views) article.views = 0;
    if (!article.likeCount) article.likeCount = 0;
    if (!article.dislikeCount) article.dislikeCount = 0;
    
    db.ref("articles/" + article.id).set(article).then(() => {
        if(callback) callback();
    }).catch(error => {
        alert("저장 실패: " + error.message);
        console.error(error);
    });
}

// ✅ 기사 삭제
function deleteArticleFromDB(articleId, callback) {
    const updates = {
        [`articles/${articleId}`]: null,
        [`votes/${articleId}`]: null,
        [`comments/${articleId}`]: null
    };
    
    db.ref().update(updates).then(() => {
        if(callback) callback();
    }).catch(error => {
        alert("삭제 실패: " + error.message);
    });
}

// ✅ 조회수 증가 (트랜잭션)
function incrementView(id) {
    const viewRef = db.ref(`articles/${id}/views`);
    viewRef.transaction((currentViews) => {
        return (currentViews || 0) + 1;
    });
}

// ✅ 조회수 가져오기
function getArticleViews(article) {
    return article.views || 0;
}

// ✅ 타임스탬프 가져오기
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

// ✅ 투표 토글 (최적화)
function toggleVote(articleId, voteType) {
    if(!isLoggedIn()) {
        alert("추천/비추천은 로그인 후 가능합니다!");
        return;
    }
    
    const uid = getUserId();
    const voteRef = db.ref(`votes/${articleId}/${uid}`);
    const articleRef = db.ref(`articles/${articleId}`);

    voteRef.once('value').then(snapshot => {
        const currentVote = snapshot.val();

        articleRef.transaction(article => {
            if (!article) return article;
            if (!article.likeCount) article.likeCount = 0;
            if (!article.dislikeCount) article.dislikeCount = 0;

            if (currentVote === voteType) {
                // 취소
                if (voteType === 'like') article.likeCount--;
                if (voteType === 'dislike') article.dislikeCount--;
                voteRef.remove(); 
            } else {
                // 변경
                if (currentVote === 'like') article.likeCount--;
                if (currentVote === 'dislike') article.dislikeCount--;

                if (voteType === 'like') article.likeCount++;
                if (voteType === 'dislike') article.dislikeCount++;
                voteRef.set(voteType); 
            }
            return article;
        }).then(() => {
            if (document.getElementById("articleDetailSection")?.classList.contains("active")) {
                showArticleDetail(articleId);
            }
        });
    });
}

// ✅ 투표 수 가져오기
function getArticleVoteCounts(article) {
    return {
        likes: article.likeCount || 0,
        dislikes: article.dislikeCount || 0
    };
}

// ✅ 검색 (디바운싱)
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
                a.content.toLowerCase().includes(keyword) ||
                (a.summary && a.summary.toLowerCase().includes(keyword))
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

// ✅ 정렬된 기사 가져오기
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
    currentArticlePage++;
    renderArticles();
}

// ✅ 자유게시판 전용 함수들
function searchFreeboardArticles(resetPage = true) {
    const keyword = document.getElementById("freeboardSearchKeyword").value.toLowerCase();
    let articles = allArticles.filter(a => a.category === "자유게시판");
    
    if(keyword) {
        articles = articles.filter(a => 
            a.title.toLowerCase().includes(keyword) || 
            a.content.toLowerCase().includes(keyword) ||
            (a.summary && a.summary.toLowerCase().includes(keyword))
        );
    }
    
    filteredFreeboardArticles = articles;
    if(resetPage) currentFreeboardPage = 1;
    renderFreeboardArticles();
}

function sortFreeboardArticles(method, btn) {
    currentFreeboardSortMethod = method;
    currentFreeboardPage = 1;
    document.querySelectorAll('#freeboardSection .chip').forEach(b => b.classList.remove('active'));
    if (btn && btn.classList) btn.classList.add('active');
    renderFreeboardArticles();
}

function getSortedFreeboardArticles() {
    let articles = Array.isArray(filteredFreeboardArticles) ? [...filteredFreeboardArticles] : [];
    
    const sortFunctions = {
        'latest': (a, b) => getArticleTimestamp(b) - getArticleTimestamp(a),
        'oldest': (a, b) => getArticleTimestamp(a) - getArticleTimestamp(b),
        'views': (a, b) => (b.views || 0) - (a.views || 0),
        'likes': (a, b) => (b.likeCount || 0) - (a.likeCount || 0)
    };
    
    const sortFunction = sortFunctions[currentFreeboardSortMethod] || sortFunctions['latest'];
    articles.sort(sortFunction);
    
    return articles;
}

function loadMoreFreeboardArticles() {
    currentFreeboardPage++;
    renderFreeboardArticles();
}

console.log("✅ Part 6 네비게이션 완료 (showMessenger 추가됨)");

// ===== Part 7: 기사 렌더링 및 상세보기 (최적화 - ID 불일치 수정) =====

// ✅ 프로필 사진 플레이스홀더 생성 (동기 함수)
function getProfilePlaceholder(photoUrl, size, identifier) {
    if (photoUrl) {
        return `<img src="${photoUrl}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:2px solid #dadce0;" data-email="${identifier}">`;
    }
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#f1f3f4;display:inline-flex;align-items:center;justify-content:center;border:2px solid #dadce0;">
        <i class="fas fa-user" style="font-size:${size/2}px;color:#9aa0a6;"></i>
    </div>`;
}

// ✅ 사용자 프로필 사진 가져오기 (캐싱)
async function getUserProfilePhoto(email) {
    if (!email) return null;
    
    // 캐시 확인
    if (window.profilePhotoCache.has(email)) {
        return window.profilePhotoCache.get(email);
    }
    
    try {
        const usersSnapshot = await db.ref("users").once("value");
        const usersData = usersSnapshot.val() || {};
        
        for (const userData of Object.values(usersData)) {
            if (userData && userData.email === email) {
                const photoUrl = userData.profilePhoto || null;
                window.profilePhotoCache.set(email, photoUrl);
                return photoUrl;
            }
        }
        
        window.profilePhotoCache.set(email, null);
        return null;
    } catch (error) {
        console.error("프로필 사진 로드 실패:", error);
        return null;
    }
}

// ✅ 기사 렌더링 (최적화 - ID 수정됨)
async function renderArticles() {
    const list = getSortedArticles();
    
    // 🔥 수정: HTML ID와 일치하도록 변경
    const grid = document.getElementById("articlesGrid");
    const featured = document.getElementById("featuredArticle");  // ← 수정
    const pinnedSection = document.getElementById("pinnedSection");  // ← 수정
    const adSection = document.getElementById("adSection");
    const loadMore = document.getElementById("loadMoreContainer");

    if(!grid || !featured || !pinnedSection || !adSection || !loadMore) {
        console.error("필수 요소를 찾을 수 없습니다.");
        console.error("확인된 요소:", {
            grid: !!grid,
            featured: !!featured,
            pinnedSection: !!pinnedSection,
            adSection: !!adSection,
            loadMore: !!loadMore
        });
        return;
    }
    
    // 프로필 사진 캐시 초기화
    if(!window.profilePhotoCache) {
        window.profilePhotoCache = new Map();
    }
    
    // 광고는 한 번만 로드 (캐싱)
    if(!window.cachedAds) {
        const adsSnapshot = await db.ref("advertisements").once("value");
        const adsData = adsSnapshot.val() || {};
        window.cachedAds = Object.values(adsData).sort((a, b) => b.createdAt - a.createdAt);
    }
    const ads = window.cachedAds;

    // 고정 기사와 일반 기사 분리
    const pinsSnapshot = await db.ref("pinnedArticles").once("value");
    const pinnedData = pinsSnapshot.val() || {};
    const pinnedIds = Object.keys(pinnedData);

    const pinnedArticles = [];
    const unpinnedArticles = [];

    list.forEach(article => {
        if (pinnedIds.includes(article.id)) {
            article.pinnedAt = pinnedData[article.id].pinnedAt;
            pinnedArticles.push(article);
        } else {
            unpinnedArticles.push(article);
        }
    });

    pinnedArticles.sort((a, b) => b.pinnedAt - a.pinnedAt);

    // 광고 렌더링
    if(ads.length > 0) {
        adSection.innerHTML = ads.map(ad => `
            <div class="ad-banner" style="background:${ad.color}; border:1px solid #ddd;">
                <span class="ad-badge">광고</span>
                <h3 style="margin:5px 0; font-size:18px;">${ad.title}</h3>
                <p style="margin:5px 0; font-size:14px; color:#555;">${ad.content}</p>
                ${ad.link ? `<a href="${ad.link}" target="_blank" style="font-size:12px; text-decoration:underline;">더보기 &gt;</a>` : ''}
            </div>
        `).join('');
    } else {
        adSection.innerHTML = '';
    }

    // 기사가 없을 때
    if (list.length === 0) {
        featured.innerHTML = `<div style="text-align:center;padding:60px 20px;background:#fff;border-radius:8px;">
            <p style="color:#868e96;font-size:16px;">등록된 기사가 없습니다.</p>
        </div>`;
        grid.innerHTML = "";
        loadMore.innerHTML = "";
        pinnedSection.innerHTML = "";
        return;
    }

    // 고정 기사 렌더링
    if(pinnedArticles.length > 0) {
        const pinnedHTML = await Promise.all(pinnedArticles.map(async (a) => {
            const views = getArticleViews(a);
            const photoUrl = window.profilePhotoCache.get(a.authorEmail) || null;
            const authorPhotoHTML = getProfilePlaceholder(photoUrl, 24, a.authorEmail);
            
            return `<div class="article-card" onclick="showArticleDetail('${a.id}')" style="border-left:4px solid #ffd700;cursor:pointer;">
                <div class="article-content">
                    <span class="category-badge">${a.category}</span>
                    <span class="pinned-badge">📌 고정</span>
                    <h3 class="article-title">${a.title}</h3>
                    <div class="article-meta" style="display:flex; align-items:center; gap:8px;">
                        ${authorPhotoHTML}
                        <span style="flex:1;">${a.author}</span>
                    </div>
                </div>
            </div>`;
        }));
        
        pinnedSection.innerHTML = pinnedHTML.join('');
    } else {
        pinnedSection.innerHTML = '';
    }

    // 일반 기사 렌더링 (페이징)
    featured.innerHTML = '';
    const endIdx = currentArticlePage * ARTICLES_PER_PAGE;
    const displayArticles = unpinnedArticles.slice(0, endIdx);
    
    // 이메일 중복 제거 후 한 번에 로드
    const emails = [...new Set(displayArticles.map(a => a.authorEmail).filter(Boolean))];
    const uncachedEmails = emails.filter(email => !window.profilePhotoCache.has(email));

    if(uncachedEmails.length > 0) {
        const usersSnapshot = await db.ref("users").once("value");
        const usersData = usersSnapshot.val() || {};
        
        Object.values(usersData).forEach(userData => {
            if(userData && userData.email && uncachedEmails.includes(userData.email)) {
                window.profilePhotoCache.set(userData.email, userData.profilePhoto || null);
            }
        });
    }
    
    // HTML 생성
    const articlesHTML = displayArticles.map((a) => {
        const views = getArticleViews(a);
        const votes = getArticleVoteCounts(a);
        const photoUrl = window.profilePhotoCache.get(a.authorEmail) || null;
        const authorPhotoHTML = getProfilePlaceholder(photoUrl, 48, a.authorEmail);
    
        return `<div class="article-card" onclick="showArticleDetail('${a.id}')" style="cursor:pointer;">
            ${a.thumbnail ? `<img src="${a.thumbnail}" class="article-thumbnail" alt="썸네일">` : ''}
            <div class="article-content">
                <span class="category-badge">${a.category}</span>
                <h3 class="article-title">${a.title}</h3>
                <p class="article-summary">${a.summary||''}</p>
                <div class="article-meta" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:8px; flex:1;">
                        ${authorPhotoHTML}
                        <span>${a.author}</span>
                    </div>
                    <div class="article-stats" style="display:flex; gap:12px;">
                        <span class="stat-item">👁️ ${views}</span>
                        <span class="stat-item">👍 ${votes.likes}</span>
                    </div>
                </div>
            </div>
        </div>`;
    });
    
    grid.innerHTML = articlesHTML.join('');

    // 장식 로드
    if(typeof loadAllProfileDecorations === 'function') {
        loadAllProfileDecorations();
    }
    
    // 더보기 버튼
    if(endIdx < unpinnedArticles.length) {
        loadMore.innerHTML = `<button onclick="loadMoreArticles()" class="btn-block" style="background:#fff; border:1px solid #ddd; color:#555;">
            더 보기 (${unpinnedArticles.length - endIdx})</button>`;
    } else {
        loadMore.innerHTML = "";
    }
}

// ✅ 자유게시판 기사 렌더링 (최적화)
async function renderFreeboardArticles() {
    const list = getSortedFreeboardArticles();
    const grid = document.getElementById("freeboardGrid");
    const loadMore = document.getElementById("freeboardLoadMoreContainer");
    
    if (list.length === 0) {
        grid.innerHTML = `<div style="text-align:center;padding:60px 20px;background:#fff;border-radius:8px;">
            <p style="color:#868e96;font-size:16px;">자유게시판에 등록된 기사가 없습니다.</p>
        </div>`;
        loadMore.innerHTML = "";
        return;
    }
    
    const endIdx = currentFreeboardPage * ARTICLES_PER_PAGE;
    const displayArticles = list.slice(0, endIdx);
    
    grid.innerHTML = displayArticles.map(a => {
        const views = getArticleViews(a);
        const votes = getArticleVoteCounts(a);
        return `<div class="article-card" onclick="showArticleDetail('${a.id}')" style="cursor:pointer;">
            ${a.thumbnail ? `<img src="${a.thumbnail}" class="article-thumbnail" alt="썸네일">` : ''}
            <div class="article-content">
                <span class="category-badge">${a.category}</span>
                <h3 class="article-title">${a.title}</h3>
                <p class="article-summary">${a.summary||''}</p>
                <div class="article-meta">
                    <span>${a.author}</span>
                    <div class="article-stats">
                        <span class="stat-item">👁️ ${views}</span>
                        <span class="stat-item">👍 ${votes.likes}</span>
                    </div>
                </div>
            </div>
        </div>`}).join('');
    
    if(endIdx < list.length) {
        loadMore.innerHTML = `<button onclick="loadMoreFreeboardArticles()" class="btn-block" style="background:#fff; border:1px solid #ddd; color:#555;">
            더 보기 (${list.length - endIdx})</button>`;
    } else {
        loadMore.innerHTML = "";
    }
}

// ✅ 작성자 테마 로드 및 적용
async function loadArticleAuthorTheme(authorEmail) {
    if(!authorEmail) return;
    
    // 현재 사용자의 원래 테마/사운드 저장
    if(isLoggedIn() && !originalUserTheme) {
        const uid = getUserId();
        const [userThemeSnapshot, userSoundsSnapshot, userBGMSnapshot] = await Promise.all([
            db.ref("users/" + uid + "/activeTheme").once("value"),
            db.ref("users/" + uid + "/activeSounds").once("value"),
            db.ref("users/" + uid + "/activeBGM").once("value")
        ]);
        
        originalUserTheme = userThemeSnapshot.val() || 'default';
        window.originalUserSounds = userSoundsSnapshot.val() || false;
        window.originalUserBGM = userBGMSnapshot.val() || false;
    }
    
    try {
        const usersSnapshot = await db.ref("users").once("value");
        const usersData = usersSnapshot.val() || {};
        
        let authorUid = null;
        for (const [uid, userData] of Object.entries(usersData)) {
            if(userData && userData.email === authorEmail) {
                authorUid = uid;
                break;
            }
        }
        
        if(!authorUid) return;
        
        const inventorySnapshot = await db.ref("users/" + authorUid + "/inventory").once("value");
        const inventory = inventorySnapshot.val() || [];
        
        const hasChristmasTheme = inventory.includes('christmas_theme');
        const hasChristmasSounds = inventory.includes('christmas_sounds');
        const hasChristmasBGM = inventory.includes('christmas_bgm');
        
        // 테마 적용
        if(hasChristmasTheme) {
            const themeSnapshot = await db.ref("users/" + authorUid + "/activeTheme").once("value");
            const authorTheme = themeSnapshot.val();
            
            if(authorTheme === 'christmas') {
                console.log(`🎄 작성자의 크리스마스 테마 적용`);
                if(typeof applyTheme === 'function') {
                    applyTheme('christmas', false);
                }
            }
        }
        
        // 사운드 적용
        if(hasChristmasSounds) {
            const soundsSnapshot = await db.ref("users/" + authorUid + "/activeSounds").once("value");
            const authorSounds = soundsSnapshot.val();
            
            if(authorSounds && typeof window !== 'undefined') {
                console.log(`🔊 작성자의 크리스마스 효과음 적용`);
                window.soundEnabled = true;
            }
        }
        
        // BGM 적용
        if(hasChristmasBGM) {
            const bgmSnapshot = await db.ref("users/" + authorUid + "/activeBGM").once("value");
            const authorBGM = bgmSnapshot.val();
            
            if(authorBGM && typeof window !== 'undefined') {
                console.log(`🎵 작성자의 크리스마스 BGM 적용`);
                window.bgmEnabled = true;
                
                if(typeof initBGM === 'function') {
                    initBGM();
                }
                if(typeof playBGM === 'function') {
                    playBGM();
                }
            }
        }
        
    } catch(error) {
        console.error("❌ 작성자 테마 로드 실패:", error);
    }
}

// ✅ 사용자 테마 복원
function restoreUserTheme() {
    if(originalUserTheme) {
        console.log("🔄 사용자의 원래 설정으로 복원");
        applyTheme(originalUserTheme, false);
        
        if(typeof window.originalUserSounds !== 'undefined') {
            window.soundEnabled = window.originalUserSounds;
        }
        
        if(typeof window.originalUserBGM !== 'undefined') {
            window.bgmEnabled = window.originalUserBGM;
            if(!window.originalUserBGM && typeof stopBGM === 'function') {
                stopBGM();
            }
        }
        
        originalUserTheme = null;
        window.originalUserSounds = undefined;
        window.originalUserBGM = undefined;
    }
}

console.log("✅ Part 7 기사 렌더링 완료 (ID 불일치 수정)");

// ===== Part 8: 기사 상세보기 및 작성/수정 (최적화) =====

// ✅ 기사 상세보기 (최적화)
async function showArticleDetail(id) {
    // 1. 화면 전환 및 초기화
    hideAll();
    const detailSection = document.getElementById("articleDetailSection");
    detailSection.classList.add("active");
    
    // 이전 내용 즉시 제거
    const root = document.getElementById("articleDetail");
    root.innerHTML = `
        <div style="padding:60px 20px; text-align:center;">
            <div style="width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #c62828; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 20px;"></div>
            <p style="color:#666;">기사를 불러오는 중입니다...</p>
        </div>
    `;
    
    // 댓글 영역도 초기화
    document.getElementById("comments").innerHTML = "";
    document.getElementById("commentCount").textContent = "";

    updateURL('article', id);

    // 2. 데이터 불러오기
    try {
        const snapshot = await db.ref("articles/" + id).once("value");
        const A = snapshot.val();
        
        if(!A) { 
            alert("존재하지 않는 기사입니다!");
            showArticles();
            return;
        }
        
        // 조회수 증가 (중복 방지)
        if (currentArticleId !== id) {
            incrementView(id);
        }
        currentArticleId = id;
        currentCommentPage = 1;

        const currentUser = getNickname();
        const canEdit = isLoggedIn() && ((A.author === currentUser) || isAdmin());
        const views = getArticleViews(A);
        const votes = getArticleVoteCounts(A);
        
        // 병렬 처리로 속도 개선
        const [userVote, authorPhoto] = await Promise.all([
            checkUserVote(id),
            getUserProfilePhoto(A.authorEmail)
        ]);
        
        // 작성자의 테마/사운드 로드 및 적용
        await loadArticleAuthorTheme(A.authorEmail);
        
        // 프로필 사진 + 장식 로드
        const authorPhotoHTML = await createProfilePhotoWithDecorations(authorPhoto, 40, A.authorEmail);

        root.innerHTML = `<div style="background:#fff;padding:20px;border-radius:8px;">
            <span class="category-badge">${A.category}</span>
            <h1 style="font-size:22px;font-weight:700;margin:15px 0;line-height:1.4;">${A.title}</h1>
            
            <div class="article-meta" style="border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:20px; display:flex; align-items:center; gap:12px;">
                ${authorPhotoHTML}
                <div style="flex:1;">
                    <div style="font-weight:600; color:#202124;">${A.author}</div>
                    <div style="color:#5f6368; font-size:13px;">${A.date}</div>
                </div>
                <span style="color:#5f6368;">👁️ ${views}</span>
            </div>
            
            ${A.thumbnail ? `<img src="${A.thumbnail}" style="width:100%;border-radius:8px;margin-bottom:20px;" alt="이미지">` : ''}
            
            <div style="font-size:16px;line-height:1.8;color:#333;white-space:pre-wrap;">${A.content}</div>
            
            <div style="display:flex;gap:10px;padding-top:20px;margin-top:20px;border-top:1px solid #eee; justify-content:center;">
                <button onclick="toggleVote('${A.id}', 'like')" class="vote-btn ${userVote === 'like' ? 'active' : ''}">
                    👍 추천 ${votes.likes}
                </button>
                <button onclick="toggleVote('${A.id}', 'dislike')" class="vote-btn dislike ${userVote === 'dislike' ? 'active' : ''}">
                    👎 비추천 ${votes.dislikes}
                </button>
            </div>
            
            ${canEdit ? `<div style="margin-top:20px;text-align:right;">
                <button onclick="editArticle('${A.id}')" class="btn-secondary">수정</button>
                <button onclick="deleteArticle('${A.id}')" class="btn-danger">삭제</button>
            </div>` : ''}
        </div>`;
        
        // 프로필 사진이 포함된 댓글 로드
        loadCommentsWithProfile(id);
        
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
    db.ref("articles/" + id).once("value").then(snapshot => {
        const A = snapshot.val();
        if(!A) return alert("없는 기사!");
        
        const currentUser = getNickname();
        if(!isLoggedIn() || (A.author !== currentUser && !isAdmin())) {
            return alert("수정 권한이 없습니다!");
        }
        
        hideAll();
        document.getElementById("writeSection").classList.add("active");
        
        document.getElementById("category").value = A.category;
        document.getElementById("title").value = A.title;
        document.getElementById("summary").value = A.summary || '';
        document.getElementById("content").value = A.content;
        
        if(A.thumbnail) {
            const preview = document.getElementById('thumbnailPreview');
            const uploadText = document.getElementById('uploadText');
            preview.src = A.thumbnail;
            preview.style.display = 'block';
            uploadText.innerHTML = '<i class="fas fa-check"></i><p>기존 이미지 (클릭하여 변경)</p>';
        }
        
        setupEditForm(A, id);
    });
}

// ✅ 수정 폼 설정
function setupEditForm(article, id) {
    const form = document.getElementById("articleForm");
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    const titleInput = newForm.querySelector("#title");
    const summaryInput = newForm.querySelector("#summary");
    const contentInput = newForm.querySelector("#content");
    const warningEl = newForm.querySelector("#bannedWordWarning");
    
    function checkInputs() {
        const combinedText = (titleInput.value + " " + summaryInput.value + " " + contentInput.value);
        const foundWord = checkBannedWords(combinedText);
        
        if (foundWord) {
            warningEl.textContent = `🚫 사용할 수 없는 단어가 포함되어 있습니다: "${foundWord}"`;
            warningEl.style.display = "block";
        } else {
            warningEl.style.display = "none";
        }
    }
    
    titleInput.addEventListener("input", checkInputs);
    summaryInput.addEventListener("input", checkInputs);
    contentInput.addEventListener("input", checkInputs);
    
    const newFileInput = newForm.querySelector('#thumbnailInput');
    newFileInput.addEventListener('change', previewThumbnail);
    
    newForm.addEventListener("submit", function(e) {
        e.preventDefault();
        
        const title = titleInput.value;
        const content = contentInput.value;
        const summary = summaryInput.value;
        
        const foundWord = checkBannedWords(title + " " + content + " " + summary);
        if (foundWord) {
            alert(`⚠️ 금지어("${foundWord}")가 포함되어 있어 수정이 불가능하며, 경고 1회가 누적됩니다.`);
            addWarningToCurrentUser();
            return;
        }
        
        const fileInput = newForm.querySelector('#thumbnailInput');
        if(fileInput.files[0]) {
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
            article.category = newForm.querySelector("#category").value;
            article.title = title;
            article.summary = summary;
            article.content = content;
            article.date = new Date().toLocaleString() + " (수정됨)";
            
            saveArticle(article, () => {
                newForm.reset();
                document.getElementById('thumbnailPreview').style.display = 'none';
                document.getElementById('uploadText').innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
                warningEl.style.display = "none";
                alert("기사가 수정되었습니다!");
                showArticleDetail(id);
            });
        }
    });
}

// ✅ 인네일 미리보기
function previewThumbnail(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('thumbnailPreview');
            const uploadText = document.getElementById('uploadText');
            preview.src = e.target.result;
            preview.style.display = 'block';
            uploadText.innerHTML = '<i class="fas fa-check"></i><p>이미지 선택됨 (클릭하여 변경)</p>';
        };
        reader.readAsDataURL(file);
    }
}

// ✅ 기사 작성 폼 설정 (최적화)
function setupArticleForm() {
    const form = document.getElementById("articleForm");
    if(!form) return;
    
    // 기존 이벤트 리스너 제거를 위한 새 폼으로 교체
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    const titleInput = newForm.querySelector("#title");
    const summaryInput = newForm.querySelector("#summary");
    const contentInput = newForm.querySelector("#content");
    const warningEl = newForm.querySelector("#bannedWordWarning");
    
    // 폼 초기화
    newForm.reset();
    const preview = document.getElementById('thumbnailPreview');
    const uploadText = document.getElementById('uploadText');
    if(preview) preview.style.display = 'none';
    if(uploadText) uploadText.innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
    
    function checkInputs() {
        const combinedText = (titleInput.value + " " + summaryInput.value + " " + contentInput.value);
        const foundWord = checkBannedWords(combinedText);
        
        if (foundWord) {
            warningEl.textContent = `금지어가 포함되어 있습니다: "${foundWord}"`;
            warningEl.style.display = "block";
        } else {
            warningEl.style.display = "none";
        }
    }
    
    titleInput.addEventListener("input", checkInputs);
    summaryInput.addEventListener("input", checkInputs);
    contentInput.addEventListener("input", checkInputs);
    
    const fileInput = newForm.querySelector('#thumbnailInput');
    fileInput.addEventListener('change', previewThumbnail);
    
    // async 함수로 변경
    newForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        if(!isLoggedIn()) {
            alert("기사 작성은 로그인 후 가능합니다!");
            return;
        }

        const title = titleInput.value;
        const content = contentInput.value;
        const summary = summaryInput.value;

        const foundWord = checkBannedWords(title + " " + content + " " + summary);
        if (foundWord) {
            alert(`금지어("${foundWord}")가 포함되어 업로드가 차단되고 경고 1회가 누적됩니다.`);
            addWarningToCurrentUser();
            return;
        }
        
        const A = {
            id: Date.now().toString(),
            category: newForm.querySelector("#category").value,
            title: title,
            summary: summary,
            content: content,
            author: getNickname(),
            authorEmail: getUserEmail(),
            date: new Date().toLocaleString(),
            createdAt: Date.now(), 
            views: 0,
            likeCount: 0,
            dislikeCount: 0,
            thumbnail: null
        };
        
        if(fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                A.thumbnail = e.target.result;
                saveArticle(A, async () => {
                    newForm.reset();
                    document.getElementById('thumbnailPreview').style.display = 'none';
                    document.getElementById('uploadText').innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
                    warningEl.style.display = "none";
                    alert("기사가 발행되었습니다!");
                    
                    // 알림 전송
                    await sendNotification('article', {
                        authorEmail: A.authorEmail,
                        authorName: A.author,
                        title: A.title,
                        articleId: A.id
                    });
                    
                    // 포인트 지급
                    await updateUserMoney(5, "기사 작성");
                    
                    showArticles();
                });
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveArticle(A, async () => {
                newForm.reset();
                document.getElementById('thumbnailPreview').style.display = 'none';
                document.getElementById('uploadText').innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
                warningEl.style.display = "none";
                alert("기사가 발행되었습니다!");
                
                // 알림 전송
                await sendNotification('article', {
                    authorEmail: A.authorEmail,
                    authorName: A.author,
                    title: A.title,
                    articleId: A.id
                });
                
                // 포인트 지급
                await updateUserMoney(5, "기사 작성");
                
                showArticles();
            });
        }
    });
}

// ✅ 글 작성 도구 삽입 함수
function insertTextFormat(format) {
    const textarea = document.getElementById("content");
    if(!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    let formattedText = selectedText;
    
    switch(format) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'underline':
            formattedText = `__${selectedText}__`;
            break;
        case 'h1':
            formattedText = `# ${selectedText}`;
            break;
        case 'h2':
            formattedText = `## ${selectedText}`;
            break;
        case 'bullet':
            formattedText = `• ${selectedText}`;
            break;
        case 'number':
            formattedText = `1. ${selectedText}`;
            break;
        case 'quote':
            formattedText = `> ${selectedText}`;
            break;
        case 'link':
            const url = prompt("링크 URL을 입력하세요:", "https://");
            if(url) formattedText = `[${selectedText || '링크 텍스트'}](${url})`;
            break;
    }
    
    textarea.value = beforeText + formattedText + afterText;
    textarea.focus();
    
    // 커서 위치 조정
    const newPos = start + formattedText.length;
    textarea.setSelectionRange(newPos, newPos);
}

// ✅ 글 작성 도구바 HTML 생성
function getEditorToolbar() {
    return `
        <div class="editor-toolbar" style="background:#f8f9fa; padding:10px; border-radius:8px; margin-bottom:15px; display:flex; gap:8px; flex-wrap:wrap; border:1px solid #dee2e6;">
            <button type="button" onclick="insertTextFormat('bold')" class="editor-btn" title="굵게">
                <i class="fas fa-bold"></i>
            </button>
            <button type="button" onclick="insertTextFormat('italic')" class="editor-btn" title="기울임">
                <i class="fas fa-italic"></i>
            </button>
            <button type="button" onclick="insertTextFormat('underline')" class="editor-btn" title="밑줄">
                <i class="fas fa-underline"></i>
            </button>
            <div style="width:1px; background:#dee2e6; margin:0 5px;"></div>
            <button type="button" onclick="insertTextFormat('h1')" class="editor-btn" title="제목 1">
                <strong>H1</strong>
            </button>
            <button type="button" onclick="insertTextFormat('h2')" class="editor-btn" title="제목 2">
                <strong>H2</strong>
            </button>
            <div style="width:1px; background:#dee2e6; margin:0 5px;"></div>
            <button type="button" onclick="insertTextFormat('bullet')" class="editor-btn" title="글머리 기호">
                <i class="fas fa-list-ul"></i>
            </button>
            <button type="button" onclick="insertTextFormat('number')" class="editor-btn" title="번호 매기기">
                <i class="fas fa-list-ol"></i>
            </button>
            <button type="button" onclick="insertTextFormat('quote')" class="editor-btn" title="인용">
                <i class="fas fa-quote-right"></i>
            </button>
            <div style="width:1px; background:#dee2e6; margin:0 5px;"></div>
            <button type="button" onclick="insertTextFormat('link')" class="editor-btn" title="링크 삽입">
                <i class="fas fa-link"></i>
            </button>
        </div>
        <style>
            .editor-btn {
                background: white;
                border: 1px solid #ced4da;
                border-radius: 4px;
                padding: 6px 10px;
                cursor: pointer;
                font-size: 14px;
                color: #495057;
                transition: all 0.2s;
                min-width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .editor-btn:hover {
                background: #e9ecef;
                border-color: #adb5bd;
            }
            .editor-btn:active {
                background: #dee2e6;
            }
        </style>
    `;
}

// ✅ 기사 작성 폼 설정 (최적화 + 에디터 추가)
function setupArticleForm() {
    const form = document.getElementById("articleForm");
    if(!form) return;
    
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    const titleInput = newForm.querySelector("#title");
    const summaryInput = newForm.querySelector("#summary");
    const contentInput = newForm.querySelector("#content");
    const warningEl = newForm.querySelector("#bannedWordWarning");
    
    // 폼 초기화
    newForm.reset();
    const preview = document.getElementById('thumbnailPreview');
    const uploadText = document.getElementById('uploadText');
    if(preview) preview.style.display = 'none';
    if(uploadText) uploadText.innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
    
    function checkInputs() {
        const combinedText = (titleInput.value + " " + summaryInput.value + " " + contentInput.value);
        const foundWord = checkBannedWords(combinedText);
        
        if (foundWord) {
            warningEl.textContent = `금지어가 포함되어 있습니다: "${foundWord}"`;
            warningEl.style.display = "block";
        } else {
            warningEl.style.display = "none";
        }
    }
    
    titleInput.addEventListener("input", checkInputs);
    summaryInput.addEventListener("input", checkInputs);
    contentInput.addEventListener("input", checkInputs);
    
    const fileInput = newForm.querySelector('#thumbnailInput');
    fileInput.addEventListener('change', previewThumbnail);
    
    newForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        if(!isLoggedIn()) {
            alert("기사 작성은 로그인 후 가능합니다!");
            return;
        }

        const title = titleInput.value;
        const content = contentInput.value;
        const summary = summaryInput.value;

        const foundWord = checkBannedWords(title + " " + content + " " + summary);
        if (foundWord) {
            alert(`금지어("${foundWord}")가 포함되어 업로드가 차단되고 경고 1회가 누적됩니다.`);
            addWarningToCurrentUser();
            return;
        }
        
        const A = {
            id: Date.now().toString(),
            category: newForm.querySelector("#category").value,
            title: title,
            summary: summary,
            content: content,
            author: getNickname(),
            authorEmail: getUserEmail(),
            date: new Date().toLocaleString(),
            createdAt: Date.now(), 
            views: 0,
            likeCount: 0,
            dislikeCount: 0,
            thumbnail: null
        };
        
        if(fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                A.thumbnail = e.target.result;
                saveArticle(A, async () => {
                    newForm.reset();
                    document.getElementById('thumbnailPreview').style.display = 'none';
                    document.getElementById('uploadText').innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
                    warningEl.style.display = "none";
                    alert("기사가 발행되었습니다!");
                    
                    await sendNotification('article', {
                        authorEmail: A.authorEmail,
                        authorName: A.author,
                        title: A.title,
                        articleId: A.id
                    });
                    
                    await updateUserMoney(5, "기사 작성");
                    
                    showArticles();
                });
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveArticle(A, async () => {
                newForm.reset();
                document.getElementById('thumbnailPreview').style.display = 'none';
                document.getElementById('uploadText').innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
                warningEl.style.display = "none";
                alert("기사가 발행되었습니다!");
                
                await sendNotification('article', {
                    authorEmail: A.authorEmail,
                    authorName: A.author,
                    title: A.title,
                    articleId: A.id
                });
                
                await updateUserMoney(5, "기사 작성");
                
                showArticles();
            });
        }
    });
}

// ✅ 작성 페이지 표시 (에디터 도구바 추가)
function showWritePage() {
    if(!isLoggedIn()) { 
        alert("기사 작성은 로그인 후 가능합니다!"); 
        googleLogin(); 
        return; 
    }
    
    hideAll();
    window.scrollTo(0, 0);
    
    const section = document.getElementById("writeSection");
    if(!section) return;
    
    section.classList.add("active");
    
    // 에디터 도구바 추가된 HTML
    section.innerHTML = `
        <div class="section-header">
            <h2>✏️ 기사 작성</h2>
        </div>
        
        <form id="articleForm" class="write-form">
            <div class="form-group">
                <label>카테고리</label>
                <select id="category" class="form-control">
                    <option>자유게시판</option>
                    <option>논란</option>
                    <option>저격</option>
                    <option>비난</option>
                    <option>연애</option>
                    <option>정아영</option>
                    <option>게넥도</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>제목</label>
                <input id="title" class="form-control" required placeholder="기사 제목을 입력하세요">
            </div>
            
            <div class="form-group">
                <label>썸네일 이미지</label>
                <div class="image-upload-area" onclick="document.getElementById('thumbnailInput').click()">
                    <div id="uploadText">
                        <i class="fas fa-camera"></i>
                        <p>클릭하여 이미지 업로드</p>
                    </div>
                    <img id="thumbnailPreview" class="image-preview" style="display:none;">
                </div>
                <input type="file" id="thumbnailInput" accept="image/*" style="display:none;">
            </div>
            
            <div class="form-group">
                <label>요약 (선택)</label>
                <input id="summary" class="form-control" placeholder="기사 요약">
            </div>
            
            <div class="form-group">
                <label>내용</label>
                ${getEditorToolbar()}
                <textarea id="content" class="form-control" required placeholder="기사 내용을 입력하세요" style="min-height:300px;"></textarea>
                <small style="color:#6c757d; font-size:12px; margin-top:5px; display:block;">
                    💡 팁: **굵게**, *기울임*, __밑줄__, # 제목, [링크](URL) 형식을 지원합니다.
                </small>
            </div>
            
            <div id="bannedWordWarning" class="warning-box"></div>
            
            <button type="submit" class="btn-primary btn-block">
                <i class="fas fa-paper-plane"></i> 발행하기
            </button>
        </form>
    `;
    
    setupArticleForm();
    updateURL('write');
}

console.log("✅ Part 8 수정 완료 (에디터 도구 추가)");

// ===== Part 9: 댓글 관리 및 대댓글 시스템 (최적화) =====

// ✅ 댓글 로드 (프로필 사진 포함, 최적화)
async function loadCommentsWithProfile(id) {
    const currentUser = getNickname();
    const currentEmail = getUserEmail();
    
    try {
        const snapshot = await db.ref("comments/" + id).once("value");
        const val = snapshot.val() || {};
        const commentsList = Object.entries(val).sort((a,b) => new Date(b[1].timestamp) - new Date(a[1].timestamp));
        
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

        // 댓글 작성자 이메일 수집
        const emails = [...new Set(displayComments.map(([_, comment]) => comment.authorEmail).filter(Boolean))];
        
        // 답글 작성자 이메일도 수집
        displayComments.forEach(([_, comment]) => {
            if (comment.replies) {
                Object.values(comment.replies).forEach(reply => {
                    if (reply.authorEmail) emails.push(reply.authorEmail);
                });
            }
        });

        // 중복 제거 및 캐시되지 않은 이메일만 로드
        const uniqueEmails = [...new Set(emails)];
        const uncachedEmails = uniqueEmails.filter(email => !window.profilePhotoCache.has(email));

        if (uncachedEmails.length > 0) {
            const usersSnapshot = await db.ref("users").once("value");
            const usersData = usersSnapshot.val() || {};
            
            Object.values(usersData).forEach(userData => {
                if (userData && userData.email && uncachedEmails.includes(userData.email)) {
                    window.profilePhotoCache.set(userData.email, userData.profilePhoto || null);
                }
            });
        }

        // 댓글 렌더링
        const commentsHTML = displayComments.map(([commentId, comment]) => {
            const isMyComment = isLoggedIn() && ((comment.authorEmail === currentEmail) || isAdmin());
            const photoUrl = window.profilePhotoCache.get(comment.authorEmail) || null;
            const authorPhotoHTML = getProfilePlaceholder(photoUrl, 32, comment.authorEmail);
            
            let repliesHTML = '';
            if (comment.replies) {
                const replies = Object.entries(comment.replies).sort((a, b) => new Date(a[1].timestamp) - new Date(b[1].timestamp));
                
                repliesHTML = replies.map(([replyId, reply]) => {
                    const isMyReply = isLoggedIn() && ((reply.authorEmail === currentEmail) || isAdmin());
                    const replyPhotoUrl = window.profilePhotoCache.get(reply.authorEmail) || null;
                    const replyPhotoHTML = getProfilePlaceholder(replyPhotoUrl, 24, reply.authorEmail);
                    
                    return `
                        <div class="reply-item" id="reply-${replyId}">
                            <div class="reply-header">
                                ${replyPhotoHTML}
                                <span class="reply-author">↳ ${reply.author}</span>
                                <span class="reply-time">${reply.timestamp}</span>
                            </div>
                            <div class="reply-content">${reply.text}</div>
                            ${isMyReply ? `
                                <div class="reply-actions">
                                    <button onclick="deleteReply('${id}', '${commentId}', '${replyId}')" class="btn-text-danger">삭제</button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');
            }

            return `
                <div class="comment-card" id="comment-${commentId}">
                    <div class="comment-header">
                        ${authorPhotoHTML}
                        <span class="comment-author">${comment.author}</span>
                        <span class="comment-time">${comment.timestamp}</span>
                    </div>
                    <div class="comment-body">${comment.text}</div>
                    
                    <div class="comment-footer">
                        <button onclick="toggleReplyForm('${commentId}')" class="btn-text">💬 답글</button>
                        ${isMyComment ? `
                            <button onclick="deleteComment('${id}', '${commentId}', '${comment.author}')" class="btn-text text-danger">삭제</button>
                        ` : ''}
                    </div>

                    <div class="replies-container">
                        ${repliesHTML}
                    </div>

                    <div id="replyForm-${commentId}" class="reply-input-area" style="display:none;">
                        <input type="text" id="replyInput-${commentId}" class="reply-input" placeholder="답글을 입력하세요..." onkeypress="if(event.key==='Enter') submitReply('${id}', '${commentId}')">
                        <button onclick="submitReply('${id}', '${commentId}')" class="btn-reply-submit"><i class="fas fa-paper-plane"></i></button>
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

// ✅ 기본 댓글 로드 (호환성)
function loadComments(id) {
    loadCommentsWithProfile(id);
}

// ✅ 댓글 더보기
function loadMoreComments() {
    currentCommentPage++;
    loadComments(currentArticleId);
}

// ✅ 댓글 제출 (상세 페이지에서)
function submitCommentFromDetail() {
    submitComment(currentArticleId);
}

// ✅ 댓글 제출 (최적화)
async function submitComment(id){
    if(!isLoggedIn()) {
        alert("댓글 작성은 로그인 후 가능합니다!");
        return;
    }
    
    const txt = document.getElementById("commentInput").value.trim();
    if(!txt) return alert("댓글 내용을 입력해주세요!");
    
    const foundWord = checkBannedWords(txt);
    if (foundWord) {
        alert(`⚠️ 금지어("${foundWord}")가 포함되어 등록할 수 없으며, 경고 1회가 누적됩니다.`);
        addWarningToCurrentUser();
        return;
    }

    const cid = Date.now().toString();
    const C = {
        author: getNickname(),
        authorEmail: getUserEmail(),
        text: txt,
        timestamp: new Date().toLocaleString()
    };
    
    try {
        await db.ref("comments/" + id + "/" + cid).set(C);
        
        // 기사 작성자 정보 가져오기
        const articleSnapshot = await db.ref("articles/" + id).once("value");
        const article = articleSnapshot.val();
        
        if(article) {
            // 팔로워에게 알림
            await sendNotification('comment', {
                authorEmail: C.authorEmail,
                authorName: C.author,
                content: txt,
                articleId: id
            });
            
            // 기사 작성자에게 알림 (자기 자신이 아닐 경우)
            if(article.authorEmail !== C.authorEmail) {
                await sendNotification('myArticleComment', {
                    articleAuthorEmail: article.authorEmail,
                    commenterEmail: C.authorEmail,
                    commenterName: C.author,
                    content: txt,
                    articleId: id
                });
            }
        }
        
        // 포인트 지급
        await updateUserMoney(2, "댓글 작성");
        
        document.getElementById("commentInput").value = "";
        currentCommentPage = 1;
        loadComments(id);
        
    } catch(error) {
        console.error("댓글 작성 실패:", error);
        alert("댓글 작성 중 오류가 발생했습니다.");
    }
}

// ✅ 댓글 수정
function editComment(aid, cid, author){
    const currentUser = getNickname();
    if(!isLoggedIn() || (author !== currentUser && !isAdmin())) {
        return alert("수정 권한이 없습니다!");
    }
    
    db.ref("comments/" + aid + "/" + cid).once("value").then(s => {
        const comment = s.val();
        if(!comment) return;
        
        const newText = prompt("댓글 수정", comment.text);
        if(newText === null || newText.trim() === "") return;
        
        const foundWord = checkBannedWords(newText);
        if(foundWord) {
            alert(`⚠️ 금지어("${foundWord}")가 포함되어 수정할 수 없습니다.`);
            return;
        }

        comment.text = newText.trim();
        comment.timestamp = new Date().toLocaleString() + " (수정됨)";
        db.ref("comments/" + aid + "/" + cid).set(comment);
        loadComments(aid);
    });
}

// ✅ 댓글 삭제
function deleteComment(aid, cid, author){
    const currentUser = getNickname();
    if(!isLoggedIn() || (author !== currentUser && !isAdmin())) {
        return alert("삭제 권한이 없습니다!");
    }
    
    if(!confirm("정말 이 댓글을 삭제하시겠습니까?")) return;
    
    db.ref("comments/" + aid + "/" + cid).remove().then(() => {
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
    
    if(!text) return;
    
    const foundWord = checkBannedWords(text);
    if(foundWord) {
        alert(`금지어("${foundWord}")가 포함되어 있습니다.`);
        return;
    }

    const reply = {
        author: getNickname(),
        authorEmail: getUserEmail(),
        text: text,
        timestamp: new Date().toLocaleString()
    };

    try {
        await db.ref(`comments/${articleId}/${commentId}/replies`).push(reply);
        
        // 원 댓글 작성자에게 알림
        const parentCommentSnap = await db.ref(`comments/${articleId}/${commentId}`).once('value');
        const parentComment = parentCommentSnap.val();
        
        if(parentComment && parentComment.authorEmail !== reply.authorEmail) {
            await sendNotification('comment', {
                authorEmail: reply.authorEmail,
                authorName: reply.author,
                content: `회원님의 댓글에 답글: "${text}"`,
                articleId: articleId
            });
        }
        
        input.value = "";
        document.getElementById(`replyForm-${commentId}`).style.display = 'none';
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
        loadComments(articleId);
    } catch(error) {
        alert("삭제 실패: " + error.message);
    }
}

console.log("✅ Part 9 댓글 시스템 완료");

// ===== Part 10: 팝업 및 패치노트 시스템 (최적화) =====

// ✅ 팝업 관리 UI 표시 (최적화)
async function showPopupManager() {
    if(!isAdmin()) return alert("관리자 권한이 필요합니다!");
    
    hideAll();
    document.getElementById("userManagementSection").classList.add("active");
    
    const usersList = document.getElementById("usersList");
    if(!usersList) return;
    
    usersList.innerHTML = '<p style="text-align:center;color:#868e96;">로딩 중...</p>';
    
    const popupsSnapshot = await db.ref("popups").once("value");
    const popupsData = popupsSnapshot.val() || {};
    const popups = Object.entries(popupsData)
        .map(([id, data]) => ({id, ...data}))
        .sort((a, b) => b.createdAt - a.createdAt);
    
    usersList.innerHTML = `
        <div style="margin-bottom:30px;">
            <h3 style="color:#c62828;margin-bottom:20px;">📢 팝업 관리</h3>
            <button onclick="openPopupCreateModal()" class="btn btn-primary" style="width:100%;margin-bottom:20px;">
                ➕ 새 팝업 만들기
            </button>
            
            <div style="background:#fff3cd;padding:15px;border-radius:8px;margin-bottom:20px;border-left:4px solid #856404;">
                <p style="margin:0;color:#856404;font-size:14px;">
                    <strong>ℹ️ 안내:</strong> 팝업은 사용자가 사이트에 접속할 때 자동으로 표시됩니다. 
                    중요한 공지사항이나 이벤트 알림에 활용하세요.
                </p>
            </div>
        </div>
        
        <div>
            <h4 style="margin-bottom:15px;">등록된 팝업 목록</h4>
            ${popups.length === 0 ? 
                '<p style="text-align:center;color:#868e96;padding:30px;">등록된 팝업이 없습니다.</p>' :
                popups.map(popup => `
                    <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:15px;border-left:4px solid ${popup.isActive ? '#28a745' : '#6c757d'};">
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">
                            <div style="flex:1;">
                                <h5 style="margin:0 0 8px 0;color:#212529;font-size:18px;">
                                    ${popup.title}
                                    ${popup.isActive ? 
                                        '<span style="background:#28a745;color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;margin-left:8px;">활성화</span>' :
                                        '<span style="background:#6c757d;color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;margin-left:8px;">비활성화</span>'
                                    }
                                </h5>
                                <p style="margin:0;color:#6c757d;font-size:13px;">
                                    작성: ${popup.createdBy} | ${new Date(popup.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div style="background:#fff;padding:15px;border-radius:6px;margin-bottom:15px;max-height:100px;overflow:auto;">
                            <p style="margin:0;color:#495057;font-size:14px;white-space:pre-wrap;">${popup.content}</p>
                        </div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            <button onclick="togglePopupStatus('${popup.id}', ${!popup.isActive})" class="btn ${popup.isActive ? 'btn-gray' : 'btn-green'}" style="font-size:12px;">
                                ${popup.isActive ? '비활성화' : '활성화'}
                            </button>
                            <button onclick="editPopup('${popup.id}')" class="btn btn-blue" style="font-size:12px;">수정</button>
                            <button onclick="deletePopup('${popup.id}')" class="btn btn-dark" style="font-size:12px;">삭제</button>
                        </div>
                    </div>
                `).join('')
            }
        </div>
    `;
}

// ✅ 팝업 생성 모달 열기
function openPopupCreateModal() {
    const modalHTML = `
        <div id="popupCreateModal" class="modal active">
            <div class="modal-content" style="max-width:700px;">
                <h3 style="margin-bottom:20px;color:#c62828;">📢 팝업 만들기</h3>
                <form id="popupCreateForm">
                    <div class="form-group">
                        <label class="form-label" for="popupTitle">팝업 제목</label>
                        <input id="popupTitle" class="form-control" required placeholder="예: 중요 공지사항">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="popupContent">팝업 내용</label>
                        <textarea id="popupContent" class="form-control" required placeholder="사용자에게 표시할 내용을 입력하세요" style="min-height:200px;"></textarea>
                    </div>
                    <div class="form-group">
                        <label style="display:flex;align-items:center;cursor:pointer;">
                            <input type="checkbox" id="popupActive" checked style="width:20px;height:20px;margin-right:10px;">
                            <span style="font-weight:600;color:#212529;">즉시 활성화</span>
                        </label>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%;margin-bottom:10px;">팝업 생성</button>
                    <button type="button" onclick="closePopupCreateModal()" class="btn btn-gray" style="width:100%;">취소</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById("popupCreateForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        await createPopup();
    });
}

function closePopupCreateModal() {
    const modal = document.getElementById("popupCreateModal");
    if(modal) modal.remove();
}

// ✅ 팝업 생성
async function createPopup() {
    const title = document.getElementById("popupTitle").value.trim();
    const content = document.getElementById("popupContent").value.trim();
    const isActive = document.getElementById("popupActive").checked;
    
    if(!title || !content) {
        return alert("제목과 내용을 모두 입력해주세요!");
    }
    
    const popup = {
        id: Date.now().toString(),
        title: title,
        content: content,
        isActive: isActive,
        createdAt: Date.now(),
        createdBy: getNickname()
    };
    
    try {
        await db.ref("popups/" + popup.id).set(popup);
        alert("팝업이 생성되었습니다!");
        closePopupCreateModal();
        showPopupManager();
    } catch(error) {
        alert("생성 실패: " + error.message);
    }
}

// ✅ 팝업 활성화/비활성화
async function togglePopupStatus(popupId, newStatus) {
    if(!isAdmin()) return;
    
    try {
        await db.ref("popups/" + popupId + "/isActive").set(newStatus);
        alert(newStatus ? "팝업이 활성화되었습니다!" : "팝업이 비활성화되었습니다!");
        showPopupManager();
    } catch(error) {
        alert("상태 변경 실패: " + error.message);
    }
}

// ✅ 팝업 수정
async function editPopup(popupId) {
    const snapshot = await db.ref("popups/" + popupId).once("value");
    const popup = snapshot.val();
    if(!popup) return;
    
    const modalHTML = `
        <div id="popupEditModal" class="modal active">
            <div class="modal-content" style="max-width:700px;">
                <h3 style="margin-bottom:20px;color:#c62828;">✏️ 팝업 수정</h3>
                <form id="popupEditForm">
                    <div class="form-group">
                        <label class="form-label" for="editPopupTitle">팝업 제목</label>
                        <input id="editPopupTitle" class="form-control" required value="${popup.title}">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="editPopupContent">팝업 내용</label>
                        <textarea id="editPopupContent" class="form-control" required style="min-height:200px;">${popup.content}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%;margin-bottom:10px;">수정 완료</button>
                    <button type="button" onclick="closePopupEditModal()" class="btn btn-gray" style="width:100%;">취소</button>
                </form>
            </div>
        </div>
    `;

    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById("popupEditForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const newTitle = document.getElementById("editPopupTitle").value.trim();
        const newContent = document.getElementById("editPopupContent").value.trim();
        
        if(!newTitle || !newContent) {
            return alert("제목과 내용을 모두 입력해주세요!");
        }
        
        try {
            await db.ref("popups/" + popupId).update({
                title: newTitle,
                content: newContent
            });
            alert("팝업이 수정되었습니다!");
            closePopupEditModal();
            showPopupManager();
        } catch(error) {
            alert("수정 실패: " + error.message);
        }
    });
}

function closePopupEditModal() {
    const modal = document.getElementById("popupEditModal");
    if(modal) modal.remove();
}

// ✅ 팝업 삭제
async function deletePopup(popupId) {
    if(!confirm("이 팝업을 삭제하시겠습니까?")) return;
    
    try {
        await db.ref("popups/" + popupId).remove();
        alert("팝업이 삭제되었습니다!");
        showPopupManager();
    } catch(error) {
        alert("삭제 실패: " + error.message);
    }
}

// ✅ 사용자용: 활성화된 팝업 표시
async function showActivePopupsToUser() {
    const popupsSnapshot = await db.ref("popups").once("value");
    const popupsData = popupsSnapshot.val() || {};
    
    const activePopups = Object.values(popupsData)
        .filter(popup => popup.isActive)
        .sort((a, b) => b.createdAt - a.createdAt);
    
    if(activePopups.length === 0) return;
    
    const popup = activePopups[0];
    
    const seenPopups = getCookie("seen_popups");
    if(seenPopups && seenPopups.includes(popup.id)) return;
    
    const modalHTML = `
        <div id="userPopupModal" class="modal active" style="z-index:10000;">
            <div class="modal-content" style="max-width:600px;animation:slideDown 0.3s ease;">
                <div style="background:linear-gradient(135deg, #c62828 0%, #b71c1c 100%);color:#fff;padding:20px;border-radius:8px 8px 0 0;margin:-30px -30px 20px -30px;">
                    <h3 style="margin:0;font-size:24px;">📢 ${popup.title}</h3>
                </div>
                <div style="padding:0 10px;max-height:400px;overflow-y:auto;">
                    <p style="white-space:pre-wrap;line-height:1.8;color:#212529;font-size:15px;">${popup.content}</p>
                </div>
                <div style="margin-top:30px;display:flex;gap:10px;">
                    <button onclick="closeUserPopup('${popup.id}', true)" class="btn btn-gray" style="flex:1;">다시 보지 않기</button>
                    <button onclick="closeUserPopup('${popup.id}', false)" class="btn btn-primary" style="flex:1;">확인</button>
                </div>
            </div>
        </div>
        <style>
            @keyframes slideDown {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeUserPopup(popupId, neverShowAgain) {
    const modal = document.getElementById("userPopupModal");
    if(modal) modal.remove();
    
    if(neverShowAgain) {
        const seenPopups = getCookie("seen_popups") || "";
        const newSeen = seenPopups ? seenPopups + "," + popupId : popupId;
        
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 10);
        document.cookie = `seen_popups=${newSeen};expires=${expires.toUTCString()};path=/`;
    }
}

// 🔥 QnA 탭 표시 (추가)
window.showQnATab = function() {
    document.getElementById("qnaTabBtn").classList.add("active");
    document.getElementById("patchTabBtn").classList.remove("active");
    document.getElementById("qnaList").style.display = "block";
    document.getElementById("patchNotesContainer").style.display = "none";
}

// 🔥 패치노트 탭 표시 (추가)
window.showPatchNotesTab = function() {
    document.getElementById("qnaTabBtn").classList.remove("active");
    document.getElementById("patchTabBtn").classList.add("active");
    document.getElementById("qnaList").style.display = "none";
    
    const container = document.getElementById("patchNotesContainer");
    container.style.display = "block";
    
    // 패치노트 로드
    loadPatchNotesToContainer(container);
}

// ✅ 패치노트 페이지 표시
function showPatchNotesPage() {
    hideAll();
    document.getElementById("patchnotesSection").classList.add("active");
    loadPatchNotesToContainer(document.getElementById("patchNotesList"));
    
    updateURL('patchnotes');
}

// ✅ 패치노트 로드 및 렌더링
function loadPatchNotesToContainer(container) {
    container.innerHTML = '<div style="text-align:center; padding:20px;">로딩 중...</div>';

    db.ref('patchNotes').orderByChild('date').once('value').then(snapshot => {
        container.innerHTML = '';
        
        // 관리자용 작성 버튼
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

// ✅ 패치노트 작성/수정 모달 열기
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
    } else if(document.getElementById("qnaSection").classList.contains("active")) {
        showPatchNotesTab();
    }
}

// ✅ 패치노트 삭제
window.deletePatchNote = function(id) {
    if(!isAdmin()) return;
    if(confirm('정말 삭제하시겠습니까?')) {
        db.ref('patchNotes/' + id).remove().then(() => {
            if(document.getElementById("patchnotesSection").classList.contains("active")) {
                showPatchNotesPage();
            } else if(document.getElementById("qnaSection").classList.contains("active")) {
                showPatchNotesTab();
            }
        });
    }
}

console.log("✅ Part 10 팝업/패치노트 완료");

// ===== Part 11: 관리자 이벤트 및 기능 관리 (기사 고정/광고 관리 수정) =====

// ✅ VIP/관리자 메뉴 메인
window.showAdminEvent = async function() {
    if(!isLoggedIn()) return alert("로그인이 필요합니다.");
    
    const uid = getUserId();
    const snap = await db.ref("users/" + uid).once("value");
    const userData = snap.val() || {};
    const isVIP = userData.isVIP || false;

    if (!isAdmin() && !isVIP) {
        alert("접근 권한이 없습니다.");
        return;
    }

    hideAll();
    let section = document.getElementById("adminEventSection");
    if (!section) {
        // 🔥 수정: main이 없을 경우 body 사용
        const container = document.querySelector("main") || document.body;
        section = document.createElement("div");
        section.id = "adminEventSection";
        section.className = "page-section";
        container.appendChild(section);
    }
    section.classList.add("active");
    updateURL('admin');

    section.innerHTML = `
        <div style="max-width:800px; margin:0 auto; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <h2 style="color:#c62828; margin:0;"><i class="fas fa-crown"></i> VIP & 관리자 전용</h2>
                <button onclick="showMoreMenu()" class="btn-secondary">
                    <i class="fas fa-arrow-left"></i> 뒤로
                </button>
            </div>

            <div class="admin-event-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:20px;">
                
                <!-- 기사 고정 관리 -->
                <button onclick="showPinnedArticlesManager()" class="event-card" style="padding:25px; border:2px solid #f57c00; border-radius:12px; background:white; text-align:center; cursor:pointer; transition:all 0.3s;">
                    <i class="fas fa-thumbtack" style="font-size:48px; color:#f57c00; margin-bottom:15px;"></i>
                    <div style="font-weight:bold; font-size:16px; margin-bottom:8px;">기사 고정 관리</div>
                    <div style="font-size:13px; color:#666;">상단 고정 기사 설정</div>
                </button>
                
                <!-- 광고 관리 -->
                <button onclick="showAdvertisementManager()" class="event-card" style="padding:25px; border:2px solid #4caf50; border-radius:12px; background:white; text-align:center; cursor:pointer; transition:all 0.3s;">
                    <i class="fas fa-ad" style="font-size:48px; color:#4caf50; margin-bottom:15px;"></i>
                    <div style="font-weight:bold; font-size:16px; margin-bottom:8px;">광고 관리</div>
                    <div style="font-size:13px; color:#666;">배너 광고 등록/수정</div>
                </button>
            </div>
            
            <div style="margin-top:30px; background:#f8f9fa; padding:20px; border-radius:8px; font-size:14px; color:#666; line-height:1.8;">
                <strong>📌 안내사항</strong><br>
                • VIP 등급 이상 사용자와 관리자만 접근 가능합니다.<br>
                • 모든 작업은 로그로 기록되며, 부적절한 사용 시 권한이 제한될 수 있습니다.<br>
                ${isAdmin() ? '• 관리자는 모든 기능에 접근할 수 있습니다.' : '• VIP는 일부 기능에 제한이 있을 수 있습니다.'}
            </div>
        </div>
    `;
}


// ✅ 기사 고정 관리 페이지 (완전 수정)
window.showPinnedArticlesManager = async function() {
    hideAll();
    let section = document.getElementById("pinnedArticlesSection");
    if(!section) {
        section = document.createElement("div");
        section.id = "pinnedArticlesSection";
        section.className = "page-section";
        document.querySelector("main").appendChild(section);
    }
    section.classList.add("active");
    
    section.innerHTML = '<div style="text-align:center; padding:40px;"><div style="width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #c62828; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 20px;"></div><p>로딩 중...</p></div>';
    
    try {
        console.log("📌 기사 고정 관리 - 데이터 로드 시작");
        
        // 1. 모든 기사 로드
        const articlesSnap = await db.ref("articles").once("value");
        const articlesData = articlesSnap.val();
        
        console.log("📌 Articles 원본 데이터:", articlesData);
        
        if(!articlesData || Object.keys(articlesData).length === 0) {
            section.innerHTML = `
                <div style="max-width:1000px; margin:0 auto; padding:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                        <h2 style="color:#f57c00; margin:0;"><i class="fas fa-thumbtack"></i> 기사 고정 관리</h2>
                        <button onclick="showAdminEvent()" class="btn-secondary">
                            <i class="fas fa-arrow-left"></i> 뒤로
                        </button>
                    </div>
                    <div style="text-align:center; padding:60px; background:white; border-radius:12px;">
                        <p style="color:#999; font-size:18px;">등록된 기사가 없습니다.</p>
                        <button onclick="showArticles()" class="btn-primary" style="margin-top:20px;">기사 작성하러 가기</button>
                    </div>
                </div>
            `;
            return;
        }
        
        // 배열로 변환 및 정렬
        const articles = Object.entries(articlesData)
            .map(([id, data]) => ({
                id: id,
                ...data,
                createdAt: data.createdAt || 0
            }))
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        console.log("📌 변환된 기사 수:", articles.length);
        
        // 2. 고정된 기사 ID 로드
        const pinnedSnap = await db.ref("pinnedArticles").once("value");
        const pinnedData = pinnedSnap.val() || {};
        const pinnedIds = Object.keys(pinnedData);
        
        console.log("📌 고정된 기사 ID:", pinnedIds);
        
        // 3. 고정/미고정 기사 분리
        const pinnedArticles = articles.filter(a => pinnedIds.includes(a.id));
        const unpinnedArticles = articles.filter(a => !pinnedIds.includes(a.id));
        
        pinnedArticles.sort((a, b) => (pinnedData[b.id]?.pinnedAt || 0) - (pinnedData[a.id]?.pinnedAt || 0));
        
        console.log("📌 고정 기사:", pinnedArticles.length, "/ 일반 기사:", unpinnedArticles.length);
        
        section.innerHTML = `
            <div style="max-width:1000px; margin:0 auto; padding:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                    <h2 style="color:#f57c00; margin:0;"><i class="fas fa-thumbtack"></i> 기사 고정 관리</h2>
                    <button onclick="showAdminEvent()" class="btn-secondary">
                        <i class="fas fa-arrow-left"></i> 뒤로
                    </button>
                </div>
                
                <div style="background:#fff3e0; padding:15px; border-radius:8px; margin-bottom:20px; border-left:4px solid #f57c00;">
                    <strong>📌 안내</strong><br>
                    • 고정된 기사는 홈 화면 최상단에 표시됩니다.<br>
                    • 최대 3개까지 고정할 수 있습니다.<br>
                    • 고정 해제는 언제든지 가능합니다.
                </div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <div>
                        <h3 style="margin-bottom:15px;">📌 고정된 기사 (${pinnedIds.length}/3)</h3>
                        <div style="max-height:600px; overflow-y:auto;">
                            ${pinnedArticles.length === 0 ? 
                                '<p style="text-align:center; color:#999; padding:40px;">고정된 기사가 없습니다.</p>' :
                                pinnedArticles.map(article => `
                                    <div style="background:white; border:2px solid #ffd700; padding:15px; border-radius:8px; margin-bottom:10px;">
                                        <div style="font-weight:600; margin-bottom:8px;">${article.title}</div>
                                        <div style="font-size:13px; color:#666; margin-bottom:10px;">
                                            ${article.author} • ${article.createdAt ? new Date(article.createdAt).toLocaleDateString() : '-'}
                                        </div>
                                        <button onclick="unpinArticle('${article.id}')" class="btn-danger btn-sm" style="width:100%;">
                                            📌 고정 해제
                                        </button>
                                    </div>
                                `).join('')
                            }
                        </div>
                    </div>
                    
                    <div>
                        <h3 style="margin-bottom:15px;">📰 전체 기사 목록</h3>
                        <input type="text" id="pinnedSearchInput" placeholder="🔍 기사 제목 검색..." class="form-control" style="margin-bottom:15px;" oninput="filterPinnedArticles()">
                        <div id="pinnedArticlesList" style="max-height:600px; overflow-y:auto;">
                            ${unpinnedArticles.slice(0, 50).map(article => `
                                <div class="pinned-article-item" data-title="${(article.title || '').toLowerCase()}" style="background:#f8f9fa; padding:12px; border-radius:8px; margin-bottom:8px; border:1px solid #ddd;">
                                    <div style="font-weight:600; margin-bottom:5px;">${article.title || '제목 없음'}</div>
                                    <div style="font-size:12px; color:#666; margin-bottom:10px;">
                                        ${article.author || '익명'} • ${article.createdAt ? new Date(article.createdAt).toLocaleDateString() : '-'}
                                    </div>
                                    <button onclick="pinArticle('${article.id}')" class="btn-warning btn-sm" style="width:100%;" ${pinnedIds.length >= 3 ? 'disabled' : ''}>
                                        ${pinnedIds.length >= 3 ? '❌ 최대 3개' : '📌 고정하기'}
                                    </button>
                                </div>
                            `).join('')}
                            ${unpinnedArticles.length > 50 ? `<p style="text-align:center; color:#999; padding:10px; font-size:13px;">처음 50개만 표시됩니다</p>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch(error) {
        console.error("❌ 기사 고정 관리 로드 실패:", error);
        section.innerHTML = `<div style="text-align:center; padding:40px;">
            <p style="color:#f44336; font-size:18px; margin-bottom:10px;">오류 발생</p>
            <p style="color:#666; margin-bottom:20px;">${error.message}</p>
            <button onclick="showPinnedArticlesManager()" class="btn-primary" style="margin-right:10px;">다시 시도</button>
            <button onclick="showAdminEvent()" class="btn-secondary">뒤로가기</button>
        </div>`;
    }
}

// ✅ 기사 검색 필터
window.filterPinnedArticles = function() {
    const searchTerm = document.getElementById("pinnedSearchInput").value.toLowerCase();
    const items = document.querySelectorAll('.pinned-article-item');
    
    items.forEach(item => {
        const title = item.getAttribute('data-title');
        if(title.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// ✅ 기사 고정
window.pinArticle = async function(articleId) {
    if(!confirm("이 기사를 상단에 고정하시겠습니까?")) return;
    
    try {
        showLoadingIndicator("고정 중...");
        
        const pinnedSnap = await db.ref("pinnedArticles").once("value");
        const pinnedData = pinnedSnap.val() || {};
        
        if(Object.keys(pinnedData).length >= 3) {
            hideLoadingIndicator();
            return alert("최대 3개까지만 고정할 수 있습니다.");
        }
        
        await db.ref(`pinnedArticles/${articleId}`).set({
            pinnedAt: Date.now(),
            pinnedBy: getNickname()
        });
        
        hideLoadingIndicator();
        alert("✅ 기사가 고정되었습니다!");
        showPinnedArticlesManager();
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("고정 실패:", error);
        alert("오류: " + error.message);
    }
}

// ✅ 기사 고정 해제
window.unpinArticle = async function(articleId) {
    if(!confirm("고정을 해제하시겠습니까?")) return;
    
    try {
        showLoadingIndicator("해제 중...");
        await db.ref(`pinnedArticles/${articleId}`).remove();
        hideLoadingIndicator();
        alert("✅ 고정이 해제되었습니다.");
        showPinnedArticlesManager();
    } catch(error) {
        hideLoadingIndicator();
        console.error("해제 실패:", error);
        alert("오류: " + error.message);
    }
}

// ✅ 광고 관리 페이지 (완전 수정)
window.showAdvertisementManager = async function() {
    hideAll();
    let section = document.getElementById("advertisementSection");
    if(!section) {
        section = document.createElement("div");
        section.id = "advertisementSection";
        section.className = "page-section";
        document.querySelector("main").appendChild(section);
    }
    section.classList.add("active");
    
    section.innerHTML = '<div style="text-align:center; padding:40px;"><div style="width:40px; height:40px; border:4px solid #f3f3f3; border-top:4px solid #c62828; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 20px;"></div><p>로딩 중...</p></div>';
    
    try {
        console.log("📢 광고 관리 - 데이터 로드 시작");
        
        const adsSnap = await db.ref("advertisements").once("value");
        const adsData = adsSnap.val();
        
        console.log("📢 Advertisements 원본 데이터:", adsData);
        
        let ads = [];
        if(adsData && Object.keys(adsData).length > 0) {
            ads = Object.entries(adsData)
                .map(([id, data]) => ({
                    id: id,
                    ...data,
                    createdAt: data.createdAt || 0
                }))
                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }
        
        console.log("📢 변환된 광고 수:", ads.length);
        
        section.innerHTML = `
            <div style="max-width:900px; margin:0 auto; padding:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                    <h2 style="color:#4caf50; margin:0;"><i class="fas fa-ad"></i> 광고 관리</h2>
                    <div style="display:flex; gap:10px;">
                        <button onclick="openAdCreateModal()" class="btn-success">
                            <i class="fas fa-plus"></i> 새 광고 만들기
                        </button>
                        <button onclick="showAdminEvent()" class="btn-secondary">뒤로</button>
                    </div>
                </div>
                
                <div style="background:#e8f5e9; padding:15px; border-radius:8px; margin-bottom:20px; border-left:4px solid #4caf50;">
                    <strong>📢 광고 안내</strong><br>
                    • 광고는 홈 화면에 배너 형태로 표시됩니다.<br>
                    • 제목, 내용, 색상, 링크를 설정할 수 있습니다.<br>
                    • 등록된 광고는 최신순으로 표시됩니다.
                </div>
                
                ${ads.length === 0 ? 
                    '<div style="text-align:center; padding:60px; background:white; border-radius:12px;"><p style="color:#999; font-size:18px;">등록된 광고가 없습니다.</p><button onclick="openAdCreateModal()" class="btn-success" style="margin-top:20px;">첫 광고 만들기</button></div>' :
                    ads.map(ad => `
                        <div style="background:white; border:2px solid #4caf50; padding:20px; border-radius:12px; margin-bottom:15px;">
                            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:15px;">
                                <div style="flex:1;">
                                    <h3 style="margin:0 0 8px 0; color:#212529;">${ad.title}</h3>
                                    <p style="margin:0; color:#666; font-size:14px;">${ad.content}</p>
                                    ${ad.link ? `<a href="${ad.link}" target="_blank" style="font-size:12px; color:#1976d2; text-decoration:underline; margin-top:8px; display:inline-block;">🔗 ${ad.link}</a>` : ''}
                                </div>
                                <div style="width:60px; height:60px; background:${ad.color || '#f5f5f5'}; border-radius:8px; margin-left:15px;"></div>
                            </div>
                            
                            <div style="display:flex; justify-content:space-between; align-items:center; padding-top:15px; border-top:1px solid #eee;">
                                <small style="color:#999;">등록: ${ad.createdAt ? new Date(ad.createdAt).toLocaleString() : '-'} • ${ad.createdBy || '알 수 없음'}</small>
                                <div style="display:flex; gap:8px;">
                                    <button onclick="editAdvertisement('${ad.id}')" class="btn-info btn-sm">수정</button>
                                    <button onclick="deleteAdvertisement('${ad.id}')" class="btn-danger btn-sm">삭제</button>
                                </div>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        `;
    } catch(error) {
        console.error("❌ 광고 관리 로드 실패:", error);
        section.innerHTML = `<div style="text-align:center; padding:40px;">
            <p style="color:#f44336; font-size:18px; margin-bottom:10px;">오류 발생</p>
            <p style="color:#666; margin-bottom:20px;">${error.message}</p>
            <button onclick="showAdvertisementManager()" class="btn-primary" style="margin-right:10px;">다시 시도</button>
            <button onclick="showAdminEvent()" class="btn-secondary">뒤로가기</button>
        </div>`;
    }
}

// ===== Part 11: 광고 관리 (오류 수정) =====

// ✅ 광고 생성 모달 (수정됨 - addEventListener 사용)
window.openAdCreateModal = function() {
    const existingModal = document.getElementById("adCreateModal");
    if(existingModal) existingModal.remove();
    
    const modalHTML = `
        <div id="adCreateModal" class="modal active">
            <div class="modal-content" style="max-width:600px;">
                <div class="modal-header">
                    <h3>📢 새 광고 만들기</h3>
                    <button onclick="closeAdCreateModal()" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="adCreateForm">
                    <div class="form-group">
                        <label>광고 제목 *</label>
                        <input type="text" id="adTitle" class="form-control" required maxlength="50" placeholder="예: 특별 이벤트 진행중!">
                    </div>
                    <div class="form-group">
                        <label>광고 내용 *</label>
                        <textarea id="adContent" class="form-control" required rows="3" maxlength="200" placeholder="광고 설명을 입력하세요"></textarea>
                    </div>
                    <div class="form-group">
                        <label>배경색 (선택)</label>
                        <input type="color" id="adColor" class="form-control" value="#f5f5f5">
                    </div>
                    <div class="form-group">
                        <label>링크 URL (선택)</label>
                        <input type="url" id="adLink" class="form-control" placeholder="https://example.com">
                    </div>
                    <button type="submit" class="btn-success btn-block">광고 등록</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // ⭐ addEventListener 사용으로 변경 (오류 수정)
    const form = document.getElementById("adCreateForm");
    if(form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();
            e.stopPropagation();
            await createAdvertisement();
        });
    }
}

window.closeAdCreateModal = function() {
    const modal = document.getElementById("adCreateModal");
    if(modal) modal.remove();
}

// ✅ 광고 생성 (완전 수정 - 디버깅 강화)
window.createAdvertisement = async function() {
    console.log("🎯 광고 생성 함수 시작");
    
    const titleEl = document.getElementById("adTitle");
    const contentEl = document.getElementById("adContent");
    const colorEl = document.getElementById("adColor");
    const linkEl = document.getElementById("adLink");
    
    console.log("📋 요소 확인:", {
        titleEl: !!titleEl,
        contentEl: !!contentEl,
        colorEl: !!colorEl,
        linkEl: !!linkEl
    });
    
    if(!titleEl || !contentEl) {
        console.error("❌ 입력 필드를 찾을 수 없습니다!");
        alert("입력 필드를 찾을 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.");
        return;
    }
    
    const title = titleEl.value.trim();
    const content = contentEl.value.trim();
    const color = colorEl ? colorEl.value : "#f5f5f5";
    const link = linkEl ? linkEl.value.trim() : "";
    
    console.log("📝 입력값:", {
        title: title,
        titleLength: title.length,
        content: content,
        contentLength: content.length,
        color: color,
        link: link
    });
    
    if(!title || title.length === 0) {
        console.warn("⚠️ 제목 누락");
        alert("제목을 입력해주세요.");
        titleEl.focus();
        return;
    }
    
    if(!content || content.length === 0) {
        console.warn("⚠️ 내용 누락");
        alert("내용을 입력해주세요.");
        contentEl.focus();
        return;
    }
    
    try {
        showLoadingIndicator("광고 등록 중...");
        
        const adId = Date.now().toString();
        const adData = {
            title: title,
            content: content,
            color: color,
            link: link || null,
            createdAt: Date.now(),
            createdBy: getNickname()
        };
        
        console.log("💾 저장할 데이터:", adData);
        
        await db.ref(`advertisements/${adId}`).set(adData);
        
        console.log("✅ Firebase 저장 완료");
        
        // 캐시 무효화
        if(window.cachedAds) {
            window.cachedAds = null;
        }
        
        hideLoadingIndicator();
        closeAdCreateModal();
        alert("✅ 광고가 등록되었습니다!");
        
        // 페이지 새로고침
        showAdvertisementManager();
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("❌ 광고 등록 실패:", error);
        alert("오류: " + error.message);
    }
}


// ✅ 광고 수정
window.editAdvertisement = async function(adId) {
    try {
        const snap = await db.ref(`advertisements/${adId}`).once("value");
        const ad = snap.val();
        if(!ad) return alert("광고를 찾을 수 없습니다.");
        
        const modalHTML = `
            <div id="adEditModal" class="modal active">
                <div class="modal-content" style="max-width:600px;">
                    <div class="modal-header">
                        <h3>✏️ 광고 수정</h3>
                        <button onclick="closeAdEditModal()" class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="adEditForm" onsubmit="updateAdvertisement('${adId}', event); return false;">
                        <div class="form-group">
                            <label>광고 제목 *</label>
                            <input type="text" id="editAdTitle" class="form-control" value="${ad.title}" required>
                        </div>
                        <div class="form-group">
                            <label>광고 내용 *</label>
                            <textarea id="editAdContent" class="form-control" rows="3" required>${ad.content}</textarea>
                        </div>
                        <div class="form-group">
                            <label>배경색</label>
                            <input type="color" id="editAdColor" class="form-control" value="${ad.color || '#f5f5f5'}">
                        </div>
                        <div class="form-group">
                            <label>링크 URL (선택)</label>
                            <input type="url" id="editAdLink" class="form-control" value="${ad.link || ''}">
                        </div>
                        <button type="submit" class="btn-primary btn-block">수정 완료</button>
                    </form>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
    } catch(error) {
        alert("오류: " + error.message);
    }
}

window.closeAdEditModal = function() {
    const modal = document.getElementById("adEditModal");
    if(modal) modal.remove();
}

window.updateAdvertisement = async function(adId, event) {
    if(event) event.preventDefault();
    
    const title = document.getElementById("editAdTitle").value.trim();
    const content = document.getElementById("editAdContent").value.trim();
    const color = document.getElementById("editAdColor").value;
    const link = document.getElementById("editAdLink").value.trim();
    
    if(!title || !content) {
        return alert("필수 항목을 입력해주세요.");
    }
    
    try {
        showLoadingIndicator("수정 중...");
        
        await db.ref(`advertisements/${adId}`).update({
            title: title,
            content: content,
            color: color,
            link: link || null,
            updatedAt: Date.now(),
            updatedBy: getNickname()
        });
        
        // 캐시 무효화
        if(window.cachedAds) {
            window.cachedAds = null;
        }
        
        hideLoadingIndicator();
        closeAdEditModal();
        alert("✅ 광고가 수정되었습니다!");
        showAdvertisementManager();
        
    } catch(error) {
        hideLoadingIndicator();
        alert("오류: " + error.message);
    }
}

// ✅ 광고 삭제
window.deleteAdvertisement = async function(adId) {
    if(!confirm("이 광고를 삭제하시겠습니까?")) return;
    
    try {
        showLoadingIndicator("삭제 중...");
        await db.ref(`advertisements/${adId}`).remove();
        
        // 캐시 무효화
        if(window.cachedAds) {
            window.cachedAds = null;
        }
        
        hideLoadingIndicator();
        alert("✅ 광고가 삭제되었습니다.");
        showAdvertisementManager();
    } catch(error) {
        hideLoadingIndicator();
        alert("오류: " + error.message);
    }
}

console.log("✅ Part 11 완료 (기사 고정 + 광고 관리 수정됨)");

// ===== Part 12: 사용자 관리 시스템 (최적화 - 오류 수정) =====

// ✅ 사용자 관리 페이지 (오류 수정)
window.showUserManagement = async function(){
    if(!isAdmin()) return alert("관리자 권한 필요!");
    
    hideAll();
    
    // ✅ 섹션 존재 확인
    const section = document.getElementById("userManagementSection");
    if(!section) {
        console.error("❌ userManagementSection을 찾을 수 없습니다!");
        alert("사용자 관리 페이지를 로드할 수 없습니다.");
        return;
    }
    
    section.classList.add("active");
    
    // ✅ usersList 존재 확인
    const root = document.getElementById("usersList");
    if(!root) {
        console.error("❌ usersList 요소를 찾을 수 없습니다!");
        section.innerHTML = '<p style="color:#f44336;text-align:center;padding:40px;">사용자 목록을 표시할 수 없습니다.</p>';
        return;
    }
    
    root.innerHTML = "<p style='text-align:center;color:#868e96;'>사용자 정보 로딩 중...</p>";
    
    updateURL('users');
    
    try {
        // 병렬 처리로 속도 개선
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
        
        // 현재 사용자 추가
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
            const isVIP = userData ? (userData.isVIP || false) : false;
            const warningCount = userData ? (userData.warningCount || 0) : 0;
            const isBanned = userData ? (userData.isBanned || false) : false;
            const safeUid = uid || 'email_' + btoa(u.email).replace(/=/g, '');
            
            const isCurrentUser = (u.email === getUserEmail());
            const nameColor = isCurrentUser ? '#000000' : (isBanned ? '#343a40' : (isVIP ? '#ffd700' : '#c62828'));

            return `
            <div class="user-card" style="opacity: ${isBanned ? '0.7' : '1'}; border-left-color: ${isBanned ? '#343a40' : (isVIP ? '#ffd700' : '#c62828')};">
                <h4 style="color:${nameColor};">
                    ${u.nickname}${isCurrentUser ? ' <span style="background:#000;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;">👤 나</span>' : ''}${isVIP ? ' <span class="vip-badge">⭐ VIP</span>' : ''}
                    ${isBanned ? ' <span style="background:#343a40;color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;">🚫 차단됨</span>' : ''}
                </h4>
                <div class="user-info">
                    📧 이메일: <strong>${u.email}</strong><br>
                    📰 기사: <strong>${u.articles.length}</strong> | 💬 댓글: <strong>${u.comments.length}</strong><br>
                    ⚠️ 누적 경고: <strong>${warningCount}회</strong><br>
                    🕐 마지막 활동: ${u.lastActivity}
                </div>
                <div class="user-actions">
                    <button onclick="showUserDetail('${u.nickname}')" class="btn-info">상세</button>
                    
                    ${isVIP ? 
                        `<button onclick="toggleVIPStatus('${u.email}', false)" class="btn-secondary">VIP해제</button>` :
                        `<button onclick="toggleVIPStatus('${u.email}', true)" class="btn-warning">VIP승급</button>`
                    }
                    
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

// (나머지 Part 12 함수들은 동일하게 유지)

// ✅ 경고 변경 (전역 함수)
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

// ✅ VIP 상태 변경 (최적화)
window.toggleVIPStatus = async function(userEmail, makeVIP) {
    if(!isAdmin()) return alert("관리자 권한이 필요합니다!");
    const action = makeVIP ? "VIP로 승급" : "VIP 취소";
    if(!confirm(`"${userEmail}" 사용자를 ${action}하시겠습니까?`)) return;
    
    try {
        showLoadingIndicator(`${action} 처리 중...`);
        
        const usersSnapshot = await db.ref("users").once("value");
        const usersData = usersSnapshot.val() || {};
        let targetUid = null;
        
        for (const [uid, userData] of Object.entries(usersData)) {
            if(userData && userData.email === userEmail) {
                targetUid = uid;
                break;
            }
        }
        
        if(!targetUid) {
            const currentUser = auth.currentUser;
            if(currentUser && currentUser.email === userEmail) {
                targetUid = currentUser.uid;
            } else {
                targetUid = 'vip_' + Date.now() + '_' + btoa(userEmail).replace(/=/g, '').substring(0, 10);
            }
        }
        
        console.log("VIP 업데이트:", { targetUid, userEmail, makeVIP });
        
        await db.ref("users/" + targetUid).update({
            email: userEmail,
            isVIP: makeVIP,
            vipUpdatedAt: Date.now(),
            vipUpdatedBy: getNickname()
        });
        
        const verifySnapshot = await db.ref("users/" + targetUid).once("value");
        const verifyData = verifySnapshot.val();
        console.log("업데이트 확인:", verifyData);
        
        hideLoadingIndicator();
        
        if(verifyData && verifyData.isVIP === makeVIP) {
            alert(`✅ ${action}이 완료되었습니다!`);
        } else {
            throw new Error("VIP 상태 업데이트 검증 실패");
        }
        
        await showUserManagement();
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("VIP 상태 변경 오류:", error);
        alert("❌ 오류: " + error.message);
    }
}

// ✅ 사용자 상세 정보 모달 (최적화)
window.showUserDetail = async function(nickname) {
    showLoadingIndicator("사용자 정보 로딩 중...");
    
    // 병렬 처리
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
                userComments.push({...comment,articleId,commentId});
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

// ✅ 관리자 권한으로 댓글 삭제
window.deleteCommentFromAdmin = function(articleId, commentId, nickname) {
    if(!confirm("이 댓글을 삭제하시겠습니까?")) return;
    db.ref("comments/" + articleId + "/" + commentId).remove().then(() => {
        alert("삭제되었습니다.");
        closeUserDetail();
        showUserDetail(nickname);
    });
}

// ✅ 사용자 완전 삭제 (최적화)
window.deleteUserCompletely = async function(nick){
    if(!confirm(`"${nick}" 사용자를 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 해당 사용자의 모든 기사와 댓글이 삭제됩니다.`)) return;
    
    showLoadingIndicator("사용자 삭제 중...");
    
    try {
        const updates = {};
        
        // 기사 삭제
        const articlesSnapshot = await db.ref("articles").once("value");
        const articlesData = articlesSnapshot.val() || {};
        Object.entries(articlesData).forEach(([id, article]) => {
            if(article.author === nick) {
                updates[`articles/${id}`] = null;
                updates[`comments/${id}`] = null;
                updates[`votes/${id}`] = null;
            }
        });
        
        // 댓글 삭제
        const commentsSnapshot = await db.ref("comments").once("value");
        const val = commentsSnapshot.val() || {};
        Object.entries(val).forEach(([aid, group]) => {
            Object.entries(group).forEach(([cid, c]) => {
                if(c.author === nick) {
                    updates[`comments/${aid}/${cid}`] = null;
                }
            });
        });
        
        // 한 번에 업데이트
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

console.log("✅ Part 12 사용자 관리 완료");

// ===== Part 13: 금지어 관리 및 점검 모드 시스템 (최적화) =====

// ✅ 금지어 관리 모달 열기
window.showBannedWordManager = function() {
    const modal = document.getElementById("bannedWordsModal");
    const input = document.getElementById("bannedWordsInput");
    
    input.value = bannedWordsList.join(', ');
    modal.classList.add("active");
}

// ✅ 금지어 관리 모달 닫기
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

// ✅ 법적 책임 및 이용 동의 모달 시스템

// 영구 쿠키 설정 (10년)
function setPermanentCookie(name, value) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 10);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

// ✅ 법적 동의 확인 함수 (최적화)
async function checkLegalAgreement(user) {
    if (!user) return;

    console.log("법적 동의 체크 시작...");

    const cookieName = "legal_agreed_" + user.uid;
    const agreedCookie = getCookie(cookieName);

    if (agreedCookie) {
        console.log("쿠키에 동의 기록 있음. 패스.");
        return;
    }

    const snapshot = await db.ref("users/" + user.uid + "/legalAgreement").once("value");
    const dbRecord = snapshot.val();

    if (dbRecord && dbRecord.agreed) {
        console.log("DB에 동의 기록 있음. 쿠키 재생성.");
        setPermanentCookie(cookieName, "true");
    } else {
        console.log("동의 기록 없음. 모달 표시!");
        showLegalModal(user);
    }
}

// ✅ 법적 동의 모달 표시 (최적화)
function showLegalModal(user) {
    if (document.getElementById("legalModal")) return;

    const modalHTML = `
        <div id="legalModal" class="modal active" style="display: flex !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 99999; background: rgba(0,0,0,0.9); justify-content: center; align-items: center;">
            <div class="modal-content" style="background: white; width: 90%; max-width: 600px; max-height: 90vh; border: 2px solid #c62828; border-radius: 8px; padding: 20px; display: flex; flex-direction: column;">
                
                <div style="text-align:center; border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:15px;">
                    <h2 style="color:#c62828; margin:0; font-size: 24px;">🚨 서비스 이용 및 법적 책임 동의</h2>
                    <p style="color:#666; font-size:13px; margin-top:5px;">사이트 이용을 위해 아래 내용에 대한 확인 및 동의가 <strong>필수</strong>입니다.</p>
                </div>

                <div style="flex: 1; overflow-y: auto; text-align: left; padding-right: 5px;">
                    
                    <div class="legal-item" style="background:#fff5f5; padding:15px; border-radius:8px; margin-bottom:15px;">
                        <h4 style="margin-top:0; margin-bottom: 8px; color:#b71c1c;">1. 콘텐츠의 허구성과 과장성 인지</h4>
                        <p style="font-size:13px; color:#333; line-height:1.6; margin:0;">
                            본 사이트(해정뉴스)에 게시되는 모든 기사, 댓글, 게시물은 유머와 풍자를 목적으로 작성될 수 있으며, 
                            <strong>사실이 아닌 허구, 과장, 왜곡된 정보</strong>가 포함될 수 있음을 인지합니다. 
                            이를 실제 사실로 오인하여 발생하는 모든 문제에 대해 본인은 이의를 제기하지 않습니다.
                        </p>
                        <label style="display:flex; align-items:center; margin-top:10px; cursor:pointer; background: #fff; padding: 5px; border-radius: 4px;">
                            <input type="checkbox" class="legal-check" style="width:18px; height:18px; margin-right:8px;">
                            <span style="font-size:14px; font-weight:bold; color: #b71c1c;">[필수] 위 내용을 이해하고 동의합니다.</span>
                        </label>
                    </div>

                    <div class="legal-item" style="background:#fff5f5; padding:15px; border-radius:8px; margin-bottom:15px;">
                        <h4 style="margin-top:0; margin-bottom: 8px; color:#b71c1c;">2. 명예훼손 및 모욕에 대한 책임</h4>
                        <p style="font-size:13px; color:#333; line-height:1.6; margin:0;">
                            본 사이트 내에서 발생하는 <strong>비난, 조롱, 사실적시, 욕설, 저격</strong> 등 타인의 명예를 훼손할 수 있는 
                            모든 콘텐츠에 대한 법적 책임은 전적으로 게시물을 작성한 <strong>사용자 본인</strong>에게 있습니다.
                            해당 행위로 인한 형법상 고소/고발 조치 시 사이트 운영자는 어떠한 보호도 제공하지 않습니다.
                        </p>
                        <label style="display:flex; align-items:center; margin-top:10px; cursor:pointer; background: #fff; padding: 5px; border-radius: 4px;">
                            <input type="checkbox" class="legal-check" style="width:18px; height:18px; margin-right:8px;">
                            <span style="font-size:14px; font-weight:bold; color: #b71c1c;">[필수] 법적 책임을 본인이 직접 동의합니다.</span>
                        </label>
                    </div>

                    <div class="legal-item" style="background:#fff5f5; padding:15px; border-radius:8px; margin-bottom:15px;">
                        <h4 style="margin-top:0; margin-bottom: 8px; color:#b71c1c;">3. 관리자 및 운영자 면책 동의</h4>
                        <p style="font-size:13px; color:#333; line-height:1.6; margin:0;">
                            사이트 운영자 및 관리자는 사용자가 게시한 콘텐츠의 내용에 대해 
                            <strong>어떠한 민·형사상 법적 책임도 지지 않습니다.</strong>
                            또한, 운영자는 임의로 게시물을 삭제하거나 사용자를 차단할 권리를 가지며 이에 대해 이의를 제기할 수 없습니다.
                        </p>
                        <label style="display:flex; align-items:center; margin-top:10px; cursor:pointer; background: #fff; padding: 5px; border-radius: 4px;">
                            <input type="checkbox" class="legal-check" style="width:18px; height:18px; margin-right:8px;">
                            <span style="font-size:14px; font-weight:bold; color: #b71c1c;">[필수] 운영자의 법적 책임 면책에 동의합니다.</span>
                        </label>
                    </div>

                    <div class="legal-item" style="background:#f8f9fa; padding:15px; border-radius:8px; margin-bottom:15px;">
                        <h4 style="margin-top:0; margin-bottom: 8px; color:#212529;">4. 동의 내역 영구 저장 안내</h4>
                        <p style="font-size:13px; color:#333; line-height:1.6; margin:0;">
                            본 동의 절차는 법적 효력을 위해 사용자의 <strong>닉네임, 이메일, 접속 IP(식별정보), 동의 일시</strong>가 
                            서버 및 귀하의 브라우저 쿠키에 <strong>영구적으로 저장</strong>됨을 안내드립니다.
                        </p>
                        <label style="display:flex; align-items:center; margin-top:10px; cursor:pointer;">
                            <input type="checkbox" class="legal-check" style="width:18px; height:18px; margin-right:8px;">
                            <span style="font-size:14px; font-weight:bold;">[필수] 정보 저장 및 영구 쿠키 생성에 동의합니다.</span>
                        </label>
                    </div>

                </div>

                <div style="margin-top:20px; border-top: 1px solid #eee; padding-top: 20px;">
                    <button onclick="submitLegalAgreement()" style="width: 100%; background:#c62828; color: white; border: none; padding: 15px; font-size: 16px; font-weight: bold; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-check-circle"></i> 모든 약관에 동의하고 입장하기
                    </button>
                    <p style="text-align:center; color:#868e96; font-size:12px; margin-top:10px;">
                        동의하지 않을 경우 사이트를 이용하실 수 없습니다.
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ✅ 동의 버튼 클릭 처리 (최적화)
async function submitLegalAgreement() {
    const checks = document.querySelectorAll('.legal-check');
    let allChecked = true;
    
    checks.forEach(chk => {
        if (!chk.checked) allChecked = false;
    });

    if (!allChecked) {
        alert("🚨 모든 항목에 필수로 동의해야만 입장할 수 있습니다.\n체크박스를 모두 확인해주세요.");
        return;
    }

    const user = auth.currentUser;
    if (!user) return alert("로그인 정보가 없습니다.");

    if (!confirm("정말로 동의하십니까?\n이 정보는 법적 근거로 활용될 수 있으며 영구 저장됩니다.")) return;

    try {
        showLoadingIndicator("동의 처리 중...");
        
        const timestamp = Date.now();
        const dateStr = new Date().toLocaleString();

        await db.ref("users/" + user.uid + "/legalAgreement").set({
            agreed: true,
            agreedAt: timestamp,
            agreedDate: dateStr,
            nickname: getNickname(),
            email: user.email,
            agreementVersion: "1.0"
        });

        setPermanentCookie("legal_agreed_" + user.uid, "true");
        
        hideLoadingIndicator();

        const modal = document.getElementById("legalModal");
        if (modal) modal.remove();

        alert(`✅ 동의가 완료되었습니다.\n환영합니다, ${getNickname()}님.`);

    } catch (error) {
        hideLoadingIndicator();
        alert("동의 처리 중 오류가 발생했습니다: " + error.message);
        console.error(error);
    }
}

// ✅ 점검 모드 시스템 (최적화)

// 점검 모드 체크 (로그인 후 실행)
async function checkMaintenanceMode() {
    console.log("🔍 점검 모드 체크 시작...");
    
    try {
        const snapshot = await db.ref("adminSettings/maintenance").once("value");
        const settings = snapshot.val();
        
        if (!settings || !settings.isActive) {
            console.log("✅ 점검 모드 비활성화 상태");
            hideMaintenanceScreen();
            return;
        }
        
        console.log("🚧 점검 모드 활성화 상태 감지");
        
        // 관리자 체크
        if (isAdmin()) {
            console.log("✅ 관리자 권한으로 점검 모드 우회");
            hideMaintenanceScreen();
            showToastNotification("🛠️ 점검 모드 활성", "관리자 권한으로 접속 중입니다.");
            return;
        }
        
        // 현재 로그인한 사용자 이메일
        const user = auth.currentUser;
        const userEmail = user ? user.email : "";
        
        console.log("👤 현재 사용자 이메일:", userEmail);
        
        // 허용된 사용자 목록 파싱
        const allowedUsers = settings.allowedUsers || "";
        const allowedList = allowedUsers
            .split(',')
            .map(email => email.trim().toLowerCase())
            .filter(email => email.length > 0);
        
        console.log("📋 허용된 사용자 목록:", allowedList);
        
        // 이메일 비교 (대소문자 구분 없이)
        const isAllowed = userEmail && allowedList.includes(userEmail.toLowerCase());
        
        console.log("🔍 접속 허용 여부:", isAllowed);
        
        if (isAllowed) {
            console.log("✅ 점검 제외 사용자 확인:", userEmail);
            hideMaintenanceScreen();
            showToastNotification("🔓 접속 허용", "점검 중 접속이 허용된 계정입니다.");
            return;
        }
        
        // 점검 화면 표시
        console.log("🚨 점검 화면 표시");
        showMaintenanceScreen(settings);
        
    } catch (error) {
        console.error("❌ 점검 모드 체크 오류:", error);
    }
}

// ✅ 점검 화면 표시
function showMaintenanceScreen(settings) {
    const overlay = document.getElementById("maintenanceOverlay");
    const titleEl = document.getElementById("mtTitle");
    const msgEl = document.getElementById("mtMessage");
    const imgContainer = document.getElementById("mtImageContainer");
    
    if (!overlay) {
        console.error("❌ maintenanceOverlay 요소를 찾을 수 없습니다!");
        return;
    }
    
    titleEl.textContent = settings.title || "시스템 점검 중입니다";
    msgEl.textContent = settings.message || "더 나은 서비스를 위해 점검을 진행하고 있습니다.";
    
    if (settings.imageUrl) {
        imgContainer.innerHTML = `<img src="${settings.imageUrl}" alt="점검 이미지" style="max-width:100%; border-radius:8px;">`;
    } else {
        imgContainer.innerHTML = "";
    }
    
    overlay.style.display = "flex";
    overlay.style.zIndex = "99999";
}

// ✅ 점검 화면 숨기기
function hideMaintenanceScreen() {
    const overlay = document.getElementById("maintenanceOverlay");
    if (overlay) {
        overlay.style.display = "none";
    }
}

// ✅ 나가기 버튼 함수 (전역으로 등록)
window.closeMaintenanceScreen = function() {
    console.log("🚪 사용자가 점검 화면 나가기 클릭");
    
    // 로그아웃 처리
    if (auth.currentUser) {
        if (confirm("점검 중에는 접속할 수 없습니다.\n로그아웃하시겠습니까?")) {
            auth.signOut().then(() => {
                alert("로그아웃되었습니다.");
                hideMaintenanceScreen();
                location.reload();
            });
        }
    } else {
        hideMaintenanceScreen();
    }
}

// ✅ 점검 모드 실시간 감지 (관리자가 설정 변경 시)
function initMaintenanceListener() {
    db.ref("adminSettings/maintenance").on("value", async snapshot => {
        const settings = snapshot.val();
        
        // 초기 로딩 중이면 무시
        if (!maintenanceChecked) {
            maintenanceChecked = true;
            return;
        }
        
        console.log("🔄 점검 설정 변경 감지");
        await checkMaintenanceMode();
    });
}

// ✅ 관리자용: 점검 설정 모달 열기
window.showMaintenanceManager = function() {
    if(!isAdmin()) return alert("관리자만 접근 가능합니다.");

    const modal = document.getElementById("maintenanceModal");
    
    db.ref("adminSettings/maintenance").once("value").then(snapshot => {
        const settings = snapshot.val() || {};
        
        document.getElementById("mtActiveToggle").checked = settings.isActive || false;
        document.getElementById("mtTitleInput").value = settings.title || "";
        document.getElementById("mtMessageInput").value = settings.message || "";
        document.getElementById("mtImgInput").value = settings.imageUrl || "";
        document.getElementById("mtAllowedUsers").value = settings.allowedUsers || "";
        
        modal.classList.add("active");
    });
}

// ✅ 관리자용: 점검 설정 저장
window.saveMaintenanceSettings = function(e) {
    e.preventDefault();
    
    const isActive = document.getElementById("mtActiveToggle").checked;
    const title = document.getElementById("mtTitleInput").value;
    const message = document.getElementById("mtMessageInput").value;
    const imageUrl = document.getElementById("mtImgInput").value;
    const allowedUsers = document.getElementById("mtAllowedUsers").value;

    const updates = {
        isActive: isActive,
        title: title,
        message: message,
        imageUrl: imageUrl,
        allowedUsers: allowedUsers,
        updatedAt: Date.now(),
        updatedBy: getNickname()
    };

    console.log("💾 점검 설정 저장:", updates);

    db.ref("adminSettings/maintenance").set(updates).then(() => {
        alert(isActive ? "🚨 점검 모드가 시작되었습니다." : "✅ 점검 모드가 해제되었습니다.");
        closeMaintenanceModal();
    }).catch(err => alert("저장 실패: " + err.message));
}

// ✅ 모달 닫기
window.closeMaintenanceModal = function() {
    document.getElementById("maintenanceModal").classList.remove("active");
}

console.log("✅ Part 13 금지어/점검 완료");

// ===== Part 14: 캐치마인드 게임 시스템 (최적화) =====

// ✅ 캐치마인드 설정 로드 (비동기)
async function loadCatchMindConfig() {
    try {
        const response = await fetch('./json/catchmind-config.json');
        if (!response.ok) throw new Error("Config load failed");
        const data = await response.json();
        
        catchMindGames = data.games || [];
        // Firebase 설정이 있다면 덮어쓰기 (Part 1에서 로드된 변수 활용)
        if(typeof hintPenalty === 'undefined') hintPenalty = data.hintPenalty || 20;
        
        console.log(`✅ 캐치마인드 설정 로드: ${catchMindGames.length}개 게임`);
    } catch (err) {
        console.warn("⚠️ 캐치마인드 로컬 설정 로드 실패 (Firebase 데이터만 사용):", err.message);
        catchMindGames = []; 
    }
}

// ✅ 힌트 페널티 Firebase 로드
async function loadHintPenaltyFromFirebase() {
    try {
        const snapshot = await db.ref("adminSettings/catchMind/hintPenalty").once("value");
        if(snapshot.exists()) {
            hintPenalty = snapshot.val();
        }
    } catch(error) {
        console.error("힌트 페널티 로드 실패:", error);
    }
}

// ✅ 캐치마인드 메인 화면 표시
function showCatchMind() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    hideAll();
    // 섹션이 없으면 동적 생성하지 않고 HTML에 있다고 가정 (없으면 에러 방지)
    const section = document.getElementById("catchMindSection");
    if(section) section.classList.add("active");
    
    const content = document.getElementById("catchMindContent");
    if(!content) return;

    content.innerHTML = `
        <div class="catchmind-start-screen">
            <div style="font-size:64px; margin-bottom:20px;">🎨</div>
            <h2 style="margin-bottom:20px;">캐치마인드</h2>
            <p style="color:#5f6368; margin-bottom:30px; line-height:1.6;">
                이미지를 보고 정답을 맞춰보세요!<br>
                빠르게 맞출수록 더 많은 포인트를 획득합니다.
            </p>
            
            <div class="difficulty-buttons">
                <button class="difficulty-btn easy ${currentDifficulty === 'easy' ? 'active' : ''}" onclick="selectDifficulty('easy')">쉬움</button>
                <button class="difficulty-btn medium ${currentDifficulty === 'medium' ? 'active' : ''}" onclick="selectDifficulty('medium')">보통</button>
                <button class="difficulty-btn hard ${currentDifficulty === 'hard' ? 'active' : ''}" onclick="selectDifficulty('hard')">어려움</button>
            </div>
            
            <button onclick="showGameRules()" class="btn-secondary btn-block" style="margin-bottom:12px;">
                <i class="fas fa-info-circle"></i> 게임 규칙
            </button>
            <button onclick="startCatchMindGame()" class="btn-primary btn-block" style="margin-bottom:12px;">
                <i class="fas fa-play"></i> 게임 시작
            </button>
            <button onclick="showCreateGamePage()" class="btn-warning btn-block" style="margin-bottom:12px; background:#ff9800; border:none; color:white;">
                <i class="fas fa-palette"></i> 그림 직접 그려서 출제하기
            </button>
            <button onclick="showEventMenu()" class="btn-secondary btn-block">
                <i class="fas fa-arrow-left"></i> 돌아가기
            </button>
        </div>
    `;
    
    updateURL('catchmind');
}

// ✅ 난이도 선택
window.selectDifficulty = function(difficulty) {
    currentDifficulty = difficulty;
    showCatchMind();
}

// ✅ 게임 규칙 표시
window.showGameRules = function() {
    alert(`🎮 캐치마인드 규칙\n\n1. 이미지와 힌트를 보고 정답을 맞추세요.\n2. 제한 시간 내에 정답을 입력해야 합니다.\n3. 힌트 사용 시 ${hintPenalty}원이 차감됩니다.\n\n[난이도]\n쉬움: 30초\n보통: 20초\n어려움: 15초 (주제 미제공)`);
}

// ✅ 게임 시작
window.startCatchMindGame = async function() {
    // 1. Firebase에서 승인된 커스텀 게임 로드
    let customGames = [];
    try {
        const snap = await db.ref("adminSettings/catchMind/customGames").once("value");
        const val = snap.val();
        if(val) customGames = Object.values(val);
    } catch(e) { console.error(e); }

    // 2. 로컬 게임 + 커스텀 게임 병합
    const allGames = [...catchMindGames, ...customGames];
    const games = allGames.filter(g => g.difficulty === currentDifficulty);
    
    if(games.length === 0) {
        alert("선택한 난이도의 게임이 없습니다!");
        return;
    }
    
    currentGame = games[Math.floor(Math.random() * games.length)];
    timeRemaining = currentGame.timeLimit || (currentDifficulty === 'easy' ? 30 : 15);
    usedHints = 0;
    
    updateCurrentReward();
    displayGameScreen();
    startGameTimer();
}

// ✅ 현재 보상 계산
function updateCurrentReward() {
    const elapsedTime = (currentGame.timeLimit || 30) - timeRemaining;
    const baseReward = calculateReward(elapsedTime);
    const penalty = usedHints * hintPenalty;
    currentReward = Math.max(0, baseReward - penalty);
}

// ✅ 보상 테이블 조회
function calculateReward(elapsedTime) {
    const rewards = currentGame.rewards || { "5sec": 100, "15sec": 50, "30sec": 30 };
    const rewardKeys = Object.keys(rewards).map(k => parseInt(k.replace('sec', ''))).sort((a, b) => a - b);
    
    for(let i = 0; i < rewardKeys.length; i++) {
        if(elapsedTime <= rewardKeys[i]) {
            return rewards[rewardKeys[i] + 'sec'];
        }
    }
    return 0;
}

// ✅ 게임 화면 렌더링
function displayGameScreen() {
    const content = document.getElementById("catchMindContent");
    const hintsHTML = (currentGame.hints || []).map((hint, idx) => `
        <div class="hint-item" id="hint_${idx}" style="display:none;">${idx + 1}. ${hint}</div>
    `).join('');
    
    content.innerHTML = `
        <div class="catchmind-game-screen">
            <div style="text-align:center;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <div class="timer-badge">${currentDifficulty}</div>
                    <div class="timer-display" id="gameTimer">${timeRemaining}초</div>
                </div>
                
                <div class="reward-box">
                    <div style="font-size:14px; opacity:0.9;">💰 획득 가능</div>
                    <div id="currentRewardDisplay" style="font-size:32px; font-weight:900;">${currentReward}원</div>
                </div>
                
                ${currentDifficulty !== 'hard' ? `<div style="background:#f1f3f4; padding:12px; border-radius:8px; margin-bottom:20px;"><strong>주제:</strong> ${currentGame.subject}</div>` : ''}
                
                <img src="${currentGame.imageUrl}" class="catchmind-image" alt="게임 이미지" style="max-width:100%; border-radius:8px; margin-bottom:20px;">
                
                <div class="hint-list">
                    <button onclick="useHint()" class="btn-warning btn-sm" style="width:100%; margin-bottom:10px;">💡 힌트 사용 (-${hintPenalty}원)</button>
                    <div id="hintsContainer">${hintsHTML}</div>
                    <div id="noMoreHints" style="display:none; font-size:12px; color:#888;">힌트 소진</div>
                </div>
                
                <div class="answer-input-wrapper" style="display:flex; gap:10px;">
                    <input type="text" id="answerInput" class="form-control" placeholder="정답 입력" onkeypress="if(event.key==='Enter') submitAnswer()">
                    <button onclick="submitAnswer()" class="btn-primary">제출</button>
                </div>
                
                <div id="feedbackMessage" style="margin-top:10px; min-height:20px; font-weight:bold;"></div>
                <button onclick="giveUpGame()" class="btn-text-danger" style="margin-top:20px;">🏳️ 포기하기</button>
            </div>
        </div>
    `;
    
    setTimeout(() => document.getElementById("answerInput").focus(), 100);
}

// ✅ 힌트 사용 로직 (돈 차감 포함)
window.useHint = async function() {
    if(!currentGame.hints || usedHints >= currentGame.hints.length) {
        document.getElementById("noMoreHints").style.display = "block";
        return;
    }
    
    const currentMoney = await getUserMoney();
    if(currentMoney < hintPenalty) {
        return alert(`포인트가 부족합니다. (필요: ${hintPenalty}원)`);
    }
    
    if(!confirm(`힌트를 보시겠습니까? ${hintPenalty}원이 차감됩니다.`)) return;
    
    await updateUserMoney(-hintPenalty, "캐치마인드 힌트 사용");
    
    const hintEl = document.getElementById(`hint_${usedHints}`);
    if(hintEl) hintEl.style.display = "block";
    
    usedHints++;
    updateCurrentReward();
    document.getElementById("currentRewardDisplay").textContent = currentReward + "원";
}

// ✅ 타이머 로직
function startGameTimer() {
    if(gameTimer) clearInterval(gameTimer);
    
    gameTimer = setInterval(() => {
        timeRemaining--;
        const timerEl = document.getElementById("gameTimer");
        if(timerEl) {
            timerEl.textContent = timeRemaining + "초";
            if(timeRemaining <= 10) timerEl.style.color = "#d32f2f";
        }
        
        updateCurrentReward();
        const rewardEl = document.getElementById("currentRewardDisplay");
        if(rewardEl) rewardEl.textContent = currentReward + "원";
        
        if(timeRemaining <= 0) {
            clearInterval(gameTimer);
            showGameResult(false, 0);
        }
    }, 1000);
}

// ===== Part 14: 캐치마인드 게임 시스템 (최적화 + 보상 버그 수정) =====

// ✅ 정답 제출 (async로 수정)
window.submitAnswer = async function() {
    const input = document.getElementById("answerInput");
    const val = input.value.trim();
    if(!val) return;
    
    if(val === currentGame.answer) {
        clearInterval(gameTimer);
        
        // 🔥 중요: await 추가로 보상 지급 보장
        await updateUserMoney(currentReward, `캐치마인드 정답 (${currentGame.difficulty})`);
        
        showGameResult(true, currentReward);
    } else {
        const fb = document.getElementById("feedbackMessage");
        fb.textContent = "❌ 땡!";
        fb.style.color = "#d32f2f";
        input.value = "";
        input.focus();
        setTimeout(() => fb.textContent = "", 2000);
    }
}

// ✅ 게임 결과 표시
function showGameResult(isSuccess, reward) {
    const content = document.getElementById("catchMindContent");
    content.innerHTML = `
        <div style="text-align:center; padding:40px 20px;">
            <div style="font-size:60px; margin-bottom:20px;">${isSuccess ? '🎉' : '⏰'}</div>
            <h2 style="color:${isSuccess ? '#2e7d32' : '#c62828'}">${isSuccess ? '정답입니다!' : '시간 초과'}</h2>
            <p style="margin:20px 0;">
                정답: <strong>${currentGame.answer}</strong><br>
                ${isSuccess ? `획득: ${reward}원 💰` : '아쉽네요, 다음 기회에!'}
            </p>
            <button onclick="startCatchMindGame()" class="btn-primary btn-block">다음 문제</button>
            <button onclick="showCatchMind()" class="btn-secondary btn-block" style="margin-top:10px;">메인으로</button>
        </div>
    `;
}

// ✅ 포기하기
window.giveUpGame = function() {
    if(confirm("정말 포기하시겠습니까?")) {
        clearInterval(gameTimer);
        showGameResult(false, 0);
    }
}

// ✅ 힌트 페널티 관리 (관리자용)
window.showHintPenaltyManager = function() {
    const p = prompt("힌트 페널티 금액을 입력하세요:", hintPenalty);
    if(p && !isNaN(p)) {
        db.ref("adminSettings/catchMind/hintPenalty").set(parseInt(p));
        hintPenalty = parseInt(p);
        alert("저장되었습니다.");
    }
}

console.log("✅ Part 14 캐치마인드 완료");

// ===== Part 15: 쿠폰 시스템 (Firebase 규칙 호환 수정) =====

// ✅ 쿠폰 설정 로드
async function loadCouponConfig() {
    try {
        const res = await fetch('./json/coupon-config.json');
        if(!res.ok) throw new Error("Load failed");
        const data = await res.json();
        couponsConfig = data.coupons || [];
        console.log(`✅ 쿠폰 로드: ${couponsConfig.length}개`);
    } catch(err) {
        console.warn("⚠️ 쿠폰 설정 로드 실패 (로컬 사용 불가)", err);
        couponsConfig = [];
    }
}

// ✅ 쿠폰 페이지 표시
window.showCouponPage = function() {
    if(!isLoggedIn()) return alert("로그인 필요!");
    
    hideAll();
    window.scrollTo(0, 0);
    
    const section = document.getElementById("couponSection");
    if(section) {
        section.classList.add("active");
        updateURL('coupon');
        
        const content = document.getElementById("couponContent");
        if(content) {
            content.innerHTML = `
                <div style="max-width:600px; margin:0 auto; padding:20px;">
                    <h2 style="text-align:center; color:#c62828;"><i class="fas fa-ticket-alt"></i> 쿠폰 등록</h2>
                    <div style="background:#fff; padding:30px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin:20px 0;">
                        <input type="text" id="couponCodeInput" class="form-control" placeholder="COUPON-CODE" style="text-align:center; font-size:18px; text-transform:uppercase;">
                        <button onclick="useCoupon()" class="btn-primary btn-block" style="margin-top:20px;">쿠폰 사용하기</button>
                    </div>
                    <button onclick="showEventMenu()" class="btn-secondary btn-block">돌아가기</button>
                </div>
            `;
        }
    }
}

// ✅ 쿠폰 사용 로직 (Firebase 규칙 호환)
window.useCoupon = async function() {
    const input = document.getElementById("couponCodeInput");
    if(!input) {
        console.error("❌ 쿠폰 입력 필드를 찾을 수 없습니다!");
        return alert("쿠폰 입력창을 찾을 수 없습니다.");
    }
    
    const code = input.value.trim();
    if(!code) return alert("코드를 입력하세요.");
    
    const uid = getUserId();
    
    try {
        // 1. 설정에서 쿠폰 찾기
        const coupon = couponsConfig.find(c => c.code === code);
        if(!coupon || !coupon.active) return alert("유효하지 않은 쿠폰입니다.");
        
        // 2. 만료 체크
        if(new Date() > new Date(coupon.expiryDate)) return alert("만료된 쿠폰입니다.");
        
        // 3. 중복 사용 체크 (Firebase)
        const usageSnap = await db.ref(`couponUsage/${uid}/${code}`).once("value");
        if(usageSnap.exists()) return alert("이미 사용한 쿠폰입니다.");
        
        // 4. 전체 수량 체크
        const globalSnap = await db.ref(`coupons/${code}`).once("value");
        const globalData = globalSnap.val() || { currentUses: 0 };
        if(globalData.currentUses >= coupon.maxUses) return alert("선착순 마감된 쿠폰입니다.");
        
        // 5. VIP 전용 체크
        if(coupon.vipOnly) {
            const userSnap = await db.ref(`users/${uid}`).once("value");
            const userData = userSnap.val() || {};
            if(!userData.isVIP) {
                return alert("🌟 VIP 전용 쿠폰입니다!");
            }
        }
        
        // 🔥 6. Firebase 규칙에 맞게 데이터 저장 (usedAt, reward, description 모두 포함)
        await db.ref(`couponUsage/${uid}/${code}`).set({ 
            usedAt: Date.now(),
            reward: coupon.reward,
            description: coupon.description
        });
        
        await db.ref(`coupons/${code}`).update({ currentUses: (globalData.currentUses || 0) + 1 });
        await updateUserMoney(coupon.reward, `쿠폰: ${coupon.description}`);
        
        alert(`🎉 쿠폰 적용 완료! +${coupon.reward}원`);
        input.value = "";
        
    } catch(err) {
        console.error("❌ 쿠폰 사용 오류:", err);
        alert("오류 발생: " + err.message);
    }
}

console.log("✅ Part 15 쿠폰 시스템 완료 (Firebase 규칙 호환)");

// ===== Part 16: 사용자 제보 및 게임 출제 (클라이언트) + 제출물 관리 =====

// ✅ 게임 출제 페이지
window.showCreateGamePage = function() {
    hideAll();
    const content = document.getElementById("catchMindContent");
    document.getElementById("catchMindSection").classList.add("active");
    
    content.innerHTML = `
        <div style="max-width:600px; margin:0 auto; background:white; padding:20px; border-radius:12px;">
            <h3>🎨 문제 만들기</h3>
            <div class="form-group"><label>이미지</label><input type="file" id="gameImages" class="form-control" accept="image/*" multiple onchange="previewGameImages(this)"><div id="gameImagePreviews" style="display:flex;gap:5px;overflow-x:auto;"></div></div>
            <div class="form-group"><label>주제</label><input type="text" id="gameSubject" class="form-control"></div>
            <div class="form-group"><label>정답</label><input type="text" id="gameAnswer" class="form-control"></div>
            <div class="form-group"><label>난이도</label><select id="gameDifficulty" class="form-control"><option value="easy">쉬움</option><option value="medium">보통</option><option value="hard">어려움</option></select></div>
            <div class="form-group"><label>힌트 (콤마로 구분)</label><input type="text" id="gameHints" class="form-control" placeholder="힌트1, 힌트2..."></div>
            <button onclick="submitUserGame()" class="btn-primary btn-block">제출하기</button>
            <button onclick="showCatchMind()" class="btn-secondary btn-block" style="margin-top:10px;">취소</button>
        </div>
    `;
}

// ✅ 이미지 미리보기
window.previewGameImages = function(input) {
    const container = document.getElementById("gameImagePreviews");
    container.innerHTML = "";
    if(input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = e => {
                container.innerHTML += `<img src="${e.target.result}" style="height:50px; border-radius:4px; border:1px solid #ddd;">`;
            };
            reader.readAsDataURL(file);
        });
    }
}

// ✅ 사용자 게임 제출
window.submitUserGame = async function() {
    if(!confirm("제출하시겠습니까?")) return;
    showLoadingIndicator("업로드 중...");
    
    try {
        const subject = document.getElementById("gameSubject").value;
        const answer = document.getElementById("gameAnswer").value;
        const difficulty = document.getElementById("gameDifficulty").value;
        const hints = document.getElementById("gameHints").value.split(',').map(s=>s.trim());
        const files = document.getElementById("gameImages").files;
        
        if(!subject || !answer || files.length === 0) throw new Error("필수 항목 누락");
        
        const imageUrls = [];
        for(const file of files) {
            const base64 = await new Promise(r => {
                const reader = new FileReader();
                reader.onload = e => r(e.target.result);
                reader.readAsDataURL(file);
            });
            imageUrls.push(base64);
        }
        
        await db.ref("pendingGames").push({
            author: getNickname(),
            uid: getUserId(),
            submittedAt: Date.now(),
            subject, answer, difficulty, hints,
            images: imageUrls,
            status: 'pending'
        });
        
        hideLoadingIndicator();
        alert("제출되었습니다! 관리자 승인 후 등록됩니다.");
        showCatchMind();
    } catch(err) {
        hideLoadingIndicator();
        alert("오류: " + err.message);
    }
}


// (게임 출제 함수들은 동일하므로 생략...)

// 🔥 제출물 관리 페이지 (관리자용) - 수정됨
window.showSubmissionManager = async function() {
    if(!isAdmin()) {
        alert("관리자 권한이 필요합니다!");
        return;
    }
    
    hideAll();
    
    let section = document.getElementById("submissionSection");
    if(!section) {
        // 🔥 수정: main이 없을 경우 body 사용
        console.log("📦 submissionSection 생성 중...");
        const container = document.querySelector("main") || document.body;
        
        if(!container) {
            console.error("❌ 컨테이너를 찾을 수 없습니다!");
            alert("페이지 구조 오류가 발생했습니다.");
            return;
        }
        
        section = document.createElement("div");
        section.id = "submissionSection";
        section.className = "page-section";
        container.appendChild(section);
        console.log("✅ submissionSection 생성 완료");
    }
    section.classList.add("active");
    
    section.innerHTML = `
        <div style="max-width:900px; margin:0 auto; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <h2 style="color:#c62828; margin:0;"><i class="fas fa-inbox"></i> 제출물 관리</h2>
                <button onclick="showUserManagement()" class="btn-secondary">
                    <i class="fas fa-arrow-left"></i> 뒤로
                </button>
            </div>
            <div style="text-align:center; padding:40px;">
                <div style="width:50px; height:50px; border:4px solid #f3f3f3; border-top:4px solid #c62828; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 20px;"></div>
                <p style="color:#666;">로딩 중...</p>
            </div>
        </div>
    `;
    
    try {
        // 게임 제출물 로드
        const gamesSnapshot = await db.ref("pendingGames").once("value");
        const gamesData = gamesSnapshot.val() || {};
        
        const pendingGames = Object.entries(gamesData)
            .filter(([id, game]) => game.status === 'pending')
            .map(([id, game]) => ({id, ...game}))
            .sort((a, b) => b.submittedAt - a.submittedAt);
        
        // 버그 제보 로드
        const bugsSnapshot = await db.ref("bugReports").once("value");
        const bugsData = bugsSnapshot.val() || {};
        
        const bugReports = Object.entries(bugsData)
            .map(([id, bug]) => ({id, ...bug}))
            .sort((a, b) => b.timestamp - a.timestamp);
        
        section.innerHTML = `
            <div style="max-width:900px; margin:0 auto; padding:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                    <h2 style="color:#c62828; margin:0;"><i class="fas fa-inbox"></i> 제출물 관리</h2>
                    <button onclick="showUserManagement()" class="btn-secondary">
                        <i class="fas fa-arrow-left"></i> 뒤로
                    </button>
                </div>
                
                <!-- 게임 제출물 -->
                <div style="background:white; border-radius:12px; padding:25px; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin-bottom:20px;">
                    <h3 style="margin:0 0 20px 0; color:#495057;">🎮 게임 제출물 (${pendingGames.length})</h3>
                    ${pendingGames.length > 0 ? pendingGames.map(game => `
                        <div style="background:#f8f9fa; padding:20px; border-radius:8px; margin-bottom:15px;">
                            <div style="display:flex; gap:15px; margin-bottom:15px;">
                                ${game.images && game.images.length > 0 ? `
                                    <img src="${game.images[0]}" style="width:100px; height:100px; object-fit:cover; border-radius:8px;">
                                ` : ''}
                                <div style="flex:1;">
                                    <h4 style="margin:0 0 8px 0;">${game.subject}</h4>
                                    <p style="margin:0; color:#6c757d; font-size:13px;">
                                        정답: ${game.answer} | 난이도: ${game.difficulty}<br>
                                        제출자: ${game.author} | ${new Date(game.submittedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div style="display:flex; gap:8px;">
                                <button onclick="approveGame('${game.id}')" class="btn-success btn-sm">승인</button>
                                <button onclick="rejectGame('${game.id}')" class="btn-danger btn-sm">거절</button>
                            </div>
                        </div>
                    `).join('') : '<p style="text-align:center; color:#868e96; padding:30px;">제출된 게임이 없습니다.</p>'}
                </div>
                
                <!-- 버그 제보 -->
                <div style="background:white; border-radius:12px; padding:25px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin:0 0 20px 0; color:#495057;">🐛 버그 제보 (${bugReports.length})</h3>
                    ${bugReports.length > 0 ? bugReports.slice(0, 10).map(bug => `
                        <div style="background:#f8f9fa; padding:15px; border-radius:8px; margin-bottom:10px;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                                <strong>${bug.reporter}</strong>
                                <span style="font-size:12px; color:#868e96;">${bug.dateStr}</span>
                            </div>
                            <div style="background:white; padding:12px; border-radius:6px; margin-bottom:10px;">
                                <p style="margin:0; white-space:pre-wrap; font-size:14px;">${bug.description}</p>
                            </div>
                            <div style="color:#6c757d; font-size:12px;">기기: ${bug.device}</div>
                            ${bug.images && bug.images.length > 0 ? `
                                <div style="display:flex; gap:5px; margin-top:10px;">
                                    ${bug.images.map(img => `<img src="${img}" style="width:80px; height:80px; object-fit:cover; border-radius:4px;">`).join('')}
                                </div>
                            ` : ''}
                            <button onclick="deleteBugReport('${bug.id}')" class="btn-danger btn-sm" style="margin-top:10px;">삭제</button>
                        </div>
                    `).join('') : '<p style="text-align:center; color:#868e96; padding:30px;">제보된 버그가 없습니다.</p>'}
                </div>
            </div>
        `;
        
    } catch(error) {
        console.error("제출물 로드 실패:", error);
        section.innerHTML = `
            <div style="text-align:center; padding:60px 20px;">
                <p style="color:#f44336; font-size:18px; margin-bottom:10px;">오류 발생</p>
                <p style="color:#6c757d; margin-bottom:20px;">${error.message}</p>
                <button onclick="showUserManagement()" class="btn-primary">뒤로가기</button>
            </div>
        `;
    }
}

// ✅ 게임 승인
window.approveGame = async function(gameId) {
    if(!confirm("이 게임을 승인하시겠습니까?")) return;
    
    try {
        showLoadingIndicator("처리 중...");
        
        const gameSnap = await db.ref(`pendingGames/${gameId}`).once('value');
        const game = gameSnap.val();
        
        if(!game) throw new Error("게임을 찾을 수 없습니다.");
        
        // 승인된 게임으로 이동
        await db.ref(`adminSettings/catchMind/customGames/${gameId}`).set({
            subject: game.subject,
            answer: game.answer,
            difficulty: game.difficulty,
            hints: game.hints || [],
            imageUrl: game.images[0],
            timeLimit: game.difficulty === 'easy' ? 30 : game.difficulty === 'medium' ? 20 : 15,
            rewards: { "5sec": 100, "15sec": 50, "30sec": 30 },
            approved: true,
            approvedAt: Date.now(),
            approvedBy: getNickname()
        });
        
        // 상태 업데이트
        await db.ref(`pendingGames/${gameId}`).update({ status: 'approved' });
        
        hideLoadingIndicator();
        alert("✅ 게임이 승인되었습니다!");
        showSubmissionManager();
        
    } catch(error) {
        hideLoadingIndicator();
        alert("오류: " + error.message);
    }
}

// ✅ 게임 거절
window.rejectGame = async function(gameId) {
    if(!confirm("이 게임을 거절하시겠습니까?")) return;
    
    try {
        await db.ref(`pendingGames/${gameId}`).update({ status: 'rejected' });
        alert("거절되었습니다.");
        showSubmissionManager();
    } catch(error) {
        alert("오류: " + error.message);
    }
}

// ✅ 버그 제보 삭제
window.deleteBugReport = async function(bugId) {
    if(!confirm("이 제보를 삭제하시겠습니까?")) return;
    
    try {
        await db.ref(`bugReports/${bugId}`).remove();
        alert("삭제되었습니다.");
        showSubmissionManager();
    } catch(error) {
        alert("오류: " + error.message);
    }
}

// 🔥 버그 리포트 페이지
window.showBugReportPage = function() {
    hideAll();
    
    let section = document.getElementById("bugReportSection");
    if (!section) {
        console.log("📦 bugReportSection 생성 중...");
        // 🔥 수정: main이 없을 경우 body 사용
        const container = document.querySelector("main") || document.body;
        section = document.createElement("section");
        section.id = "bugReportSection";
        section.className = "page-section";
        container.appendChild(section);
        console.log("✅ bugReportSection 생성 완료");
    }
    
    section.classList.add("active");
    
    const deviceType = /Mobile/i.test(navigator.userAgent) ? "모바일" : "PC";
    
    section.innerHTML = `
        <div style="max-width:600px; margin:20px auto; padding:20px; background:white; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="color:#d32f2f; margin:0;"><i class="fas fa-bug"></i> 버그 제보</h2>
                <button onclick="showMoreMenu()" class="btn-secondary">
                    <i class="fas fa-arrow-left"></i> 뒤로
                </button>
            </div>
            
            <div class="form-group">
                <label>기기 정보</label>
                <input type="text" id="bugDevice" class="form-control" value="${deviceType}" readonly>
            </div>
            
            <div class="form-group">
                <label>스크린샷 (선택)</label>
                <input type="file" id="bugImages" class="form-control" accept="image/*" multiple>
            </div>
            
            <div class="form-group">
                <label>버그 내용 *</label>
                <textarea id="bugDescription" class="form-control" style="height:150px;" placeholder="발생한 버그를 상세히 설명해주세요..."></textarea>
            </div>
            
            <button onclick="submitBugReport()" class="btn-danger btn-block">
                <i class="fas fa-paper-plane"></i> 제보하기
            </button>
        </div>
    `;
    
    updateURL('bugreport');
}

// ✅ 버그 리포트 제출
window.submitBugReport = async function() {
    if(!confirm("제보하시겠습니까?")) return;
    showLoadingIndicator("전송 중...");
    
    try {
        const desc = document.getElementById("bugDescription").value;
        const device = document.getElementById("bugDevice").value;
        const files = document.getElementById("bugImages").files;
        
        if(!desc) throw new Error("내용을 입력해주세요.");
        
        const imageUrls = [];
        for(const file of files) {
            const base64 = await new Promise(r => {
                const reader = new FileReader();
                reader.onload = e => r(e.target.result);
                reader.readAsDataURL(file);
            });
            imageUrls.push(base64);
        }
        
        await db.ref("bugReports").push({
            reporter: getNickname(),
            uid: getUserId(),
            dateStr: new Date().toLocaleString(),
            timestamp: Date.now(),
            device, description: desc,
            images: imageUrls
        });
        
        hideLoadingIndicator();
        alert("감사합니다! 성공적으로 전송되었습니다.");
        showMoreMenu();
    } catch(err) {
        hideLoadingIndicator();
        alert("전송 실패: " + err.message);
    }
}

console.log("✅ Part 16 사용자 제보 + 제출물 관리 완료");

// ===== Part 17: PWA 및 초기화 (최적화) =====

// ✅ PWA 설치 로직
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // 이미 설치 거절했거나 설치했으면 무시
    if(!getCookie('pwa_install_prompted')) {
        setTimeout(showPWAInstallPrompt, 3000);
    }
});

function showPWAInstallPrompt() {
    if(!deferredPrompt) return;
    if(confirm('📱 해정뉴스를 앱으로 설치하시겠습니까?\n더 빠르고 편리하게 이용할 수 있습니다.')) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('✅ PWA 설치됨');
            }
            deferredPrompt = null;
        });
        setCookie('pwa_install_prompted', 'true', 30);
    } else {
        setCookie('pwa_install_prompted', 'true', 7); // 7일 후 다시 물어봄
    }
}

// ✅ 테마/사운드 설정 렌더링 (설정 페이지용)
async function renderThemeSoundSettings() {
    if(!isLoggedIn()) return '';
    const uid = getUserId();
    
    try {
        const invSnap = await db.ref("users/" + uid + "/inventory").once("value");
        const themeSnap = await db.ref("users/" + uid + "/activeTheme").once("value");
        
        const inventory = invSnap.val() || [];
        const activeTheme = themeSnap.val() || 'default';
        const hasChristmas = inventory.includes('christmas_theme');
        const isChristmasActive = activeTheme === 'christmas';
        
        return `
            <div style="background:#fff; border:1px solid #dadce0; padding:20px; border-radius:8px; margin-bottom:20px;">
                <h4 style="margin:0 0 15px 0;">🎨 테마 설정</h4>
                ${hasChristmas ? `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span>🎄 크리스마스 테마</span>
                        <label class="switch">
                            <input type="checkbox" ${isChristmasActive ? 'checked' : ''} onchange="toggleThemeFromInventory()">
                            <span class="slider"></span>
                        </label>
                    </div>` : '<p style="color:#888;">보유한 테마가 없습니다.</p>'}
            </div>
        `;
    } catch(e) { return ''; }
}

// ✅ 테마 토글 함수
window.toggleThemeFromInventory = async function() {
    if(!isLoggedIn()) return;
    const uid = getUserId();
    
    const snap = await db.ref("users/" + uid + "/activeTheme").once("value");
    const current = snap.val() || 'default';
    const next = current === 'christmas' ? 'default' : 'christmas';
    
    await db.ref("users/" + uid + "/activeTheme").set(next);
    
    if(typeof applyTheme === 'function') applyTheme(next, true);
    else location.reload();
    
    showToastNotification("테마 변경", next === 'christmas' ? "🎄 크리스마스 테마 적용!" : "✅ 기본 테마 적용");
}

// ✅ 최종 초기화 (window.onload 대체)
window.addEventListener("load", () => {
    console.log("🚀 시스템 통합 초기화...");
    
    // 리스너 등록
    setupArticlesListener();
    
    // 설정 및 데이터 로드 (병렬)
    Promise.all([
        loadBannedWords(),
        loadCatchMindConfig(),
        loadCouponConfig(),
        loadHintPenaltyFromFirebase(),
        loadShopConfig()  // ⭐ 추가
    ]).then(() => {
        console.log("📦 모든 설정 로드 완료");
    });
    
    // UI 초기화
    setupArticleForm();
    initialRoute();
    
    // 점검 모드 리스너
    initMaintenanceListener();
    
    // 팝업 표시 지연 실행
    setTimeout(() => {
        if(typeof showActivePopupsToUser === 'function') showActivePopupsToUser();
    }, 1500);
});

console.log("✅ script1.js 업데이트 완료 (Parts 1-17 Integrated)");

// ===== Part 18: 테마 및 사운드 시스템 (필수 기능 구현) =====

// ✅ 전역 오디오 컨텍스트 및 변수
let audioContext = null;
let bgmSource = null;
let bgmBuffer = null;
window.soundEnabled = false;
window.bgmEnabled = false;

// ✅ 테마 적용 함수 (최적화)
window.applyTheme = function(themeName, saveToDb = false) {
    const root = document.documentElement;
    
    // 테마별 CSS 변수 설정
    if (themeName === 'christmas') {
        root.style.setProperty('--primary-color', '#d32f2f'); // 크리스마스 레드
        root.style.setProperty('--secondary-color', '#2e7d32'); // 크리스마스 그린
        root.style.setProperty('--background-color', '#f8f9fa');
        // 눈 내리는 효과 등 추가 가능
        document.body.classList.add('theme-christmas');
    } else {
        // 기본 테마 (복원)
        root.style.removeProperty('--primary-color');
        root.style.removeProperty('--secondary-color');
        root.style.removeProperty('--background-color');
        document.body.classList.remove('theme-christmas');
    }

    // DB 저장 (옵션)
    if (saveToDb && isLoggedIn()) {
        const uid = getUserId();
        db.ref(`users/${uid}/activeTheme`).set(themeName);
    }
};

// ✅ 사용자 테마 로드 및 적용
async function loadAndApplyUserTheme() {
    if (!isLoggedIn()) return;
    const uid = getUserId();
    
    try {
        const snap = await db.ref(`users/${uid}/activeTheme`).once('value');
        const theme = snap.val() || 'default';
        applyTheme(theme, false);
    } catch (e) {
        console.error("테마 로드 실패:", e);
    }
}

// ✅ 사운드 시스템 초기화 (사용자 상호작용 후 실행)
window.initSoundSystem = async function() {
    if (audioContext) return;
    
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        
        // BGM 파일 로드 (예시 경로, 실제 파일 필요)
        const response = await fetch('./sounds/bgm.mp3');
        const arrayBuffer = await response.arrayBuffer();
        bgmBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        console.log("🔊 사운드 시스템 초기화 완료");
    } catch (e) {
        console.warn("⚠️ 사운드 파일 로드 실패 또는 미지원:", e);
    }
};

// ✅ 사용자 사운드 설정 로드
async function loadAndApplyUserSounds() {
    if (!isLoggedIn()) return;
    const uid = getUserId();
    
    try {
        const [soundSnap, bgmSnap] = await Promise.all([
            db.ref(`users/${uid}/activeSounds`).once('value'),
            db.ref(`users/${uid}/activeBGM`).once('value')
        ]);
        
        window.soundEnabled = soundSnap.val() || false;
        window.bgmEnabled = bgmSnap.val() || false;
        
        if (window.bgmEnabled) playBGM();
    } catch (e) {
        console.error("사운드 설정 로드 실패:", e);
    }
}

// ✅ BGM 재생
window.playBGM = function() {
    if (!audioContext || !bgmBuffer || !window.bgmEnabled) return;
    
    // 이미 재생 중이면 중단 후 재생
    if (bgmSource) stopBGM();
    
    bgmSource = audioContext.createBufferSource();
    bgmSource.buffer = bgmBuffer;
    bgmSource.loop = true;
    bgmSource.connect(audioContext.destination);
    bgmSource.start(0);
};

// ✅ BGM 정지
window.stopBGM = function() {
    if (bgmSource) {
        try {
            bgmSource.stop();
        } catch(e) {}
        bgmSource = null;
    }
};

// ✅ 효과음 재생 (효과음 이름 받음)
window.playSoundEffect = function(effectName) {
    if (!window.soundEnabled || !audioContext) return;
    
    // 여기에 효과음별 로직 추가 (필요 시 구현)
    // 예: const buffer = effectBuffers[effectName]; ...
};

console.log("✅ Part 18 테마/사운드 완료");

// ===== Part 19: 상점 및 인벤토리 시스템 (수정됨 - 디버깅 강화) =====

// ✅ 인벤토리 페이지 표시 (완전 수정)
window.showInventoryPage = async function() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다.");
        return;
    }
    
    hideAll();
    let section = document.getElementById("inventorySection");
    if(!section) {
        section = document.createElement("div");
        section.id = "inventorySection";
        section.className = "page-section";
        document.querySelector("main").appendChild(section);
    }
    section.classList.add("active");
    updateURL('inventory');
    
    section.innerHTML = '<div style="text-align:center; padding:40px;"><div class="loading-spinner"></div><p>로딩 중...</p></div>';
    
    const uid = getUserId();
    
    try {
        // Firebase 데이터 로드
        const [invSnap, userSnap, decorSnap] = await Promise.all([
            db.ref(`users/${uid}/inventory`).once('value'),
            db.ref(`users/${uid}`).once('value'),
            db.ref(`users/${uid}/activeDecorations`).once('value')
        ]);
        
        // 인벤토리 데이터 처리
        let inventory = invSnap.val() || [];
        
        console.log("📦 원본 인벤토리:", inventory);
        console.log("📦 타입:", typeof inventory);
        console.log("📦 배열 여부:", Array.isArray(inventory));
        
        // 객체를 배열로 변환
        if(typeof inventory === 'object' && !Array.isArray(inventory)) {
            inventory = Object.values(inventory).filter(item => 
                item && typeof item === 'string' && item !== 'null' && item !== 'undefined'
            );
            console.log("📦 변환됨:", inventory);
        }
        
        // 배열 필터링
        if(Array.isArray(inventory)) {
            inventory = inventory.filter(item => 
                item && typeof item === 'string' && item !== 'null' && item !== 'undefined' && item.trim() !== ''
            );
            console.log("📦 필터링됨:", inventory);
        }
        
        const userData = userSnap.val() || {};
        const activeTheme = userData.activeTheme || 'default';
        const activeDecorations = decorSnap.val() || [];
        
        console.log("👤 사용자 데이터:", userData);
        console.log("🎨 활성 테마:", activeTheme);
        console.log("✨ 활성 장식:", activeDecorations);
        
        // 아이템 목록 정의 (shop-config.json과 일치)
        const allItems = [
            { id: 'christmas_theme', name: '🎄 크리스마스 테마', type: 'theme', desc: '특별한 테마로 변경합니다.' },
            { id: 'christmas_sounds', name: '🔔 크리스마스 사운드', type: 'sound', desc: '효과음 패키지입니다.' },
            { id: 'christmas_bgm', name: '🎵 크리스마스 BGM', type: 'bgm', desc: '배경음악 패키지입니다.' },
            { id: 'decoration_santa_hat', name: '🎅 산타 모자', type: 'decoration', desc: '프로필 장식입니다.' },
            { id: 'decoration_snowflake', name: '❄️ 눈송이 테두리', type: 'decoration', desc: '프로필 장식입니다.' },
            { id: 'decoration_antlers', name: '🦌 루돌프 뿔', type: 'decoration', desc: '프로필 장식입니다.' },
            { id: 'decoration_lights', name: '💡 크리스마스 전구', type: 'decoration', desc: '프로필 장식입니다.' },
            { id: 'decoration_snowman', name: '⛄ 눈사람 친구', type: 'decoration', desc: '프로필 장식입니다.' },
            { id: 'decoration_gift', name: '🎁 선물 뱃지', type: 'decoration', desc: '프로필 장식입니다.' }
        ];
        
        const myItems = allItems.filter(item => inventory.includes(item.id));
        
        console.log("✅ 매칭된 아이템:", myItems);
        
        section.innerHTML = `
            <div style="max-width:900px; margin:0 auto; padding:20px;">
                <h2 style="color:#333; margin-bottom:20px;"><i class="fas fa-box-open"></i> 내 인벤토리</h2>
                
                <!-- 디버깅 정보 -->
                <details style="background:#fff3cd; padding:15px; border-radius:8px; margin-bottom:20px; cursor:pointer;">
                    <summary style="font-weight:600; color:#856404; cursor:pointer;">🔍 디버깅 정보 (클릭하여 열기)</summary>
                    <div style="margin-top:10px; font-size:12px; font-family:monospace; color:#333;">
                        <strong>원본 데이터 타입:</strong> ${typeof invSnap.val()}<br>
                        <strong>배열 여부:</strong> ${Array.isArray(inventory)}<br>
                        <strong>아이템 개수:</strong> ${inventory.length}<br>
                        <strong>아이템 목록:</strong> ${JSON.stringify(inventory)}<br>
                        <strong>매칭된 아이템:</strong> ${myItems.length}개<br>
                        <strong>활성 테마:</strong> ${activeTheme}<br>
                        <strong>활성 장식:</strong> ${JSON.stringify(activeDecorations)}<br>
                        <strong>Firebase 경로:</strong> users/${uid}/inventory
                    </div>
                </details>
                
                ${myItems.length === 0 ? 
                    `<div style="text-align:center; padding:80px 20px; background:white; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                        <div style="font-size:64px; margin-bottom:20px; opacity:0.3;">📦</div>
                        <p style="color:#868e96; font-size:18px; margin-bottom:10px;">보유한 아이템이 없습니다</p>
                        <p style="color:#adb5bd; font-size:14px; margin-bottom:20px;">상점에서 아이템을 구매해보세요!</p>
                        
                        <div style="background:#e3f2fd; padding:20px; border-radius:8px; text-align:left; max-width:600px; margin:20px auto;">
                            <strong>💡 테스트 방법:</strong><br><br>
                            1. 하단 "테스트 아이템 추가" 버튼 클릭<br>
                            2. Firebase 콘솔에서 직접 데이터 추가<br>
                            3. 상점에서 실제 구매<br><br>
                            
                            ${isAdmin() ? `
                                <button onclick="addTestItems()" class="btn-warning" style="width:100%; margin-top:10px;">
                                    🧪 테스트 아이템 추가 (관리자)
                                </button>
                                <button onclick="viewFirebaseData()" class="btn-info" style="width:100%; margin-top:10px;">
                                    🔍 Firebase 데이터 확인
                                </button>
                            ` : ''}
                        </div>
                    </div>` : 
                    `<div class="inventory-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:20px;">
                        ${myItems.map(item => {
                            let actionButton = '';
                            let statusBadge = '';
                            
                            if(item.type === 'theme') {
                                const isActive = activeTheme === 'christmas';
                                statusBadge = isActive ? '<div style="background:#4caf50; color:white; padding:3px 10px; border-radius:12px; font-size:11px; margin-bottom:10px; display:inline-block;">✓ 적용 중</div>' : '';
                                actionButton = `<button onclick="toggleThemeFromInventory()" class="btn-block ${isActive ? 'btn-danger' : 'btn-primary'}" style="margin-top:10px;">
                                    ${isActive ? '❌ 적용 해제' : '✅ 적용하기'}
                                </button>`;
                            } else if(item.type === 'sound') {
                                actionButton = `<button onclick="alert('설정 메뉴에서 효과음을 켜거나 끌 수 있습니다.')" class="btn-block btn-secondary" style="margin-top:10px;">📱 설정에서 관리</button>`;
                            } else if(item.type === 'bgm') {
                                actionButton = `<button onclick="alert('설정 메뉴에서 BGM을 켜거나 끌 수 있습니다.')" class="btn-block btn-secondary" style="margin-top:10px;">📱 설정에서 관리</button>`;
                            } else if(item.type === 'decoration') {
                                const isActive = Array.isArray(activeDecorations) && activeDecorations.includes(item.id);
                                statusBadge = isActive ? '<div style="background:#4caf50; color:white; padding:3px 10px; border-radius:12px; font-size:11px; margin-bottom:10px; display:inline-block;">✓ 착용 중</div>' : '';
                                actionButton = `<button onclick="toggleDecoration('${item.id}')" class="btn-block ${isActive ? 'btn-danger' : 'btn-success'}" style="margin-top:10px;">
                                    ${isActive ? '❌ 장식 해제' : '✨ 장식 적용'}
                                </button>`;
                            }
                            
                            return `
                                <div class="item-card" style="background:white; padding:25px; border-radius:12px; border:2px solid #e9ecef; text-align:center; transition:all 0.3s; box-shadow:0 2px 8px rgba(0,0,0,0.05); position:relative;">
                                    ${statusBadge}
                                    <div style="font-size:48px; margin-bottom:15px;">${item.type === 'theme' ? '🎨' : item.type === 'sound' ? '🎵' : item.type === 'bgm' ? '🎶' : item.type === 'decoration' ? '✨' : '🎁'}</div>
                                    <h4 style="margin-bottom:10px; color:#212529; font-size:16px;">${item.name}</h4>
                                    <p style="font-size:13px; color:#6c757d; margin-bottom:15px; min-height:40px;">${item.desc}</p>
                                    ${actionButton}
                                </div>
                            `;
                        }).join('')}
                    </div>`
                }
                
                <div style="margin-top:30px; text-align:center; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                    <button onclick="showStorePage()" class="btn-warning" style="padding:12px 30px;">
                        <i class="fas fa-store"></i> 상점 가기
                    </button>
                    ${isAdmin() ? `
                        <button onclick="resetInventoryData()" class="btn-info" style="padding:12px 30px;">
                            🔧 데이터 재설정
                        </button>
                    ` : ''}
                    <button onclick="showMoreMenu()" class="btn-secondary" style="padding:12px 30px;">뒤로가기</button>
                </div>
            </div>
        `;
    } catch(e) {
        console.error("❌ 인벤토리 로드 실패:", e);
        section.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <p style="color:#f44336; margin-bottom:20px; font-size:18px;">❌ 정보를 불러오지 못했습니다.</p>
                <p style="color:#868e96; font-size:14px; margin-bottom:20px;">${e.message}</p>
                <button onclick="showInventoryPage()" class="btn-primary" style="margin:10px;">
                    🔄 다시 시도
                </button>
                <button onclick="showMoreMenu()" class="btn-secondary" style="margin:10px;">뒤로가기</button>
            </div>
        `;
    }
};

// ✅ 테스트 아이템 추가 (관리자용)
window.addTestItems = async function() {
    if(!isAdmin()) {
        alert("관리자만 사용할 수 있습니다!");
        return;
    }
    
    if(!confirm("테스트용 아이템을 추가하시겠습니까?\n\n추가될 아이템:\n- 크리스마스 테마\n- 크리스마스 사운드\n- 산타 모자")) {
        return;
    }
    
    const uid = getUserId();
    
    try {
        showLoadingIndicator("테스트 아이템 추가 중...");
        
        const testItems = [
            'christmas_theme',
            'christmas_sounds',
            'decoration_santa_hat'
        ];
        
        // 기존 인벤토리 로드
        const snapshot = await db.ref(`users/${uid}/inventory`).once('value');
        let currentInventory = snapshot.val() || [];
        
        // 배열로 변환
        if(typeof currentInventory === 'object' && !Array.isArray(currentInventory)) {
            currentInventory = Object.values(currentInventory);
        }
        
        // 테스트 아이템 추가 (중복 제거)
        const newInventory = [...new Set([...currentInventory, ...testItems])];
        
        // Firebase에 저장
        await db.ref(`users/${uid}/inventory`).set(newInventory);
        
        hideLoadingIndicator();
        alert(`✅ 테스트 아이템이 추가되었습니다!\n\n총 ${newInventory.length}개 아이템`);
        
        // 페이지 새로고침
        showInventoryPage();
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("테스트 아이템 추가 실패:", error);
        alert("추가 실패: " + error.message);
    }
}

// ✅ Firebase 데이터 확인 (관리자용)
window.viewFirebaseData = async function() {
    if(!isAdmin()) {
        alert("관리자만 사용할 수 있습니다!");
        return;
    }
    
    const uid = getUserId();
    
    try {
        showLoadingIndicator("데이터 확인 중...");
        
        const snapshot = await db.ref(`users/${uid}`).once('value');
        const userData = snapshot.val();
        
        hideLoadingIndicator();
        
        const dataStr = JSON.stringify(userData, null, 2);
        
        const modal = document.createElement('div');
        modal.id = 'firebaseDataModal';
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:800px; max-height:80vh; overflow:auto;">
                <div class="modal-header">
                    <h3>🔍 Firebase 데이터</h3>
                    <button onclick="document.getElementById('firebaseDataModal').remove()" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding:20px;">
                    <p style="margin-bottom:15px; color:#666;">경로: <code>users/${uid}</code></p>
                    <textarea readonly style="width:100%; height:400px; font-family:monospace; font-size:12px; padding:10px; border:1px solid #ddd; border-radius:4px;">${dataStr}</textarea>
                    <button onclick="navigator.clipboard.writeText(\`${dataStr.replace(/`/g, '\\`')}\`).then(() => alert('복사되었습니다!'))" class="btn-primary btn-block" style="margin-top:15px;">
                        📋 데이터 복사
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch(error) {
        hideLoadingIndicator();
        alert("데이터 확인 실패: " + error.message);
    }
}

// ✅ 인벤토리 데이터 재설정 (수정됨)
window.resetInventoryData = async function() {
    if(!isAdmin()) {
        alert("관리자만 사용할 수 있습니다!");
        return;
    }
    
    if(!confirm("인벤토리 데이터 구조를 재설정하시겠습니까?\n\n⚠️ 주의: 기존 아이템은 보존되지만 중복이 제거됩니다.")) {
        return;
    }
    
    const uid = getUserId();
    
    try {
        showLoadingIndicator("데이터 재설정 중...");
        
        // 기존 데이터 로드
        const snapshot = await db.ref(`users/${uid}/inventory`).once('value');
        let currentData = snapshot.val() || [];
        
        console.log("현재 데이터:", currentData);
        
        // 배열로 변환
        let newInventory = [];
        if(typeof currentData === 'object' && !Array.isArray(currentData)) {
            newInventory = Object.values(currentData).filter(item => 
                item && typeof item === 'string' && item !== 'null' && item !== 'undefined'
            );
        } else if(Array.isArray(currentData)) {
            newInventory = currentData.filter(item => 
                item && typeof item === 'string' && item !== 'null' && item !== 'undefined'
            );
        }
        
        // 중복 제거 및 빈 문자열 제거
        newInventory = [...new Set(newInventory)].filter(item => item.trim() !== '');
        
        console.log("재설정될 데이터:", newInventory);
        
        // Firebase에 배열로 저장
        await db.ref(`users/${uid}/inventory`).set(newInventory);
        
        hideLoadingIndicator();
        alert(`✅ 재설정 완료!\n\n보유 아이템: ${newInventory.length}개\n아이템 목록: ${newInventory.join(', ')}`);
        
        // 페이지 새로고침
        showInventoryPage();
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("재설정 실패:", error);
        alert("재설정 실패: " + error.message);
    }
}

// ✅ 상점 페이지 (수정됨 - 인벤토리 확인 강화)
window.showStorePage = async function() {
    hideAll();
    let section = document.getElementById("storeSection");
    if(!section) {
        section = document.createElement("div");
        section.id = "storeSection";
        section.className = "page-section";
        document.querySelector("main").appendChild(section);
    }
    section.classList.add("active");
    
    const userMoney = await getUserMoney();
    const uid = getUserId();
    
    // 인벤토리 로드
    const invSnapshot = await db.ref(`users/${uid}/inventory`).once('value');
    let inventory = invSnapshot.val() || [];
    
    // 배열로 변환
    if(typeof inventory === 'object' && !Array.isArray(inventory)) {
        inventory = Object.values(inventory);
    }
    
    console.log("🛒 상점 - 현재 인벤토리:", inventory);
    
    // 판매 아이템 목록
    const shopItems = [
        { id: 'christmas_theme', name: '🎄 크리스마스 테마', price: 1000000, desc: '특별한 테마로 변경합니다.', unlocks: 'christmas_theme' },
        { id: 'christmas_sounds', name: '🔔 크리스마스 사운드', price: 200000, desc: '효과음 패키지입니다.', unlocks: 'christmas_sounds' },
        { id: 'christmas_bgm', name: '🎵 크리스마스 BGM', price: 350000, desc: '배경음악 패키지입니다.', unlocks: 'christmas_bgm' },
        { id: 'santa_hat', name: '🎅 산타 모자', price: 15000, desc: '프로필 장식입니다.', unlocks: 'decoration_santa_hat' },
        { id: 'snowflake_border', name: '❄️ 눈송이 테두리', price: 10000, desc: '프로필 장식입니다.', unlocks: 'decoration_snowflake' },
        { id: 'reindeer_antlers', name: '🦌 루돌프 뿔', price: 18000, desc: '프로필 장식입니다.', unlocks: 'decoration_antlers' },
        { id: 'christmas_lights', name: '💡 크리스마스 전구', price: 22000, desc: '프로필 장식입니다.', unlocks: 'decoration_lights' },
        { id: 'snowman_buddy', name: '⛄ 눈사람 친구', price: 20000, desc: '프로필 장식입니다.', unlocks: 'decoration_snowman' },
        { id: 'gift_badge', name: '🎁 선물 뱃지', price: 12000, desc: '프로필 장식입니다.', unlocks: 'decoration_gift' }
    ];
    
    section.innerHTML = `
        <div style="max-width:900px; margin:0 auto; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; flex-wrap:wrap; gap:15px;">
                <h2 style="color:#c62828; margin:0;"><i class="fas fa-store"></i> 포인트 상점</h2>
                <div style="background:#fff3cd; padding:10px 20px; border-radius:25px; font-weight:bold; color:#856404; border:2px solid #ffc107;">
                    💰 보유 : ${userMoney.toLocaleString()}원
                </div>
            </div>
            
            <div class="shop-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:20px;">
                ${shopItems.map(item => {
                    const owned = inventory.includes(item.unlocks);
                    const canAfford = userMoney >= item.price;
                    
                    return `
                        <div class="shop-card" style="background:white; padding:25px; border-radius:12px; border:2px solid ${owned ? '#4caf50' : '#eee'}; box-shadow:0 4px 12px rgba(0,0,0,0.08); text-align:center; transition:all 0.3s; opacity:${owned ? 0.7 : 1};">
                            ${owned ? '<div style="background:#4caf50; color:white; padding:3px 10px; border-radius:12px; font-size:11px; position:absolute; top:10px; right:10px;">✓ 보유중</div>' : ''}
                            
                            <div style="font-size:48px; margin-bottom:15px;">${item.name.split(' ')[0]}</div>
                            <h4 style="margin-bottom:12px; color:#212529;">${item.name}</h4>
                            <p style="color:#6c757d; font-size:13px; min-height:45px; margin-bottom:15px;">${item.desc}</p>
                            <div style="font-weight:900; color:#d32f2f; margin:15px 0; font-size:20px;">${item.price.toLocaleString()}원</div>
                            <button onclick="buyItem('${item.id}', ${item.price}, '${item.name}', '${item.unlocks}')" 
                                    class="btn-block ${owned ? 'btn-secondary' : (canAfford ? 'btn-primary' : 'btn-secondary')}" 
                                    style="padding:10px;"
                                    ${owned ? 'disabled' : ''}>
                                ${owned ? '✓ 구매완료' : (canAfford ? '🛒 구매하기' : '💰 포인트 부족')}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div style="margin-top:40px; text-align:center; display:flex; gap:10px; justify-content:center;">
                <button onclick="showInventoryPage()" class="btn-secondary" style="padding:12px 30px;">
                    <i class="fas fa-box"></i> 내 인벤토리
                </button>
                <button onclick="showMoreMenu()" class="btn-secondary" style="padding:12px 30px;">뒤로가기</button>
            </div>
        </div>
    `;
};

// ✅ 아이템 구매 (수정됨 - unlocks 파라미터 추가)
window.buyItem = async function(itemId, price, itemName, unlocks) {
    if(!confirm(`${itemName}을(를) ${price.toLocaleString()}원에 구매하시겠습니까?`)) return;
    
    const uid = getUserId();
    const currentMoney = await getUserMoney();
    
    if(currentMoney < price) {
        return alert("💰 포인트가 부족합니다!");
    }
    
    try {
        showLoadingIndicator("구매 처리 중...");
        
        // 인벤토리 확인
        const invSnap = await db.ref(`users/${uid}/inventory`).once('value');
        let inventory = invSnap.val() || [];
        
        // 배열로 변환
        if(typeof inventory === 'object' && !Array.isArray(inventory)) {
            inventory = Object.values(inventory);
        }
        
        // 중복 구매 체크
        if(inventory.includes(unlocks)) {
            hideLoadingIndicator();
            return alert("이미 보유하고 있는 아이템입니다.");
        }
        
        // 1. 돈 차감
        await updateUserMoney(-price, `아이템 구매: ${itemName}`);
        
        // 2. 인벤토리에 추가
        inventory.push(unlocks);
        await db.ref(`users/${uid}/inventory`).set(inventory);
        
        // 3. 구매 이력 저장
        await db.ref(`users/${uid}/purchases`).push({
            itemId: itemId,
            itemName: itemName,
            unlocks: unlocks,
            price: price,
            purchasedAt: Date.now()
        });
        
        hideLoadingIndicator();
        alert(`✅ ${itemName} 구매 완료!\n\n인벤토리를 확인하세요.`);
        
        console.log("구매 완료 - 인벤토리:", inventory);
        
        showStorePage(); // 화면 갱신
        
    } catch(e) {
        hideLoadingIndicator();
        console.error("구매 실패:", e);
        alert("구매 중 오류가 발생했습니다: " + e.message);
    }
};

// ===== Part 19 수정: 장식 토글 시 헤더 업데이트 =====
// 🔥 장식 토글 (헤더 프로필 자동 업데이트)
window.toggleDecoration = async function(decorId) {
    if(!isLoggedIn()) return;
    const uid = getUserId();
    const user = auth.currentUser;
    
    try {
        const snap = await db.ref(`users/${uid}/activeDecorations`).once('value');
        let list = snap.val() || [];
        
        if(!Array.isArray(list)) {
            list = Object.values(list);
        }
        
        if(list.includes(decorId)) {
            list = list.filter(id => id !== decorId);
            showToastNotification("✨ 장식 해제", "장식이 제거되었습니다.", null);
        } else {
            list.push(decorId);
            showToastNotification("✨ 장식 적용", "장식이 적용되었습니다!", null);
        }
        
        await db.ref(`users/${uid}/activeDecorations`).set(list);
        
        // 🔥 헤더 프로필 버튼 즉시 업데이트
        if(user) {
            const photoSnapshot = await db.ref("users/" + user.uid + "/profilePhoto").once("value");
            const photoUrl = photoSnapshot.val();
            
            const headerBtn = document.getElementById("headerProfileBtn");
            if(headerBtn && photoUrl) {
                const profileHTML = await createProfilePhotoWithDecorations(photoUrl, 32, user.email);
                headerBtn.innerHTML = profileHTML;
            }
        }
        
        // 인벤토리 페이지 새로고침
        showInventoryPage();
        
        // 전체 프로필 장식 로드 (다른 곳에도 반영)
        if(typeof loadAllProfileDecorations === 'function') {
            loadAllProfileDecorations();
        }
    } catch(error) {
        console.error("장식 토글 실패:", error);
        alert("오류: " + error.message);
    }
}

// ✅ 테마 토글
window.toggleThemeFromInventory = async function() {
    if(!isLoggedIn()) return;
    const uid = getUserId();
    
    try {
        const snap = await db.ref(`users/${uid}/activeTheme`).once('value');
        const current = snap.val() || 'default';
        const newTheme = (current === 'christmas') ? 'default' : 'christmas';
        
        await db.ref(`users/${uid}/activeTheme`).set(newTheme);
        
        if(typeof applyTheme === 'function') {
            applyTheme(newTheme, true);
        }
        
        showToastNotification(
            "🎨 테마 변경",
            newTheme === 'christmas' ? "🎄 크리스마스 테마 적용!" : "📰 기본 테마 적용",
            null
        );
        
        showInventoryPage();
    } catch(error) {
        console.error("테마 토글 실패:", error);
        alert("오류: " + error.message);
    }
}

console.log("✅ Part 19 상점/인벤토리 완료 (디버깅 강화)");

// ===== Part 20: 최종 유틸리티 및 보정 (마무리) =====

// ✅ 이미지 로딩 실패 시 대체 이미지 처리
window.handleImageError = function(img) {
    img.onerror = null;
    img.src = 'https://via.placeholder.com/150?text=No+Image'; // 대체 이미지 URL
};

// ✅ 날짜 포맷팅 유틸리티
window.formatDate = function(timestamp) {
    if(!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
};

// ✅ 관리자용: 데이터베이스 정리 (주의: 개발용)
window.adminCleanup = async function() {
    if(!isAdmin()) return;
    if(!confirm("⚠️ 데이터베이스를 정리하시겠습니까? (오래된 알림 등 삭제)")) return;
    
    // 예: 30일 지난 알림 삭제 로직 등 구현 가능
    console.log("관리자 정리 기능 실행됨");
    alert("기능 준비 중입니다.");
};

console.log("🎉 script1.js 완전 통합 완료 (All Parts 1-20 Loaded)");

// ===== Part 21: 사용자 프로필 페이지 시스템 + 프로필 설정 추가 =====

// 🔥 프로필 설정 페이지 추가 (내 프로필 보기 버튼 추가)
window.showProfileSettingsPage = async function() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    hideAll();
    
    let section = document.getElementById("profileSettingsSection");
    if(!section) {
        // 🔥 수정: main이 없을 경우 body 사용
        const container = document.querySelector("main") || document.body;
        section = document.createElement("section");
        section.id = "profileSettingsSection";
        section.className = "page-section";
        container.appendChild(section);
    }
    
    section.classList.add("active");
    
    const userEmail = getUserEmail();
    
    section.innerHTML = `
        <div style="max-width:700px; margin:0 auto; padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <h2 style="color:#c62828; margin:0;">⚙️ 프로필 설정</h2>
                <button onclick="showSettings()" class="btn-secondary">
                    <i class="fas fa-arrow-left"></i> 뒤로
                </button>
            </div>
            
            <!-- ✅ 내 프로필 보기 버튼 추가 -->
            <div style="background:white; border-radius:12px; padding:30px; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin-bottom:20px;">
                <h3 style="margin:0 0 20px 0;">👤 내 프로필</h3>
                <button onclick="showUserProfile('${userEmail}')" class="btn-success btn-block">
                    <i class="fas fa-id-card"></i> 내 프로필 보기
                </button>
            </div>
            
            <div style="background:white; border-radius:12px; padding:30px; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin-bottom:20px;">
                <h3 style="margin:0 0 20px 0;">📸 프로필 사진</h3>
                <button onclick="openProfilePhotoModal()" class="btn-primary btn-block">
                    <i class="fas fa-camera"></i> 프로필 사진 변경
                </button>
            </div>
            
            <div style="background:white; border-radius:12px; padding:30px; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin-bottom:20px;">
                <h3 style="margin:0 0 20px 0;">✏️ 닉네임</h3>
                <button onclick="changeNickname()" class="btn-secondary btn-block">
                    <i class="fas fa-edit"></i> 닉네임 변경 (1회)
                </button>
            </div>
            
            <div style="background:white; border-radius:12px; padding:30px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin:0 0 20px 0;">🎨 테마</h3>
                <div id="themeSettings">로딩 중...</div>
            </div>
        </div>
    `;
    
    // 테마 설정 로드
    loadThemeSettings();
    
    updateURL('profileSettings');
}

// ✅ 사용자 프로필 페이지 표시
window.showUserProfile = async function(userEmail) {
    if(!userEmail) {
        alert("사용자 정보를 찾을 수 없습니다.");
        return;
    }
    
    hideAll();
    
    let section = document.getElementById("userProfileSection");
    if(!section) {
        // 🔥 수정: main이 없을 경우 body 사용
        const container = document.querySelector("main") || document.body;
        section = document.createElement("div");
        section.id = "userProfileSection";
        section.className = "page-section";
        container.appendChild(section);
    }
    section.classList.add("active");
    
    section.innerHTML = `
        <div style="max-width:900px; margin:0 auto; padding:20px;">
            <div style="text-align:center; padding:60px 20px;">
                <div style="width:60px; height:60px; border:4px solid #f3f3f3; border-top:4px solid #c62828; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 20px;"></div>
                <p style="color:#666;">프로필 로딩 중...</p>
            </div>
        </div>
    `;
    
    updateURL('profile', null, userEmail);
    
};



// 테마 설정 로드
async function loadThemeSettings() {
    const container = document.getElementById("themeSettings");
    if(!container) return;
    
    const uid = getUserId();
    const invSnap = await db.ref(`users/${uid}/inventory`).once('value');
    const inventory = invSnap.val() || [];
    
    const hasChristmas = inventory.includes('christmas_theme');
    
    if(hasChristmas) {
        const themeSnap = await db.ref(`users/${uid}/activeTheme`).once('value');
        const activeTheme = themeSnap.val() || 'default';
        
        container.innerHTML = `
            <label class="toggle-label">
                <input type="checkbox" ${activeTheme === 'christmas' ? 'checked' : ''} onchange="toggleThemeFromInventory()">
                <span class="toggle-slider"></span>
                <div class="toggle-text">
                    <strong>🎄 크리스마스 테마</strong>
                    <small>특별한 테마로 변경합니다</small>
                </div>
            </label>
        `;
    } else {
        container.innerHTML = '<p style="color:#868e96; text-align:center; padding:20px;">보유한 테마가 없습니다.</p>';
    }
}

// ✅ 사용자 프로필 페이지 표시
window.showUserProfile = async function(userEmail) {
    if(!userEmail) {
        alert("사용자 정보를 찾을 수 없습니다.");
        return;
    }
    
    hideAll();
    
    let section = document.getElementById("userProfileSection");
    if(!section) {
        section = document.createElement("div");
        section.id = "userProfileSection";
        section.className = "page-section";
        document.querySelector("main").appendChild(section);
    }
    section.classList.add("active");
    
    section.innerHTML = `
        <div style="max-width:900px; margin:0 auto; padding:20px;">
            <div style="text-align:center; padding:60px 20px;">
                <div style="width:60px; height:60px; border:4px solid #f3f3f3; border-top:4px solid #c62828; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 20px;"></div>
                <p style="color:#666;">프로필 로딩 중...</p>
            </div>
        </div>
    `;
    
    updateURL('profile', null, userEmail);
    
    try {
        // 사용자 데이터 로드
        const usersSnapshot = await db.ref("users").once("value");
        const usersData = usersSnapshot.val() || {};
        
        let userData = null;
        let userUid = null;
        
        for(const [uid, data] of Object.entries(usersData)) {
            if(data && data.email === userEmail) {
                userData = data;
                userUid = uid;
                break;
            }
        }
        
        if(!userData) {
            section.innerHTML = `
                <div style="text-align:center; padding:60px 20px;">
                    <p style="color:#f44336; font-size:18px;">사용자를 찾을 수 없습니다.</p>
                    <button onclick="showArticles()" class="btn-primary" style="margin-top:20px;">홈으로</button>
                </div>
            `;
            return;
        }
        
        // 기사 및 댓글 데이터 로드
        const [articlesSnapshot, commentsSnapshot] = await Promise.all([
            db.ref("articles").once("value"),
            db.ref("comments").once("value")
        ]);
        
        const articlesData = articlesSnapshot.val() || {};
        const commentsData = commentsSnapshot.val() || {};
        
        // 사용자의 기사 필터링
        const userArticles = Object.values(articlesData).filter(a => a.authorEmail === userEmail);
        
        // 사용자의 댓글 필터링
        const userComments = [];
        Object.entries(commentsData).forEach(([articleId, articleComments]) => {
            Object.entries(articleComments).forEach(([commentId, comment]) => {
                if(comment.authorEmail === userEmail) {
                    userComments.push({...comment, articleId, commentId});
                }
            });
        });
        
        // 통계 계산
        const totalViews = userArticles.reduce((sum, a) => sum + (a.views || 0), 0);
        const totalLikes = userArticles.reduce((sum, a) => sum + (a.likeCount || 0), 0);
        
        // 프로필 사진 로드
        const photoUrl = userData.profilePhoto || null;
        const profilePhotoHTML = await createProfilePhotoWithDecorations(photoUrl, 120, userEmail);
        
        // 자기소개
        const bio = userData.bio || '';
        const isOwnProfile = isLoggedIn() && (getUserEmail() === userEmail);
        
        // VIP 여부
        const isVIP = userData.isVIP || false;
        
        // 프로필 페이지 렌더링
        section.innerHTML = `
            <div style="max-width:900px; margin:0 auto; padding:20px;">
                <!-- 헤더 -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                    <h2 style="color:#c62828; margin:0;">👤 사용자 프로필</h2>
                    <button onclick="goBack()" class="btn-secondary">
                        <i class="fas fa-arrow-left"></i> 뒤로가기
                    </button>
                </div>
                
                <!-- 프로필 카드 -->
                <div style="background:white; border-radius:12px; padding:40px; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin-bottom:30px;">
                    <div style="text-align:center; margin-bottom:30px;">
                        ${profilePhotoHTML}
                        <h3 style="margin:20px 0 5px 0; font-size:28px; color:#212529;">
                            ${userData.newNickname || getNickname() || '익명'}
                            ${isVIP ? ' <span class="vip-badge">⭐ VIP</span>' : ''}
                        </h3>
                        <p style="color:#6c757d; margin:0;">${userEmail}</p>
                    </div>
                    
                    <!-- 통계 -->
                    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; margin-bottom:30px;">
                        <div style="text-align:center; padding:20px; background:#f8f9fa; border-radius:8px;">
                            <div style="font-size:28px; font-weight:900; color:#c62828; margin-bottom:5px;">${userArticles.length}</div>
                            <div style="font-size:13px; color:#6c757d;">작성한 기사</div>
                        </div>
                        <div style="text-align:center; padding:20px; background:#f8f9fa; border-radius:8px;">
                            <div style="font-size:28px; font-weight:900; color:#2196f3; margin-bottom:5px;">${totalViews.toLocaleString()}</div>
                            <div style="font-size:13px; color:#6c757d;">총 조회수</div>
                        </div>
                        <div style="text-align:center; padding:20px; background:#f8f9fa; border-radius:8px;">
                            <div style="font-size:28px; font-weight:900; color:#4caf50; margin-bottom:5px;">${totalLikes.toLocaleString()}</div>
                            <div style="font-size:13px; color:#6c757d;">총 좋아요</div>
                        </div>
                    </div>

                    <!-- 고유 ID -->
                    <div style="background:#e3f2fd; padding:15px; border-radius:8px; text-align:center; margin-bottom:20px;">
                        <div style="font-size:12px; color:#1976d2; margin-bottom:5px;">🆔 고유 ID</div>
                        <div style="font-size:20px; font-weight:900; color:#0d47a1; font-family:monospace;">
                            ${userData.userID || '미할당'}
                        </div>
                    </div>
                    
                    <!-- 자기소개 -->
                    <div style="border-top:1px solid #eee; padding-top:20px;">
                        <h4 style="margin:0 0 15px 0; color:#495057;">📝 자기소개</h4>
                        ${isOwnProfile ? `
                            <div id="bioDisplay" style="display:${bio ? 'block' : 'none'}; background:#f8f9fa; padding:15px; border-radius:8px; margin-bottom:10px; white-space:pre-wrap;">${bio || ''}</div>
                            <div id="bioEmpty" style="display:${bio ? 'none' : 'block'}; color:#868e96; text-align:center; padding:20px;">아직 작성된 자기소개가 없습니다.</div>
                            <div id="bioEditForm" style="display:none;">
                                <textarea id="bioInput" class="form-control" style="min-height:100px; resize:vertical;" placeholder="자기소개를 작성하세요...">${bio}</textarea>
                                <div style="display:flex; gap:10px; margin-top:10px;">
                                    <button onclick="saveBio()" class="btn-primary">저장</button>
                                    <button onclick="cancelBioEdit()" class="btn-secondary">취소</button>
                                </div>
                            </div>
                            <button id="editBioBtn" onclick="startBioEdit()" class="btn-secondary btn-block">
                                <i class="fas fa-edit"></i> 자기소개 수정
                            </button>
                        ` : `
                            ${bio ? 
                                `<div style="background:#f8f9fa; padding:15px; border-radius:8px; white-space:pre-wrap;">${bio}</div>` :
                                `<div style="color:#868e96; text-align:center; padding:20px;">작성된 자기소개가 없습니다.</div>`
                            }
                        `}
                    </div>
                </div>
                
                <!-- 작성한 기사 -->
                <div style="background:white; border-radius:12px; padding:30px; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin-bottom:30px;">
                    <h3 style="margin:0 0 20px 0; color:#212529;">📰 작성한 기사 (${userArticles.length})</h3>
                    ${userArticles.length > 0 ? `
                        <div style="display:grid; gap:15px;">
                            ${userArticles.slice(0, 10).map(article => `
                                <div onclick="showArticleDetail('${article.id}')" style="background:#f8f9fa; padding:15px; border-radius:8px; cursor:pointer; transition:all 0.3s; border-left:4px solid #c62828;" onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='#f8f9fa'">
                                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                                        <h4 style="margin:0; font-size:16px; color:#212529; flex:1;">${article.title}</h4>
                                        <span style="background:#c62828; color:white; padding:3px 8px; border-radius:12px; font-size:11px; white-space:nowrap; margin-left:10px;">${article.category}</span>
                                    </div>
                                    <div style="display:flex; gap:15px; color:#6c757d; font-size:13px;">
                                        <span>👁️ ${article.views || 0}</span>
                                        <span>👍 ${article.likeCount || 0}</span>
                                        <span>📅 ${article.date}</span>
                                    </div>
                                </div>
                            `).join('')}
                            ${userArticles.length > 10 ? `
                                <p style="text-align:center; color:#868e96; margin-top:10px;">... 외 ${userArticles.length - 10}개</p>
                            ` : ''}
                        </div>
                    ` : `
                        <p style="text-align:center; color:#868e96; padding:40px;">작성한 기사가 없습니다.</p>
                    `}
                </div>
                
                <!-- 작성한 댓글 -->
                <div style="background:white; border-radius:12px; padding:30px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin:0 0 20px 0; color:#212529;">💬 작성한 댓글 (${userComments.length})</h3>
                    ${userComments.length > 0 ? `
                        <div style="display:grid; gap:10px;">
                            ${userComments.slice(0, 10).map(comment => `
                                <div onclick="showArticleDetail('${comment.articleId}')" style="background:#f8f9fa; padding:12px; border-radius:8px; cursor:pointer; transition:all 0.3s;" onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='#f8f9fa'">
                                    <div style="color:#495057; font-size:14px; margin-bottom:5px;">${comment.text}</div>
                                    <div style="color:#868e96; font-size:12px;">${comment.timestamp}</div>
                                </div>
                            `).join('')}
                            ${userComments.length > 10 ? `
                                <p style="text-align:center; color:#868e96; margin-top:10px;">... 외 ${userComments.length - 10}개</p>
                            ` : ''}
                        </div>
                    ` : `
                        <p style="text-align:center; color:#868e96; padding:40px;">작성한 댓글이 없습니다.</p>
                    `}
                </div>
            </div>
        `;
        
        // 장식 로드
        if(typeof window.loadAllProfileDecorations === 'function') {
            await window.loadAllProfileDecorations();
        }
        
    } catch(error) {
        console.error("프로필 로드 실패:", error);
        section.innerHTML = `
            <div style="text-align:center; padding:60px 20px;">
                <p style="color:#f44336; font-size:18px; margin-bottom:10px;">프로필을 불러오는 중 오류가 발생했습니다.</p>
                <p style="color:#6c757d; margin-bottom:20px;">${error.message}</p>
                <button onclick="showArticles()" class="btn-primary">홈으로</button>
            </div>
        `;
    }
};

// ✅ 자기소개 수정 시작
window.startBioEdit = function() {
    document.getElementById("bioDisplay").style.display = "none";
    document.getElementById("bioEmpty").style.display = "none";
    document.getElementById("bioEditForm").style.display = "block";
    document.getElementById("editBioBtn").style.display = "none";
    document.getElementById("bioInput").focus();
};

// ✅ 자기소개 수정 취소
window.cancelBioEdit = function() {
    const currentBio = document.getElementById("bioDisplay").textContent;
    document.getElementById("bioDisplay").style.display = currentBio ? "block" : "none";
    document.getElementById("bioEmpty").style.display = currentBio ? "none" : "block";
    document.getElementById("bioEditForm").style.display = "none";
    document.getElementById("editBioBtn").style.display = "block";
};

// ✅ 자기소개 저장
window.saveBio = async function() {
    if(!isLoggedIn()) return;
    
    const bioInput = document.getElementById("bioInput");
    const newBio = bioInput.value.trim();
    
    if(newBio.length > 500) {
        alert("⚠️ 자기소개는 500자 이내로 작성해주세요!");
        return;
    }
    
    const uid = getUserId();
    
    try {
        showLoadingIndicator("저장 중...");
        
        await db.ref(`users/${uid}/bio`).set(newBio);
        
        hideLoadingIndicator();
        alert("✅ 자기소개가 저장되었습니다!");
        
        // 페이지 새로고침
        showUserProfile(getUserEmail());
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("자기소개 저장 실패:", error);
        alert("❌ 저장 실패: " + error.message);
    }
};

console.log("✅ Part 21 사용자 프로필 페이지 완료");

// ===== Part 22: 친구 시스템 완전판 (모든 함수 포함) =====

// ✅ 친구 페이지
window.showFriendsPage = async function() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    hideAll();
    
    let section = document.getElementById("friendsSection");
    if(!section) {
        console.log("📦 friendsSection 생성 중...");
        // 🔥 수정: main이 없을 경우 body 사용
        const container = document.querySelector("main") || document.body;
        section = document.createElement("section");
        section.id = "friendsSection";
        section.className = "page-section";
        container.appendChild(section);
        console.log("✅ friendsSection 생성 완료");
    }
    
    section.classList.add("active");
    
    const input = document.getElementById("friendIDInput");
    if(!input) return;
    
    const friendID = input.value.trim().toUpperCase();
    if(!friendID) {
        alert("친구 ID를 입력해주세요!");
        return;
    }
    
    const myUid = getUserId();
    const myEmail = getUserEmail();
    const myNickname = getNickname();
    
    try {
        showLoadingIndicator("요청 전송 중...");
        
        // 1. 입력한 ID로 사용자 찾기
        const userIDsSnapshot = await db.ref("userIDs").once('value');
        const userIDsData = userIDsSnapshot.val() || {};
        
        let targetUid = null;
        for(const [userID, uid] of Object.entries(userIDsData)) {
            if(userID === friendID) {
                targetUid = uid;
                break;
            }
        }
        
        if(!targetUid) {
            hideLoadingIndicator();
            alert("❌ 존재하지 않는 사용자 ID입니다.");
            return;
        }
        
        // 2. 자기 자신에게 요청 방지
        if(targetUid === myUid) {
            hideLoadingIndicator();
            alert("❌ 자기 자신에게는 친구 요청을 보낼 수 없습니다.");
            return;
        }
        
        // 3. 이미 친구인지 확인
        const friendsSnapshot = await db.ref(`friends/${myUid}/${targetUid}`).once('value');
        if(friendsSnapshot.exists()) {
            hideLoadingIndicator();
            alert("❌ 이미 친구입니다!");
            return;
        }
        
        // 4. 이미 요청을 보냈는지 확인
        const existingSnapshot = await db.ref(`friendRequests/${targetUid}`).once('value');
        const existingData = existingSnapshot.val() || {};
        
        for(const reqData of Object.values(existingData)) {
            if(reqData.fromUid === myUid && reqData.status === 'pending') {
                hideLoadingIndicator();
                alert("❌ 이미 요청을 보냈습니다!");
                return;
            }
        }
        
        // 5. 대상 사용자 정보 가져오기
        const myDataSnapshot = await db.ref(`users/${myUid}`).once('value');
        const myData = myDataSnapshot.val() || {};
        const myUserID = myData.userID || 'USER_XXXX';
        
        // 6. 친구 요청 전송
        await db.ref(`friendRequests/${targetUid}`).push({
            fromUid: myUid,
            fromEmail: myEmail,
            fromNickname: myNickname,
            fromUserID: myUserID,
            status: 'pending',
            timestamp: Date.now()
        });
        
        hideLoadingIndicator();
        alert("✅ 친구 요청을 보냈습니다!");
        input.value = "";
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("친구 요청 실패:", error);
        alert("❌ 오류: " + error.message);
    }
}

// ✅ 친구 요청 수락
window.acceptFriendRequest = async function(requestId, fromUid) {
    if(!confirm("친구 요청을 수락하시겠습니까?")) return;
    
    const myUid = getUserId();
    
    try {
        showLoadingIndicator("처리 중...");
        
        // 1. 양방향 친구 관계 생성
        const friendData = {
            since: Date.now()
        };
        
        await Promise.all([
            db.ref(`friends/${myUid}/${fromUid}`).set(friendData),
            db.ref(`friends/${fromUid}/${myUid}`).set(friendData)
        ]);
        
        // 2. 요청 상태 업데이트
        await db.ref(`friendRequests/${myUid}/${requestId}`).update({
            status: 'accepted'
        });
        
        hideLoadingIndicator();
        alert("✅ 친구가 되었습니다!");
        showFriendRequestsPage();
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("친구 수락 실패:", error);
        alert("❌ 오류: " + error.message);
    }
}

// ✅ 친구 요청 거절
window.rejectFriendRequest = async function(requestId) {
    if(!confirm("친구 요청을 거절하시겠습니까?")) return;
    
    const myUid = getUserId();
    
    try {
        showLoadingIndicator("처리 중...");
        
        await db.ref(`friendRequests/${myUid}/${requestId}`).update({
            status: 'rejected'
        });
        
        hideLoadingIndicator();
        alert("✅ 거절되었습니다.");
        showFriendRequestsPage();
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("친구 거절 실패:", error);
        alert("❌ 오류: " + error.message);
    }
}

// ✅ 친구 삭제
window.removeFriend = async function(friendUid, friendName) {
    if(!confirm(`"${friendName}"님을 친구 목록에서 삭제하시겠습니까?`)) return;
    
    const myUid = getUserId();
    
    try {
        showLoadingIndicator("삭제 중...");
        
        // 양방향 친구 관계 삭제
        await Promise.all([
            db.ref(`friends/${myUid}/${friendUid}`).remove(),
            db.ref(`friends/${friendUid}/${myUid}`).remove()
        ]);
        
        hideLoadingIndicator();
        alert("✅ 친구 목록에서 삭제되었습니다.");
        showFriendsPage();
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("친구 삭제 실패:", error);
        alert("❌ 오류: " + error.message);
    }
}

// ✅ 친구 요청 페이지
window.showFriendRequestsPage = async function() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    hideAll();
    
    let section = document.getElementById("friendRequestsSection");
    if(!section) {
        console.log("📦 friendRequestsSection 생성 중...");
        // 🔥 수정: main이 없을 경우 body 사용
        const container = document.querySelector("main") || document.body;
        section = document.createElement("section");
        section.id = "friendRequestsSection";
        section.className = "page-section";
        container.appendChild(section);
        console.log("✅ friendRequestsSection 생성 완료");
    }
    
    section.classList.add("active");
    
    section.innerHTML = `
        <div style="max-width:700px; margin:0 auto; padding:20px;">
            <div style="text-align:center; padding:60px 20px;">
                <div style="width:60px; height:60px; border:4px solid #f3f3f3; border-top:4px solid #c62828; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 20px;"></div>
                <p style="color:#666;">친구 목록 로딩 중...</p>
            </div>
        </div>
    `;
    
    const uid = getUserId();
    
    try {
        const requestsSnapshot = await db.ref(`friendRequests/${uid}`).once('value');
        const requestsData = requestsSnapshot.val() || {};
        const pendingRequests = Object.values(requestsData).filter(req => req.status === 'pending');
        
        const friendsSnapshot = await db.ref(`friends/${uid}`).once('value');
        const friendsData = friendsSnapshot.val() || {};
        const friendsList = Object.entries(friendsData);
        
        const friendsInfo = [];
        for(const [friendUid, friendData] of friendsList) {
            const userSnapshot = await db.ref(`users/${friendUid}`).once('value');
            const userData = userSnapshot.val();
            if(userData) {
                friendsInfo.push({
                    uid: friendUid,
                    ...userData,
                    friendSince: friendData.since
                });
            }
        }
        
        section.innerHTML = `
            <div style="max-width:700px; margin:0 auto; padding:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                    <h2 style="color:#c62828; margin:0;">
                        <i class="fas fa-user-friends"></i> 친구
                    </h2>
                    <button onclick="showMoreMenu()" class="btn-secondary">
                        <i class="fas fa-arrow-left"></i> 뒤로
                    </button>
                </div>
                
                <div style="background:white; border-radius:12px; padding:25px; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin-bottom:20px;">
                    <h3 style="margin:0 0 15px 0; color:#495057;">➕ 친구 추가</h3>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="friendIDInput" class="form-control" placeholder="USER_XXXX" style="flex:1; text-transform:uppercase;">
                        <button onclick="sendFriendRequest()" class="btn-primary">
                            <i class="fas fa-user-plus"></i> 요청
                        </button>
                    </div>
                </div>
                
                ${pendingRequests.length > 0 ? `
                    <div style="background:#fff3cd; border-radius:12px; padding:25px; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin-bottom:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h3 style="margin:0; color:#856404;">
                                <i class="fas fa-bell"></i> 친구 요청
                            </h3>
                            <span style="background:#ffc107; color:#000; padding:5px 12px; border-radius:20px; font-weight:bold; font-size:12px;">
                                ${pendingRequests.length}
                            </span>
                        </div>
                        <button onclick="showFriendRequestsPage()" class="btn-warning btn-block">
                            <i class="fas fa-inbox"></i> 요청 확인하기
                        </button>
                    </div>
                ` : ''}
                
                <div style="background:white; border-radius:12px; padding:25px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin:0 0 20px 0; color:#495057;">
                        <i class="fas fa-users"></i> 내 친구 (${friendsInfo.length})
                    </h3>
                    
                    ${friendsInfo.length > 0 ? `
                        <div style="display:grid; gap:15px;">
                            ${friendsInfo.map(friend => `
                                <div style="background:#f8f9fa; padding:20px; border-radius:8px; display:flex; align-items:center; gap:15px;">
                                    <div style="width:50px; height:50px; border-radius:50%; background:#c62828; display:flex; align-items:center; justify-content:center; color:white; font-size:20px; font-weight:bold;">
                                        ${(friend.newNickname || friend.email.charAt(0)).toUpperCase()}
                                    </div>
                                    <div style="flex:1;">
                                        <h4 style="margin:0 0 5px 0; color:#212529; font-size:16px;">
                                            ${friend.newNickname || friend.email.split('@')[0]}
                                            ${friend.isVIP ? ' <span style="color:#ffc107;">⭐</span>' : ''}
                                        </h4>
                                        <p style="margin:0; font-size:12px; color:#6c757d;">
                                            ${friend.userID || 'ID 미할당'} • 친구된 날: ${new Date(friend.friendSince).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                        <button onclick="showUserProfile('${friend.email}')" class="btn-info btn-sm">
                                            <i class="fas fa-eye"></i> 프로필
                                        </button>
                                        <button onclick="removeFriend('${friend.uid}', '${(friend.newNickname || friend.email).replace(/'/g, "\\'")}')" class="btn-danger btn-sm">
                                            <i class="fas fa-user-times"></i> 삭제
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="text-align:center; padding:60px 20px;">
                            <div style="font-size:64px; opacity:0.3; margin-bottom:20px;">👥</div>
                            <p style="color:#868e96; font-size:16px;">아직 친구가 없습니다.</p>
                            <p style="color:#adb5bd; font-size:13px;">위에서 친구의 ID를 입력하여 친구를 추가해보세요!</p>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        updateURL('friends');
        
    } catch(error) {
        console.error("친구 페이지 로드 실패:", error);
        section.innerHTML = `
            <div style="text-align:center; padding:60px 20px;">
                <p style="color:#f44336; font-size:18px; margin-bottom:10px;">오류 발생</p>
                <p style="color:#6c757d; margin-bottom:20px;">${error.message}</p>
                <button onclick="showMoreMenu()" class="btn-primary">뒤로가기</button>
            </div>
        `;
    }
};

// ✅ 친구 요청 페이지
window.showFriendRequestsPage = async function() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    hideAll();
    
    let section = document.getElementById("friendRequestsSection");
    if(!section) {
        console.log("🔍 friendRequestsSection 생성 중...");
        const main = document.querySelector("main") || document.body;
        section = document.createElement("section");
        section.id = "friendRequestsSection";
        section.className = "page-section";
        main.appendChild(section);
        console.log("✅ friendRequestsSection 생성 완료");
    }
    
    section.classList.add("active");
    
    section.innerHTML = `
        <div style="max-width:700px; margin:0 auto; padding:20px;">
            <div style="text-align:center; padding:60px 20px;">
                <div style="width:60px; height:60px; border:4px solid #f3f3f3; border-top:4px solid #c62828; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 20px;"></div>
                <p style="color:#666;">친구 요청 로딩 중...</p>
            </div>
        </div>
    `;
    
    const uid = getUserId();
    
    try {
        const requestsSnapshot = await db.ref(`friendRequests/${uid}`).once('value');
        const requestsData = requestsSnapshot.val() || {};
        
        const pendingRequests = Object.entries(requestsData)
            .filter(([id, req]) => req.status === 'pending')
            .map(([id, req]) => ({id, ...req}))
            .sort((a, b) => b.timestamp - a.timestamp);
        
        section.innerHTML = `
            <div style="max-width:700px; margin:0 auto; padding:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                    <h2 style="color:#c62828; margin:0;">
                        <i class="fas fa-inbox"></i> 친구 요청
                    </h2>
                    <button onclick="showFriendsPage()" class="btn-secondary">
                        <i class="fas fa-arrow-left"></i> 뒤로
                    </button>
                </div>
                
                ${pendingRequests.length > 0 ? `
                    <div style="display:grid; gap:15px;">
                        ${pendingRequests.map(req => `
                            <div style="background:white; border-radius:12px; padding:25px; box-shadow:0 2px 8px rgba(0,0,0,0.1); border-left:4px solid #ffc107;">
                                <div style="display:flex; align-items:center; gap:15px; margin-bottom:15px;">
                                    <div style="width:60px; height:60px; border-radius:50%; background:#c62828; display:flex; align-items:center; justify-content:center; color:white; font-size:24px; font-weight:bold;">
                                        ${req.fromNickname.charAt(0).toUpperCase()}
                                    </div>
                                    <div style="flex:1;">
                                        <h4 style="margin:0 0 5px 0; color:#212529; font-size:18px;">
                                            ${req.fromNickname}
                                        </h4>
                                        <p style="margin:0; font-size:13px; color:#6c757d;">
                                            ${req.fromUserID} • ${new Date(req.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div style="display:flex; gap:10px;">
                                    <button onclick="acceptFriendRequest('${req.id}', '${req.fromUid}')" class="btn-success" style="flex:1;">
                                        <i class="fas fa-check"></i> 수락
                                    </button>
                                    <button onclick="rejectFriendRequest('${req.id}')" class="btn-danger" style="flex:1;">
                                        <i class="fas fa-times"></i> 거절
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align:center; padding:80px 20px; background:white; border-radius:12px;">
                        <div style="font-size:64px; opacity:0.3; margin-bottom:20px;">🔭</div>
                        <p style="color:#868e96; font-size:18px;">받은 친구 요청이 없습니다.</p>
                    </div>
                `}
            </div>
        `;
        
        updateURL('friendRequests');
        
    } catch(error) {
        console.error("친구 요청 로드 실패:", error);
        section.innerHTML = `
            <div style="text-align:center; padding:60px 20px;">
                <p style="color:#f44336; font-size:18px; margin-bottom:10px;">오류 발생</p>
                <p style="color:#6c757d; margin-bottom:20px;">${error.message}</p>
                <button onclick="showFriendsPage()" class="btn-primary">뒤로가기</button>
            </div>
        `;
    }
};

console.log("✅ Part 22 친구 시스템 완전판 완료");
