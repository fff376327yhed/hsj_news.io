// ===== Part 1: 기본 설정 및 핵심 기능 (실시간 동기화) =====

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

const VIEWS_KEY = 'news_views_v1';
const VOTES_KEY = 'news_votes_v1';

let currentArticlePage = 1;
const ARTICLES_PER_PAGE = 5;
let currentCommentPage = 1;
const COMMENTS_PER_PAGE = 10;
let currentArticleId = null;
let currentSortMethod = 'latest';
let filteredArticles = [];
let allArticles = [];

function setCookie(n, v) { document.cookie = `${n}=${v};path=/`; }
function getCookie(n) {
    const m = document.cookie.match(new RegExp(`(^| )${n}=([^;]+)`));
    return m ? m[2] : null;
}
function deleteCookie(n) { document.cookie = n + '=; Max-Age=0; path=/'; }

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
    return getCookie("is_admin")==="true";
}

// 썸네일 미리보기
function previewThumbnail(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 500000) {
            alert("이미지 크기는 500KB 이하여야 합니다!");
            event.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('thumbnailPreview');
            const uploadText = document.getElementById('uploadText');
            preview.src = e.target.result;
            preview.style.display = 'block';
            uploadText.textContent = '✔ 이미지 선택됨 (클릭하여 변경)';
        };
        reader.readAsDataURL(file);
    }
}

// 기사 관리 - Firebase 실시간 리스너
function setupArticlesListener() {
    db.ref("articles").on("value", snapshot => {
        const val = snapshot.val() || {};
        allArticles = Object.values(val);
        if(document.querySelector(".articles-section.active")) {
            filteredArticles = allArticles;
            renderArticles();
        }
    });
}

function saveArticle(article, callback) {
    db.ref("articles/" + article.id).set(article).then(() => {
        if(callback) callback();
    }).catch(error => {
        alert("저장 실패: " + error.message);
        console.error(error);
    });
}

function deleteArticleFromDB(articleId, callback) {
    db.ref("articles/" + articleId).remove().then(() => {
        if(callback) callback();
    }).catch(error => {
        alert("삭제 실패: " + error.message);
    });
}

// 조회수 관리
function getViews() {
    const s = localStorage.getItem(VIEWS_KEY);
    return s ? JSON.parse(s) : {};
}
function saveViews(views) {
    localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
}
function incrementView(articleId) {
    const views = getViews();
    views[articleId] = (views[articleId] || 0) + 1;
    saveViews(views);
    return views[articleId];
}
function getArticleViews(articleId) {
    const views = getViews();
    return views[articleId] || 0;
}

// 추천/비추천 관리
function getVotes() {
    const s = localStorage.getItem(VOTES_KEY);
    return s ? JSON.parse(s) : {};
}
function saveVotes(votes) {
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}
function getUserVote(articleId) {
    const votes = getVotes();
    const userId = getUserId();
    const key = `${articleId}_${userId}`;
    return votes[key] || null;
}
function setUserVote(articleId, voteType) {
    const votes = getVotes();
    const userId = getUserId();
    const key = `${articleId}_${userId}`;
    if(voteType === null) {
        delete votes[key];
    } else {
        votes[key] = voteType;
    }
    saveVotes(votes);
}
function getArticleVoteCounts(articleId) {
    const votes = getVotes();
    let likes = 0;
    let dislikes = 0;
    Object.keys(votes).forEach(key => {
        if(key.startsWith(articleId + '_')) {
            if(votes[key] === 'like') likes++;
            else if(votes[key] === 'dislike') dislikes++;
        }
    });
    return { likes, dislikes };
}
function toggleVote(articleId, voteType) {
    if(!isLoggedIn()) {
        alert("추천/비추천은 로그인 후 가능합니다!");
        return;
    }
    const currentVote = getUserVote(articleId);
    if(currentVote === voteType) {
        setUserVote(articleId, null);
    } else {
        setUserVote(articleId, voteType);
    }
    if(currentArticleId === articleId) {
        showArticleDetail(articleId);
    } else {
        renderArticles();
    }
}

// UI 네비게이션
function hideAll() {
    document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
}
function showArticles() {
    hideAll();
    document.querySelector(".articles-section").classList.add("active");
    document.querySelectorAll(".nav-item")[0].classList.add("active");
    currentArticlePage = 1;
    filteredArticles = allArticles;
    renderArticles();
}
function showWritePage() {
    hideAll();
    document.querySelector(".write-section").classList.add("active");
    document.querySelectorAll(".nav-item")[1].classList.add("active");
}
function showSettings() {
    hideAll();
    document.querySelector(".settings-section").classList.add("active");
    document.querySelectorAll(".nav-item")[2].classList.add("active");
    updateSettings();
}

