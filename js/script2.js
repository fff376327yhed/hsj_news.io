// ===== script2.js - 완전 개선 버전 =====

console.log("🔄 script2.js 로딩 시작...");

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
    if(!user) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    const fileInput = document.getElementById('profilePhotoInputModal');
    const file = fileInput ? fileInput.files[0] : null;
    
    if(!file) {
        alert("사진을 선택해주세요!");
        return;
    }
    
    showLoadingIndicator("사진 업로드 중...");
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const photoData = e.target.result;
        
        try {
            await db.ref("users/" + user.uid).update({
                profilePhoto: photoData,
                photoUpdatedAt: Date.now()
            });
            
            if(window.profilePhotoCache) {
                window.profilePhotoCache.set(user.email, photoData);
            }
            
            hideLoadingIndicator();
            closeProfilePhotoModal();
            alert("프로필 사진이 변경되었습니다!");
            
            if(typeof updateSettings === 'function') updateSettings();
            if(typeof updateHeaderProfileButton === 'function') updateHeaderProfileButton(user);
            
        } catch(error) {
            hideLoadingIndicator();
            console.error("업로드 실패:", error);
            alert("업로드 실패: " + error.message);
        }
    };
    
    reader.readAsDataURL(file);
};

console.log("✅ 프로필 사진 변경 기능 로드 완료");

// ===== 2. 이미지 전체보기 + 확대/축소 =====

// ===== 2. 이미지 전체보기 + 확대/축소 + 휠 확대 =====

window.openImageModal = function(imageSrc) {
    const existingModal = document.getElementById('imageViewModal');
    if(existingModal) existingModal.remove();
    
    const modalHTML = `
        <div id="imageViewModal" class="modal active" style="z-index:10000; background:rgba(0,0,0,0.95);">
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:20px; overflow:hidden;">
                <div id="imageContainer" style="position:relative; width:100%; height:100%; overflow:hidden; cursor:grab;">
                    <button onclick="closeImageModal()" style="position:fixed; top:20px; right:20px; background:rgba(255,255,255,0.9); color:#333; border:none; border-radius:50%; width:50px; height:50px; cursor:pointer; font-size:24px; z-index:10002; box-shadow:0 2px 12px rgba(0,0,0,0.5); font-weight:bold; display:flex; align-items:center; justify-content:center;">
                        ×
                    </button>
                    
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
            
            .image-control-btn:hover {
                background: white;
                transform: scale(1.1);
            }
            
            .image-control-btn:active {
                transform: scale(0.95);
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // ✅ 드래그 및 확대/축소 기능
    const container = document.getElementById('imageContainer');
    const wrapper = document.getElementById('imageWrapper');
    const img = document.getElementById('modalImageElement');
    
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    
    // 변환 적용 함수
    function applyTransform() {
        wrapper.style.transform = `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(${scale})`;
    }
    
    // 마우스 휠 확대/축소
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = scale * delta;
        
        if (newScale >= 0.5 && newScale <= 5) {
            scale = newScale;
            applyTransform();
        }
    }, { passive: false });
    
    // 마우스 드래그
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        container.style.cursor = 'grabbing';
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        lastX = translateX;
        lastY = translateY;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        
        wrapper.style.transition = 'none';
        applyTransform();
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            container.style.cursor = 'grab';
            wrapper.style.transition = 'transform 0.1s ease-out';
        }
    });
    
    // 터치 이벤트 (모바일)
    let initialDistance = 0;
    let initialScale = 1;
    
    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            // 단일 터치 - 드래그
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        } else if (e.touches.length === 2) {
            // 두 손가락 - 핀치 줌
            isDragging = false;
            initialDistance = Math.hypot(
                e.touches[1].clientX - e.touches[0].clientX,
                e.touches[1].clientY - e.touches[0].clientY
            );
            initialScale = scale;
        }
    });
    
    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        
        if (e.touches.length === 1 && isDragging) {
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            wrapper.style.transition = 'none';
            applyTransform();
        } else if (e.touches.length === 2) {
            const currentDistance = Math.hypot(
                e.touches[1].clientX - e.touches[0].clientX,
                e.touches[1].clientY - e.touches[0].clientY
            );
            const newScale = initialScale * (currentDistance / initialDistance);
            
            if (newScale >= 0.5 && newScale <= 5) {
                scale = newScale;
                applyTransform();
            }
        }
    }, { passive: false });
    
    container.addEventListener('touchend', () => {
        isDragging = false;
        wrapper.style.transition = 'transform 0.1s ease-out';
    });
    
    // ESC 키로 닫기
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeImageModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
    
    // 전역 변수에 저장 (버튼에서 사용)
    window.currentImageScale = {
        get scale() { return scale; },
        set scale(val) { 
            scale = val; 
            applyTransform(); 
        },
        reset() {
            scale = 1;
            translateX = 0;
            translateY = 0;
            wrapper.style.transition = 'transform 0.3s ease';
            applyTransform();
            setTimeout(() => {
                wrapper.style.transition = 'transform 0.1s ease-out';
            }, 300);
        }
    };
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
        
        const categoryEl = document.getElementById('category');
        const titleEl = document.getElementById('title');
        const summaryEl = document.getElementById('summary');
        
        if(draft.category && categoryEl) categoryEl.value = draft.category;
        if(draft.title && titleEl) titleEl.value = draft.title;
        if(draft.summary && summaryEl) summaryEl.value = draft.summary;
        
        // ✅ Quill 에디터에 내용 로드 (여러 방법 시도)
        let attempts = 0;
        const maxAttempts = 30;
        
        const loadToEditor = () => {
            const quillEditor = window.quillEditor || window.quill;
            
            if(quillEditor && quillEditor.root) {
                // ✅ HTML 내용을 Quill에 설정
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
        
        return true;
    } catch(error) {
        console.error("❌ 임시저장 복원 실패:", error);
        localStorage.removeItem('draft_article');
        return false;
    }
}

// showWritePage 후킹
if(typeof window.originalShowWritePage === 'undefined') {
    window.originalShowWritePage = window.showWritePage;
    
    window.showWritePage = function() {
        if(typeof window.originalShowWritePage === 'function') {
            window.originalShowWritePage();
        }
        
        setTimeout(() => {
            const hasDraft = loadDraft();
            if(hasDraft) {
                if(confirm("💾 임시저장된 작성 중인 기사가 있습니다.\n복원하시겠습니까?")) {
                    console.log("✅ 사용자가 복원 선택");
                } else {
                    localStorage.removeItem('draft_article');
                    if(window.quillEditor) window.quillEditor.setText('');
                    console.log("❌ 사용자가 복원 거부");
                }
            }
        }, 500);
    };
}

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
