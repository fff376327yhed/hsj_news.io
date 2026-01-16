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

// 인증 지속성 설정
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => console.error("❌ 인증 지속성 설정 실패:", error));

// FCM Messaging 초기화
let messaging = null;
try {
    if (firebase.messaging.isSupported && firebase.messaging.isSupported()) {
        messaging = firebase.messaging();
        console.log("✅ Firebase Messaging 초기화 성공");
    }
} catch(err) {
    console.warn("⚠️ Firebase Messaging 초기화 실패:", err.message);
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

function isAdmin(){
    return getCookie("is_admin") === "true";
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
    const adminPages = ['users', 'adminSettings', 'eventManager', 'management'];
    
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
        'users': () => typeof showUserManagement === 'function' ? showUserManagement() : showArticles(),
        'admin': () => typeof showAdminEvent === 'function' ? showAdminEvent() : showArticles(),
        'more': () => showMoreMenu(),
        'messenger': () => typeof showMessenger === 'function' ? showMessenger() : showMoreMenu(),
        'friends': () => typeof showFriendsPage === 'function' ? showFriendsPage() : showMoreMenu(),
        'friendRequests': () => typeof showFriendRequestsPage === 'function' ? showFriendRequestsPage() : showMoreMenu(),
        'bugreport': () => typeof showBugReportPage === 'function' ? showBugReportPage() : showMoreMenu(),
        'notification-settings': () => typeof showNotificationSettings === 'function' ? showNotificationSettings() : showSettings()
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
            alert(`환영합니다, ${result.user.displayName || result.user.email}님!`);
        }
    })
    .catch((error) => {
        console.error("Google 로그인 오류 (리디렉션):", error);
        if(error.code !== 'auth/popup-closed-by-user') {
            alert("로그인 실패: " + error.message);
        }
    });

// 관리자 모드 해제
function disableAdminMode() {
    if(!confirm("관리자 모드를 해제하시겠습니까?\n\n일반 사용자 모드로 전환됩니다.")) return;
    deleteCookie("is_admin");
    alert("관리자 모드가 해제되었습니다.");
    location.reload();
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
    
    return `<img src="${photoUrl}" style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; border:2px solid #dadce0;">`;
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

// FCM 토큰 등록 함수 추가
async function registerFCMToken() {
    if (!messaging) {
        console.warn("⚠️ Firebase Messaging not supported");
        return;
    }
    
    if (!isLoggedIn()) return;
    
    try {
        // ✅ Service Worker 등록 확인 먼저 수행
        const swRegistration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker 준비 완료:', swRegistration.scope);
        
        // 알림 권한 요청
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
            console.log('❌ 알림 권한 거부됨');
            return;
        }
        
        console.log('✅ 알림 권한 승인됨');
        
        // ✅ Service Worker 등록을 명시적으로 전달
        const token = await messaging.getToken({
            vapidKey: 'BFJBBAv_qOw_aklFbE89r_cuCArMJkMK56Ryj9M1l1a3qv8CuHCJ-fKALtOn4taF7Pjwo2bjfoOuewEKBqRBtCo',
            serviceWorkerRegistration: swRegistration
        });
        
        if (token) {
            console.log('📱 FCM 토큰:', token);
            
            // Firebase에 토큰 저장
            const uid = getUserId();
            const tokenKey = btoa(token).substring(0, 20).replace(/[^a-zA-Z0-9]/g, '');
            
            await db.ref(`users/${uid}/fcmTokens/${tokenKey}`).set({
                token: token,
                createdAt: Date.now(),
                userAgent: navigator.userAgent
            });
            
            console.log('✅ FCM 토큰 저장 완료');
        }
        
    } catch (error) {
        console.error('❌ FCM 토큰 등록 실패:', error);
        console.error('오류 상세:', error.code, error.message);
    }
}

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
    
    // FCM 토큰 등록 (최초 1회)
    registerFCMToken();
    
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
                    db.ref("notifications/" + uid + "/" + notifId).update({ read: true });
                }, 5000);
            }
        });
    
    notificationListenerActive = true;
}

// ✅ 알림 전송 함수 (핵심만)
async function sendNotification(type, data) {
    console.log("📤 알림 전송:", type, data);
    
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
        
        if(targetUsers.length === 0) return;
        
        const timestamp = Date.now();
        const updates = {};
        
        const notificationData = {
            type: type,
            timestamp: timestamp,
            read: false,
            articleId: data.articleId,
            title: type === 'article' ? '📰 새 기사' : '💭 내 기사에 새 댓글',
            text: type === 'article' ? 
                `${data.authorName}님이 새 기사를 작성했습니다: "${data.title}"` :
                `${data.commenterName}님이 댓글을 남겼습니다: "${data.content.substring(0, 50)}..."`
        };
        
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

// ✅ 프로필 사진 생성 (간소화)
async function createProfilePhoto(photoUrl, size) {
    if(!photoUrl) {
        return `<div style="width:${size}px; height:${size}px; border-radius:50%; background:#f1f3f4; display:inline-flex; align-items:center; justify-content:center; border:2px solid #dadce0;">
            <i class="fas fa-user" style="font-size:${size/2}px; color:#9aa0a6;"></i>
        </div>`;
    }
    return `<img src="${photoUrl}" style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; border:2px solid #dadce0;">`;
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
                    db.ref("notifications/" + uid + "/" + notifId).update({ read: true });
                }, 5000);
            }
        });

        notificationListenerActive = true;
}



