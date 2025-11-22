// ===== script1.js: 팝업 & 패치노트 기능 =====

// 팝업 관리 UI 표시
async function showPopupManager() {
    if(!isAdmin()) return alert("관리자 권한이 필요합니다!");
    
    hideAll();
    document.getElementById("userManagementSection").classList.add("active");
    
    const usersList = document.getElementById("usersList");
    if(!usersList) return;
    
    usersList.innerHTML = '<p style="text-align:center;color:#868e96;">로딩 중...</p>';
    
    // 기존 팝업 목록 불러오기
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
    
    // 최신 팝업 1개만 표시
    const popup = activePopups[0];
    
    // 쿠키로 이미 본 팝업인지 확인 (영구적으로 저장)
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
        
        // 영구적으로 저장 (10년 유효기간)
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 10);
        document.cookie = `seen_popups=${newSeen};expires=${expires.toUTCString()};path=/`;
    }
}

// ===== 패치노트 기능 =====

// 패치노트 페이지 표시
function showPatchNotesPage() {
    hideAll();
    document.querySelector(".patchnotes-section").classList.add("active");
    loadPatchNotesPage();
}

// 패치노트 로드
async function loadPatchNotesPage() {
    const container = document.getElementById("patchNotesList");
    if(!container) return;
    
    container.innerHTML = '<p style="text-align:center;color:#868e96;">로딩 중...</p>';
    
    const snapshot = await db.ref("patchNotes").once("value");
    const patchData = snapshot.val() || {};
    const patches = Object.entries(patchData)
        .map(([id, data]) => ({id, ...data}))
        .sort((a, b) => b.createdAt - a.createdAt);
    
    const adminControls = isAdmin() ? `
        <button onclick="openPatchNoteCreateModal()" class="btn btn-primary" style="width:100%;margin-bottom:20px;">
            ➕ 새 패치노트 작성
        </button>
    ` : '';
    
    container.innerHTML = `
        ${adminControls}
        ${patches.length === 0 ? 
            '<p style="text-align:center;color:#868e96;padding:40px;">등록된 패치노트가 없습니다.</p>' :
            patches.map(patch => `
                <div class="qna-card" style="margin-bottom:20px;">
                    <div class="qna-header" style="background:#1976d2;display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <span style="font-size:18px;">🔄 v${patch.version}</span>
                            <span style="font-size:13px;opacity:0.9;margin-left:15px;">${new Date(patch.createdAt).toLocaleDateString()}</span>
                        </div>
                        ${isAdmin() ? `
                            <div style="display:flex;gap:8px;">
                                <button onclick="editPatchNote('${patch.id}')" class="btn btn-blue" style="font-size:11px;height:28px;padding:0 12px;">수정</button>
                                <button onclick="deletePatchNote('${patch.id}')" class="btn btn-dark" style="font-size:11px;height:28px;padding:0 12px;">삭제</button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="qna-body">
                        <h4 style="color:#212529;margin-bottom:15px;font-size:18px;">${patch.title}</h4>
                        <div style="background:#f8f9fa;padding:20px;border-radius:8px;border-left:4px solid #1976d2;">
                            <pre style="margin:0;font-family:'Noto Sans KR',sans-serif;white-space:pre-wrap;line-height:1.8;color:#495057;">${patch.content}</pre>
                        </div>
                        <div style="margin-top:15px;color:#868e96;font-size:13px;">
                            작성자: ${patch.author}
                        </div>
                    </div>
                </div>
            `).join('')
        }
    `;
}

// 패치노트 작성 모달
function openPatchNoteCreateModal() {
    if(!isAdmin()) {
        return alert("관리자만 패치노트를 작성할 수 있습니다!");
    }
    
    const modalHTML = `
        <div id="patchNoteModal" class="modal active">
            <div class="modal-content" style="max-width:800px;">
                <h3 style="margin-bottom:20px;color:#1976d2;">🔄 패치노트 작성</h3>
                <form id="patchNoteForm">
                    <div class="form-group">
                        <label class="form-label" for="patchVersion">버전</label>
                        <input id="patchVersion" class="form-control" required placeholder="예: 1.0.0">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="patchTitle">제목</label>
                        <input id="patchTitle" class="form-control" required placeholder="예: 신규 기능 추가 및 버그 수정">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="patchContent">내용</label>
                        <textarea id="patchContent" class="form-control" required placeholder="[추가]
- 새로운 기능 1
- 새로운 기능 2