// 검색 및 정렬
function searchArticles() {
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
    currentArticlePage = 1;
    renderArticles();
}
function sortArticles(method) {
    currentSortMethod = method;
    currentArticlePage = 1;
    document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderArticles();
}
function getSortedArticles() {
    let articles = [...filteredArticles];
    switch(currentSortMethod) {
        case 'latest':
            articles.sort((a,b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            articles.sort((a,b) => new Date(a.date) - new Date(b.date));
            break;
        case 'views':
            articles.sort((a,b) => getArticleViews(b.id) - getArticleViews(a.id));
            break;
        case 'likes':
            articles.sort((a,b) => {
                const aVotes = getArticleVoteCounts(a.id);
                const bVotes = getArticleVoteCounts(b.id);
                return bVotes.likes - aVotes.likes;
            });
            break;
    }
    return articles;
}

// 기사 목록 렌더링
async function renderArticles() {
    const list = getSortedArticles();
    const featured = document.getElementById("featuredArticle");
    const grid = document.getElementById("articlesGrid");
    const loadMore = document.getElementById("loadMoreContainer");
    const currentUser = getNickname();

    // 광고 가져오기
    const adsSnapshot = await db.ref("advertisements").once("value");
    const adsData = adsSnapshot.val() || {};
    const ads = Object.values(adsData).sort((a, b) => b.createdAt - a.createdAt);

    // 고정 기사 가져오기
    const pinsSnapshot = await db.ref("pinnedArticles").once("value");
    const pinnedData = pinsSnapshot.val() || {};
    const pinnedIds = Object.keys(pinnedData);
    const pinnedArticles = list.filter(a => pinnedIds.includes(a.id))
        .sort((a, b) => pinnedData[b.id].pinnedAt - pinnedData[a.id].pinnedAt);
    const unpinnedArticles = list.filter(a => !pinnedIds.includes(a.id));

    if (!list.length) {
        featured.innerHTML = `<div style="text-align:center;padding:60px 20px;background:#fff;border-radius:8px;">
            <p style="color:#868e96;font-size:16px;">작성된 기사가 없습니다.</p>
        </div>`;
        grid.innerHTML = "";
        loadMore.innerHTML = "";
        return;
    }

    // 광고 표시 (featuredArticle 위치에)
    let adHTML = '';
    if(ads.length > 0) {
        adHTML = ads.map(ad => `
            <div style="background:${ad.color};border:2px solid #856404;padding:25px;border-radius:8px;margin-bottom:20px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                <div style="display:flex;align-items:center;margin-bottom:12px;">
                    <span style="background:#856404;color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;margin-right:10px;">광고</span>
                    <h3 style="margin:0;color:#212529;font-size:20px;font-weight:700;">${ad.title}</h3>
                </div>
                <p style="margin:0 0 15px 0;color:#495057;font-size:15px;line-height:1.6;white-space:pre-wrap;">${ad.content}</p>
                ${ad.link ? `<a href="${ad.link}" target="_blank" class="btn btn-dark" style="text-decoration:none;">자세히 보기 →</a>` : ''}
            </div>
        `).join('');
    }

// 고정 기사 표시
let pinnedHTML = '';
if(pinnedArticles.length > 0) {
    pinnedHTML = pinnedArticles.map(a => {
        const canEdit = isLoggedIn() && ((a.author === currentUser) || isAdmin());
        const views = getArticleViews(a.id);
        const votes = getArticleVoteCounts(a.id);
        return `<div class="article-card" style="border:3px solid #ffd700;background:#fffbf0;">
            ${a.thumbnail ? `<img src="${a.thumbnail}" class="article-thumbnail" alt="썸네일">` : '<div class="article-thumbnail">📰</div>'}
            <div class="article-content">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
                    <span class="category-badge">${a.category}</span>
                    <span style="background:#ffd700;color:#000;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;">📌 고정</span>
                </div>
                <h3 style="font-size:18px;font-weight:700;color:#212529;margin-bottom:8px;line-height:0.2;">${a.title}</h3>
                <p style="font-size:13px;color:#6c757d;line-height:1.5;margin-bottom:10px;">${a.summary||''}</p>
                <div class="article-meta">
                    <span>${a.author}</span>
                    <div class="article-stats">
                        <span class="stat-item">👁️ ${views}</span>
                        <span class="stat-item">👍 ${votes.likes}</span>
                        <span class="stat-item">👎 ${votes.dislikes}</span>
                    </div>
                </div>
                <div class="article-actions">
                    <button onclick="showArticleDetail('${a.id}')" class="btn btn-primary">읽기</button>
                    ${canEdit ? `<button onclick="editArticle('${a.id}')" class="btn btn-blue">수정</button>` : ''}
                </div>
            </div>
        </div>`;
    }).join('');
}

    // Featured Article (첫 번째 일반 기사)
    if(unpinnedArticles.length > 0) {
        const A0 = unpinnedArticles[0];
        const canEditA0 = isLoggedIn() && ((A0.author === currentUser) || isAdmin());
        const views0 = getArticleViews(A0.id);
        const votes0 = getArticleVoteCounts(A0.id);
        
        featured.innerHTML = adHTML + `<div class="featured-article">
            ${A0.thumbnail ? `<img src="${A0.thumbnail}" class="featured-image" alt="썸네일">` : '<div class="featured-image">📰</div>'}
            <div class="featured-content">
                <span class="category-badge">${A0.category}</span>
                <h2 class="article-title" style="font-size:28px;margin-bottom:16px;">${A0.title}</h2>
                <p class="article-summary" style="font-size:16px;margin-bottom:16px;">${A0.summary || ''}</p>
                <div class="article-meta">
                    <span>${A0.author}</span>
                    <span>${A0.date}</span>
                    <div class="article-stats">
                        <span class="stat-item">👁️ ${views0}</span>
                        <span class="stat-item">👍 ${votes0.likes}</span>
                        <span class="stat-item">👎 ${votes0.dislikes}</span>
                    </div>
                </div>
                <div style="margin-top:20px;display:flex;gap:10px;">
                    <button onclick="showArticleDetail('${A0.id}')" class="btn btn-primary">기사 읽기</button>
                    ${canEditA0 ? `<button onclick="editArticle('${A0.id}')" class="btn btn-blue">수정</button>` : ''}
                </div>
            </div>
        </div>`;
    } else {
        featured.innerHTML = adHTML;
    }

    const startIdx = unpinnedArticles.length > 0 ? 1 : 0;
    const endIdx = startIdx + (currentArticlePage * ARTICLES_PER_PAGE);
    const displayArticles = unpinnedArticles.slice(startIdx, endIdx);
    
    const articlesHTML = displayArticles.map(a => {
        const canEdit = isLoggedIn() && ((a.author === currentUser) || isAdmin());
        const views = getArticleViews(a.id);
        const votes = getArticleVoteCounts(a.id);
        return `<div class="article-card">
            ${a.thumbnail ? `<img src="${a.thumbnail}" class="article-thumbnail" alt="썸네일">` : '<div class="article-thumbnail">📰</div>'}
            <div class="article-content">
                <span class="category-badge">${a.category}</span>
                <h3 class="article-title">${a.title}</h3>
                <p class="article-summary">${a.summary||''}</p>
                <div class="article-meta">
                    <span>${a.author}</span>
                    <div class="article-stats">
                        <span class="stat-item">👁️ ${views}</span>
                        <span class="stat-item">👍 ${votes.likes}</span>
                        <span class="stat-item">👎 ${votes.dislikes}</span>
                    </div>
                </div>
                <div class="article-actions">
                    <button onclick="showArticleDetail('${a.id}')" class="btn btn-primary">읽기</button>
                    ${canEdit ? `<button onclick="editArticle('${a.id}')" class="btn btn-blue">수정</button>` : ''}
                </div>
            </div>
        </div>`}).join('');
    
    grid.innerHTML = pinnedHTML + articlesHTML;
    
    if(endIdx < unpinnedArticles.length) {
        loadMore.innerHTML = `<button onclick="loadMoreArticles()" class="btn btn-gray">
            기사 더보기 (${unpinnedArticles.length - endIdx}개 남음)</button>`;
    } else {
        loadMore.innerHTML = "";
    }
}
function loadMoreArticles() {
    currentArticlePage++;
    renderArticles();
}

// 기사 상세보기
function showArticleDetail(id) {
    db.ref("articles/" + id).once("value").then(snapshot => {
        const A = snapshot.val();
        if(!A) return alert("없는 기사!");
        incrementView(id);
        currentArticleId = id;
        currentCommentPage = 1;
        hideAll();
        document.querySelector(".article-detail-section").classList.add("active");
        const currentUser = getNickname();
        const canEdit = isLoggedIn() && ((A.author === currentUser) || isAdmin());
        const views = getArticleViews(id);
        const votes = getArticleVoteCounts(id);
        const userVote = getUserVote(id);
        const root = document.getElementById("articleDetail");
        root.innerHTML = `<div style="background:#fff;padding:40px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <span class="category-badge">${A.category}</span>
            <h1 style="font-size:32px;font-weight:700;margin:20px 0;line-height:1.4;">${A.title}</h1>
            <div class="article-meta" style="padding-bottom:20px;border-bottom:1px solid #dee2e6;">
                <span>${A.author}</span>
                <span>${A.date}</span>
                <span class="stat-item">👁️ ${views}</span>
            </div>
            ${A.thumbnail ? `<img src="${A.thumbnail}" style="width:100%;max-height:500px;object-fit:cover;border-radius:8px;margin:30px 0;" alt="기사 이미지">` : ''}
            <div style="font-size:16px;line-height:1.8;color:#212529;margin:30px 0;white-space:pre-wrap;">${A.content}</div>
            <div style="display:flex;gap:10px;padding-top:20px;border-top:1px solid #dee2e6;">
                <button onclick="toggleVote('${A.id}', 'like')" class="vote-btn ${userVote === 'like' ? 'active' : ''}">
                    👍 추천 ${votes.likes}
                </button>
                <button onclick="toggleVote('${A.id}', 'dislike')" class="vote-btn dislike ${userVote === 'dislike' ? 'active' : ''}">
                    👎 비추천 ${votes.dislikes}
                </button>
            </div>
            ${canEdit ? `<div style="margin-top:20px;display:flex;gap:10px;">
                <button onclick="editArticle('${A.id}')" class="btn btn-blue">수정</button>
                <button onclick="deleteArticle('${A.id}')" class="btn btn-gray">삭제</button>
            </div>` : ''}
        </div>`;
        loadComments(id);
    });
}
function goBack() { 
    currentArticleId = null;
    showArticles(); 
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
            db.ref("comments/" + id).remove();
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
        document.querySelector(".write-section").classList.add("active");
        document.getElementById("category").value = A.category;
        document.getElementById("title").value = A.title;
        document.getElementById("summary").value = A.summary || '';
        document.getElementById("content").value = A.content;
        
        if(A.thumbnail) {
            const preview = document.getElementById('thumbnailPreview');
            const uploadText = document.getElementById('uploadText');
            preview.src = A.thumbnail;
            preview.style.display = 'block';
            uploadText.textContent = '✔ 기존 이미지 (클릭하여 변경)';
        }
        
        const form = document.getElementById("articleForm");
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        const newFileInput = newForm.querySelector('#thumbnailInput');
        newFileInput.addEventListener('change', previewThumbnail);
        
        newForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const fileInput = newForm.querySelector('#thumbnailInput');
            if(fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    A.thumbnail = e.target.result;
                    saveUpdatedArticle();
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                saveUpdatedArticle();
            }
            
            function saveUpdatedArticle() {
                A.category = newForm.querySelector("#category").value;
                A.title = newForm.querySelector("#title").value;
                A.summary = newForm.querySelector("#summary").value;
                A.content = newForm.querySelector("#content").value;
                A.date = new Date().toLocaleString() + " (수정됨)";
                
                saveArticle(A, () => {
                    newForm.reset();
                    document.getElementById('thumbnailPreview').style.display = 'none';
                    document.getElementById('uploadText').textContent = '📷 클릭하여 이미지 업로드 (선택사항)';
                    restoreFormDefaultBehavior();
                    alert("기사가 수정되었습니다!");
                    showArticleDetail(id);
                });
            }
        });
    });
}

