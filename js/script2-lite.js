function readMagicBytes(file, byteCount) {
  return new Promise(resolve => {
    const reader = new FileReader;
    reader.onloadend = e => resolve(new Uint8Array(e.target.result)), reader.readAsArrayBuffer(file.slice(0, byteCount));
  });
}

function checkImageSignature(bytes, mimeType) {
  if ("image/webp" === mimeType) return 82 === bytes[0] && 73 === bytes[1] && 87 === bytes[8] && 69 === bytes[9] && 66 === bytes[10] && 80 === bytes[11];
  const sig = {
    "image/jpeg": [ 255, 216, 255 ],
    "image/jpg": [ 255, 216, 255 ],
    "image/png": [ 137, 80, 78, 71 ],
    "image/gif": [ 71, 73, 70, 56 ]
  }[mimeType];
  return !!sig && sig.every((byte, i) => bytes[i] === byte);
}

async function validateImageFile(file) {
  const errors = [];
  if ([ "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" ].includes(file.type) || errors.push("JPG, PNG, GIF, WEBP 형식만 허용됩니다."), 
  0 === errors.length) {
    checkImageSignature(await readMagicBytes(file, 12), file.type) || errors.push("올바른 이미지 파일이 아닙니다. (파일 형식 위조 감지)");
  }
  return errors;
}

async function loadCurrentProfilePhotoInModal() {
  const user = auth.currentUser;
  if (user) try {
    const photoUrl = (await db.ref("users/" + user.uid + "/profilePhoto").once("value")).val();
    if (photoUrl) {
      const container = document.getElementById("profilePhotoPreviewContainer");
      container && (container.innerHTML = `<img src="${photoUrl}" style="width:150px; height:150px; border-radius:50%; object-fit:cover; border:3px solid #dadce0;">`);
    }
  } catch (error) {}
}

