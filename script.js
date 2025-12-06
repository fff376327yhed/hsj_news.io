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
// 1. 점검 상태 체크 변수
let maintenanceChecked = false;

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

// 페이지 라우팅 (중복 제거 및 최적화)
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
        default:
            showArticles();
        case 'more':
            showMoreMenu();
            break;
        case 'messenger':
            showMessenger();
            break;
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
    auth.signOut();
    deleteCookie("is_admin");
    alert("로그아웃 되었습니다.");
    location.reload();
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

// 뒤로가기 버튼
function goBack() {
    window.history.back();
}

// ===== Part 3: 관리자 인증 및 프로필 관리 =====

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

// 프로필 드롭다운 내용 업데이트
async function updateProfileDropdown() {
    const content = document.getElementById("profileDropdownContent");
    const user = auth.currentUser;
    
    if (user) {
        const userSnapshot = await db.ref("users/" + user.uid).once("value");
        const userData = userSnapshot.val() || {};
        const isVIP = userData.isVIP || false;
        
        content.innerHTML = `
            <div class="profile-info">
                <div class="profile-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="profile-details">
                    <h4 style="color:#000; font-weight:700;">${getNickname()}${isVIP ? ' <span class="vip-badge">⭐ VIP</span>' : ''}</h4>
                    <p>${user.email}</p>
                </div>
            </div>
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

// ===== Part 4: 인증 상태 변경 및 알림 시스템 (개선됨) =====

// 실시간 알림 리스너 (articleId 포함)
function setupNotificationListener(uid) {
    if (!uid) return;
    
    console.log("알림 리스너 설정 시작:", uid);
    
    // 이전 리스너 제거 (메모리 누수 방지)
    db.ref("notifications/" + uid).off();
    
    // 새 알림 리스너
    db.ref("notifications/" + uid).orderByChild("read").equalTo(false).on("child_added", async (snapshot) => {
        const notification = snapshot.val();
        const notifId = snapshot.key;
        
        console.log("새 알림 감지:", notification);
        
        if (!notification.read) {
            // 토스트 알림 표시 (articleId 포함)
            showToastNotification(
                notification.type === 'article' ? '📰 새 기사' : 
                notification.type === 'comment' ? '💬 새 댓글' : 
                '🔔 알림',
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

// 토스트 알림 표시 (클릭하면 해당 기사로 이동)
function showToastNotification(title, body, articleId = null) {
    const existingToast = document.getElementById('toast-notification');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        border-left: 4px solid #c62828;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
        cursor: ${articleId ? 'pointer' : 'default'};
    `;
    
    // 클릭 시 해당 기사로 이동
    if (articleId) {
        toast.onclick = () => {
            showArticleDetail(articleId);
            toast.remove();
        };
    }
    
    toast.innerHTML = `
        <div style="display: flex; align-items: start; gap: 12px;">
            <div style="font-size: 24px;">🔔</div>
            <div style="flex: 1;">
                <div style="font-weight: bold; color: #202124; margin-bottom: 4px;">${title}</div>
                <div style="color: #5f6368; font-size: 14px; line-height: 1.4;">${body}</div>
                ${articleId ? '<div style="color: #1a73e8; font-size: 12px; margin-top: 6px;">👉 클릭하여 기사 보기</div>' : ''}
            </div>
            <button onclick="event.stopPropagation(); this.parentElement.parentElement.remove()" style="background: none; border: none; color: #5f6368; cursor: pointer; font-size: 20px; padding: 0; line-height: 1;">&times;</button>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(toast);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        if (toast && toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
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
        
        // 12. 성공 알림
        console.log("🎉 알림 설정 완료!");
        showToastNotification(
            "✅ 알림 설정 완료!", 
            "이제 웹사이트를 닫아도 알림을 받을 수 있습니다.",
            null
        );
        
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

// ===== Part 4 수정: 인증 상태 변경 (점검 모드 체크 추가) =====
auth.onAuthStateChanged(async user => {
    console.log("🔐 인증 상태 변경:", user ? user.email : "로그아웃");
    
    if (user) {
        console.log("로그인 감지됨:", user.email);

        const userRef = db.ref("users/" + user.uid);
        const snap = await userRef.once("value");
        let data = snap.val() || {};
        
        if(!data.email) {
            await userRef.update({
                email: user.email,
                createdAt: Date.now()
            });
            data.email = user.email;
        }
        
        if (data.isBanned) {
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
    }

    updateSettings();
    
 // 관리자/VIP 전용 탭 표시
    const adminEventBtn = document.getElementById("adminEventBtn");
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

// 설정 업데이트
async function updateSettings() {
    // 1. 프로필 카드 업데이트
    const el = document.getElementById("profileNickname");
    if (el) {
        const user = auth.currentUser;
        if(user) {
            const nicknameChangeSnapshot = await db.ref("users/" + user.uid + "/nicknameChanged").once("value");
            const hasChangedNickname = nicknameChangeSnapshot.val() || false;
            const userSnapshot = await db.ref("users/" + user.uid).once("value");
            const userData = userSnapshot.val() || {};
            const isVIP = userData.isVIP || false;
            const warningCount = userData.warningCount || 0;
            const isBanned = userData.isBanned || false;
            const notificationsEnabled = userData.notificationsEnabled !== false;
            
            el.innerHTML = `
                <div style="background:#fff; border:1px solid #dadce0; padding:20px; border-radius:8px; margin-bottom:20px;">
                    <h4 style="margin:0 0 15px 0; color:#202124;">내 정보</h4>
                    <p style="margin:8px 0; color:#5f6368;"><strong>이름:</strong> ${user.displayName || '미설정'}${isVIP ? ' <span class="vip-badge">⭐ VIP</span>' : ''}</p>
                    <p style="margin:8px 0; color:#5f6368;"><strong>이메일:</strong> ${user.email}</p>
                    ${warningCount > 0 ? `<p style="margin:8px 0; color:#d93025;"><strong>⚠ 경고:</strong> ${warningCount}회</p>` : ''}
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
    hideAll();
    document.getElementById("articlesSection").classList.add("active");
    
    
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
    ('[data-section="write"]');
    
    
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

// QnA HTML 파일 로드
function loadQnAFromFile() {
    const listDiv = document.getElementById("qnaList");
    fetch('QnA.html')
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

// 기사 렌더링 (최적화)
async function renderArticles() {
    const list = getSortedArticles();
    
    const adSection = document.getElementById("adSection");
    const pinnedSection = document.getElementById("pinnedSection"); 
    const featured = document.getElementById("featuredArticle");    
    const grid = document.getElementById("articlesGrid");           
    const loadMore = document.getElementById("loadMoreContainer");
    
    // 광고 로드
    const adsSnapshot = await db.ref("advertisements").once("value");
    const adsData = adsSnapshot.val() || {};
    const ads = Object.values(adsData).sort((a, b) => b.createdAt - a.createdAt);

    // 고정 기사 로드
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

    // 고정 기사 렌더링
    if(pinnedArticles.length > 0) {
        pinnedSection.innerHTML = pinnedArticles.map(a => {
            const views = getArticleViews(a);
            return `<div class="article-card" onclick="showArticleDetail('${a.id}')" style="border-left:4px solid #ffd700;cursor:pointer;">
                <div class="article-content">
                    <span class="category-badge">${a.category}</span>
                    <span class="pinned-badge">📌 고정</span>
                    <h3 class="article-title">${a.title}</h3>
                    <div class="article-meta">
                        <span>${a.author}</span>
                        <span>👁️ ${views}</span>
                    </div>
                </div>
            </div>`}).join('');
    } else {
        pinnedSection.innerHTML = '';
    }

    // 기사가 없을 때
    if (list.length === 0) {
        featured.innerHTML = `<div style="text-align:center;padding:60px 20px;background:#fff;border-radius:8px;">
            <p style="color:#868e96;font-size:16px;">등록된 기사가 없습니다.</p>
        </div>`;
        grid.innerHTML = "";
        loadMore.innerHTML = "";
        return;
    }

    // 그리드 렌더링
    const endIdx = currentArticlePage * ARTICLES_PER_PAGE;
    const displayArticles = unpinnedArticles.slice(0, endIdx);
    
    featured.innerHTML = '';

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
    
    // 더보기 버튼
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

// ===== Part 8: 기사 상세, 작성, 수정 =====

// 기사 상세 보기
async function showArticleDetail(id) {
    db.ref("articles/" + id).once("value").then(async snapshot => {
        const A = snapshot.val();
        if(!A) {
            alert("존재하지 않는 기사입니다!");
            showArticles();
            return;
        }
        
        if (currentArticleId !== id) {
            incrementView(id);
        }
        currentArticleId = id;
        currentCommentPage = 1;
        hideAll();
        document.getElementById("articleDetailSection").classList.add("active");
        
        const currentUser = getNickname();
        const canEdit = isLoggedIn() && ((A.author === currentUser) || isAdmin());
        const views = getArticleViews(A);
        const votes = getArticleVoteCounts(A);
        
        const userVote = await checkUserVote(id);

        const root = document.getElementById("articleDetail");
        root.innerHTML = `<div style="background:#fff;padding:20px;border-radius:8px;">
            <span class="category-badge">${A.category}</span>
            <h1 style="font-size:22px;font-weight:700;margin:15px 0;line-height:1.4;">${A.title}</h1>
            <div class="article-meta" style="border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:20px;">
                <span>${A.author}</span>
                <span style="color:#888;">${A.date}</span>
                <span style="float:right;">👁️ ${views}</span>
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
        loadComments(id);
        
        // URL 업데이트
        updateURL('article', id);
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

// 기사 작성 폼 설정
function setupArticleForm() {
    const form = document.getElementById("articleForm");
    if(!form) return;
    
    const titleInput = form.querySelector("#title");
    const summaryInput = form.querySelector("#summary");
    const contentInput = form.querySelector("#content");
    const warningEl = form.querySelector("#bannedWordWarning");
    
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
    
    const fileInput = form.querySelector('#thumbnailInput');
    fileInput.addEventListener('change', previewThumbnail);
    
    form.addEventListener("submit", function(e) {
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
            alert(`⚠️ 금지어("${foundWord}")가 포함된 기사를 업로드하려고 시도하여, 업로드가 차단되고 경고 1회가 누적됩니다.`);
            addWarningToCurrentUser();
            return;
        }
        
        const A = {
            id: Date.now().toString(),
            category: form.querySelector("#category").value,
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
            reader.onload = function(e) {
                A.thumbnail = e.target.result;
                saveArticle(A, () => {
                    form.reset();
                    document.getElementById('thumbnailPreview').style.display = 'none';
                    document.getElementById('uploadText').innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
                    warningEl.style.display = "none";
                    alert("기사가 발행되었습니다!");
                    
                    // 알림 전송
                    sendNotification('article', {
                        authorEmail: A.authorEmail,
                        authorName: A.author,
                        title: A.title,
                        articleId: A.id
                    });
                    
                    showArticles();
                });
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveArticle(A, () => {
                form.reset();
                document.getElementById('thumbnailPreview').style.display = 'none';
                document.getElementById('uploadText').innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>';
                warningEl.style.display = "none";
                alert("기사가 발행되었습니다!");
                
                // 알림 전송
                sendNotification('article', {
                    authorEmail: A.authorEmail,
                    authorName: A.author,
                    title: A.title,
                    articleId: A.id
                });
                
                showArticles();
            });
        }
    });
}

// ===== Part 9: 댓글 관리 =====

// 댓글 로드
function loadComments(id) {
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

// 실시간 알림 개수 체크
function setupMessengerBadgeListener() {
    const uid = getUserId();
    if(!uid || uid === 'anonymous') return;
    
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

window.addEventListener("load", () => {
    console.log("🚀 시스템 초기화 시작...");
    
    setupArticlesListener();
    loadBannedWords();
    setupArticleForm();
    
    if('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    setTimeout(() => {
        showActivePopupsToUser();
    }, 1000);

    // ⭐ 점검 모드 실시간 리스너 등록 추가
    initMaintenanceListener();
    
    initialRoute();
    
    console.log("✅ 시스템 초기화 완료!");

    // PWA 설치 유도
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // 설치 안내 표시 (한 번만)
    if(!getCookie('pwa_install_prompted')) {
        setTimeout(() => {
            if(confirm('📱 해정뉴스를 홈 화면에 추가하시겠어요?\n\n푸시 알림을 받으려면 홈 화면 추가가 필요합니다.')) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('PWA 설치됨');
                    }
                    deferredPrompt = null;
                });
            }
            setCookie('pwa_install_prompted', 'true', 30);
        }, 3000);
    }
});
});

// ===== 전역 에러 핸들러 =====
window.addEventListener('error', function(e) {
    console.error('전역 에러:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('처리되지 않은 Promise 거부:', e.reason);
});

console.log("📄 script.js 로드 완료 - 모든 파트 준비됨");

