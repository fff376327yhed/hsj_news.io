// ===== Part 1: 기본 설정 및 핵심 기능 (Firebase 동기화) =====

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
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('thumbnailPreview');
            const uploadText = document.getElementById('uploadText');
            preview.src = e.target.result;
            preview.style.display = 'block';
            uploadText.textContent = '✓ 이미지 선택됨 (클릭하여 변경)';
        };
        reader.readAsDataURL(file);
    }
}

// 기사 관리 - Firebase 사용
function loadArticles(callback) {
    db.ref("articles").once("value").then(snapshot => {
        const val = snapshot.val() || {};
        allArticles = Object.values(val);
        filteredArticles = allArticles;
        if(callback) callback();
    });
}

function saveArticle(article, callback) {
    db.ref("articles/" + article.id).set(article).then(() => {
        if(callback) callback();
    });
}

function deleteArticleFromDB(articleId, callback) {
    db.ref("articles/" + articleId).remove().then(() => {
        if(callback) callback();
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
    loadArticles(() => {
        filteredArticles = allArticles;
        renderArticles();
    });
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
function renderArticles() {
    const list = getSortedArticles();
    const featured = document.getElementById("featuredArticle");
    const grid = document.getElementById("articlesGrid");
    const loadMore = document.getElementById("loadMoreContainer");
    const currentUser = getNickname();

    if (!list.length) {
        featured.innerHTML = `<div style="text-align:center;padding:60px 20px;background:#fff;border-radius:8px;">
            <p style="color:#868e96;font-size:16px;">작성된 기사가 없습니다.</p>
        </div>`;
        grid.innerHTML = "";
        loadMore.innerHTML = "";
        return;
    }

    const A0 = list[0];
    const canEditA0 = isLoggedIn() && ((A0.author === currentUser) || isAdmin());
    const views0 = getArticleViews(A0.id);
    const votes0 = getArticleVoteCounts(A0.id);
    
    featured.innerHTML = `<div class="featured-article">
        ${A0.thumbnail ? `<img src="${A0.thumbnail}" class="featured-image" alt="썸네일">` : '<div class="featured-image"></div>'}
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

    const startIdx = 1;
    const endIdx = startIdx + (currentArticlePage * ARTICLES_PER_PAGE);
    const displayArticles = list.slice(startIdx, endIdx);
    
    grid.innerHTML = displayArticles.map(a => {
        const canEdit = isLoggedIn() && ((a.author === currentUser) || isAdmin());
        const views = getArticleViews(a.id);
        const votes = getArticleVoteCounts(a.id);
        return `<div class="article-card">
            ${a.thumbnail ? `<img src="${a.thumbnail}" class="article-thumbnail" alt="썸네일">` : '<div class="article-thumbnail"></div>'}
            <div class="article-content">
                <span class="category-badge">${a.category}</span>
                <h3 class="article-title">${a.title}</h3>
                <p class="article-summary">${a.summary||''}</p>
                <div class="article-meta">
                    <span>${a.author}</span>
                    <span>${a.date}</span>
                    <div class="article-stats">
                        <span class="stat-item">👁️ ${views}</span>
                        <span class="stat-item">👍 ${votes.likes}</span>
                        <span class="stat-item">👎 ${votes.dislikes}</span>
                    </div>
                </div>
                <div style="margin-top:16px;display:flex;gap:10px;">
                    <button onclick="showArticleDetail('${a.id}')" class="btn btn-primary">기사 읽기</button>
                    ${canEdit ? `<button onclick="editArticle('${a.id}')" class="btn btn-blue">수정</button>` : ''}
                </div>
            </div>
        </div>`}).join('');
    
    if(endIdx < list.length) {
        loadMore.innerHTML = `<button onclick="loadMoreArticles()" class="btn btn-gray">
            기사 더보기 (${list.length - endIdx}개 남음)</button>`;
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
            uploadText.textContent = '✓ 기존 이미지 (클릭하여 변경)';
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
}// ===== Part 2: 댓글, 인증, 사용자 관리 =====
// 이 코드를 Part 1 코드 아래에 붙여넣으세요

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
function updateSettings() {
    const el = document.getElementById("profileNickname");
    if (el) {
        const user = auth.currentUser;
        if(user) {
            el.innerHTML = `<div style="background:#f8f9fa;padding:20px;border-radius:8px;">
                <h4 style="margin:0 0 15px 0;color:#212529;">내 정보</h4>
                <p style="margin:8px 0;color:#495057;"><strong>이름:</strong> ${user.displayName || '미설정'}</p>
                <p style="margin:8px 0;color:#495057;"><strong>이메일:</strong> ${user.email}</p>
            </div>`;
        } else {
            el.innerHTML = `<div style="background:#f8f9fa;padding:20px;border-radius:8px;text-align:center;">
                <p style="color:#868e96;">로그인이 필요합니다.</p>
            </div>`;
        }
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
    if(user){
        setCookie("is_admin","true");
    } else {
        deleteCookie("is_admin");
    }
    updateSettings();
    if(document.querySelector(".articles-section.active")) {
        loadArticles(() => {
            filteredArticles = allArticles;
            renderArticles();
        });
    }
});

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
            if(article.author && article.author !== "익명") {
                if(!usersMap.has(article.author)) {
                    usersMap.set(article.author, {nickname: article.author,articles: [],comments: [],lastActivity: article.date});
                }
                usersMap.get(article.author).articles.push(article);
            }
        });
        
        Object.entries(commentsData).forEach(([articleId, articleComments]) => {
            Object.entries(articleComments).forEach(([commentId, comment]) => {
                if(comment.author && comment.author !== "익명") {
                    if(!usersMap.has(comment.author)) {
                        usersMap.set(comment.author, {nickname: comment.author,articles: [],comments: [],lastActivity: comment.timestamp});
                    }
                    usersMap.get(comment.author).comments.push({...comment,articleId,commentId});
                    usersMap.get(comment.author).lastActivity = comment.timestamp;
                }
            });
        });
        
        const currentNickname = getNickname();
        if(currentNickname !== "익명" && !usersMap.has(currentNickname)) {
            usersMap.set(currentNickname, {nickname: currentNickname,articles: [],comments: [],lastActivity: new Date().toLocaleString()});
        }
        
        if(usersMap.size === 0) {
            root.innerHTML = "<p style='text-align:center;color:#868e96;'>등록된 사용자가 없습니다.</p>";
            return;
        }
        
        const usersList = Array.from(usersMap.values());
        root.innerHTML = usersList.map(u => `
            <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:15px;border-left:4px solid #c62828;">
                <h4 style="margin:0 0 15px 0;color:#c62828;">👤 ${u.nickname}</h4>
                <div style="color:#495057;font-size:14px;margin-bottom:15px;line-height:1.8;">
                    📝 작성 기사: <strong>${u.articles.length}개</strong><br>
                    💬 작성 댓글: <strong>${u.comments.length}개</strong><br>
                    🕐 마지막 활동: ${u.lastActivity}
                </div>
                <button onclick="showUserDetail('${u.nickname}')" class="btn btn-blue" style="margin-right:8px;">상세 보기</button>
                <button onclick="deleteUserCompletely('${u.nickname}')" class="btn btn-gray">전체 삭제</button>
            </div>
        `).join('');
    } catch(error) {
        root.innerHTML = `<p style="color:#dc3545;text-align:center;">오류: ${error.message}</p>`;
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
    if(articles.length > 0 && articles[0].authorEmail) {
        userEmail = articles[0].authorEmail;
    } else if(userComments.length > 0 && userComments[0].authorEmail) {
        userEmail = userComments[0].authorEmail;
    }
    
    const modal = document.getElementById("userDetailModal");
    const content = document.getElementById("userDetailContent");
    content.innerHTML = `
        <h3 style="margin-top:0;color:#c62828;font-size:24px;">👤 ${nickname} 상세 정보</h3>
        ${isAdmin() ? `<div style="background:#e3f2fd;padding:15px;border-radius:8px;margin-bottom:20px;border-left:4px solid #1976d2;">
            <strong>📧 구글 계정:</strong> ${userEmail}</div>` : ''}
        <div style="margin-top:25px;">
            <h4 style="color:#1976d2;font-size:18px;margin-bottom:15px;">📝 작성 기사 (${articles.length}개)</h4>
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

// 초기화
window.addEventListener("load", () => {
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
    loadArticles(() => {
        filteredArticles = allArticles;
        renderArticles();
    });
});
