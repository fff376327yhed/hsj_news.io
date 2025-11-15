// script.js - 뉴스 플랫폼 JavaScript

const STORAGE_KEY = 'news_articles';
const NICKNAME_KEY = 'user_nickname';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_KEY = 'is_admin';
const AD_KEY = 'current_ad';
const AD_SHOWN_KEY = 'ad_shown';
const NOTIFICATION_KEY = 'notification_enabled';
const ARTICLES_PER_PAGE = 5;

let displayedArticlesCount = ARTICLES_PER_PAGE;
let searchQuery = '';
let previousPage = 'articles';
let currentImageData = null;
let currentAdImage = null;

// ===== 쿠키 관련 함수 =====
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length));
        }
    }
    return null;
}

// ===== PC모드 토글 =====
function togglePCMode() {
    document.body.classList.toggle('pc-mode');
    const isPCMode = document.body.classList.contains('pc-mode');
    localStorage.setItem('pc_mode', isPCMode);
    alert(isPCMode ? 'PC모드가 활성화되었습니다!' : 'PC모드가 비활성화되었습니다!');
}

function initializePCMode() {
    const isPCMode = localStorage.getItem('pc_mode') === 'true';
    if (isPCMode) {
        document.body.classList.add('pc-mode');
    }
}

// ===== 초기화 함수 =====
function initializeNickname() {
    const savedNickname = getCookie(NICKNAME_KEY);
    if (!savedNickname) {
        document.getElementById('nicknameModal').classList.add('active');
    } else {
        document.getElementById('nicknameModal').classList.remove('active');
    }
}

// ===== 닉네임 폼 이벤트 =====
document.getElementById('nicknameForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const nickname = document.getElementById('nicknameInput').value;
    if (nickname.trim()) {
        setCookie(NICKNAME_KEY, nickname);
        document.getElementById('nicknameModal').classList.remove('active');
        localStorage.setItem(AD_SHOWN_KEY, 'false');
        renderArticles();
        checkAndShowAd();
    }
});

// ===== 로컬 스토리지 관련 함수 =====
function getArticles() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveArticles(articles) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

function getAd() {
    const stored = localStorage.getItem(AD_KEY);
    return stored ? JSON.parse(stored) : null;
}

function saveAd(ad) {
    localStorage.setItem(AD_KEY, JSON.stringify(ad));
    localStorage.setItem(AD_SHOWN_KEY, 'false');
}

function getUserNickname() {
    return getCookie(NICKNAME_KEY) || '익명';
}

function isAdmin() {
    return getCookie(ADMIN_KEY) === 'true';
}

function isNotificationEnabled() {
    return localStorage.getItem(NOTIFICATION_KEY) !== 'false';
}

// ===== 알림 토스트 =====
function showNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'notification-toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== 관리자 모달 =====
function openAdminModal() {
    document.getElementById('adminPasswordModal').classList.add('active');
}

function closeAdminModal() {
    document.getElementById('adminPasswordModal').classList.remove('active');
    document.getElementById('adminPassword').value = '';
}

function logoutAdmin() {
    if (confirm('관리자 모드를 해제하시겠습니까?')) {
        document.cookie = ADMIN_KEY + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        updateSettings();
        alert('관리자 모드가 해제되었습니다!');
    }
}

// ===== 광고 모달 =====
function openCreateAdModal() {
    document.getElementById('createAdModal').classList.add('active');
}

function closeCreateAdModal() {
    document.getElementById('createAdModal').classList.remove('active');
    document.getElementById('adForm').reset();
    document.getElementById('adImagePreview').innerHTML = '';
    currentAdImage = null;
}

function closeAdPopup() {
    document.getElementById('adModal').classList.remove('active');
    localStorage.setItem(AD_SHOWN_KEY, 'true');
}