window.openProfilePhotoModal = function() {
  if (!isLoggedIn()) return void alert("로그인이 필요합니다!");
  let modal = document.getElementById("profilePhotoModal");
  if (!modal) {
    const modalHTML = '\n            <div id="profilePhotoModal" class="modal">\n                <div class="modal-content" style="max-width:500px;">\n                    <div class="modal-header">\n                        <h3 style="color:#c62828;">📷 프로필 사진 변경</h3>\n                        <button onclick="closeProfilePhotoModal()" class="modal-close">\n                            <i class="fas fa-times"></i>\n                        </button>\n                    </div>\n                    \n                    <div style="text-align:center; margin:20px 0;">\n                        <div id="profilePhotoPreviewContainer" style="margin-bottom:15px;">\n                            <div style="width:150px; height:150px; border-radius:50%; margin:0 auto; background:#f1f3f4; display:flex; align-items:center; justify-content:center; border:3px solid #dadce0;">\n                                <i class="fas fa-user" style="font-size:60px; color:#9aa0a6;"></i>\n                            </div>\n                        </div>\n                        \n                        <div class="upload-area" style="border:2px dashed #ddd; padding:30px; border-radius:8px; cursor:pointer; background:#f8f9fa; margin-bottom:20px;" onclick="document.getElementById(\'profilePhotoInputModal\').click()">\n                            <i class="fas fa-cloud-upload-alt" style="font-size:40px; color:#868e96; margin-bottom:10px; display:block;"></i>\n                            <p style="color:#868e96; margin:0;">클릭하여 사진 선택</p>\n                        </div>\n                        <input type="file" id="profilePhotoInputModal" accept="image/*" style="display:none;">\n                    </div>\n                    \n                    <div style="display:flex; gap:10px;">\n                        <button onclick="saveProfilePhoto()" class="btn-primary btn-block">저장</button>\n                        <button onclick="closeProfilePhotoModal()" class="btn-secondary btn-block">취소</button>\n                    </div>\n                </div>\n            </div>\n        ';
    document.body.insertAdjacentHTML("beforeend", modalHTML), modal = document.getElementById("profilePhotoModal"), 
    document.getElementById("profilePhotoInputModal").addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader;
        reader.onload = function(event) {
          document.getElementById("profilePhotoPreviewContainer").innerHTML = `<img src="${event.target.result}" style="width:150px; height:150px; border-radius:50%; object-fit:cover; border:3px solid #dadce0;">`;
        }, reader.readAsDataURL(file);
      }
    });
  }
  modal.classList.add("active"), loadCurrentProfilePhotoInModal();
}, window.closeProfilePhotoModal = function() {
  const modal = document.getElementById("profilePhotoModal");
  modal && modal.classList.remove("active");
}, window.saveProfilePhoto = async function() {
  const user = auth.currentUser;
  if (!user) return void alert("로그인이 필요합니다!");
  const fileInput = document.getElementById("profilePhotoInputModal"), file = fileInput ? fileInput.files[0] : null;
  if (!file) return void alert("사진을 선택해주세요!");
  const errors = await validateImageFile(file);
  if (errors.length > 0) return alert("❌ 이미지 오류:\n" + errors.join("\n")), void (fileInput && (fileInput.value = ""));
  showLoadingIndicator("사진 업로드 중...");
  try {
    const photoData = await compressImageToBase64(file, 200, .92);
    await db.ref("users/" + user.uid).update({
      profilePhoto: photoData,
      photoUpdatedAt: Date.now()
    }), window.profilePhotoCache && window.profilePhotoCache.set(user.email, photoData), 
    hideLoadingIndicator(), closeProfilePhotoModal(), alert("프로필 사진이 변경되었습니다!"), "function" == typeof updateSettings && updateSettings(), 
    "function" == typeof updateHeaderProfileButton && updateHeaderProfileButton(user);
  } catch (error) {
    hideLoadingIndicator(), alert("업로드 실패: " + error.message);
  }
}, window.openImageModal = function(imageSrc) {
  const existingModal = document.getElementById("imageViewModal");
  existingModal && existingModal.remove(), "function" == typeof window._imgModalCleanup && (window._imgModalCleanup(), 
  window._imgModalCleanup = null);
  const modalHTML = `\n        <div id="imageViewModal" class="modal active" style="z-index:10000; background:rgba(0,0,0,0.95);">\n            <div style="position:fixed; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:20px; overflow:hidden;">\n                <div id="imageContainer" style="position:relative; width:100%; height:100%; overflow:hidden; cursor:grab;">\n                    <button onclick="closeImageModal()" style="position:fixed; top:20px; right:20px; background:rgba(255,255,255,0.9); color:#333; border:none; border-radius:50%; width:50px; height:50px; cursor:pointer; font-size:24px; z-index:10002; box-shadow:0 2px 12px rgba(0,0,0,0.5); font-weight:bold; display:flex; align-items:center; justify-content:center;">\n                        ×\n                    </button>\n                    \n                    <div style="position:fixed; bottom:20px; left:50%; transform:translateX(-50%); display:flex; gap:10px; z-index:10002;">\n                        <button onclick="zoomImage(1.2)" class="image-control-btn">\n                            <i class="fas fa-plus"></i>\n                        </button>\n                        <button onclick="zoomImage(0.8)" class="image-control-btn">\n                            <i class="fas fa-minus"></i>\n                        </button>\n                        <button onclick="resetZoom()" class="image-control-btn">\n                            <i class="fas fa-redo"></i>\n                        </button>\n                    </div>\n                    \n                    <div id="imageWrapper" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); transition:transform 0.1s ease-out;">\n                        <img id="modalImageElement" src="${imageSrc}" style="display:block; max-width:90vw; max-height:90vh; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,0.5); user-select:none; pointer-events:none;">\n                    </div>\n                </div>\n            </div>\n        </div>\n        \n        <style>\n            .image-control-btn {\n                background: rgba(255,255,255,0.9);\n                color: #333;\n                border: none;\n                border-radius: 50%;\n                width: 50px;\n                height: 50px;\n                cursor: pointer;\n                font-size: 18px;\n                box-shadow: 0 2px 12px rgba(0,0,0,0.5);\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                transition: all 0.2s;\n            }\n            \n            .image-control-btn:hover {\n                background: white;\n                transform: scale(1.1);\n            }\n            \n            .image-control-btn:active {\n                transform: scale(0.95);\n            }\n        </style>\n    `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  const container = document.getElementById("imageContainer"), wrapper = document.getElementById("imageWrapper");
  document.getElementById("modalImageElement");
  let scale = 1, translateX = 0, translateY = 0, isDragging = !1, startX = 0, startY = 0, lastX = 0, lastY = 0;
  function applyTransform() {
    wrapper.style.transform = `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(${scale})`;
  }
  container.addEventListener("wheel", e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? .9 : 1.1, newScale = scale * delta;
    newScale >= .5 && newScale <= 5 && (scale = newScale, applyTransform());
  }, {
    passive: !1
  }), container.addEventListener("mousedown", e => {
    isDragging = !0, container.style.cursor = "grabbing", startX = e.clientX - translateX, 
    startY = e.clientY - translateY, lastX = translateX, lastY = translateY;
  });
  const handleMouseMove = e => {
    isDragging && (translateX = e.clientX - startX, translateY = e.clientY - startY, 
    wrapper.style.transition = "none", applyTransform());
  };
  document.addEventListener("mousemove", handleMouseMove);
  const handleMouseUp = () => {
    isDragging && (isDragging = !1, container.style.cursor = "grab", wrapper.style.transition = "transform 0.1s ease-out");
  };
  document.addEventListener("mouseup", handleMouseUp);
  let initialDistance = 0, initialScale = 1;
  container.addEventListener("touchstart", e => {
    1 === e.touches.length ? (isDragging = !0, startX = e.touches[0].clientX - translateX, 
    startY = e.touches[0].clientY - translateY) : 2 === e.touches.length && (isDragging = !1, 
    initialDistance = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY), 
    initialScale = scale);
  }), container.addEventListener("touchmove", e => {
    if (e.preventDefault(), 1 === e.touches.length && isDragging) translateX = e.touches[0].clientX - startX, 
    translateY = e.touches[0].clientY - startY, wrapper.style.transition = "none", applyTransform(); else if (2 === e.touches.length) {
      const currentDistance = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY), newScale = initialScale * (currentDistance / initialDistance);
      newScale >= .5 && newScale <= 5 && (scale = newScale, applyTransform());
    }
  }, {
    passive: !1
  }), container.addEventListener("touchend", () => {
    isDragging = !1, wrapper.style.transition = "transform 0.1s ease-out";
  });
  const handleEsc = e => {
    "Escape" === e.key && (closeImageModal(), document.removeEventListener("keydown", handleEsc));
  };
  document.addEventListener("keydown", handleEsc), window._imgModalCleanup = () => {
    document.removeEventListener("mousemove", handleMouseMove), document.removeEventListener("mouseup", handleMouseUp), 
    document.removeEventListener("keydown", handleEsc);
  }, window.currentImageScale = {
    get scale() {
      return scale;
    },
    set scale(val) {
      scale = val, applyTransform();
    },
    reset() {
      scale = 1, translateX = 0, translateY = 0, wrapper.style.transition = "transform 0.3s ease", 
      applyTransform(), setTimeout(() => {
        wrapper.style.transition = "transform 0.1s ease-out";
      }, 300);
    }
  };
}, window.zoomImage = function(factor) {
  if (!window.currentImageScale) return;
  const newScale = window.currentImageScale.scale * factor;
  newScale >= .5 && newScale <= 5 && (window.currentImageScale.scale = newScale);
}, window.resetZoom = function() {
  window.currentImageScale && window.currentImageScale.reset();
}, window.closeImageModal = function() {
  const modal = document.getElementById("imageViewModal");
  modal && modal.remove(), "function" == typeof window._imgModalCleanup && (window._imgModalCleanup(), 
  window._imgModalCleanup = null);
};