// 폼 기본 동작 복원
function restoreFormDefaultBehavior() {
    const form = document.getElementById("articleForm");
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    const newFileInput = newForm.querySelector('#thumbnailInput');
    newFileInput.addEventListener('change', previewThumbnail);
    
    newForm.addEventListener("submit", function(e) {
        e.preventDefault();
        if(!isLoggedIn()) {
            alert("기사 작성은 로그인 후 가능합니다!");
            return;
        }
        
        const fileInput = newForm.querySelector('#thumbnailInput');
        const A = {
            id: Date.now().toString(),
            category: newForm.querySelector("#category").value,
            title: newForm.querySelector("#title").value,
            summary: newForm.querySelector("#summary").value,
            content: newForm.querySelector("#content").value,
            author: getNickname(),
            authorEmail: getUserEmail(),
            date: new Date().toLocaleString(),
            thumbnail: null
        };
        
        if(fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                A.thumbnail = e.target.result;
                saveNewArticle(A);
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveNewArticle(A);
        }
        
        function saveNewArticle(article) {
            saveArticle(article, () => {
                newForm.reset();
                document.getElementById('thumbnailPreview').style.display = 'none';
                document.getElementById('uploadText').textContent = '📷 클릭하여 이미지 업로드 (선택사항)';
                alert("기사가 발행되었습니다!");
                showArticles();
            });
        }
    });
}// ===== Part 2: 댓글 및 인증 =====