console.log("✅ Part 4 알림 시스템 완료");

// ===== Part 5: 인증 상태 관리 (간소화) =====

// ✅ 인증 상태 변경
auth.onAuthStateChanged(async user => {
    console.log("🔐 인증 상태:", user ? user.email : "로그아웃");
    
    if (user) {
        showLoadingIndicator("로그인 중...");

        const userRef = db.ref("users/" + user.uid);
        const snap = await userRef.once("value");
        let data = snap.val() || {};
        
        if(!data.email) {
            await userRef.update({
                email: user.email,
                createdAt: Date.now()
            });
        }
        
        if (data.isBanned) {
            hideLoadingIndicator();
            alert("🚫 차단된 계정입니다.");
            auth.signOut();
            return;
        }

        setupNotificationListener(user.uid);
        updateHeaderProfileButton(user);
        
        hideLoadingIndicator();
        
        if(!sessionStorage.getItem('login_shown')) {
            showToastNotification("✅ 로그인 완료", `환영합니다, ${getNickname()}님!`, null);
            sessionStorage.setItem('login_shown', 'true');
        }
    } else {
        notificationListenerActive = false;
        const headerBtn = document.getElementById("headerProfileBtn");
        if(headerBtn) {
            headerBtn.innerHTML = `<i class="fas fa-user-circle"></i>`;
        }
    }

    updateSettings();
    
    if(document.getElementById("articlesSection")?.classList.contains("active")) {
        filteredArticles = allArticles;
        renderArticles();
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
                    loadFollowUsers();
                }
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
        loadFollowUsers();
        setupNotificationListener(uid);
    } else {
        statusDiv.innerHTML = '<p style="color:var(--text-secondary);margin-top:10px;">알림이 비활성화되었습니다.</p>';
        document.getElementById("followUsersSection").innerHTML = '';
        db.ref("notifications/" + uid).off();
        notificationListenerActive = false;
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
function showWritePage() {
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
                        <i class="fas fa-envelope"></i> 메신저
                        <span class="notification-badge" id="messengerBadgeMore" style="display:none; position:absolute; right:12px; top:12px; background:#dc3545; color:white; border-radius:12px; padding:2px 6px; font-size:10px; font-weight:700; min-width:18px; text-align:center;"></span>
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
                </div>
            </div>
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

// ✅ 프로필 플레이스홀더
function getProfilePlaceholder(photoUrl, size) {
    if (photoUrl) {
        return `<img src="${photoUrl}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:2px solid #dadce0;">`;
    }
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#f1f3f4;display:inline-flex;align-items:center;justify-content:center;border:2px solid #dadce0;">
        <i class="fas fa-user" style="font-size:${size/2}px;color:#9aa0a6;"></i>
    </div>`;
}

// ✅ 사용자 프로필 사진 가져오기
async function getUserProfilePhoto(email) {
    if (!email) return null;
    
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
        return null;
    }
}

async function renderArticles() {
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
    const pinsSnapshot = await db.ref("pinnedArticles").once("value");
    const pinnedData = pinsSnapshot.val() || {};
    const pinnedIds = Object.keys(pinnedData);

    const pinnedArticles = [];
    const unpinnedArticles = [];

    list.forEach(article => {
        if (pinnedIds.includes(article.id)) {
            // ✅ 수정: 고정 기사가 현재 카테고리와 일치하는 경우만 표시
            if (article.category === currentCategory) {
                article.pinnedAt = pinnedData[article.id].pinnedAt;
                pinnedArticles.push(article);
            } else {
                unpinnedArticles.push(article);
            }
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

    // 고정 기사 렌더링
    if(pinnedArticles.length > 0) {
        const pinnedHTML = await Promise.all(pinnedArticles.map(async (a) => {
            const photoUrl = window.profilePhotoCache.get(a.authorEmail) || null;
            const authorPhotoHTML = getProfilePlaceholder(photoUrl, 24);
            
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

    // 일반 기사
    featured.innerHTML = '';
    const endIdx = currentArticlePage * ARTICLES_PER_PAGE;
    const displayArticles = unpinnedArticles.slice(0, endIdx);
    
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
    
    const articlesHTML = displayArticles.map((a) => {
        const views = getArticleViews(a);
        const votes = getArticleVoteCounts(a);
        const photoUrl = window.profilePhotoCache.get(a.authorEmail) || null;
        const authorPhotoHTML = getProfilePlaceholder(photoUrl, 48);
    
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
    
    if(endIdx < unpinnedArticles.length) {
        loadMore.innerHTML = `<button onclick="loadMoreArticles()" class="btn-block" style="background:#fff; border:1px solid #ddd; color:#555;">
            더 보기 (${unpinnedArticles.length - endIdx})</button>`;
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
            incrementView(id);
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

        root.innerHTML = `<div style="background:#fff;padding:20px;border-radius:8px;">
            <span class="category-badge">${A.category}</span>
            <h1 style="font-size:22px;font-weight:700;margin:15px 0;line-height:1.4;">
                ${A.title}
                ${editedBadge}
            </h1>
            
            <div class="article-meta" style="border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:20px; display:flex; align-items:center; gap:12px;">
                ${authorPhotoHTML}
                <div style="flex:1;">
                    <div style="font-weight:600; color:#202124;">${A.author}</div>
                    <div style="color:#5f6368; font-size:13px;">${A.date}</div>
                </div>
                <span style="color:#5f6368;" id="viewCountDisplay">👁️ ${views}</span>
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

// ✅ 썸네일 미리보기
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
        const article = {
            id: Date.now().toString(),
            category: category,
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
        
        console.log("📝 새 기사 작성:", article.id);
        
        const fileInputSubmit = document.getElementById('thumbnailInput');
        if (fileInputSubmit && fileInputSubmit.files[0]) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                article.thumbnail = e.target.result;
                saveArticle(article, async () => {
                    resetFormAfterSubmit();
                    window.isSubmitting = false;
                    
                    await sendNotification('article', {
                        authorEmail: article.authorEmail,
                        authorName: article.author,
                        title: article.title,
                        articleId: article.id
                    });
                    
                    showArticles();
                });
            };
            reader.readAsDataURL(fileInputSubmit.files[0]);
        } else {
            saveArticle(article, async () => {
                resetFormAfterSubmit();
                window.isSubmitting = false;
                
                await sendNotification('article', {
                    authorEmail: article.authorEmail,
                    authorName: article.author,
                    title: article.title,
                    articleId: article.id
                });
                
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

// ✅ 댓글 로드 (프로필 사진 포함)
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

        const emails = [...new Set(displayComments.map(([_, comment]) => comment.authorEmail).filter(Boolean))];
        
        displayComments.forEach(([_, comment]) => {
            if (comment.replies) {
                Object.values(comment.replies).forEach(reply => {
                    if (reply.authorEmail) emails.push(reply.authorEmail);
                });
            }
        });

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

        const commentsHTML = displayComments.map(([commentId, comment]) => {
            const isMyComment = isLoggedIn() && ((comment.authorEmail === currentEmail) || isAdmin());
            const photoUrl = window.profilePhotoCache.get(comment.authorEmail) || null;
            const authorPhotoHTML = getProfilePlaceholder(photoUrl, 32);
            
            // ✅ 수정됨 표시
            const commentEditedBadge = comment.edited ? 
                `<span class="edited-badge"><i class="fas fa-edit"></i> 수정됨</span>` : '';
            
            let repliesHTML = '';
            if (comment.replies) {
                const replies = Object.entries(comment.replies).sort((a, b) => new Date(a[1].timestamp) - new Date(b[1].timestamp));
                
                repliesHTML = replies.map(([replyId, reply]) => {
                    const isMyReply = isLoggedIn() && ((reply.authorEmail === currentEmail) || isAdmin());
                    const replyPhotoUrl = window.profilePhotoCache.get(reply.authorEmail) || null;
                    const replyPhotoHTML = getProfilePlaceholder(replyPhotoUrl, 24);
                    
                    // ✅ 답글 수정됨 표시
                    const replyEditedBadge = reply.edited ? 
                        `<span class="edited-badge"><i class="fas fa-edit"></i> 수정됨</span>` : '';
                    
                    return `
                        <div class="reply-item" id="reply-${commentId}-${replyId}">
                            <div class="reply-header">
                                ${replyPhotoHTML}
                                <span class="reply-author">↳ ${reply.author}</span>
                                <span class="reply-time">${reply.timestamp}</span>
                                ${replyEditedBadge}
                            </div>
                            <div class="reply-content" id="replyContent-${commentId}-${replyId}">${reply.text}</div>
                            <div class="reply-edit-form" id="replyEditForm-${commentId}-${replyId}" style="display:none;">
                                <input type="text" id="replyEditInput-${commentId}-${replyId}" class="reply-input" value="${reply.text.replace(/"/g, '&quot;')}" onkeypress="if(event.key==='Enter') saveReplyEdit('${id}', '${commentId}', '${replyId}')">
                                <div style="display:flex; gap:5px; margin-top:5px;">
                                    <button onclick="saveReplyEdit('${id}', '${commentId}', '${replyId}')" class="btn-text" style="color:#1976d2;">저장</button>
                                    <button onclick="cancelReplyEdit('${commentId}', '${replyId}')" class="btn-text">취소</button>
                                </div>
                            </div>
                            ${isMyReply ? `
                                <div class="reply-actions">
                                    <button onclick="editReply('${commentId}', '${replyId}')" class="btn-text">수정</button>
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
                        ${commentEditedBadge}
                    </div>
                    <div class="comment-body" id="commentBody-${commentId}">${comment.text}</div>
                    
                    <div class="comment-edit-form" id="commentEditForm-${commentId}" style="display:none;">
                        <textarea id="commentEditInput-${commentId}" class="comment-edit-textarea" onkeypress="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); saveCommentEdit('${id}', '${commentId}'); }">${comment.text}</textarea>
                        <div style="display:flex; gap:10px; margin-top:10px;">
                            <button onclick="saveCommentEdit('${id}', '${commentId}')" class="btn-primary" style="padding:8px 16px; font-size:13px;">저장</button>
                            <button onclick="cancelCommentEdit('${commentId}')" class="btn-secondary" style="padding:8px 16px; font-size:13px;">취소</button>
                        </div>
                    </div>
                    
                    <div class="comment-footer">
                        <button onclick="toggleReplyForm('${commentId}')" class="btn-text">💬 답글</button>
                        ${isMyComment ? `
                            <button onclick="editComment('${commentId}')" class="btn-text">✏️ 수정</button>
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

// ✅ 댓글 수정 저장
window.saveCommentEdit = async function(articleId, commentId) {
    const input = document.getElementById(`commentEditInput-${commentId}`);
    if(!input) return;
    
    const newText = input.value.trim();
    
    if(!newText) {
        alert("댓글 내용을 입력해주세요!");
        return;
    }
    
    // 금지어 체크
    const foundWord = checkBannedWords(newText);
    if(foundWord) {
        alert(`⚠️ 금지어("${foundWord}")가 포함되어 있습니다.`);
        addWarningToCurrentUser();
        return;
    }
    
    try {
        // Firebase에 업데이트
        await db.ref(`comments/${articleId}/${commentId}/text`).set(newText);
        await db.ref(`comments/${articleId}/${commentId}/edited`).set(true);
        await db.ref(`comments/${articleId}/${commentId}/editedAt`).set(new Date().toLocaleString());
        
        // 화면 새로고침
        loadComments(articleId);
        
        console.log("✅ 댓글 수정 완료");
        
    } catch(error) {
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
    loadCommentsWithProfile(id);
}

// ✅ 댓글 더보기
function loadMoreComments() {
    currentCommentPage++;
    loadComments(currentArticleId);
}

// ✅ 댓글 제출
function submitCommentFromDetail() {
    submitComment(currentArticleId);
}

// ✅ 댓글 제출
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
        
        const articleSnapshot = await db.ref("articles/" + id).once("value");
        const article = articleSnapshot.val();
        
        if(article) {
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
        
        document.getElementById("commentInput").value = "";
        currentCommentPage = 1;
        loadComments(id);
        
    } catch(error) {
        console.error("댓글 작성 실패:", error);
        alert("댓글 작성 중 오류가 발생했습니다.");
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
                    🕐 마지막 활동: ${u.lastActivity}
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

// ✅ 관리자 권한으로 댓글 삭제
window.deleteCommentFromAdmin = function(articleId, commentId, nickname) {
    if(!confirm("이 댓글을 삭제하시겠습니까?")) return;
    db.ref("comments/" + articleId + "/" + commentId).remove().then(() => {
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
        
        Object.keys(articlesData).forEach(articleId => {
            updates[`articles/${articleId}/views`] = 0;
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

function setupArticlesListener() {
    if(articlesListenerActive) return;
    
    db.ref("articles").on("value", snapshot => {
        const val = snapshot.val() || {};
        allArticles = Object.values(val);
        
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

function hasViewedArticle(articleId) {
    const viewedArticles = getViewedArticles();
    const viewRecord = viewedArticles[articleId];
    
    // ✅ 기록이 있으면 true, 없으면 false (시간 체크 제거)
    return !!viewRecord;
}

function markArticleAsViewed(articleId) {
    try {
        const viewedArticles = getViewedArticles();
        viewedArticles[articleId] = {
            timestamp: Date.now(),
            viewedAt: new Date().toLocaleString(),
            permanent: true // ✅ 영구 저장 표시
        };
        localStorage.setItem('viewedArticles', JSON.stringify(viewedArticles));
        console.log("✅ 조회 기록 영구 저장:", articleId);
    } catch(error) {
        console.error("조회 기록 저장 실패:", error);
    }
}

function incrementView(id) {
    // 이미 조회한 기사인지 확인 (영구적으로)
    if (hasViewedArticle(id)) {
        console.log("ℹ️ 이미 조회한 기사입니다 (영구 기록):", id);
        return;
    }
    
    // 조회수 증가
    const viewRef = db.ref(`articles/${id}/views`);
    viewRef.transaction((currentViews) => {
        return (currentViews || 0) + 1;
    }).then((result) => {
        // 조회 기록 영구 저장
        markArticleAsViewed(id);
        
        // ✅ 새로운 조회수 값
        const newViewCount = result.snapshot.val();
        console.log("✅ 조회수 증가 완료:", id, "→", newViewCount);
        
        // ✅ 화면에 실시간 반영
        updateViewCountOnScreen(newViewCount);
        
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
        console.warn("⚠️ article-meta를 찾을 수 없습니다");
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
                if (voteType === 'like') article.likeCount--;
                if (voteType === 'dislike') article.dislikeCount--;
                voteRef.remove(); 
            } else {
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
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="color:#c62828; margin:0;">
                    <i class="fas fa-bell"></i> 알림
                </h2>
                <div style="display:flex; gap:10px;">
                    <button onclick="markAllNotificationsAsRead()" class="btn-secondary">
                        <i class="fas fa-check-double"></i> 모두 읽음
                    </button>
                    <button onclick="showMoreMenu()" class="btn-secondary">
                        <i class="fas fa-arrow-left"></i> 뒤로
                    </button>
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
                     onclick="handleNotificationClick('${notif.id}', '${notif.articleId || ''}')">
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
                    ${!notif.read ? `
                        <button onclick="event.stopPropagation(); markNotificationAsRead('${notif.id}')" 
                                style="padding:6px 12px; background:#e9ecef; border:none; border-radius:4px; font-size:12px; cursor:pointer;">
                            읽음
                        </button>
                    ` : ''}
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
    await markNotificationAsRead(notificationId);
    
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
    } catch (error) {
        console.error("메신저 배지 업데이트 실패:", error);
    }
}

console.log("✅ 메신저 → 알림 확인 기능으로 변경 완료");

// ===== Part 14: 최종 초기화 =====

window.addEventListener("load", () => {
    console.log("🚀 시스템 초기화...");
    
    setupArticlesListener();
    
    Promise.all([
        loadBannedWords()
    ]).then(() => {
        console.log("📦 모든 설정 로드 완료");
    });
    
    setupArticleForm();
    
    // ✅ 카테고리 자동 적용 리스너 등록
    setupCategoryChangeListener();
    
    // ✅ 수정: 세션 스토리지에서 카테고리 복원
    const savedCategory = sessionStorage.getItem('currentCategory');
    if(savedCategory) {
        currentCategory = savedCategory;
    }
    
    // ✅ 삭제됨: cleanupOldViewRecords() 호출 제거
    
    initialRoute();
});

// ✅ 추가: 페이지 언로드 시 카테고리 저장
window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('currentCategory', currentCategory);
});

// ============================================================
// 🎨 Part 15: 테마 시스템 (기본/붉은말/크리스마스)
// 기존 코드 4116줄부터 4420줄까지를 이 코드로 완전히 교체하세요
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

// 붉은 말 인사 배너 표시
function showHorseGreeting() {
    // 이미 배너가 있으면 스킵
    if (document.getElementById('horseGreeting')) {
        return;
    }
    
    // 배너 HTML 생성
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
    
    // 메인 컨텐츠 최상단에 추가
    const mainContent = document.querySelector('main');
    if (mainContent && mainContent.firstChild) {
        mainContent.insertBefore(greeting, mainContent.firstChild);
        
        // 애니메이션 효과
        setTimeout(() => {
            greeting.style.animation = 'slideDown 0.5s ease';
        }, 100);
        
        console.log('🐴 붉은 말 인사 배너 표시');
    }
}

// 붉은 말 인사 배너 숨기기
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

// ❄️ 눈 내리는 효과 함수들 (개선 버전)

// 눈 내리는 효과 초기화 - 즉시 실행
function initSnowfall() {
    console.log('❄️ 눈 내리는 효과 초기화 시작');
    
    const container = document.getElementById('snowfall-container');
    if (!container) {
        console.warn('⚠️ snowfall-container를 찾을 수 없습니다.');
        // 컨테이너가 없으면 생성
        const newContainer = document.createElement('div');
        newContainer.id = 'snowfall-container';
        document.body.appendChild(newContainer);
        
        // 재귀 호출
        setTimeout(() => initSnowfall(), 100);
        return;
    }
    
    // 기존 눈송이 제거 (중복 방지)
    container.innerHTML = '';
    
    // 눈송이 개수 설정 (모바일/PC 반응형)
    const isMobile = window.innerWidth <= 768;
    const snowflakeCount = isMobile ? 40 : 60; // 개수 증가
    
    // 다양한 눈송이 모양
    const snowflakeShapes = ['❄', '❅', '❆', '•', '∗'];
    
    // 눈송이 생성
    for (let i = 0; i < snowflakeCount; i++) {
        createSnowflake(container, snowflakeShapes);
    }
    
    console.log(`✅ 크리스마스 눈 내리는 효과 시작! ${snowflakeCount}개의 눈송이 ❄️`);
}

function createSnowflake(container, shapes) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    
    // 랜덤 눈송이 모양
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    snowflake.textContent = randomShape;
    
    // 랜덤 위치 (가로)
    const randomLeft = Math.random() * 100;
    snowflake.style.left = randomLeft + '%';
    
    // 랜덤 크기 (0.5em ~ 1.5em)
    const randomSize = Math.random() * 1 + 0.5;
    snowflake.style.fontSize = randomSize + 'em';
    
    // 랜덤 애니메이션 지속시간 (5초 ~ 15초)
    const randomDuration = Math.random() * 10 + 5;
    snowflake.style.animationDuration = randomDuration + 's';
    
    // 랜덤 애니메이션 딜레이 (0초 ~ 2초) - 딜레이 감소
    const randomDelay = Math.random() * 2;
    snowflake.style.animationDelay = randomDelay + 's';
    
    // 랜덤 투명도 (0.5 ~ 1)
    const randomOpacity = Math.random() * 0.5 + 0.5;
    snowflake.style.opacity = randomOpacity;
    
    // 컨테이너에 추가
    container.appendChild(snowflake);
}

function removeSnowfall() {
    const container = document.getElementById('snowfall-container');
    if (container) {
        container.innerHTML = '';
        console.log('❄️ 눈 효과 제거됨');
    }
}

// 테마 적용 함수 수정 부분
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
    
    // 크리스마스 테마 적용
    if (themeName === 'christmas') {
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
                
                // ✅ 눈 내리는 효과 즉시 시작 (딜레이 제거)
                initSnowfall();
            };
            
            themeStylesheet.onerror = function() {
                console.error('❌ style1.css 로드 실패!');
            };
        } else {
            style1.disabled = false;
            themeStylesheet = style1;
            console.log('♻️ 기존 크리스마스 테마 활성화');
            currentAppliedTheme = themeName;
            
            // 즉시 눈 효과 시작
            initSnowfall();
        }
        
        // 붉은 말 인사 배너 제거
        const greeting = document.getElementById('horseGreeting');
        if (greeting) greeting.remove();
    } 
    // 붉은 말 테마
    else if (themeName === 'red-horse') {
        // ... 기존 코드 ...
        removeSnowfall();
    } 
    // 기본 테마
    else {
        // ... 기존 코드 ...
        removeSnowfall();
    }
    
    updateThemeInfo(themeName);
    
    document.body.style.transition = 'opacity 0.3s';
    document.body.style.opacity = '0.9';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 150);
}

// 초기 테마 적용 함수 수정
function applyInitialTheme() {
    const savedTheme = getCurrentTheme();
    console.log('⚡ 초기 테마 적용:', savedTheme);
    
    if (savedTheme === 'christmas') {
        let style1 = document.querySelector('link[href*="style1.css"]');
        
        if (!style1) {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = 'css/style1.css';
            newLink.id = 'christmas-theme';
            document.head.appendChild(newLink);
            themeStylesheet = newLink;
            
            newLink.onload = function() {
                console.log('✅ 크리스마스 테마 초기 로드 완료');
                currentAppliedTheme = 'christmas';
                
                // ✅ 눈 효과 즉시 시작
                setTimeout(() => initSnowfall(), 100);
            };
        } else {
            style1.disabled = false;
            themeStylesheet = style1;
            currentAppliedTheme = 'christmas';
            
            // 즉시 눈 효과 시작
            setTimeout(() => initSnowfall(), 100);
        }
    } 
    // ... 나머지 테마 처리 ...
}

// 페이지 로드 시 즉시 실행
applyInitialTheme();

// DOM 로드 완료 시에도 재확인
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initThemeSelector, 100);
        
        // 크리스마스 테마면 눈 효과 재시작
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

console.log("✅ 크리스마스 눈 내리는 효과 시스템 로드 완료");

function createSnowflake(container, shapes) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    
    // 랜덤 눈송이 모양
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    snowflake.textContent = randomShape;
    
    // 랜덤 위치 (가로)
    const randomLeft = Math.random() * 100;
    snowflake.style.left = randomLeft + '%';
    
    // 랜덤 크기 (0.5em ~ 1.5em)
    const randomSize = Math.random() * 1 + 0.5;
    snowflake.style.fontSize = randomSize + 'em';
    
    // 랜덤 애니메이션 지속시간 (5초 ~ 15초)
    const randomDuration = Math.random() * 10 + 5;
    snowflake.style.animationDuration = randomDuration + 's';
    
    // 랜덤 애니메이션 딜레이 (0초 ~ 5초)
    const randomDelay = Math.random() * 5;
    snowflake.style.animationDelay = randomDelay + 's';
    
    // 랜덤 투명도 (0.5 ~ 1)
    const randomOpacity = Math.random() * 0.5 + 0.5;
    snowflake.style.opacity = randomOpacity;
    
    // 컨테이너에 추가
    container.appendChild(snowflake);
}

function removeSnowfall() {
    const container = document.getElementById('snowfall-container');
    if (container) {
        container.innerHTML = '';
        console.log('❄️ 눈 효과 제거됨');
    }
}

// 테마 적용하기
function applyTheme(themeName) {
    console.log('🎨 테마 적용 시도:', themeName);
    
    // 이미 적용된 테마면 스킵
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
    
    // 붉은 말 테마 적용
    if (themeName === 'red-horse') {
        // style2.css가 이미 로드되어 있는지 확인
        let style2 = document.querySelector('link[href*="style2.css"]');
        
        if (!style2) {
            // 새로운 링크 생성
            themeStylesheet = document.createElement('link');
            themeStylesheet.rel = 'stylesheet';
            themeStylesheet.href = 'css/style2.css';
            themeStylesheet.id = 'red-horse-theme';
            
            // head에 추가
            document.head.appendChild(themeStylesheet);
            console.log('🐴 붉은 말 테마 로드');
            
            themeStylesheet.onload = function() {
                console.log('✅ 붉은 말 테마 로드 완료!');
                currentAppliedTheme = themeName;
                
                // 배너가 이전에 닫힌 적 없으면 표시
                if (!localStorage.getItem('horseGreetingDismissed')) {
                    setTimeout(showHorseGreeting, 500);
                }
            };
            
            themeStylesheet.onerror = function() {
                console.error('❌ style2.css 로드 실패! 파일이 css 폴더에 있는지 확인하세요.');
            };
        } else {
            style2.disabled = false;
            themeStylesheet = style2;
            console.log('♻️ 기존 붉은 말 테마 활성화');
            currentAppliedTheme = themeName;
            
            // 배너 표시
            if (!localStorage.getItem('horseGreetingDismissed')) {
                setTimeout(showHorseGreeting, 500);
            }
        }
        
        // 눈 효과 제거
        removeSnowfall();
        
        // 인사 배너 제거 (크리스마스용)
        const greeting = document.getElementById('horseGreeting');
        if (greeting) {
            greeting.remove();
        }
        
    } 
    // 크리스마스 테마 적용
    else if (themeName === 'christmas') {
        // style1.css가 이미 로드되어 있는지 확인
        let style1 = document.querySelector('link[href*="style1.css"]');
        
        if (!style1) {
            // 새로운 링크 생성
            themeStylesheet = document.createElement('link');
            themeStylesheet.rel = 'stylesheet';
            themeStylesheet.href = 'css/style1.css';
            themeStylesheet.id = 'christmas-theme';
            
            // head에 추가
            document.head.appendChild(themeStylesheet);
            console.log('🎄 크리스마스 테마 로드');
            
            themeStylesheet.onload = function() {
                console.log('✅ 크리스마스 테마 로드 완료!');
                currentAppliedTheme = themeName;
                
                // 눈 내리는 효과 시작
                setTimeout(() => {
                    if (typeof initSnowfall === 'function') {
                        initSnowfall();
                    }
                }, 300);
            };
            
            themeStylesheet.onerror = function() {
                console.error('❌ style1.css 로드 실패! 파일이 css 폴더에 있는지 확인하세요.');
            };
        } else {
            style1.disabled = false;
            themeStylesheet = style1;
            console.log('♻️ 기존 크리스마스 테마 활성화');
            currentAppliedTheme = themeName;
            
            // 눈 내리는 효과 시작
            setTimeout(() => {
                if (typeof initSnowfall === 'function') {
                    initSnowfall();
                }
            }, 300);
        }
        
        // 붉은 말 인사 배너 제거
        const greeting = document.getElementById('horseGreeting');
        if (greeting) {
            greeting.remove();
        }
        
    } 
    // 기본 테마로 복원
    else {
        // style2.css 비활성화
        const style2 = document.querySelector('link[href*="style2.css"]');
        if (style2) {
            style2.disabled = true;
            console.log('❌ 붉은 말 테마 비활성화');
        }
        
        // style1.css 비활성화
        const style1 = document.querySelector('link[href*="style1.css"]');
        if (style1) {
            style1.disabled = true;
            console.log('❌ 크리스마스 테마 비활성화');
        }
        
        // 눈 효과 제거
        removeSnowfall();
        
        // 인사 배너 제거
        const greeting = document.getElementById('horseGreeting');
        if (greeting) {
            greeting.remove();
        }
        
        currentAppliedTheme = themeName;
        console.log('📰 기본 테마로 복원');
    }
    
    // 테마 정보 표시 업데이트
    updateThemeInfo(themeName);
    
    // 페이지 부드러운 전환 효과
    document.body.style.transition = 'opacity 0.3s';
    document.body.style.opacity = '0.9';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 150);
}

// 테마 정보 표시 업데이트
function updateThemeInfo(themeName) {
    const redHorseInfo = document.getElementById('redHorseInfo');
    const christmasInfo = document.getElementById('christmasInfo');
    
    // 모든 정보 박스 숨기기
    if (redHorseInfo) {
        redHorseInfo.style.display = 'none';
    }
    if (christmasInfo) {
        christmasInfo.style.display = 'none';
    }
    
    // 선택된 테마의 정보 박스만 표시
    if (themeName === 'red-horse' && redHorseInfo) {
        redHorseInfo.style.display = 'block';
    } else if (themeName === 'christmas' && christmasInfo) {
        christmasInfo.style.display = 'block';
    }
}

// 테마 선택 이벤트 리스너
function initThemeSelector() {
    console.log('🎨 테마 선택기 초기화 시작');
    
    // 라디오 버튼 찾기
    const defaultRadio = document.getElementById('themeDefault');
    const redHorseRadio = document.getElementById('themeRedHorse');
    const christmasRadio = document.getElementById('themeChristmas');
    
    if (!defaultRadio || !redHorseRadio) {
        console.log('⚠️ 라디오 버튼을 찾을 수 없음. 1초 후 재시도...');
        setTimeout(initThemeSelector, 1000);
        return;
    }
    
    console.log('✅ 라디오 버튼 발견:', {
        default: !!defaultRadio,
        redHorse: !!redHorseRadio,
        christmas: !!christmasRadio
    });
    
    // 저장된 테마 불러오기
    const savedTheme = getCurrentTheme();
    console.log('💾 저장된 테마:', savedTheme);
    
    // 라디오 버튼 상태 설정
    if (savedTheme === 'red-horse') {
        redHorseRadio.checked = true;
        defaultRadio.checked = false;
        if (christmasRadio) christmasRadio.checked = false;
    } else if (savedTheme === 'christmas') {
        if (christmasRadio) christmasRadio.checked = true;
        defaultRadio.checked = false;
        redHorseRadio.checked = false;
    } else {
        defaultRadio.checked = true;
        redHorseRadio.checked = false;
        if (christmasRadio) christmasRadio.checked = false;
    }
    
    // 저장된 테마 즉시 적용
    applyTheme(savedTheme);
    updateThemeInfo(savedTheme);
    
    // 라디오 버튼 이벤트 리스너 (기존 리스너 제거 후 추가)
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        // 기존 리스너 제거
        const newRadio = radio.cloneNode(true);
        radio.parentNode.replaceChild(newRadio, radio);
    });
    
    // 새로운 라디오 버튼에 이벤트 추가
    document.querySelectorAll('input[name="theme"]').forEach(radio => {
        radio.addEventListener('change', function(e) {
            const selectedTheme = e.target.value;
            console.log('🎨 테마 변경:', selectedTheme);
            
            // 테마 저장 및 적용
            saveTheme(selectedTheme);
            applyTheme(selectedTheme);
            
            // 사용자 피드백
            let message = '';
            if (selectedTheme === 'red-horse') {
                message = '🐴 붉은 말이 안내하는 새해 테마가 적용되었습니다!';
            } else if (selectedTheme === 'christmas') {
                message = '🎄 메리 크리스마스! 눈 내리는 테마가 적용되었습니다!';
            } else {
                message = '📰 기본 테마로 돌아왔습니다!';
            }
            
            console.log('💬 알림:', message);
            
            // 토스트 알림
            if (typeof showToastNotification === 'function') {
                showToastNotification('테마 변경', message);
            } else {
                // 간단한 알림
                const toast = document.createElement('div');
                toast.textContent = message;
                toast.style.cssText = `
                    position: fixed;
                    bottom: 100px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(198, 40, 40, 0.95);
                    color: white;
                    padding: 14px 24px;
                    border-radius: 24px;
                    font-size: 14px;
                    font-weight: 600;
                    z-index: 10000;
                    box-shadow: 0 4px 12px rgba(198, 40, 40, 0.4);
                    animation: slideUp 0.3s ease;
                `;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.style.animation = 'slideDown 0.3s ease reverse';
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            }
            
            // 붉은 말 테마 선택 시 인사 배너 초기화
            if (selectedTheme === 'red-horse') {
                localStorage.removeItem('horseGreetingDismissed');
            }
        });
    });
    
    console.log('✅ 테마 선택기 초기화 완료!');
}

// 초기 테마 적용 (페이지 로드 즉시)
function applyInitialTheme() {
    const savedTheme = getCurrentTheme();
    console.log('⚡ 초기 테마 적용:', savedTheme);
    
    if (savedTheme === 'red-horse') {
        // style2.css가 이미 있는지 확인
        let style2 = document.querySelector('link[href*="style2.css"]');
        
        if (!style2) {
            // 새로 생성
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = 'css/style2.css';
            newLink.id = 'red-horse-theme';
            document.head.appendChild(newLink);
            themeStylesheet = newLink;
            
            newLink.onload = function() {
                console.log('✅ 붉은 말 테마 초기 로드 완료');
                currentAppliedTheme = 'red-horse';
            };
        } else {
            style2.disabled = false;
            themeStylesheet = style2;
            currentAppliedTheme = 'red-horse';
        }
    } else if (savedTheme === 'christmas') {
        // style1.css가 이미 있는지 확인
        let style1 = document.querySelector('link[href*="style1.css"]');
        
        if (!style1) {
            // 새로 생성
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = 'css/style1.css';
            newLink.id = 'christmas-theme';
            document.head.appendChild(newLink);
            themeStylesheet = newLink;
            
            newLink.onload = function() {
                console.log('✅ 크리스마스 테마 초기 로드 완료');
                currentAppliedTheme = 'christmas';
                
                // 눈 내리는 효과 시작
                setTimeout(() => {
                    if (typeof initSnowfall === 'function') {
                        initSnowfall();
                    }
                }, 500);
            };
        } else {
            style1.disabled = false;
            themeStylesheet = style1;
            currentAppliedTheme = 'christmas';
            
            // 눈 내리는 효과 시작
            setTimeout(() => {
                if (typeof initSnowfall === 'function') {
                    initSnowfall();
                }
            }, 500);
        }
    } else {
        // 기본 테마는 style.css 사용 (이미 HTML에 있음)
        currentAppliedTheme = 'default';
        console.log('✅ 기본 테마 사용');
    }
}

// 창 크기 변경 시 눈송이 개수 재조정
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme === 'christmas') {
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
    document.addEventListener('DOMContentLoaded', initThemeSelector);
} else {
    // 이미 로드되었다면 즉시 실행
    setTimeout(initThemeSelector, 100);
}

console.log("✅ Part 15: 멀티 테마 시스템 로드 완료");

console.log("✅ script1.js 최적화 버전 완료 (Parts 1-14 통합)");