let currentScale = 1;

function addImageClickHandlersToArticle() {
  let attempts = 0;
  const attachHandlers = () => {
    const articleDetail = document.getElementById("articleDetail");
    if (!articleDetail) return void (attempts < 10 && (attempts++, setTimeout(attachHandlers, 200)));
    const images = articleDetail.querySelectorAll("img");
    if (0 === images.length && attempts < 10) return attempts++, void setTimeout(attachHandlers, 200);
    images.forEach(img => {
      if (img.classList.contains("article-thumbnail")) return;
      img.style.cursor = "pointer", img.style.maxWidth = "100%", img.style.height = "auto";
      const newImg = img.cloneNode(!0);
      img.parentNode.replaceChild(newImg, img), newImg.addEventListener("click", function(e) {
        e.preventDefault(), e.stopPropagation(), openImageModal(this.src);
      });
    });
  };
  attachHandlers();
}

window.zoomImage = function(factor) {
  const img = document.getElementById("modalImageElement");
  img && (currentScale *= factor, img.style.transform = `scale(${currentScale})`);
}, window.resetZoom = function() {
  const img = document.getElementById("modalImageElement");
  if (!img) return;
  currentScale = 1, img.style.transform = "scale(1)";
  const windowWidth = .9 * window.innerWidth, windowHeight = .9 * window.innerHeight;
  img.style.maxWidth = windowWidth + "px", img.style.maxHeight = windowHeight + "px";
}, void 0 === window.originalShowArticleDetail && (window.originalShowArticleDetail = window.showArticleDetail, 
window.showArticleDetail = function(articleId) {
  const result = window.originalShowArticleDetail(articleId);
  return result && "function" == typeof result.then ? result.then(() => {
    setTimeout(() => addImageClickHandlersToArticle(), 500);
  }) : setTimeout(() => addImageClickHandlersToArticle(), 500), result;
}), window.showPinnedArticleManager = async function() {
  if (isLoggedIn()) if (isAdmin()) {
    showLoadingIndicator("고정 기사 불러오는 중...");
    try {
      const [articlesSnapshot, pinnedSnapshot] = await Promise.all([ db.ref("articles").once("value"), db.ref("pinnedArticles").once("value") ]), articlesData = articlesSnapshot.val() || {}, pinnedData = pinnedSnapshot.val() || {}, articles = Object.values(articlesData), categories = [ "자유게시판", "논란", "연애", "정아영", "게넥도", "게임", "마크" ], articlesByCategory = {};
      categories.forEach(cat => {
        articlesByCategory[cat] = articles.filter(a => a.category === cat);
      }), hideLoadingIndicator();
      let modal = document.getElementById("pinnedArticleModal");
      if (!modal) {
        const modalHTML = '\n                <div id="pinnedArticleModal" class="modal">\n                    <div class="modal-content" style="max-width:800px; max-height:80vh; overflow-y:auto;">\n                        <div class="modal-header">\n                            <h3 style="color:#c62828;">📌 기사 고정 관리 (관리자 전용)</h3>\n                            <button onclick="closePinnedArticleModal()" class="modal-close">\n                                <i class="fas fa-times"></i>\n                            </button>\n                        </div>\n                        <div id="pinnedArticleContent"></div>\n                    </div>\n                </div>\n            ';
        document.body.insertAdjacentHTML("beforeend", modalHTML), modal = document.getElementById("pinnedArticleModal");
      }
      let contentHTML = "";
      categories.forEach(category => {
        const categoryArticles = articlesByCategory[category] || [];
        contentHTML += `\n                <div style="margin-bottom:30px; border:1px solid #e0e0e0; border-radius:8px; padding:15px;">\n                    <h4 style="color:#1976d2; margin-bottom:15px; border-bottom:2px solid #1976d2; padding-bottom:8px;">\n                        ${category} (${categoryArticles.length}개)\n                    </h4>\n            `, 
        0 === categoryArticles.length ? contentHTML += '<p style="color:#868e96; text-align:center; padding:20px;">기사가 없습니다.</p>' : categoryArticles.forEach(article => {
          const isPinned = !!pinnedData[article.id];
          contentHTML += `\n                        <div style="background:#f8f9fa; padding:12px; margin-bottom:8px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">\n                            <div style="flex:1;">\n                                <strong>${article.title}</strong>\n                                <div style="font-size:12px; color:#6c757d; margin-top:4px;">\n                                    ${article.author} · ${article.date}\n                                </div>\n                            </div>\n                            <button onclick="togglePinArticle('${article.id}', ${isPinned})" \n                                    class="btn-${isPinned ? "danger" : "primary"}" \n                                    style="padding:6px 12px; font-size:12px; white-space:nowrap;">\n                                ${isPinned ? "📌 고정 해제" : "📌 고정"}\n                            </button>\n                        </div>\n                    `;
        }), contentHTML += "</div>";
      });
      const contentElement = document.getElementById("pinnedArticleContent");
      contentElement && (contentElement.innerHTML = contentHTML), modal.classList.add("active");
    } catch (error) {
      hideLoadingIndicator(), alert("오류가 발생했습니다: " + error.message);
    }
  } else alert("🚫 이 기능은 관리자만 사용할 수 있습니다!"); else alert("로그인이 필요합니다!");
}, window.closePinnedArticleModal = function() {
  const modal = document.getElementById("pinnedArticleModal");
  modal && modal.classList.remove("active");
}, window.togglePinArticle = async function(articleId, isPinned) {
  if (isAdmin()) try {
    isPinned ? (await db.ref("pinnedArticles/" + articleId).remove(), alert("고정이 해제되었습니다.")) : (await db.ref("pinnedArticles/" + articleId).set({
      pinnedAt: Date.now()
    }), alert("기사가 고정되었습니다.")), showPinnedArticleManager(), document.getElementById("articlesSection")?.classList.contains("active") && "function" == typeof renderArticles && renderArticles();
  } catch (error) {
    alert("오류가 발생했습니다: " + error.message);
  } else alert("🚫 관리자 권한이 필요합니다!");
};

