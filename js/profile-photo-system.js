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

// ===== 프로필 사진 가져오기 및 표시 함수 =====

// 사용자 이메일로 프로필 사진 가져오기
async function getUserProfilePhoto(email) {
    if(!email) return null;
    
    try {
        // 모든 사용자 검색
        const usersSnapshot = await db.ref("users").once("value");
        const usersData = usersSnapshot.val() || {};
        
        // 이메일로 사용자 찾기
        for(const [uid, userData] of Object.entries(usersData)) {
            if(userData.email === email && userData.profilePhoto) {
                return userData.profilePhoto;
            }
        }
        
        return null;
    } catch(error) {
        console.error("프로필 사진 조회 실패:", error);
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

// ===== 프로필 사진이 포함된 댓글 로드 (대댓글 + 수정 기능 포함) =====
async function loadCommentsWithProfile(id) {
    const currentUser = getNickname();
    const currentEmail = getUserEmail();
    
    try {
        const snapshot = await db.ref("comments/" + id).once("value");
        const val = snapshot.val() || {};
        const commentsList = Object.entries(val).sort((a,b) => new Date(b[1].timestamp) - new Date(a[1].timestamp));
        
        const root = document.getElementById("comments");
        const countEl = document.getElementById("commentCount");
        
        // 총 댓글 수 계산 (댓글 + 대댓글)
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
        
        // 프로필 사진 미리 로드
        const commentPhotos = await Promise.all(
            displayComments.map(([_, comment]) => getUserProfilePhoto(comment.authorEmail))
        );

        root.innerHTML = await Promise.all(displayComments.map(async ([commentId, comment], idx) => {
            const isMyComment = isLoggedIn() && ((comment.authorEmail === currentEmail) || isAdmin());
            const commentPhotoHTML = createProfilePhotoHTML(commentPhotos[idx], 32, comment.author);
            
            // 대댓글 렌더링
            let repliesHTML = '';
            if (comment.replies) {
                const replies = Object.entries(comment.replies).sort((a, b) => 
                    new Date(a[1].timestamp) - new Date(b[1].timestamp)
                );
                
                // 대댓글 프로필 사진 로드
                const replyPhotos = await Promise.all(
                    replies.map(([_, reply]) => getUserProfilePhoto(reply.authorEmail))
                );
                
                repliesHTML = replies.map(([replyId, reply], replyIdx) => {
                    const isMyReply = isLoggedIn() && ((reply.authorEmail === currentEmail) || isAdmin());
                    const replyPhotoHTML = createProfilePhotoHTML(replyPhotos[replyIdx], 24, reply.author);
                    
                    return `
                        <div class="reply-item" id="reply-${replyId}">
                            <div style="display:flex; align-items:start; gap:8px;">
                                ${replyPhotoHTML}
                                <div style="flex:1;">
                                    <div class="reply-header">
                                        <span class="reply-author">↳ ${reply.author}</span>
                                        <span class="reply-time">${reply.timestamp}</span>
                                    </div>
                                    
                                    <!-- 대댓글 내용 표시 -->
                                    <div class="reply-content" id="replyContent-${replyId}">${reply.text}</div>
                                    
                                    <!-- 대댓글 수정 폼 (숨김) -->
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
                }).join('');
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
                            
                            <!-- 댓글 내용 표시 -->
                            <div class="comment-body" id="commentContent-${commentId}">${comment.text}</div>
                            
                            <!-- 댓글 수정 폼 (숨김) -->
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

                    ${repliesHTML ? `<div class="replies-container">${repliesHTML}</div>` : ''}

                    <div id="replyForm-${commentId}" class="reply-input-area" style="display:none;">
                        <input type="text" id="replyInput-${commentId}" class="reply-input" placeholder="답글을 입력하세요..." onkeypress="if(event.key==='Enter') submitReply('${id}', '${commentId}')">
                        <button onclick="submitReply('${id}', '${commentId}')" class="btn-reply-submit"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
            `;
        })).then(results => results.join(''));

        const loadMoreBtn = document.getElementById("loadMoreComments");
        if (endIdx < commentsList.length) {
            loadMoreBtn.innerHTML = `<button onclick="loadMoreComments()" class="btn-secondary btn-block">댓글 더보기 (${commentsList.length - endIdx}+)</button>`;
        } else {
            loadMoreBtn.innerHTML = "";
        }
        
    } catch(error) {
        console.error("❌ 댓글 로드 오류:", error);
        document.getElementById("comments").innerHTML = `
            <p style='color:#dc3545;text-align:center;padding:30px;'>댓글을 불러오는데 실패했습니다.</p>
        `;
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

console.log("✅ 프로필 사진 시스템 로드 완료");
