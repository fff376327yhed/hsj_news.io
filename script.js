const STORAGE_KEY = 'news_articles';
const NICKNAME_KEY = 'user_nickname';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_KEY = 'is_admin';
const ARTICLES_PER_PAGE = 5;
const ACTIVITY_LOG_KEY = 'user_activity_log';

let displayedArticlesCount = ARTICLES_PER_PAGE;
let searchQuery = '';
let previousPage = 'articles';
let currentImageData = null;
let db = null;

// Firebase 초기화
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgooYtVr8-jm15-fx_WvGLCDxonLpNPuU",
  authDomain: "hsj-news.firebaseapp.com",
  projectId: "hsj-news",
  storageBucket: "hsj-news.firebasestorage.app",
  messagingSenderId: "437842430700",
  appId: "1:437842430700:web:e3822bde4cfecdc04633c9",
  measurementId: "G-J34J5XHNSJ"
};

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log('Firebase 연결 성공!');
} catch(e) {
    console.log('Firebase 초기화:', e.message);
}

// 쿠키 함수
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

// 유틸 함수
function getUserNickname() { return getCookie(NICKNAME_KEY) || '익명'; }
function isAdmin() { return getCookie(ADMIN_KEY) === 'true'; }

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

function showNotification(message) {
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// 활동 로그
function saveActivityLog(action, user, details) {
    if (db) {
        const logId = Date.now().toString();
        db.ref('activity_logs/' + logId).set({
            action: action,
            user: user,
            details: details,
            timestamp: Date.now()
        }).catch(e => console.log('로그 저장 실패:', e));
    }
}

// 스토리지 함수
function getArticles() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveArticles(articles) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    if (db) {
        articles.forEach(article => {
            if (article.id) {
                db.ref('articles/' + article.id).set(article).catch(e => console.log('저장 실패:', e));
            }
        });
    }
}

// 네비게이션
function updateNavigation(page) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navItems = {'articles': 0, 'write': 1, 'settings': 2};
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

function togglePCMode() {
    document.body.classList.toggle('pc-mode');
    const isPCMode = document.body.classList.contains('pc-mode');
    localStorage.setItem('pc_mode', isPCMode);
    alert(isPCMode ? 'PC모드 활성화!' : 'PC모드 비활성화!');
}

// 기사 렌더링
function renderArticles() {
    if (db) {
        db.ref('articles').on('value', (snapshot) => {
            const firebaseArticles = snapshot.val() || {};
            const articles = Object.values(firebaseArticles).sort((a, b) => new Date(b.date) - new Date(a.date));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
            renderArticlesContent(articles);
        });
    } else {
        renderArticlesContent(getArticles());
    }
}