let draftSaveEnabled = !1;

function saveDraft() {
  if (!draftSaveEnabled) return;
  const writeSection = document.getElementById("writeSection");
  if (!writeSection || !writeSection.classList.contains("active")) return;
  const quillEditor = window.quillEditor || window.quill;
  if (quillEditor && quillEditor.root) try {
    const editorContent = quillEditor.root.innerHTML, draft = {
      category: document.getElementById("category")?.value || "자유게시판",
      title: document.getElementById("title")?.value || "",
      summary: document.getElementById("summary")?.value || "",
      content: editorContent || "",
      thumbnail: "",
      savedAt: Date.now()
    }, thumbnailEl = document.getElementById("thumbnailPreview");
    thumbnailEl && thumbnailEl.src && !thumbnailEl.src.includes("data:,") && (draft.thumbnail = thumbnailEl.src);
    if (draft.title || draft.summary || draft.content && "" !== draft.content.trim() && "<p><br></p>" !== draft.content.trim() && "<p></p>" !== draft.content.trim()) {
      const fingerprint = draft.category + "|" + draft.title + "|" + draft.summary + "|" + draft.content + "|" + draft.thumbnail;
      if (fingerprint === window._lastDraftFingerprint) return;
      window._lastDraftFingerprint = fingerprint, localStorage.setItem("draft_article", JSON.stringify(draft));
    }
  } catch (error) {}
}

function loadDraft() {
  const draftData = localStorage.getItem("draft_article");
  if (!draftData) return !1;
  try {
    const draft = JSON.parse(draftData);
    return !(Date.now() - draft.savedAt > 864e5) || (localStorage.removeItem("draft_article"), 
    !1);
  } catch (error) {
    return localStorage.removeItem("draft_article"), !1;
  }
}

function restoreDraft() {
  const draftData = localStorage.getItem("draft_article");
  if (draftData) try {
    const draft = JSON.parse(draftData), categoryEl = document.getElementById("category"), titleEl = document.getElementById("title"), summaryEl = document.getElementById("summary");
    draft.category && categoryEl && (categoryEl.value = draft.category), draft.title && titleEl && (titleEl.value = draft.title), 
    draft.summary && summaryEl && (summaryEl.value = draft.summary);
    let attempts = 0;
    const maxAttempts = 30, loadToEditor = () => {
      const quillEditor = window.quillEditor || window.quill;
      quillEditor && quillEditor.root ? quillEditor.root.innerHTML = draft.content : attempts < maxAttempts && (attempts++, 
      setTimeout(loadToEditor, 100));
    };
    if (loadToEditor(), draft.thumbnail) {
      const preview = document.getElementById("thumbnailPreview"), uploadText = document.getElementById("uploadText");
      preview && uploadText && (preview.src = draft.thumbnail, preview.style.display = "block", 
      uploadText.innerHTML = '<i class="fas fa-check"></i><p>임시저장된 이미지</p>');
    }
  } catch (error) {
    localStorage.removeItem("draft_article");
  }
}

