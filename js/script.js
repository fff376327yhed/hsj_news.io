// ===== Part 1: 기본 설정 및 Firebase 초기화 (수정됨) =====
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

// ===== Toast 알림 시스템 =====

// Toast 알림 표시 함수
function showToastNotification(title, message, articleId = null) {
    // 기존 토스트 제거
    const existingToast = document.getElementById('toastNotification');
    if(existingToast) existingToast.remove();
    
    // 토스트 HTML 생성
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
        
        <style>
            .toast-notification {
                position: fixed;
                top: 80px;
                right: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 320px;
                max-width: 400px;
                z-index: 9999;
                animation: slideInRight 0.3s ease, fadeOut 0.3s ease 4.7s;
                cursor: ${articleId ? 'pointer' : 'default'};
                border-left: 4px solid #c62828;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                to {
                    opacity: 0;
                    transform: translateX(400px);
                }
            }
            
            .toast-notification:hover {
                box-shadow: 0 6px 24px rgba(0,0,0,0.2);
                transform: translateY(-2px);
                transition: all 0.2s ease;
            }
            
            .toast-icon {
                font-size: 28px;
                flex-shrink: 0;
            }
            
            .toast-content {
                flex: 1;
                min-width: 0;
            }
            
            .toast-title {
                font-weight: 700;
                color: #202124;
                font-size: 14px;
                margin-bottom: 4px;
            }
            
            .toast-message {
                color: #5f6368;
                font-size: 13px;
                line-height: 1.4;
                word-wrap: break-word;
            }
            
            .toast-close {
                background: none;
                border: none;
                color: #5f6368;
                cursor: pointer;
                padding: 4px;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: all 0.2s ease;
            }
            
            .toast-close:hover {
                background: #f1f3f4;
                color: #202124;
            }
            
            @media (max-width: 768px) {
                .toast-notification {
                    top: 70px;
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                    max-width: none;
                }
            }
        </style>
    `;
    
    // body에 추가
    document.body.insertAdjacentHTML('beforeend', toastHTML);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        closeToast();
    }, 5000);
}

// Toast 닫기
function closeToast() {
    const toast = document.getElementById('toastNotification');
    if(toast) {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }
}

console.log("✅ Toast 알림 시스템 로드 완료");

// ⭐ 인증 상태 지속성 설정 (로컬 스토리지 사용)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log("✅ 인증 지속성 설정 완료 (자동 로그인 활성화)");
    })
    .catch((error) => {
        console.error("❌ 인증 지속성 설정 실패:", error);
    });

// FCM Messaging 초기화 개선 (오류 해결)
let messaging = null;
try {
  // Messaging이 지원되는지 먼저 확인
  if (firebase.messaging.isSupported && firebase.messaging.isSupported()) {
    messaging = firebase.messaging();
    console.log("✅ Firebase Messaging 초기화 성공");
  } else {
    console.warn("⚠️ 이 브라우저는 Firebase Messaging을 지원하지 않습니다.");
  }
} catch(err) {
  console.warn("⚠️ Firebase Messaging 초기화 실패:", err.message);
}


// 전역 변수
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

// ✅ [추가] 테마 복원용 변수 선언 (이 줄을 추가하세요)
let originalUserTheme = null;

// 기존 전역 변수들 아래에 추가
let profilePhotoCache = new Map(); // ✅ 이 줄 추가


// 캐치마인드 게임 변수
let catchMindGames = [];
let currentGame = null;
let currentDifficulty = 'easy';
let gameTimer = null;
let timeRemaining = 0;
let usedHints = 0; // 사용한 힌트 개수
let hintPenalty = 20; // 힌트 사용 시 감소 금액 (기본값)
let currentReward = 0; // 현재 획득 가능 금액

// 쿠폰 데이터
let couponsConfig = [];

// 1. 점검 상태 체크 변수
let maintenanceChecked = false;

// ===== 로딩 인디케이터 (최우선 정의) =====
function showLoadingIndicator(message = "로딩 중...") {
    const existing = document.getElementById("loadingIndicator");
    if(existing) return;
    
    const html = `
        <div id="loadingIndicator" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
        ">
            <div style="
                background: white;
                padding: 30px 40px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #c62828;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <div style="color: #333; font-weight: 600; font-size: 16px;">
                    ${message}
                </div>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
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

// 금지어 관리
function loadBannedWords() {
    db.ref("adminSettings/bannedWords").on("value", snapshot => {
        const val = snapshot.val();
        if (val) {
            bannedWordsList = val.split(',').map(s => s.trim()).filter(s => s !== "");
        } else {
            bannedWordsList = [];
        }
    });
}

function checkBannedWords(text) {
    if (!text) return null;
    for (const word of bannedWordsList) {
        if (text.includes(word)) {
            return word;
        }
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
            alert("🚨 누적 경고 3회로 인해 계정이 차단됩니다. 로그아웃 처리됩니다.");
        } else {
            alert(`현재 누적 경고: ${currentWarnings}회 (3회 시 자동 차단)`);
        }
        
        db.ref("users/" + user.uid).update(updates).then(() => {
            if (currentWarnings >= 3) {
                auth.signOut().then(() => location.reload());
            }
        });
    });
}

// ===== Part 2: URL 관리 및 라우팅 (보안 강화) =====

// 🔐 민감한 페이지 암호화 함수 (복잡한 난독화)
function encryptSensitivePage(pageName) {
    const sensitivePages = ["users", "adminSettings", "eventManager", "management"];
    
    if (!sensitivePages.includes(pageName)) {
        return pageName; // 일반 페이지는 그대로
    }
    
    // Base64 + 추가 난독화
    const base64 = btoa(pageName);
    const timestamp = Date.now().toString(36);
    const randomKey = Math.random().toString(36).substring(2, 8);
    
    // 복잡한 조합: timestamp_base64_randomKey
    return `${timestamp}_${base64}_${randomKey}`;
}

// 🔓 민감한 페이지 복호화 함수
function decryptSensitivePage(encodedPage) {
    if (!encodedPage || !encodedPage.includes('_')) {
        return encodedPage; // 일반 페이지
    }
    
    try {
        const parts = encodedPage.split('_');
        if (parts.length === 3) {
            // 중간 부분이 Base64 인코딩된 페이지명
            return atob(parts[1]);
        }
        return encodedPage;
    } catch(e) {
        console.error("복호화 실패:", e);
        return null;
    }
}

// URL 파라미터 읽기 (수정됨)
function getURLParams() {
    const params = new URLSearchParams(window.location.search);
    let page = params.get('page');
    
    // 민감한 페이지 복호화
    if (page) {
        const decrypted = decryptSensitivePage(page);
        if (decrypted) {
            page = decrypted;
        }
    }

    return {
        page: page,
        articleId: params.get('id'),
        section: params.get('section')
    };
}

// URL 업데이트 (보안 강화)
function updateURL(page, articleId = null, section = null) {
    // 민감한 페이지 암호화
    let urlPage = encryptSensitivePage(page);
    
    let url = `?page=${urlPage}`;
    if (articleId) url += `&id=${articleId}`;
    if (section) url += `&section=${section}`;
    
    // 브라우저 히스토리에 추가 (원본 페이지명 저장)
    window.history.pushState({ page, articleId, section }, '', url);
}

function routeToPage(page, articleId = null, section = null) {
    // 관리자 전용 페이지 접근 제어
    const adminPages = ['users', 'adminSettings', 'eventManager', 'management'];
    if (adminPages.includes(page) && !isAdmin()) {
        alert("🚫 관리자 권한이 필요합니다.");
        showArticles();
        return;
    }
    
    switch(page) {
        case 'home':
            showArticles();
            break;
        case 'freeboard':
            showFreeboard();
            break;
        case 'write':
            showWritePage();
            break;
        case 'settings':
            showSettings();
            break;
        case 'article':
            if (articleId) showArticleDetail(articleId);
            else showArticles();
            break;
        case 'qna':
            showQnA();
            break;
        case 'patchnotes':
            showPatchNotesPage();
            break;
        case 'users':
            showUserManagement();
            break;
        case 'admin':
            showAdminEvent();
            break;
        case 'more':
            showMoreMenu();
            break;
        case 'messenger':
            showMessenger();
            break;
        case 'event':
            showEventMenu();
            break;
        case 'catchmind':
            showCatchMind();
            break;
        case 'coupon':
            showCouponPage();
            break;
        default:
            showArticles();
    }
}

// 초기 라우팅 (수정됨 - 새로고침 문제 해결)
function initialRoute() {
    const params = getURLParams();
    
    if (params.page) {
        routeToPage(params.page, params.articleId, params.section);
    } else {
        showArticles();
    }
}

// 뒤로가기/앞으로가기 지원
window.addEventListener('popstate', (event) => {
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
        sessionStorage.clear(); // 세션 스토리지 초기화
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
            
            // 에러 메시지 한글화
            let errorMessage = "로그인 중 오류가 발생했습니다.";
            
            switch(error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = "로그인 창이 닫혔습니다.";
                    break;
                case 'auth/popup-blocked':
                    errorMessage = "팝업이 차단되었습니다. 팝업 차단을 해제해주세요.";
                    break;
                case 'auth/cancelled-popup-request':
                    errorMessage = "이미 로그인 진행 중입니다.";
                    break;
                case 'auth/network-request-failed':
                    errorMessage = "네트워크 연결을 확인해주세요.";
                    break;
                default:
                    errorMessage = `로그인 실패: ${error.message}`;
            }
            
            alert(errorMessage);
        });
}

// 팝업 차단 시 리디렉션 방식으로 로그인 (대체 방법)
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

// script.js 약 520줄 근처
function goBack() {
    // ✅ 기사에서 나갈 때 원래 테마로 복원
    if(typeof restoreUserTheme === 'function') {
        restoreUserTheme();
    }
    
    // ✅ 수정: 항상 홈으로 이동하도록 변경
    showArticles();
}

// ===== Part 3: 관리자 인증 및 프로필 관리 =====

// ===== sendNotification 함수 추가 위치 =====
// Part 4의 시작 부분에 이 함수를 추가하세요

