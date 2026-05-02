// ====================================================================
// category-manager.js
// 1. 통 이미지 기사 카드 스타일
// 2. 동적 카테고리 로딩 (Firebase)
// 3. 사용자 카테고리 추가 요청
// 4. 관리자 카테고리 승인/거절 관리
// ====================================================================

(function () {

    // ====================================================================
    // 1. CSS 삽입 — 통 이미지 카드 스타일
    // ====================================================================
    const style = document.createElement('style');
    style.textContent = `
        /* ---- 통 이미지 카드 ---- */
        .article-card-image {
            border-radius: 16px !important;
            overflow: hidden;
            margin-bottom: 14px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.14);
            border: none !important;
            padding: 0 !important;
        }
        .article-img-bg {
            position: relative;
            width: 100%;
            height: 210px;
            background-size: cover;
            background-position: center;
            background-color: #cfd8dc;
        }
        .article-img-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, transparent 15%, rgba(0,0,0,0.72) 100%);
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 14px 16px;
        }
        .article-title--img {
            color: white !important;
            font-size: 15px !important;
            font-weight: 800 !important;
            line-height: 1.35;
            margin: 0 0 7px !important;
            text-shadow: 0 1px 5px rgba(0,0,0,0.5);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .article-meta--img {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: rgba(255,255,255,0.82);
            font-size: 12px;
            font-weight: 600;
        }
        .category-badge--img {
            background: rgba(198,40,40,0.88) !important;
            color: white !important;
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            border: none !important;
        }
        /* new badge on image card */
        .article-card-image .new-article-badge {
            background: #1565c0;
        }

        /* ---- 카테고리 요청 모달 ---- */
        #_catRequestModal input:focus,
        #_catRequestModal textarea:focus {
            outline: none;
            border-color: #c62828 !important;
            box-shadow: 0 0 0 3px rgba(198,40,40,0.1);
        }

        /* ---- 관리자 배지 ---- */
        #_adminCatReqBadge { animation: _catBadgePop 0.3s cubic-bezier(.22,.68,0,1.4) both; }
        @keyframes _catBadgePop {
            from { transform:scale(0.5); opacity:0; }
            to   { transform:scale(1);   opacity:1; }
        }
    `;
    document.head.appendChild(style);


    // ====================================================================
    // 2. buildArticleCardHTML 오버라이드 — 통 이미지 스타일
    // ====================================================================
    function _waitAndOverride() {
        if (typeof window.buildArticleCardHTML !== 'function') {
            setTimeout(_waitAndOverride, 200);
            return;
        }

        window.buildArticleCardHTML = function (a, commentCounts, badge, isNew = false) {
            const views        = (typeof getArticleViews === 'function') ? getArticleViews(a) : (a.views || 0);
            const votes        = (typeof getArticleVoteCounts === 'function') ? getArticleVoteCounts(a) : { likes: 0, dislikes: 0 };
            const commentCount = (commentCounts && commentCounts[a.id]) || a.commentCount || 0;
            const _esc         = (typeof escapeHTML === 'function') ? escapeHTML : (s => String(s || ''));

            let badgeHTML    = '';
            let borderStyle  = 'cursor:pointer;';
            let newBadgeHTML = '';

            if (isNew) {
                newBadgeHTML = '<span class="new-article-badge">NEW</span>';
            }
            if (badge === 'pinned') {
                badgeHTML   = `<span class="pinned-badge">📌 고정</span>`;
                borderStyle = 'border-left:4px solid #ffd700; cursor:pointer;';
            } else if (badge === 'hot') {
                badgeHTML   = `<span style="display:inline-flex;align-items:center;gap:4px;
                    background:linear-gradient(90deg,#ff5722,#ff9800);color:white;
                    font-size:11px;font-weight:800;padding:2px 9px;border-radius:20px;
                    margin-right:4px;">🔥 핫</span>`;
                borderStyle = 'border-left:4px solid #ff5722; cursor:pointer;';
            }

            // ── 썸네일 있으면 통 이미지 카드 ──
            if (a.thumbnail) {
                return `<div class="article-card article-card-image${isNew ? ' article-card--new' : ''}"
                    onclick="showArticleDetail('${a.id}')"
                    style="${badge === 'pinned' ? 'outline:3px solid #ffd700;' : badge === 'hot' ? 'outline:3px solid #ff5722;' : ''}">
                    <div class="article-img-bg" style="background-image:url('${a.thumbnail}')">
                        <div class="article-img-overlay">
                            <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-bottom:7px;">
                                <span class="category-badge category-badge--img">${_esc(a.category)}</span>
                                ${a.anonymous ? `<span style="display:inline-flex;align-items:center;gap:3px;
                                    background:rgba(0,0,0,0.35);color:rgba(255,255,255,0.9);
                                    font-size:11px;font-weight:800;padding:2px 8px;border-radius:20px;">🕵️ 익명</span>` : ''}
                                ${newBadgeHTML}${badgeHTML}
                            </div>
                            <h3 class="article-title--img">${_esc(a.title)}</h3>
                            <div class="article-meta--img">
                                <span>${a.anonymous ? '익명' : _esc(a.author || '')}</span>
                                <div style="display:flex;gap:10px;">
                                    <span>👁️ ${views}</span>
                                    <span>💬 ${commentCount}</span>
                                    <span>👍 ${votes.likes}</span>
                                    ${votes.dislikes > 0 ? `<span>👎 ${votes.dislikes}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            }

            // ── 썸네일 없으면 기존 텍스트 카드 ──
            const photoUrl    = a.anonymous ? null : (window.profilePhotoCache?.get(a.authorEmail) || null);
            const authorPhoto = (typeof getProfilePlaceholder === 'function')
                ? getProfilePlaceholder(photoUrl, 36)
                : '';

            return `<div class="article-card${isNew ? ' article-card--new' : ''}"
                onclick="showArticleDetail('${a.id}')" style="${borderStyle}">
                <div class="article-content">
                    <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:4px;">
                        <span class="category-badge">${_esc(a.category)}</span>
                        ${a.anonymous ? `<span style="display:inline-flex;align-items:center;gap:3px;
                            background:#f5f5f5;color:#757575;font-size:11px;font-weight:800;
                            padding:2px 8px;border-radius:20px;">🕵️ 익명</span>` : ''}
                        ${newBadgeHTML}${badgeHTML}
                    </div>
                    <h3 class="article-title">${_esc(a.title)}</h3>
                    ${a.summary ? `<p class="article-summary">${_esc(a.summary)}</p>` : ''}
                    <div class="article-meta" style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                        <div style="display:flex;align-items:center;gap:8px;">
                            ${authorPhoto}
                            <span>${a.anonymous ? '익명' : _esc(a.author || '')}</span>
                        </div>
                        <div class="article-stats" style="display:flex;gap:12px;">
                            <span class="stat-item">👁️ ${views}</span>
                            <span class="stat-item">💬 ${commentCount}</span>
                            <span class="stat-item">👍 ${votes.likes}</span>
                            ${votes.dislikes > 0 ? `<span class="stat-item">👎 ${votes.dislikes}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>`;
        };

        console.log('✅ category-manager: buildArticleCardHTML 오버라이드 완료');
    }
    _waitAndOverride();


    // ====================================================================
    // 3. 동적 카테고리 로딩
    // ====================================================================
    const BASE_CATEGORIES = ['자유게시판', '논란', '연애', '정아영', '게넥도', '게임', '마크', '과제방'];

    async function loadCustomCategories() {
        try {
            const snap = await db.ref('customCategories/approved').once('value');
            const customMap = snap.val() || {};
            const customNames = Object.values(customMap).map(c => c.name).filter(Boolean);
            const allCats = [...BASE_CATEGORIES];
            customNames.forEach(n => { if (!allCats.includes(n)) allCats.push(n); });

            // 전역 업데이트
            window.ALL_CATEGORIES = allCats;
            window._customCategoryKeys = customMap; // key → {name} 맵핑 저장 (삭제용)

            rebuildCategoryDropdown(allCats);
            rebuildCategorySelects(allCats);
            checkPendingCategoryRequests();
        } catch (e) {
            console.warn('category-manager: 카테고리 로드 실패', e);
        }
    }

    function rebuildCategoryDropdown(cats) {
        const menu = document.getElementById('catDropdownMenu');
        if (!menu) return;

        const items = cats.map((cat, i) => {
            const isFirst = i === 0;
            return `<div onclick="selectCategory('${cat}')" data-cat="${cat}" class="_catItem"
                style="display:flex; align-items:center; justify-content:space-between;
                padding:11px 16px; font-size:14px; font-weight:${isFirst ? '600' : 'normal'};
                cursor:pointer; background:${isFirst ? '#fff8f8' : '#fff'};
                color:${isFirst ? '#c62828' : 'inherit'}; border-bottom:1px solid #f5f5f5;">
                ${cat}
                <span class="_catDot" style="display:none; width:8px; height:8px;
                    background:#dc3545; border-radius:50%; flex-shrink:0;
                    box-shadow:0 0 4px rgba(220,53,69,0.5);"></span>
            </div>`;
        }).join('');

        const requestBtn = `<div onclick="showCategoryRequestModal()"
            data-cat="_request_"
            style="display:flex; align-items:center; gap:8px;
            padding:10px 16px; font-size:13px; cursor:pointer;
            color:#6c757d; background:#fafafa; border-top:2px solid #f0f0f0;">
            <i class="fas fa-plus-circle" style="color:#c62828;"></i>
            카테고리 추가 요청
        </div>`;

        menu.innerHTML = items + requestBtn;
    }

    function rebuildCategorySelects(cats) {
        // 검색 숨김 select
        const searchSel = document.getElementById('searchCategory');
        if (searchSel) {
            const curVal = searchSel.value;
            searchSel.innerHTML = cats.map(c =>
                `<option value="${c}"${c === curVal ? ' selected' : ''}>${c}</option>`
            ).join('');
        }
        // 글쓰기 카테고리 select
        const writeSel = document.getElementById('category');
        if (writeSel) {
            const curVal = writeSel.value;
            writeSel.innerHTML = cats.map(c =>
                `<option value="${c}"${c === curVal ? ' selected' : ''}>${c}</option>`
            ).join('');
        }
    }


    // ====================================================================
    // 4. 사용자 카테고리 추가 요청 모달
    // ====================================================================
    window.showCategoryRequestModal = function () {
        // 드롭다운 닫기
        const dropMenu = document.getElementById('catDropdownMenu');
        if (dropMenu) dropMenu.style.display = 'none';
        const arrow = document.getElementById('catDropdownArrow');
        if (arrow) arrow.style.transform = '';

        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            alert('카테고리 추가 요청은 로그인 후 이용하세요.');
            return;
        }

        document.getElementById('_catRequestModal')?.remove();

        const modal = document.createElement('div');
        modal.id = '_catRequestModal';
        modal.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:99999',
            'background:rgba(0,0,0,0.55)',
            'display:flex', 'align-items:center', 'justify-content:center',
            'padding:20px'
        ].join(';');

        modal.innerHTML = `
            <div style="background:white;border-radius:20px;padding:26px 22px;width:100%;
                max-width:400px;box-shadow:0 12px 40px rgba(0,0,0,0.22);
                animation:_catModalIn 0.25s cubic-bezier(.22,.68,0,1.2) both;">
                <style>
                    @keyframes _catModalIn {
                        from { transform:scale(0.88) translateY(20px); opacity:0; }
                        to   { transform:scale(1) translateY(0); opacity:1; }
                    }
                </style>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
                    <div>
                        <div style="font-size:11px;color:#888;font-weight:700;letter-spacing:0.5px;margin-bottom:2px;">CATEGORY REQUEST</div>
                        <h3 style="margin:0;font-size:19px;font-weight:900;color:#212121;">📂 카테고리 추가 요청</h3>
                    </div>
                    <button onclick="document.getElementById('_catRequestModal').remove()"
                        style="background:#f5f5f5;border:none;width:34px;height:34px;border-radius:50%;
                        font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;
                        flex-shrink:0;">✕</button>
                </div>

                <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:10px;
                    padding:11px 14px;margin-bottom:18px;font-size:13px;color:#795548;line-height:1.65;">
                    <i class="fas fa-info-circle"></i>&nbsp; 요청한 카테고리는 <b>관리자 검토 후</b> 추가됩니다.
                </div>

                <div style="margin-bottom:14px;">
                    <label style="font-size:13px;font-weight:700;color:#555;display:block;margin-bottom:7px;">
                        카테고리 이름 <span style="color:#c62828;">*</span>
                    </label>
                    <input id="_catReqName" type="text" maxlength="15"
                        placeholder="예: 스포츠, 음악, 공부..."
                        style="width:100%;padding:12px 14px;border:1.5px solid #dee2e6;
                        border-radius:10px;font-size:15px;box-sizing:border-box;
                        font-family:inherit;transition:border-color 0.15s;"
                        onfocus="this.style.borderColor='#c62828';this.style.boxShadow='0 0 0 3px rgba(198,40,40,0.1)'"
                        onblur="this.style.borderColor='#dee2e6';this.style.boxShadow=''">
                </div>

                <div style="margin-bottom:22px;">
                    <label style="font-size:13px;font-weight:700;color:#555;display:block;margin-bottom:7px;">
                        요청 이유 <span style="color:#aaa;font-weight:400;">(선택)</span>
                    </label>
                    <textarea id="_catReqReason" maxlength="100"
                        placeholder="이 카테고리가 필요한 이유를 적어주세요."
                        style="width:100%;padding:12px 14px;border:1.5px solid #dee2e6;
                        border-radius:10px;font-size:13px;box-sizing:border-box;
                        resize:none;height:76px;font-family:inherit;line-height:1.5;
                        transition:border-color 0.15s;"
                        onfocus="this.style.borderColor='#c62828';this.style.boxShadow='0 0 0 3px rgba(198,40,40,0.1)'"
                        onblur="this.style.borderColor='#dee2e6';this.style.boxShadow=''"></textarea>
                </div>

                <button onclick="submitCategoryRequest()"
                    style="width:100%;padding:14px;background:linear-gradient(135deg,#c62828,#e53935);
                    color:white;border:none;border-radius:12px;font-size:15px;font-weight:800;
                    cursor:pointer;letter-spacing:-0.3px;
                    box-shadow:0 4px 14px rgba(198,40,40,0.3);
                    transition:transform 0.1s, box-shadow 0.1s;"
                    onmousedown="this.style.transform='scale(0.98)'"
                    onmouseup="this.style.transform=''">
                    요청 보내기 🚀
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        setTimeout(() => document.getElementById('_catReqName')?.focus(), 120);
    };

    window.submitCategoryRequest = async function () {
        const name   = document.getElementById('_catReqName')?.value.trim();
        const reason = document.getElementById('_catReqReason')?.value.trim() || '';

        if (!name) { alert('카테고리 이름을 입력해주세요.'); return; }
        if (name.length > 15) { alert('카테고리 이름은 15자 이내로 입력해주세요.'); return; }

        const allCats = window.ALL_CATEGORIES || BASE_CATEGORIES;
        if (allCats.map(c => c.toLowerCase()).includes(name.toLowerCase())) {
            alert('이미 존재하는 카테고리입니다.'); return;
        }

        try {
            const uid = (typeof getUserId === 'function') ? getUserId() : null;
            let requesterName = '알 수 없음';
            if (uid) {
                const snap = await db.ref(`users/${uid}`).once('value');
                const u = snap.val();
                requesterName = u?.nickname || u?.email || '알 수 없음';
            }

            const reqData = {
                name,
                reason,
                requestedBy:    requesterName,
                requestedByUid: uid || '',
                requestedAt:    Date.now(),
                status:         'pending'
            };

            await db.ref('categoryRequests').push(reqData);

            document.getElementById('_catRequestModal')?.remove();

            if (typeof showToastNotification === 'function') {
                showToastNotification('요청 완료 ✅', `"${name}" 카테고리 추가 요청을 보냈습니다!`);
            } else {
                alert(`"${name}" 카테고리 추가 요청을 보냈습니다!\n관리자 검토 후 추가됩니다.`);
            }
        } catch (e) {
            console.error('카테고리 요청 오류:', e);
            alert('요청 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    };


    // ====================================================================
    // 5. 관리자 카테고리 관리 페이지
    // ====================================================================
    window.showAdminCategoryManager = async function () {
        if (typeof isAdmin === 'function' && !isAdmin()) {
            alert('🚫 관리자 권한이 필요합니다!');
            return;
        }

        if (typeof hideAll === 'function') hideAll();
        const section = document.getElementById('moreMenuSection');
        if (!section) return;
        section.classList.add('active');

        section.innerHTML = `
            <div style="max-width:600px;margin:0 auto;padding:20px;">
                <!-- 헤더 -->
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                    <button onclick="showMoreMenu()"
                        style="background:#f5f5f5;border:none;width:38px;height:38px;border-radius:50%;
                        font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;
                        flex-shrink:0;">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div>
                        <div style="font-size:11px;color:#888;font-weight:700;letter-spacing:0.5px;">ADMIN</div>
                        <h2 style="margin:0;font-size:20px;font-weight:900;color:#c62828;">📂 카테고리 관리</h2>
                    </div>
                </div>

                <!-- 현재 카테고리 -->
                <div style="background:white;border-radius:14px;padding:20px;margin-bottom:16px;
                    box-shadow:0 2px 10px rgba(0,0,0,0.08);">
                    <h3 style="margin:0 0 14px;font-size:14px;font-weight:800;color:#333;display:flex;align-items:center;gap:6px;">
                        <span style="background:#e8f5e9;color:#2e7d32;padding:3px 10px;border-radius:20px;font-size:12px;">ON</span>
                        현재 카테고리
                    </h3>
                    <div id="_adminCatCurrentList" style="display:flex;flex-wrap:wrap;gap:8px;"></div>
                </div>

                <!-- 요청 목록 -->
                <div style="background:white;border-radius:14px;padding:20px;
                    box-shadow:0 2px 10px rgba(0,0,0,0.08);">
                    <h3 style="margin:0 0 14px;font-size:14px;font-weight:800;color:#333;display:flex;align-items:center;gap:6px;">
                        <span id="_adminCatPendingBadge" style="background:#dc3545;color:white;padding:3px 10px;border-radius:20px;font-size:12px;display:none;">0</span>
                        📬 추가 요청 목록
                    </h3>
                    <div id="_adminCatRequestList">
                        <div style="text-align:center;padding:30px;color:#bbb;">
                            <i class="fas fa-spinner fa-spin" style="font-size:22px;"></i>
                            <div style="margin-top:10px;font-size:13px;">로딩 중...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        _renderCurrentCategories();
        await _loadAndRenderRequests();
    };

    function _renderCurrentCategories() {
        const el = document.getElementById('_adminCatCurrentList');
        if (!el) return;
        const cats = window.ALL_CATEGORIES || BASE_CATEGORIES;
        el.innerHTML = cats.map(cat => {
            const isBase = BASE_CATEGORIES.includes(cat);
            return `<span style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;
                background:${isBase ? '#fff0f0' : '#e8f5e9'};
                color:${isBase ? '#c62828' : '#2e7d32'};
                border:1.5px solid ${isBase ? '#ffcdd2' : '#a5d6a7'};
                border-radius:20px;font-size:13px;font-weight:700;">
                ${cat}
                ${!isBase ? `<button onclick="removeCustomCategory('${cat}')" title="삭제"
                    style="background:none;border:none;cursor:pointer;color:#f44336;
                    font-size:13px;padding:0;line-height:1;margin-left:2px;">✕</button>` : ''}
            </span>`;
        }).join('');
    }

    async function _loadAndRenderRequests() {
        const el = document.getElementById('_adminCatRequestList');
        const badge = document.getElementById('_adminCatPendingBadge');
        if (!el) return;

        try {
            const snap = await db.ref('categoryRequests')
                .orderByChild('status').equalTo('pending').once('value');

            if (!snap.val()) {
                el.innerHTML = `
                    <div style="text-align:center;padding:30px;color:#bbb;">
                        <div style="font-size:36px;margin-bottom:10px;">📭</div>
                        <div style="font-size:14px;font-weight:600;">대기 중인 요청이 없습니다</div>
                    </div>`;
                return;
            }

            const reqs = Object.entries(snap.val())
                .map(([id, data]) => ({ id, ...data }))
                .sort((a, b) => b.requestedAt - a.requestedAt);

            if (badge) {
                badge.textContent = reqs.length;
                badge.style.display = 'inline';
            }

            el.innerHTML = reqs.map(req => `
                <div id="_catReqItem_${req.id}"
                    style="border:1.5px solid #dee2e6;border-radius:12px;padding:16px;margin-bottom:12px;
                    transition:opacity 0.3s;">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:18px;font-weight:900;color:#212121;margin-bottom:4px;">
                                "${req.name}"
                            </div>
                            <div style="font-size:12px;color:#888;margin-bottom:6px;">
                                <i class="fas fa-user"></i> ${req.requestedBy}
                            </div>
                            ${req.reason ? `
                                <div style="font-size:13px;color:#555;background:#f8f9fa;
                                    padding:9px 12px;border-radius:8px;border-left:3px solid #dee2e6;
                                    line-height:1.5;margin-bottom:6px;">${req.reason}</div>
                            ` : ''}
                            <div style="font-size:11px;color:#bbb;">
                                <i class="fas fa-clock"></i>
                                ${new Date(req.requestedAt).toLocaleString('ko-KR')}
                            </div>
                        </div>
                        <div style="display:flex;gap:8px;flex-shrink:0;align-items:flex-start;">
                            <button onclick="approveCategoryRequest('${req.id}','${req.name}')"
                                style="padding:9px 16px;background:linear-gradient(135deg,#43a047,#66bb6a);
                                color:white;border:none;border-radius:9px;font-size:13px;font-weight:800;
                                cursor:pointer;box-shadow:0 2px 8px rgba(67,160,71,0.3);">
                                ✅ 승인
                            </button>
                            <button onclick="rejectCategoryRequest('${req.id}')"
                                style="padding:9px 14px;background:#fff0f0;color:#c62828;
                                border:1.5px solid #ffcdd2;border-radius:9px;font-size:13px;
                                font-weight:800;cursor:pointer;">
                                ❌ 거절
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (e) {
            console.error('요청 목록 로드 실패:', e);
            el.innerHTML = '<div style="color:#f44336;padding:20px;text-align:center;">로드 실패</div>';
        }
    }

    window.approveCategoryRequest = async function (reqId, catName) {
        if (typeof isAdmin === 'function' && !isAdmin()) return;

        try {
            // Firebase에 승인된 카테고리 추가
            await db.ref('customCategories/approved').push({ name: catName, approvedAt: Date.now() });
            // 요청 상태 업데이트
            await db.ref(`categoryRequests/${reqId}`).update({ status: 'approved' });

            // 카테고리 재로드
            await loadCustomCategories();

            // UI에서 해당 항목 제거 (애니메이션)
            const item = document.getElementById(`_catReqItem_${reqId}`);
            if (item) { item.style.opacity = '0'; setTimeout(() => item.remove(), 300); }

            if (typeof showToastNotification === 'function') {
                showToastNotification('카테고리 승인 ✅', `"${catName}" 카테고리가 추가되었습니다!`);
            } else {
                alert(`✅ "${catName}" 카테고리가 승인되어 추가되었습니다!`);
            }

            // 현재 목록 갱신
            setTimeout(_renderCurrentCategories, 400);

            // 배지 숫자 갱신
            setTimeout(async () => {
                const snap = await db.ref('categoryRequests').orderByChild('status').equalTo('pending').once('value');
                const cnt = snap.val() ? Object.keys(snap.val()).length : 0;
                const b = document.getElementById('_adminCatPendingBadge');
                if (b) { b.textContent = cnt; b.style.display = cnt > 0 ? 'inline' : 'none'; }
                const globalBadge = document.getElementById('_adminCatReqBadge');
                if (globalBadge) { globalBadge.textContent = cnt; globalBadge.style.display = cnt > 0 ? 'inline' : 'none'; }
            }, 400);

        } catch (e) {
            console.error('카테고리 승인 오류:', e);
            alert('오류가 발생했습니다.');
        }
    };

    window.rejectCategoryRequest = async function (reqId) {
        if (typeof isAdmin === 'function' && !isAdmin()) return;
        if (!confirm('이 요청을 거절하시겠습니까?')) return;

        try {
            await db.ref(`categoryRequests/${reqId}`).update({ status: 'rejected' });
            const item = document.getElementById(`_catReqItem_${reqId}`);
            if (item) { item.style.opacity = '0'; setTimeout(() => item.remove(), 300); }

            // 배지 숫자 갱신
            setTimeout(async () => {
                const snap = await db.ref('categoryRequests').orderByChild('status').equalTo('pending').once('value');
                const cnt = snap.val() ? Object.keys(snap.val()).length : 0;
                const b = document.getElementById('_adminCatPendingBadge');
                if (b) { b.textContent = cnt; b.style.display = cnt > 0 ? 'inline' : 'none'; }
                const globalBadge = document.getElementById('_adminCatReqBadge');
                if (globalBadge) { globalBadge.textContent = cnt; globalBadge.style.display = cnt > 0 ? 'inline' : 'none'; }
            }, 400);

        } catch (e) {
            console.error('거절 오류:', e);
        }
    };

    window.removeCustomCategory = async function (catName) {
        if (typeof isAdmin === 'function' && !isAdmin()) return;
        if (!confirm(`"${catName}" 카테고리를 삭제하시겠습니까?\n해당 카테고리의 기사는 유지됩니다.`)) return;

        try {
            const snap = await db.ref('customCategories/approved')
                .orderByChild('name').equalTo(catName).once('value');
            if (snap.val()) {
                const updates = {};
                Object.keys(snap.val()).forEach(k => { updates[k] = null; });
                await db.ref('customCategories/approved').update(updates);
            }
            await loadCustomCategories();
            _renderCurrentCategories();
        } catch (e) {
            console.error('카테고리 삭제 오류:', e);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };


    // ====================================================================
    // 6. 더보기 메뉴 관리자 섹션에 배지 업데이트
    // ====================================================================
    async function checkPendingCategoryRequests() {
        if (typeof isAdmin !== 'function' || !isAdmin()) return;
        try {
            const snap = await db.ref('categoryRequests')
                .orderByChild('status').equalTo('pending').once('value');
            const count = snap.val() ? Object.keys(snap.val()).length : 0;
            const badge = document.getElementById('_adminCatReqBadge');
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline' : 'none';
            }
        } catch (e) { /* ignore */ }
    }


    // ====================================================================
    // 7. 초기화 — Firebase 준비 대기 후 카테고리 로드
    // ====================================================================
    function _init() {
        if (typeof db !== 'undefined' && db) {
            loadCustomCategories();
        } else {
            setTimeout(_init, 500);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
    } else {
        _init();
    }

    console.log('✅ category-manager.js 로드 완료');

})();