window.addEventListener("quillEditorReady", function() {
  draftSaveEnabled = !0;
}), void 0 === window.originalShowWritePage && (window.originalShowWritePage = window.showWritePage, 
window.showWritePage = function() {
  "function" == typeof window.originalShowWritePage && window.originalShowWritePage(), 
  setTimeout(() => {
    if (loadDraft()) if (confirm("💾 임시저장된 작성 중인 기사가 있습니다.\n복원하시겠습니까?")) restoreDraft(); else {
      localStorage.removeItem("draft_article");
      const categoryEl = document.getElementById("category"), titleEl = document.getElementById("title"), summaryEl = document.getElementById("summary");
      categoryEl && (categoryEl.value = "자유게시판"), titleEl && (titleEl.value = ""), summaryEl && (summaryEl.value = ""), 
      window.quillEditor && window.quillEditor.root && (window.quillEditor.root.innerHTML = "");
      const preview = document.getElementById("thumbnailPreview"), uploadText = document.getElementById("uploadText");
      preview && (preview.src = "", preview.style.display = "none"), uploadText && (uploadText.innerHTML = '<i class="fas fa-camera"></i><p>클릭하여 이미지 업로드</p>');
    }
  }, 500);
}), setInterval(() => {
  const writeSection = document.getElementById("writeSection");
  writeSection?.classList.contains("active") && saveDraft();
}, 1e4), window.addEventListener("beforeunload", () => {
  const writeSection = document.getElementById("writeSection");
  writeSection?.classList.contains("active") && saveDraft();
}), void 0 === window.originalHideAll && (window.originalHideAll = window.hideAll, 
window.hideAll = function() {
  const writeSection = document.getElementById("writeSection");
  writeSection?.classList.contains("active") && saveDraft(), "function" == typeof window.originalHideAll && window.originalHideAll();
}), window.showLoginRequired = function(feature = "이 기능") {
  confirm(`🔒 ${feature}은(는) 로그인이 필요합니다.\n\n로그인하시겠습니까?`) && googleLogin();
}, window.showAdminNotificationSender = async function() {
  if (await isAdminAsync()) {
    showLoadingIndicator("사용자 목록 불러오는 중...");
    try {
      const usersData = (await db.ref("users").once("value")).val() || {}, eligibleUsers = Object.entries(usersData).filter(([uid, data]) => data.fcmTokens && !1 !== data.notificationsEnabled).map(([uid, data]) => ({
        uid: uid,
        email: data.email || uid
      }));
      hideLoadingIndicator();
      const existingModal = document.getElementById("adminNotifSenderModal");
      existingModal && existingModal.remove();
      const userOptions = eligibleUsers.map(u => `\n                <label style="\n                    display: flex;\n                    align-items: center;\n                    gap: 10px;\n                    padding: 8px 10px;\n                    border-radius: 6px;\n                    cursor: pointer;\n                    transition: background 0.15s;\n                " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background=''">\n                    <input type="checkbox"\n                        class="admin-notif-user-checkbox"\n                        value="${u.uid}"\n                        onchange="updateAdminNotifSelectedCount()"\n                        style="width:16px; height:16px; cursor:pointer; accent-color:#c62828; flex-shrink:0;">\n                    <span style="font-size:13px; color:#333; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\n                        ${u.email}\n                    </span>\n                </label>\n            `).join(""), modalHTML = `\n        <div id="adminNotifSenderModal" style="\n            position: fixed;\n            top: 0; left: 0;\n            width: 100%; height: 100%;\n            background: rgba(0,0,0,0.55);\n            z-index: 10001;\n            display: flex;\n            align-items: flex-start;\n            justify-content: center;\n            overflow-y: auto;\n            padding: 20px 16px;\n            box-sizing: border-box;\n        ">\n            <div style="\n                width: 100%;\n                max-width: 540px;\n                border-radius: 16px;\n                overflow: hidden;\n                box-shadow: 0 24px 64px rgba(0,0,0,0.3);\n                background: #fff;\n                flex-shrink: 0;\n                margin: auto;\n            ">\n\n                \x3c!-- 헤더 (고정 안 함, 그냥 위에 배치) --\x3e\n                <div style="\n                    background: linear-gradient(135deg, #b71c1c 0%, #c62828 60%, #e53935 100%);\n                    padding: 24px 28px 20px;\n                    display: flex;\n                    align-items: center;\n                    justify-content: space-between;\n                ">\n                    <div style="display:flex; align-items:center; gap:12px;">\n                        <div style="\n                            width: 42px; height: 42px;\n                            background: rgba(255,255,255,0.18);\n                            border-radius: 10px;\n                            display: flex; align-items: center; justify-content: center;\n                            font-size: 20px;\n                        ">📢</div>\n                        <div>\n                            <div style="color:white; font-size:18px; font-weight:800; letter-spacing:-0.3px;">알림 전송</div>\n                            <div style="color:rgba(255,255,255,0.75); font-size:12px; margin-top:1px;">관리자 전용 · 즉시 전송</div>\n                        </div>\n                    </div>\n                    <button onclick="closeAdminNotifSenderModal()" style="\n                        background: rgba(255,255,255,0.15);\n                        border: none;\n                        color: white;\n                        width: 34px; height: 34px;\n                        border-radius: 50%;\n                        cursor: pointer;\n                        font-size: 18px;\n                        display: flex; align-items: center; justify-content: center;\n                        transition: background 0.2s;\n                    " onmouseover="this.style.background='rgba(255,255,255,0.28)'"\n                       onmouseout="this.style.background='rgba(255,255,255,0.15)'">×</button>\n                </div>\n\n                \x3c!-- 본문 (스크롤 없이 그냥 전체 표시) --\x3e\n                <div style="padding: 24px 28px 28px; background: #fff;">\n\n                    \x3c!-- 수신 대상 --\x3e\n                    <div style="margin-bottom: 18px;">\n                        <label style="display:block; font-size:12px; font-weight:700; color:#6c757d; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:8px;">수신 대상</label>\n                        <div style="display:flex; gap:8px;">\n                            <label id="targetAllLabel" onclick="toggleTargetMode('all')" style="\n                                flex:1; display:flex; align-items:center; gap:8px;\n                                padding: 10px 14px;\n                                border: 2px solid #c62828;\n                                border-radius: 8px;\n                                cursor: pointer;\n                                background: #fff5f5;\n                                transition: all 0.2s;\n                                font-weight: 600; color: #c62828; font-size: 14px;\n                            ">\n                                <span style="font-size:16px;">👥</span> 전체 사용자\n                            </label>\n                            <label id="targetSpecificLabel" onclick="toggleTargetMode('specific')" style="\n                                flex:1; display:flex; align-items:center; gap:8px;\n                                padding: 10px 14px;\n                                border: 2px solid #dee2e6;\n                                border-radius: 8px;\n                                cursor: pointer;\n                                background: #f8f9fa;\n                                transition: all 0.2s;\n                                font-weight: 600; color: #495057; font-size: 14px;\n                            ">\n                                <span style="font-size:16px;">👤</span> 특정 사용자\n                            </label>\n                        </div>\n\n                        <div id="specificUserArea" style="display:none; margin-top:10px;">\n                            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">\n                                <div style="font-size:11px; color:#868e96; padding-left:2px;">\n                                    FCM 토큰이 등록된 사용자만 표시됩니다 (${eligibleUsers.length}명)\n                                </div>\n                                <div style="display:flex; gap:6px;">\n                                    <button type="button" onclick="selectAllAdminNotifUsers(true)" style="\n                                        padding:3px 10px; font-size:11px; font-weight:600;\n                                        border:1.5px solid #c62828; background:white;\n                                        color:#c62828; border-radius:5px; cursor:pointer;"\n                                        onmouseover="this.style.background='#fff5f5'"\n                                        onmouseout="this.style.background='white'">전체선택</button>\n                                    <button type="button" onclick="selectAllAdminNotifUsers(false)" style="\n                                        padding:3px 10px; font-size:11px; font-weight:600;\n                                        border:1.5px solid #dee2e6; background:white;\n                                        color:#868e96; border-radius:5px; cursor:pointer;"\n                                        onmouseover="this.style.background='#f8f9fa'"\n                                        onmouseout="this.style.background='white'">전체해제</button>\n                                </div>\n                            </div>\n                            <div id="targetUserCheckboxList" style="\n                                max-height: 180px;\n                                overflow-y: auto;\n                                border: 1.5px solid #dee2e6;\n                                border-radius: 8px;\n                                padding: 4px;\n                                background: white;\n                            ">\n                                ${userOptions}\n                            </div>\n                            <div style="font-size:11px; color:#adb5bd; margin-top:5px; padding-left:2px;">\n                                선택된 사용자: <span id="selectedUserCount" style="font-weight:700; color:#adb5bd;">0</span>명\n                            </div>\n                        </div>\n                    </div>\n\n                    \x3c!-- 알림 제목 --\x3e\n                    <div style="margin-bottom: 16px;">\n                        <label style="display:block; font-size:12px; font-weight:700; color:#6c757d; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:8px;">알림 제목</label>\n                        <input id="adminNotifTitle" type="text"\n                            placeholder="예) 📢 긴급 공지"\n                            maxlength="80"\n                            style="\n                                width: 100%;\n                                padding: 11px 14px;\n                                border: 1.5px solid #dee2e6;\n                                border-radius: 8px;\n                                font-size: 15px;\n                                box-sizing: border-box;\n                                outline: none;\n                                transition: border-color 0.2s;\n                            "\n                            onfocus="this.style.borderColor='#c62828'"\n                            onblur="this.style.borderColor='#dee2e6'"\n                        >\n                    </div>\n\n                    \x3c!-- 알림 내용 --\x3e\n                    <div style="margin-bottom: 16px;">\n                        <label style="display:block; font-size:12px; font-weight:700; color:#6c757d; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:8px;">알림 내용</label>\n                        <textarea id="adminNotifText"\n                            placeholder="알림 내용을 입력하세요..."\n                            maxlength="300"\n                            rows="3"\n                            style="\n                                width: 100%;\n                                padding: 11px 14px;\n                                border: 1.5px solid #dee2e6;\n                                border-radius: 8px;\n                                font-size: 14px;\n                                box-sizing: border-box;\n                                outline: none;\n                                resize: vertical;\n                                transition: border-color 0.2s;\n                                font-family: inherit;\n                                line-height: 1.5;\n                            "\n                            onfocus="this.style.borderColor='#c62828'"\n                            onblur="this.style.borderColor='#dee2e6'"\n                        ></textarea>\n                        <div style="text-align:right; font-size:11px; color:#adb5bd; margin-top:4px;">\n                            <span id="adminNotifTextCount">0</span>/300\n                        </div>\n                    </div>\n\n                    \x3c!-- 연결 기사 ID --\x3e\n                    <div style="margin-bottom: 20px;">\n                        <label style="display:block; font-size:12px; font-weight:700; color:#6c757d; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:8px;">연결 기사 ID <span style="font-weight:400; text-transform:none; letter-spacing:0; color:#adb5bd;">(선택)</span></label>\n                        <input id="adminNotifArticleId" type="text"\n                            placeholder="기사 ID (없으면 비워두세요)"\n                            style="\n                                width: 100%;\n                                padding: 11px 14px;\n                                border: 1.5px solid #dee2e6;\n                                border-radius: 8px;\n                                font-size: 14px;\n                                box-sizing: border-box;\n                                outline: none;\n                                transition: border-color 0.2s;\n                            "\n                            onfocus="this.style.borderColor='#c62828'"\n                            onblur="this.style.borderColor='#dee2e6'"\n                        >\n                        <div style="font-size:11px; color:#868e96; margin-top:5px; padding-left:4px;">\n                            입력 시 알림 클릭 → 해당 기사로 이동\n                        </div>\n                    </div>\n\n                    \x3c!-- 안내 --\x3e\n                    <div style="\n                        background: #fff8e1;\n                        border: 1px solid #ffe082;\n                        border-radius: 8px;\n                        padding: 12px 14px;\n                        margin-bottom: 20px;\n                        display: flex;\n                        gap: 10px;\n                        align-items: flex-start;\n                    ">\n                        <span style="font-size:16px; flex-shrink:0; margin-top:1px;">⚡</span>\n                        <div style="font-size:12px; color:#795548; line-height:1.6;">\n                            <strong>즉시 DB 저장</strong> → GitHub Actions가 <strong>최대 5분 내</strong> FCM 푸시 전송<br>\n                            <span style="opacity:0.8;">앱/브라우저가 꺼져 있어도 알림이 도달합니다.</span>\n                        </div>\n                    </div>\n\n                    \x3c!-- 버튼 --\x3e\n                    <div style="display:flex; gap:10px;">\n                        <button onclick="closeAdminNotifSenderModal()" style="\n                            flex: 1;\n                            padding: 13px;\n                            border: 1.5px solid #dee2e6;\n                            border-radius: 8px;\n                            background: white;\n                            color: #495057;\n                            font-size: 15px;\n                            font-weight: 600;\n                            cursor: pointer;\n                            transition: all 0.2s;\n                        " onmouseover="this.style.background='#f8f9fa'"\n                           onmouseout="this.style.background='white'">취소</button>\n\n                        <button onclick="sendAdminNotification()" style="\n                            flex: 2;\n                            padding: 13px;\n                            border: none;\n                            border-radius: 8px;\n                            background: linear-gradient(135deg, #c62828, #e53935);\n                            color: white;\n                            font-size: 15px;\n                            font-weight: 700;\n                            cursor: pointer;\n                            transition: all 0.2s;\n                            box-shadow: 0 4px 12px rgba(198,40,40,0.3);\n                            display: flex;\n                            align-items: center;\n                            justify-content: center;\n                            gap: 8px;\n                        " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(198,40,40,0.4)'"\n                           onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(198,40,40,0.3)'">\n                            <span>📤</span> 알림 전송\n                        </button>\n                    </div>\n\n                </div>\x3c!-- /본문 --\x3e\n            </div>\x3c!-- /modal-content --\x3e\n        </div>\x3c!-- /modal --\x3e`;
      document.body.insertAdjacentHTML("beforeend", modalHTML), document.getElementById("adminNotifText").addEventListener("input", function() {
        document.getElementById("adminNotifTextCount").textContent = this.value.length;
      }), window._adminNotifTargetMode = "all";
    } catch (err) {
      hideLoadingIndicator(), alert("오류가 발생했습니다: " + err.message);
    }
  } else alert("🚫 관리자 권한이 필요합니다!");
}, window.toggleTargetMode = function(mode) {
  window._adminNotifTargetMode = mode;
  const allLabel = document.getElementById("targetAllLabel"), specificLabel = document.getElementById("targetSpecificLabel"), specificArea = document.getElementById("specificUserArea");
  "all" === mode ? (allLabel.style.cssText += "border-color:#c62828; background:#fff5f5; color:#c62828;", 
  specificLabel.style.cssText += "border-color:#dee2e6; background:#f8f9fa; color:#495057;", 
  specificArea.style.display = "none") : (specificLabel.style.cssText += "border-color:#c62828; background:#fff5f5; color:#c62828;", 
  allLabel.style.cssText += "border-color:#dee2e6; background:#f8f9fa; color:#495057;", 
  specificArea.style.display = "block");
}, window.closeAdminNotifSenderModal = function() {
  const modal = document.getElementById("adminNotifSenderModal");
  modal && (modal.style.opacity = "0", modal.style.transition = "opacity 0.2s", setTimeout(() => modal.remove(), 200));
}, window.selectAllAdminNotifUsers = function(checked) {
  document.querySelectorAll(".admin-notif-user-checkbox").forEach(cb => {
    cb.checked = checked;
  }), updateAdminNotifSelectedCount();
}, window.updateAdminNotifSelectedCount = function() {
  const countEl = document.getElementById("selectedUserCount");
  if (!countEl) return;
  const count = document.querySelectorAll(".admin-notif-user-checkbox:checked").length;
  countEl.textContent = count, countEl.style.color = count > 0 ? "#c62828" : "#adb5bd";
}, window.sendAdminNotification = async function() {
  if (!await isAdminAsync()) return void alert("🚫 관리자 권한이 필요합니다!");
  const title = document.getElementById("adminNotifTitle")?.value.trim(), text = document.getElementById("adminNotifText")?.value.trim(), articleId = document.getElementById("adminNotifArticleId")?.value.trim() || "", mode = window._adminNotifTargetMode || "all";
  if (!title) return void alert("알림 제목을 입력해주세요.");
  if (!text) return void alert("알림 내용을 입력해주세요.");
  let targetUids = [];
  showLoadingIndicator("알림 전송 중...");
  try {
    const usersData = (await db.ref("users").once("value")).val() || {};
    if ("all" === mode) {
      if (targetUids = Object.entries(usersData).filter(([uid, data]) => data.fcmTokens && !1 !== data.notificationsEnabled).map(([uid]) => uid), 
      0 === targetUids.length) return hideLoadingIndicator(), void alert("FCM 토큰이 등록된 사용자가 없습니다.");
      if (!confirm(`📢 ${targetUids.length}명의 사용자에게 알림을 전송하시겠습니까?\n\n제목: ${title}\n내용: ${text}`)) return void hideLoadingIndicator();
    } else {
      const checkedBoxes = document.querySelectorAll(".admin-notif-user-checkbox:checked");
      if (0 === checkedBoxes.length) return hideLoadingIndicator(), void alert("사용자를 1명 이상 선택해주세요.");
      targetUids = Array.from(checkedBoxes).map(cb => cb.value);
      const selectedEmails = targetUids.map(uid => usersData[uid]?.email || uid), previewLabel = selectedEmails.length > 3 ? selectedEmails.slice(0, 3).join(", ") + ` 외 ${selectedEmails.length - 3}명` : selectedEmails.join(", ");
      if (!confirm(`📢 ${targetUids.length}명에게 알림을 전송하시겠습니까?\n대상: ${previewLabel}\n\n제목: ${title}\n내용: ${text}`)) return void hideLoadingIndicator();
    }
    const timestamp = Date.now(), updates = {};
    targetUids.forEach(uid => {
      const notifId = `admin_notif_${timestamp}_${Math.random().toString(36).substr(2, 8)}`;
      updates[`notifications/${uid}/${notifId}`] = {
        type: "admin",
        title: title,
        text: text,
        articleId: articleId,
        timestamp: timestamp,
        read: !1,
        pushed: !1,
        sentBy: getUserEmail() || "admin",
        sentAt: timestamp
      };
    }), await db.ref().update(updates), hideLoadingIndicator(), closeAdminNotifSenderModal(), 
    "function" == typeof showToastNotification && showToastNotification("✅ 알림 전송 완료", `${targetUids.length}명에게 알림이 저장되었습니다. 최대 5분 내 FCM 발송됩니다.`);
  } catch (err) {
    hideLoadingIndicator(), alert("전송 중 오류가 발생했습니다: " + err.message);
  }
};