// 알림 전송 함수
async function sendNotification(type, data) {
    console.log("📤 알림 전송 시작:", type, data);
    
    try {
        // 1. 알림 받을 대상 찾기
        let targetUsers = [];
        
        if (type === 'article') {
            // 새 기사 - 팔로우한 사람들에게 알림
            const usersSnapshot = await db.ref("users").once("value");
            const usersData = usersSnapshot.val() || {};
            
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
            // 댓글 - 팔로우한 사람들에게 알림
            const usersSnapshot = await db.ref("users").once("value");
            const usersData = usersSnapshot.val() || {};
            
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
            // 내 기사에 댓글 - 기사 작성자에게 알림
            const usersSnapshot = await db.ref("users").once("value");
            const usersData = usersSnapshot.val() || {};
            
            Object.entries(usersData).forEach(([uid, userData]) => {
                if(userData.email === data.articleAuthorEmail && userData.notificationsEnabled !== false) {
                    targetUsers.push(uid);
                }
            });
        }
        
        // 2. 각 대상에게 알림 저장
        const timestamp = Date.now();
        const updates = {};
        
        targetUsers.forEach(uid => {
            const notifId = `notif_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
            
            let title, text;
            
            if(type === 'article') {
                title = '📰 새 기사';
                text = `${data.authorName}님이 새 기사를 작성했습니다: "${data.title}"`;
            } else if(type === 'comment') {
                title = '💬 새 댓글';
                text = `${data.authorName}님이 새 댓글을 작성했습니다: "${data.content.substring(0, 50)}..."`;
            } else if(type === 'myArticleComment') {
                title = '💭 내 기사에 새 댓글';
                text = `${data.commenterName}님이 당신의 기사에 댓글을 남겼습니다: "${data.content.substring(0, 50)}..."`;
            }
            
            updates[`notifications/${uid}/${notifId}`] = {
                type: type,
                title: title,
                text: text,
                articleId: data.articleId,
                timestamp: timestamp,
                read: false
            };
        });
        
        // 3. Firebase에 저장
        if(Object.keys(updates).length > 0) {
            await db.ref().update(updates);
            console.log(`✅ ${Object.keys(updates).length}개의 알림 전송 완료`);
        } else {
            console.log("📭 알림 받을 대상이 없습니다");
        }
        
    } catch(error) {
        console.error("❌ 알림 전송 실패:", error);
    }
}

// 관리자 인증 모달
function openAdminAuthModal(){
    document.getElementById("adminAuthModal").classList.add("active");
}

function closeAdminAuthModal(){
    document.getElementById("adminAuthModal").classList.remove("active");
}

// 관리자 로그인 폼
const adminForm = document.getElementById("adminAuthForm");
if(adminForm) {
    adminForm.addEventListener("submit", async e=>{
        e.preventDefault();
        const email = document.getElementById("adminEmail").value;
        const pw = document.getElementById("adminPw").value;
        try{
            await auth.signInWithEmailAndPassword(email, pw);
            setCookie("is_admin", "true");
            alert("관리자 로그인 성공!");
            closeAdminAuthModal();
            location.reload();
        }catch(err){
            alert("로그인 실패: " + err.message);
        }
    });
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

// script.js에서 updateProfileDropdown 함수를 찾아서 이 코드로 교체하세요

async function updateProfileDropdown() {
    const content = document.getElementById("profileDropdownContent");
    const user = auth.currentUser;
    
    if (user) {
        const userSnapshot = await db.ref("users/" + user.uid).once("value");
        const userData = userSnapshot.val() || {};
        const isVIP = userData.isVIP || false;
        
        // 프로필 사진 가져오기
        const photoUrl = userData.profilePhoto || null;
        
        content.innerHTML = `
            <div class="profile-info">
                <div class="profile-avatar" style="position:relative; cursor:pointer;" onclick="openProfilePhotoModal()">
                    ${photoUrl ? 
                        `<img src="${photoUrl}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border:2px solid #dadce0;">` :
                        `<i class="fas fa-user"></i>`
                    }
                    <div style="position:absolute; bottom:-5px; right:-5px; background:#c62828; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid white;">
                        <i class="fas fa-camera" style="font-size:10px; color:white;"></i>
                    </div>
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
    } else {
        content.innerHTML = `
            <div style="text-align:center;padding:20px;">
                <p style="color:var(--text-secondary);margin-bottom:16px;">로그인하여 더 많은 기능을 이용하세요</p>
                <button onclick="googleLogin()" class="btn-primary btn-block">
                    <i class="fab fa-google"></i> Google 로그인
                </button>
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

// 닉네임 변경 (1회 제한)
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
        
        alert("닉네임이 성공적으로 변경되었습니다!");
        location.reload();
    } catch(error) {
        alert("닉네임 변경 실패: " + error.message);
        console.error(error);
    }
}

// 사용자 컨텐츠의 닉네임 업데이트
async function updateUserContentNickname(oldNickname, newNickname, userEmail) {
    const articlesSnapshot = await db.ref("articles").once("value");
    const articlesData = articlesSnapshot.val() || {};
    
    const updates = {};
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

// ===== 경제 시스템 함수들 =====

// script.js 내부 (약 1540번째 줄)
async function getUserMoney() {
    if(!isLoggedIn()) return 0;
    const uid = getUserId();
    
    try {
        const snapshot = await db.ref("users/" + uid + "/money").once("value");
        const money = snapshot.val() || 0;
        console.log("💰 현재 보유 포인트:", money);
        return money;
    } catch(error) {
        console.error("포인트 로드 실패:", error);
        return 0;
    }
}

// 사용자 돈 업데이트
async function updateUserMoney(amount, reason = "") {
    if(!isLoggedIn()) return;
    const uid = getUserId();
    
    const currentMoney = await getUserMoney();
    const newMoney = currentMoney + amount;
    
    await db.ref("users/" + uid).update({
        money: newMoney
    });
    
    // 거래 기록 저장
    if(reason) {
        const transactionId = Date.now().toString();
        await db.ref("users/" + uid + "/transactions/" + transactionId).set({
            amount: amount,
            reason: reason,
            timestamp: Date.now(),
            balanceAfter: newMoney
        });
    }
    
    // UI 업데이트
    updateMoneyDisplay();
    
    // 알림 표시
    if(amount > 0) {
        showToastNotification("💰 포인트 획득", `+${amount}원 (${reason})`, null);
    }
}

// 헤더 돈 표시 업데이트
async function updateMoneyDisplay() {
    const moneyEl = document.getElementById("moneyAmount");
    if(moneyEl && isLoggedIn()) {
        const money = await getUserMoney();
        moneyEl.textContent = money.toLocaleString();
    }
}

// 돈 상세 정보 표시
async function showMoneyDetail() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    const money = await getUserMoney();
    const uid = getUserId();
    
    // 최근 거래 내역 가져오기
    const transSnapshot = await db.ref("users/" + uid + "/transactions").limitToLast(10).once("value");
    const transactions = [];
    
    transSnapshot.forEach(child => {
        transactions.unshift({id: child.key, ...child.val()});
    });
    
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

// ===== 2. 알림 중복 방지 - setupNotificationListener 수정 =====
// script.js의 기존 setupNotificationListener 함수를 찾아서 이 코드로 교체하세요

function setupNotificationListener(uid) {
    if (!uid) return;
    
    console.log("알림 리스너 설정 시작:", uid);
    
    // 이전 리스너 제거 (메모리 누수 방지)
    db.ref("notifications/" + uid).off();
    
    // ⭐ 이미 표시된 알림 ID 추적 (중복 방지)
    const shownNotifications = new Set();
    
    // ⭐ 페이지 로드 시점의 타임스탬프
    const pageLoadTime = Date.now();
    
    // 새 알림 리스너
    db.ref("notifications/" + uid).orderByChild("read").equalTo(false).on("child_added", async (snapshot) => {
        const notification = snapshot.val();
        const notifId = snapshot.key;
        
        // ⭐ 중복 체크 1: 이미 표시한 알림인지 확인
        if (shownNotifications.has(notifId)) {
            console.log("⏭️ 이미 표시한 알림:", notifId);
            return;
        }
        
        // ⭐ 중복 체크 2: 페이지 로드 이전 알림은 무시 (새로고침 시 중복 방지)
        if (notification.timestamp < pageLoadTime) {
            console.log("⏭️ 이전 알림 무시:", notifId);
            return;
        }
        
        // ⭐ 중복 체크 3: 이미 pushed된 알림은 무시 (백그라운드 서비스와 중복 방지)
        if (notification.pushed) {
            console.log("⏭️ 이미 푸시된 알림:", notifId);
            return;
        }
        
        console.log("🆕 새 알림 감지:", notification);
        
        if (!notification.read) {
            // 표시된 알림으로 추가
            shownNotifications.add(notifId);
            
            // 토스트 알림 표시 (articleId 포함)
            showToastNotification(
                notification.type === 'article' ? '📰 새 기사' : 
                notification.type === 'comment' ? '💬 새 댓글' : 
                '📢 알림',
                notification.text,
                notification.articleId
            );
            
            // 자동으로 읽음 처리 (5초 후)
            setTimeout(() => {
                db.ref("notifications/" + uid + "/" + notifId).update({ read: true });
            }, 5000);
        }
    });
}


// 알림 권한 체크 및 요청
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

// ===== FCM 토큰 등록 (GitHub Pages용 수정) =====

// GitHub Pages 베이스 경로 자동 감지
function getBasePath() {
    const path = window.location.pathname;
    // GitHub Pages 서브디렉토리 감지: /hsj_news.io/
    const match = path.match(/^(\/[^\/]+)/);
    return match ? match[1] : '';
}

// FCM 토큰 등록 함수 (GitHub Pages 대응)
async function registerFCMToken(uid) {
    if(!messaging) {
        console.log("⚠️ Messaging not available - 브라우저가 FCM을 지원하지 않습니다.");
        return;
    }
    
    try {
        console.log("📱 FCM 토큰 등록 시작...");
        
        // 베이스 경로 확인
        const basePath = getBasePath();
        console.log("🌐 베이스 경로:", basePath || '/' );
        
        // 1. 알림 권한 요청
        const permission = await Notification.requestPermission();
        console.log("🔔 알림 권한 상태:", permission);
        
        if(permission !== 'granted') {
            console.log("❌ 알림 권한 거부됨");
            showNotificationPermissionPrompt();
            return;
        }
        
        // 2. Service Worker 경로 설정
        const swPath = basePath ? `${basePath}/firebase-messaging-sw.js` : '/firebase-messaging-sw.js';
        const swScope = basePath ? `${basePath}/` : '/';
        
        console.log("📄 Service Worker 경로:", swPath);
        console.log("📂 Service Worker 스코프:", swScope);
        
        // 3. Service Worker 파일 존재 확인
        try {
            const swResponse = await fetch(swPath, { method: 'HEAD' });
            if (!swResponse.ok) {
                throw new Error(`Service Worker 파일을 찾을 수 없습니다: ${swPath}`);
            }
            console.log("✅ Service Worker 파일 확인됨");
        } catch(e) {
            console.error("❌ Service Worker 파일 확인 실패:", e);
            alert("⚠️ 알림 시스템 파일이 없습니다. 관리자에게 문의하세요.");
            return;
        }
        
        // 4. 기존 Service Worker 정리
        console.log("🔧 기존 Service Worker 확인 중...");
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        for (const reg of registrations) {
            // 잘못된 스코프의 Service Worker 제거
            if (!reg.scope.includes(basePath) && basePath) {
                console.log("🗑️ 잘못된 스코프 제거:", reg.scope);
                await reg.unregister();
            }
        }
        
        // 5. Service Worker 등록
        console.log("🆕 Service Worker 등록 시작...");
        let registration = await navigator.serviceWorker.register(swPath, {
            scope: swScope,
            updateViaCache: 'none'
        });
        
        console.log("✅ Service Worker 등록 완료");
        console.log("   - Scope:", registration.scope);
        console.log("   - Script URL:", registration.active?.scriptURL || 'pending');
        
        // 6. Service Worker 활성화 대기
        console.log("⏳ Service Worker 활성화 대기 중...");
        await navigator.serviceWorker.ready;
        
        // 7. 활성 상태 재확인
        registration = await navigator.serviceWorker.getRegistration(swScope);
        
        if (!registration || !registration.active) {
            throw new Error("Service Worker가 활성화되지 않았습니다");
        }
        
        console.log("✅ Service Worker 활성 상태:", registration.active.state);
        
        // 8. FCM 토큰 발급 (재시도 로직)
        console.log("🔑 FCM 토큰 발급 시도...");
        let token = null;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (!token && retryCount < maxRetries) {
            try {
                token = await messaging.getToken({
                    serviceWorkerRegistration: registration,
                    vapidKey: "BFJBBAv_qOw_aklFbE89r_cuCArMJkMK56Ryj9M1l1a3qv8CuHCJ-fKALtOn4taF7Pjwo2bjfoOuewEKBqRBtCo"
                });
                
                if (token) {
                    console.log("✅ FCM 토큰 발급 성공!");
                    break;
                }
            } catch (tokenError) {
                retryCount++;
                console.warn(`⚠️ 토큰 발급 실패 (시도 ${retryCount}/${maxRetries}):`, tokenError.message);
                
                if (retryCount < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    throw tokenError;
                }
            }
        }
        
        if(!token) {
            throw new Error("토큰 발급 실패: 최대 재시도 횟수 초과");
        }
        
        console.log("📝 토큰:", token.substring(0, 20) + "...");
        
        // 9. 토큰을 Firebase DB에 저장
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
        console.log("✅ 토큰 DB 저장 완료");
        
        // 10. 포그라운드 메시지 리스너
        messaging.onMessage((payload) => {
            console.log("📨 포그라운드 메시지 수신:", payload);
            
            const title = payload.data?.title || payload.notification?.title || '📰 해정뉴스';
            const body = payload.data?.body || payload.data?.text || payload.notification?.body || '';
            const articleId = payload.data?.articleId || '';
            
            showToastNotification(title, body, articleId);
        });
        
        // 11. Service Worker 메시지 리스너
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        

        
        // 13. 로컬 스토리지에 토큰 등록 완료 표시
        localStorage.setItem('fcm_token_registered', 'true');
        localStorage.setItem('fcm_token_time', Date.now().toString());
        localStorage.setItem('fcm_base_path', basePath);
        
    } catch(error) {
        console.error("❌ FCM 초기화 오류:", error);
        console.error("상세:", error.code, error.message, error.stack);
        
        // 사용자에게 친절한 오류 메시지
        let errorMsg = "알림 설정 중 오류가 발생했습니다.";
        
        if (error.code === 'messaging/permission-blocked') {
            errorMsg = "🚫 알림 권한이 차단되었습니다.\n\n브라우저 설정에서 해정뉴스의 알림 권한을 허용해주세요.";
        } else if (error.message.includes('Service Worker')) {
            errorMsg = "⚠️ Service Worker 등록에 실패했습니다.\n\n페이지를 새로고침하거나 브라우저를 다시 시작해보세요.";
        } else if (error.message.includes('scope')) {
            errorMsg = "⚠️ 경로 설정 오류가 발생했습니다.\n\n페이지를 새로고침해주세요.";
        }
        
        alert(errorMsg);
    }
}

// Service Worker 메시지 핸들러
function handleServiceWorkerMessage(event) {
    console.log('📬 Service Worker 메시지:', event.data);
    
    if (event.data.type === 'NOTIFICATION_CLICK') {
        const articleId = event.data.articleId;
        const url = event.data.url;
        
        if (articleId) {
            showArticleDetail(articleId);
        } else if (url) {
            const urlParams = new URL(url, window.location.origin);
            const params = new URLSearchParams(urlParams.search);
            const page = params.get('page');
            const id = params.get('id');
            
            if (page === 'article' && id) {
                showArticleDetail(id);
            }
        }
    }
}

// 알림 권한 요청 프롬프트
function showNotificationPermissionPrompt() {
    const promptHTML = `
        <div id="notificationPrompt" style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border: 2px solid #c62828;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 350px;
            animation: slideIn 0.3s ease;
        ">
            <div style="display: flex; align-items: start; gap: 12px;">
                <div style="font-size: 32px;">🔔</div>
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 8px 0; color: #c62828;">알림 권한 필요</h3>
                    <p style="margin: 0 0 12px 0; color: #5f6368; font-size: 14px; line-height: 1.4;">
                        새 기사와 댓글 알림을 받으려면 알림 권한을 허용해주세요.
                    </p>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="retryNotificationPermission()" style="
                            flex: 1;
                            background: #c62828;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: bold;
                        ">허용하기</button>
                        <button onclick="closeNotificationPrompt()" style="
                            background: #f1f3f4;
                            color: #5f6368;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                        ">나중에</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existing = document.getElementById('notificationPrompt');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', promptHTML);
}

// 알림 권한 재요청
window.retryNotificationPermission = async function() {
    closeNotificationPrompt();
    
    const user = auth.currentUser;
    if (user) {
        await registerFCMToken(user.uid);
    }
}

// 프롬프트 닫기
window.closeNotificationPrompt = function() {
    const prompt = document.getElementById('notificationPrompt');
    if (prompt) prompt.remove();
}

// 토큰 갱신 함수
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

// 페이지 로드 시 토큰 갱신 체크
window.addEventListener('load', () => {
    setTimeout(() => {
        refreshFCMToken();
    }, 5000);
});

// Visibility API
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        setTimeout(() => {
            refreshFCMToken();
        }, 2000);
    }
});

// 알림 권한 요청 프롬프트 표시
function showNotificationPermissionPrompt() {
    const promptHTML = `
        <div id="notificationPrompt" style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border: 2px solid #c62828;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 350px;
            animation: slideIn 0.3s ease;
        ">
            <div style="display: flex; align-items: start; gap: 12px;">
                <div style="font-size: 32px;">🔔</div>
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 8px 0; color: #c62828;">알림 권한 필요</h3>
                    <p style="margin: 0 0 12px 0; color: #5f6368; font-size: 14px; line-height: 1.4;">
                        새 기사와 댓글 알림을 받으려면 알림 권한을 허용해주세요.
                    </p>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="retryNotificationPermission()" style="
                            flex: 1;
                            background: #c62828;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: bold;
                        ">허용하기</button>
                        <button onclick="closeNotificationPrompt()" style="
                            background: #f1f3f4;
                            color: #5f6368;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                        ">나중에</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 이미 표시된 프롬프트 제거
    const existing = document.getElementById('notificationPrompt');
    if (existing) existing.remove();
    
    document.body.insertAdjacentHTML('beforeend', promptHTML);
}

// 알림 권한 재요청
window.retryNotificationPermission = async function() {
    closeNotificationPrompt();
    
    const user = auth.currentUser;
    if (user) {
        await registerFCMToken(user.uid);
    }
}

// 프롬프트 닫기
window.closeNotificationPrompt = function() {
    const prompt = document.getElementById('notificationPrompt');
    if (prompt) prompt.remove();
}

// 토큰 갱신 함수 (주기적으로 호출)
async function refreshFCMToken() {
    const user = auth.currentUser;
    if (!user) return;
    
    const lastRegistered = localStorage.getItem('fcm_token_time');
    const now = Date.now();
    
    // 7일마다 토큰 갱신
    if (!lastRegistered || (now - parseInt(lastRegistered)) > 7 * 24 * 60 * 60 * 1000) {
        console.log("🔄 FCM 토큰 갱신 시작...");
        await registerFCMToken(user.uid);
    }
}

// 페이지 로드 시 토큰 갱신 체크
window.addEventListener('load', () => {
    setTimeout(() => {
        refreshFCMToken();
    }, 5000); // 5초 후 체크
});

// Visibility API를 사용하여 페이지가 다시 보일 때 토큰 체크
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        setTimeout(() => {
            refreshFCMToken();
        }, 2000);
    }
});


// 헤더 프로필 버튼 업데이트
async function updateHeaderProfileButton(user) {
    const headerBtn = document.getElementById("headerProfileBtn");
    if(!headerBtn) return;
    
    if(user) {
        // 프로필 사진 로드
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

// ===== Part 4 수정: 인증 상태 변경 (점검 모드 체크 추가) =====
auth.onAuthStateChanged(async user => {
    console.log("🔐 인증 상태 변경:", user ? user.email : "로그아웃");
    
    if (user) {
        console.log("✅ 자동 로그인 성공:", user.email);

        // ✅ 함수 존재 여부 확인 후 호출
        if (typeof loadAndApplyUserTheme === 'function') {
            await loadAndApplyUserTheme();
        }
        
        if (typeof loadAndApplyUserSounds === 'function') {
            await loadAndApplyUserSounds();
        }

        // ⭐ 여기서 호출해야 Firebase 데이터를 불러옵니다.
        if (typeof initSoundSystem === 'function') {
            await initSoundSystem(); 
        }
        
        await updateHeaderProfileButton(user);
        
        // 로딩 표시
        showLoadingIndicator("로그인 중...");

        const userRef = db.ref("users/" + user.uid);
        const snap = await userRef.once("value");
        let data = snap.val() || {};
        
        if(!data.email) {
            await userRef.update({
                email: user.email,
                createdAt: Date.now(),
                money: 0
            });
            data.email = user.email;
            data.money = 0;
        }
        
        // 돈 필드가 없으면 초기화
        if(data.money === undefined) {
            await userRef.update({ money: 0 });
        }
        
        if (data.isBanned) {
            hideLoadingIndicator();
            alert("🚫 차단된 계정입니다.");
            auth.signOut();
            return;
        }

        // 법적 동의 확인
        checkLegalAgreement(user);
        
        // FCM 토큰 등록
        await registerFCMToken(user.uid);
        
        // 알림 리스너 설정
        setupNotificationListener(user.uid);

        // 메신저 뱃지 리스너 설정
        setupMessengerBadgeListener();

        // 돈 표시 업데이트
        updateMoneyDisplay();
        
        // 로딩 숨김
        hideLoadingIndicator();
        
        // 자동 로그인 성공 메시지 (첫 로그인 시에만)
        if(!sessionStorage.getItem('login_shown')) {
            showToastNotification("✅ 로그인 완료", `환영합니다, ${getNickname()}님!`, null);
            sessionStorage.setItem('login_shown', 'true');
        }
    } else {
        console.log("❌ 로그아웃 상태");
        hideLoadingIndicator();
    }

    updateSettings();
    
    // 관리자/VIP 전용 탭 표시
    const adminEventBtn = document.getElementById("moreEventBtn");
    if(adminEventBtn) {
        if(user) {
            const snap = await db.ref("users/" + user.uid).once("value");
            const userData = snap.val() || {};
            const isVIP = userData.isVIP || false;
            
            if(isAdmin() || isVIP) {
                adminEventBtn.style.display = "block";
            } else {
                adminEventBtn.style.display = "none";
            }
        } else {
            adminEventBtn.style.display = "none";
        }
    }

    // ⭐⭐⭐ 여기에 점검 모드 체크 추가 ⭐⭐⭐
    await checkMaintenanceMode();
    
    if(document.getElementById("articlesSection").classList.contains("active")) {
        filteredArticles = allArticles;
        renderArticles();
    }
});

// ===== Part 5: 팔로우 사용자 관리 및 설정 =====

// 팔로우 가능한 사용자 목록 로드
async function loadFollowUsers() {
    if(!isLoggedIn()) return;
    
    const followSection = document.getElementById("followUsersSection");
    followSection.innerHTML = '<p style="text-align:center;color:#868e96;">로딩 중...</p>';
    
    const currentEmail = getUserEmail();
    const uid = getUserId();
    
    // 모든 사용자 정보 가져오기
    const articlesSnapshot = await db.ref("articles").once("value");
    const articlesData = articlesSnapshot.val() || {};
    const articles = Object.values(articlesData);
    
    const usersMap = new Map();
    
    articles.forEach(article => {
        if(article.author && article.author !== "익명" && article.authorEmail && article.authorEmail !== currentEmail) {
            if(!usersMap.has(article.authorEmail)) {
                usersMap.set(article.authorEmail, {
                    nickname: article.author,
                    email: article.authorEmail
                });
            }
        }
    });
    
    // 현재 팔로우 목록 가져오기
    const followSnapshot = await db.ref("users/" + uid + "/following").once("value");
    const followingData = followSnapshot.val() || {};
    
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

// 사용자 팔로우/언팔로우 토글
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

// ===== 1. updateSettings 함수 수정 (undefined 해결) =====
// script.js의 기존 updateSettings 함수를 찾아서 이 코드로 교체하세요

async function updateSettings() {
    // 1. 프로필 카드 업데이트
    const el = document.getElementById("profileNickname");
    if (el) {
        const user = auth.currentUser;
        if(user) {
            try {
                const nicknameChangeSnapshot = await db.ref("users/" + user.uid + "/nicknameChanged").once("value");
                const hasChangedNickname = nicknameChangeSnapshot.val() || false;
                const userSnapshot = await db.ref("users/" + user.uid).once("value");
                const userData = userSnapshot.val() || {};
                const isVIP = userData.isVIP || false;
                const warningCount = userData.warningCount || 0;
                const isBanned = userData.isBanned || false;
                const notificationsEnabled = userData.notificationsEnabled !== false;
                

                
                // ⭐ 프로필 사진 버튼 추가
                el.innerHTML = `
                    
                    
                    <div style="background:#fff; border:1px solid #dadce0; padding:20px; border-radius:8px; margin-bottom:20px;">
                        <h4 style="margin:0 0 15px 0; color:#202124;">내 정보</h4>
                        
                        <!-- 프로필 사진 표시 -->
                        <div style="text-align:center; margin-bottom:20px;">
                            <div id="userProfilePhotoPreview" style="margin-bottom:15px;">
                                <!-- 프로필 사진이 여기에 로드됩니다 -->
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

                // 프로필 사진 로드
                db.ref("users/" + user.uid + "/profilePhoto").once("value").then(snapshot => {
                    const photoUrl = snapshot.val();
                    const preview = document.getElementById("userProfilePhotoPreview");
                    if(preview) {
                        if(photoUrl) {
                            preview.innerHTML = `<img src="${photoUrl}" style="width:120px; height:120px; border-radius:50%; object-fit:cover; border:3px solid #dadce0;">`;
                        } else {
                            preview.innerHTML = `<div style="width:120px; height:120px; border-radius:50%; background:#f1f3f4; display:inline-flex; align-items:center; justify-content:center; border:3px solid #dadce0; margin:0 auto;">
                                <i class="fas fa-user" style="font-size:50px; color:#9aa0a6;"></i>
                            </div>`;
                        }
                    }
                });
                
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
    }

    // 2. 관리자 모드 표시
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

// 알림 토글
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
        
        // 알림 리스너 다시 설정
        setupNotificationListener(uid);
    } else {
        statusDiv.innerHTML = '<p style="color:var(--text-secondary);margin-top:10px;">알림이 비활성화되었습니다.</p>';
        document.getElementById("followUsersSection").innerHTML = '';
        
        // 알림 리스너 제거
        db.ref("notifications/" + uid).off();
    }
}

// ===== Part 6: 네비게이션 및 UI 관리 =====

