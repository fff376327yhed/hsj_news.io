// ===== 프로필 사진 시스템 =====

// 프로필 사진 모달 열기
window.openProfilePhotoModal = function() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    const modalHTML = `
        <div id="profilePhotoModal" class="modal active">
            <div class="modal-content" style="max-width:600px;">
                <div class="modal-header">
                    <h3 style="color:#c62828;">📸 프로필 사진 변경</h3>
                    <button onclick="closeProfilePhotoModal()" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="padding:20px;">
                    <!-- 현재 프로필 사진 -->
                    <div style="text-align:center; margin-bottom:30px;">
                        <h4 style="margin-bottom:15px; color:#495057;">현재 프로필 사진</h4>
                        <div id="currentProfilePhotoPreview"></div>
                    </div>
                    
                    <!-- 업로드 방식 선택 -->
                    <div class="tab-buttons" style="margin-bottom:20px;">
                        <button onclick="switchPhotoUploadTab('upload')" class="tab-btn active" id="uploadTabBtn">
                            📤 파일 업로드
                        </button>
                        <button onclick="switchPhotoUploadTab('url')" class="tab-btn" id="urlTabBtn">
                            🔗 URL 입력
                        </button>
                    </div>
                    
                    <!-- 파일 업로드 탭 -->
                    <div id="uploadPhotoTab" style="display:block;">
                        <div class="image-upload-area" onclick="document.getElementById('profilePhotoInput').click()" 
                             style="min-height:200px; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                            <div id="uploadPhotoText">
                                <i class="fas fa-camera" style="font-size:48px; color:#c62828; margin-bottom:10px;"></i>
                                <p style="color:#5f6368; font-size:14px;">클릭하여 이미지 선택</p>
                                <small style="color:#868e96;">권장: 정사각형 이미지, 최대 2MB</small>
                            </div>
                            <img id="uploadPhotoPreview" class="image-preview" style="display:none; max-width:100%; border-radius:50%; width:200px; height:200px; object-fit:cover;">
                        </div>
                        <input type="file" id="profilePhotoInput" accept="image/*" style="display:none;">
                        
                        <button onclick="uploadProfilePhoto()" class="btn-primary btn-block" style="margin-top:15px;">
                            <i class="fas fa-upload"></i> 업로드하기
                        </button>
                    </div>
                    
                    <!-- URL 입력 탭 -->
                    <div id="urlPhotoTab" style="display:none;">
                        <div class="form-group">
                            <label class="form-label">이미지 URL</label>
                            <input type="text" id="profilePhotoUrl" class="form-control" 
                                   placeholder="https://example.com/image.jpg">
                            <small style="color:#6c757d; display:block; margin-top:5px;">
                                외부 이미지 URL을 입력하세요
                            </small>
                        </div>
                        
                        <div style="text-align:center; margin:20px 0;">
                            <button onclick="previewPhotoUrl()" class="btn-secondary">
                                <i class="fas fa-eye"></i> 미리보기
                            </button>
                        </div>
                        
                        <div id="urlPhotoPreviewContainer" style="display:none; text-align:center; margin:20px 0;">
                            <img id="urlPhotoPreview" style="max-width:100%; border-radius:50%; width:200px; height:200px; object-fit:cover; border:3px solid #dadce0;">
                        </div>
                        
                        <button onclick="saveProfilePhotoUrl()" class="btn-primary btn-block">
                            <i class="fas fa-save"></i> URL로 저장하기
                        </button>
                    </div>
                    
                    <!-- 프로필 사진 삭제 -->
                    <button onclick="deleteProfilePhoto()" class="btn-danger btn-block" style="margin-top:20px;">
                        <i class="fas fa-trash"></i> 프로필 사진 삭제
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 파일 선택 이벤트
    document.getElementById('profilePhotoInput').addEventListener('change', previewUploadPhoto);
    
    // 현재 프로필 사진 로드
    loadCurrentProfilePhoto();
}

// 모달 닫기
window.closeProfilePhotoModal = function() {
    const modal = document.getElementById("profilePhotoModal");
    if(modal) modal.remove();
}

// 업로드 방식 탭 전환
window.switchPhotoUploadTab = function(tab) {
    const uploadTab = document.getElementById("uploadPhotoTab");
    const urlTab = document.getElementById("urlPhotoTab");
    const uploadBtn = document.getElementById("uploadTabBtn");
    const urlBtn = document.getElementById("urlTabBtn");
    
    if(tab === 'upload') {
        uploadTab.style.display = "block";
        urlTab.style.display = "none";
        uploadBtn.classList.add("active");
        urlBtn.classList.remove("active");
    } else {
        uploadTab.style.display = "none";
        urlTab.style.display = "block";
        uploadBtn.classList.remove("active");
        urlBtn.classList.add("active");
    }
}

// 현재 프로필 사진 로드
async function loadCurrentProfilePhoto() {
    const user = auth.currentUser;
    if(!user) return;
    
    const container = document.getElementById("currentProfilePhotoPreview");
    if(!container) return;
    
    try {
        const snapshot = await db.ref("users/" + user.uid + "/profilePhoto").once("value");
        const photoUrl = snapshot.val();
        
        if(photoUrl) {
            container.innerHTML = `
                <img src="${photoUrl}" style="width:150px; height:150px; border-radius:50%; object-fit:cover; border:3px solid #dadce0;">
            `;
        } else {
            container.innerHTML = `
                <div style="width:150px; height:150px; border-radius:50%; background:#f1f3f4; display:inline-flex; align-items:center; justify-content:center; border:3px solid #dadce0;">
                    <i class="fas fa-user" style="font-size:60px; color:#9aa0a6;"></i>
                </div>
            `;
        }
    } catch(error) {
        console.error("프로필 사진 로드 실패:", error);
        container.innerHTML = `<p style="color:#dc3545;">로드 실패</p>`;
    }
}

// 파일 업로드 미리보기
function previewUploadPhoto(event) {
    const file = event.target.files[0];
    if(!file) return;
    
    // 파일 크기 체크 (2MB)
    if(file.size > 2 * 1024 * 1024) {
        alert("⚠️ 파일 크기는 2MB 이하여야 합니다!");
        return;
    }
    
    // 이미지 파일인지 체크
    if(!file.type.startsWith('image/')) {
        alert("⚠️ 이미지 파일만 업로드 가능합니다!");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('uploadPhotoPreview');
        const uploadText = document.getElementById('uploadPhotoText');
        
        if(preview && uploadText) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            uploadText.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

// 파일 업로드
window.uploadProfilePhoto = async function() {
    const fileInput = document.getElementById('profilePhotoInput');
    const file = fileInput.files[0];
    
    if(!file) {
        alert("⚠️ 업로드할 이미지를 선택해주세요!");
        return;
    }
    
    if(!confirm("이 이미지를 프로필 사진으로 설정하시겠습니까?")) {
        return;
    }
    
    const user = auth.currentUser;
    if(!user) return;
    
    showLoadingIndicator("업로드 중...");
    
    try {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const photoData = e.target.result;
            
            // Firebase에 저장
            await db.ref("users/" + user.uid + "/profilePhoto").set(photoData);
            
            hideLoadingIndicator();
            alert("✅ 프로필 사진이 변경되었습니다!");
            
            closeProfilePhotoModal();
            
            // UI 업데이트
            updateSettings();
            if(document.getElementById("articlesSection").classList.contains("active")) {
                renderArticles();
            }
        };
        reader.readAsDataURL(file);
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("프로필 사진 업로드 실패:", error);
        alert("❌ 업로드 실패: " + error.message);
    }
}

// URL 미리보기
window.previewPhotoUrl = function() {
    const urlInput = document.getElementById('profilePhotoUrl');
    const url = urlInput.value.trim();
    
    if(!url) {
        alert("⚠️ URL을 입력해주세요!");
        return;
    }
    
    // URL 유효성 검사
    try {
        new URL(url);
    } catch {
        alert("⚠️ 올바른 URL 형식이 아닙니다!");
        return;
    }
    
    const preview = document.getElementById('urlPhotoPreview');
    const container = document.getElementById('urlPhotoPreviewContainer');
    
    if(preview && container) {
        preview.src = url;
        preview.onerror = function() {
            alert("⚠️ 이미지를 불러올 수 없습니다. URL을 확인해주세요.");
            container.style.display = "none";
        };
        preview.onload = function() {
            container.style.display = "block";
        };
    }
}

// URL로 프로필 사진 저장
window.saveProfilePhotoUrl = async function() {
    const urlInput = document.getElementById('profilePhotoUrl');
    const url = urlInput.value.trim();
    
    if(!url) {
        alert("⚠️ URL을 입력해주세요!");
        return;
    }
    
    // URL 유효성 검사
    try {
        new URL(url);
    } catch {
        alert("⚠️ 올바른 URL 형식이 아닙니다!");
        return;
    }
    
    if(!confirm("이 이미지를 프로필 사진으로 설정하시겠습니까?")) {
        return;
    }
    
    const user = auth.currentUser;
    if(!user) return;
    
    showLoadingIndicator("저장 중...");
    
    try {
        // Firebase에 URL 저장
        await db.ref("users/" + user.uid + "/profilePhoto").set(url);
        
        hideLoadingIndicator();
        alert("✅ 프로필 사진이 변경되었습니다!");
        
        closeProfilePhotoModal();
        
        // UI 업데이트
        updateSettings();
        if(document.getElementById("articlesSection").classList.contains("active")) {
            renderArticles();
        }
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("프로필 사진 저장 실패:", error);
        alert("❌ 저장 실패: " + error.message);
    }
}

// 프로필 사진 삭제
window.deleteProfilePhoto = async function() {
    if(!confirm("프로필 사진을 삭제하시겠습니까?\n기본 프로필 이미지로 변경됩니다.")) {
        return;
    }
    
    const user = auth.currentUser;
    if(!user) return;
    
    showLoadingIndicator("삭제 중...");
    
    try {
        await db.ref("users/" + user.uid + "/profilePhoto").remove();
        
        hideLoadingIndicator();
        alert("✅ 프로필 사진이 삭제되었습니다!");
        
        closeProfilePhotoModal();
        
        // UI 업데이트
        updateSettings();
        if(document.getElementById("articlesSection").classList.contains("active")) {
            renderArticles();
        }
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("프로필 사진 삭제 실패:", error);
        alert("❌ 삭제 실패: " + error.message);
    }
}


async function getUserProfilePhoto(email) {
    if(!email) return null;
    
    // ✅ window 객체를 통해 접근
    if(!window.profilePhotoCache) {
        window.profilePhotoCache = new Map();
    }
    
    // 캐시 확인
    if(window.profilePhotoCache.has(email)) {
        return window.profilePhotoCache.get(email);
    }
    
    try {
        const usersSnapshot = await db.ref("users").once("value");
        const usersData = usersSnapshot.val() || {};
        
        for(const userData of Object.values(usersData)) {
            if(userData && userData.email === email) {
                const photo = userData.profilePhoto || null;
                window.profilePhotoCache.set(email, photo);
                console.log("✅ 프로필 사진 로드:", email, photo ? "있음" : "없음"); // 디버깅
                return photo;
            }
        }
        
        // 찾지 못한 경우
        console.log("⚠️ 사용자를 찾을 수 없음:", email);
        window.profilePhotoCache.set(email, null);
        return null;
        
    } catch(error) {
        console.error("프로필 사진 로드 실패:", error);
        window.profilePhotoCache.set(email, null);
        return null;
    }
}

// 프로필 사진 HTML 생성 (아바타 스타일)
function createProfilePhotoHTML(photoUrl, size = 32, alt = "프로필") {
    if(photoUrl) {
        return `<img src="${photoUrl}" 
                     alt="${alt}" 
                     style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; border:2px solid #dadce0;"
                     onerror="this.outerHTML='<div style=\\'width:${size}px; height:${size}px; border-radius:50%; background:#f1f3f4; display:inline-flex; align-items:center; justify-content:center; border:2px solid #dadce0;\\'><i class=\\'fas fa-user\\' style=\\'font-size:${size/2}px; color:#9aa0a6;\\'></i></div>'">`;
    } else {
        return `<div style="width:${size}px; height:${size}px; border-radius:50%; background:#f1f3f4; display:inline-flex; align-items:center; justify-content:center; border:2px solid #dadce0;">
                    <i class="fas fa-user" style="font-size:${size/2}px; color:#9aa0a6;"></i>
                </div>`;
    }
}

// ===== 프로필 사진이 포함된 댓글 로드 (대댓글 + 수정 기능 포함 + 버그 수정됨) =====
async function loadCommentsWithProfile(id) {
    const currentUser = getNickname();
    const currentEmail = getUserEmail();
    
    try {
        const snapshot = await db.ref("comments/" + id).once("value");
        const val = snapshot.val() || {};
        const commentsList = Object.entries(val).sort((a,b) => new Date(b[1].timestamp) - new Date(a[1].timestamp));
        
        const root = document.getElementById("comments");
        const countEl = document.getElementById("commentCount");
        
        // 총 댓글 수 계산
        let totalCount = commentsList.length;
        commentsList.forEach(([_, comment]) => {
            if(comment.replies) {
                totalCount += Object.keys(comment.replies).length;
            }
        });
        
        if(countEl) countEl.textContent = `(${totalCount})`;

        if (!commentsList.length) {
            root.innerHTML = "<p style='color:#868e96;text-align:center;padding:30px;'>첫 댓글을 남겨보세요!</p>";
            document.getElementById("loadMoreComments").innerHTML = "";
            return;
        }

        const endIdx = currentCommentPage * COMMENTS_PER_PAGE;
        const displayComments = commentsList.slice(0, endIdx);
        
        // 1. 댓글 작성자들의 프로필 사진 미리 로드 (병렬 처리)
        // 캐시 활용을 위해 getUserProfilePhoto 사용
        
        // HTML 생성을 비동기로 처리
        const commentsHTML = await Promise.all(displayComments.map(async ([commentId, comment]) => {
            const isMyComment = isLoggedIn() && ((comment.authorEmail === currentEmail) || isAdmin());
            
            // ✅ [수정] 댓글 프로필 사진 + 장식 생성
            // photoUrl을 미리 가져오지 않고 createProfilePhotoWithDecorations 내부 로직에 맡기거나
            // 여기서 미리 가져와서 넘겨줍니다. 효율을 위해 여기서 url만 가져옵니다.
            const photoUrl = await getUserProfilePhoto(comment.authorEmail);
            const commentPhotoHTML = await createProfilePhotoWithDecorations(photoUrl, 32, comment.authorEmail);
            
            // 대댓글 처리
            let repliesHTML = '';
            if (comment.replies) {
                const replies = Object.entries(comment.replies).sort((a, b) => 
                    new Date(a[1].timestamp) - new Date(b[1].timestamp)
                );
                
                // ✅ [수정] 대댓글도 비동기로 장식 적용 (Promise.all 사용)
                const repliesPromises = replies.map(async ([replyId, reply]) => {
                    const isMyReply = isLoggedIn() && ((reply.authorEmail === currentEmail) || isAdmin());
                    const replyPhotoUrl = await getUserProfilePhoto(reply.authorEmail);
                    // 대댓글에도 장식 적용 (크기 24)
                    const replyPhotoHTML = await createProfilePhotoWithDecorations(replyPhotoUrl, 24, reply.authorEmail);
                    
                    return `
                        <div class="reply-item" id="reply-${replyId}">
                            <div style="display:flex; align-items:start; gap:8px;">
                                ${replyPhotoHTML}
                                <div style="flex:1;">
                                    <div class="reply-header">
                                        <span class="reply-author">↳ ${reply.author}</span>
                                        <span class="reply-time">${reply.timestamp}</span>
                                    </div>
                                    <div class="reply-content" id="replyContent-${replyId}">${reply.text}</div>
                                    
                                    <div id="replyEditForm-${replyId}" style="display:none; margin-top:8px;">
                                        <input type="text" id="replyEditInput-${replyId}" class="reply-input" value="${reply.text}" 
                                               onkeypress="if(event.key==='Enter') saveReplyEdit('${id}', '${commentId}', '${replyId}')">
                                        <div style="display:flex; gap:8px; margin-top:8px;">
                                            <button onclick="saveReplyEdit('${id}', '${commentId}', '${replyId}')" class="btn-primary" style="font-size:12px; padding:4px 12px;">저장</button>
                                            <button onclick="cancelReplyEdit('${replyId}')" class="btn-secondary" style="font-size:12px; padding:4px 12px;">취소</button>
                                        </div>
                                    </div>
                                    
                                    ${isMyReply ? `
                                        <div class="reply-actions">
                                            <button onclick="startReplyEdit('${replyId}')" class="btn-text">수정</button>
                                            <button onclick="deleteReply('${id}', '${commentId}', '${replyId}')" class="btn-text-danger">삭제</button>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                const repliesResult = await Promise.all(repliesPromises);
                repliesHTML = `<div class="replies-container">${repliesResult.join('')}</div>`;
            }

            return `
                <div class="comment-card" id="comment-${commentId}">
                    <div style="display:flex; align-items:start; gap:12px; margin-bottom:12px;">
                        ${commentPhotoHTML}
                        <div style="flex:1;">
                            <div class="comment-header">
                                <span class="comment-author">${comment.author}</span>
                                <span class="comment-time">${comment.timestamp}</span>
                            </div>
                            <div class="comment-body" id="commentContent-${commentId}">${comment.text}</div>
                            
                            <div id="commentEditForm-${commentId}" style="display:none; margin-top:12px;">
                                <textarea id="commentEditInput-${commentId}" class="form-control" style="min-height:80px; resize:vertical;">${comment.text}</textarea>
                                <div style="display:flex; gap:8px; margin-top:10px;">
                                    <button onclick="saveCommentEdit('${id}', '${commentId}')" class="btn-primary" style="font-size:13px; padding:6px 16px;">저장</button>
                                    <button onclick="cancelCommentEdit('${commentId}')" class="btn-secondary" style="font-size:13px; padding:6px 16px;">취소</button>
                                </div>
                            </div>
                            
                            <div class="comment-footer">
                                <button onclick="toggleReplyForm('${commentId}')" class="btn-text">💬 답글${comment.replies ? ` (${Object.keys(comment.replies).length})` : ''}</button>
                                ${isMyComment ? `
                                    <button onclick="startCommentEdit('${commentId}')" class="btn-text">수정</button>
                                    <button onclick="deleteComment('${id}', '${commentId}', '${comment.author}')" class="btn-text text-danger">삭제</button>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    ${repliesHTML}

                    <div id="replyForm-${commentId}" class="reply-input-area" style="display:none;">
                        <input type="text" id="replyInput-${commentId}" class="reply-input" placeholder="답글을 입력하세요..." onkeypress="if(event.key==='Enter') submitReply('${id}', '${commentId}')">
                        <button onclick="submitReply('${id}', '${commentId}')" class="btn-reply-submit"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            `;
        }));

        root.innerHTML = commentsHTML.join('');

        const loadMoreBtn = document.getElementById("loadMoreComments");
        if (endIdx < commentsList.length) {
            loadMoreBtn.innerHTML = `<button onclick="loadMoreComments()" class="btn-secondary btn-block">댓글 더보기 (${commentsList.length - endIdx}+)</button>`;
        } else {
            loadMoreBtn.innerHTML = "";
        }
        
    } catch(error) {
        console.error("❌ 댓글 로드 오류:", error);
        // 오류가 나도 사용자에게는 친절하게 표시
        const root = document.getElementById("comments");
        if(root) root.innerHTML = `<p style='color:#dc3545;text-align:center;padding:30px;'>댓글을 불러오는 중 문제가 발생했습니다.<br><small>${error.message}</small></p>`;
    }
}