function checkAndShowAd() {
    const ad = getAd();
    const notificationEnabled = isNotificationEnabled();
    const adShown = localStorage.getItem(AD_SHOWN_KEY);
    
    if (ad && adShown !== 'true' && notificationEnabled) {
        setTimeout(() => {
            document.getElementById('adImage').style.backgroundImage = `url('${ad.image}')`;
            document.getElementById('adTitle').textContent = ad.title;
            document.getElementById('adDescription').textContent = ad.description;
            document.getElementById('adModal').classList.add('active');
        }, 800);
    }
}

// ===== 관리자 비밀번호 폼 =====
document.getElementById('adminPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        setCookie(ADMIN_KEY, 'true');
        closeAdminModal();
        updateSettings();
        showNotification('관리자 모드 활성화!');
    } else {
        alert('비밀번호가 틀렸습니다!');
    }
});

// ===== 광고 이미지 선택 =====
document.getElementById('adImageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentAdImage = event.target.result;
            document.getElementById('adImagePreview').innerHTML = `<img src="${currentAdImage}" alt="미리보기">`;
        };
        reader.readAsDataURL(file);
    }
});

// ===== 광고 폼 제출 =====
document.getElementById('adForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentAdImage) {
        alert('이미지를 선택해주세요!');
        return;
    }

    const ad = {
        title: document.getElementById('adTitleInput').value,
        description: document.getElementById('adDescriptionInput').value,
        image: currentAdImage,
        createdAt: new Date().toISOString()
    };

    saveAd(ad);
    closeCreateAdModal();
    showNotification('광고가 생성되었습니다!');
});

// ===== 알림 체크박스 =====
document.getElementById('notificationCheck').addEventListener('change', function() {
    localStorage.setItem(NOTIFICATION_KEY, this.checked ? 'true' : 'false');
});

// ===== 페이지 네비게이션 =====
function updateNavigation(page) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navItems = {
        'articles': 0,
        'write': 1,
        'settings': 2
    };
    if (navItems[page] !== undefined) {
        document.querySelectorAll('.nav-item')[navItems[page]].classList.add('active');
    }
}

function showSection(section) {
    document.querySelectorAll('.articles-section, .write-section, .article-detail-section, .settings-section').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(section).classList.add('active');
    window.scrollTo(0, 0);
}

function showArticles() {
    previousPage = 'articles';
    searchQuery = '';
    document.getElementById('searchInput').value = '';
    displayedArticlesCount = ARTICLES_PER_PAGE;
    showSection('.articles-section');
    updateNavigation('articles');
    renderArticles();
}