// 모든 섹션 숨기기 및 네비게이션 초기화
function hideAll() {
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    
    // 프로필 드롭다운 닫기
    const dropdown = document.getElementById("profileDropdown");
    if(dropdown) dropdown.classList.remove("active");
}

// 홈(기사 목록) 표시
function showArticles() {
    // ⭐ 기사 목록으로 돌아갈 때 원래 테마 복원
    restoreUserTheme();
    
    hideAll();
    document.getElementById("articlesSection").classList.add("active");
    
    // ⭐ 헤더 표시 추가
    const header = document.querySelector('header');
    if(header) header.style.display = 'block';
    
    currentArticlePage = 1;
    document.getElementById("searchCategory").value = "";
    document.getElementById("searchKeyword").value = "";
    filteredArticles = allArticles;
    renderArticles();
    
    // URL 업데이트
    updateURL('home');
}

// 자유게시판 표시
function showFreeboard() {
    hideAll();
    document.getElementById("freeboardSection").classList.add("active");
    
    
    currentFreeboardPage = 1;
    document.getElementById("freeboardSearchKeyword").value = "";
    filteredFreeboardArticles = allArticles.filter(a => a.category === "자유게시판");
    renderFreeboardArticles();
    
    // URL 업데이트
    updateURL('freeboard');
}

// 글쓰기 페이지 표시
function showWritePage() {
    if(!isLoggedIn()) { 
        alert("기사 작성은 로그인 후 가능합니다!"); 
        googleLogin(); 
        return; 
    }
    hideAll();
    document.getElementById("writeSection").classList.add("active"); 
    
    // ⭐ [수정] 기존 기사 수정 오류 해결: 글쓰기 페이지 진입 시 항상 새 기사 작성을 위한 폼으로 초기화
    setupArticleForm(); 

    // URL 업데이트 
    updateURL('write'); 
}

// 설정 페이지 표시
function showSettings() {
    hideAll();
    const settingsSection = document.getElementById("settingsSection");
    settingsSection.classList.add("active");
    ('[data-section="settings"]');
    
    updateSettings();
    
    // URL 업데이트
    updateURL('settings');
}

// QnA 페이지 표시
function showQnA() {
    hideAll();
    document.getElementById("qnaSection").classList.add("active");
    loadQnAFromFile();
    
    // URL 업데이트
    updateURL('qna');
}

function loadQnAFromFile() {
    const listDiv = document.getElementById("qnaList");
    fetch('./html/QnA.html')  // 경로 수정
        .then(response => {
            if (!response.ok) throw new Error("QnA.html 파일을 찾을 수 없습니다.");
            return response.text();
        })
        .then(html => {
            listDiv.innerHTML = html;
        })
        .catch(err => {
            console.error(err);
            listDiv.innerHTML = `
                <div style="text-align:center; padding:30px; color:#c62828; background:#fff0f0; border-radius:8px;">
                    <p><b>⚠️ QnA를 불러오지 못했습니다.</b></p>
                    <p style="font-size:13px; margin-top:10px;">QnA.html 파일이 있는지 확인해주세요.</p>
                </div>
            `;
        });
}

// QnA 탭 표시
function showQnATab() {
    document.getElementById("qnaList").style.display = "block";
    document.getElementById("patchNotesContainer").style.display = "none";
    document.getElementById("qnaTabBtn").classList.add("active");
    document.getElementById("patchTabBtn").classList.remove("active");
}

// 패치노트 탭 표시
function showPatchNotesTab() {
    document.getElementById("qnaList").style.display = "none";
    document.getElementById("patchNotesContainer").style.display = "block";
    document.getElementById("qnaTabBtn").classList.remove("active");
    document.getElementById("patchTabBtn").classList.add("active");
    
    loadPatchNotesToContainer(document.getElementById("patchNotesContainer"));
}

// 자유게시판 전용 함수들
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
    
    switch(currentFreeboardSortMethod) {
        case 'latest':
            articles.sort((a,b) => getArticleTimestamp(b) - getArticleTimestamp(a));
            break;
        case 'oldest':
            articles.sort((a,b) => getArticleTimestamp(a) - getArticleTimestamp(b));
            break;
        case 'views':
            articles.sort((a,b) => (b.views || 0) - (a.views || 0));
            break;
        case 'likes':
            articles.sort((a,b) => (b.likeCount || 0) - (a.likeCount || 0));
            break;
        default:
            articles.sort((a,b) => getArticleTimestamp(b) - getArticleTimestamp(a));
            break;
    }
    return articles;
}

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
    
    // 댓글 수 계산 로직 추가
const commentCount = a.comments ? Object.keys(a.comments).length : 0;

// 카드 HTML 생성 부분 (수정됨)
articlesHTML.push(`
    <article class="news-card" onclick="showArticleDetail('${id}')">
        ${a.thumbnail ? `<div class="card-thumbnail"><img src="${a.thumbnail}"></div>` : ''}
        
        <div class="card-content">
            <h3 class="card-title">${a.title}</h3>
            <p class="card-excerpt">${a.content.substring(0, 60)}...</p>
            
            <div class="card-meta">
                <div class="author-info">
                    ${authorPhotoHTML} <span>${a.author}</span>
                </div>
                
                <div class="meta-stats">
                    <span><i class="fas fa-eye"></i> ${a.views || 0}</span>
                    
                    <span><i class="far fa-heart"></i> ${a.likes ? Object.keys(a.likes).length : 0}</span>
                    
                    <span style="margin-left:8px; color:#555;">
                        <i class="far fa-comment-dots"></i> ${commentCount}
                    </span>
                </div>
            </div>
            <div class="card-date">${dateStr}</div>
        </div>
    </article>
`);
    
    if(endIdx < list.length) {
        loadMore.innerHTML = `<button onclick="loadMoreFreeboardArticles()" class="btn-block" style="background:#fff; border:1px solid #ddd; color:#555;">
            더 보기 (${list.length - endIdx})</button>`;
    } else {
        loadMore.innerHTML = "";
    }
}

function loadMoreFreeboardArticles() {
    currentFreeboardPage++;
    renderFreeboardArticles();
}

// ===== Part 7: 기사 관리 및 렌더링 (최적화) =====

// Firebase 실시간 리스너 설정
function setupArticlesListener() {
    db.ref("articles").on("value", snapshot => {
        const val = snapshot.val() || {};
        allArticles = Object.values(val);
        
        // 현재 활성화된 섹션에 따라 자동 업데이트
        if(document.getElementById("articlesSection").classList.contains("active")) {
            searchArticles(false);
        }
        if(document.getElementById("freeboardSection").classList.contains("active")) {
            filteredFreeboardArticles = allArticles.filter(a => a.category === "자유게시판");
            renderFreeboardArticles();
        }
    });
}

// 기사 저장
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

// 기사 삭제
function deleteArticleFromDB(articleId, callback) {
    db.ref("articles/" + articleId).remove().then(() => {
        db.ref("votes/" + articleId).remove(); 
        db.ref("comments/" + articleId).remove();
        if(callback) callback();
    }).catch(error => {
        alert("삭제 실패: " + error.message);
    });
}

// 조회수 증가
function incrementView(id) {
    const viewRef = db.ref(`articles/${id}/views`);
    viewRef.transaction((currentViews) => {
        return (currentViews || 0) + 1;
    });
}

// 조회수 가져오기
function getArticleViews(article) {
    return article.views || 0;
}

// 타임스탬프 가져오기
function getArticleTimestamp(a) {
    if (!a) return 0;
    if (a.createdAt) return Number(a.createdAt);
    if (a.date) {
        return new Date(a.date).getTime() || 0;
    }
    return 0;
}

// 투표 확인
async function checkUserVote(articleId) {
    if (!isLoggedIn()) return null;
    const uid = getUserId();
    const snap = await db.ref(`votes/${articleId}/${uid}`).once('value');
    return snap.val(); 
}

// 투표 토글
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
            } 
            else {
                if (currentVote === 'like') article.likeCount--;
                if (currentVote === 'dislike') article.dislikeCount--;

                if (voteType === 'like') article.likeCount++;
                if (voteType === 'dislike') article.dislikeCount++;
                voteRef.set(voteType); 
            }
            return article;
        }).then(() => {
            if (document.getElementById("articleDetailSection").classList.contains("active")) {
                showArticleDetail(articleId);
            }
        });
    });
}

// 투표 수 가져오기
function getArticleVoteCounts(article) {
    return {
        likes: article.likeCount || 0,
        dislikes: article.dislikeCount || 0
    };
}

// 검색
function searchArticles(resetPage = true) {
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
}

// 정렬
function sortArticles(method, btn) {
    currentSortMethod = method;
    currentArticlePage = 1;
    document.querySelectorAll('#articlesSection .chip').forEach(b => b.classList.remove('active'));
    if (btn && btn.classList) btn.classList.add('active');
    renderArticles();
}

// 정렬된 기사 가져오기
function getSortedArticles() {
    let articles = Array.isArray(filteredArticles) ? [...filteredArticles] : [];
    
    switch(currentSortMethod) {
        case 'latest':
            articles.sort((a,b) => getArticleTimestamp(b) - getArticleTimestamp(a));
            break;
        case 'oldest':
            articles.sort((a,b) => getArticleTimestamp(a) - getArticleTimestamp(b));
            break;
        case 'views':
            articles.sort((a,b) => (b.views || 0) - (a.views || 0));
            break;
        case 'likes':
            articles.sort((a,b) => (b.likeCount || 0) - (a.likeCount || 0));
            break;
        default:
            articles.sort((a,b) => getArticleTimestamp(b) - getArticleTimestamp(a));
            break;
    }
    return articles;
}

// script.js 약 2350줄 근처 - renderArticles 함수 시작 부분
async function renderArticles() {
    const list = getSortedArticles();
    const grid = document.getElementById("articlesGrid");
    const featured = document.getElementById("featuredSection");
    const pinnedSection = document.getElementById("pinnedArticlesSection");
    const adSection = document.getElementById("adSection");
    const loadMore = document.getElementById("loadMoreContainer");

    // ✅ 모든 console.log 제거 (DEBUG_MODE 관련 코드 삭제)
    
    if(!grid || !featured || !pinnedSection || !adSection || !loadMore) {
        console.error("필수 요소를 찾을 수 없습니다.");
        return;
    }
    
    // ✅ 프로필 사진 캐싱 최적화
    if(!window.profilePhotoCache) {
        window.profilePhotoCache = new Map();
    }
    
    // ✅ 2. 광고는 한 번만 로드 (캐싱)
    if(!window.cachedAds) {
        const adsSnapshot = await db.ref("advertisements").once("value");
        const adsData = adsSnapshot.val() || {};
        window.cachedAds = Object.values(adsData).sort((a, b) => b.createdAt - a.createdAt);
    }
    const ads = window.cachedAds;

    // ✅ 3. 고정 기사와 일반 기사 분리
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

    // ✅ 4. 광고 렌더링
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

    // ✅ 5. 기사가 없을 때
    if (list.length === 0) {
        featured.innerHTML = `<div style="text-align:center;padding:60px 20px;background:#fff;border-radius:8px;">
            <p style="color:#868e96;font-size:16px;">등록된 기사가 없습니다.</p>
        </div>`;
        grid.innerHTML = "";
        loadMore.innerHTML = "";
        pinnedSection.innerHTML = "";
        return;
    }

    // ✅ 6. 고정 기사 렌더링 (프로필 사진 포함)
    if(pinnedArticles.length > 0) {
        const pinnedPhotos = await Promise.all(
            pinnedArticles.map(a => getUserProfilePhoto(a.authorEmail))
        );
        
        pinnedSection.innerHTML = pinnedArticles.map((a, idx) => {
            const views = getArticleViews(a);
            const authorPhotoHTML = createProfilePhotoHTML(pinnedPhotos[idx], 24, a.author);
            
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
        }).join('');
    } else {
        pinnedSection.innerHTML = '';
    }

    // ✅ 7. 일반 기사 렌더링 (페이징)
    featured.innerHTML = '';
    const endIdx = currentArticlePage * ARTICLES_PER_PAGE;
    const displayArticles = unpinnedArticles.slice(0, endIdx);
    
 // ✅ 2. 이메일 중복 제거 후 한 번에 로드
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
    
    // ✅ 8. HTML 생성 (장식 포함)
    const articlesHTML = await Promise.all(displayArticles.map(async (a) => {
        const views = getArticleViews(a);
        const votes = getArticleVoteCounts(a);
        const photoUrl = window.profilePhotoCache.get(a.authorEmail) || null;

        // 1. await를 쓰지 않고, 동기 함수인 getProfilePlaceholder를 사용합니다.
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
}));
    
    grid.innerHTML = articlesHTML.join('');

    // [추가] 렌더링이 끝난 후 장식을 불러옵니다!
    if(typeof loadAllProfileDecorations === 'function') {
        loadAllProfileDecorations();
    }
    
    // ✅ 9. 더보기 버튼
    if(endIdx < unpinnedArticles.length) {
        loadMore.innerHTML = `<button onclick="loadMoreArticles()" class="btn-block" style="background:#fff; border:1px solid #ddd; color:#555;">
            더 보기 (${unpinnedArticles.length - endIdx})</button>`;
    } else {
        loadMore.innerHTML = "";
    }
}

// 기사 더보기
function loadMoreArticles() {
    currentArticlePage++;
    renderArticles();
}