[수정]
- 버그 수정 내역

[개선]
- 성능 개선 사항" style="min-height:300px;font-family:monospace;"></textarea>
                    </div>
                    <div style="background:#e3f2fd;padding:15px;border-radius:6px;margin-bottom:20px;font-size:13px;color:#1565c0;">
                        💡 <strong>작성 팁:</strong> [추가], [수정], [개선], [삭제] 등의 카테고리로 구분하면 가독성이 좋습니다.
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%;margin-bottom:10px;">패치노트 등록</button>
                    <button type="button" onclick="closePatchNoteModal()" class="btn btn-gray" style="width:100%;">취소</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById("patchNoteForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        await createPatchNote();
    });
}

function closePatchNoteModal() {
    const modal = document.getElementById("patchNoteModal");
    if(modal) modal.remove();
}

// 패치노트 생성
async function createPatchNote() {
    const version = document.getElementById("patchVersion").value.trim();
    const title = document.getElementById("patchTitle").value.trim();
    const content = document.getElementById("patchContent").value.trim();
    
    if(!version || !title || !content) {
        return alert("모든 항목을 입력해주세요!");
    }
    
    const patchNote = {
        id: Date.now().toString(),
        version: version,
        title: title,
        content: content,
        createdAt: Date.now(),
        author: getNickname()
    };
    
    try {
        await db.ref("patchNotes/" + patchNote.id).set(patchNote);
        alert("패치노트가 등록되었습니다!");
        closePatchNoteModal();
        loadPatchNotesPage();
    } catch(error) {
        alert("등록 실패: " + error.message);
    }
}

// 패치노트 수정
async function editPatchNote(patchId) {
    if(!isAdmin()) {
        return alert("관리자만 패치노트를 수정할 수 있습니다!");
    }
    
    const snapshot = await db.ref("patchNotes/" + patchId).once("value");
    const patch = snapshot.val();
    if(!patch) return;
    
    const modalHTML = `
        <div id="patchNoteEditModal" class="modal active">
            <div class="modal-content" style="max-width:800px;">
                <h3 style="margin-bottom:20px;color:#1976d2;">✏️ 패치노트 수정</h3>
                <form id="patchNoteEditForm">
                    <div class="form-group">
                        <label class="form-label" for="editPatchVersion">버전</label>
                        <input id="editPatchVersion" class="form-control" required value="${patch.version}">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="editPatchTitle">제목</label>
                        <input id="editPatchTitle" class="form-control" required value="${patch.title}">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="editPatchContent">내용</label>
                        <textarea id="editPatchContent" class="form-control" required style="min-height:300px;font-family:monospace;">${patch.content}</textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%;margin-bottom:10px;">수정 완료</button>
                    <button type="button" onclick="closePatchNoteEditModal()" class="btn btn-gray" style="width:100%;">취소</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById("patchNoteEditForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const newVersion = document.getElementById("editPatchVersion").value.trim();
        const newTitle = document.getElementById("editPatchTitle").value.trim();
        const newContent = document.getElementById("editPatchContent").value.trim();
        
        if(!newVersion || !newTitle || !newContent) {
            return alert("모든 항목을 입력해주세요!");
        }
        
        try {
            await db.ref("patchNotes/" + patchId).update({
                version: newVersion,
                title: newTitle,
                content: newContent
            });
            alert("패치노트가 수정되었습니다!");
            closePatchNoteEditModal();
            loadPatchNotesPage();
        } catch(error) {
            alert("수정 실패: " + error.message);
        }
    });
}

function closePatchNoteEditModal() {
    const modal = document.getElementById("patchNoteEditModal");
    if(modal) modal.remove();
}

// 패치노트 삭제
async function deletePatchNote(patchId) {
    if(!isAdmin()) {
        return alert("관리자만 패치노트를 삭제할 수 있습니다!");
    }
    
    if(!confirm("이 패치노트를 삭제하시겠습니까?")) return;
    
    try {
        await db.ref("patchNotes/" + patchId).remove();
        alert("패치노트가 삭제되었습니다!");
        loadPatchNotesPage();
    } catch(error) {
        alert("삭제 실패: " + error.message);
    }
}

// 초기화 - 페이지 로드 시 실행
window.addEventListener("load", () => {
    // 사용자에게 활성 팝업 표시 (로그인 여부 상관없이)
    setTimeout(() => {
        showActivePopupsToUser();
    }, 1000); // 1초 후 표시
});