function renderArticlesContent(articles) {
    let displayArticles = articles;
    if (searchQuery) {
        displayArticles = articles.filter(article => 
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            article.summary.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    const articlesGrid = document.getElementById('articlesGrid');
    const emptyState = document.getElementById('emptyState');
    const noResults = document.getElementById('noResults');
    const featuredArticle = document.getElementById('featuredArticle');
    const loadMoreContainer = document.getElementById('loadMoreContainer');

    if (displayArticles.length === 0) {
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

    const latest = displayArticles[0];
    const allArticles = getArticles();
    const latestIndex = allArticles.findIndex(a => a.id === latest.id);
    
    featuredArticle.innerHTML = `
        <div class="featured-article" onclick="showArticleDetail(${latestIndex})">
            <div class="featured-image" style="background-image: url('${latest.imageUrl || ''}');">${!latest.imageUrl ? '📰' : ''}</div>
            <div class="featured-content">
                <div class="article-category">${latest.category}</div>
                <h1>${latest.title}</h1>
                <div class="meta"><span class="author-badge">👤 ${latest.author}</span><span>${formatDate(latest.date)}</span></div>
                <div class="summary">${latest.summary.substring(0, 100)}...</div>
            </div>
        </div>
    `;

    const displayArticlesSlice = displayArticles.slice(1, displayedArticlesCount);
    articlesGrid.innerHTML = displayArticlesSlice.map((article) => {
        const originalIndex = allArticles.findIndex(a => a.id === article.id);
        return `
            <div class="article-card" onclick="showArticleDetail(${originalIndex})">
                <div class="article-image" style="background-image: url('${article.imageUrl || ''}');">${!article.imageUrl ? '📰' : ''}</div>
                <div class="article-content">
                    <div><div class="article-category">${article.category}</div><div class="article-title">${article.title}</div></div>
                    <div class="article-meta"><strong>${article.author}</strong> • ${formatDate(article.date)}</div>
                </div>
            </div>
        `;
    }).join('');

    if (displayArticles.length > displayedArticlesCount) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

function loadMoreArticles() { displayedArticlesCount += ARTICLES_PER_PAGE; renderArticles(); }
function handleSearch(event) { if (event.key === 'Enter') performSearch(); }
function performSearch() { searchQuery = document.getElementById('searchInput').value; renderArticles(); }

// 기사 상세
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
        <div class="article-detail-image" style="background-image: url('${article.imageUrl || ''}');">${!article.imageUrl ? '📰' : ''}</div>
        <div class="detail-header">
            <h1>${article.title}</h1>
            <div class="detail-meta">
                <span class="author-badge">👤 ${article.author}</span>
                <span>${formatDate(article.date)}</span>
                <span style="background: #f44336; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px;">${article.category}</span>
            </div>
        </div>
        <div class="detail-content">${article.content}</div>
        <div id="commentsSection"></div>
        <div class="detail-buttons">
            <button class="btn-submit" onclick="shareArticle(${index})" style="background-color: #4caf50;">📤 공유</button>
            ${(article.author === getUserNickname() || isAdmin()) ? `<button class="btn-delete" onclick="deleteArticle(${index})">🗑️ 삭제</button>` : ''}
            <button class="btn-back" onclick="goBack()">← 돌아가기</button>
        </div>
    `;
    
    loadComments(article.id);
}

function deleteArticle(index) {
    if (confirm('이 기사를 삭제하시겠습니까?')) {
        const articles = getArticles();
        const articleId = articles[index].id;
        articles.splice(index, 1);
        saveArticles(articles);
        
        if (db && articleId) {
            db.ref('articles/' + articleId).remove().catch(e => console.log('삭제 실패:', e));
            db.ref('comments/' + articleId).remove().catch(e => console.log('댓글 삭제 실패:', e));
        }
        
        goBack();
    }
}

// 댓글
function loadComments(articleId) {
    const commentsContainer = document.createElement('div');
    commentsContainer.className = 'comments-container';

    const commentsTitle = document.createElement('div');
    commentsTitle.className = 'comments-title';
    commentsTitle.textContent = '💬 댓글';
    commentsContainer.appendChild(commentsTitle);

    const commentForm = document.createElement('div');
    commentForm.className = 'comment-form';
    commentForm.innerHTML = `<input type="text" id="commentInput" placeholder="댓글 입력..." maxlength="200"><button onclick="submitComment('${articleId}')">등록</button>`;
    commentsContainer.appendChild(commentForm);

    const commentsList = document.createElement('div');
    commentsList.id = 'commentsList';
    commentsContainer.appendChild(commentsList);

    document.getElementById('commentsSection').innerHTML = '';
    document.getElementById('commentsSection').appendChild(commentsContainer);

    if (db) {
        db.ref('comments/' + articleId).on('value', (snapshot) => {
            const comments = snapshot.val() || {};
            const commentsList = document.getElementById('commentsList');
            if (!commentsList) return;
            
            if (Object.keys(comments).length === 0) {
                commentsList.innerHTML = '<p class="no-comments">댓글이 없습니다</p>';
                return;
            }

            commentsList.innerHTML = Object.entries(comments)
                .sort((a, b) => b[1].timestamp - a[1].timestamp)
                .map(([commentId, comment]) => `
                    <div class="comment-item">
                        <div class="comment-author">👤 ${comment.author}</div>
                        <div class="comment-text">${comment.text}</div>
                        <div class="comment-time">${formatDate(new Date(comment.timestamp).toISOString())}</div>
                        ${(isAdmin() || comment.author === getUserNickname()) ? `
                            <button onclick="deleteComment('${articleId}', '${commentId}')" style="background-color: #d32f2f; color: white; padding: 5px 10px; border-radius: 4px; font-size: 11px; margin-top: 8px; cursor: pointer; border: none;">삭제</button>
                        ` : ''}
                    </div>
                `).join('');
        });
    }

    setTimeout(() => {
        const commentInput = document.getElementById('commentInput');
        if (commentInput) {
            commentInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') submitComment(articleId);
            });
        }
    }, 100);
}

function deleteComment(articleId, commentId) {
    const isAdminDelete = isAdmin();
    if (confirm(isAdminDelete ? '이 댓글을 삭제하시겠습니까?' : '내 댓글을 삭제하시겠습니까?')) {
        if (db) {
            db.ref('comments/' + articleId + '/' + commentId).remove().then(() => {
                if (isAdminDelete) {
                    saveActivityLog('comment_deleted_by_admin', getUserNickname(), {
                        articleId: articleId,
                        commentId: commentId
                    });
                    showNotification('댓글이 삭제되었습니다.');
                } else {
                    saveActivityLog('comment_deleted_by_author', getUserNickname(), {
                        articleId: articleId,
                        commentId: commentId
                    });
                    showNotification('댓글 삭제 완료!');
                }
                loadComments(articleId);
            }).catch(e => console.log('삭제 실패:', e));
        }
    }
}

function submitComment(articleId) {
    const commentInput = document.getElementById('commentInput');
    if (!commentInput) return;

    const text = commentInput.value.trim();
    if (!text) {
        alert('댓글을 입력하세요');
        return;
    }

    const comment = {
        author: getUserNickname(),
        text: text,
        timestamp: Date.now()
    };

    if (db) {
        const commentId = Date.now().toString();
        db.ref('comments/' + articleId + '/' + commentId).set(comment)
            .then(() => {
                commentInput.value = '';
                
                // 활동 로그 저장
                saveActivityLog('comment_created', getUserNickname(), {
                    articleId: articleId,
                    commentId: commentId,
                    commentText: text
                });
                
                showNotification('댓글 등록 완료!');
            })
            .catch(err => {
                console.error('댓글 등록 실패:', err);
                alert('댓글 등록 실패');
            });
    }
}

function shareArticle(index) {
    const articles = getArticles();
    const article = articles[index];
    
    if (!article.id) {
        article.id = Date.now();
        saveArticles(articles);
    }
    
    const articleJSON = JSON.stringify(article);
    const articleData = btoa(unescape(encodeURIComponent(articleJSON)));
    const shareUrl = `${window.location.origin}${window.location.pathname}?article=${articleData}`;
    
    if (navigator.share) {
        navigator.share({
            title: article.title,
            text: article.summary,
            url: shareUrl
        }).catch(err => console.log('공유 실패:', err));
    } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showNotification('링크 복사됨!');
        }).catch(() => {
            alert('공유 링크:\n' + shareUrl);
        });
    }
}

function loadSharedArticle() {
    const params = new URLSearchParams(window.location.search);
    const articleData = params.get('article');
    
    if (articleData) {
        setTimeout(() => {
            try {
                const decodedArticle = JSON.parse(decodeURIComponent(escape(atob(articleData))));
                let articles = getArticles();
                
                const exists = articles.find(a => a.id === decodedArticle.id);
                
                if (!exists) {
                    articles.unshift(decodedArticle);
                    saveArticles(articles);
                }
                
                const updatedArticles = getArticles();
                const index = updatedArticles.findIndex(a => a.id === decodedArticle.id);
                
                if (index >= 0) {
                    previousPage = 'articles';
                    showArticleDetail(index);
                }
                
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) {
                console.error('기사 로드 실패:', e);
            }
        }, 100);
    }
}

// 설정
function updateSettings() {
    const nickname = getUserNickname();
    const articles = getArticles();
    const myArticles = articles.filter(a => a.author === nickname);
    
    document.getElementById('profileNickname').textContent = nickname;
    document.getElementById('profileArticleCount').textContent = myArticles.length;

    const myArticlesList = document.getElementById('myArticlesList');
    if (myArticles.length === 0) {
        myArticlesList.innerHTML = '<p style="color: #999; font-size: 12px;">올린 기사가 없습니다.</p>';
    } else {
        myArticlesList.innerHTML = myArticles.map((article) => {
            const originalIndex = articles.indexOf(article);
            return `
                <div class="my-article-item" onclick="showArticleDetail(${originalIndex})">
                    <div class="my-article-title">${article.title}</div>
                    <div class="my-article-meta">${article.category} • ${formatDate(article.date)}</div>
                </div>
            `;
        }).join('');
    }
    
    // 관리자 섹션 표시
    const adminSection = document.getElementById('adminSection');
    if (isAdmin()) {
        adminSection.style.display = 'block';
    } else {
        adminSection.style.display = 'none';
    }
}

// 모달
function openAdminModal() {
    document.getElementById('adminPasswordModal').classList.add('active');
}

function closeAdminModal() {
    document.getElementById('adminPasswordModal').classList.remove('active');
    document.getElementById('adminPassword').value = '';
}
document.getElementById('nicknameForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const nickname = document.getElementById('nicknameInput').value;
    if (nickname.trim()) {
        setCookie(NICKNAME_KEY, nickname);
        document.getElementById('nicknameModal').classList.remove('active');
        
        // 활동 로그 저장
        saveActivityLog('user_registered', nickname, {
            nickname: nickname,
            joinedAt: new Date().toISOString()
        });
        
        renderArticles();
    }
});

document.getElementById('adminPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        setCookie(ADMIN_KEY, 'true');
        closeAdminModal();
        updateSettings();
        showNotification('관리자 모드 활성화!');
    } else {
        alert('비밀번호 오류!');
    }
});

document.getElementById('imageFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentImageData = event.target.result;
            document.getElementById('imagePreview').innerHTML = `<img src="${currentImageData}" alt="미리보기" style="max-width: 100%; max-height: 200px; border-radius: 8px;">`;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('articleForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const newArticle = {
        id: Date.now(),
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
    
    // 활동 로그 저장
    saveActivityLog('article_created', getUserNickname(), {
        articleId: newArticle.id,
        title: newArticle.title,
        category: newArticle.category
    });

    showNotification('기사 발행 완료!');
    showArticles();
});

// 앱 시작
window.addEventListener('load', () => {
    const isPCMode = localStorage.getItem('pc_mode') === 'true';
    if (isPCMode) document.body.classList.add('pc-mode');
    
    const savedNickname = getCookie(NICKNAME_KEY);
    if (!savedNickname) {
        document.getElementById('nicknameModal').classList.add('active');
    }
    
    loadSharedArticle();
    renderArticles();
});