// script.js 약 2780줄 근처
async function loadArticleAuthorTheme(authorEmail) {
    if(!authorEmail) return;
    
    // 현재 사용자의 원래 테마/사운드 저장
    if(isLoggedIn() && !originalUserTheme) {
        const uid = getUserId();
        const userThemeSnapshot = await db.ref("users/" + uid + "/activeTheme").once("value");
        const userSoundsSnapshot = await db.ref("users/" + uid + "/activeSounds").once("value");
        const userBGMSnapshot = await db.ref("users/" + uid + "/activeBGM").once("value");
        
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
        
        // ✅ 테마 적용
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
        
        // ✅ 사운드 적용 (수정됨)
        if(hasChristmasSounds) {
            const soundsSnapshot = await db.ref("users/" + authorUid + "/activeSounds").once("value");
            const authorSounds = soundsSnapshot.val();
            
            if(authorSounds && typeof window !== 'undefined') {
                console.log(`🔊 작성자의 크리스마스 효과음 적용`);
                window.soundEnabled = true;
            }
        }
        
        // ✅ BGM 적용 (수정됨)
        if(hasChristmasBGM) {
            const bgmSnapshot = await db.ref("users/" + authorUid + "/activeBGM").once("value");
            const authorBGM = bgmSnapshot.val();
            
            if(authorBGM && typeof window !== 'undefined') {
                console.log(`🎵 작성자의 크리스마스 BGM 적용`);
                window.bgmEnabled = true;
                
                // ✅ BGM 초기화 및 재생
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

// script.js - restoreUserTheme 함수 수정
function restoreUserTheme() {
    if(originalUserTheme) {
        console.log("🔄 사용자의 원래 설정으로 복원");
        applyTheme(originalUserTheme, false);
        
        // ✅ 사운드 복원
        if(typeof window.originalUserSounds !== 'undefined') {
            window.soundEnabled = window.originalUserSounds;
        }
        
        // ✅ BGM 복원
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

// ===== Part 8: 기사 상세, 작성, 수정 =====

async function showArticleDetail(id) {
    // 1. 화면 전환 및 초기화 (이전 내용 즉시 삭제)
    hideAll();
    const detailSection = document.getElementById("articleDetailSection");
    detailSection.classList.add("active");
    
    // ⭐ 중요: 로딩 중 표시를 먼저 띄워서 이전 기사 잔상을 없앱니다.
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

    // URL 업데이트
    updateURL('article', id);

    // 2. 데이터 불러오기 시작
    db.ref("articles/" + id).once("value").then(async snapshot => {
        // ... (이후 코드는 기존과 동일하게 유지)
        const A = snapshot.val();
        if(!A) { 
             alert("존재하지 않는 기사입니다!");
             showArticles();
             return;
        }
        // ... 기존 코드 계속 ...
        
        if (currentArticleId !== id) {
            incrementView(id);
        }
        currentArticleId = id;
        currentCommentPage = 1;
        hideAll();
        document.getElementById("articleDetailSection").classList.add("active");
        
        updateURL('article', id);

        const currentUser = getNickname();
        const canEdit = isLoggedIn() && ((A.author === currentUser) || isAdmin());
        const views = getArticleViews(A);
        const votes = getArticleVoteCounts(A);
        
        const userVote = await checkUserVote(id);
        
        // ⭐ 작성자의 테마/사운드 로드 및 적용
        await loadArticleAuthorTheme(A.authorEmail);
        
        // ✅ 프로필 사진 + 장식 로드
        const authorPhoto = await getUserProfilePhoto(A.authorEmail);
        const authorPhotoHTML = await createProfilePhotoWithDecorations(authorPhoto, 40, A.authorEmail);

        const root = document.getElementById("articleDetail");
        root.innerHTML = `<div style="background:#fff;padding:20px;border-radius:8px;">
            <span class="category-badge">${A.category}</span>
            <h1 style="font-size:22px;font-weight:700;margin:15px 0;line-height:1.4;">${A.title}</h1>
            
            <!-- ⭐ 프로필 사진이 포함된 작성자 정보 -->
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
        

        // ⭐ 프로필 사진이 포함된 댓글 로드
        loadCommentsWithProfile(id);
        
    });
}

// 기사 삭제
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

// 기사 수정
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
        ('[data-section="write"]');
        
        
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

// 수정 폼 설정
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

// 썸네일 미리보기
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

// ===== 이 함수를 script.js의 기존 setupArticleForm() 함수와 교체하세요 =====

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
    
    // ✅ async 함수로 변경
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
            reader.onload = async function(e) {  // ✅ 여기도 async 추가
                A.thumbnail = e.target.result;
                saveArticle(A, async () => {  // ✅ 여기도 async 추가
                    newForm.reset();
                    document.getElementById('thumbnailPreview').style.display = 'none';
                    document.getElementById('uploadText').innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
                    warningEl.style.display = "none";
                    alert("기사가 발행되었습니다!");
                    
                    sendNotification('article', {
                        authorEmail: A.authorEmail,
                        authorName: A.author,
                        title: A.title,
                        articleId: A.id
                    });
                    
                    // ✅ await 사용 가능
                    await updateUserMoney(5, "기사 작성");
                    
                    showArticles();
                });
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveArticle(A, async () => {  // ✅ 여기도 async 추가
                newForm.reset();
                document.getElementById('thumbnailPreview').style.display = 'none';
                document.getElementById('uploadText').innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
                warningEl.style.display = "none";
                alert("기사가 발행되었습니다!");
                
                sendNotification('article', {
                    authorEmail: A.authorEmail,
                    authorName: A.author,
                    title: A.title,
                    articleId: A.id
                });
                
                // ✅ await 사용 가능
                await updateUserMoney(5, "기사 작성");
                
                showArticles();
            });
        }
    });
}

// ===== 여기까지가 setupArticleForm() 함수입니다 =====

// ===== Part 9: 댓글 관리 =====

// 댓글 로드
function loadComments(id) {
     loadCommentsWithProfile(id);
    const currentUser = getNickname();
    db.ref("comments/"+id).once("value").then(s=>{
        const val=s.val()||{};
        const commentsList = Object.entries(val).sort((a,b) => new Date(b[1].timestamp) - new Date(a[1].timestamp));
        const root=document.getElementById("comments");
        const countEl = document.getElementById("commentCount");
        countEl.textContent = `(${commentsList.length})`;
        if(!commentsList.length) {
            root.innerHTML = "<p style='color:#868e96;text-align:center;padding:30px;'>댓글이 없습니다.</p>";
            document.getElementById("loadMoreComments").innerHTML = "";
            return;
        }
        const endIdx = currentCommentPage * COMMENTS_PER_PAGE;
        const displayComments = commentsList.slice(0, endIdx);
        root.innerHTML = displayComments.map(([k,v])=>{
            const canEdit = isLoggedIn() && ((v.author === currentUser) || isAdmin());
            return `<div class="comment-card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <div>
                        <span class="comment-author">${v.author}</span>
                        <small style="color:#868e96;margin-left:10px;">${v.timestamp}</small>
                    </div>
                    ${canEdit ? `<div>
                        <button onclick="editComment('${id}','${k}','${v.author}')" class="btn-secondary" style="height:32px;padding:0 12px;font-size:12px;">수정</button>
                        <button onclick="deleteComment('${id}','${k}','${v.author}')" class="btn-secondary" style="height:32px;padding:0 12px;font-size:12px;margin-left:6px;background:#6c757d;color:white;border:none;">삭제</button>
                    </div>` : ''}
                </div>
                <p style="margin:0;line-height:1.6;color:#495057;">${v.text}</p>
            </div>`}).join('');
        const loadMoreBtn = document.getElementById("loadMoreComments");
        if(endIdx < commentsList.length) {
            loadMoreBtn.innerHTML = `<button onclick="loadMoreComments()" class="btn-secondary" style="width:100%;">
                댓글 더보기 (${commentsList.length - endIdx}개 남음)</button>`;
        } else {
            loadMoreBtn.innerHTML = "";
        }
    });
}

// 댓글 더보기
function loadMoreComments() {
    currentCommentPage++;
    loadComments(currentArticleId);
}

// 댓글 제출 (상세 페이지에서)
function submitCommentFromDetail() {
    submitComment(currentArticleId);
}

// 댓글 제출
function submitComment(id){
    if(!isLoggedIn()) {
        alert("댓글 작성은 로그인 후 가능합니다!");
        return;
    }
    const txt=document.getElementById("commentInput").value.trim();
    if(!txt) return alert("댓글 내용을 입력해주세요!");
    
    const foundWord = checkBannedWords(txt);
    if (foundWord) {
        alert(`⚠️ 금지어("${foundWord}")가 포함되어 등록할 수 없으며, 경고 1회가 누적됩니다.`);
        addWarningToCurrentUser();
        return;
    }

    const cid=Date.now().toString();
    const C={
        author:getNickname(),
        authorEmail:getUserEmail(),
        text:txt,
        timestamp:new Date().toLocaleString()
    };
    
   db.ref("comments/"+id+"/"+cid).set(C).then(() => {
        // 기사 작성자 정보 가져오기
        db.ref("articles/" + id).once("value").then(snapshot => {
            const article = snapshot.val();
            if(article) {
                // 팔로워에게 알림
                sendNotification('comment', {
                    authorEmail: C.authorEmail,
                    authorName: C.author,
                    content: txt,
                    articleId: id
                });
                
                // 기사 작성자에게 알림 (자기 자신이 아닐 경우)
                if(article.authorEmail !== C.authorEmail) {
                    sendNotification('myArticleComment', {
                        articleAuthorEmail: article.authorEmail,
                        commenterEmail: C.authorEmail,
                        commenterName: C.author,
                        content: txt,
                        articleId: id
                    });
                }
            }
        });
        
        // 포인트 지급
        updateUserMoney(2, "댓글 작성");
    });
    
    document.getElementById("commentInput").value="";
    currentCommentPage = 1;
    loadComments(id);
}

// 댓글 수정
function editComment(aid, cid, author){
    const currentUser = getNickname();
    if(!isLoggedIn() || (author !== currentUser && !isAdmin())) {
        return alert("수정 권한이 없습니다!");
    }
    db.ref("comments/"+aid+"/"+cid).once("value").then(s=>{
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
        db.ref("comments/"+aid+"/"+cid).set(comment);
        loadComments(aid);
    });
}

// 댓글 삭제
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

// ===== Part 10: 팝업 시스템 =====

// 팝업 관리 UI 표시
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

// 팝업 생성 모달 열기
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

// 팝업 생성
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

// 팝업 활성화/비활성화
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

// 팝업 수정
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

// 팝업 삭제
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

// 사용자용: 활성화된 팝업 표시
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

// ===== Part 10: 패치노트 시스템 =====

// 패치노트 페이지 표시
function showPatchNotesPage() {
    hideAll();
    document.getElementById("patchnotesSection").classList.add("active");
    loadPatchNotesToContainer(document.getElementById("patchNotesList"));
    
    updateURL('patchnotes');
}

// 패치노트 로드 및 렌더링
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

// 패치노트 작성/수정 모달 열기
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

// 패치노트 저장
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

// 패치노트 삭제
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

// ===== Part 11: 관리자 이벤트 및 기능 관리 =====

// 관리자 이벤트 페이지
async function showAdminEvent() {
    const user = auth.currentUser;
    if(!user) return alert("로그인이 필요합니다!");

    const vipSnapshot = await db.ref("users/" + user.uid + "/isVIP").once("value");
    const isVIP = vipSnapshot.val() || false;

    if(!isAdmin() && !isVIP) {
        return alert("권한이 없습니다 (VIP 또는 관리자 전용).");
    }
    
    hideAll();
    document.getElementById("adminEventSection").classList.add("active");
    ('[data-section="admin"]');
    

    document.getElementById("eventContent").innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#868e96;">
            <p style="font-size:18px;margin-bottom:10px;">관리할 항목을 위에서 선택해주세요</p>
        </div>
    `;
    

    // ===== 관리자: 제출물 관리 (버그 및 문제 출제) =====

// 관리자 메뉴에 버튼 추가 (기존 showAdminEvent 함수 내부에 추가)
// <button onclick="showSubmissionManager()" class="btn-primary btn-block" style="margin-bottom:10px;">📩 제출된 항목 확인</button>

// script.js 약 3850줄에 이 코드가 있어야 합니다:

window.showSubmissionManager = function() {
    if (!isAdmin()) return alert("관리자 권한이 없습니다.");
    
    hideAll();
    let section = document.getElementById("adminSubmissionSection");
    if (!section) {
        section = document.createElement("div");
        section.id = "adminSubmissionSection";
        section.className = "page-section";
        document.querySelector("main").appendChild(section);
    }
    section.classList.add("active");
    
    section.innerHTML = `
        <div style="padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="color:#333;">📩 제출 관리함</h2>
                <button onclick="showAdminEvent()" class="btn-secondary">뒤로</button>
            </div>
            
            <div class="tabs" style="display:flex; gap:10px; margin-bottom:20px;">
                <button onclick="loadPendingGames()" class="btn-primary" style="flex:1;">🎨 문제 출제</button>
                <button onclick="loadBugReports()" class="btn-danger" style="flex:1;">🐛 버그 제보</button>
            </div>
            
            <div id="submissionList" style="background:#f9f9f9; padding:15px; border-radius:8px; min-height:300px;">
                <p style="text-align:center; color:#888;">상단 탭을 선택하여 내용을 확인하세요.</p>
            </div>
        </div>
    `;
}

// 뱃지 숫자 가져오기 (비동기라 UI엔 나중에 반영되거나 생략 가능)
function getBadge(path) {
    return "?"; // 실시간 개수는 별도 리스너 필요, 여기선 단순화
}

// 1. 출제된 문제 로드
async function loadPendingGames() {
    const container = document.getElementById("submissionList");
    container.innerHTML = '<p style="text-align:center;">로딩 중...</p>';
    
    const snapshot = await db.ref("pendingGames").once("value");
    const data = snapshot.val() || {};
    
    if (Object.keys(data).length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888;">제출된 문제가 없습니다.</p>';
        return;
    }

    container.innerHTML = Object.entries(data).map(([id, game]) => `
        <div style="background:white; padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid #ddd;">
            <div style="display:flex; justify-content:space-between;">
                <strong>${game.subject} (난이도: ${game.difficulty})</strong>
                <span style="font-size:12px; color:#666;">${new Date(game.submittedAt).toLocaleString()}</span>
            </div>
            <p><strong>출제자:</strong> ${game.author}</p>
            <p><strong>정답:</strong> ${game.answer}</p>
            <p><strong>힌트:</strong> ${game.hints ? game.hints.join(', ') : '없음'}</p>
            <p><strong>설명:</strong> ${game.description || '없음'}</p>
            
            <div style="display:flex; gap:5px; overflow-x:auto; margin:10px 0;">
                ${game.images ? game.images.map(src => `<img src="${src}" style="height:60px; border-radius:4px; border:1px solid #eee;">`).join('') : ''}
            </div>
            
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button onclick="approveGame('${id}')" class="btn-success" style="flex:1; padding:5px;">승인 (게임에 추가)</button>
                <button onclick="deleteSubmission('pendingGames', '${id}')" class="btn-danger" style="flex:1; padding:5px;">삭제</button>
            </div>
        </div>
    `).join('');
}

// 2. 버그 제보 로드
async function loadBugReports() {
    const container = document.getElementById("submissionList");
    container.innerHTML = '<p style="text-align:center;">로딩 중...</p>';
    
    const snapshot = await db.ref("bugReports").once("value");
    const data = snapshot.val() || {};

    if (Object.keys(data).length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888;">제보된 버그가 없습니다.</p>';
        return;
    }

    container.innerHTML = Object.entries(data).reverse().map(([id, report]) => `
        <div style="background:white; padding:15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #d32f2f;">
            <div style="display:flex; justify-content:space-between;">
                <strong>${report.reporter}</strong>
                <span style="font-size:12px; color:#666;">${report.dateStr}</span>
            </div>
            <p style="margin:5px 0; font-size:13px; color:#555;">📱 ${report.device}</p>
            <div style="background:#f1f1f1; padding:10px; border-radius:4px; margin:10px 0; white-space:pre-wrap;">${report.description}</div>
            
            <div style="display:flex; gap:5px; overflow-x:auto; margin-bottom:10px;">
                ${report.images ? report.images.map(src => `<img src="${src}" onclick="window.open(this.src)" style="height:80px; cursor:pointer; border-radius:4px; border:1px solid #ccc;">`).join('') : ''}
            </div>
            
            <button onclick="deleteSubmission('bugReports', '${id}')" class="btn-secondary" style="width:100%; padding:5px;">확인 완료 (삭제)</button>
        </div>
    `).join('');
}

// 제출물 삭제
async function deleteSubmission(node, id) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await db.ref(`${node}/${id}`).remove();
    if (node === 'pendingGames') loadPendingGames();
    else loadBugReports();
}

// 게임 승인 (json 파일이 아닌 pendingGames에서 실제 게임 목록으로 이동시키는 로직 필요 시 구현)
// 참고: 현재 구조상 JSON 파일을 수정할 순 없으므로, Firebase에 'customGames' 노드를 만들어 게임을 실행할 때 같이 불러오게 수정해야 합니다.
async function approveGame(id) {
    if (!confirm("이 문제를 승인하시겠습니까?")) return;
    
    // 1. pendingGames에서 데이터 가져오기
    const snap = await db.ref(`pendingGames/${id}`).once("value");
    const gameData = snap.val();
    
    // 2. 구조에 맞게 변환 (첫 번째 이미지만 메인으로 사용 등)
    const approvedGame = {
        id: id,
        subject: gameData.subject,
        answer: gameData.answer,
        hints: gameData.hints || [],
        imageUrl: gameData.images ? gameData.images[0] : null, // 첫 번째 이미지를 대표로
        extraImages: gameData.images || [],
        difficulty: gameData.difficulty,
        timeLimit: gameData.difficulty === 'easy' ? 30 : gameData.difficulty === 'medium' ? 20 : 15,
        rewards: { "5sec": 100, "15sec": 50, "30sec": 30 } // 기본 보상 설정
    };
    
    // 3. customGames 노드에 저장 (게임 로직에서 이 노드도 읽어와야 함)
    // 주의: 기존 loadCatchMindConfig() 함수에서 이 노드도 함께 읽어와야 게임에 등장합니다.
    // 여기서는 DB에 'approved'로 옮기는 작업만 수행합니다.
    await db.ref("adminSettings/catchMind/customGames").push(approvedGame);
    await db.ref(`pendingGames/${id}`).remove();
    
    alert("승인 완료! (게임 목록에 추가됨)");
    loadPendingGames();
}

    updateURL('admin');
}

// 기사 고정 관리
window.showPinManager = async function() {
    const eventContent = document.getElementById("eventContent");
    eventContent.innerHTML = "<p style='text-align:center;color:#868e96;padding:40px;'>로딩 중...</p>";
    
    const articlesSnapshot = await db.ref("articles").once("value");
    const articlesData = articlesSnapshot.val() || {};
    const articles = Object.values(articlesData);
    
    const pinsSnapshot = await db.ref("pinnedArticles").once("value");
    const pinnedData = pinsSnapshot.val() || {};
    const pinnedIds = Object.keys(pinnedData);
    
    if(articles.length === 0) {
        eventContent.innerHTML = "<p style='text-align:center;color:#868e96;padding:40px;'>기사가 없습니다.</p>";
        return;
    }
    
    eventContent.innerHTML = `
        <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin-top:0;color:#c62828;">📌 기사 고정 관리</h3>
            <p style="color:#6c757d;margin-bottom:20px;">고정할 기사를 선택하세요. 고정된 기사는 목록 상단에 표시됩니다.</p>
            ${articles.map(a => {
                const isPinned = pinnedIds.includes(a.id);
                return `
                    <div style="background:#f8f9fa;padding:15px;margin-bottom:12px;border-left:4px solid ${isPinned ? '#ffd700' : '#dee2e6'};border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                        <div style="flex:1;">
                            <strong style="color:#212529;">${a.title}</strong>
                            <div style="font-size:12px;color:#6c757d;margin-top:4px;">
                                ${a.category} | ${a.author} | ${a.date}
                            </div>
                        </div>
                        ${isPinned ? 
                            `<button onclick="unpinArticle('${a.id}')" class="btn-secondary" style="white-space:nowrap;">고정 해제</button>` :
                            `<button onclick="pinArticle('${a.id}')" class="btn-warning" style="white-space:nowrap;">고정하기</button>`
                        }
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// 기사 고정
window.pinArticle = async function(articleId) {
    if(!confirm("이 기사를 상단에 고정하시겠습니까?")) return;
    
    await db.ref("pinnedArticles/" + articleId).set({
        pinnedAt: Date.now(),
        pinnedBy: getNickname()
    });
    
    alert("기사가 고정되었습니다.");
    showPinManager();
}

// 기사 고정 해제
window.unpinArticle = async function(articleId) {
    if(!confirm("이 기사의 고정을 해제하시겠습니까?")) return;
    
    await db.ref("pinnedArticles/" + articleId).remove();
    
    alert("고정이 해제되었습니다.");
    showPinManager();
}

// 광고 관리
window.showAdManager = async function() {
    const eventContent = document.getElementById("eventContent");
    eventContent.innerHTML = "<p style='text-align:center;color:#868e96;padding:40px;'>로딩 중...</p>";
    
    const adsSnapshot = await db.ref("advertisements").once("value");
    const adsData = adsSnapshot.val() || {};
    const ads = Object.values(adsData).sort((a, b) => b.createdAt - a.createdAt);
    
    eventContent.innerHTML = `
        <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h3 style="margin:0;color:#c62828;">📢 광고 관리</h3>
                <button onclick="openAdCreateModal()" class="btn-primary">새 광고 만들기</button>
            </div>
            
            ${ads.length === 0 ? 
                '<p style="text-align:center;color:#868e96;padding:40px;">등록된 광고가 없습니다.</p>' :
                ads.map(ad => `
                    <div style="background:${ad.color};border:2px solid #856404;padding:20px;border-radius:8px;margin-bottom:15px;">
                        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;">
                            <div style="flex:1;">
                                <h4 style="margin:0 0 8px 0;color:#212529;">${ad.title}</h4>
                                <p style="margin:0;color:#495057;white-space:pre-wrap;">${ad.content}</p>
                                ${ad.link ? `<p style="margin:8px 0 0 0;"><a href="${ad.link}" target="_blank" style="color:#1976d2;">🔗 ${ad.link}</a></p>` : ''}
                            </div>
                            <button onclick="deleteAd('${ad.id}')" class="btn-danger" style="margin-left:12px;">삭제</button>
                        </div>
                        <div style="font-size:11px;color:#6c757d;">
                            생성: ${new Date(ad.createdAt).toLocaleString()} | 생성자: ${ad.createdBy}
                        </div>
                    </div>
                `).join('')
            }
        </div>
    `;
}

// 광고 생성 모달 열기
window.openAdCreateModal = function() {
    document.getElementById("adCreateModal").classList.add("active");
}

// 광고 생성 모달 닫기
window.closeAdCreateModal = function() {
    document.getElementById("adCreateModal").classList.remove("active");
    document.getElementById("adCreateForm").reset();
}

// 광고 생성 폼 제출 처리
const adCreateForm = document.getElementById("adCreateForm");
if(adCreateForm) {
    adCreateForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const ad = {
            id: Date.now().toString(),
            title: document.getElementById("adTitle").value,
            content: document.getElementById("adContent").value,
            link: document.getElementById("adLink").value,
            color: document.getElementById("adColor").value,
            createdAt: Date.now(),
            createdBy: getNickname()
        };
        
        await db.ref("advertisements/" + ad.id).set(ad);
        
        alert("광고가 생성되었습니다!");
        closeAdCreateModal();
        showAdManager();
    });
}

// 광고 삭제
window.deleteAd = async function(adId) {
    if(!confirm("이 광고를 삭제하시겠습니까?")) return;
    
    await db.ref("advertisements/" + adId).remove();
    
    alert("광고가 삭제되었습니다.");
    showAdManager();
}

// 제출물 관리 - 출제된 문제 로드
window.loadPendingGames = async function() {
    const container = document.getElementById("submissionList");
    container.innerHTML = '<p style="text-align:center;">로딩 중...</p>';
    
    const snapshot = await db.ref("pendingGames").once("value");
    const data = snapshot.val() || {};
    
    if (Object.keys(data).length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888;">제출된 문제가 없습니다.</p>';
        return;
    }

    container.innerHTML = Object.entries(data).map(([id, game]) => `
        <div style="background:white; padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid #ddd;">
            <div style="display:flex; justify-content:space-between;">
                <strong>${game.subject} (난이도: ${game.difficulty})</strong>
                <span style="font-size:12px; color:#666;">${new Date(game.submittedAt).toLocaleString()}</span>
            </div>
            <p><strong>출제자:</strong> ${game.author}</p>
            <p><strong>정답:</strong> ${game.answer}</p>
            <p><strong>힌트:</strong> ${game.hints ? game.hints.join(', ') : '없음'}</p>
            <p><strong>설명:</strong> ${game.description || '없음'}</p>
            
            <div style="display:flex; gap:5px; overflow-x:auto; margin:10px 0;">
                ${game.images ? game.images.map(src => `<img src="${src}" style="height:60px; border-radius:4px; border:1px solid #eee;">`).join('') : ''}
            </div>
            
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button onclick="approveGame('${id}')" class="btn-success" style="flex:1; padding:5px;">승인 (게임에 추가)</button>
                <button onclick="deleteSubmission('pendingGames', '${id}')" class="btn-danger" style="flex:1; padding:5px;">삭제</button>
            </div>
        </div>
    `).join('');
}

// 버그 리포트 로드
window.loadBugReports = async function() {
    const container = document.getElementById("submissionList");
    container.innerHTML = '<p style="text-align:center;">로딩 중...</p>';
    
    const snapshot = await db.ref("bugReports").once("value");
    const data = snapshot.val() || {};

    if (Object.keys(data).length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888;">제보된 버그가 없습니다.</p>';
        return;
    }

    container.innerHTML = Object.entries(data).reverse().map(([id, report]) => `
        <div style="background:white; padding:15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #d32f2f;">
            <div style="display:flex; justify-content:space-between;">
                <strong>${report.reporter}</strong>
                <span style="font-size:12px; color:#666;">${report.dateStr}</span>
            </div>
            <p style="margin:5px 0; font-size:13px; color:#555;">📱 ${report.device}</p>
            <div style="background:#f1f1f1; padding:10px; border-radius:4px; margin:10px 0; white-space:pre-wrap;">${report.description}</div>
            
            <div style="display:flex; gap:5px; overflow-x:auto; margin-bottom:10px;">
                ${report.images ? report.images.map(src => `<img src="${src}" onclick="window.open(this.src)" style="height:80px; cursor:pointer; border-radius:4px; border:1px solid #ccc;">`).join('') : ''}
            </div>
            
            <button onclick="deleteSubmission('bugReports', '${id}')" class="btn-secondary" style="width:100%; padding:5px;">확인 완료 (삭제)</button>
        </div>
    `).join('');
}

// 제출물 삭제
window.deleteSubmission = async function(node, id) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await db.ref(`${node}/${id}`).remove();
    if (node === 'pendingGames') loadPendingGames();
    else loadBugReports();
}

// 게임 승인
window.approveGame = async function(id) {
    if (!confirm("이 문제를 승인하시겠습니까?")) return;
    
    const snap = await db.ref(`pendingGames/${id}`).once("value");
    const gameData = snap.val();
    
    const approvedGame = {
        id: id,
        subject: gameData.subject,
        answer: gameData.answer,
        hints: gameData.hints || [],
        imageUrl: gameData.images ? gameData.images[0] : null,
        extraImages: gameData.images || [],
        difficulty: gameData.difficulty,
        timeLimit: gameData.difficulty === 'easy' ? 30 : gameData.difficulty === 'medium' ? 20 : 15,
        rewards: { "5sec": 100, "15sec": 50, "30sec": 30 }
    };
    
    await db.ref("adminSettings/catchMind/customGames").push(approvedGame);
    await db.ref(`pendingGames/${id}`).remove();
    
    alert("승인 완료! (게임 목록에 추가됨)");
    loadPendingGames();
}

// ===== Part 12: 사용자 관리 시스템 =====

// 사용자 관리 페이지
window.showUserManagement = async function(){
    if(!isAdmin()) return alert("관리자 권한 필요!");
    hideAll();
    document.getElementById("userManagementSection").classList.add("active");
    const root = document.getElementById("usersList");
    root.innerHTML = "<p style='text-align:center;color:#868e96;'>사용자 정보 로딩 중...</p>";
    
    updateURL('users');
    
    try {
        const articlesSnapshot = await db.ref("articles").once("value");
        const articlesData = articlesSnapshot.val() || {};
        const articles = Object.values(articlesData);
        
        const commentsSnapshot = await db.ref("comments").once("value");
        const commentsData = commentsSnapshot.val() || {};
        const usersMap = new Map();
        
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
        
        const usersSnapshot = await db.ref("users").once("value");
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
        root.innerHTML = `<p style="color:#dc3545;text-align:center;">오류: ${error.message}</p>`;
    }
}

// 경고 변경 (전역 함수)
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

// 차단/차단 해제
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

// VIP 상태 변경
window.toggleVIPStatus = async function(userEmail, makeVIP) {
    if(!isAdmin()) return alert("관리자 권한이 필요합니다!");
    const action = makeVIP ? "VIP로 승급" : "VIP 취소";
    if(!confirm(`"${userEmail}" 사용자를 ${action}하시겠습니까?`)) return;
    
    try {
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
        
        if(verifyData && verifyData.isVIP === makeVIP) {
            alert(`✅ ${action}이 완료되었습니다!`);
        } else {
            throw new Error("VIP 상태 업데이트 검증 실패");
        }
        
        await showUserManagement();
        
    } catch(error) {
        console.error("VIP 상태 변경 오류:", error);
        alert("❌ 오류: " + error.message);
    }
}

// 사용자 상세 정보 모달
window.showUserDetail = async function(nickname) {
    const articlesSnapshot = await db.ref("articles").once("value");
    const articlesData = articlesSnapshot.val() || {};
    const articles = Object.values(articlesData).filter(a => a.author === nickname);
    
    const commentsSnapshot = await db.ref("comments").once("value");
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

// 사용자 상세 모달 닫기
window.closeUserDetail = function() {
    document.getElementById("userDetailModal").classList.remove("active");
}

// 관리자 권한으로 기사 삭제
window.deleteArticleFromAdmin = function(id, nickname) {
    if(!confirm("이 기사를 삭제하시겠습니까?")) return;
    deleteArticleFromDB(id, () => {
        db.ref("comments/" + id).remove();
        alert("삭제되었습니다.");
        closeUserDetail();
        showUserDetail(nickname);
    });
}

// 관리자 권한으로 댓글 삭제
window.deleteCommentFromAdmin = function(articleId, commentId, nickname) {
    if(!confirm("이 댓글을 삭제하시겠습니까?")) return;
    db.ref("comments/" + articleId + "/" + commentId).remove().then(() => {
        alert("삭제되었습니다.");
        closeUserDetail();
        showUserDetail(nickname);
    });
}

// 사용자 완전 삭제
window.deleteUserCompletely = function(nick){
    if(!confirm(`"${nick}" 사용자를 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 해당 사용자의 모든 기사와 댓글이 삭제됩니다.`)) return;
    
    db.ref("articles").once("value").then(snapshot => {
        const articlesData = snapshot.val() || {};
        Object.entries(articlesData).forEach(([id, article]) => {
            if(article.author === nick) {
                db.ref("articles/" + id).remove();
            }
        });
    });
    
    db.ref("comments").once("value").then(s=>{
        const val=s.val()||{};
        Object.entries(val).forEach(([aid,group])=>{
            Object.entries(group).forEach(([cid,c])=>{
                if(c.author===nick)
                    db.ref("comments/"+aid+"/"+cid).remove();
            });
        });
    });
    
    alert(`"${nick}" 사용자가 삭제되었습니다.`);
    showUserManagement();
}

// ===== Part 13: 금지어 관리 및 법적 동의 시스템 =====

// 금지어 관리 모달 열기
window.showBannedWordManager = function() {
    const modal = document.getElementById("bannedWordsModal");
    const input = document.getElementById("bannedWordsInput");
    
    input.value = bannedWordsList.join(', ');
    modal.classList.add("active");
}

// 금지어 관리 모달 닫기
window.closeBannedWordsModal = function() {
    document.getElementById("bannedWordsModal").classList.remove("active");
}

// 금지어 저장
window.saveBannedWords = function() {
    const input = document.getElementById("bannedWordsInput").value;
    const newList = input.split(',').map(s => s.trim()).filter(s => s !== "");
    
    db.ref("adminSettings/bannedWords").set(newList.join(',')).then(() => {
        alert("금지어 목록이 저장되었습니다.");
        closeBannedWordsModal();
    }).catch(err => alert("저장 실패: " + err.message));
}

// ===== 법적 책임 및 이용 동의 모달 시스템 =====

// 영구 쿠키 설정 (10년)
function setPermanentCookie(name, value) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 10);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

// 법적 동의 확인 함수
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

// 법적 동의 모달 표시
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

// 동의 버튼 클릭 처리
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

        const modal = document.getElementById("legalModal");
        if (modal) modal.remove();

        alert(`✅ 동의가 완료되었습니다.\n환영합니다, ${getNickname()}님.`);

    } catch (error) {
        alert("동의 처리 중 오류가 발생했습니다: " + error.message);
        console.error(error);
    }
}

// ===== Part 14: 점검 모드 시스템 (완전 수정) =====

// 3. 점검 모드 체크 함수 (로그인 후 실행)
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

// 4. 점검 화면 표시
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

// 5. 점검 화면 숨기기
function hideMaintenanceScreen() {
    const overlay = document.getElementById("maintenanceOverlay");
    if (overlay) {
        overlay.style.display = "none";
    }
}

// 6. 나가기 버튼 함수 (전역으로 등록)
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
        // 비로그인 상태면 그냥 닫기
        hideMaintenanceScreen();
    }
}

// 7. 점검 모드 실시간 감지 (관리자가 설정 변경 시)
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

// 8. 관리자용: 점검 설정 모달 열기
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

// 9. 관리자용: 점검 설정 저장
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

// 10. 모달 닫기
window.closeMaintenanceModal = function() {
    document.getElementById("maintenanceModal").classList.remove("active");
}

// ===== 더보기 메뉴 및 메신저 기능 추가 =====

// 더보기 메뉴 표시
function showMoreMenu() {
    hideAll();
    document.getElementById("moreMenuSection").classList.add("active");
    

    // 이벤트 버튼 표시 여부 체크
    checkEventAccess();
    
    updateURL('more');
}

// ===== 이벤트 메뉴 표시 함수 =====
// "더보기 메뉴 및 메신저 기능 추가" 섹션 뒤에 이 코드를 추가하세요

// 이벤트 메뉴 표시
function showEventMenu() {
    hideAll();
    document.getElementById("eventMenuSection").classList.add("active");
    updateURL('event');
}

// 메신저 표시
async function showMessenger() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    hideAll();
    document.getElementById("messengerSection").classList.add("active");
    
    await loadNotifications();
    updateURL('messenger');
}