// ===== 댓글 수정 시작 =====
window.startCommentEdit = function(commentId) {
    // 내용 숨기고 수정 폼 표시
    const contentEl = document.getElementById(`commentContent-${commentId}`);
    const formEl = document.getElementById(`commentEditForm-${commentId}`);
    
    if(contentEl) contentEl.style.display = 'none';
    if(formEl) {
        formEl.style.display = 'block';
        const input = document.getElementById(`commentEditInput-${commentId}`);
        if(input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
    }
}

// ===== 댓글 수정 취소 =====
window.cancelCommentEdit = function(commentId) {
    const contentEl = document.getElementById(`commentContent-${commentId}`);
    const formEl = document.getElementById(`commentEditForm-${commentId}`);
    
    if(contentEl) contentEl.style.display = 'block';
    if(formEl) formEl.style.display = 'none';
}

// ===== 댓글 수정 저장 =====
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
        alert(`⚠️ 금지어("${foundWord}")가 포함되어 수정할 수 없습니다.`);
        addWarningToCurrentUser();
        return;
    }
    
    try {
        // Firebase 업데이트
        await db.ref(`comments/${articleId}/${commentId}`).update({
            text: newText,
            timestamp: new Date().toLocaleString() + " (수정됨)"
        });
        
        showToastNotification("✅ 수정 완료", "댓글이 수정되었습니다!", null);
        
        // 댓글 목록 새로고침
        await loadCommentsWithProfile(articleId);
        
    } catch(error) {
        console.error("❌ 댓글 수정 실패:", error);
        alert("수정 중 오류가 발생했습니다: " + error.message);
    }
}

