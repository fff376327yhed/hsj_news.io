// ===== script2.js - 완전 개선 버전 =====

console.log("🔄 script2.js 로딩 시작...");

// ✅ 이미지 파일 매직 바이트 검증 함수들
function readMagicBytes(file, byteCount) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = (e) => resolve(new Uint8Array(e.target.result));
        reader.readAsArrayBuffer(file.slice(0, byteCount));
    });
}

function checkImageSignature(bytes, mimeType) {
    if (mimeType === 'image/webp') {
        return bytes[0] === 0x52 && bytes[1] === 0x49 &&
               bytes[8] === 0x57 && bytes[9] === 0x45 &&
               bytes[10] === 0x42 && bytes[11] === 0x50;
    }
    const signatures = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/jpg':  [0xFF, 0xD8, 0xFF],
        'image/png':  [0x89, 0x50, 0x4E, 0x47],
        'image/gif':  [0x47, 0x49, 0x46, 0x38]
    };
    const sig = signatures[mimeType];
    if (!sig) return false;
    return sig.every((byte, i) => bytes[i] === byte);
}

async function validateImageFile(file) {
    const errors = [];
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    // ✅ 파일 크기 제한 없음

    if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push('JPG, PNG, GIF, WEBP 형식만 허용됩니다.');
    }
    if (errors.length === 0) {
        const bytes = await readMagicBytes(file, 12);
        if (!checkImageSignature(bytes, file.type)) {
            errors.push('올바른 이미지 파일이 아닙니다. (파일 형식 위조 감지)');
        }
    }
    return errors;
}

// ===== 1. 프로필 사진 변경 기능 =====

window.openProfilePhotoModal = function() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    let modal = document.getElementById("profilePhotoModal");
    
    if(!modal) {
        const modalHTML = `
            <div id="profilePhotoModal" class="modal">
                <div class="modal-content" style="max-width:500px;">
                    <div class="modal-header">
                        <h3 style="color:#c62828;">📷 프로필 사진 변경</h3>
                        <button onclick="closeProfilePhotoModal()" class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div style="text-align:center; margin:20px 0;">
                        <div id="profilePhotoPreviewContainer" style="margin-bottom:15px;">
                            <div style="width:150px; height:150px; border-radius:50%; margin:0 auto; background:#f1f3f4; display:flex; align-items:center; justify-content:center; border:3px solid #dadce0;">
                                <i class="fas fa-user" style="font-size:60px; color:#9aa0a6;"></i>
                            </div>
                        </div>
                        
                        <div class="upload-area" style="border:2px dashed #ddd; padding:30px; border-radius:8px; cursor:pointer; background:#f8f9fa; margin-bottom:20px;" onclick="document.getElementById('profilePhotoInputModal').click()">
                            <i class="fas fa-cloud-upload-alt" style="font-size:40px; color:#868e96; margin-bottom:10px; display:block;"></i>
                            <p style="color:#868e96; margin:0;">클릭하여 사진 선택</p>
                        </div>
                        <input type="file" id="profilePhotoInputModal" accept="image/*" style="display:none;">
                    </div>
                    
                    <div style="display:flex; gap:10px;">
                        <button onclick="saveProfilePhoto()" class="btn-primary btn-block">저장</button>
                        <button onclick="closeProfilePhotoModal()" class="btn-secondary btn-block">취소</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        modal = document.getElementById("profilePhotoModal");
        
        document.getElementById('profilePhotoInputModal').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('profilePhotoPreviewContainer').innerHTML = 
                        `<img src="${event.target.result}" style="width:150px; height:150px; border-radius:50%; object-fit:cover; border:3px solid #dadce0;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    modal.classList.add("active");
    loadCurrentProfilePhotoInModal();
};

window.closeProfilePhotoModal = function() {
    const modal = document.getElementById("profilePhotoModal");
    if(modal) modal.classList.remove("active");
};

async function loadCurrentProfilePhotoInModal() {
    const user = auth.currentUser;
    if(!user) return;
    
    try {
        const snapshot = await db.ref("users/" + user.uid + "/profilePhoto").once("value");
        const photoUrl = snapshot.val();
        
        if(photoUrl) {
            const container = document.getElementById('profilePhotoPreviewContainer');
            if(container) {
                container.innerHTML = `<img src="${photoUrl}" style="width:150px; height:150px; border-radius:50%; object-fit:cover; border:3px solid #dadce0;">`;
            }
        }
    } catch(error) {
        console.error("프로필 사진 로드 실패:", error);
    }
}

window.saveProfilePhoto = async function() {
    const user = auth.currentUser;
    if (!user) {
        alert("로그인이 필요합니다!");
        return;
    }

    const fileInput = document.getElementById('profilePhotoInputModal');
    const file = fileInput ? fileInput.files[0] : null;

    if (!file) {
        alert("사진을 선택해주세요!");
        return;
    }

    // ✅ 파일 검증 추가
    const errors = await validateImageFile(file);
    if (errors.length > 0) {
        alert('❌ 이미지 오류:\n' + errors.join('\n'));
        if (fileInput) fileInput.value = '';
        return;
    }

    showLoadingIndicator("사진 업로드 중...");

    try {
        // ✅ 프로필 사진 압축 후 imgBB 업로드 → URL 저장 (DB 용량 절약)
        const photoData = await compressImageToBase64(file, 200, 0.92);

        await db.ref("users/" + user.uid).update({
            profilePhoto: photoData,
            photoUpdatedAt: Date.now()
        });

        if (window.profilePhotoCache) {
            window.profilePhotoCache.set(user.email, photoData);
        }

        hideLoadingIndicator();
        closeProfilePhotoModal();
        alert("프로필 사진이 변경되었습니다!");

        if (typeof updateSettings === 'function') updateSettings();
        if (typeof updateHeaderProfileButton === 'function') updateHeaderProfileButton(user);

    } catch (error) {
        hideLoadingIndicator();
        console.error("업로드 실패:", error);
        alert("업로드 실패: " + error.message);
    }
};