// 알림 로드
async function loadNotifications(filterType = 'all') {
    const uid = getUserId();
    if(!uid || uid === 'anonymous') {
        document.getElementById("notificationsList").innerHTML = `
            <div style="text-align:center;padding:60px 20px;color:#868e96;">
                <i class="fas fa-inbox" style="font-size:48px;margin-bottom:16px;opacity:0.5;"></i>
                <p>로그인 후 알림을 확인하세요</p>
            </div>
        `;
        return;
    }
    
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
        
        const listDiv = document.getElementById("notificationsList");
        
        if(notifications.length === 0) {
            listDiv.innerHTML = `
                <div style="text-align:center;padding:60px 20px;color:#868e96;">
                    <i class="fas fa-inbox" style="font-size:48px;margin-bottom:16px;opacity:0.5;"></i>
                    <p>알림이 없습니다</p>
                </div>
            `;
            updateMessengerBadge(0);
            return;
        }
        
        const unreadCount = notifications.filter(n => !n.read).length;
        updateMessengerBadge(unreadCount);
        
        listDiv.innerHTML = notifications.map(notif => {
            const icon = notif.type === 'article' ? '📰' : 
                        notif.type === 'comment' ? '💬' : 
                        notif.type === 'myArticleComment' ? '💭' : '🔔';
            
            const date = new Date(notif.timestamp).toLocaleString();
            const isUnread = !notif.read;
            
            return `
                <div class="notification-card ${isUnread ? 'unread' : ''}" 
                     onclick="handleNotificationClick('${notif.id}', '${notif.articleId || ''}')"
                     style="cursor:pointer;">
                    <div class="notification-icon">${icon}</div>
                    <div class="notification-content">
                        <h4 class="notification-title">${notif.title || '알림'}</h4>
                        <p class="notification-text">${notif.text}</p>
                        <span class="notification-time">${date}</span>
                    </div>
                    ${isUnread ? '<div class="unread-dot"></div>' : ''}
                </div>
            `;
        }).join('');
        
    } catch(error) {
        console.error("알림 로드 오류:", error);
        document.getElementById("notificationsList").innerHTML = `
            <div style="text-align:center;padding:40px 20px;color:#dc3545;">
                <p>알림을 불러오는데 실패했습니다</p>
            </div>
        `;
    }
}

// 알림 필터링
function filterNotifications(type) {
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    document.querySelector(`[data-filter="${type}"]`).classList.add('active');
    loadNotifications(type);
}

// 알림 클릭 처리
async function handleNotificationClick(notifId, articleId) {
    const uid = getUserId();
    
    // 읽음 처리
    await db.ref("notifications/" + uid + "/" + notifId).update({ read: true });
    
    // 기사로 이동
    if(articleId) {
        showArticleDetail(articleId);
    }
}

// 모두 읽음 처리
async function markAllAsRead() {
    const uid = getUserId();
    if(!uid || uid === 'anonymous') return;
    
    if(!confirm("모든 알림을 읽음 처리하시겠습니까?")) return;
    
    try {
        const snapshot = await db.ref("notifications/" + uid).once("value");
        const notificationsData = snapshot.val() || {};
        
        const updates = {};
        Object.keys(notificationsData).forEach(notifId => {
            updates[`notifications/${uid}/${notifId}/read`] = true;
        });
        
        await db.ref().update(updates);
        alert("모든 알림이 읽음 처리되었습니다.");
        loadNotifications();
        
    } catch(error) {
        alert("오류: " + error.message);
    }
}

// 메신저 뱃지 업데이트
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

// ===== 4. 알림 배지 업데이트 중복 방지 =====
// script.js의 setupMessengerBadgeListener 함수를 찾아서 이 코드로 교체하세요

function setupMessengerBadgeListener() {
    const uid = getUserId();
    if(!uid || uid === 'anonymous') return;
    
    // ⭐ 이전 리스너 제거
    db.ref("notifications/" + uid).off('value');
    
    // ⭐ 한 번만 리스너 등록
    db.ref("notifications/" + uid).on("value", snapshot => {
        const notificationsData = snapshot.val() || {};
        const unreadCount = Object.values(notificationsData).filter(n => !n.read).length;
        updateMessengerBadge(unreadCount);
    });
}

// 이벤트 접근 권한 체크
async function checkEventAccess() {
    const eventBtn = document.getElementById("moreEventBtn");
    if(!eventBtn) return;
    
    if(!isLoggedIn()) {
        eventBtn.style.display = "none";
        return;
    }
    
    const user = auth.currentUser;
    if(isAdmin()) {
        eventBtn.style.display = "block";
        return;
    }
    
    const snap = await db.ref("users/" + user.uid).once("value");
    const userData = snap.val() || {};
    const isVIP = userData.isVIP || false;
    
    eventBtn.style.display = isVIP ? "block" : "none";
}

// renderThemeSoundSettings 함수 수정
async function renderThemeSoundSettings() {
    if(!isLoggedIn()) return '';
    
    const uid = getUserId();
    
    try {
        const themeSnapshot = await db.ref("users/" + uid + "/activeTheme").once("value");
        const soundsSnapshot = await db.ref("users/" + uid + "/activeSounds").once("value");
        const bgmSnapshot = await db.ref("users/" + uid + "/activeBGM").once("value");
        const inventorySnapshot = await db.ref("users/" + uid + "/inventory").once("value");
        
        const activeTheme = themeSnapshot.val() || 'default';
        const activeSounds = soundsSnapshot.val() || false;
        const activeBGM = bgmSnapshot.val() || false;
        const inventory = inventorySnapshot.val() || [];
        
        const hasChristmasTheme = inventory.includes('christmas_theme');
        
        // ✅ 테마 ON/OFF 상태 정확히 표시
        const isThemeActive = activeTheme === 'christmas';
        
        return `
            <div style="background:#fff; border:1px solid #dadce0; padding:20px; border-radius:8px; margin-bottom:20px;">
                <h4 style="margin:0 0 15px 0; color:#202124;">🎨 테마 & 사운드</h4>
                
                ${hasChristmasTheme ? `
                    <div style="background:#fff3cd; padding:12px; border-radius:6px; margin-bottom:15px; border-left:4px solid #856404;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <strong style="color:#856404;">🎄 크리스마스 테마</strong>
                                <div style="font-size:12px; color:#856404; margin-top:3px;">
                                    현재: ${isThemeActive ? '✅ ON' : '⭕ OFF'}
                                </div>
                            </div>
                            <label class="switch">
                                <input type="checkbox" ${isThemeActive ? 'checked' : ''} onchange="toggleThemeFromInventory()">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                ` : `
                    <p style="color:#868e96; font-size:13px; text-align:center; padding:20px;">
                        보유한 테마가 없습니다.
                    </p>
                `}
            </div>
        `;
        
    } catch(error) {
        console.error("설정 렌더링 오류:", error);
        return '';
    }
}