// 댓글 관리
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
                        <button onclick="editComment('${id}','${k}','${v.author}')" class="btn btn-blue" style="height:32px;padding:0 12px;font-size:12px;">수정</button>
                        <button onclick="deleteComment('${id}','${k}','${v.author}')" class="btn btn-gray" style="height:32px;padding:0 12px;font-size:12px;margin-left:6px;">삭제</button>
                    </div>` : ''}
                </div>
                <p style="margin:0;line-height:1.6;color:#495057;">${v.text}</p>
            </div>`}).join('');
        const loadMoreBtn = document.getElementById("loadMoreComments");
        if(endIdx < commentsList.length) {
            loadMoreBtn.innerHTML = `<button onclick="loadMoreComments()" class="btn btn-gray">
                댓글 더보기 (${commentsList.length - endIdx}개 남음)</button>`;
        } else {
            loadMoreBtn.innerHTML = "";
        }
    });
}
function loadMoreComments() {
    currentCommentPage++;
    loadComments(currentArticleId);
}
function submitCommentFromDetail() {
    submitComment(currentArticleId);
}
function submitComment(id){
    if(!isLoggedIn()) {
        alert("댓글 작성은 로그인 후 가능합니다!");
        return;
    }
    const txt=document.getElementById("commentInput").value.trim();
    if(!txt) return alert("댓글 내용을 입력해주세요!");
    const cid=Date.now().toString();
    const C={author:getNickname(),authorEmail:getUserEmail(),text:txt,timestamp:new Date().toLocaleString()};
    db.ref("comments/"+id+"/"+cid).set(C);
    document.getElementById("commentInput").value="";
    currentCommentPage = 1;
    loadComments(id);
}
function deleteComment(aid, cid, author){
    const currentUser = getNickname();
    if(!isLoggedIn() || (author !== currentUser && !isAdmin())) {
        return alert("삭제 권한이 없습니다!");
    }
    if(!confirm("이 댓글을 삭제하시겠습니까?")) return;
    db.ref("comments/"+aid+"/"+cid).remove();
    loadComments(aid);
}
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
        comment.text = newText.trim();
        comment.timestamp = new Date().toLocaleString() + " (수정됨)";
        db.ref("comments/"+aid+"/"+cid).set(comment);
        loadComments(aid);
    });
}