console.log("✅ 프로필 사진 변경 기능 로드 완료");

// ===== 2. 이미지 전체보기 + 확대/축소 =====

// ===== 2. 이미지 전체보기 + 확대/축소 + 휠 확대 =====

// ❌ 기존 코드 (다운로드 버튼 없음, _openImageModalSrc 저장 없음)

// ✅ 수정 후 코드
window._openImageModalSrc = null; // 현재 열린 이미지 src 전역 저장

window.openImageModal = function(imageSrc) {
    window._openImageModalSrc = imageSrc; // ✅ 다운로드를 위해 저장
    const existingModal = document.getElementById('imageViewModal');
    if(existingModal) existingModal.remove();
    
    const modalHTML = `
        <div id="imageViewModal" class="modal active" style="z-index:10000; background:rgba(0,0,0,0.95);">
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:20px; overflow:hidden;">
                <div id="imageContainer" style="position:relative; width:100%; height:100%; overflow:hidden; cursor:grab;">
                    <button onclick="closeImageModal()" style="position:fixed; top:20px; right:20px; background:rgba(255,255,255,0.9); color:#333; border:none; border-radius:50%; width:50px; height:50px; cursor:pointer; font-size:24px; z-index:10002; box-shadow:0 2px 12px rgba(0,0,0,0.5); font-weight:bold; display:flex; align-items:center; justify-content:center;">
                        ×
                    </button>
                    
                    <!-- ✅ 수정: 다운로드 버튼 추가 -->
                    <div style="position:fixed; bottom:20px; left:50%; transform:translateX(-50%); display:flex; gap:10px; z-index:10002;">
                        <button onclick="zoomImage(1.2)" class="image-control-btn">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button onclick="zoomImage(0.8)" class="image-control-btn">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button onclick="resetZoom()" class="image-control-btn">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button onclick="downloadModalImage()" class="image-control-btn" title="다운로드" style="background:rgba(198,40,40,0.9);color:white;">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                    
                    <div id="imageWrapper" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); transition:transform 0.1s ease-out;">
                        <img id="modalImageElement" src="${imageSrc}" style="display:block; max-width:90vw; max-height:90vh; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,0.5); user-select:none; pointer-events:none;">
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .image-control-btn {
                background: rgba(255,255,255,0.9);
                color: #333;
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                cursor: pointer;
                font-size: 18px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            .image-control-btn:hover { background: white; transform: scale(1.1); }
            .image-control-btn:active { transform: scale(0.95); }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 드래그 및 확대/축소 기능 (기존과 동일)
    const container = document.getElementById('imageContainer');
    const wrapper = document.getElementById('imageWrapper');
    
    let scale = 1, translateX = 0, translateY = 0;
    let isDragging = false, startX = 0, startY = 0;
    
    function applyTransform() {
        wrapper.style.transform = `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(${scale})`;
    }
    
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = scale * delta;
        if (newScale >= 0.5 && newScale <= 5) { scale = newScale; applyTransform(); }
    }, { passive: false });
    
    container.addEventListener('mousedown', (e) => {
        isDragging = true; container.style.cursor = 'grabbing';
        startX = e.clientX - translateX; startY = e.clientY - translateY;
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX; translateY = e.clientY - startY;
        wrapper.style.transition = 'none'; applyTransform();
    });
    document.addEventListener('mouseup', () => {
        if (isDragging) { isDragging = false; container.style.cursor = 'grab'; wrapper.style.transition = 'transform 0.1s ease-out'; }
    });
    
    let initialDistance = 0, initialScale = 1;
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) { isDragging = true; startX = e.touches[0].clientX - translateX; startY = e.touches[0].clientY - translateY; }
        else if (e.touches.length === 2) { isDragging = false; initialDistance = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY); initialScale = scale; }
    });
    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) { translateX = e.touches[0].clientX - startX; translateY = e.touches[0].clientY - startY; wrapper.style.transition = 'none'; applyTransform(); }
        else if (e.touches.length === 2) { const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY); const ns = initialScale * (d / initialDistance); if (ns >= 0.5 && ns <= 5) { scale = ns; applyTransform(); } }
    }, { passive: false });
    container.addEventListener('touchend', () => { isDragging = false; wrapper.style.transition = 'transform 0.1s ease-out'; });
    
    const handleEsc = (e) => { if (e.key === 'Escape') { closeImageModal(); document.removeEventListener('keydown', handleEsc); } };
    document.addEventListener('keydown', handleEsc);
    
    window.currentImageScale = {
        get scale() { return scale; },
        set scale(val) { scale = val; applyTransform(); },
        reset() { scale = 1; translateX = 0; translateY = 0; wrapper.style.transition = 'transform 0.3s ease'; applyTransform(); setTimeout(() => { wrapper.style.transition = 'transform 0.1s ease-out'; }, 300); }
    };
};

// ✅ 신규 추가: 댓글/기사 이미지 다운로드 함수
window.downloadModalImage = async function() {
    const src = window._openImageModalSrc;
    if (!src) return;
    try {
        // 확장자 판별
        const ext = src.startsWith('data:image/png')  ? 'png'
                  : src.startsWith('data:image/gif')  ? 'gif'
                  : src.startsWith('data:image/webp') ? 'webp'
                  : src.startsWith('data:')           ? 'jpg'
                  : (src.split('.').pop().split('?')[0].toLowerCase() || 'jpg');

        let blobUrl;
        if (src.startsWith('data:')) {
            // base64 → Blob 변환
            const [header, b64] = src.split(',');
            const mime = header.match(/:(.*?);/)[1];
            const binary = atob(b64);
            const arr = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
            blobUrl = URL.createObjectURL(new Blob([arr], { type: mime }));
        } else {
            // 외부 URL (imgBB 등) → fetch → Blob
            const res = await fetch(src);
            if (!res.ok) throw new Error('이미지를 가져올 수 없습니다.');
            const blob = await res.blob();
            blobUrl = URL.createObjectURL(blob);
        }

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `image_${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch(e) {
        alert('❌ 다운로드 실패: ' + e.message);
    }
};

window.zoomImage = function(factor) {
    if (!window.currentImageScale) return;
    
    const newScale = window.currentImageScale.scale * factor;
    if (newScale >= 0.5 && newScale <= 5) {
        window.currentImageScale.scale = newScale;
    }
};

window.resetZoom = function() {
    if (window.currentImageScale) {
        window.currentImageScale.reset();
    }
};

window.closeImageModal = function() {
    const modal = document.getElementById('imageViewModal');
    if(modal) modal.remove();
};

let currentScale = 1;

window.zoomImage = function(factor) {
    const img = document.getElementById('modalImageElement');
    if(!img) return;
    
    currentScale *= factor;
    img.style.transform = `scale(${currentScale})`;
};

window.resetZoom = function() {
    const img = document.getElementById('modalImageElement');
    if(!img) return;
    
    currentScale = 1;
    img.style.transform = 'scale(1)';
    
    const windowWidth = window.innerWidth * 0.9;
    const windowHeight = window.innerHeight * 0.9;
    
    img.style.maxWidth = windowWidth + 'px';
    img.style.maxHeight = windowHeight + 'px';
};

// 기사 상세보기에서 이미지 클릭 이벤트
function addImageClickHandlersToArticle() {
    // ✅ 더 긴 대기 시간과 재시도 로직 추가
    let attempts = 0;
    const maxAttempts = 10;
    
    const attachHandlers = () => {
        const articleDetail = document.getElementById("articleDetail");
        if(!articleDetail) {
            if(attempts < maxAttempts) {
                attempts++;
                setTimeout(attachHandlers, 200);
            }
            return;
        }
        
        const images = articleDetail.querySelectorAll('img');
        if(images.length === 0 && attempts < maxAttempts) {
            attempts++;
            setTimeout(attachHandlers, 200);
            return;
        }
        
        images.forEach(img => {
            // ✅ 썸네일 이미지는 제외
            if(img.classList.contains('article-thumbnail')) return;
            
            img.style.cursor = 'pointer';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            
            // ✅ 기존 이벤트 리스너 제거
            const newImg = img.cloneNode(true);
            img.parentNode.replaceChild(newImg, img);
            
            // ✅ 새로운 이벤트 리스너 추가
            newImg.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openImageModal(this.src);
            });
        });
        
        console.log(`✅ ${images.length}개 이미지에 클릭 핸들러 추가됨`);
    };
    
    attachHandlers();
}