window.addEventListener("load", () => {
    console.log("🚀 시스템 초기화 시작...");
    
    setupArticlesListener();
    loadBannedWords();
    setupArticleForm();
    
    // 캐치마인드 설정 로드
    loadCatchMindConfig();
    
    // 🆕 힌트 페널티 로드
    loadHintPenaltyFromFirebase();
    

    
    setTimeout(() => {
        showActivePopupsToUser();
    }, 1000);

    // ✅ 점검 모드 실시간 리스너 등록
    initMaintenanceListener();
    
    // 캐치마인드 설정 로드
    loadCatchMindConfig();
    
    // 쿠폰 설정 로드
    loadCouponConfig();
    
    initialRoute();
    
    console.log("✅ 시스템 초기화 완료!");
});

    // ===== 3. PWA 설치 배너 경고 해결 =====
// script.js의 PWA 관련 코드를 찾아서 이 코드로 교체하세요

let deferredPrompt;
let installPromptShown = false; // ⭐ 중복 방지 플래그

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📱 PWA 설치 프롬프트 감지');
    
    // ⭐ preventDefault는 즉시 호출
    e.preventDefault();
    deferredPrompt = e;
    
    // 이미 프롬프트를 본 적이 있으면 리턴
    if(getCookie('pwa_install_prompted')) {
        console.log('이미 설치 프롬프트를 본 사용자');
        return;
    }
    
    // ⭐ 이미 이번 세션에서 표시했으면 리턴
    if(installPromptShown) {
        console.log('이미 이번 세션에서 프롬프트 표시됨');
        return;
    }
    
    // ⭐ 3초 후 자동으로 프롬프트 표시
    setTimeout(() => {
        if(deferredPrompt && !getCookie('pwa_install_prompted') && !installPromptShown) {
            showPWAInstallPrompt();
        }
    }, 3000);
});

// PWA 설치 프롬프트 표시 (수정됨)
function showPWAInstallPrompt() {
    if(!deferredPrompt || installPromptShown) return;
    
    installPromptShown = true; // ⭐ 플래그 설정
    
    // ⭐ 커스텀 UI로 물어본 후, 동의하면 prompt() 호출
    if(confirm('📱 해정뉴스를 홈 화면에 추가하시겠어요?\n\n푸시 알림을 받으려면 홈 화면 추가가 필요합니다.')) {
        // ⭐ 중요: 사용자가 동의한 경우에만 prompt() 호출
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('✅ PWA 설치 완료');
            } else {
                console.log('❌ PWA 설치 거부');
            }
            deferredPrompt = null;
        });
        
        // 30일 동안 다시 표시하지 않음
        setCookie('pwa_install_prompted', 'true', 30);
    } else {
        // 사용자가 거부한 경우, 7일 후 다시 표시
        setCookie('pwa_install_prompted', 'true', 7);
        deferredPrompt = null;
    }
}

// ===== 전역 에러 핸들러 =====
window.addEventListener('error', function(e) {
    console.error('전역 에러:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('처리되지 않은 Promise 거부:', e.reason);
});

console.log("📄 script.js 로드 완료 - 모든 파트 준비됨");

// ===== 캐치마인드 시스템 =====

// 캐치마인드 설정 로드 (약 4050번째 줄)
function loadCatchMindConfig() {
    fetch('./json/catchmind-config.json')  // 경로 수정
        .then(response => response.json())
        .then(data => {
            catchMindGames = data.games;
            hintPenalty = data.hintPenalty || 20;
            console.log("✅ 캐치마인드 설정 로드 완료:", catchMindGames.length + "개 게임");
            console.log("💡 힌트 페널티:", hintPenalty + "원");
        })
        .catch(err => {
            console.error("❌ 캐치마인드 설정 로드 실패:", err);
            catchMindGames = [];
        });
}

// 기존 showCatchMind 함수 수정
function showCatchMind() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    hideAll();
    document.getElementById("catchMindSection").classList.add("active");
    
    const content = document.getElementById("catchMindContent");
    content.innerHTML = `
        <div class="catchmind-start-screen">
            <div style="font-size:64px; margin-bottom:20px;">🎨</div>
            <h2 style="margin-bottom:20px;">캐치마인드</h2>
            <p style="color:#5f6368; margin-bottom:30px; line-height:1.6;">
                이미지를 보고 정답을 맞춰보세요!<br>
                빠르게 맞출수록 더 많은 포인트를 획득합니다.
            </p>
            
            <div class="difficulty-buttons">
                <button class="difficulty-btn easy ${currentDifficulty === 'easy' ? 'active' : ''}" onclick="selectDifficulty('easy')">
                    쉬움
                </button>
                <button class="difficulty-btn medium ${currentDifficulty === 'medium' ? 'active' : ''}" onclick="selectDifficulty('medium')">
                    보통
                </button>
                <button class="difficulty-btn hard ${currentDifficulty === 'hard' ? 'active' : ''}" onclick="selectDifficulty('hard')">
                    어려움
                </button>
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

// 난이도 선택
window.selectDifficulty = function(difficulty) {
    currentDifficulty = difficulty;
    showCatchMind();
}

// 게임 규칙 표시
window.showGameRules = function() {
    alert(`🎮 캐치마인드 규칙\n\n1. 이미지와 힌트를 보고 정답을 맞추세요.\n2. 제한 시간 내에 정답을 입력해야 합니다.\n3. 빠르게 맞출수록 더 많은 포인트를 획득합니다.\n4. 시간이 초과되면 포인트를 얻을 수 없습니다.\n5. 힌트를 사용할 때마다 획득 금액이 ${hintPenalty}원씩 감소합니다.\n6. 정답 시도는 무제한입니다.\n\n난이도별 특징:\n쉬움: 30초, 간단한 문제\n보통: 20초, 중간 난이도\n어려움: 15초, 어려운 문제\n*어려운 문제는 주제가 제시되지 않습니다`);
}

// 힌트 페널티 설정 관리자 UI
window.showHintPenaltyManager = async function() {
    if(!isAdmin()) return alert("관리자만 접근 가능합니다.");
    
    const modalHTML = `
        <div id="hintPenaltyModal" class="modal active">
            <div class="modal-content" style="max-width:500px;">
                <h3 style="margin-bottom:20px; color:#c62828;">⚙️ 힌트 페널티 설정</h3>
                <form id="hintPenaltyForm" onsubmit="saveHintPenalty(event)">
                    <div class="form-group">
                        <label class="form-label">힌트 사용 시 감소 금액</label>
                        <input type="number" id="hintPenaltyInput" class="form-control" 
                               value="${hintPenalty}" min="0" step="10" required>
                        <small style="color:#6c757d; display:block; margin-top:5px;">
                            힌트를 한 번 사용할 때마다 획득 금액에서 차감되는 금액입니다.
                        </small>
                    </div>
                    <button type="submit" class="btn-primary btn-block" style="margin-bottom:10px;">
                        저장
                    </button>
                    <button type="button" onclick="closeHintPenaltyModal()" class="btn-secondary btn-block">
                        취소
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.saveHintPenalty = async function(e) {
    e.preventDefault();
    
    const newPenalty = parseInt(document.getElementById("hintPenaltyInput").value);
    
    try {
        // Firebase에 저장
        await db.ref("adminSettings/catchMind/hintPenalty").set(newPenalty);
        
        // 로컬 변수 업데이트
        hintPenalty = newPenalty;
        
        alert(`✅ 힌트 페널티가 ${newPenalty}원으로 설정되었습니다.`);
        closeHintPenaltyModal();
        
    } catch(error) {
        alert("저장 실패: " + error.message);
    }
}

window.closeHintPenaltyModal = function() {
    const modal = document.getElementById("hintPenaltyModal");
    if(modal) modal.remove();
}

// Firebase에서 힌트 페널티 로드
async function loadHintPenaltyFromFirebase() {
    try {
        const snapshot = await db.ref("adminSettings/catchMind/hintPenalty").once("value");
        if(snapshot.exists()) {
            hintPenalty = snapshot.val();
            console.log("✅ Firebase에서 힌트 페널티 로드:", hintPenalty);
        }
    } catch(error) {
        console.error("❌ 힌트 페널티 로드 실패:", error);
    }
}

// 게임 시작
window.startCatchMindGame = function() {
    const games = catchMindGames.filter(g => g.difficulty === currentDifficulty);
    
    if(games.length === 0) {
        alert("선택한 난이도의 게임이 없습니다!");
        return;
    }
    
    // 랜덤 게임 선택
    currentGame = games[Math.floor(Math.random() * games.length)];
    timeRemaining = currentGame.timeLimit;
    usedHints = 0; // 힌트 사용 개수 초기화
    
    // 초기 보상 계산
    updateCurrentReward();
    
    displayGameScreen();
    startGameTimer();
}

// 현재 획득 가능 금액 계산
function updateCurrentReward() {
    const elapsedTime = currentGame.timeLimit - timeRemaining;
    const baseReward = calculateReward(elapsedTime);
    const penalty = usedHints * hintPenalty;
    currentReward = Math.max(0, baseReward - penalty);
}

// 게임 화면 표시
function displayGameScreen() {
    const content = document.getElementById("catchMindContent");
    
    // 처음에는 모든 힌트 숨김
    const hintsHTML = currentGame.hints.map((hint, idx) => `
        <div class="hint-item" id="hint_${idx}" style="display:none;">
            ${idx + 1}. ${hint}
        </div>
    `).join('');
    
    content.innerHTML = `
        <div class="catchmind-game-screen">
            <div style="text-align:center;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <div style="background:${currentDifficulty === 'easy' ? '#4caf50' : currentDifficulty === 'medium' ? '#ff9800' : '#f44336'}; color:white; padding:6px 16px; border-radius:20px; font-weight:700; font-size:12px;">
                        ${currentDifficulty === 'easy' ? '쉬움' : currentDifficulty === 'medium' ? '보통' : '어려움'}
                    </div>
                    <div class="timer-display" id="gameTimer">${timeRemaining}초</div>
                </div>
                
                <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; padding:16px; border-radius:12px; margin-bottom:20px; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                    <div style="font-size:14px; opacity:0.9; margin-bottom:5px;">💰 현재 획득 가능 금액</div>
                    <div id="currentRewardDisplay" style="font-size:32px; font-weight:900;">${currentReward}원</div>
                    ${usedHints > 0 ? `<div style="font-size:12px; opacity:0.8; margin-top:5px;">💡 사용한 힌트: ${usedHints}개 (-${usedHints * hintPenalty}원)</div>` : ''}
                </div>
                
                <div style="background:var(--light-gray); padding:12px; border-radius:8px; margin-bottom:20px;">
                    <strong>주제:</strong> ${currentGame.subject}
                </div>
                
                <img src="${currentGame.imageUrl}" class="catchmind-image" alt="게임 이미지">
                
                <div class="hint-list">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <strong>💡 힌트</strong>
                        <button onclick="useHint()" class="btn-warning" style="padding:6px 16px; font-size:13px;">
                            힌트 사용 (-${hintPenalty}원)
                        </button>
                    </div>
                    <div id="hintsContainer">
                        ${hintsHTML}
                    </div>
                    <div id="noMoreHints" style="display:none; color:#868e96; font-size:13px; margin-top:10px;">
                        모든 힌트를 사용했습니다.
                    </div>
                </div>
                
                <div class="answer-input-wrapper">
                    <input type="text" id="answerInput" class="form-control" placeholder="정답을 입력하세요 (무제한 시도)" 
                           onkeypress="if(event.key==='Enter') submitAnswer()">
                    <button onclick="submitAnswer()" class="btn-primary">
                        제출
                    </button>
                </div>
                
                <div id="feedbackMessage" style="margin-top:15px; min-height:30px; font-weight:600;"></div>
                
                <button onclick="giveUpGame()" class="btn-danger btn-block" style="margin-top:20px;">
                    <i class="fas fa-flag"></i> 포기하기
                </button>
            </div>
        </div>
    `;
    
    document.getElementById("answerInput").focus();
}

// 힌트 사용
window.useHint = function() {
    if(usedHints >= currentGame.hints.length) {
        alert("더 이상 사용할 힌트가 없습니다!");
        return;
    }
    
    // 다음 힌트 표시
    const hintEl = document.getElementById(`hint_${usedHints}`);
    if(hintEl) {
        hintEl.style.display = "block";
        usedHints++;
        
        // 보상 재계산
        updateCurrentReward();
        updateRewardDisplay();
        
        // 모든 힌트 사용 시
        if(usedHints >= currentGame.hints.length) {
            document.getElementById("noMoreHints").style.display = "block";
        }
        
        showFeedback(`💡 힌트가 공개되었습니다! (-${hintPenalty}원)`, "#ff9800");
    }
}

// 보상 표시 업데이트 (수정된 버전)
function updateRewardDisplay() {
    const rewardDisplay = document.getElementById("currentRewardDisplay");
    if(!rewardDisplay) return;
    
    rewardDisplay.textContent = currentReward + "원";
    
    // 기존 힌트 정보 모두 제거
    const rewardContainer = rewardDisplay.parentElement;
    const existingHintInfo = rewardContainer.querySelectorAll('.hint-usage-info');
    existingHintInfo.forEach(el => el.remove());
    
    // 힌트를 사용한 경우에만 새로 추가
    if(usedHints > 0) {
        const hintInfo = document.createElement('div');
        hintInfo.className = 'hint-usage-info';
        hintInfo.style.cssText = 'font-size:12px; opacity:0.8; margin-top:5px;';
        hintInfo.textContent = `💡 사용한 힌트: ${usedHints}개 (-${usedHints * hintPenalty}원)`;
        rewardDisplay.insertAdjacentElement('afterend', hintInfo);
    }
}

// 타이머 시작
function startGameTimer() {
    if(gameTimer) clearInterval(gameTimer);
    
    gameTimer = setInterval(() => {
        timeRemaining--;
        
        const timerEl = document.getElementById("gameTimer");
        if(timerEl) {
            timerEl.textContent = timeRemaining + "초";
            
            if(timeRemaining <= 10) {
                timerEl.classList.add("warning");
            }
        }
        
        // 보상 업데이트 (시간에 따라)
        updateCurrentReward();
        updateRewardDisplay();
        
        if(timeRemaining <= 0) {
            clearInterval(gameTimer);
            gameTimer = null;
            showTimeOverResult();
        }
    }, 1000);
}

// 정답 제출
window.submitAnswer = function() {
    const input = document.getElementById("answerInput");
    const userAnswer = input.value.trim();
    
    if(!userAnswer) {
        showFeedback("⚠️ 정답을 입력해주세요!", "#f44336");
        return;
    }
    
    if(userAnswer === currentGame.answer) {
        // 정답!
        if(gameTimer) clearInterval(gameTimer);
        gameTimer = null;
        
        showGameResult(true, currentReward);
        
        // 포인트 지급
        const elapsedTime = currentGame.timeLimit - timeRemaining;
        updateUserMoney(currentReward, `캐치마인드 정답 (${elapsedTime}초, 힌트 ${usedHints}개 사용)`);
    } else {
        // 오답 - 다시 시도 가능
        showFeedback("❌ 틀렸습니다! 다시 시도하세요.", "#f44336");
        input.value = "";
        input.focus();
    }
}

// 피드백 메시지 표시
function showFeedback(message, color) {
    const feedbackEl = document.getElementById("feedbackMessage");
    if(feedbackEl) {
        feedbackEl.textContent = message;
        feedbackEl.style.color = color;
        
        // 3초 후 메시지 사라짐
        setTimeout(() => {
            feedbackEl.textContent = "";
        }, 3000);
    }
}

// 포기하기
window.giveUpGame = function() {
    if(!confirm("정말 포기하시겠습니까?\n포인트를 획득할 수 없습니다.")) return;
    
    if(gameTimer) clearInterval(gameTimer);
    gameTimer = null;
    
    showGameResult(false, 0, true); // 포기
}

// 시간 초과 결과
function showTimeOverResult() {
    const content = document.getElementById("catchMindContent");
    
    content.innerHTML = `
        <div class="game-result-screen">
            <div style="font-size:64px; margin-bottom:20px;">⏰</div>
            <h2 style="margin-bottom:20px; color:#f44336;">시간 초과!</h2>
            
            <img src="${currentGame.imageUrl}" class="result-image" alt="정답 이미지">
            
            <div class="correct-answer">
                정답: ${currentGame.answer}
            </div>
            
            <p style="color:#f44336; margin:20px 0;">제한 시간 내에 정답을 맞추지 못했습니다.</p>
            
            <div class="difficulty-buttons">
                <button class="difficulty-btn easy ${currentDifficulty === 'easy' ? 'active' : ''}" onclick="selectDifficulty('easy')">
                    쉬움
                </button>
                <button class="difficulty-btn medium ${currentDifficulty === 'medium' ? 'active' : ''}" onclick="selectDifficulty('medium')">
                    보통
                </button>
                <button class="difficulty-btn hard ${currentDifficulty === 'hard' ? 'active' : ''}" onclick="selectDifficulty('hard')">
                    어려움
                </button>
            </div>
            
            <button onclick="startCatchMindGame()" class="btn-primary btn-block" style="margin-top:20px; margin-bottom:12px;">
                <i class="fas fa-redo"></i> 다시 도전
            </button>
            <button onclick="showCatchMind()" class="btn-secondary btn-block">
                <i class="fas fa-arrow-left"></i> 메인으로
            </button>
        </div>
    `;
}

// 보상 계산
function calculateReward(elapsedTime) {
    const rewards = currentGame.rewards;
    const rewardKeys = Object.keys(rewards).map(k => parseInt(k.replace('sec', ''))).sort((a, b) => a - b);
    
    for(let i = 0; i < rewardKeys.length; i++) {
        if(elapsedTime <= rewardKeys[i]) {
            return rewards[rewardKeys[i] + 'sec'];
        }
    }
    
    return 0;
}

// 게임 결과 표시
function showGameResult(isCorrect, reward, giveUp = false) {
    const content = document.getElementById("catchMindContent");
    const elapsedTime = currentGame.timeLimit - timeRemaining;
    
    let resultIcon = '😢';
    let resultTitle = '시간 초과!';
    let resultColor = '#f44336';
    
    if(isCorrect) {
        resultIcon = '🎉';
        resultTitle = '정답입니다!';
        resultColor = '#4caf50';
    } else if(giveUp) {
        resultIcon = '🏳️';
        resultTitle = '포기하셨습니다';
        resultColor = '#ff9800';
    }
    
    content.innerHTML = `
        <div class="game-result-screen">
            <div style="font-size:64px; margin-bottom:20px;">
                ${resultIcon}
            </div>
            <h2 style="margin-bottom:20px; color:${resultColor};">
                ${resultTitle}
            </h2>
            
            <img src="${currentGame.imageUrl}" class="result-image" alt="정답 이미지">
            
            <div class="correct-answer">
                정답: ${currentGame.answer}
            </div>
            
            ${isCorrect ? `
                <div style="background:var(--light-gray); padding:15px; border-radius:8px; margin:20px 0;">
                    <div style="color:#5f6368; font-size:14px; margin-bottom:5px;">소요 시간</div>
                    <div style="font-size:24px; font-weight:900;">${elapsedTime}초</div>
                    ${usedHints > 0 ? `<div style="color:#ff9800; font-size:13px; margin-top:5px;">💡 사용한 힌트: ${usedHints}개</div>` : ''}
                </div>
                
                <div class="reward-display">
                    💰 +${reward}원 획득!
                </div>
            ` : `
                <p style="color:${resultColor}; margin:20px 0;">
                    ${giveUp ? '다음엔 끝까지 도전해보세요!' : '시간 내에 정답을 맞추지 못했습니다.'}
                </p>
            `}
            
            <div class="difficulty-buttons">
                <button class="difficulty-btn easy ${currentDifficulty === 'easy' ? 'active' : ''}" onclick="selectDifficulty('easy')">
                    쉬움
                </button>
                <button class="difficulty-btn medium ${currentDifficulty === 'medium' ? 'active' : ''}" onclick="selectDifficulty('medium')">
                    보통
                </button>
                <button class="difficulty-btn hard ${currentDifficulty === 'hard' ? 'active' : ''}" onclick="selectDifficulty('hard')">
                    어려움
                </button>
            </div>
            
            <button onclick="startCatchMindGame()" class="btn-primary btn-block" style="margin-top:20px; margin-bottom:12px;">
                <i class="fas fa-redo"></i> 계속하기
            </button>
            <button onclick="showCatchMind()" class="btn-secondary btn-block">
                <i class="fas fa-arrow-left"></i> 메인으로
            </button>
        </div>
    `;
}

// ===== 쿠폰 시스템 =====

// 쿠폰 설정 로드 (약 4350번째 줄)
function loadCouponConfig() {
    fetch('./json/coupon-config.json')  // 경로 수정
        .then(response => response.json())
        .then(data => {
            couponsConfig = data.coupons;
            console.log("✅ 쿠폰 설정 로드 완료:", couponsConfig.length + "개");
        })
        .catch(err => {
            console.error("❌ 쿠폰 설정 로드 실패:", err);
            couponsConfig = [];
        });
}

// 쿠폰 페이지 표시
window.showCouponPage = function() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        googleLogin();
        return;
    }
    
    hideAll();
    const section = document.getElementById("couponSection");
    if(!section) {
        console.error("❌ couponSection 요소를 찾을 수 없습니다!");
        alert("쿠폰 페이지를 불러올 수 없습니다.");
        return;
    }
    
    section.classList.add("active");
    
    const content = document.getElementById("couponContent");
    if(!content) {
        console.error("❌ couponContent 요소를 찾을 수 없습니다!");
        return;
    }
    
    content.innerHTML = `
        <div style="max-width:600px; margin:0 auto; padding:20px;">
            <h2 style="margin-bottom:30px; text-align:center; color:#c62828;">
                <i class="fas fa-ticket-alt"></i> 쿠폰 등록
            </h2>
            
            <div style="background:#fff; border-radius:12px; padding:30px; box-shadow:0 2px 8px rgba(0,0,0,0.1); margin-bottom:30px;">
                <div class="form-group">
                    <label class="form-label" style="font-weight:600; margin-bottom:10px; display:block;">쿠폰 코드</label>
                    <input type="text" id="couponCodeInput" class="form-control" 
                           placeholder="쿠폰 코드를 입력하세요" 
                           style="text-align:center; font-size:18px; font-weight:700; text-transform:uppercase;">
                </div>
                <button onclick="useCoupon()" class="btn-primary btn-block" style="margin-top:20px;">
                    <i class="fas fa-gift"></i> 쿠폰 사용하기
                </button>
            </div>
            
            <div style="background:#f8f9fa; border-radius:8px; padding:20px; border-left:4px solid #c62828;">
                <h4 style="margin-bottom:15px; color:#495057;">
                    <i class="fas fa-info-circle"></i> 쿠폰 안내
                </h4>
                <ul style="color:#6c757d; font-size:14px; line-height:1.8; padding-left:20px; margin:0;">
                    <li>쿠폰 코드는 대소문자를 구분합니다</li>
                    <li>각 쿠폰은 1인 1회만 사용 가능합니다</li>
                    <li>만료된 쿠폰은 사용할 수 없습니다</li>
                    <li>VIP 전용 쿠폰은 VIP 회원만 사용 가능합니다</li>
                    <li>사용 가능 횟수가 모두 소진된 쿠폰은 사용할 수 없습니다</li>
                </ul>
            </div>
            
            <button onclick="showEventMenu()" class="btn-secondary btn-block" style="margin-top:20px;">
                <i class="fas fa-arrow-left"></i> 돌아가기
            </button>
        </div>
    `;
    
    // 입력창 포커스
    setTimeout(() => {
        const input = document.getElementById("couponCodeInput");
        if(input) input.focus();
    }, 100);
    
    updateURL('coupon');
}