// 사용자 설정 및 인증
async function updateSettings() {
    const el = document.getElementById("profileNickname");
    if (el) {
        const user = auth.currentUser;
        if(user) {
            const nicknameChangeSnapshot = await db.ref("users/" + user.uid + "/nicknameChanged").once("value");
            const hasChangedNickname = nicknameChangeSnapshot.val() || false;
            const vipSnapshot = await db.ref("users/" + user.uid + "/isVIP").once("value");
            const isVIP = vipSnapshot.val() || false;
            
            el.innerHTML = `<div style="background:#f8f9fa;padding:20px;border-radius:8px;">
                <h4 style="margin:0 0 15px 0;color:#212529;">내 정보</h4>
                <p style="margin:8px 0;color:#495057;"><strong>이름:</strong> ${user.displayName || '미설정'}${isVIP ? ' <span class="vip-badge">⭐ VIP</span>' : ''}</p>
                <p style="margin:8px 0;color:#495057;"><strong>이메일:</strong> ${user.email}</p>
                ${hasChangedNickname ? 
                    '<p style="margin:8px 0;color:#868e96;font-size:13px;">닉네임 변경 기회를 이미 사용하셨습니다.</p>' : 
                    '<button onclick="changeNickname()" class="btn btn-primary" style="width:100%;margin-top:15px;">닉네임 변경하기 (1회 가능)</button>'
                }
            </div>`;
        } else {
            el.innerHTML = `<div style="background:#f8f9fa;padding:20px;border-radius:8px;text-align:center;">
                <p style="color:#868e96;">로그인이 필요합니다.</p>
            </div>`;
        }
    }
    
    const adminIndicator = document.getElementById("adminModeIndicator");
    if(adminIndicator) {
        if(isAdmin()) {
            adminIndicator.innerHTML = `
                <div style="background:#fff3cd;border:2px solid #856404;padding:20px;border-radius:8px;margin-bottom:30px;">
                    <h4 style="margin:0 0 15px 0;color:#856404;">🛡️ 관리자 모드 활성화</h4>
                    <p style="margin:0 0 15px 0;color:#856404;font-size:14px;">현재 관리자 권한으로 로그인되어 있습니다.</p>
                    <button onclick="disableAdminMode()" class="btn btn-dark" style="width:100%;">관리자 모드 해제</button>
                </div>
            `;
        } else {
            adminIndicator.innerHTML = '';
        }
    }
}

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
    
    if(!confirm(`정말 닉네임을 "${trimmed}"로 변경하시겠습니까?\n\n⚠️ 닉네임은 1번만 변경할 수 있습니다!`)) {
        return;
    }
    
    try {
        await user.updateProfile({
            displayName: trimmed
        });
        
        await db.ref("users/" + user.uid).set({
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

function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(() => {
        alert("구글 로그인 성공!");
        location.reload();
    }).catch((error) => {
        console.error("로그인 오류:", error);
        alert("로그인 실패: " + error.message);
    });
}

function openAdminAuthModal(){
    document.getElementById("adminAuthModal").classList.add("active");
}
function closeAdminAuthModal(){
    document.getElementById("adminAuthModal").classList.remove("active");
}
function logoutAdmin(){
    if(!confirm("로그아웃 하시겠습니까?")) return;
    auth.signOut();
    deleteCookie("is_admin");
    alert("로그아웃 되었습니다.");
    location.reload();
}

function disableAdminMode() {
    if(!confirm("관리자 모드를 해제하시겠습니까?\n\n일반 사용자 모드로 전환됩니다.")) return;
    deleteCookie("is_admin");
    alert("관리자 모드가 해제되었습니다.");
    location.reload();
}

const adminForm = document.getElementById("adminAuthForm");
if(adminForm) {
    adminForm.addEventListener("submit", async e=>{
        e.preventDefault();
        const email=document.getElementById("adminEmail").value;
        const pw=document.getElementById("adminPw").value;
        try{
            await auth.signInWithEmailAndPassword(email,pw);
            setCookie("is_admin","true");
            alert("관리자 로그인 성공!");
            closeAdminAuthModal();
            location.reload();
        }catch(err){
            alert("로그인 실패: "+err.message);
        }
    });
}

auth.onAuthStateChanged(async user=>{
    // 로그인 상태만 확인, 관리자 쿠키는 건드리지 않음
    updateSettings();
    
    const adminEventTab = document.getElementById("adminEventTab");
    if(adminEventTab) {
        adminEventTab.style.display = isAdmin() ? "block" : "none";
    }
    
    updateHeaderAuthButton();
    
    if(document.querySelector(".articles-section.active")) {
        filteredArticles = allArticles;
        renderArticles();
    }
});

function updateHeaderAuthButton() {
    const headerAuthButton = document.getElementById("headerAuthButton");
    if(!headerAuthButton) return;
    
    const user = auth.currentUser;
    if(user) {
        const nickname = getNickname();
        headerAuthButton.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;">
                <span style="color:#495057;font-weight:600;font-size:14px;">👤 ${nickname}${isAdmin() ? ' <span style="color:#c62828;">(관리자)</span>' : ''}</span>
                <button class="btn btn-gray" onclick="logoutAdmin()" style="height:40px;padding:0 20px;">로그아웃</button>
            </div>
        `;
    } else {
        headerAuthButton.innerHTML = `
            <button class="btn btn-secondary" onclick="googleLogin()">🔓 로그인</button>
        `;
    }
}// ===== Part 3: 사용자 관리 및 관리자 이벤트 =====

// 사용자 관리
async function showUserManagement(){
    if(!isAdmin()) return alert("관리자 권한 필요!");
    hideAll();
    document.getElementById("userManagementSection").classList.add("active");
    const root=document.getElementById("usersList");
    root.innerHTML = "<p style='text-align:center;color:#868e96;'>사용자 정보 로딩 중...</p>";
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
        const vipStatusMap = new Map();
        Object.entries(usersData).forEach(([uid, userData]) => {
            if(userData.email) {
                vipStatusMap.set(userData.email, userData.isVIP || false);
            }
        });
        
        if(usersMap.size === 0) {
            root.innerHTML = "<p style='text-align:center;color:#868e96;'>등록된 사용자가 없습니다.</p>";
            return;
        }
        
        const usersList = Array.from(usersMap.values());
        root.innerHTML = usersList.map(u => {
            const isVIP = vipStatusMap.get(u.email) || false;
            return `
            <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:15px;border-left:4px solid ${isVIP ? '#ffd700' : '#c62828'};">
                <h4 style="margin:0 0 15px 0;color:${isVIP ? '#ffd700' : '#c62828'};">
                    👤 ${u.nickname}${isVIP ? ' <span class="vip-badge">⭐ VIP</span>' : ''}
                </h4>
                <div style="color:#495057;font-size:14px;margin-bottom:15px;line-height:1.8;">
                    📧 이메일: <strong>${u.email}</strong><br>
                    📰 작성 기사: <strong>${u.articles.length}개</strong><br>
                    💬 작성 댓글: <strong>${u.comments.length}개</strong><br>
                    🕐 마지막 활동: ${u.lastActivity}
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button onclick="showUserDetail('${u.nickname}')" class="btn btn-blue">상세 보기</button>
                    ${isVIP ? 
                        `<button onclick="toggleVIPStatus('${u.email}', false)" class="btn btn-gray">VIP 취소</button>` :
                        `<button onclick="toggleVIPStatus('${u.email}', true)" class="btn btn-primary">VIP 승급</button>`
                    }
                    <button onclick="deleteUserCompletely('${u.nickname}')" class="btn btn-gray">전체 삭제</button>
                </div>
            </div>
        `}).join('');
    } catch(error) {
        root.innerHTML = `<p style="color:#dc3545;text-align:center;">오류: ${error.message}</p>`;
    }
}

async function toggleVIPStatus(userEmail, makeVIP) {
    if(!isAdmin()) return alert("관리자 권한이 필요합니다!");
    
    const action = makeVIP ? "VIP로 승급" : "VIP 취소";
    if(!confirm(`"${userEmail}" 사용자를 ${action}하시겠습니까?`)) return;
    
    try {
        const usersSnapshot = await db.ref("users").once("value");
        const usersData = usersSnapshot.val() || {};
        let targetUid = null;
        
        Object.entries(usersData).forEach(([uid, userData]) => {
            if(userData.email === userEmail) {
                targetUid = uid;
            }
        });
        
        const currentUser = auth.currentUser;
        if(currentUser && currentUser.email === userEmail) {
            targetUid = currentUser.uid;
        }
        
        if(!targetUid) {
            targetUid = 'email_' + btoa(userEmail).replace(/=/g, '');
        }
        
        await db.ref("users/" + targetUid).update({
            email: userEmail,
            isVIP: makeVIP,
            vipUpdatedAt: new Date().toLocaleString(),
            vipUpdatedBy: getNickname()
        });
        
        alert(`${action}이 완료되었습니다!`);
        showUserManagement();
    } catch(error) {
        alert("VIP 상태 변경 실패: " + error.message);
        console.error(error);
    }
}

async function showUserDetail(nickname) {
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
    let userId = null;
    if(articles.length > 0 && articles[0].authorEmail) {
        userEmail = articles[0].authorEmail;
    } else if(userComments.length > 0 && userComments[0].authorEmail) {
        userEmail = userComments[0].authorEmail;
    }
    
    if(userEmail !== "미확인") {
        const usersSnapshot = await db.ref("users").once("value");
        const usersData = usersSnapshot.val() || {};
        Object.entries(usersData).forEach(([uid, userData]) => {
            if(auth.currentUser && auth.currentUser.email === userEmail) {
                userId = uid;
            }
        });
    }
    
    let hasChangedNickname = false;
    let isVIP = false;
    if(userId) {
        const nicknameChangeSnapshot = await db.ref("users/" + userId + "/nicknameChanged").once("value");
        hasChangedNickname = nicknameChangeSnapshot.val() || false;
        
        const vipSnapshot = await db.ref("users/" + userId + "/isVIP").once("value");
        isVIP = vipSnapshot.val() || false;
    }
    
    const modal = document.getElementById("userDetailModal");
    const content = document.getElementById("userDetailContent");
    content.innerHTML = `
        <h3 style="margin-top:0;color:#c62828;font-size:24px;">👤 ${nickname}${isVIP ? ' <span class="vip-badge">⭐ VIP</span>' : ''}</h3>
        ${isAdmin() ? `<div style="background:#e3f2fd;padding:15px;border-radius:8px;margin-bottom:20px;border-left:4px solid #1976d2;">
            <strong>📧 구글 계정:</strong> ${userEmail}<br>
            <strong>🏷️ 닉네임 변경:</strong> ${hasChangedNickname ? '변경 완료 ✔' : '변경 가능'}<br>
            <strong>⭐ VIP 상태:</strong> ${isVIP ? 'VIP 회원 ✔' : '일반 회원'}
            ${isAdmin() && userId ? `<br><button onclick="adminChangeUserNickname('${userId}', '${nickname}', '${userEmail}')" class="btn btn-primary" style="margin-top:10px;height:36px;padding:0 16px;font-size:13px;">관리자: 닉네임 강제 변경</button>` : ''}
        </div>` : ''}
        <div style="margin-top:25px;">
            <h4 style="color:#1976d2;font-size:18px;margin-bottom:15px;">📰 작성 기사 (${articles.length}개)</h4>
            ${articles.length === 0 ? '<p style="color:#868e96;padding:20px;text-align:center;background:#f8f9fa;border-radius:8px;">작성한 기사가 없습니다.</p>' : ''}
            ${articles.map(a => `
                <div style="background:#f8f9fa;padding:15px;margin-bottom:10px;border-radius:8px;border-left:3px solid #c62828;">
                    <strong style="color:#212529;font-size:15px;">${a.title}</strong><br>
                    <small style="color:#6c757d;">${a.date}</small><br>
                    <div style="margin-top:12px;">
                        <button onclick="editArticleFromAdmin('${a.id}')" class="btn btn-blue" style="height:34px;padding:0 16px;font-size:13px;">수정</button>
                        <button onclick="deleteArticleFromAdmin('${a.id}', '${nickname}')" class="btn btn-gray" style="height:34px;padding:0 16px;font-size:13px;margin-left:8px;">삭제</button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div style="margin-top:30px;">
            <h4 style="color:#1976d2;font-size:18px;margin-bottom:15px;">💬 작성 댓글 (${userComments.length}개)</h4>
            ${userComments.length === 0 ? '<p style="color:#868e96;padding:20px;text-align:center;background:#f8f9fa;border-radius:8px;">작성한 댓글이 없습니다.</p>' : ''}
            ${userComments.map(c => `
                <div style="background:#f8f9fa;padding:15px;margin-bottom:10px;border-radius:8px;border-left:3px solid #6c757d;">
                    <p style="margin:0 0 8px 0;color:#212529;">${c.text}</p>
                    <small style="color:#6c757d;">${c.timestamp}</small><br>
                    <div style="margin-top:12px;">
                        <button onclick="editCommentFromAdmin('${c.articleId}', '${c.commentId}')" class="btn btn-blue" style="height:34px;padding:0 16px;font-size:13px;">수정</button>
                        <button onclick="deleteCommentFromAdmin('${c.articleId}', '${c.commentId}', '${nickname}')" class="btn btn-gray" style="height:34px;padding:0 16px;font-size:13px;margin-left:8px;">삭제</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    modal.classList.add("active");
}

async function adminChangeUserNickname(userId, currentNickname, userEmail) {
    if(!isAdmin()) return alert("관리자 권한이 필요합니다!");
    
    const newNickname = prompt(`관리자 권한으로 닉네임을 변경합니다.\n\n현재 닉네임: ${currentNickname}\n새로운 닉네임을 입력하세요 (2-20자):`);
    if(!newNickname) return;
    
    const trimmed = newNickname.trim();
    if(trimmed.length < 2 || trimmed.length > 20) {
        return alert("닉네임은 2자 이상 20자 이하여야 합니다!");
    }
    if(trimmed === currentNickname) {
        return alert("현재 닉네임과 동일합니다!");
    }
    if(!confirm(`정말 "${currentNickname}"의 닉네임을 "${trimmed}"로 변경하시겠습니까?`)) return;
    
    try {
        await db.ref("users/" + userId).update({
            adminChangedNickname: true,
            newNickname: trimmed,
            oldNickname: currentNickname,
            adminChangedAt: new Date().toLocaleString()
        });
        
        await updateUserContentNickname(currentNickname, trimmed, userEmail);
        
        alert("닉네임이 성공적으로 변경되었습니다!");
        closeUserDetail();
        showUserManagement();
    } catch(error) {
        alert("닉네임 변경 실패: " + error.message);
        console.error(error);
    }
}

function closeUserDetail() {
    document.getElementById("userDetailModal").classList.remove("active");
}

function editArticleFromAdmin(id) {
    closeUserDetail();
    editArticle(id);
}

function deleteArticleFromAdmin(id, nickname) {
    if(!confirm("이 기사를 삭제하시겠습니까?")) return;
    deleteArticleFromDB(id, () => {
        db.ref("comments/" + id).remove();
        alert("기사가 삭제되었습니다.");
        closeUserDetail();
        showUserDetail(nickname);
    });
}

function editCommentFromAdmin(articleId, commentId) {
    db.ref("comments/" + articleId + "/" + commentId).once("value").then(s => {
        const comment = s.val();
        if(!comment) return;
        const newText = prompt("댓글 수정", comment.text);
        if(newText === null || newText.trim() === "") return;
        comment.text = newText.trim();
        comment.timestamp = new Date().toLocaleString() + " (관리자 수정)";
        db.ref("comments/" + articleId + "/" + commentId).set(comment).then(() => {
            alert("댓글이 수정되었습니다.");
            const nickname = comment.author;
            closeUserDetail();
            showUserDetail(nickname);
        });
    });
}

function deleteCommentFromAdmin(articleId, commentId, nickname) {
    if(!confirm("이 댓글을 삭제하시겠습니까?")) return;
    db.ref("comments/" + articleId + "/" + commentId).remove().then(() => {
        alert("댓글이 삭제되었습니다.");
        closeUserDetail();
        showUserDetail(nickname);
    });
}

function deleteUserCompletely(nick){
    if(!confirm(`"${nick}" 사용자 및 관련 기사/댓글을 모두 삭제하시겠습니까?`)) return;
    
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

// ===== 관리자 이벤트 기능 =====

async function showAdminEvent() {
    if(!isAdmin()) return alert("관리자 권한 필요!");
    
    // VIP 여부 확인
    const user = auth.currentUser;
    if(!user) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    const vipSnapshot = await db.ref("users/" + user.uid + "/isVIP").once("value");
    const isVIP = vipSnapshot.val() || false;
    
    if(!isVIP) {
        alert("VIP 등급이 아닙니다.\n\nVIP 회원만 이벤트 기능을 이용할 수 있습니다.");
        return;
    }
    
    hideAll();
    document.querySelector(".admin-event-section").classList.add("active");
    document.querySelectorAll(".nav-item").forEach((item, idx) => {
        if(idx === 3) item.classList.add("active");
    });
    document.getElementById("eventContent").innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:#868e96;">
            <p style="font-size:18px;margin-bottom:10px;">원하는 기능을 선택해주세요</p>
            <p style="font-size:14px;">기사 고정 또는 광고 관리를 시작할 수 있습니다</p>
        </div>
    `;
}

// 기사 고정 관리
async function showPinManager() {
    const content = document.getElementById("eventContent");
    content.innerHTML = "<p style='text-align:center;color:#868e96;'>로딩 중...</p>";
    
    const articlesSnapshot = await db.ref("articles").once("value");
    const articlesData = articlesSnapshot.val() || {};
    const articles = Object.values(articlesData);
    
    const pinsSnapshot = await db.ref("pinnedArticles").once("value");
    const pinnedData = pinsSnapshot.val() || {};
    const pinnedArticles = Object.entries(pinnedData)
        .sort((a, b) => b[1].pinnedAt - a[1].pinnedAt)
        .map(([id, data]) => {
            const article = articles.find(a => a.id === id);
            return article ? {...article, pinnedAt: data.pinnedAt} : null;
        })
        .filter(a => a !== null);
    
    const unpinnedArticles = articles.filter(a => !pinnedData[a.id]);
    
    content.innerHTML = `
        <h3 style="color:#c62828;margin-bottom:20px;">📌 고정된 기사 (${pinnedArticles.length}개)</h3>
        ${pinnedArticles.length === 0 ? 
            '<p style="color:#868e96;padding:20px;text-align:center;background:#f8f9fa;border-radius:8px;margin-bottom:30px;">고정된 기사가 없습니다.</p>' :
            pinnedArticles.map(a => `
                <div style="background:#fffbf0;border:2px solid #ffd700;padding:20px;border-radius:8px;margin-bottom:15px;position:relative;">
                    <div style="position:absolute;top:10px;right:10px;background:#ffd700;color:#000;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">
                        📌 고정됨
                    </div>
                    <h4 style="margin:0 0 10px 0;color:#212529;padding-right:80px;">${a.title}</h4>
                    <p style="margin:0 0 10px 0;color:#6c757d;font-size:13px;">${a.category} · ${a.author} · ${a.date}</p>
                    <p style="margin:0 0 15px 0;color:#495057;font-size:14px;">${a.summary || ''}</p>
                    <button onclick="unpinArticle('${a.id}')" class="btn btn-gray" style="height:36px;padding:0 16px;font-size:13px;">
                        고정 취소
                    </button>
                </div>
            `).join('')
        }
        
        <h3 style="color:#495057;margin:40px 0 20px 0;">📰 전체 기사 목록</h3>
        ${unpinnedArticles.length === 0 ?
            '<p style="color:#868e96;padding:20px;text-align:center;background:#f8f9fa;border-radius:8px;">고정 가능한 기사가 없습니다.</p>' :
            unpinnedArticles.map(a => `
                <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:15px;">
                    <h4 style="margin:0 0 10px 0;color:#212529;">${a.title}</h4>
                    <p style="margin:0 0 10px 0;color:#6c757d;font-size:13px;">${a.category} · ${a.author} · ${a.date}</p>
                    <p style="margin:0 0 15px 0;color:#495057;font-size:14px;">${a.summary || ''}</p>
                    <button onclick="pinArticle('${a.id}')" class="btn btn-primary" style="height:36px;padding:0 16px;font-size:13px;">
                        📌 상단 고정하기
                    </button>
                </div>
            `).join('')
        }
    `;
}

async function pinArticle(articleId) {
    if(!confirm("이 기사를 최상단에 고정하시겠습니까?")) return;
    
    try {
        await db.ref("pinnedArticles/" + articleId).set({
            pinnedAt: Date.now()
        });
        alert("기사가 상단에 고정되었습니다!");
        showPinManager();
    } catch(error) {
        alert("고정 실패: " + error.message);
    }
}

async function unpinArticle(articleId) {
    if(!confirm("이 기사의 고정을 취소하시겠습니까?")) return;
    
    try {
        await db.ref("pinnedArticles/" + articleId).remove();
        alert("고정이 취소되었습니다!");
        showPinManager();
    } catch(error) {
        alert("취소 실패: " + error.message);
    }
}

// 광고 관리
async function showAdManager() {
    const content = document.getElementById("eventContent");
    content.innerHTML = "<p style='text-align:center;color:#868e96;'>로딩 중...</p>";
    
    const adsSnapshot = await db.ref("advertisements").once("value");
    const adsData = adsSnapshot.val() || {};
    const ads = Object.entries(adsData)
        .sort((a, b) => b[1].createdAt - a[1].createdAt)
        .map(([id, data]) => ({id, ...data}));
    
    content.innerHTML = `
        <div style="margin-bottom:30px;">
            <button onclick="openAdCreateModal()" class="btn btn-primary" style="height:48px;width:100%;font-size:16px;">
                ➕ 새 광고 만들기
            </button>
        </div>
        
        <h3 style="color:#1976d2;margin-bottom:20px;">📢 활성 광고 목록 (${ads.length}개)</h3>
        ${ads.length === 0 ?
            '<p style="color:#868e96;padding:20px;text-align:center;background:#f8f9fa;border-radius:8px;">등록된 광고가 없습니다.</p>' :
            ads.map(ad => `
                <div style="background:${ad.color};border-left:4px solid #1976d2;padding:20px;border-radius:8px;margin-bottom:15px;">
                    <h4 style="margin:0 0 10px 0;color:#212529;">${ad.title}</h4>
                    <p style="margin:0 0 10px 0;color:#495057;white-space:pre-wrap;">${ad.content}</p>
                    ${ad.link ? `<p style="margin:0 0 10px 0;"><a href="${ad.link}" target="_blank" style="color:#1976d2;">🔗 ${ad.link}</a></p>` : ''}
                    <p style="margin:0 0 15px 0;color:#6c757d;font-size:12px;">생성일: ${new Date(ad.createdAt).toLocaleString()}</p>
                    <button onclick="deleteAd('${ad.id}')" class="btn btn-gray" style="height:36px;padding:0 16px;font-size:13px;">
                        삭제
                    </button>
                </div>
            `).join('')
        }
    `;
}

function openAdCreateModal() {
    document.getElementById("adCreateModal").classList.add("active");
}

function closeAdCreateModal() {
    document.getElementById("adCreateModal").classList.remove("active");
    document.getElementById("adCreateForm").reset();
}

const adCreateForm = document.getElementById("adCreateForm");
if(adCreateForm) {
    adCreateForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const ad = {
            id: Date.now().toString(),
            title: document.getElementById("adTitle").value,
            content: document.getElementById("adContent").value,
            link: document.getElementById("adLink").value,
            color: document.getElementById("adColor").value,
            createdAt: Date.now()
        };
        
        try {
            await db.ref("advertisements/" + ad.id).set(ad);
            alert("광고가 생성되었습니다!");
            closeAdCreateModal();
            showAdManager();
        } catch(error) {
            alert("광고 생성 실패: " + error.message);
        }
    });
}

async function deleteAd(adId) {
    if(!confirm("이 광고를 삭제하시겠습니까?")) return;
    
    try {
        await db.ref("advertisements/" + adId).remove();
        alert("광고가 삭제되었습니다!");
        showAdManager();
    } catch(error) {
        alert("삭제 실패: " + error.message);
    }
}

// 초기화
window.addEventListener("load", () => {
    setupArticlesListener();
    
    const form = document.getElementById("articleForm");
    if(form) {
        const fileInput = form.querySelector('#thumbnailInput');
        if(fileInput) {
            fileInput.addEventListener('change', previewThumbnail);
        }
        
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            if(!isLoggedIn()) {
                alert("기사 작성은 로그인 후 가능합니다!");
                return;
            }
            
            const fileInput = form.querySelector('#thumbnailInput');
            const A = {
                id: Date.now().toString(),
                category: form.querySelector("#category").value,
                title: form.querySelector("#title").value,
                summary: form.querySelector("#summary").value,
                content: form.querySelector("#content").value,
                author: getNickname(),
                authorEmail: getUserEmail(),
                date: new Date().toLocaleString(),
                thumbnail: null
            };
            
            if(fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    A.thumbnail = e.target.result;
                    saveNewArticle(A);
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                saveNewArticle(A);
            }
            
            function saveNewArticle(article) {
                saveArticle(article, () => {
                    form.reset();
                    document.getElementById('thumbnailPreview').style.display = 'none';
                    document.getElementById('uploadText').textContent = '📷 클릭하여 이미지 업로드 (선택사항)';
                    alert("기사가 발행되었습니다!");
                    showArticles();
                });
            }
        });
    }
});