const _origUpdateSettings = window.updateSettings;

window.updateSettings = async function() {
  if ("function" == typeof _origUpdateSettings && await _origUpdateSettings.apply(this, arguments), 
  !isAdmin()) return;
  const adminIndicator = document.getElementById("adminModeIndicator");
  if (!adminIndicator) return;
  if (document.getElementById("adminNotifSenderBtn")) return;
  const btn = document.createElement("button");
  btn.id = "adminNotifSenderBtn", btn.onclick = window.showAdminNotificationSender, 
  btn.style.cssText = "\n        width: 100%;\n        margin-top: 10px;\n        padding: 11px 16px;\n        background: linear-gradient(135deg, #c62828, #e53935);\n        color: white;\n        border: none;\n        border-radius: 8px;\n        font-size: 14px;\n        font-weight: 700;\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        gap: 8px;\n        box-shadow: 0 3px 10px rgba(198,40,40,0.25);\n        transition: all 0.2s;\n    ", 
  btn.innerHTML = "📢 &nbsp;수동 알림 전송", btn.onmouseover = () => {
    btn.style.transform = "translateY(-1px)", btn.style.boxShadow = "0 5px 14px rgba(198,40,40,0.35)";
  }, btn.onmouseout = () => {
    btn.style.transform = "", btn.style.boxShadow = "0 3px 10px rgba(198,40,40,0.25)";
  }, adminIndicator.appendChild(btn);
};