function showWritePage() {
    previousPage = 'write';
    showSection('.write-section');
    updateNavigation('write');
    document.getElementById('articleForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    currentImageData = null;
}

function showSettings() {
    previousPage = 'settings';
    showSection('.settings-section');
    updateNavigation('settings');
    updateSettings();
}

function goBack() {
    if (previousPage === 'articles') showArticles();
    else if (previousPage === 'write') showWritePage();
    else if (previousPage === 'settings') showSettings();
}

// ===== 날짜 포맷팅 =====
function formatDate(isoDate) {
    const date = new Date(isoDate);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
}

// ===== 기사 렌더링 =====
function renderArticles() {
    let articles = getArticles();
    
    if (searchQuery) {
        articles = articles.filter(article => 
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            article.summary.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    const articlesGrid = document.getElementById('articlesGrid');
    const emptyState = document.getElementById('emptyState');
    const noResults = document.getElementById('noResults');
    const featuredArticle = document.getElementById('featuredArticle');
    const loadMoreContainer = document.getElementById('loadMoreContainer');

    if (articles.length === 0) {
        articlesGrid.innerHTML = '';
        featuredArticle.innerHTML = '';
        loadMoreContainer.style.display = 'none';
        if (searchQuery) {
            noResults.style.display = 'block';
            emptyState.style.display = 'none';
        } else {
            emptyState.style.display = 'block';
            noResults.style.display = 'none';
        }
        return;
    }

    emptyState.style.display = 'none';
    noResults.style.display = 'none';

    const latest = articles[0];
    const latestIndex = 0;
    featuredArticle.innerHTML = `
        <div class="featured-article" onclick="showArticleDetail(${latestIndex})">
            <div class="featured-image" style="background-image: url('${latest.imageUrl || ''}');">
                ${!latest.imageUrl ? '📰' : ''}
            </div>
            <div class="featured-content">
                <div class="article-category">${latest.category}</div>
                <h1>${latest.title}</h1>
                <div class="meta">
                    <span class="author-badge">👤 ${latest.author}</span>
                    <span>${formatDate(latest.date)}</span>
                </div>
                <div class="summary">${latest.summary.substring(0, 100)}...</div>
            </div>
        </div>
    `;

    const displayArticles = articles.slice(1, displayedArticlesCount);
    articlesGrid.innerHTML = displayArticles.map((article, idx) => {
        const originalIndex = idx + 1;
        return `
            <div class="article-card" onclick="showArticleDetail(${originalIndex})">
                <div class="article-image" style="background-image: url('${article.imageUrl || ''}');">
                    ${!article.imageUrl ? '📰' : ''}
                </div>
                <div class="article-content">
                    <div>
                        <div class="article-category">${article.category}</div>
                        <div class="article-title">${article.title}</div>
                    </div>
                    <div class="article-meta">
                        <strong>${article.author}</strong> • ${formatDate(article.date)}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (articles.length > displayedArticlesCount) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

function loadMoreArticles() {
    displayedArticlesCount += ARTICLES_PER_PAGE;
    renderArticles();
}

// ===== 검색 기능 =====
function handleSearch(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

function performSearch() {
    searchQuery = document.getElementById('searchInput').value;
    renderArticles();
}

// ===== 기사 공유 =====
function shareArticle(index) {
    const articles = getArticles();
    const article = articles[index];
    
    // 기사에 ID가 없으면 생성
    if (!article.id) {
        article.id = Date.now();
        saveArticles(articles);
    }
    
    // URL 쿼리 파라미터에 기사 ID만 포함
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${article.id}`;
    
    if (navigator.share) {
        navigator.share({
            title: article.title,
            text: article.summary,
            url: shareUrl
        }).catch(err => console.log('공유 실패:', err));
    } else {
        // 클립보드에 복사
        navigator.clipboard.writeText(shareUrl).then(() => {
            showNotification('공유 링크가 복사되었습니다!');
        }).catch(() => {
            alert('공유 링크:\n' + shareUrl);
        });
    }
}

function loadSharedArticle() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');
    
    if (articleId) {
        setTimeout(() => {
            const articles = getArticles();
            const article = articles.find(a => a.id === parseInt(articleId));
            
            if (article) {
                // 기사를 찾았으면 상세 페이지로 표시
                const index = articles.indexOf(article);
                previousPage = 'articles';
                showArticleDetail(index);
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                console.log('공유된 기사를 찾을 수 없습니다.');
            }
        }, 100);
    }
}

// ===== 기사 상세 페이지 =====
function showArticleDetail(index) {
    const articles = getArticles();
    const article = articles[index];
    
    if (!article || index < 0) {
        alert('기사를 찾을 수 없습니다.');
        showArticles();
        return;
    }
    
    previousPage = previousPage || 'articles';
    showSection('.article-detail-section');
    
    const detail = document.getElementById('articleDetail');
    detail.innerHTML = `
        <div class="article-detail-image" style="background-image: url('${article.imageUrl || ''}');">
            ${!article.imageUrl ? '📰' : ''}
        </div>
        <div class="detail-header">
            <h1>${article.title}</h1>
            <div class="detail-meta">
                <span class="author-badge">👤 ${article.author}</span>
                <span>${formatDate(article.date)}</span>
                <span style="background: #f44336; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px;">${article.category}</span>
            </div>
        </div>
        <div class="detail-content">${article.content}</div>
        <div class="detail-buttons">
            <button class="btn-submit" onclick="shareArticle(${index})" style="background-color: #4caf50;">📤 공유</button>
            ${(article.author === getUserNickname() || isAdmin()) ? `<button class="btn-delete" onclick="deleteArticle(${index})">🗑️ 삭제</button>` : ''}
            <button class="btn-back" onclick="goBack()">← 돌아가기</button>
        </div>
    `;
}

function deleteArticle(index) {
    if (confirm('이 기사를 삭제하시겠습니까?')) {
        const articles = getArticles();
        articles.splice(index, 1);
        saveArticles(articles);
        goBack();
    }
}

// ===== 설정 페이지 업데이트 =====
function updateSettings() {
    const nickname = getUserNickname();
    const articles = getArticles();
    const myArticles = articles.filter(a => a.author === nickname);
    
    // 프로필 카드 업데이트
    document.getElementById('profileNickname').textContent = nickname;
    document.getElementById('profileArticleCount').textContent = myArticles.length;
    
    // 알림 체크박스
    document.getElementById('notificationCheck').checked = isNotificationEnabled();

    // 내 기사 리스트
    const myArticlesList = document.getElementById('myArticlesList');
    if (myArticles.length === 0) {
        myArticlesList.innerHTML = '<p style="color: #999; font-size: 12px;">올린 기사가 없습니다.</p>';
    } else {
        myArticlesList.innerHTML = myArticles.map((article) => {
            const originalIndex = articles.indexOf(article);
            return `
                <div class="my-article-item" onclick="showArticleDetail(${originalIndex})">
                    <div class="my-article-title">${article.title}</div>
                    <div class="my-article-meta">
                        ${article.category} • ${formatDate(article.date)}
                    </div>
                </div>
            `;
        }).join('');
    }

    // 관리자 섹션
    const adminSection = document.getElementById('adminSection');
    if (isAdmin()) {
        adminSection.style.display = 'block';
        updateUserManagement();
    } else {
        adminSection.style.display = 'none';
    }
}

function updateUserManagement() {
    const articles = getArticles();
    const users = {};

    articles.forEach(article => {
        if (!users[article.author]) {
            users[article.author] = {
                name: article.author,
                articleCount: 0,
                articles: []
            };
        }
        users[article.author].articleCount++;
        users[article.author].articles.push(article);
    });

    const userList = document.getElementById('userManagementList');
    userList.innerHTML = Object.values(users).map(user => `
        <div class="user-management-item">
            <div class="user-name">${user.name}</div>
            <div class="user-info">기사 수: ${user.articleCount}개</div>
            <div class="user-actions">
                <button class="btn-delete-user" onclick="deleteAllUserArticles('${user.name}')">🔄 기사 삭제</button>
            </div>
        </div>
    `).join('');
}

function deleteAllUserArticles(userName) {
    if (confirm(`${userName}의 모든 기사를 삭제하시겠습니까?`)) {
        const articles = getArticles();
        const filtered = articles.filter(a => a.author !== userName);
        saveArticles(filtered);
        updateUserManagement();
        showNotification('삭제되었습니다!');
    }
}

// ===== 기사 이미지 선택 =====
document.getElementById('imageFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentImageData = event.target.result;
            document.getElementById('imagePreview').innerHTML = `<img src="${currentImageData}" alt="미리보기">`;
        };
        reader.readAsDataURL(file);
    }
});

// ===== 기사 폼 제출 =====
document.getElementById('articleForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const newArticle = {
        id: Date.now(), // 고유 ID 필수 할당
        category: document.getElementById('category').value,
        title: document.getElementById('title').value,
        author: getUserNickname(),
        summary: document.getElementById('summary').value,
        content: document.getElementById('content').value,
        imageUrl: currentImageData || '',
        date: new Date().toISOString()
    };

    const articles = getArticles();
    articles.unshift(newArticle);
    saveArticles(articles);

    if (isNotificationEnabled()) {
        showNotification(`새 기사: ${newArticle.title}`);
    }

    showNotification('기사가 발행되었습니다!');
    showArticles();
});

// ===== 앱 초기화 =====
initializePCMode();
initializeNickname();
loadSharedArticle();
renderArticles();
checkAndShowAd();