// ===== 대댓글 수정 시작 =====
window.startReplyEdit = function(replyId) {
    const contentEl = document.getElementById(`replyContent-${replyId}`);
    const formEl = document.getElementById(`replyEditForm-${replyId}`);
    
    if(contentEl) contentEl.style.display = 'none';
    if(formEl) {
        formEl.style.display = 'block';
        const input = document.getElementById(`replyEditInput-${replyId}`);
        if(input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
    }
}

// ===== 대댓글 수정 취소 =====
window.cancelReplyEdit = function(replyId) {
    const contentEl = document.getElementById(`replyContent-${replyId}`);
    const formEl = document.getElementById(`replyEditForm-${replyId}`);
    
    if(contentEl) contentEl.style.display = 'block';
    if(formEl) formEl.style.display = 'none';
}

// ===== 대댓글 수정 저장 =====
window.saveReplyEdit = async function(articleId, commentId, replyId) {
    const input = document.getElementById(`replyEditInput-${replyId}`);
    if(!input) return;
    
    const newText = input.value.trim();
    
    if(!newText) {
        alert("답글 내용을 입력해주세요!");
        return;
    }
    
    // 금지어 체크
    const foundWord = checkBannedWords(newText);
    if(foundWord) {
        alert(`⚠️ 금지어("${foundWord}")가 포함되어 수정할 수 없습니다.`);
        addWarningToCurrentUser();
        return;
    }
    
    try {
        // Firebase 업데이트
        await db.ref(`comments/${articleId}/${commentId}/replies/${replyId}`).update({
            text: newText,
            timestamp: new Date().toLocaleString() + " (수정됨)"
        });
        
        showToastNotification("✅ 수정 완료", "답글이 수정되었습니다!", null);
        
        // 댓글 목록 새로고침
        await loadCommentsWithProfile(articleId);
        
    } catch(error) {
        console.error("❌ 답글 수정 실패:", error);
        alert("수정 중 오류가 발생했습니다: " + error.message);
    }
}

// ===== 댓글 더보기 =====
function loadMoreComments() {
    currentCommentPage++;
    loadCommentsWithProfile(currentArticleId);
}

// ===== 답글 입력창 토글 =====
window.toggleReplyForm = function(commentId) {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다.");
        return;
    }
    
    const form = document.getElementById(`replyForm-${commentId}`);
    if(form) {
        const isHidden = form.style.display === 'none';
        form.style.display = isHidden ? 'flex' : 'none';
        
        if(isHidden) {
            const input = document.getElementById(`replyInput-${commentId}`);
            if(input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }
}

// ===== 답글 등록 =====
window.submitReply = async function(articleId, commentId) {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다.");
        return;
    }
    
    const input = document.getElementById(`replyInput-${commentId}`);
    if(!input) return;
    
    const text = input.value.trim();
    
    if(!text) {
        alert("답글 내용을 입력해주세요!");
        return;
    }
    
    // 금지어 체크
    const foundWord = checkBannedWords(text);
    if(foundWord) {
        alert(`⚠️ 금지어("${foundWord}")가 포함되어 있습니다.`);
        addWarningToCurrentUser();
        return;
    }

    const reply = {
        author: getNickname(),
        authorEmail: getUserEmail(),
        text: text,
        timestamp: new Date().toLocaleString()
    };

    try {
        // Firebase에 답글 저장
        await db.ref(`comments/${articleId}/${commentId}/replies`).push(reply);
        
        // 원댓글 작성자에게 알림
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
        
        // 포인트 지급
        await updateUserMoney(1, "답글 작성");
        
        // 입력창 초기화 및 숨김
        input.value = "";
        document.getElementById(`replyForm-${commentId}`).style.display = 'none';
        
        // 댓글 목록 새로고침
        currentCommentPage = 1;
        await loadCommentsWithProfile(articleId);
        
        showToastNotification("✅ 답글 등록", "답글이 성공적으로 등록되었습니다!", null);
        
    } catch(error) {
        console.error("❌ 답글 등록 실패:", error);
        alert("답글 등록 중 오류가 발생했습니다: " + error.message);
    }
}

// ===== 답글 삭제 =====
window.deleteReply = async function(articleId, commentId, replyId) {
    if(!confirm("이 답글을 삭제하시겠습니까?")) return;
    
    try {
        await db.ref(`comments/${articleId}/${commentId}/replies/${replyId}`).remove();
        
        showToastNotification("✅ 삭제 완료", "답글이 삭제되었습니다.", null);
        
        // 댓글 목록 새로고침
        currentCommentPage = 1;
        await loadCommentsWithProfile(articleId);
        
    } catch(error) {
        console.error("❌ 답글 삭제 실패:", error);
        alert("삭제 실패: " + error.message);
    }
}

async function createProfilePhotoWithDecorations(photoUrl, size, email) {
    // 1. 기본값 처리 (undefined 방지)
    const safePhotoUrl = photoUrl || ''; 
    
    // 이메일이 없으면 기본 사진 반환
    if(!email) return createProfilePhotoHTML(safePhotoUrl, size);
    
    try {
        // 사용자 UID 찾기
        const usersSnapshot = await db.ref("users").orderByChild("email").equalTo(email).limitToFirst(1).once("value");
        const usersData = usersSnapshot.val();
        
        let uid = null;
        if (usersData) {
            uid = Object.keys(usersData)[0];
        }
        
        if(!uid) {
            return createProfilePhotoHTML(safePhotoUrl, size);
        }
        
        // 활성화된 장식 로드
        const snapshot = await db.ref("users/" + uid + "/activeDecorations").once("value");
        const activeDecorations = snapshot.val() || [];
        
        if(activeDecorations.length === 0) {
            return createProfilePhotoHTML(safePhotoUrl, size);
        }

        // --- 장식 HTML 생성 로직 ---
        let decorationHTML = "";
        
        // (예시) 산타 모자
        if(activeDecorations.includes('santa_hat')) {
            decorationHTML += `
                <div style="position:absolute; top:-${size/3}px; left:50%; transform:translateX(-50%); width:${size}px; pointer-events:none; z-index:10;">
                    <img src="./assets/items/santa_hat.png" style="width:100%; height:auto; filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3));" onerror="this.style.display='none'">
                </div>
            `;
        }
        
        // (예시) 크리스마스 프레임
        let borderStyle = "";
        if(activeDecorations.includes('christmas_wreath')) {
            decorationHTML += `
                <div style="position:absolute; top:-10%; left:-10%; width:120%; height:120%; pointer-events:none; z-index:11;">
                    <img src="./assets/items/wreath_frame.png" style="width:100%; height:100%;" onerror="this.style.display='none'">
                </div>
            `;
        } else if(activeDecorations.includes('rudolph_nose')) {
            // 루돌프 코 (중앙)
            decorationHTML += `
                <div style="position:absolute; top:40%; left:50%; transform:translate(-50%, -50%); width:${size/3}px; height:${size/3}px; background:red; border-radius:50%; box-shadow:inset -2px -2px 5px rgba(0,0,0,0.3); z-index:12;"></div>
            `;
        }

        // 기본 프로필 HTML 생성
        const baseHTML = createProfilePhotoHTML(safePhotoUrl, size);

        // 장식과 함께 반환 (wrapper로 감쌈)
        return `
            <div style="position:relative; display:inline-block; width:${size}px; height:${size}px;">
                ${decorationHTML}
                ${baseHTML}
            </div>
        `;

    } catch(error) {
        console.error("프로필 장식 로드 실패:", error);
        return createProfilePhotoHTML(safePhotoUrl, size);
    }
}

// ===== profile-photo-system.js (전면 개편됨) =====

// 1. 데이터 캐시 저장소 (중복 DB 조회 방지)
const userDecorationCache = {};

/**
 * [동기 함수] 화면에 즉시 보여질 '임시' 프로필 HTML 생성
 * 이 함수는 await 없이 즉시 HTML 문자열을 반환하므로 화면이 밀리지 않습니다.
 */
function getProfilePlaceholder(photoUrl, size, email) {
    const safePhoto = photoUrl || '';
    const safeEmail = email || '';
    
    // 기본 이미지를 먼저 만듭니다.
    const baseHTML = createProfilePhotoHTML(safePhoto, size);
    
    // 식별자 클래스(needs-decoration)와 데이터를 심어둡니다.
    return `
        <div class="needs-decoration" 
             data-photo="${safePhoto}" 
             data-size="${size}" 
             data-email="${safeEmail}" 
             style="display:inline-block; vertical-align:middle; position:relative; width:${size}px; height:${size}px;">
            ${baseHTML}
        </div>
    `;
}

/**
 * [핵심 함수] 화면에 있는 모든 'needs-decoration' 요소를 찾아 장식을 입힙니다.
 * 뉴스 피드 렌더링 직후에 반드시 호출해야 합니다.
 */
window.loadAllProfileDecorations = async function() {
    const elements = document.querySelectorAll('.needs-decoration');
    
    // 1. 화면에 있는 모든 이메일 수집
    const emailsToFetch = new Set();
    elements.forEach(el => {
        if(el.dataset.processed === "true") return;
        const email = el.dataset.email;
        if(email && email !== 'undefined' && email !== 'null' && !userDecorationCache[email]) {
            emailsToFetch.add(email);
        }
    });

    // 2. 캐시에 없는 데이터 일괄 로드 (병렬 처리 최적화)
    if(emailsToFetch.size > 0) {
        // 원래는 한 번에 가져오는 게 좋지만, Firebase 구조상 개별 쿼리 병렬 실행
        const promises = Array.from(emailsToFetch).map(async (email) => {
            try {
                // 이메일로 UID 찾기
                const userSnap = await db.ref("users").orderByChild("email").equalTo(email).limitToFirst(1).once("value");
                const userData = userSnap.val();
                
                if (userData) {
                    const uid = Object.keys(userData)[0];
                    const decorations = userData[uid].activeDecorations || [];
                    // 캐시에 저장: { uid: "...", decorations: [...] }
                    userDecorationCache[email] = { uid: uid, decorations: decorations };
                } else {
                    userDecorationCache[email] = { uid: null, decorations: [] }; // 유저 없음
                }
            } catch (e) {
                console.warn(`유저 정보 로드 실패 (${email}):`, e);
                userDecorationCache[email] = { uid: null, decorations: [] };
            }
        });
        await Promise.all(promises);
    }

    // 3. 각 요소에 장식 적용
    elements.forEach(el => {
        if(el.dataset.processed === "true") return;
        
        const email = el.dataset.email;
        const size = parseInt(el.dataset.size);
        const photo = el.dataset.photo;
        
        // 캐시 데이터 확인
        const cachedData = userDecorationCache[email];
        
        // 장식이 있으면 HTML 교체
        if (cachedData && cachedData.decorations && cachedData.decorations.length > 0) {
            const decoratedHTML = generateDecorationHTML(photo, size, cachedData.decorations);
            el.innerHTML = decoratedHTML;
        }
        
        // 처리 완료 표시 (중복 실행 방지)
        el.dataset.processed = "true";
    });
};

/**
 * [내부 함수] 실제 장식 HTML 조립 로직
 */
function generateDecorationHTML(photoUrl, size, decorations) {
    let decorationHTML = "";
    
    // --- 장식 아이템 정의 ---
    
    // 1. 산타 모자
    if(decorations.includes('santa_hat')) {
        decorationHTML += `
            <div style="position:absolute; top:-${size*0.4}px; left:50%; transform:translateX(-50%); width:${size}px; pointer-events:none; z-index:10;">
                <img src="./assets/items/santa_hat.png" style="width:100%; height:auto; filter:drop-shadow(0 2px 2px rgba(0,0,0,0.3));" onerror="this.style.display='none'">
            </div>
        `;
    }
    
    // 2. 크리스마스 리스 (프레임)
    if(decorations.includes('christmas_wreath')) {
        decorationHTML += `
            <div style="position:absolute; top:-12%; left:-12%; width:124%; height:124%; pointer-events:none; z-index:11;">
                <img src="./assets/items/wreath_frame.png" style="width:100%; height:100%;" onerror="this.style.display='none'">
            </div>
        `;
    }

    // 3. 루돌프 코
    if(decorations.includes('rudolph_nose')) {
        decorationHTML += `
            <div style="position:absolute; top:45%; left:50%; transform:translate(-50%, -50%); width:${size*0.25}px; height:${size*0.25}px; background:red; border-radius:50%; box-shadow:inset -1px -1px 2px rgba(0,0,0,0.5); z-index:12;"></div>
        `;
    }

    // 기본 사진
    const baseHTML = createProfilePhotoHTML(photoUrl, size);

    // 합쳐서 반환
    return `
        <div style="position:relative; width:${size}px; height:${size}px;">
            ${decorationHTML}
            ${baseHTML}
        </div>
    `;
}

// [기본 함수] 단순 이미지 태그 생성
function createProfilePhotoHTML(photoUrl, size = 32) {
    if(photoUrl && photoUrl !== 'null' && photoUrl !== 'undefined') {
        return `<img src="${photoUrl}" 
                     style="width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; border:1px solid #ddd;"
                     onerror="this.src='https://via.placeholder.com/${size}?text=User'">`;
    } else {
        return `<div style="width:${size}px; height:${size}px; border-radius:50%; background:#f1f3f4; display:flex; align-items:center; justify-content:center; border:1px solid #ddd;">
                    <i class="fas fa-user" style="font-size:${size*0.6}px; color:#9aa0a6;"></i>
                </div>`;
    }
}

// 4. [핵심 함수] 화면에 렌더링된 요소들을 찾아 장식을 입히는 함수
// ⭐ 사용자님이 질문하신 이 함수는 여기에 위치합니다.
window.loadAllProfileDecorations = function() {
    const elements = document.querySelectorAll('.needs-decoration');
    
    elements.forEach(async (el) => {
        if(el.dataset.processed === "true") return; // 이미 처리했으면 패스
        
        const photo = el.dataset.photo;
        const size = parseInt(el.dataset.size);
        const email = el.dataset.email;
        
        if(email && email !== 'undefined' && email !== 'null') {
            try {
                // 비동기로 진짜 HTML(장식 포함) 가져오기
                const decoratedHTML = await createProfilePhotoWithDecorations(photo, size, email);
                el.innerHTML = decoratedHTML; // 교체
                el.dataset.processed = "true"; // 처리 완료 표시
            } catch(e) {
                console.warn("장식 로드 실패:", e);
            }
        }
    });
};

console.log("✅ 프로필 사진 시스템 로드 완료 (수정됨)");