const _origShowMoreMenu = window.showMoreMenu;

window.showMoreMenu = function() {
  if ("function" == typeof _origShowMoreMenu && _origShowMoreMenu.apply(this, arguments), 
  !isAdmin()) return;
  const container = document.querySelector(".more-menu-container");
  if (!container || document.getElementById("adminNotifMoreBtn")) return;
  const adminSection = document.createElement("div");
  adminSection.className = "menu-section", adminSection.style.cssText = "\n        background: #fff5f5;\n        border: 1.5px solid #ffcdd2;\n        border-radius: 12px;\n        padding: 20px;\n        margin-bottom: 20px;\n        box-shadow: 0 2px 8px rgba(198,40,40,0.08);\n    ", 
  adminSection.innerHTML = '\n        <h3 style="color:#c62828; margin:0 0 15px 0; font-size:16px; font-weight:700;">\n            🛡️ 관리자 도구\n        </h3>\n        <div style="display:grid; gap:10px;">\n            <button id="adminNotifMoreBtn"\n                onclick="showAdminNotificationSender()"\n                class="more-menu-btn"\n                style="background:#c62828; color:white; border-color:#c62828;">\n                <i class="fas fa-paper-plane" style="color:white;"></i>\n                수동 알림 전송\n            </button>\n        </div>\n    ', 
  container.insertBefore(adminSection, container.firstChild);
};