// 쿠폰 사용
window.useCoupon = async function() {
    const codeInput = document.getElementById("couponCodeInput");
    if(!codeInput) {
        alert("입력창을 찾을 수 없습니다.");
        return;
    }
    
    const code = codeInput.value.trim();
    
    if(!code) {
        alert("쿠폰 코드를 입력해주세요!");
        codeInput.focus();
        return;
    }
    
    const uid = getUserId();
    if(!uid || uid === 'anonymous') {
        alert("로그인이 필요합니다!");
        return;
    }
    
    try {
        // 쿠폰 찾기
        const coupon = couponsConfig.find(c => c.code === code);
        
        if(!coupon) {
            alert("❌ 존재하지 않는 쿠폰 코드입니다.");
            codeInput.value = "";
            codeInput.focus();
            return;
        }
        
        // 활성화 확인
        if(!coupon.active) {
            alert("❌ 비활성화된 쿠폰입니다.");
            codeInput.value = "";
            codeInput.focus();
            return;
        }
        
        // 만료일 확인
        const now = new Date();
        const expiry = new Date(coupon.expiryDate);
        if(now > expiry) {
            alert("❌ 만료된 쿠폰입니다.\n\n만료일: " + expiry.toLocaleDateString());
            codeInput.value = "";
            codeInput.focus();
            return;
        }
        
        // VIP 전용 확인
        if(coupon.vipOnly) {
            const userSnapshot = await db.ref("users/" + uid).once("value");
            const userData = userSnapshot.val() || {};
            if(!userData.isVIP && !isAdmin()) {
                alert("❌ 이 쿠폰은 VIP 회원 전용입니다.");
                codeInput.value = "";
                codeInput.focus();
                return;
            }
        }
        
        // 이미 사용했는지 확인
        const usageSnapshot = await db.ref("couponUsage/" + uid + "/" + code).once("value");
        if(usageSnapshot.exists()) {
            const usageData = usageSnapshot.val();
            const usedDate = new Date(usageData.usedAt).toLocaleString();
            alert("❌ 이미 사용한 쿠폰입니다.\n\n사용일: " + usedDate);
            codeInput.value = "";
            codeInput.focus();
            return;
        }
        
        // 전체 사용 횟수 확인
        const couponSnapshot = await db.ref("coupons/" + code).once("value");
        const couponData = couponSnapshot.val() || { currentUses: 0 };
        
        if(couponData.currentUses >= coupon.maxUses) {
            alert("❌ 사용 가능 횟수를 초과한 쿠폰입니다.\n\n최대 사용 횟수: " + coupon.maxUses);
            codeInput.value = "";
            codeInput.focus();
            return;
        }
        
        // 확인 메시지
        if(!confirm(`🎁 쿠폰을 사용하시겠습니까?\n\n💰 보상: ${coupon.reward}원\n📝 설명: ${coupon.description}`)) {
            return;
        }
        
        // 쿠폰 사용 처리
        await db.ref("couponUsage/" + uid + "/" + code).set({
            usedAt: Date.now(),
            reward: coupon.reward,
            description: coupon.description
        });
        
        await db.ref("coupons/" + code).update({
            currentUses: (couponData.currentUses || 0) + 1,
            lastUsedAt: Date.now()
        });
        
        // 포인트 지급
        await updateUserMoney(coupon.reward, `쿠폰 사용: ${coupon.description}`);
        
        alert(`✅ 쿠폰이 성공적으로 적용되었습니다!\n\n💰 +${coupon.reward}원 획득\n📝 ${coupon.description}`);
        codeInput.value = "";
        codeInput.focus();
        
    } catch(error) {
        console.error("쿠폰 사용 오류:", error);
        alert("❌ 오류가 발생했습니다: " + error.message);
    }
}

// redeemCoupon은 useCoupon의 별칭 (호환성)
window.redeemCoupon = window.useCoupon;

// ===== 캐치마인드 힌트 사용 수정 (기존 useHint 함수 교체) =====

// 힌트 사용 (돈 차감 포함)
window.useHint = async function() {
    if(usedHints >= currentGame.hints.length) {
        alert("더 이상 사용할 힌트가 없습니다!");
        return;
    }
    
    // 💰 현재 보유 금액 확인
    const currentMoney = await getUserMoney();
    
    if(currentMoney < hintPenalty) {
        alert(`💸 포인트가 부족합니다!\n\n필요: ${hintPenalty}원\n보유: ${currentMoney}원`);
        return;
    }
    
    // 확인 메시지
    if(!confirm(`힌트를 사용하시겠습니까?\n\n💰 ${hintPenalty}원이 차감됩니다.`)) {
        return;
    }
    
    try {
        // 💸 돈 차감
        await updateUserMoney(-hintPenalty, "캐치마인드 힌트 사용");
        
        // 다음 힌트 표시
        const hintEl = document.getElementById(`hint_${usedHints}`);
        if(hintEl) {
            hintEl.style.display = "block";
            usedHints++;
            
            // 보상 재계산
            updateCurrentReward();
            updateRewardDisplay();
            
            // 모든 힌트 사용 시
            if(usedHints >= currentGame.hints.length) {
                document.getElementById("noMoreHints").style.display = "block";
            }
            
            showFeedback(`💡 힌트가 공개되었습니다! (-${hintPenalty}원)`, "#ff9800");
        }
        
    } catch(error) {
        console.error("힌트 사용 오류:", error);
        alert("힌트 사용 중 오류가 발생했습니다.");
    }
}

// ===== 게임 화면 표시 수정 (힌트 버튼에 disabled 속성 추가) =====

// 게임 화면 표시 (보상 표시 부분만 수정)
function displayGameScreen() {
    const content = document.getElementById("catchMindContent");
    
    const hintsHTML = currentGame.hints.map((hint, idx) => `
        <div class="hint-item" id="hint_${idx}" style="display:none;">
            ${idx + 1}. ${hint}
        </div>
    `).join('');
    
    content.innerHTML = `
        <div class="catchmind-game-screen">
            <div style="text-align:center;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <div style="background:${currentDifficulty === 'easy' ? '#4caf50' : currentDifficulty === 'medium' ? '#ff9800' : '#f44336'}; color:white; padding:6px 16px; border-radius:20px; font-weight:700; font-size:12px;">
                        ${currentDifficulty === 'easy' ? '쉬움' : currentDifficulty === 'medium' ? '보통' : '어려움'}
                    </div>
                    <div class="timer-display" id="gameTimer">${timeRemaining}초</div>
                </div>
                
                <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:white; padding:16px; border-radius:12px; margin-bottom:20px; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                    <div style="font-size:14px; opacity:0.9; margin-bottom:5px;">💰 현재 획득 가능 금액</div>
                    <div id="currentRewardDisplay" style="font-size:32px; font-weight:900;">${currentReward}원</div>
                </div>
                
                <div style="background:var(--light-gray); padding:12px; border-radius:8px; margin-bottom:20px;">
                    <strong>주제:</strong> ${currentGame.subject}
                </div>
                
                <img src="${currentGame.imageUrl}" class="catchmind-image" alt="게임 이미지">
                
                <div class="hint-list">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <strong>💡 힌트</strong>
                        <button id="hintButton" onclick="useHint()" class="btn-warning" style="padding:6px 16px; font-size:13px;">
                            힌트 사용 (-${hintPenalty}원)
                        </button>
                    </div>
                    <div id="hintsContainer">
                        ${hintsHTML}
                    </div>
                    <div id="noMoreHints" style="display:none; color:#868e96; font-size:13px; margin-top:10px;">
                        모든 힌트를 사용했습니다.
                    </div>
                </div>
                
                <div class="answer-input-wrapper">
                    <input type="text" id="answerInput" class="form-control" placeholder="정답을 입력하세요 (무제한 시도)" 
                           onkeypress="if(event.key==='Enter') submitAnswer()">
                    <button onclick="submitAnswer()" class="btn-primary">
                        제출
                    </button>
                </div>
                
                <div id="feedbackMessage" style="margin-top:15px; min-height:30px; font-weight:600;"></div>
                
                <button onclick="giveUpGame()" class="btn-danger btn-block" style="margin-top:20px;">
                    <i class="fas fa-flag"></i> 포기하기
                </button>
            </div>
        </div>
    `;
    
    document.getElementById("answerInput").focus();
}

// ===== 로딩 인디케이터 =====
function showLoadingIndicator(message = "로딩 중...") {
    const existing = document.getElementById("loadingIndicator");
    if(existing) return;
    
    const html = `
        <div id="loadingIndicator" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
        ">
            <div style="
                background: white;
                padding: 30px 40px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #c62828;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <div style="color: #333; font-weight: 600; font-size: 16px;">
                    ${message}
                </div>
            </div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function hideLoadingIndicator() {
    const indicator = document.getElementById("loadingIndicator");
    if(indicator) indicator.remove();
}





console.log("✅ script.js 로드 완료");

// ===== 대댓글(답글) 시스템 =====

// 1. 댓글 로드 함수 (대댓글 렌더링 포함) - 기존 loadComments 교체
function loadComments(id) {
    const currentUser = getNickname();
    const currentEmail = getUserEmail();
    
    db.ref("comments/" + id).once("value").then(snapshot => {
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

        root.innerHTML = displayComments.map(([commentId, comment]) => {
            const isMyComment = isLoggedIn() && ((comment.authorEmail === currentEmail) || isAdmin());
            
            let repliesHTML = '';
            if (comment.replies) {
                const replies = Object.entries(comment.replies).sort((a, b) => new Date(a[1].timestamp) - new Date(b[1].timestamp));
                
                repliesHTML = replies.map(([replyId, reply]) => {
                    const isMyReply = isLoggedIn() && ((reply.authorEmail === currentEmail) || isAdmin());
                    return `
                        <div class="reply-item" id="reply-${replyId}">
                            <div class="reply-header">
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

        const loadMoreBtn = document.getElementById("loadMoreComments");
        if (endIdx < commentsList.length) {
            loadMoreBtn.innerHTML = `<button onclick="loadMoreComments()" class="btn-secondary btn-block">댓글 더보기 (${commentsList.length - endIdx}+)</button>`;
        } else {
            loadMoreBtn.innerHTML = "";
        }
    });
}

// 2. 답글 입력창 토글
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

// 3. 답글 등록
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
        
        const parentCommentSnap = await db.ref(`comments/${articleId}/${commentId}`).once('value');
        const parentComment = parentCommentSnap.val();
        
        if(parentComment && parentComment.authorEmail !== reply.authorEmail) {
             sendNotification('comment', {
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

// 4. 답글 삭제
window.deleteReply = async function(articleId, commentId, replyId) {
    if(!confirm("이 답글을 삭제하시겠습니까?")) return;
    
    try {
        await db.ref(`comments/${articleId}/${commentId}/replies/${replyId}`).remove();
        loadComments(articleId);
    } catch(error) {
        alert("삭제 실패: " + error.message);
    }
}

// 인벤토리에서 테마 토글 (ON/OFF)
window.toggleThemeFromInventory = async function() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    const uid = getUserId();
    
    try {
        // 현재 테마 상태 확인
        const snapshot = await db.ref("users/" + uid + "/activeTheme").once("value");
        const currentTheme = snapshot.val() || 'default';
        
        // 토글: 크리스마스 ↔ 기본
        const newTheme = (currentTheme === 'christmas') ? 'default' : 'christmas';
        
        // Firebase에 저장
        await db.ref("users/" + uid + "/activeTheme").set(newTheme);
        
        // 즉시 적용
        if (typeof applyTheme === 'function') {
            applyTheme(newTheme, true);
        } else {
             // applyTheme 함수가 없을 경우를 대비한 새로고침
             location.reload();
        }
        
        // 알림
        if(newTheme === 'christmas') {
            showToastNotification("🎄 테마 ON", "크리스마스 테마가 적용되었습니다!", null);
        } else {
            showToastNotification("✅ 테마 OFF", "기본 테마로 복원되었습니다.", null);
        }
        
        // 인벤토리 페이지 새로고침
        if(document.getElementById("inventorySection")?.classList.contains("active")) {
             // showInventoryPage가 존재할 경우에만 호출
             if(typeof showInventoryPage === 'function') await showInventoryPage();
        }
        
        // 프로필 설정창 업데이트 (테마 스위치 반영)
        updateSettings();
        
    } catch(error) {
        console.error("❌ 테마 토글 오류:", error);
        alert("테마 변경 중 오류가 발생했습니다.");
    }
}; // 기존에 여기에 있던 불필요한 } 를 제거하고 ; 로 마무리

// ===== 캐치마인드 문제 출제 시스템 =====

// 출제 페이지 표시
function showCreateGamePage() {
    const content = document.getElementById("catchMindContent");
    content.innerHTML = `
        <div style="max-width:600px; margin:0 auto;">
            <h3 style="text-align:center; margin-bottom:20px; color:#ff9800;">🎨 나만의 문제 만들기</h3>
            
            <div style="background:white; padding:20px; border-radius:12px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                <div class="form-group">
                    <label class="form-label">그림 업로드 (여러 장 가능)</label>
                    <input type="file" id="gameImages" class="form-control" accept="image/*" multiple onchange="previewGameImages(this)">
                    <div id="gameImagePreviews" style="display:flex; gap:10px; overflow-x:auto; margin-top:10px; padding-bottom:5px;"></div>
                </div>

                <div class="form-group">
                    <label class="form-label">주제</label>
                    <input type="text" id="gameSubject" class="form-control" placeholder="예: 동물, 음식, 속담">
                </div>
                
                <div class="form-group">
                    <label class="form-label">정답</label>
                    <input type="text" id="gameAnswer" class="form-control" placeholder="정답을 입력하세요">
                </div>

                <div class="form-group">
                    <label class="form-label">난이도</label>
                    <select id="gameDifficulty" class="form-control">
                        <option value="easy">쉬움</option>
                        <option value="medium">보통</option>
                        <option value="hard">어려움</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">힌트 설정</label>
                    <div id="hintInputsContainer">
                        <input type="text" class="form-control hint-input" placeholder="힌트 1" style="margin-bottom:5px;">
                    </div>
                    <button onclick="addHintInput()" class="btn-secondary" style="width:100%; margin-top:5px; font-size:12px;">+ 힌트 추가</button>
                </div>

                <div class="form-group">
                    <label class="form-label">설명 (선택사항)</label>
                    <textarea id="gameDescription" class="form-control" placeholder="문제에 대한 추가 설명이나 출제자의 한마디"></textarea>
                </div>

                <button onclick="submitUserGame()" class="btn-primary btn-block" style="margin-top:20px;">
                    <i class="fas fa-paper-plane"></i> 관리자에게 제출하기
                </button>
                <button onclick="showCatchMind()" class="btn-secondary btn-block" style="margin-top:10px;">
                    취소
                </button>
            </div>
        </div>
    `;
}

// 힌트 입력칸 추가
function addHintInput() {
    const container = document.getElementById("hintInputsContainer");
    const count = container.children.length + 1;
    if(count > 5) return alert("힌트는 최대 5개까지 설정 가능합니다.");
    
    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control hint-input";
    input.placeholder = `힌트 ${count}`;
    input.style.marginBottom = "5px";
    container.appendChild(input);
}

// 이미지 미리보기
function previewGameImages(input) {
    const container = document.getElementById("gameImagePreviews");
    container.innerHTML = "";
    
    if (input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.style.width = "60px";
                img.style.height = "60px";
                img.style.objectFit = "cover";
                img.style.borderRadius = "4px";
                img.style.border = "1px solid #ddd";
                container.appendChild(img);
            }
            reader.readAsDataURL(file);
        });
    }
}