// ✅ showArticleDetail 오버라이드 개선
if(typeof window.originalShowArticleDetail === 'undefined') {
    window.originalShowArticleDetail = window.showArticleDetail;
    
    window.showArticleDetail = function(articleId) {
        // 원본 함수 실행
        const result = window.originalShowArticleDetail(articleId);
        
        // Promise인 경우 처리
        if(result && typeof result.then === 'function') {
            result.then(() => {
                setTimeout(() => addImageClickHandlersToArticle(), 500);
            });
        } else {
            setTimeout(() => addImageClickHandlersToArticle(), 500);
        }
        
        return result;
    };
}

console.log("✅ 이미지 전체보기 기능 로드 완료");

// ===== 3. 기사 고정 관리 (관리자 전용) =====

window.showPinnedArticleManager = async function() {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    if(!isAdmin()) {
        alert("🚫 이 기능은 관리자만 사용할 수 있습니다!");
        return;
    }
    
    showLoadingIndicator("고정 기사 불러오는 중...");
    
    try {
        const [articlesSnapshot, pinnedSnapshot] = await Promise.all([
            db.ref("articles").once("value"),
            db.ref("pinnedArticles").once("value")
        ]);
        
        const articlesData = articlesSnapshot.val() || {};
        const pinnedData = pinnedSnapshot.val() || {};
        
        const articles = Object.values(articlesData);
        
        const categories = ['자유게시판', '논란', '연애', '정아영', '게넥도', '게임', '마크'];
        const articlesByCategory = {};
        
        categories.forEach(cat => {
            articlesByCategory[cat] = articles.filter(a => a.category === cat);
        });
        
        hideLoadingIndicator();
        
        let modal = document.getElementById("pinnedArticleModal");
        if(!modal) {
            const modalHTML = `
                <div id="pinnedArticleModal" class="modal">
                    <div class="modal-content" style="max-width:800px; max-height:80vh; overflow-y:auto;">
                        <div class="modal-header">
                            <h3 style="color:#c62828;">📌 기사 고정 관리 (관리자 전용)</h3>
                            <button onclick="closePinnedArticleModal()" class="modal-close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div id="pinnedArticleContent"></div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            modal = document.getElementById("pinnedArticleModal");
        }
        
        let contentHTML = '';
        
        categories.forEach(category => {
            const categoryArticles = articlesByCategory[category] || [];
            
            contentHTML += `
                <div style="margin-bottom:30px; border:1px solid #e0e0e0; border-radius:8px; padding:15px;">
                    <h4 style="color:#1976d2; margin-bottom:15px; border-bottom:2px solid #1976d2; padding-bottom:8px;">
                        ${category} (${categoryArticles.length}개)
                    </h4>
            `;
            
            if(categoryArticles.length === 0) {
                contentHTML += '<p style="color:#868e96; text-align:center; padding:20px;">기사가 없습니다.</p>';
            } else {
                categoryArticles.forEach(article => {
                    const isPinned = pinnedData[article.id] ? true : false;
                    
                    contentHTML += `
                        <div style="background:#f8f9fa; padding:12px; margin-bottom:8px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                            <div style="flex:1;">
                                <strong>${article.title}</strong>
                                <div style="font-size:12px; color:#6c757d; margin-top:4px;">
                                    ${article.author} · ${article.date}
                                </div>
                            </div>
                            <button onclick="togglePinArticle('${article.id}', ${isPinned})" 
                                    class="btn-${isPinned ? 'danger' : 'primary'}" 
                                    style="padding:6px 12px; font-size:12px; white-space:nowrap;">
                                ${isPinned ? '📌 고정 해제' : '📌 고정'}
                            </button>
                        </div>
                    `;
                });
            }
            
            contentHTML += '</div>';
        });
        
        const contentElement = document.getElementById("pinnedArticleContent");
        if(contentElement) {
            contentElement.innerHTML = contentHTML;
        }
        
        modal.classList.add("active");
        
    } catch(error) {
        hideLoadingIndicator();
        console.error("기사 고정 관리 오류:", error);
        alert("오류가 발생했습니다: " + error.message);
    }
};

window.closePinnedArticleModal = function() {
    const modal = document.getElementById("pinnedArticleModal");
    if(modal) modal.classList.remove("active");
};

window.togglePinArticle = async function(articleId, isPinned) {
    if(!isAdmin()) {
        alert("🚫 관리자 권한이 필요합니다!");
        return;
    }
    
    try {
        if(isPinned) {
            await db.ref("pinnedArticles/" + articleId).remove();
            alert("고정이 해제되었습니다.");
        } else {
            await db.ref("pinnedArticles/" + articleId).set({
                pinnedAt: Date.now()
            });
            alert("기사가 고정되었습니다.");
        }
        
        showPinnedArticleManager();
        
        if(document.getElementById("articlesSection")?.classList.contains("active")) {
            if(typeof renderArticles === 'function') {
                renderArticles();
            }
        }
        
    } catch(error) {
        console.error("고정 토글 실패:", error);
        alert("오류가 발생했습니다: " + error.message);
    }
};

console.log("✅ 기사 고정 관리 기능 로드 완료");

// ===== 4. 임시저장 기능 (Quill 에디터 Ready 이벤트 사용) =====

let draftSaveEnabled = false;

// Quill 에디터 준비 감지
window.addEventListener('quillEditorReady', function() {
    console.log("✅ Quill 에디터 준비 완료 - 임시저장 활성화");
    draftSaveEnabled = true;
});

// 임시 저장 함수
function saveDraft() {
    if(!draftSaveEnabled) {
        return;
    }
    
    const writeSection = document.getElementById('writeSection');
    if(!writeSection || !writeSection.classList.contains('active')) {
        return;
    }
    
    // Quill 에디터 확인 (여러 방법 시도)
    const quillEditor = window.quillEditor || window.quill;
    
    if(!quillEditor || !quillEditor.root) {
        console.warn("⚠️ Quill 에디터를 찾을 수 없습니다");
        return;
    }
    
    try {
        // Quill에서 HTML 내용 가져오기
        const editorContent = quillEditor.root.innerHTML;
        
        const draft = {
            category: document.getElementById('category')?.value || '자유게시판',
            title: document.getElementById('title')?.value || '',
            summary: document.getElementById('summary')?.value || '',
            content: editorContent || '', // ✅ Quill HTML 내용 저장
            thumbnail: '',
            savedAt: Date.now()
        };
        
        const thumbnailEl = document.getElementById('thumbnailPreview');
        if(thumbnailEl && thumbnailEl.src && !thumbnailEl.src.includes('data:,')) {
            draft.thumbnail = thumbnailEl.src;
        }
        
        // 내용이 있는지 확인 (빈 Quill은 <p><br></p>)
        const hasContent = draft.title || draft.summary || 
                          (draft.content && 
                           draft.content.trim() !== '' && 
                           draft.content.trim() !== '<p><br></p>' &&
                           draft.content.trim() !== '<p></p>');
        
        if(hasContent) {
            localStorage.setItem('draft_article', JSON.stringify(draft));
            console.log("💾 임시저장 완료 (내용 길이:", draft.content.length, ")");
        }
    } catch(error) {
        console.error("❌ 임시저장 오류:", error);
    }
}

// 임시 저장 불러오기
function loadDraft() {
    const draftData = localStorage.getItem('draft_article');
    if(!draftData) return false;
    
    try {
        const draft = JSON.parse(draftData);
        
        // 24시간 이상 지난 임시저장은 삭제
        if(Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) {
            localStorage.removeItem('draft_article');
            return false;
        }
        
        // ✅ 수정: 여기서는 폼에 데이터를 로드하지 않고, 단순히 임시저장 존재 여부만 확인
        // 실제 복원은 사용자가 confirm에서 "확인"을 누른 후에만 수행
        
        return true; // 임시저장 데이터가 존재함을 알림
        
    } catch(error) {
        console.error("❌ 임시저장 확인 실패:", error);
        localStorage.removeItem('draft_article');
        return false;
    }
}

// ✅ 새로운 함수 추가: 실제 임시저장 데이터 복원
function restoreDraft() {
    const draftData = localStorage.getItem('draft_article');
    if(!draftData) return;
    
    try {
        const draft = JSON.parse(draftData);
        
        const categoryEl = document.getElementById('category');
        const titleEl = document.getElementById('title');
        const summaryEl = document.getElementById('summary');
        
        if(draft.category && categoryEl) categoryEl.value = draft.category;
        if(draft.title && titleEl) titleEl.value = draft.title;
        if(draft.summary && summaryEl) summaryEl.value = draft.summary;
        
        // Quill 에디터에 내용 로드
        let attempts = 0;
        const maxAttempts = 30;
        
        const loadToEditor = () => {
            const quillEditor = window.quillEditor || window.quill;
            
            if(quillEditor && quillEditor.root) {
                quillEditor.root.innerHTML = draft.content;
                console.log("✅ 임시저장 복원 완료 (내용 길이:", draft.content.length, ")");
            } else if(attempts < maxAttempts) {
                attempts++;
                setTimeout(loadToEditor, 100);
            } else {
                console.error("❌ Quill 에디터 초기화 대기 시간 초과");
            }
        };
        
        loadToEditor();
        
        // 썸네일 복원
        if(draft.thumbnail) {
            const preview = document.getElementById('thumbnailPreview');
            const uploadText = document.getElementById('uploadText');
            if(preview && uploadText) {
                preview.src = draft.thumbnail;
                preview.style.display = 'block';
                uploadText.innerHTML = '<i class="fas fa-check"></i><p>임시저장된 이미지</p>';
            }
        }
        
    } catch(error) {
        console.error("❌ 임시저장 복원 실패:", error);
        localStorage.removeItem('draft_article');
    }
}

// showWritePage 후킹 — 임시저장 복원 프롬프트 제거됨

// 자동 임시저장 (10초마다)
setInterval(() => {
    const writeSection = document.getElementById('writeSection');
    if(writeSection?.classList.contains('active')) {
        saveDraft();
    }
}, 10000);

// 페이지 이탈 시
window.addEventListener('beforeunload', () => {
    const writeSection = document.getElementById('writeSection');
    if(writeSection?.classList.contains('active')) {
        saveDraft();
    }
});

// 페이지 이동 시
if(typeof window.originalHideAll === 'undefined') {
    window.originalHideAll = window.hideAll;
    window.hideAll = function() {
        const writeSection = document.getElementById('writeSection');
        if(writeSection?.classList.contains('active')) {
            saveDraft();
        }
        if(typeof window.originalHideAll === 'function') {
            window.originalHideAll();
        }
    };
}

console.log("✅ 임시저장 기능 로드 완료");

console.log("✅ 기사 수정 기능 로드 완료");

// ===== 6. 로그인 UX 개선 =====

window.showLoginRequired = function(feature = "이 기능") {
    if(confirm(`🔒 ${feature}은(는) 로그인이 필요합니다.\n\n로그인하시겠습니까?`)) {
        googleLogin();
    }
};

console.log("✅ 로그인 UX 개선 완료");

// ===== 관리자 수동 알림 전송 시스템 =====
// script2.js 맨 끝에 추가하세요

console.log("📢 관리자 알림 전송 시스템 로딩...");

// ─────────────────────────────────────────
// 1. 관리자 알림 전송 모달 열기
// ─────────────────────────────────────────
// ✅ 교체
window.showAdminNotificationSender = async function () {
    if (!(await isAdminAsync())) {
        alert('🚫 관리자 권한이 필요합니다!');
        return;
    }

    showLoadingIndicator('사용자 목록 불러오는 중...');

    try {
        const usersSnapshot = await db.ref('users').once('value');
        const usersData = usersSnapshot.val() || {};

        // FCM 토큰이 있는 유저만
        const eligibleUsers = Object.entries(usersData)
            .filter(([uid, data]) => data.fcmTokens && data.notificationsEnabled !== false)
            .map(([uid, data]) => ({ uid, email: data.email || uid }));

        hideLoadingIndicator();

        const existingModal = document.getElementById('adminNotifSenderModal');
        if (existingModal) existingModal.remove();

        // ✅ 체크박스 목록으로 변경 (다중 선택 지원)
        const userOptions = eligibleUsers
            .map(u => `
                <label style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.15s;
                " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background=''">
                    <input type="checkbox"
                        class="admin-notif-user-checkbox"
                        value="${u.uid}"
                        onchange="updateAdminNotifSelectedCount()"
                        style="width:16px; height:16px; cursor:pointer; accent-color:#c62828; flex-shrink:0;">
                    <span style="font-size:13px; color:#333; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        ${u.email}
                    </span>
                </label>
            `).join('');

        const modalHTML = `
        <div id="adminNotifSenderModal" style="
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.55);
            z-index: 10001;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            overflow-y: auto;
            padding: 20px 16px;
            box-sizing: border-box;
        ">
            <div style="
                width: 100%;
                max-width: 540px;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 24px 64px rgba(0,0,0,0.3);
                background: #fff;
                flex-shrink: 0;
                margin: auto;
            ">

                <!-- 헤더 (고정 안 함, 그냥 위에 배치) -->
                <div style="
                    background: linear-gradient(135deg, #b71c1c 0%, #c62828 60%, #e53935 100%);
                    padding: 24px 28px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                ">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="
                            width: 42px; height: 42px;
                            background: rgba(255,255,255,0.18);
                            border-radius: 10px;
                            display: flex; align-items: center; justify-content: center;
                            font-size: 20px;
                        ">📢</div>
                        <div>
                            <div style="color:white; font-size:18px; font-weight:800; letter-spacing:-0.3px;">알림 전송</div>
                            <div style="color:rgba(255,255,255,0.75); font-size:12px; margin-top:1px;">관리자 전용 · 즉시 전송</div>
                        </div>
                    </div>
                    <button onclick="closeAdminNotifSenderModal()" style="
                        background: rgba(255,255,255,0.15);
                        border: none;
                        color: white;
                        width: 34px; height: 34px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 18px;
                        display: flex; align-items: center; justify-content: center;
                        transition: background 0.2s;
                    " onmouseover="this.style.background='rgba(255,255,255,0.28)'"
                       onmouseout="this.style.background='rgba(255,255,255,0.15)'">×</button>
                </div>

                <!-- 본문 (스크롤 없이 그냥 전체 표시) -->
                <div style="padding: 24px 28px 28px; background: #fff;">

                    <!-- 수신 대상 -->
                    <div style="margin-bottom: 18px;">
                        <label style="display:block; font-size:12px; font-weight:700; color:#6c757d; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:8px;">수신 대상</label>
                        <div style="display:flex; gap:8px;">
                            <label id="targetAllLabel" onclick="toggleTargetMode('all')" style="
                                flex:1; display:flex; align-items:center; gap:8px;
                                padding: 10px 14px;
                                border: 2px solid #c62828;
                                border-radius: 8px;
                                cursor: pointer;
                                background: #fff5f5;
                                transition: all 0.2s;
                                font-weight: 600; color: #c62828; font-size: 14px;
                            ">
                                <span style="font-size:16px;">👥</span> 전체 사용자
                            </label>
                            <label id="targetSpecificLabel" onclick="toggleTargetMode('specific')" style="
                                flex:1; display:flex; align-items:center; gap:8px;
                                padding: 10px 14px;
                                border: 2px solid #dee2e6;
                                border-radius: 8px;
                                cursor: pointer;
                                background: #f8f9fa;
                                transition: all 0.2s;
                                font-weight: 600; color: #495057; font-size: 14px;
                            ">
                                <span style="font-size:16px;">👤</span> 특정 사용자
                            </label>
                        </div>

                        <div id="specificUserArea" style="display:none; margin-top:10px;">
                            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                                <div style="font-size:11px; color:#868e96; padding-left:2px;">
                                    FCM 토큰이 등록된 사용자만 표시됩니다 (${eligibleUsers.length}명)
                                </div>
                                <div style="display:flex; gap:6px;">
                                    <button type="button" onclick="selectAllAdminNotifUsers(true)" style="
                                        padding:3px 10px; font-size:11px; font-weight:600;
                                        border:1.5px solid #c62828; background:white;
                                        color:#c62828; border-radius:5px; cursor:pointer;"
                                        onmouseover="this.style.background='#fff5f5'"
                                        onmouseout="this.style.background='white'">전체선택</button>
                                    <button type="button" onclick="selectAllAdminNotifUsers(false)" style="
                                        padding:3px 10px; font-size:11px; font-weight:600;
                                        border:1.5px solid #dee2e6; background:white;
                                        color:#868e96; border-radius:5px; cursor:pointer;"
                                        onmouseover="this.style.background='#f8f9fa'"
                                        onmouseout="this.style.background='white'">전체해제</button>
                                </div>
                            </div>
                            <div id="targetUserCheckboxList" style="
                                max-height: 180px;
                                overflow-y: auto;
                                border: 1.5px solid #dee2e6;
                                border-radius: 8px;
                                padding: 4px;
                                background: white;
                            ">
                                ${userOptions}
                            </div>
                            <div style="font-size:11px; color:#adb5bd; margin-top:5px; padding-left:2px;">
                                선택된 사용자: <span id="selectedUserCount" style="font-weight:700; color:#adb5bd;">0</span>명
                            </div>
                        </div>
                    </div>

                    <!-- 알림 제목 -->
                    <div style="margin-bottom: 16px;">
                        <label style="display:block; font-size:12px; font-weight:700; color:#6c757d; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:8px;">알림 제목</label>
                        <input id="adminNotifTitle" type="text"
                            placeholder="예) 📢 긴급 공지"
                            maxlength="80"
                            style="
                                width: 100%;
                                padding: 11px 14px;
                                border: 1.5px solid #dee2e6;
                                border-radius: 8px;
                                font-size: 15px;
                                box-sizing: border-box;
                                outline: none;
                                transition: border-color 0.2s;
                            "
                            onfocus="this.style.borderColor='#c62828'"
                            onblur="this.style.borderColor='#dee2e6'"
                        >
                    </div>

                    <!-- 알림 내용 -->
                    <div style="margin-bottom: 16px;">
                        <label style="display:block; font-size:12px; font-weight:700; color:#6c757d; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:8px;">알림 내용</label>
                        <textarea id="adminNotifText"
                            placeholder="알림 내용을 입력하세요..."
                            maxlength="300"
                            rows="3"
                            style="
                                width: 100%;
                                padding: 11px 14px;
                                border: 1.5px solid #dee2e6;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                                outline: none;
                                resize: vertical;
                                transition: border-color 0.2s;
                                font-family: inherit;
                                line-height: 1.5;
                            "
                            onfocus="this.style.borderColor='#c62828'"
                            onblur="this.style.borderColor='#dee2e6'"
                        ></textarea>
                        <div style="text-align:right; font-size:11px; color:#adb5bd; margin-top:4px;">
                            <span id="adminNotifTextCount">0</span>/300
                        </div>
                    </div>

                    <!-- 연결 기사 ID -->
                    <div style="margin-bottom: 20px;">
                        <label style="display:block; font-size:12px; font-weight:700; color:#6c757d; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:8px;">연결 기사 ID <span style="font-weight:400; text-transform:none; letter-spacing:0; color:#adb5bd;">(선택)</span></label>
                        <input id="adminNotifArticleId" type="text"
                            placeholder="기사 ID (없으면 비워두세요)"
                            style="
                                width: 100%;
                                padding: 11px 14px;
                                border: 1.5px solid #dee2e6;
                                border-radius: 8px;
                                font-size: 14px;
                                box-sizing: border-box;
                                outline: none;
                                transition: border-color 0.2s;
                            "
                            onfocus="this.style.borderColor='#c62828'"
                            onblur="this.style.borderColor='#dee2e6'"
                        >
                        <div style="font-size:11px; color:#868e96; margin-top:5px; padding-left:4px;">
                            입력 시 알림 클릭 → 해당 기사로 이동
                        </div>
                    </div>

                    <!-- 안내 -->
                    <div style="
                        background: #fff8e1;
                        border: 1px solid #ffe082;
                        border-radius: 8px;
                        padding: 12px 14px;
                        margin-bottom: 20px;
                        display: flex;
                        gap: 10px;
                        align-items: flex-start;
                    ">
                        <span style="font-size:16px; flex-shrink:0; margin-top:1px;">⚡</span>
                        <div style="font-size:12px; color:#795548; line-height:1.6;">
                            <strong>즉시 DB 저장</strong> → GitHub Actions가 <strong>최대 5분 내</strong> FCM 푸시 전송<br>
                            <span style="opacity:0.8;">앱/브라우저가 꺼져 있어도 알림이 도달합니다.</span>
                        </div>
                    </div>

                    <!-- 버튼 -->
                    <div style="display:flex; gap:10px;">
                        <button onclick="closeAdminNotifSenderModal()" style="
                            flex: 1;
                            padding: 13px;
                            border: 1.5px solid #dee2e6;
                            border-radius: 8px;
                            background: white;
                            color: #495057;
                            font-size: 15px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#f8f9fa'"
                           onmouseout="this.style.background='white'">취소</button>

                        <button onclick="sendAdminNotification()" style="
                            flex: 2;
                            padding: 13px;
                            border: none;
                            border-radius: 8px;
                            background: linear-gradient(135deg, #c62828, #e53935);
                            color: white;
                            font-size: 15px;
                            font-weight: 700;
                            cursor: pointer;
                            transition: all 0.2s;
                            box-shadow: 0 4px 12px rgba(198,40,40,0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                        " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(198,40,40,0.4)'"
                           onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(198,40,40,0.3)'">
                            <span>📤</span> 알림 전송
                        </button>
                    </div>

                </div><!-- /본문 -->
            </div><!-- /modal-content -->
        </div><!-- /modal -->`;

                document.body.insertAdjacentHTML('beforeend', modalHTML);

        // 글자수 카운터
        document.getElementById('adminNotifText').addEventListener('input', function () {
            document.getElementById('adminNotifTextCount').textContent = this.value.length;
        });

        // 기본: 전체 모드
        window._adminNotifTargetMode = 'all';

    } catch (err) {
        hideLoadingIndicator();
        console.error('❌ 알림 전송 모달 오류:', err);
        alert('오류가 발생했습니다: ' + err.message);
    }
};

// ─────────────────────────────────────────
// 2. 수신 대상 모드 전환
// ─────────────────────────────────────────
window.toggleTargetMode = function (mode) {
    window._adminNotifTargetMode = mode;

    const allLabel      = document.getElementById('targetAllLabel');
    const specificLabel = document.getElementById('targetSpecificLabel');
    const specificArea  = document.getElementById('specificUserArea');

    if (mode === 'all') {
        allLabel.style.cssText      += 'border-color:#c62828; background:#fff5f5; color:#c62828;';
        specificLabel.style.cssText += 'border-color:#dee2e6; background:#f8f9fa; color:#495057;';
        specificArea.style.display  = 'none';
    } else {
        specificLabel.style.cssText += 'border-color:#c62828; background:#fff5f5; color:#c62828;';
        allLabel.style.cssText      += 'border-color:#dee2e6; background:#f8f9fa; color:#495057;';
        specificArea.style.display  = 'block';
    }
};

// ─────────────────────────────────────────
// 3. 모달 닫기
// ─────────────────────────────────────────
window.closeAdminNotifSenderModal = function () {
    const modal = document.getElementById('adminNotifSenderModal');
    if (modal) {
        modal.style.opacity    = '0';
        modal.style.transition = 'opacity 0.2s';
        setTimeout(() => modal.remove(), 200);
    }
};

// ✅ 체크박스 전체선택 / 전체해제
window.selectAllAdminNotifUsers = function (checked) {
    document.querySelectorAll('.admin-notif-user-checkbox').forEach(cb => {
        cb.checked = checked;
    });
    updateAdminNotifSelectedCount();
};

// ✅ 선택된 사용자 수 카운터 업데이트
window.updateAdminNotifSelectedCount = function () {
    const countEl = document.getElementById('selectedUserCount');
    if (!countEl) return;
    const count = document.querySelectorAll('.admin-notif-user-checkbox:checked').length;
    countEl.textContent = count;
    countEl.style.color = count > 0 ? '#c62828' : '#adb5bd';
};

// ─────────────────────────────────────────
// 4. 알림 전송 실행 (Firebase DB에 저장)
// ─────────────────────────────────────────
// ✅ 교체
window.sendAdminNotification = async function () {
    if (!(await isAdminAsync())) {
        alert('🚫 관리자 권한이 필요합니다!');
        return;
    }

    const title     = document.getElementById('adminNotifTitle')?.value.trim();
    const text      = document.getElementById('adminNotifText')?.value.trim();
    const articleId = document.getElementById('adminNotifArticleId')?.value.trim() || '';
    const mode      = window._adminNotifTargetMode || 'all';

    // 유효성 검사
    if (!title) { alert('알림 제목을 입력해주세요.'); return; }
    if (!text)  { alert('알림 내용을 입력해주세요.'); return; }

    let targetUids = [];

    showLoadingIndicator('알림 전송 중...');

    try {
        const usersSnapshot = await db.ref('users').once('value');
        const usersData = usersSnapshot.val() || {};

        if (mode === 'all') {
            // 알림 활성화 + FCM 토큰 보유 사용자 전체
            targetUids = Object.entries(usersData)
                .filter(([uid, data]) => data.fcmTokens && data.notificationsEnabled !== false)
                .map(([uid]) => uid);

            if (targetUids.length === 0) {
                hideLoadingIndicator();
                alert('FCM 토큰이 등록된 사용자가 없습니다.');
                return;
            }

            if (!confirm(`📢 ${targetUids.length}명의 사용자에게 알림을 전송하시겠습니까?\n\n제목: ${title}\n내용: ${text}`)) {
                hideLoadingIndicator();
                return;
            }

        } else {
            // ✅ 체크박스에서 선택된 UID 다중 수집
            const checkedBoxes = document.querySelectorAll('.admin-notif-user-checkbox:checked');
            if (checkedBoxes.length === 0) {
                hideLoadingIndicator();
                alert('사용자를 1명 이상 선택해주세요.');
                return;
            }

            targetUids = Array.from(checkedBoxes).map(cb => cb.value);

            const selectedEmails = targetUids.map(uid => usersData[uid]?.email || uid);
            const previewLabel = selectedEmails.length > 3
                ? selectedEmails.slice(0, 3).join(', ') + ` 외 ${selectedEmails.length - 3}명`
                : selectedEmails.join(', ');

            if (!confirm(`📢 ${targetUids.length}명에게 알림을 전송하시겠습니까?\n대상: ${previewLabel}\n\n제목: ${title}\n내용: ${text}`)) {
                hideLoadingIndicator();
                return;
            }
        }

        // Firebase에 알림 데이터 저장 (pushed: false → GitHub Actions가 FCM 전송)
        const timestamp = Date.now();
        const updates   = {};

        targetUids.forEach(uid => {
            const notifId = `admin_notif_${timestamp}_${Math.random().toString(36).substr(2, 8)}`;
            updates[`notifications/${uid}/${notifId}`] = {
                type:      'admin',
                title:     title,
                text:      text,
                articleId: articleId,
                timestamp: timestamp,
                read:      false,
                pushed:    false,
                sentBy:    getUserEmail() || 'admin',
                sentAt:    timestamp
            };
        });

        await db.ref().update(updates);

        hideLoadingIndicator();
        closeAdminNotifSenderModal();

        // 성공 토스트
        if (typeof showToastNotification === 'function') {
            showToastNotification(
                '✅ 알림 전송 완료',
                `${targetUids.length}명에게 알림이 저장되었습니다. 최대 5분 내 FCM 발송됩니다.`
            );
        }

        console.log(`✅ 관리자 알림 전송 완료 - ${targetUids.length}명`);

    } catch (err) {
        hideLoadingIndicator();
        console.error('❌ 관리자 알림 전송 실패:', err);
        alert('전송 중 오류가 발생했습니다: ' + err.message);
    }
};

// ─────────────────────────────────────────
// 5. 관리자 설정 버튼 자동 추가 (updateSettings 후킹)
// ─────────────────────────────────────────
// updateSettings가 실행된 뒤 adminModeIndicator 안에 버튼 삽입
const _origUpdateSettings = window.updateSettings;
window.updateSettings = async function () {
    if (typeof _origUpdateSettings === 'function') {
        await _origUpdateSettings.apply(this, arguments);
    }

    // 관리자일 때만 버튼 추가
    if (!isAdmin()) return;

    const adminIndicator = document.getElementById('adminModeIndicator');
    if (!adminIndicator) return;

    // 중복 방지
    if (document.getElementById('adminNotifSenderBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'adminNotifSenderBtn';
    btn.onclick = window.showAdminNotificationSender;
    btn.style.cssText = `
        width: 100%;
        margin-top: 10px;
        padding: 11px 16px;
        background: linear-gradient(135deg, #c62828, #e53935);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 3px 10px rgba(198,40,40,0.25);
        transition: all 0.2s;
    `;
    btn.innerHTML = '📢 &nbsp;수동 알림 전송';
    btn.onmouseover = () => { btn.style.transform = 'translateY(-1px)'; btn.style.boxShadow = '0 5px 14px rgba(198,40,40,0.35)'; };
    btn.onmouseout  = () => { btn.style.transform = ''; btn.style.boxShadow = '0 3px 10px rgba(198,40,40,0.25)'; };

    adminIndicator.appendChild(btn);
};

// ─────────────────────────────────────────
// 6. 더보기 메뉴에도 관리자 섹션 추가
// ─────────────────────────────────────────
const _origShowMoreMenu = window.showMoreMenu;
window.showMoreMenu = function () {
    if (typeof _origShowMoreMenu === 'function') {
        _origShowMoreMenu.apply(this, arguments);
    }

    if (!isAdmin()) return;

    const container = document.querySelector('.more-menu-container');
    if (!container || document.getElementById('adminNotifMoreBtn')) return;

    const adminSection = document.createElement('div');
    adminSection.className = 'menu-section';
    adminSection.style.cssText = `
        background: #fff5f5;
        border: 1.5px solid #ffcdd2;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(198,40,40,0.08);
    `;
    adminSection.innerHTML = `
        <h3 style="color:#c62828; margin:0 0 15px 0; font-size:16px; font-weight:700;">
            🛡️ 관리자 도구
        </h3>
        <div style="display:grid; gap:10px;">
            <button id="adminNotifMoreBtn"
                onclick="showAdminNotificationSender()"
                class="more-menu-btn"
                style="background:#c62828; color:white; border-color:#c62828;">
                <i class="fas fa-paper-plane" style="color:white;"></i>
                수동 알림 전송
            </button>
        </div>
    `;

    container.insertBefore(adminSection, container.firstChild);
};

console.log("✅ 관리자 수동 알림 전송 시스템 로드 완료");

// ===== 초기화 완료 =====

console.log("✅ script2.js 모든 기능 로드 완료");
console.log("📋 로드된 기능:");
console.log("  1. 프로필 사진 변경");
console.log("  2. 이미지 전체보기 + 확대/축소/드래그");
console.log("  3. 카테고리별 기사 고정 관리 (관리자 전용)");
console.log("  4. 스마트 임시저장 (Quill Ready 감지)");
console.log("  5. 기사 수정 (기존 내용 불러오기)");
console.log("  6. 로그인 UX 개선");
console.log("");
console.log("🎨 카테고리: 자유게시판, 논란, 연애, 정아영, 게넥도, 게임, 마크");