// 문제 제출 로직
async function submitUserGame() {
    if (!confirm("작성한 문제를 제출하시겠습니까?\n관리자 검토 후 게임에 등록됩니다.")) return;
    
    showLoadingIndicator("제출 중...");
    
    const subject = document.getElementById("gameSubject").value;
    const answer = document.getElementById("gameAnswer").value;
    const difficulty = document.getElementById("gameDifficulty").value;
    const description = document.getElementById("gameDescription").value;
    const hintInputs = document.querySelectorAll(".hint-input");
    const hints = Array.from(hintInputs).map(input => input.value).filter(val => val.trim() !== "");
    
    const imageInput = document.getElementById("gameImages");
    
    if (!subject || !answer || imageInput.files.length === 0) {
        hideLoadingIndicator();
        return alert("주제, 정답, 이미지는 필수 항목입니다!");
    }

    // 이미지들을 Base64로 변환
    const imageUrls = [];
    const files = Array.from(imageInput.files);
    
    try {
        for (const file of files) {
            const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
            imageUrls.push(base64);
        }

        const gameData = {
            author: getNickname(),
            authorEmail: getUserEmail(),
            uid: getUserId(),
            submittedAt: Date.now(),
            subject: subject,
            answer: answer,
            difficulty: difficulty,
            hints: hints,
            description: description,
            images: imageUrls,
            status: 'pending' // 승인 대기 상태
        };

        // DB pendingGames 경로에 저장
        await db.ref("pendingGames").push(gameData);
        
        hideLoadingIndicator();
        alert("✅ 문제가 성공적으로 제출되었습니다!\n관리자 검토 후 반영됩니다.");
        showCatchMind();
        
    } catch (error) {
        hideLoadingIndicator();
        console.error("제출 오류:", error);
        alert("제출 중 오류가 발생했습니다: " + error.message);
    }
}

// ===== 버그 제보 시스템 =====

function showBugReportPage() {
    hideAll();
    
    // 동적으로 섹션 생성 (없다면)
    let section = document.getElementById("bugReportSection");
    if (!section) {
        section = document.createElement("div");
        section.id = "bugReportSection";
        section.className = "page-section";
        document.querySelector("main").appendChild(section);
    }
    
    section.classList.add("active");
    
    // 기기 정보 자동 감지
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const deviceType = isMobile ? "모바일 (Mobile)" : "PC (Desktop)";
    const currentTime = new Date().toLocaleString();
    const nickname = isLoggedIn() ? getNickname() : "익명";

    section.innerHTML = `
        <div style="max-width:600px; margin:0 auto; padding:20px;">
            <h2 style="margin-bottom:30px; text-align:center; color:#d32f2f;">
                <i class="fas fa-bug"></i> 버그 제보
            </h2>
            
            <div style="background:#fff; border-radius:12px; padding:25px; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                
                <div class="form-group">
                    <label class="form-label">제보자</label>
                    <input type="text" class="form-control" value="${nickname}" disabled style="background:#f5f5f5;">
                </div>

                <div class="form-group">
                    <label class="form-label">발생 시간</label>
                    <input type="text" class="form-control" value="${currentTime}" disabled style="background:#f5f5f5;">
                </div>

                <div class="form-group">
                    <label class="form-label">기기 정보</label>
                    <input type="text" id="bugDevice" class="form-control" value="${deviceType}" readonly>
                </div>

                <div class="form-group">
                    <label class="form-label">스크린샷 첨부 (여러 장 가능)</label>
                    <input type="file" id="bugImages" class="form-control" accept="image/*" multiple onchange="previewBugImages(this)">
                    <div id="bugImagePreviews" style="display:flex; gap:10px; overflow-x:auto; margin-top:10px;"></div>
                </div>

                <div class="form-group">
                    <label class="form-label">오류 설명</label>
                    <textarea id="bugDescription" class="form-control" placeholder="어떤 상황에서 오류가 발생했는지 자세히 적어주세요." style="min-height:150px;"></textarea>
                </div>

                <button onclick="submitBugReport()" class="btn-primary btn-block" style="background:#d32f2f; border-color:#d32f2f;">
                    <i class="fas fa-exclamation-triangle"></i> 버그 제보하기
                </button>
                
                <button onclick="showMoreMenu()" class="btn-secondary btn-block" style="margin-top:10px;">
                    취소
                </button>
            </div>
        </div>
    `;
}

function previewBugImages(input) {
    const container = document.getElementById("bugImagePreviews");
    container.innerHTML = "";
    if (input.files) {
        Array.from(input.files).forEach(file => {
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.style.height = "80px";
            img.style.borderRadius = "4px";
            img.style.border = "1px solid #ddd";
            container.appendChild(img);
        });
    }
}

// 파일 맨 끝 부분 (약 6280줄)
async function submitBugReport() {
    if (!confirm("버그 리포트를 제출하시겠습니까?")) return;
    
    showLoadingIndicator("전송 중...");

    const description = document.getElementById("bugDescription").value;
    const device = document.getElementById("bugDevice").value;
    const imageInput = document.getElementById("bugImages");

    if (!description) {
        hideLoadingIndicator();
        return alert("오류 설명을 입력해주세요.");
    }

    const imageUrls = [];
    if (imageInput.files.length > 0) {
        const files = Array.from(imageInput.files);
        for (const file of files) {
            const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
            imageUrls.push(base64);
        }
    }

    const reportData = {
        reporter: getNickname(),
        reporterEmail: getUserEmail(),
        timestamp: Date.now(),
        dateStr: new Date().toLocaleString(),
        device: device,
        description: description,
        images: imageUrls,
        status: 'open'
    };

    try {
        await db.ref("bugReports").push(reportData);
        hideLoadingIndicator();
        alert("✅ 소중한 제보 감사합니다! 관리자에게 전송되었습니다.");
        showMoreMenu();
    } catch (error) {
        hideLoadingIndicator();
        console.error("버그 제보 실패:", error);
        alert("전송 실패: " + error.message);
    }
}

// ✅ 이 줄만 남기고 나머지 삭제
console.log("✅ script.js 로드 완료");

// ===== [추가] 제출물 관리(버그 제보 등) 관리자 기능 =====
window.showSubmissionManager = async function() {
    if (!isAdmin()) {
        alert("관리자만 접근할 수 있습니다.");
        return;
    }

    showLoadingIndicator("제출물 목록을 불러오는 중...");

    try {
        // 버그 리포트 데이터 가져오기
        const snapshot = await db.ref("bugReports").once("value");
        const reports = snapshot.val() || {};
        
        // 모달 HTML 생성
        let listHTML = '<div class="list-group">';
        
        if (Object.keys(reports).length === 0) {
            listHTML += '<div class="p-3 text-center">제출된 내용이 없습니다.</div>';
        } else {
            // 최신순 정렬
            const sortedKeys = Object.keys(reports).sort((a, b) => reports[b].timestamp - reports[a].timestamp);
            
            sortedKeys.forEach(key => {
                const report = reports[key];
                listHTML += `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="mb-1">${report.description.substring(0, 30)}...</h6>
                            <small>${report.dateStr || '날짜 없음'}</small>
                        </div>
                        <p class="mb-1 text-muted small">제보자: ${report.reporter} (${report.device})</p>
                        ${report.images && report.images.length > 0 ? '📷 이미지 포함' : ''}
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteBugReport('${key}')">삭제</button>
                        </div>
                    </div>
                `;
            });
        }
        listHTML += '</div>';

        // 모달 띄우기 (기존 showModal 함수 활용)
        const modalTitle = "📋 제출물(버그 제보) 관리";
        const modalContent = `
            <div style="max-height: 60vh; overflow-y: auto;">
                ${listHTML}
            </div>
            <div class="text-right mt-3">
                <button class="btn btn-secondary" onclick="closeModal()">닫기</button>
            </div>
        `;
        
        hideLoadingIndicator();
        
        // 모달 표시 (프로젝트에 있는 모달 방식에 맞춤)
        if (typeof showModal === 'function') {
            showModal(modalTitle, modalContent);
        } else {
            // showModal이 없다면 alert로 대체하거나 직접 DOM 조작
            alert("제출물 관리 기능을 열었습니다. (모달 함수 확인 필요)");
            console.log(reports);
        }

    } catch (error) {
        hideLoadingIndicator();
        console.error("제출물 로드 실패:", error);
        alert("데이터를 불러오는데 실패했습니다: " + error.message);
    }
};

// 버그 리포트 삭제 함수
window.deleteBugReport = async function(key) {
    if(!confirm("정말 이 제보를 삭제하시겠습니까?")) return;
    
    try {
        await db.ref("bugReports/" + key).remove();
        alert("삭제되었습니다.");
        closeModal(); // 모달 닫고
        showSubmissionManager(); // 다시 열어서 갱신
    } catch(err) {
        alert("삭제 실패: " + err.message);
    }
};

// ==========================================================
// [추가] 이미지 뷰어 및 제출물 관리 시스템 (완전판)
// ==========================================================

// 1. 이미지 확대 및 다운로드 뷰어 (모달)
window.showImageViewer = function(imgUrl) {
    // 기존 뷰어 제거
    const oldViewer = document.getElementById('fullScreenImageViewer');
    if(oldViewer) oldViewer.remove();
    
    // HTML 생성
    const viewerHTML = `
        <div id="fullScreenImageViewer" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            
            <button onclick="document.getElementById('fullScreenImageViewer').remove()" 
                    style="position:absolute; top:20px; right:20px; background:none; border:none; color:white; font-size:30px; cursor:pointer;">
                <i class="fas fa-times"></i>
            </button>
            
            <img src="${imgUrl}" style="max-width:90%; max-height:80vh; border-radius:4px; box-shadow:0 0 20px rgba(0,0,0,0.5);">
            
            <div style="margin-top:20px; display:flex; gap:15px;">
                <a href="${imgUrl}" download="image_download.png" target="_blank" class="btn btn-primary" style="text-decoration:none; padding:10px 20px; border-radius:20px;">
                    <i class="fas fa-download"></i> 다운로드
                </a>
                <button onclick="document.getElementById('fullScreenImageViewer').remove()" class="btn btn-secondary" style="padding:10px 20px; border-radius:20px;">
                    닫기
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', viewerHTML);
};

// 2. 관리자 제출물 관리 함수 (이미지 클릭 시 뷰어 연결)
window.showSubmissionManager = async function() {
    if (!isAdmin()) { return alert("관리자 권한이 없습니다."); }
    
    hideAll(); // 기존 화면 숨기기
    
    let section = document.getElementById("adminSubmissionSection");
    if (!section) {
        section = document.createElement("div");
        section.id = "adminSubmissionSection";
        section.className = "page-section"; // CSS 스타일 적용을 위해
        document.querySelector("main").appendChild(section);
    }
    
    // CSS 강제 적용 (화면이 안 보이는 문제 방지)
    section.style.display = 'block';
    section.classList.add("active");
    
    section.innerHTML = `
        <div style="padding:20px; max-width:800px; margin:0 auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2>📁 제출물 관리 센터</h2>
                <button onclick="showAdminEvent()" class="btn-secondary"><i class="fas fa-arrow-left"></i> 돌아가기</button>
            </div>
            
            <div class="tabs" style="display:flex; gap:10px; margin-bottom:20px; border-bottom:1px solid #ddd; padding-bottom:10px;">
                <button onclick="loadPendingGames()" class="btn-primary" style="flex:1;">🎨 문제 출제</button>
                <button onclick="loadBugReports()" class="btn-danger" style="flex:1;">🐛 버그 제보</button>
            </div>
            
            <div id="submissionList" style="min-height:300px;">
                <p style="text-align:center; color:#666; padding:50px;">상단 버튼을 눌러 목록을 불러오세요.</p>
            </div>
        </div>
    `;
    
    // 기본적으로 문제 출제 탭 로드
    loadPendingGames();
};

// (내부 함수) 문제 출제 목록 로드
window.loadPendingGames = async function() {
    const container = document.getElementById("submissionList");
    container.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> 불러오는 중...</div>';
    
    const snapshot = await db.ref("pendingGames").once("value");
    const data = snapshot.val() || {};
    
    if (Object.keys(data).length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:50px; color:#999;">제출된 문제가 없습니다.</p>';
        return;
    }

    container.innerHTML = Object.entries(data).reverse().map(([id, game]) => `
        <div style="background:white; padding:20px; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.1); margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between;">
                <h4>${game.subject} <span class="badge badge-info">${game.difficulty}</span></h4>
                <small>${new Date(game.submittedAt).toLocaleDateString()}</small>
            </div>
            <p>출제자: <strong>${game.author}</strong></p>
            <p>정답: <span style="color:green; font-weight:bold;">${game.answer}</span></p>
            
            <div style="display:flex; gap:10px; overflow-x:auto; margin:15px 0;">
                ${game.images ? game.images.map(src => `
                    <img src="${src}" 
                         onclick="showImageViewer('${src}')" 
                         style="height:100px; border-radius:5px; cursor:zoom-in; border:1px solid #eee;" 
                         title="클릭하여 확대 및 다운로드">
                `).join('') : '<span style="color:#ccc;">이미지 없음</span>'}
            </div>
            
            <div style="margin-top:10px; display:flex; gap:10px;">
                <button onclick="approveGame('${id}')" class="btn-success" style="flex:1;">승인</button>
                <button onclick="deleteSubmission('pendingGames', '${id}')" class="btn-danger" style="flex:1;">삭제</button>
            </div>
        </div>
    `).join('');
};

// (내부 함수) 버그 리포트 목록 로드
window.loadBugReports = async function() {
    const container = document.getElementById("submissionList");
    container.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> 불러오는 중...</div>';
    
    const snapshot = await db.ref("bugReports").once("value");
    const data = snapshot.val() || {};

    if (Object.keys(data).length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:50px; color:#999;">제보된 버그가 없습니다.</p>';
        return;
    }

    container.innerHTML = Object.entries(data).reverse().map(([id, report]) => `
        <div style="background:#fff0f0; padding:20px; border-radius:10px; border-left:4px solid #d32f2f; margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between;">
                <strong style="color:#d32f2f;">🐛 버그 리포트</strong>
                <small>${report.dateStr}</small>
            </div>
            <p style="margin:5px 0; font-size:14px;">제보자: ${report.reporter} (${report.device})</p>
            <div style="background:white; padding:10px; border-radius:5px; margin:10px 0; border:1px solid #ffdcdc;">
                ${report.description}
            </div>
            
            <div style="display:flex; gap:10px; overflow-x:auto; margin:10px 0;">
                ${report.images ? report.images.map(src => `
                    <img src="${src}" 
                         onclick="showImageViewer('${src}')" 
                         style="height:100px; border-radius:5px; cursor:zoom-in; border:1px solid #eee;"
                         title="클릭하여 확대 및 다운로드">
                `).join('') : ''}
            </div>
            
            <div style="text-align:right;">
                <button onclick="deleteSubmission('bugReports', '${id}')" class="btn-secondary btn-sm">처리 완료(삭제)</button>
            </div>
        </div>
    `).join('');
};

// (내부 함수) 삭제 및 승인 (기존과 동일하되 명시적으로 포함)
window.deleteSubmission = async function(node, id) {
    if(!confirm("삭제하시겠습니까?")) return;
    await db.ref(`${node}/${id}`).remove();
    alert("삭제되었습니다.");
    if(node === 'pendingGames') loadPendingGames(); else loadBugReports();
};

window.approveGame = async function(id) {
    if(!confirm("이 문제를 승인하여 게임에 추가하시겠습니까?")) return;
    try {
        const snap = await db.ref(`pendingGames/${id}`).once("value");
        const g = snap.val();
        
        // 정식 게임 데이터 구조로 변환
        const newGame = {
            id: id,
            subject: g.subject,
            answer: g.answer,
            hints: g.hints || [],
            imageUrl: g.images ? g.images[0] : null,
            extraImages: g.images || [],
            difficulty: g.difficulty,
            timeLimit: g.difficulty === 'easy' ? 30 : g.difficulty === 'medium' ? 20 : 15,
            rewards: { "5sec": 100, "15sec": 50, "30sec": 30 },
            author: g.author
        };
        
        await db.ref("adminSettings/catchMind/customGames").push(newGame);
        await db.ref(`pendingGames/${id}`).remove();
        alert("승인 완료!");
        loadPendingGames();
    } catch(e) {
        alert("오류: " + e.message);
    }
};
