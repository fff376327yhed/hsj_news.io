// ===== wiki.js - 나무아래키 위키 시스템 =====
// 나무위키 스타일의 위키 기능 구현 (Firebase 연동)

(function () {
    'use strict';

    // ══════════════════════════════════════════════════════════
    // 0. 새 Firebase DB 연결 (나무아래키 전용)
    // ══════════════════════════════════════════════════════════

    // ✅ 아래 주소를 새로 만든 Firebase Realtime DB 주소로 교체하세요
    const WIKI_DB_URL = "https://minecraft-rpg-database-default-rtdb.firebaseio.com/";
    //  예시: "https://namuaraeki-default-rtdb.asia-southeast1.firebasedatabase.app"

    let db;
    // ✅ 메인 Firebase 앱 DB + auth 재사용
    db = firebase.database(firebase.app());
    const getAuth = () => {
        try { return firebase.auth(firebase.app()); } catch(e) { return null; }
    };

    // ✅ 자동 로그인: 메인앱 인증 상태 변경 감지 → 위키 헤더 자동 갱신
    setTimeout(() => {
        try {
            firebase.auth(firebase.app()).onAuthStateChanged(function(user) {
                var wikiSec = document.getElementById('wikiSection');
                if (!wikiSec || !wikiSec.classList.contains('active')) return;
                // 위키가 열려 있을 때 로그인/로그아웃 시 현재 페이지 새로고침
                window.showWiki();
            });
        } catch(e) {}
    }, 500);

    // ── 상수 ──────────────────────────────────────────────────
    const WIKI_PATH = 'wiki_articles';
    const HIST_PATH = 'wiki_history';
    const GREEN     = '#3a7f2d';
    const GREEN_D   = '#2a5e1f';
    const GREEN_L   = '#eaf4e3';
    const GREEN_B   = '#c8e6c9';

    let _wikiBack = null;
    let _wikiPageStack = []; // 방문 페이지 스택
    function _wikiPushStack(fn) { _wikiPageStack.push(fn); if (_wikiPageStack.length > 20) _wikiPageStack.shift(); }

    // ══════════════════════════════════════════════════════════
    // 1. 더보기 메뉴에 나무아래키 버튼 삽입
    // ══════════════════════════════════════════════════════════
    // ✅ URL 라우팅 훅 - ?page=wiki 처리
    (function patchWikiRoutes() {
        function _handleWikiRoute(doc) {
            if (!doc || doc === 'main') { window.showWiki(); return; }
            if (doc === '__new__') { window._wikiCreateNew(); return; }
            if (doc && doc.startsWith('__edit__')) { window._wikiEditArticle(doc.replace('__edit__','')); return; }
            window._wikiOpenArticle(doc);
        }

        // routeToPage 훅 (script.js) - 즉시 + 지연 모두 시도
        function _patchRouteToPage() {
            const _origRouteToPage = window.routeToPage;
            if (typeof _origRouteToPage === 'function' && !_origRouteToPage._wikiPatched) {
                window.routeToPage = function(page, articleId, section) {
                    if (page === 'wiki') { _handleWikiRoute(articleId); return; }
                    return _origRouteToPage.apply(this, arguments);
                };
                window.routeToPage._wikiPatched = true;
                return true;
            }
            return false;
        }
        if (!_patchRouteToPage()) {
            // routeToPage가 아직 없으면 나중에 다시 시도
            setTimeout(_patchRouteToPage, 500);
        }

        // handleRoute 훅 (혹시 있다면)
        const _origHandleRoute = window.handleRoute;
        if (typeof _origHandleRoute === 'function') {
            window.handleRoute = function(page, doc) {
                if (page === 'wiki') { _handleWikiRoute(doc); return; }
                return _origHandleRoute.apply(this, arguments);
            };
        }

        // ✅ popstate - 브라우저 뒤로가기/앞으로가기
        window.addEventListener('popstate', function(e) {
            const state = e.state || {};
            if (state.page === 'wiki') {
                // wiki 내부 이동
                _handleWikiRoute(state.articleId);
            } else {
                // 위키가 열려있으면 닫기
                var wikiSec = document.getElementById('wikiSection');
                if (wikiSec && wikiSec.classList.contains('active')) {
                    _wikiPageStack = [];
                    // wiki 섹션 숨기고 해당 페이지로 라우팅
                    if (typeof hideAll === 'function') hideAll();
                    if (state.page && typeof routeToPage === 'function') {
                        routeToPage(state.page, state.articleId, state.section);
                    } else if (typeof showMoreMenu === 'function') {
                        showMoreMenu();
                    }
                }
            }
        });
    })();

    const _origMoreMenu = window.showMoreMenu;
    window.showMoreMenu = function () {
        if (typeof _origMoreMenu === 'function') _origMoreMenu.apply(this, arguments);

        setTimeout(() => {
            const container = document.querySelector('.more-menu-container');
            if (!container || document.getElementById('wikiMoreMenuBtn')) return;

            const communityGrid = container.querySelector('.menu-section div[style*="grid"]');

            const btn = document.createElement('button');
            btn.id        = 'wikiMoreMenuBtn';
            btn.className = 'more-menu-btn';
            btn.style.cssText = 'border-color:' + GREEN + ';';
            btn.innerHTML = '<i class="fas fa-seedling" style="color:' + GREEN + ';"></i> 나무아래키';
            btn.onclick   = () => { window.showWiki(); if (typeof updateURL === 'function') updateURL('wiki', 'main'); };

            if (communityGrid) communityGrid.appendChild(btn);
        }, 60);
    };

    // ══════════════════════════════════════════════════════════
    // 2. URL 라우팅
    // ══════════════════════════════════════════════════════════
    // _sectionRoutes 등록
    if (window._sectionRoutes) {
        window._sectionRoutes['wiki'] = () => window.showWiki();
    }
    // 나중에 _sectionRoutes가 생성될 수도 있으므로 Object.defineProperty로 추가
    setTimeout(function() {
        if (window._sectionRoutes && !window._sectionRoutes['wiki']) {
            window._sectionRoutes['wiki'] = () => window.showWiki();
        }
    }, 1000);

    // ══════════════════════════════════════════════════════════
    // 3. 섹션 관리
    // ══════════════════════════════════════════════════════════
    // ✅ wikiSection 배경/레이아웃 CSS 주입
    (function injectWikiSectionStyle() {
        if (document.getElementById('_wikiSectionStyle')) return;
        const s = document.createElement('style');
        s.id = '_wikiSectionStyle';
        s.textContent = [
            '#wikiSection { display:none !important; background:#ffffff !important; }',
            '#wikiSection.active {',
            '  display:block !important;',
            '  position:fixed !important;',
            '  top:0 !important; left:0 !important;',
            '  right:0 !important; bottom:0 !important;',
            '  z-index:1000 !important;',
            '  background:#ffffff !important;',
            '  overflow-y:auto !important;',
            '  -webkit-overflow-scrolling:touch !important;',
            '}'
        ].join('\n');
        document.head.appendChild(s);
    })();

    function getWikiSection() {
        let s = document.getElementById('wikiSection');
        if (!s) {
            s = document.createElement('section');
            s.className = 'page-section';
            s.id = 'wikiSection';
            document.querySelector('main').appendChild(s);
        }
        return s;
    }

    function showSection(html) {
        if (typeof hideAll === 'function') hideAll();
        window.scrollTo(0, 0);
        const s = getWikiSection();
        s.classList.add('active');
        s.innerHTML = html + wikiStyles();
    }

    // ══════════════════════════════════════════════════════════
    // 4. 공통 CSS
    // ══════════════════════════════════════════════════════════
    function wikiStyles() {
        return '<style>\n'
            + '.nk-wrap{max-width:900px;margin:0 auto;font-family:"Noto Sans KR",sans-serif;font-size:15px;color:#222;background:#fff;min-height:100vh;}\n'
            + '.nk-header{background:' + GREEN + ';color:white;padding:10px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;}\n'
            + '.nk-logo{font-size:20px;font-weight:900;cursor:pointer;white-space:nowrap;letter-spacing:-0.5px;}\n'
            + '.nk-logo span{font-size:11px;opacity:.7;display:block;font-weight:400;}\n'
            + '.nk-search-form{display:flex;flex:1;min-width:120px;}\n'
            + '.nk-search-input{flex:1;padding:7px 12px;border:none;border-radius:6px 0 0 6px;font-size:14px;outline:none;color:#222;}\n'
            + '.nk-search-btn{padding:7px 14px;background:' + GREEN_D + ';color:white;border:none;border-radius:0 6px 6px 0;cursor:pointer;font-size:14px;}\n'
            + '.nk-search-btn:hover{background:#1e4a15;}\n'
            + '.nk-nav{display:flex;gap:6px;flex-wrap:wrap;}\n'
            + '.nk-nav-btn{background:rgba(255,255,255,.18);border:none;color:white;padding:6px 12px;border-radius:20px;cursor:pointer;font-size:12px;font-weight:600;white-space:nowrap;}\n'
            + '.nk-nav-btn:hover{background:rgba(255,255,255,.32);}\n'
            + '.nk-back-btn{background:rgba(255,255,255,.1);border:1.5px solid rgba(255,255,255,.4);color:white;padding:5px 12px;border-radius:20px;cursor:pointer;font-size:12px;font-weight:600;}\n'
            + '.nk-back-btn:hover{background:rgba(255,255,255,.25);}\n'
            + '.nk-body{padding:16px;background:#fff;min-height:calc(100vh - 60px);}\n'
            + '.nk-article-head{border-bottom:2px solid ' + GREEN + ';padding-bottom:8px;margin-bottom:14px;display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:8px;}\n'
            + '.nk-article-title{font-size:22px;font-weight:900;color:#111;}\n'
            + '.nk-article-tools{display:flex;gap:6px;flex-wrap:wrap;}\n'
            + '.nk-tool-btn{padding:5px 12px;font-size:12px;font-weight:700;border:1.5px solid ' + GREEN + ';color:' + GREEN + ';background:white;border-radius:6px;cursor:pointer;transition:all .15s;}\n'
            + '.nk-tool-btn:hover{background:' + GREEN_L + ';}\n'
            + '.nk-tool-btn.primary{background:' + GREEN + ';color:white;}\n'
            + '.nk-tool-btn.primary:hover{background:' + GREEN_D + ';}\n'
            + '.nk-notice{background:' + GREEN_L + ';border-left:4px solid ' + GREEN + ';padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:14px;font-size:13px;color:#333;}\n'
            + '.nk-warn{background:#fff8e1;border-left:4px solid #f9a825;padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:14px;font-size:13px;}\n'
            + '.nk-err{background:#ffebee;border-left:4px solid #c62828;padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:14px;font-size:13px;}\n'
            + '.nk-toc{background:#fafafa;border:1px solid #ddd;border-radius:8px;padding:14px 18px;display:inline-block;min-width:180px;max-width:320px;margin:0 0 16px 0;font-size:13px;}\n'
            + '.nk-toc-title{font-weight:700;font-size:14px;color:#333;margin-bottom:8px;}\n'
            + '.nk-toc ol{margin:0;padding-left:18px;}\n'
            + '.nk-toc li{line-height:1.9;}\n'
            + '.nk-toc a{color:' + GREEN + ';text-decoration:none;}\n'
            + '.nk-toc a:hover{text-decoration:underline;}\n'
            + '.nk-content{line-height:1.85;}\n'
            + '.nk-content h2{font-size:18px;font-weight:800;color:#111;border-bottom:2px solid ' + GREEN + ';padding-bottom:4px;margin:22px 0 10px;}\n'
            + '.nk-content h3{font-size:16px;font-weight:700;color:#333;border-bottom:1px solid #ccc;padding-bottom:3px;margin:18px 0 8px;}\n'
            + '.nk-content h4{font-size:15px;font-weight:700;color:#444;margin:14px 0 6px;}\n'
            + '.nk-content h5{font-size:14px;font-weight:700;color:#555;margin:12px 0 4px;}\n'
            + '.nk-content a{color:#0645ad;text-decoration:none;}\n'
            + '.nk-content a:hover{text-decoration:underline;}\n'
            + '.nk-content a.wiki-link{color:' + GREEN + ';font-weight:500;}\n'
            + '.nk-content a.wiki-link.red{color:#c62828;}\n'
            + '.nk-content blockquote{border-left:4px solid #bbb;padding:6px 14px;color:#555;margin:10px 0;background:#f9f9f9;border-radius:0 6px 6px 0;}\n'
            + '.nk-content hr{border:none;border-top:1px solid #ddd;margin:16px 0;}\n'
            + '.nk-content code{background:#f4f4f4;border:1px solid #ddd;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:13px;}\n'
            + '.nk-content pre{background:#f4f4f4;border:1px solid #ddd;padding:12px;border-radius:6px;overflow-x:auto;font-size:13px;line-height:1.5;}\n'
            + '.nk-content table{border-collapse:collapse;width:100%;margin:12px 0;font-size:14px;}\n'
            + '.nk-content table th{background:' + GREEN + ';color:white;padding:8px 12px;text-align:left;}\n'
            + '.nk-content table td{padding:7px 12px;border:1px solid #ddd;}\n'
            + '.nk-content table tr:nth-child(even) td{background:#f9f9f9;}\n'
            + '.nk-content ul{padding-left:22px;margin:6px 0;}\n'
            + '.nk-content ol{padding-left:22px;margin:6px 0;}\n'
            + '.nk-content li{line-height:1.8;}\n'
            + '.nk-content p{margin:8px 0;}\n'
            + '.fn{font-size:11px;vertical-align:super;color:' + GREEN + ';cursor:pointer;}\n'
            + '.nk-no-article{text-align:center;padding:60px 20px;color:#888;}\n'
            + '.nk-no-article i{font-size:48px;color:#bbb;display:block;margin-bottom:16px;}\n'
            + '.nk-no-article h3{font-size:18px;font-weight:700;color:#555;margin-bottom:8px;}\n'
            + '.nk-no-article p{font-size:14px;margin-bottom:20px;}\n'
            + '.nk-edit-textarea{width:100%;min-height:380px;padding:12px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;font-family:monospace;line-height:1.6;resize:vertical;box-sizing:border-box;}\n'
            + '.nk-edit-textarea:focus{border-color:' + GREEN + ';outline:none;}\n'
            + '.nk-edit-summary{width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;outline:none;box-sizing:border-box;}\n'
            + '.nk-edit-summary:focus{border-color:' + GREEN + ';}\n'
            + '.nk-markup-bar{display:flex;flex-wrap:wrap;gap:6px;padding:10px;background:#f5f5f5;border:1.5px solid #ddd;border-radius:8px 8px 0 0;}\n'
            + '.nk-markup-bar button{padding:4px 10px;font-size:12px;font-weight:700;border:1px solid #ccc;background:white;border-radius:4px;cursor:pointer;color:#333;transition:all .15s;}\n'
            + '.nk-markup-bar button:hover{background:' + GREEN_L + ';border-color:' + GREEN + ';color:' + GREEN + ';}\n'
            + '.nk-markup-guide{background:#fafafa;border:1px solid #eee;border-radius:8px;padding:12px 16px;font-size:12px;color:#555;line-height:1.9;margin-top:10px;}\n'
            + '.nk-markup-guide code{background:#eee;padding:1px 5px;border-radius:3px;}\n'            + '.nk-tb-sep{width:1px;background:#ddd;margin:2px 4px;align-self:stretch;display:inline-block;}\n'            + '.nk-toc{background:#f8f9fa;border:1px solid #dee2e6;border-radius:4px;padding:14px 18px;display:inline-block;min-width:200px;max-width:340px;margin:12px 0 18px 0;}\n'            + '.nk-toc-title{font-size:13px;font-weight:800;color:#333;margin-bottom:8px;}\n'            + '.nk-toc ol{margin:0;padding-left:16px;} .nk-toc li{font-size:13px;line-height:1.9;}\n'            + '.nk-toc a{color:#0d6efd;text-decoration:none;} .nk-toc a:hover{text-decoration:underline;}\n'            + '.nk-content h2{font-size:18px;font-weight:800;border-bottom:2px solid #3a7f2d;color:#1a1a1a;margin:24px 0 10px;padding-bottom:4px;}\n'            + '.nk-content h3{font-size:15px;font-weight:700;border-bottom:1px solid #dee2e6;color:#333;margin:18px 0 8px;padding-bottom:3px;}\n'            + '.nk-content h4{font-size:14px;font-weight:700;color:#555;margin:14px 0 6px;}\n'            + '.nk-content p{line-height:1.75;margin:6px 0;font-size:14px;}\n'            + '.nk-content ul,.nk-content ol{padding-left:20px;} .nk-content li{line-height:1.75;font-size:14px;}\n'            + '.nk-content blockquote{border-left:4px solid #3a7f2d;background:#f0f9f0;margin:10px 0;padding:10px 16px;border-radius:0 8px 8px 0;font-size:14px;color:#444;}\n'            + '.nk-content table{border-collapse:collapse;width:100%;margin:12px 0;font-size:14px;}\n'            + '.nk-content th,.nk-content td{border:1px solid #dee2e6;padding:8px 12px;text-align:left;}\n'            + '.nk-content th{background:#3a7f2d;color:white;font-weight:700;}\n'            + '.nk-content tr:nth-child(even) td{background:#f8f9fa;}\n'            + '.nk-content code{background:#272822;color:#f8f8f2;padding:2px 6px;border-radius:4px;font-size:13px;font-family:monospace;}\n'            + '.nk-content pre{background:#272822;color:#f8f8f2;padding:14px 16px;border-radius:8px;overflow-x:auto;font-size:13px;line-height:1.6;margin:10px 0;}\n'            + '.nk-content .wiki-link{color:#0d6efd;text-decoration:none;} .nk-content .wiki-link:hover{text-decoration:underline;}\n'            + '.nk-content .wiki-link.redlink{color:#c62828;}\n'            + '.nk-content sup.fn{cursor:help;color:#0d6efd;font-size:11px;}\n'            + '.nk-infobox{float:right;clear:right;margin:0 0 16px 20px;border:1px solid #dee2e6;border-radius:4px;overflow:hidden;min-width:200px;max-width:320px;font-size:13px;}\n'            + '.nk-infobox-title{background:#3a7f2d;color:white;text-align:center;padding:8px 12px;font-weight:800;font-size:15px;}\n'            + '.nk-infobox table{width:100%;border-collapse:collapse;margin:0;}\n'            + '.nk-infobox td{border:1px solid #dee2e6;padding:7px 10px;vertical-align:top;}\n'            + '.nk-infobox td:first-child{background:#eaf4e3;font-weight:700;white-space:nowrap;width:35%;}\n'            + '.clearfix::after{content:\'\';display:block;clear:both;}\n'
            + '.nk-history-item{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:13px;}\n'
            + '.nk-history-rev{background:' + GREEN + ';color:white;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0;}\n'
            + '.nk-history-info{flex:1;}\n'
            + '.nk-history-editor{font-weight:600;color:#333;}\n'
            + '.nk-history-time{color:#888;font-size:12px;}\n'
            + '.nk-history-summary{color:#555;margin-top:2px;font-style:italic;}\n'
            + '.nk-recent-item{padding:12px 0;border-bottom:1px solid #f0f0f0;display:flex;gap:12px;align-items:flex-start;}\n'
            + '.nk-recent-badge{background:' + GREEN_B + ';color:' + GREEN_D + ';padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0;}\n'
            + '.nk-recent-badge.new{background:#e3f2fd;color:#1976d2;}\n'
            + '.nk-card{background:white;border:1px solid #e0e0e0;border-radius:12px;padding:16px;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,.06);}\n'
            + '.nk-card h3{font-size:15px;font-weight:700;color:' + GREEN_D + ';margin:0 0 10px;border-bottom:1px solid ' + GREEN_B + ';padding-bottom:6px;}\n'
            + '.nk-article-list-item{padding:9px 0;border-bottom:1px solid #f5f5f5;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:color .15s;}\n'
            + '.nk-article-list-item:last-child{border-bottom:none;}\n'
            + '.nk-article-list-item:hover{color:' + GREEN + ';}\n'
            + '.nk-article-list-item i{color:' + GREEN + ';font-size:13px;}\n'
            + '@media(max-width:600px){'
            + '.nk-header{padding:8px 12px;gap:8px;}'
            + '.nk-article-tools{justify-content:flex-end;}'
            + '.nk-article-title{font-size:18px;}'
            + '}\n'
            + '</style>';
    }

    // ══════════════════════════════════════════════════════════
    // 5. 공통 헤더
    // ══════════════════════════════════════════════════════════
    function wikiHeader(opts) {
        opts = opts || {};
        const user = getAuth()?.currentUser || null;
        const name = user ? (user.displayName || user.email.split('@')[0] || '사용자') : null;

        const loginBtn = name
            ? '<button class="nk-nav-btn" onclick="window._wikiProfile()">'
              + '<i class="fas fa-user"></i> ' + escapeHtml(name.substring(0, 8)) + ' ▾'
              + '</button>'
            : '<button class="nk-nav-btn" onclick="window._wikiLogin()">'
              + '<i class="fas fa-sign-in-alt"></i> 로그인'
              + '</button>';

        // ✅ 헤더 렌더링 후 비동기로 관리자 탭 삽입
        setTimeout(async function() {
            var slot = document.getElementById('wikiAdminNavSlot');
            if (!slot) return;
            var isAdm = false;
            try { if (typeof isAdminAsync === 'function') isAdm = await isAdminAsync(); } catch(e) {}
            if (isAdm) {
                slot.innerHTML = '<button class="nk-nav-btn" style="background:rgba(255,200,0,0.25);border:1px solid rgba(255,200,0,0.5);" onclick="window._wikiAdminPanel()"><i class="fas fa-shield-alt"></i> 관리자</button>';
            }
        }, 300);

        return '<div class="nk-wrap">'
            + '<div class="nk-header">'
            + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">'
            + '<button class="nk-back-btn" onclick="window._wikiGoBack()"><i class="fas fa-arrow-left"></i></button>'
            + '<div class="nk-logo" onclick="window.showWiki()">🌳 나무아래키<span>해정뉴스 위키</span></div>'
            + '</div>'
            + '<form class="nk-search-form" onsubmit="window._wikiSearchSubmit(event)">'
            + '<input class="nk-search-input" id="wikiSearchInput" placeholder="문서 검색..." value="' + escapeHtml(opts.searchVal || '') + '">'
            + '<button class="nk-search-btn" type="submit"><i class="fas fa-search"></i></button>'
            + '</form>'
            + '<div class="nk-nav">'
            + '<button class="nk-nav-btn" onclick="window._wikiRecentChanges()"><i class="fas fa-history"></i> 최근</button>'
            + '<button class="nk-nav-btn" onclick="window._wikiCreateNew()"><i class="fas fa-plus"></i> 새 문서</button>'
            + '<span id="wikiAdminNavSlot"></span>'
            + loginBtn
            + '</div>'
            + '</div>'
            + '<div class="nk-body">';
    }

    function wikiFooter() {
        return '</div></div>';
    }

    // ══════════════════════════════════════════════════════════
    // 6. DB 체크
    // ══════════════════════════════════════════════════════════
    function checkDB() {
        if (!db) throw new Error('데이터베이스가 연결되지 않았습니다. wiki.js 상단 WIKI_DB_URL을 확인하세요.');
    }

    // ══════════════════════════════════════════════════════════
    // 7. 메인 페이지
    // ══════════════════════════════════════════════════════════
    window.showWiki = async function () {
        // showWiki = 항상 스택 베이스(루트)
        _wikiPageStack = [function() { window.showWiki(); }];
        showSection(
            wikiHeader()
            + '<div class="nk-notice">'
            + '<i class="fas fa-seedling" style="color:' + GREEN + ';margin-right:6px;"></i>'
            + '<strong>나무아래키</strong>에 오신 것을 환영합니다! 누구나 읽고, 로그인하면 편집할 수 있는 위키입니다.'
            + '</div>'
            + '<div id="wikiMainContent">'
            + '<div style="text-align:center;padding:40px 0;color:#aaa;">'
            + '<i class="fas fa-spinner fa-spin" style="font-size:24px;"></i>'
            + '<p style="margin-top:12px;">문서 목록을 불러오는 중...</p>'
            + '</div></div>'
            + wikiFooter()
        );

        // ✅ wiki 진입 URL을 replaceState로 (pushState하면 뒤로가기로 돌아올 수 없음)
        try {
            window.history.replaceState({ page: 'wiki', articleId: 'main' }, '', '?page=wiki&id=main');
        } catch(e) {}

        try {
            checkDB();

            const [recentSnap, totalSnap] = await Promise.all([
                db.ref(WIKI_PATH).orderByChild('lastEdited').limitToLast(6).once('value'),
                db.ref(WIKI_PATH).once('value')
            ]);

            const total = totalSnap.numChildren();
            const recent = [];
            recentSnap.forEach(function(c) { recent.unshift({ key: c.key, title: c.val().title, lastEdited: c.val().lastEdited, lastEditor: c.val().lastEditor, editCount: c.val().editCount || 1 }); });

            const recentHTML = recent.length
                ? recent.map(function(a) {
                    return '<div class="nk-article-list-item" onclick="window._wikiOpenArticle(' + "'" + encodeURIComponent(a.key) + "'" + ')">'
                        + '<i class="fas fa-file-alt"></i>'
                        + '<span style="flex:1;font-weight:600;">' + escapeHtml(a.title) + '</span>'
                        + '<span style="font-size:11px;color:#bbb;">' + timeAgo(a.lastEdited) + '</span>'
                        + '</div>';
                }).join('')
                : '<p style="color:#aaa;font-size:13px;margin:0;">아직 작성된 문서가 없습니다.</p>';

            const allList = [];
            totalSnap.forEach(function(c) { allList.push({ key: c.key, title: c.val().title }); });
            allList.sort(function(a, b) { return a.title.localeCompare(b.title, 'ko'); });

            var _mainEl = document.getElementById('wikiMainContent');
            if (!_mainEl) return; // 페이지 이동 중이면 중단
            _mainEl.innerHTML =
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:4px;">'
                + '<div class="nk-card">'
                + '<h3><i class="fas fa-star" style="color:#f9a825;margin-right:6px;"></i>대문</h3>'
                + '<div style="font-size:14px;line-height:1.9;color:#444;">'
                + '<strong>나무아래키</strong>는 <strong>해정뉴스</strong> 커뮤니티의 자체 위키 서비스입니다.<br>'
                + '현재 <strong style="color:' + GREEN + ';">' + total + '개</strong>의 문서가 등록되어 있습니다.<br><br>'
                + '<button class="nk-tool-btn primary" onclick="window._wikiCreateNew()" style="font-size:13px;padding:8px 16px;">'
                + '<i class="fas fa-pen"></i>&nbsp; 새 문서 작성</button>'
                + '</div></div>'
                + '<div class="nk-card">'
                + '<h3><i class="fas fa-clock" style="margin-right:6px;"></i>최근 편집된 문서</h3>'
                + recentHTML
                + '<div style="margin-top:10px;">'
                + '<button class="nk-tool-btn" onclick="window._wikiRecentChanges()" style="width:100%;display:flex;justify-content:center;">전체 보기 →</button>'
                + '</div></div></div>'
                + '<div class="nk-card">'
                + '<h3><i class="fas fa-list" style="margin-right:6px;"></i>모든 문서 <span style="font-size:13px;font-weight:400;color:#aaa;margin-left:6px;">(' + total + '개)</span></h3>'
                + (allList.length
                    ? allList.map(function(a) {
                        return '<div class="nk-article-list-item" onclick="window._wikiOpenArticle(' + "'" + encodeURIComponent(a.key) + "'" + ')">'
                            + '<i class="fas fa-file-alt"></i>'
                            + '<span style="flex:1;">' + escapeHtml(a.title) + '</span>'
                            + '<i class="fas fa-chevron-right" style="font-size:11px;color:#ddd;"></i>'
                            + '</div>';
                    }).join('')
                    : '<p style="color:#aaa;font-size:13px;margin:0;">문서가 없습니다. 첫 번째 문서를 작성해보세요!</p>')
                + '</div>';

        } catch (err) {
            console.error('위키 로딩 실패:', err);
            var mainEl = document.getElementById('wikiMainContent');
            if (mainEl) mainEl.innerHTML =
                '<div class="nk-err">'
                + '<strong><i class="fas fa-exclamation-triangle"></i> 데이터베이스 오류</strong><br>'
                + escapeHtml(err.message) + '<br><br>'
                + '<small>wiki.js 상단 <code>WIKI_DB_URL</code>을 새 Firebase DB 주소로 교체하고, '
                + 'Firebase 콘솔에서 보안 규칙을 설정해주세요.</small>'
                + '</div>';
        }
    };

    // ══════════════════════════════════════════════════════════
    // 8. 문서 보기
    // ══════════════════════════════════════════════════════════
    // ✅ 다른 문서 열고 특정 섹션으로 이동
    window._wikiOpenArticleSection = function (key, section) {
        try { while (key !== decodeURIComponent(key)) key = decodeURIComponent(key); } catch(e) {}
        try { while (section !== decodeURIComponent(section)) section = decodeURIComponent(section); } catch(e) {}
        // 문서를 열고 렌더링 완료 후 섹션으로 스크롤
        window._wikiOpenArticle(key);
        // 렌더링 완료 대기 후 스크롤 (500ms)
        setTimeout(function() {
            var headings = document.querySelectorAll('.nk-content h2,.nk-content h3,.nk-content h4,.nk-content h5');
            for (var i = 0; i < headings.length; i++) {
                if (headings[i].textContent.trim() === section) {
                    headings[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // 이동한 섹션 잠깐 하이라이트
                    headings[i].style.transition = 'background 0.3s';
                    headings[i].style.background = '#fffde7';
                    setTimeout(function(el) { el.style.background = ''; }.bind(null, headings[i]), 1500);
                    break;
                }
            }
        }, 600);
    };

    window._wikiOpenArticle = function (key) {
        try { while (key !== decodeURIComponent(key)) { key = decodeURIComponent(key); } } catch(e) {}
        // 현재 함수를 스택에 추가
        _wikiPushStack(function() { window._wikiOpenArticle(key); });
        if (!key) return;
        // ✅ 문서 열기 URL은 pushState (이전 문서로 뒤로가기 가능)
        try {
            window.history.pushState({ page: 'wiki', articleId: key }, '', '?page=wiki&id=' + encodeURIComponent(key));
        } catch(e) {}

        showSection(
            wikiHeader()
            + '<div style="text-align:center;padding:50px 0;color:#aaa;">'
            + '<i class="fas fa-spinner fa-spin" style="font-size:28px;"></i>'
            + '<p style="margin-top:14px;font-size:14px;">문서를 불러오는 중...</p>'
            + '</div>'
            + wikiFooter()
        );

        db.ref(WIKI_PATH + '/' + key).once('value').then(function(snap) {
            var data = snap.val();
            window._wikiArticleImages = (data && data.images) || {};
            if (!data) {
                showSection(
                    wikiHeader()
                    + '<div class="nk-no-article">'
                    + '<i class="fas fa-ghost"></i>'
                    + '<h3>존재하지 않는 문서입니다</h3>'
                    + '<p>삭제되었거나 주소가 잘못되었습니다.</p>'
                    + '<button class="nk-tool-btn primary" onclick="window.showWiki()">메인으로</button>'
                    + '</div>'
                    + wikiFooter()
                );
                return;
            }
            _renderArticle(key, data);
        }).catch(function(err) {
            showSection(
                wikiHeader()
                + '<div class="nk-err">문서를 불러오는데 실패했습니다: ' + escapeHtml(err.message) + '</div>'
                + wikiFooter()
            );
        });
    };

    function _renderArticle(key, data) {
        var parsed  = parseNamuMark(data.content || '');
        var user    = getAuth()?.currentUser || null;
        var canEdit = !!user;
        var editedAt = data.lastEdited ? new Date(data.lastEdited).toLocaleString('ko-KR') : '';


        showSection(
            wikiHeader()
            + '<div class="nk-article-head">'
            + '<div class="nk-article-title">' + escapeHtml(data.title) + '</div>'
            + '<div class="nk-article-tools">'
            + (canEdit
                ? '<button class="nk-tool-btn primary" onclick="window._wikiEditArticle(' + "'" + encodeURIComponent(key) + "'" + ')">'
                  + '<i class="fas fa-pen"></i> 편집</button>'
                : '')
            + '<button class="nk-tool-btn" onclick="window._wikiShowHistory(' + "'" + encodeURIComponent(key) + "'" + ')">'
            + '<i class="fas fa-history"></i> 역사</button>'
            + (canEdit ? '<button class="nk-tool-btn" style="color:#c62828;border-color:#c62828;margin-left:4px;" onclick="window._wikiDeleteArticle(\'' + encodeURIComponent(key) + '\')" ><i class="fas fa-trash-alt"></i> 삭제</button>' : '')
            + '</div></div>'
            + (editedAt
                ? '<div style="font-size:12px;color:#bbb;margin-bottom:14px;">'
                  + '마지막 편집: ' + editedAt
                  + ' &nbsp;·&nbsp; ' + escapeHtml(data.lastEditor || '익명')
                  + ' &nbsp;·&nbsp; 총 ' + (data.editCount || 1) + '회 수정'
                  + '</div>'
                : '')
            + '<div class="nk-content">' + parsed + '</div>'
            + (!canEdit
                ? '<div class="nk-warn" style="margin-top:20px;">'
                  + '<i class="fas fa-lock"></i> 문서를 편집하려면 '
                  + '<a href="#" onclick="window._wikiLogin();return false;" style="color:#c62828;font-weight:700;">로그인</a>'
                  + '이 필요합니다.</div>'
                : '')
            + wikiFooter()
        );

    }

    // ══════════════════════════════════════════════════════════
    // 9. 문서 편집
    // ══════════════════════════════════════════════════════════
    window._wikiEditArticle = async function (key) {
        try { while (key !== decodeURIComponent(key)) { key = decodeURIComponent(key); } } catch(e) {}
        if (!getAuth()?.currentUser) { window._wikiLogin(); return; }

        var user = getAuth().currentUser;
        var snap = await db.ref(WIKI_PATH + '/' + key).once('value');
        var data = snap.val() || {};

        // ✅ 관리자는 바로 편집
        var isAdm = false;
        try { if (typeof isAdminAsync === 'function') isAdm = await isAdminAsync(); } catch(e) {}

        // ✅ 작성자 본인 or allowAllEdits or 관리자 → 바로 편집
        var isAuthor = data.creatorUid === user.uid;
        var allowAll = data.allowAllEdits === true;

        if (isAdm || isAuthor || allowAll) {
            if (typeof updateURL === 'function') updateURL('wiki', '__edit__' + key);
            _renderEditForm(key, data.title || '', data.content || '', data.allowAllEdits || false, isAuthor || isAdm);
            return;
        }

        // ✅ 일반 유저 → 수정 요청 모달
        _wikiShowEditRequestModal(key, data, user);
    };

    window._wikiDeleteArticle = async function (key) {
        try { while (key !== decodeURIComponent(key)) { key = decodeURIComponent(key); } } catch(e) {}
        var user = getAuth()?.currentUser;
        if (!user) { alert('로그인이 필요합니다.'); return; }

        var snap = await db.ref(WIKI_PATH + '/' + key).once('value');
        var data = snap.val() || {};

        var isAdm = false;
        try { if (typeof isAdminAsync === 'function') isAdm = await isAdminAsync(); } catch(e) {}
        var isAuthor = data.creatorUid === user.uid;

        if (!isAdm && !isAuthor) { alert('작성자 또는 관리자만 삭제할 수 있습니다.'); return; }
        if (!confirm('정말 "' + key + '" 문서를 삭제하시겠습니까? 되돌릴 수 없습니다.')) return;
        try {
            await db.ref(WIKI_PATH + '/' + key).remove();
            await db.ref(HIST_PATH + '/' + key).remove();
            alert('문서가 삭제되었습니다.');
            window.showWiki();
        } catch(e) { alert('삭제 실패: ' + e.message); }
    };

    window._wikiCreateNew = function () {
        if (typeof updateURL === 'function') updateURL('wiki', '__new__');
        if (!getAuth()?.currentUser) {
            alert('로그인 후 문서를 작성할 수 있습니다.');
            window._wikiLogin();
            return;
        }
        _renderEditForm(null, '', '');
    };

    function _renderEditForm(key, title, content, allowAllEdits, isAuthorOrAdmin) {
        var backFn = 'window._wikiGoBack()';

        showSection(
            wikiHeader()
            + '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:14px;">'
            + '<h2 style="font-size:18px;font-weight:800;color:' + GREEN_D + ';margin:0;">'
            + '<i class="fas fa-pen"></i>&nbsp;' + (key ? '문서 편집' : '새 문서 작성')
            + '</h2>'
            + '<div style="display:flex;gap:8px;flex-wrap:wrap;">'
            + '<button class="nk-tool-btn" onclick="window._wikiPreviewContent()"><i class="fas fa-eye"></i> 미리보기</button>'
            + '<button class="nk-tool-btn primary" onclick="window._wikiSaveArticle(' + "'" + (key ? encodeURIComponent(key) : '') + "'" + ')"><i class="fas fa-save"></i> 저장</button>'
            + (isAuthorOrAdmin && key ? '<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#555;cursor:pointer;padding:4px 8px;background:#f8f9fa;border-radius:6px;"><input type="checkbox" id="wikiAllowAllEdits" ' + (allowAllEdits ? 'checked' : '') + ' style="width:14px;height:14px;cursor:pointer;"> 모든 사용자가 수정 가능 (나무위키 방식)</label>' : '')
            + '<button class="nk-tool-btn" onclick="' + backFn + '">취소</button>'
            + '</div></div>'

            + (!key
                ? '<div style="margin-bottom:12px;">'
                  + '<label style="font-size:13px;font-weight:700;color:#333;display:block;margin-bottom:6px;">문서 제목</label>'
                  + '<input id="wikiNewTitle" class="nk-edit-summary" placeholder="문서 제목을 입력하세요" value="' + escapeHtml(title) + '" style="font-size:15px;font-weight:600;">'
                  + '</div>'
                : '<div style="font-size:16px;font-weight:700;color:#333;margin-bottom:12px;padding:10px 14px;background:' + GREEN_L + ';border-radius:8px;">'
                  + '<i class="fas fa-file-alt" style="color:' + GREEN + ';margin-right:8px;"></i>' + escapeHtml(title || '(제목 없음)')
                  + '</div>')

            + '<div class="nk-markup-bar" id="wikiToolbar">'
            + '<span style="font-size:11px;color:#888;font-weight:700;padding:2px 4px;">문단</span>'            + '<button onclick="window._wikiInsert(\'== \',\' ==\')">H2</button>'            + '<button onclick="window._wikiInsert(\'=== \',\' ===\')">H3</button>'            + '<button onclick="window._wikiInsert(\'==== \',\' ====\')">H4</button>'            + '<span class="nk-tb-sep"></span>'
            + '<span style="font-size:11px;color:#888;font-weight:700;padding:2px 4px;">글자</span>'            + '<button onclick="window._wikiWrap(\'\'\'\'\'\'\')"><b>굵게</b></button>'            + '<button onclick="window._wikiWrap(\'\'\'\'\')"><i>기울임</i></button>'            + '<button onclick="window._wikiWrap(\'__\',\'__\')"><u>밑줄</u></button>'            + '<button onclick="window._wikiWrap(\'--\',\'--\')"><del>취소선</del></button>'            + '<button onclick="window._wikiWrap(\'~~\',\'~~\')"><mark style="background:#ffe066;padding:0 2px;">형광펜</mark></button>'            + '<button onclick="window._wikiWrap(\'.^\',\'.^\')">위<sup>첨</sup></button>'            + '<button onclick="window._wikiWrap(\',,\',\',,\')">아<sub>래</sub></button>'            + '<span class="nk-tb-sep"></span>'
            + '<span style="font-size:11px;color:#888;font-weight:700;padding:2px 4px;">크기/색</span>'            + '<button onclick="window._wikiWrap(\'{{{+1 \',\'}}}\')">크게</button>'            + '<button onclick="window._wikiWrap(\'{{{-1 \',\'}}}\')">작게</button>'            + '<button onclick="window._wikiColorPrompt()">🎨 색상</button>'            + '<span class="nk-tb-sep"></span>'
            + '<span style="font-size:11px;color:#888;font-weight:700;padding:2px 4px;">구조</span>'            + '<button onclick="window._wikiInsert(\'* \',\'\')">• 목록</button>'            + '<button onclick="window._wikiInsert(\'1. \',\'\')">1. 번호</button>'            + '<button onclick="window._wikiWrap(\'>\', \'\')">❝ 인용</button>'            + '<button onclick="window._wikiInsert(\'----\\n\',\'\')">─ 선</button>'            + '<span class="nk-tb-sep"></span>'
            + '<span style="font-size:11px;color:#888;font-weight:700;padding:2px 4px;">삽입</span>'            + '<button onclick="window._wikiInsert(\'[[\',\'|표시텍스트]]\')">[[링크]]</button>'            + '<button onclick="window._wikiLinkPrompt()">🔗 외부링크</button>'            + '<button onclick="window._wikiWrap(\'[* \',\']\')">각주</button>'            + '<button onclick="window._wikiWrap(\'{{{\',\'}}}\')"><code>코드</code></button>'            + '<button onclick="window._wikiInsert(\'[목차]\\n\',\'\')">📋 목차</button>'            + '<button onclick="window._wikiInsert(\'||제목||제목||\\n||내용||내용||\\n\',\'\')">⊞ 표</button>'            + '<button onclick="window._wikiInsert(\'## \',\'\')">## 주석</button>'            + '</div>'

            + '<textarea class="nk-edit-textarea" id="wikiEditArea"'
            + ' style="border-top-left-radius:0;border-top-right-radius:0;"'
            + ' placeholder="나무마크로 내용을 작성하세요...\n\n예시)\n[목차]\n\n== 개요 ==\n내용을 여기에 작성하세요.\n\n== 특징 ==\n=== 편집 방법 ===\n* 누구나 편집할 수 있습니다\n* [[다른문서]] 로 내부 링크를 만들 수 있습니다">'
            + escapeHtml(content)
            + '</textarea>'

            + '<input id="wikiEditSummary" class="nk-edit-summary" placeholder="편집 요약 (선택) — 무엇을 변경했나요?" style="margin-top:8px;">'

            + '<div id="wikiPreviewArea" style="display:none;margin-top:12px;">'
            + '<div style="font-size:14px;font-weight:700;color:#555;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid ' + GREEN + ';">📄 미리보기</div>'
            + '<div id="wikiPreviewContent" class="nk-content" style="padding:16px;background:#fafafa;border:1px solid #eee;border-radius:8px;"></div>'
            + '</div>'

            + '<div class="nk-markup-guide">'
            + '<strong>📖 나무마크 문법 가이드</strong><br>'
            + '<code>== 제목 ==</code> 대제목 &nbsp; <code>=== 소제목 ===</code> 소제목 &nbsp; <code>\'\'\'굵게\'\'\'</code> 굵게 &nbsp; <code>\'\'기울임\'\'</code> 기울임 &nbsp; <code>__밑줄__</code> 밑줄 &nbsp; <code>--취소선--</code> 취소선<br>'
            + '<code>[[문서명]]</code> 내부링크 &nbsp; <code>[[문서명|표시텍스트]]</code> 링크별칭 &nbsp; <code>[목차]</code> 자동목차 &nbsp; <code>----</code> 구분선<br>'
            + '<code>* 항목</code> 점목록 &nbsp; <code>1. 항목</code> 번호목록 &nbsp; <code>&gt; 인용</code> 인용구 &nbsp; <code>||셀||셀||</code> 표<br>'
            + '<code>{{{코드}}}</code> 인라인코드 &nbsp; <code>{{{#ff0000 빨간텍스트}}}</code> 컬러텍스트 &nbsp; <code>[* 각주내용]</code> 각주'
            + '</div>'
            + wikiFooter()
        );
    }

    // 실시간 미리보기용 debounce 타이머
    var _previewDebounceTimer = null;

    function _updatePreviewNow() {
        var area = document.getElementById('wikiEditArea');
        var cont = document.getElementById('wikiPreviewContent');
        if (!area || !cont) return;
        cont.innerHTML = parseNamuMark(area.value);
    }

    function _onPreviewInput() {
        clearTimeout(_previewDebounceTimer);
        _previewDebounceTimer = setTimeout(_updatePreviewNow, 300); // 300ms 후 반영
    }

    window._wikiPreviewContent = function () {
        var area = document.getElementById('wikiEditArea');
        var prev = document.getElementById('wikiPreviewArea');
        var cont = document.getElementById('wikiPreviewContent');
        if (!area || !prev || !cont) return;

        var isOpen = prev.style.display !== 'none';

        if (isOpen) {
            // 미리보기 닫기 → 실시간 리스너 제거
            prev.style.display = 'none';
            area.removeEventListener('input', _onPreviewInput);
        } else {
            // 미리보기 열기 → 즉시 렌더링 + 실시간 리스너 등록
            cont.innerHTML = parseNamuMark(area.value);
            prev.style.display = 'block';
            prev.scrollIntoView({ behavior: 'smooth', block: 'start' });
            area.removeEventListener('input', _onPreviewInput); // 중복 방지
            area.addEventListener('input', _onPreviewInput);
        }
    };

    window._wikiInsert = function (before, after) {
        var ta = document.getElementById('wikiContent') || document.getElementById('wikiEditArea');
        if (!ta) return;
        after = after || '';
        var s = ta.selectionStart, e = ta.selectionEnd;
        var sel = ta.value.substring(s, e);
        ta.value = ta.value.substring(0, s) + before + sel + after + ta.value.substring(e);
        ta.focus();
        ta.setSelectionRange(s + before.length, s + before.length + sel.length);
    };
    window._wikiWrap = function (before, after) {
        var ta = document.getElementById('wikiContent') || document.getElementById('wikiEditArea');
        if (!ta) return;
        if (after === undefined) after = before;
        var s = ta.selectionStart, e = ta.selectionEnd;
        var sel = ta.value.substring(s, e) || '텍스트';
        ta.value = ta.value.substring(0, s) + before + sel + after + ta.value.substring(e);
        ta.focus();
        ta.setSelectionRange(s + before.length, s + before.length + sel.length);
    };
    window._wikiUploadImage = function (input) {
        var file = input.files && input.files[0];
        if (!file) return;
        var MAX = 1.5 * 1024 * 1024; // 1.5MB
        if (file.size > MAX) { alert('이미지는 1.5MB 이하만 가능합니다.'); input.value=''; return; }
        var status = document.getElementById('wikiImgStatus');
        if (status) status.textContent = '⏳ 이미지 처리 중...';
        var reader = new FileReader();
        reader.onload = function(e) {
            var base64 = e.target.result;
            // 이미지를 [[파일:파일명]] 형식으로 삽입하고 base64는 별도 저장
            var fname = 'img_' + Date.now();
            var ta = document.getElementById('wikiContent') || document.getElementById('wikiEditArea');
            if (ta) {
                var s = ta.selectionStart;
                var ins = '[[파일:' + fname + ']]';
                ta.value = ta.value.substring(0, s) + ins + ta.value.substring(s);
                ta.setSelectionRange(s + ins.length, s + ins.length);
                ta.focus();
            }
            // base64를 임시 저장 (저장 시 문서와 함께 업로드)
            if (!window._wikiTempImages) window._wikiTempImages = {};
            window._wikiTempImages[fname] = base64;
            if (status) status.textContent = '✅ 이미지 첨부됨 (' + Math.round(file.size/1024) + 'KB)';
            input.value = '';
        };
        reader.readAsDataURL(file);
    };

    window._wikiColorPrompt = function () {
        var preset = ['red','blue','green','orange','purple','#888888'];
        
        var choice = prompt('색상 번호 입력: 1.빨강 2.파랑 3.초록 4.주황 5.보라 6.회색 7.직접입력');
        if (!choice) return;
        var idx = parseInt(choice) - 1;
        var color = (idx >= 0 && idx < preset.length) ? preset[idx]
                  : (prompt('색상 입력 (예: #ff0000)') || '');
        if (!color) return;
        window._wikiWrap('{{{#' + color + ' ', '}}}');
    };
    window._wikiLinkPrompt = function () {
        var url = prompt('URL 입력 (https://...)');
        if (!url) return;
        var label = prompt('표시 텍스트') || url;
        window._wikiInsert('[' + url + ' ' + label + ']', '');
    };

    // ── 저장 ─────────────────────────────────────────────────
    window._wikiSaveArticle = async function (key) {
        try { if (key) { while (key !== decodeURIComponent(key)) key = decodeURIComponent(key); } } catch(e) {}
        if (!getAuth()?.currentUser) {
            alert('로그인이 필요합니다.');
            window._wikiLogin();
            return;
        }

        var area    = document.getElementById('wikiEditArea');
        var sumEl   = document.getElementById('wikiEditSummary');
        var content = area  ? area.value.trim()  : '';
        var summary = sumEl ? sumEl.value.trim() : '';

        if (!content) { alert('내용을 입력해주세요.'); return; }

        var articleTitle, articleKey;
        if (!key || key === 'null' || key === 'undefined') {
            key = ''; // 새 문서
            // wikiSection 내부에서 제목 input 탐색 (전체 document보다 안전)
            var titleEl = document.getElementById('wikiNewTitle')
                        || document.querySelector('#wikiSection #wikiNewTitle')
                        || document.querySelector('input[id="wikiNewTitle"]');
            articleTitle = titleEl ? titleEl.value.trim() : '';
            if (!articleTitle) {
                alert('문서 제목을 입력해주세요.');
                if (titleEl) titleEl.focus();
                return;
            }
            articleKey = articleTitle.replace(/\s+/g, '_').replace(/[.#$\[\]/]/g, '').substring(0, 80);
        } else {
            articleKey = key;
            var titleSnap = await db.ref(WIKI_PATH + '/' + key + '/title').once('value');
            articleTitle  = titleSnap.val() || key;
        }

        try {
            if (typeof showLoadingIndicator === 'function') showLoadingIndicator('저장 중...');

            var user  = getAuth()?.currentUser;
            var email = user.displayName || user.email || '익명';
            var now   = Date.now();

            // 기존 버전 history 백업
            if (key) {
                var oldSnap = await db.ref(WIKI_PATH + '/' + key).once('value');
                var oldData = oldSnap.val();
                if (oldData && oldData.content) {
                    await db.ref(HIST_PATH + '/' + key).push({
                        content  : oldData.content,
                        editor   : oldData.lastEditor || '익명',
                        timestamp: oldData.lastEdited || now,
                        summary  : summary || '(편집 요약 없음)'
                    });
                }
            }

            var oldEditCount = 0, oldCreated = now, oldCreator = email;
            if (key) {
                var metaSnap = await db.ref(WIKI_PATH + '/' + key).once('value');
                var meta = metaSnap.val() || {};
                oldEditCount = meta.editCount || 0;
                oldCreated   = meta.created   || now;
                oldCreator   = meta.creator   || email;
            }

            // 임시 이미지 포함
            var imgData = window._wikiTempImages || {};
            window._wikiTempImages = {};
            await db.ref(WIKI_PATH + '/' + articleKey).set({
                title      : articleTitle,
                content    : content,
                lastEdited : now,
                lastEditor : email,
                lastEditorUid: user.uid,
                created    : oldCreated,
                creator    : oldCreator,
                creatorUid : (key ? (metaSnap.val()?.creatorUid || user.uid) : user.uid),
                editCount  : oldEditCount + 1,
                allowAllEdits: (document.getElementById('wikiAllowAllEdits')?.checked ?? (key ? (metaSnap.val()?.allowAllEdits || false) : false)),
                images     : imgData
            });

            if (typeof hideLoadingIndicator === 'function') hideLoadingIndicator();
            if (typeof showToastNotification === 'function') showToastNotification('✅ 저장 완료', '\'' + articleTitle + '\' 문서가 저장되었습니다.');

            window._wikiOpenArticle(articleKey);

        } catch (err) {
            if (typeof hideLoadingIndicator === 'function') hideLoadingIndicator();
            console.error('위키 저장 실패:', err);
            alert('저장에 실패했습니다.\n' + err.message);
        }
    };

    // ══════════════════════════════════════════════════════════
    // 수정 요청 시스템
    // ══════════════════════════════════════════════════════════
    async function _wikiShowEditRequestModal(key, articleData, user) {
        // 먼저 편집 내용을 입력받음
        var modal = document.createElement('div');
        modal.id = '_wikiEditReqModal';
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
        modal.innerHTML = '<div style="background:white;border-radius:16px;padding:24px;max-width:480px;width:100%;max-height:80vh;overflow-y:auto;">'
            + '<div style="font-size:17px;font-weight:800;color:#333;margin-bottom:8px;">✏️ 수정 요청</div>'
            + '<div style="font-size:13px;color:#888;margin-bottom:16px;padding:10px;background:#f8f9fa;border-radius:8px;">'
            + '이 문서의 작성자에게 수정 요청을 보냅니다.<br>작성자가 허용하면 수정이 반영됩니다.</div>'
            + '<div style="font-size:12px;font-weight:700;color:#555;margin-bottom:6px;">수정 내용 요약</div>'
            + '<textarea id="_wikiReqSummary" placeholder="어떤 내용을 수정하고 싶은지 적어주세요..." style="width:100%;height:80px;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:13px;font-family:inherit;resize:none;box-sizing:border-box;outline:none;" ></textarea>'
            + '<div style="font-size:12px;font-weight:700;color:#555;margin:12px 0 6px;">수정할 본문</div>'
            + '<textarea id="_wikiReqContent" style="width:100%;height:200px;padding:10px;border:1.5px solid #ddd;border-radius:8px;font-size:12px;font-family:monospace;resize:vertical;box-sizing:border-box;outline:none;" >' + (articleData.content || '') + '</textarea>'
            + '<div style="display:flex;gap:10px;margin-top:16px;">'
            + '<button onclick="document.getElementById(\'_wikiEditReqModal\').remove()" style="flex:1;padding:12px;border:1.5px solid #ddd;border-radius:10px;background:white;font-size:14px;cursor:pointer;">취소</button>'
            + '<button id="_wikiReqSendBtn" data-key="' + encodeURIComponent(key) + '" data-cuid="' + (articleData.creatorUid||'') + '" onclick="window._wikiSendEditRequest(this.dataset.key, this.dataset.cuid)" style="flex:1;padding:12px;border:none;border-radius:10px;background:#3a7f2d;color:white;font-size:14px;font-weight:700;cursor:pointer;">수정 요청 보내기</button>'
            + '</div></div>';
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    }

    window._wikiSendEditRequest = async function(key, creatorUid) {
        try { while (key !== decodeURIComponent(key)) { key = decodeURIComponent(key); } } catch(e) {}
        var summary = document.getElementById('_wikiReqSummary')?.value.trim();
        var content = document.getElementById('_wikiReqContent')?.value.trim();
        var user    = getAuth()?.currentUser;

        if (!summary) { alert('수정 요약을 입력해주세요.'); return; }
        if (!content) { alert('수정 내용을 입력해주세요.'); return; }
        if (!creatorUid) { alert('작성자 정보를 확인할 수 없습니다.'); return; }

        // mainUid 찾기 (chatUid → mainUid는 아니고, creatorUid가 mainApp uid)
        var reqId = 'wikiReq_' + Date.now() + '_' + Math.random().toString(36).substr(2,6);
        var reqData = {
            type      : 'wikiEditRequest',
            articleKey: key,
            requester : user.displayName || user.email || '알 수 없음',
            requesterUid: user.uid,
            content   : content,
            summary   : summary,
            timestamp : Date.now(),
            read      : false
        };

        // notifications에 저장 (작성자 mainUid로)
        try {
            await db.ref('notifications/' + creatorUid + '/' + reqId).set({
                ...reqData,
                reqId : reqId,
                title : '📝 위키 수정 요청',
                text  : '"' + key + '" 문서에 ' + (user.displayName || user.email) + '님이 수정을 요청했습니다.'
            });
            // wiki_editRequests에도 저장 (관리용)
            await db.ref('wiki_editRequests/' + reqId).set(reqData);

            document.getElementById('_wikiEditReqModal')?.remove();
            if (typeof showToastNotification === 'function') {
                showToastNotification('✅ 수정 요청 전송', '작성자에게 수정 요청을 보냈습니다.');
            }
        } catch(e) {
            alert('요청 전송 실패: ' + e.message);
        }
    };

    // 알림에서 수정 요청 수락/거절 처리
    window._wikiHandleEditRequest = async function(reqId, accept) {
        try {
            var snap = await db.ref('wiki_editRequests/' + reqId).once('value');
            var req  = snap.val();
            if (!req) { alert('요청을 찾을 수 없습니다.'); return; }

            if (accept) {
                // 수락: 현재 내용 백업 후 수정 내용 적용
                var nowTs  = Date.now();
                var oldSnap = await db.ref(WIKI_PATH + '/' + req.articleKey).once('value');
                var oldData = oldSnap.val() || {};
                if (oldData.content) {
                    await db.ref(HIST_PATH + '/' + req.articleKey).push({
                        content: oldData.content, editor: oldData.lastEditor || '익명',
                        timestamp: oldData.lastEdited || nowTs, summary: '수정 요청 적용 전 백업'
                    });
                }
                await db.ref(WIKI_PATH + '/' + req.articleKey).update({
                    content: req.content, lastEdited: nowTs,
                    lastEditor: req.requester, lastEditorUid: req.requesterUid,
                    editCount: (oldData.editCount || 0) + 1
                });
                // 요청자에게 수락 알림
                await db.ref('notifications/' + req.requesterUid + '/wikiReqAcc_' + Date.now()).set({
                    type: 'wikiEditAccepted', title: '✅ 수정 요청 수락',
                    text: '"' + req.articleKey + '" 문서의 수정 요청이 수락되었습니다.',
                    timestamp: Date.now(), read: false
                });
                if (typeof showToastNotification === 'function') showToastNotification('✅ 수정 수락', '수정이 반영되었습니다.');
            } else {
                // 거절: 요청자에게 거절 알림
                await db.ref('notifications/' + req.requesterUid + '/wikiReqRej_' + Date.now()).set({
                    type: 'wikiEditRejected', title: '❌ 수정 요청 거절',
                    text: '"' + req.articleKey + '" 문서의 수정 요청이 거절되었습니다.',
                    timestamp: Date.now(), read: false
                });
                if (typeof showToastNotification === 'function') showToastNotification('거절됨', '수정 요청을 거절했습니다.');
            }
            // 처리 완료 후 요청 삭제
            await db.ref('wiki_editRequests/' + reqId).remove();
        } catch(e) {
            alert('처리 실패: ' + e.message);
        }
    };

    // ══════════════════════════════════════════════════════════
    // 10. 문서 역사
    // ══════════════════════════════════════════════════════════
    window._wikiShowHistory = function (key) {
        try { while (key !== decodeURIComponent(key)) { key = decodeURIComponent(key); } } catch(e) {}
        showSection(wikiHeader() + '<div style="text-align:center;padding:40px;color:#aaa;"><i class="fas fa-spinner fa-spin"></i> 역사 불러오는 중...</div>' + wikiFooter());

        Promise.all([
            db.ref(WIKI_PATH + '/' + key).once('value'),
            db.ref(HIST_PATH + '/' + key).orderByChild('timestamp').once('value')
        ]).then(function(results) {
            var art = results[0].val() || {};
            var revs = [];
            results[1].forEach(function(c) { revs.unshift({ id: c.key, editor: c.val().editor, timestamp: c.val().timestamp, summary: c.val().summary }); });

            var current = { editor: art.lastEditor || '익명', timestamp: art.lastEdited || Date.now(), summary: '(현재 버전)', isCurrent: true };
            var allRevs = [current].concat(revs);

            showSection(
                wikiHeader()
                + '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:14px;">'
                + '<h2 style="font-size:18px;font-weight:800;color:' + GREEN_D + ';margin:0;">'
                + '<i class="fas fa-history"></i>&nbsp;문서 역사 — ' + escapeHtml(art.title || key)
                + '</h2>'
                + '<button class="nk-tool-btn" onclick="window._wikiOpenArticle(' + "'" + encodeURIComponent(key) + "'" + ')">← 문서로 돌아가기</button>'
                + '</div>'
                + '<div class="nk-card">'
                + '<div style="font-size:12px;color:#aaa;margin-bottom:12px;">총 ' + allRevs.length + '개 버전</div>'
                + allRevs.map(function(r, i) {
                    return '<div class="nk-history-item">'
                        + '<span class="nk-history-rev">' + (r.isCurrent ? '현재' : 'r' + (allRevs.length - i - 1)) + '</span>'
                        + '<div class="nk-history-info">'
                        + '<div class="nk-history-editor">' + escapeHtml(r.editor || '익명') + '</div>'
                        + '<div class="nk-history-time">' + new Date(r.timestamp).toLocaleString('ko-KR') + '</div>'
                        + (r.summary ? '<div class="nk-history-summary">' + escapeHtml(r.summary) + '</div>' : '')
                        + '</div>'
                        + (!r.isCurrent
                            ? '<button class="nk-tool-btn" onclick="window._wikiViewRevision(' + "'" + encodeURIComponent(key) + "'" + ",'" + encodeURIComponent(r.id) + "'" + ')">보기</button>'
                            : '<span style="font-size:11px;color:#aaa;padding:4px 8px;">최신</span>')
                        + '</div>';
                }).join('')
                + '</div>'
                + wikiFooter()
            );
        }).catch(function(err) {
            showSection(wikiHeader() + '<div class="nk-err">역사를 불러오는데 실패했습니다: ' + escapeHtml(err.message) + '</div>' + wikiFooter());
        });
    };

    window._wikiViewRevision = function (key, revId) {
        try { while (key !== decodeURIComponent(key)) { key = decodeURIComponent(key); } } catch(e) {}
        try { revId = decodeURIComponent(revId); } catch(e) {}
        db.ref(HIST_PATH + '/' + key + '/' + revId).once('value').then(function(snap) {
            var rev = snap.val();
            if (!rev) { alert('해당 버전을 찾을 수 없습니다.'); return; }
            showSection(
                wikiHeader()
                + '<div class="nk-warn" style="margin-bottom:16px;">'
                + '<i class="fas fa-clock"></i> 이것은 <strong>' + new Date(rev.timestamp).toLocaleString('ko-KR') + '</strong>에 '
                + '<strong>' + escapeHtml(rev.editor || '익명') + '</strong>이(가) 편집한 이전 버전입니다.'
                + '<button class="nk-tool-btn" onclick="window._wikiShowHistory(' + "'" + encodeURIComponent(key) + "'" + ')" style="margin-left:10px;">역사로 돌아가기</button>'
                + '</div>'
                + '<div class="nk-content">' + parseNamuMark(rev.content || '') + '</div>'
                + wikiFooter()
            );
        });
    };

    // ══════════════════════════════════════════════════════════
    // 11. 검색
    // ══════════════════════════════════════════════════════════
    window._wikiSearchSubmit = function (e) {
        e.preventDefault();
        var q = document.getElementById('wikiSearchInput') ? document.getElementById('wikiSearchInput').value.trim() : '';
        if (q) window._wikiSearch(q);
    };

    window._wikiSearch = function (query) {
        showSection(
            wikiHeader({ searchVal: query })
            + '<div style="font-size:16px;font-weight:700;color:#333;margin-bottom:14px;">'
            + '<i class="fas fa-search" style="color:' + GREEN + ';"></i>'
            + ' &nbsp;"' + escapeHtml(query) + '" 검색 결과'
            + '</div>'
            + '<div id="wikiSearchResults"><div style="text-align:center;padding:30px;color:#aaa;"><i class="fas fa-spinner fa-spin"></i></div></div>'
            + wikiFooter()
        );

        db.ref(WIKI_PATH).once('value').then(function(snap) {
            var results = [];
            snap.forEach(function(c) {
                var d = c.val();
                var q = query.toLowerCase();
                var titleHit   = d.title   && d.title.toLowerCase().includes(q);
                var contentHit = d.content && d.content.toLowerCase().includes(q);
                if (!titleHit && !contentHit) return;

                var excerpt = '';
                if (contentHit) {
                    var idx   = d.content.toLowerCase().indexOf(q);
                    var start = Math.max(0, idx - 50);
                    var raw   = d.content.substring(start, idx + q.length + 80);
                    excerpt   = (start > 0 ? '...' : '') + escapeHtml(raw) + '...';
                    excerpt   = excerpt.replace(
                        new RegExp(escapeRegex(escapeHtml(query)), 'gi'),
                        '<mark style="background:#fffacd;font-weight:700;border-radius:2px;">$&</mark>'
                    );
                }
                results.push({ key: c.key, title: d.title, titleHit: titleHit, excerpt: excerpt, editCount: d.editCount || 1 });
            });

            var el = document.getElementById('wikiSearchResults');
            if (!el) return;

            if (!results.length) {
                el.innerHTML = '<div class="nk-no-article">'
                    + '<i class="fas fa-search"></i>'
                    + '<h3>검색 결과 없음</h3>'
                    + '<p>"' + escapeHtml(query) + '"에 해당하는 문서를 찾을 수 없습니다.</p>'
                    + '<button class="nk-tool-btn primary" onclick="window._wikiCreateNewWithTitle(' + "'" + encodeURIComponent(query) + "'" + ')">'
                    + '<i class="fas fa-plus"></i>&nbsp; "' + escapeHtml(query) + '" 문서 만들기</button>'
                    + '</div>';
            } else {
                el.innerHTML = '<div class="nk-card">'
                    + '<div style="font-size:12px;color:#aaa;margin-bottom:12px;">' + results.length + '개 결과</div>'
                    + results.map(function(r) {
                        return '<div class="nk-article-list-item" onclick="window._wikiOpenArticle(' + "'" + encodeURIComponent(r.key) + "'" + ')" style="flex-direction:column;align-items:flex-start;padding:12px 0;gap:4px;">'
                            + '<div style="font-weight:700;font-size:15px;color:' + GREEN + ';">'
                            + '<i class="fas fa-file-alt" style="font-size:13px;"></i>&nbsp;'
                            + (r.titleHit ? highlightText(escapeHtml(r.title), query) : escapeHtml(r.title))
                            + '<span style="font-size:11px;font-weight:400;color:#aaa;margin-left:8px;">편집 ' + r.editCount + '회</span>'
                            + '</div>'
                            + (r.excerpt ? '<div style="font-size:13px;color:#666;line-height:1.7;padding-left:20px;">' + r.excerpt + '</div>' : '')
                            + '</div>';
                    }).join('')
                    + '</div>';
            }
        }).catch(function(err) {
            var el = document.getElementById('wikiSearchResults');
            if (el) el.innerHTML = '<div class="nk-err">검색 실패: ' + escapeHtml(err.message) + '</div>';
        });
    };

    window._wikiCreateNewWithTitle = function (title) {
        if (!getAuth()?.currentUser) { alert('로그인이 필요합니다.'); window._wikiLogin(); return; }
        _renderEditForm(null, title, '');
    };

    // ══════════════════════════════════════════════════════════
    // 12. 최근 변경
    // ══════════════════════════════════════════════════════════
    window._wikiRecentChanges = function () {
        showSection(
            wikiHeader()
            + '<div style="font-size:18px;font-weight:800;color:' + GREEN_D + ';margin-bottom:14px;">'
            + '<i class="fas fa-history"></i>&nbsp;최근 변경된 문서</div>'
            + '<div id="wikiRecentList"><div style="text-align:center;padding:30px;color:#aaa;"><i class="fas fa-spinner fa-spin"></i></div></div>'
            + wikiFooter()
        );

        db.ref(WIKI_PATH).orderByChild('lastEdited').limitToLast(40).once('value').then(function(snap) {
            var items = [];
            snap.forEach(function(c) { items.unshift({ key: c.key, title: c.val().title, lastEditor: c.val().lastEditor, lastEdited: c.val().lastEdited, editCount: c.val().editCount || 1 }); });

            var el = document.getElementById('wikiRecentList');
            if (!el) return;

            el.innerHTML = items.length
                ? '<div class="nk-card">'
                  + items.map(function(a) {
                      return '<div class="nk-recent-item">'
                          + '<span class="nk-recent-badge ' + (a.editCount <= 1 ? 'new' : '') + '">'
                          + (a.editCount <= 1 ? '신규' : '편집') + '</span>'
                          + '<div style="flex:1;">'
                          + '<a href="#" onclick="window._wikiOpenArticle(' + "'" + encodeURIComponent(a.key) + "'" + ');return false;"'
                          + ' style="font-weight:600;color:' + GREEN + ';font-size:14px;text-decoration:none;">'
                          + escapeHtml(a.title) + '</a>'
                          + '<div style="font-size:12px;color:#bbb;margin-top:2px;">'
                          + escapeHtml(a.lastEditor || '익명')
                          + ' &nbsp;·&nbsp; ' + timeAgo(a.lastEdited)
                          + ' &nbsp;·&nbsp; 총 ' + a.editCount + '회 수정'
                          + '</div></div></div>';
                  }).join('')
                  + '</div>'
                : '<div class="nk-notice">아직 변경된 문서가 없습니다.</div>';
        });
    };

    // ══════════════════════════════════════════════════════════
    // 13. 로그인 / 프로필
    // ══════════════════════════════════════════════════════════
    window._wikiLogin = function () {
        const a = getAuth();
        if (a && a.currentUser) return;
        // ✅ 메인앱 Google 로그인 직접 실행
        if (typeof window.googleLogin === 'function') {
            window.googleLogin();
        } else if (typeof window.showAdminAuthModal === 'function') {
            window.showAdminAuthModal();
        } else {
            alert('상단 로그인 버튼을 눌러 로그인해주세요.');
        }
    };
    window._wikiDoLogin = async function () {
        var emailEl = document.getElementById('wikiLoginEmail');
        var pwEl    = document.getElementById('wikiLoginPw');
        var errEl   = document.getElementById('wikiLoginErr');
        var email   = emailEl ? emailEl.value.trim() : '';
        var pw      = pwEl    ? pwEl.value           : '';

        if (!email || !pw) {
            if (errEl) errEl.textContent = '이메일과 비밀번호를 모두 입력하세요.';
            return;
        }
        if (errEl) errEl.textContent = '';

        try {
            await auth.signInWithEmailAndPassword(email, pw);
            var modal = document.getElementById('wikiLoginModal');
            if (modal) modal.classList.remove('active');
            if (typeof showToastNotification === 'function') showToastNotification('✅ 로그인', '나무아래키에 로그인되었습니다.');
            var s = document.getElementById('wikiSection');
            if (s && s.classList.contains('active')) window.showWiki();
        } catch (e) {
            var msg = e.code === 'auth/wrong-password'    ? '비밀번호가 올바르지 않습니다.'
                    : e.code === 'auth/user-not-found'    ? '존재하지 않는 계정입니다.'
                    : e.code === 'auth/invalid-email'     ? '이메일 형식이 올바르지 않습니다.'
                    : e.code === 'auth/too-many-requests' ? '잠시 후 다시 시도해주세요.'
                    : (e.message || '로그인에 실패했습니다.');
            if (errEl) errEl.textContent = '❌ ' + msg;
        }
    };

    window._wikiProfile = function () {
        var existing = document.getElementById('wikiProfileMenu');
        if (existing) { existing.remove(); return; }

        var name = escapeHtml(((getAuth()?.currentUser?.displayName || getAuth()?.currentUser?.email) || '사용자').substring(0, 20));

        document.body.insertAdjacentHTML('beforeend',
            '<div id="wikiProfileMenu" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;"'
            + ' onclick="document.getElementById(\'wikiProfileMenu\')?.remove()">'
            + '<div style="position:absolute;top:54px;right:16px;background:white;border:1px solid #ddd;'
            + 'border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.15);min-width:180px;overflow:hidden;"'
            + ' onclick="event.stopPropagation()">'
            + '<div style="padding:12px 16px;font-size:13px;font-weight:700;color:#333;border-bottom:1px solid #f0f0f0;background:' + GREEN_L + ';">'
            + '<i class="fas fa-user-circle" style="color:' + GREEN + ';margin-right:6px;"></i>' + name
            + '</div>'
            + '<button onclick="window._wikiRecentChanges();document.getElementById(\'wikiProfileMenu\')?.remove();"'
            + ' style="width:100%;padding:11px 16px;text-align:left;border:none;background:none;cursor:pointer;font-size:13px;color:#333;">'
            + '<i class="fas fa-history" style="color:' + GREEN + ';margin-right:8px;"></i>최근 변경</button>'
            + '<button onclick="(window.auth||firebase.auth(firebase.app())).signOut().then(function(){'
            + 'document.getElementById(\'wikiProfileMenu\')?.remove();'
            + 'if(typeof showToastNotification===\'function\') showToastNotification(\'로그아웃\',\'로그아웃 되었습니다.\');'
            + 'var s=document.getElementById(\'wikiSection\');'
            + 'if(s&&s.classList.contains(\'active\')) window.showWiki();'
            + '})"'
            + ' style="width:100%;padding:11px 16px;text-align:left;border:none;background:none;cursor:pointer;font-size:13px;color:#c62828;border-top:1px solid #f0f0f0;">'
            + '<i class="fas fa-sign-out-alt" style="margin-right:8px;"></i>로그아웃</button>'
            + '</div></div>'
        );
    };

    // ══════════════════════════════════════════════════════════
    // 관리자 패널
    // ══════════════════════════════════════════════════════════
    window._wikiAdminPanel = function () {
        document.getElementById('_wikiAdminPanelSheet')?.remove();
        var sheet = document.createElement('div');
        sheet.id = '_wikiAdminPanelSheet';
        sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';

        sheet.innerHTML = '<div style="background:white;width:100%;max-width:600px;border-radius:20px 20px 0 0;padding:0 0 32px;">'
            + '<div style="text-align:center;padding:14px 0 8px;">'
            + '<div style="width:36px;height:4px;background:#e0e0e0;border-radius:2px;display:inline-block;"></div></div>'
            + '<div style="padding:0 20px;">'
            + '<div style="font-size:16px;font-weight:800;color:#c62828;margin-bottom:16px;display:flex;align-items:center;gap:8px;">'
            + '<i class="fas fa-shield-alt"></i> 나무아래키 관리자</div>'

            + '<div style="display:grid;gap:10px;">'

            // 문서 목록 관리
            + '<button onclick="window._wikiAdminArticleList();document.getElementById(\'_wikiAdminPanelSheet\').remove();" '
            + 'style="padding:14px 16px;border:1.5px solid #eee;border-radius:12px;background:white;text-align:left;cursor:pointer;display:flex;align-items:center;gap:12px;font-size:14px;">'
            + '<span style="width:36px;height:36px;background:#e8f5e9;border-radius:10px;display:flex;align-items:center;justify-content:center;">'
            + '<i class="fas fa-list" style="color:#3a7f2d;"></i></span>'
            + '<div><div style="font-weight:700;color:#212121;">문서 목록 관리</div>'
            + '<div style="font-size:12px;color:#888;margin-top:2px;">전체 문서 보기·삭제</div></div></button>'

            // 수정 요청 관리
            + '<button onclick="window._wikiAdminEditRequests();document.getElementById(\'_wikiAdminPanelSheet\').remove();" '
            + 'style="padding:14px 16px;border:1.5px solid #eee;border-radius:12px;background:white;text-align:left;cursor:pointer;display:flex;align-items:center;gap:12px;font-size:14px;">'
            + '<span style="width:36px;height:36px;background:#e3f2fd;border-radius:10px;display:flex;align-items:center;justify-content:center;">'
            + '<i class="fas fa-code-branch" style="color:#1565c0;"></i></span>'
            + '<div><div style="font-weight:700;color:#212121;">수정 요청 관리</div>'
            + '<div style="font-size:12px;color:#888;margin-top:2px;">대기 중인 수정 요청 처리</div></div></button>'

            // 최근 변경
            + '<button onclick="window._wikiRecentChanges();document.getElementById(\'_wikiAdminPanelSheet\').remove();" '
            + 'style="padding:14px 16px;border:1.5px solid #eee;border-radius:12px;background:white;text-align:left;cursor:pointer;display:flex;align-items:center;gap:12px;font-size:14px;">'
            + '<span style="width:36px;height:36px;background:#fff3e0;border-radius:10px;display:flex;align-items:center;justify-content:center;">'
            + '<i class="fas fa-history" style="color:#e65100;"></i></span>'
            + '<div><div style="font-weight:700;color:#212121;">최근 변경 기록</div>'
            + '<div style="font-size:12px;color:#888;margin-top:2px;">모든 편집 이력 확인</div></div></button>'

            + '</div>'
            + '<button onclick="document.getElementById(\'_wikiAdminPanelSheet\').remove()" '
            + 'style="width:100%;margin-top:16px;padding:14px;border:1.5px solid #eee;border-radius:12px;background:white;font-size:14px;font-weight:600;color:#555;cursor:pointer;">닫기</button>'
            + '</div></div>';

        sheet.addEventListener('click', e => { if (e.target === sheet) sheet.remove(); });
        document.body.appendChild(sheet);
    };

    // 관리자 - 전체 문서 목록 (삭제 가능)
    window._wikiAdminArticleList = async function () {
        showSection(wikiHeader() + '<div style="max-width:700px;margin:0 auto;padding:16px;">'
            + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">'
            + '<button onclick="window.showWiki()" style="background:none;border:none;font-size:18px;cursor:pointer;color:#555;"><i class="fas fa-arrow-left"></i></button>'
            + '<h2 style="margin:0;font-size:18px;font-weight:800;color:#c62828;">📋 문서 목록 관리</h2></div>'
            + '<div id="wikiAdminListContainer"><div style="text-align:center;padding:40px;color:#aaa;"><i class="fas fa-spinner fa-spin"></i> 불러오는 중...</div></div>'
            + '</div>' + wikiFooter());

        var snap = await db.ref(WIKI_PATH).once('value');
        var el   = document.getElementById('wikiAdminListContainer');
        if (!el) return;

        var articles = [];
        snap.forEach(function(c) { articles.push({ key: c.key, ...c.val() }); });
        articles.sort((a, b) => (b.lastEdited||0) - (a.lastEdited||0));

        if (!articles.length) { el.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px;">문서가 없습니다.</p>'; return; }

        el.innerHTML = articles.map(function(a) {
            var date = a.lastEdited ? new Date(a.lastEdited).toLocaleDateString('ko-KR') : '-';
            return '<div style="display:flex;align-items:center;gap:10px;padding:12px;border:1px solid #eee;border-radius:10px;margin-bottom:8px;background:white;">'
                + '<div style="flex:1;cursor:pointer;" data-akey="' + encodeURIComponent(a.key) + '" onclick="window._wikiOpenArticle(this.dataset.akey)">'
                + '<div style="font-weight:700;font-size:14px;color:#212121;">' + escapeHtml(a.title || a.key) + '</div>'
                + '<div style="font-size:12px;color:#888;margin-top:2px;">' + escapeHtml(a.creator||'알 수 없음') + ' · ' + date + ' · ' + (a.editCount||1) + '회 수정</div>'
                + '</div>'
                + '<button data-dkey="' + encodeURIComponent(a.key) + '" onclick="window._wikiDeleteArticle(this.dataset.dkey)" '
                + 'style="padding:6px 12px;border:1px solid #ffcdd2;border-radius:8px;background:#ffebee;color:#c62828;font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0;">'
                + '<i class="fas fa-trash-alt"></i></button>'
                + '</div>';
        }).join('');
    };

    // 관리자 - 수정 요청 목록
    window._wikiAdminEditRequests = async function () {
        showSection(wikiHeader() + '<div style="max-width:700px;margin:0 auto;padding:16px;">'
            + '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">'
            + '<button onclick="window.showWiki()" style="background:none;border:none;font-size:18px;cursor:pointer;color:#555;"><i class="fas fa-arrow-left"></i></button>'
            + '<h2 style="margin:0;font-size:18px;font-weight:800;color:#1565c0;">📝 수정 요청 관리</h2></div>'
            + '<div id="wikiReqListContainer"><div style="text-align:center;padding:40px;color:#aaa;"><i class="fas fa-spinner fa-spin"></i></div></div>'
            + '</div>' + wikiFooter());

        var snap = await db.ref('wiki_editRequests').once('value');
        var el   = document.getElementById('wikiReqListContainer');
        if (!el) return;

        var reqs = [];
        snap.forEach(function(c) { reqs.push({ id: c.key, ...c.val() }); });
        reqs.sort((a, b) => (b.timestamp||0) - (a.timestamp||0));

        if (!reqs.length) { el.innerHTML = '<p style="color:#aaa;text-align:center;padding:40px;">수정 요청이 없습니다.</p>'; return; }

        el.innerHTML = reqs.map(function(r) {
            var date = r.timestamp ? new Date(r.timestamp).toLocaleString('ko-KR') : '-';
            return '<div style="padding:14px;border:1px solid #e3f2fd;border-radius:12px;margin-bottom:10px;background:white;">'
                + '<div style="font-weight:700;font-size:14px;color:#212121;margin-bottom:4px;">' + escapeHtml(r.articleKey||'') + '</div>'
                + '<div style="font-size:12px;color:#888;margin-bottom:8px;">' + escapeHtml(r.requester||'') + ' · ' + date + '</div>'
                + '<div style="font-size:13px;color:#555;background:#f8f9fa;border-radius:8px;padding:8px 10px;margin-bottom:10px;">' + escapeHtml(r.summary||'') + '</div>'
                + '<div style="display:flex;gap:8px;">'
                + '<button data-rid="' + r.id + '" onclick="window._wikiHandleEditRequest(this.dataset.rid,true)" style="flex:1;padding:8px;border:none;border-radius:8px;background:#3a7f2d;color:white;font-size:13px;font-weight:700;cursor:pointer;">✅ 수락</button>'
                + '<button data-rid="' + r.id + '" onclick="window._wikiHandleEditRequest(this.dataset.rid,false)" style="flex:1;padding:8px;border:1px solid #eee;border-radius:8px;background:white;color:#c62828;font-size:13px;font-weight:700;cursor:pointer;">❌ 거절</button>'
                + '</div></div>';
        }).join('');
    };

    // ══════════════════════════════════════════════════════════
    // 14. 뒤로 가기
    // ══════════════════════════════════════════════════════════
    window._wikiGoBack = function () {
        _wikiPageStack.pop(); // 현재 페이지 제거
        var prev = _wikiPageStack[_wikiPageStack.length - 1];
        if (prev) {
            prev();
        } else {
            // ✅ 스택 비었으면 위키 탈출 → 더보기 메뉴로
            _wikiPageStack = [];
            if (typeof showMoreMenu === 'function') showMoreMenu();
        }
    };

    // ══════════════════════════════════════════════════════════
    // 15. NamuMark 파서
    // ══════════════════════════════════════════════════════════
    function parseNamuMark(text) {
        if (!text) return '';

        // ✅ 코드블록 사전처리 ({{{ ... }}} 멀티라인)
        text = text.replace(/\{\{\{\n([\s\S]*?)\n\}\}\}/g, function(_, inner) {
            return '<pre>' + escapeHtml(inner) + '</pre>BLOCK_DONE';
        });

        // ✅ ## 편집자 주석: 렌더링 시 제거
        text = text.replace(/^##.*$/mg, '');

        // ✅ #redirect 처리
        var redirectMatch = text.match(/^#redirect (.+)/);
        if (redirectMatch) {
            var rkey = redirectMatch[1].trim().replace(/\s+/g, '_');
            return '<div style="padding:20px;color:#555;"><i class="fas fa-arrow-right" style="color:#3a7f2d;"></i> 이 문서는 <a href="#" class="wiki-link" onclick="window._wikiOpenArticle(\'' + encodeURIComponent(rkey) + '\');return false;">' + escapeHtml(redirectMatch[1].trim()) + '</a>(으)로 이동합니다.</div>';
        }

        var lines = text.split('\n');
        var html  = '';

        // 1패스: 목차 수집
        var tocItems = [];
        lines.forEach(function(line) {
            var m5 = line.match(/^={5}\s+(.+?)\s+={5}$/);
            var m4 = line.match(/^={4}\s+(.+?)\s+={4}$/);
            var m3 = line.match(/^={3}\s+(.+?)\s+={3}$/);
            var m2 = line.match(/^={2}\s+(.+?)\s+={2}$/);
            if      (m2) tocItems.push({ level: 2, text: m2[1] });
            else if (m3) tocItems.push({ level: 3, text: m3[1] });
            else if (m4) tocItems.push({ level: 4, text: m4[1] });
            else if (m5) tocItems.push({ level: 5, text: m5[1] });
        });

        function buildTOC() {
            if (tocItems.length < 2) return '';
            var toc  = '<div class="nk-toc"><div class="nk-toc-title" style="display:flex;justify-content:space-between;align-items:center;">목차 <span onclick="this.closest(\'div\').nextElementSibling && (this.closest(\'div\').nextElementSibling.style.display = this.closest(\'div\').nextElementSibling.style.display===\'none\' ? \'\' : \'none\')" style="cursor:pointer;font-size:11px;font-weight:400;color:#888;">접기</span></div><ol>';
            var prev = 2;
            tocItems.forEach(function(item, i) {
                var anchor = 'h-' + i;
                if (item.level > prev)      toc += '<ol>'.repeat(item.level - prev);
                else if (item.level < prev) toc += '</ol>'.repeat(prev - item.level);
                toc += '<li><a href="#" onclick="(function(){var el=document.getElementById(\'' + anchor + '\');if(el){el.scrollIntoView({behavior:\'smooth\',block:\'start\'});}return false;})();return false;">' + escapeHtml(item.text) + '</a></li>';
                prev = item.level;
            });
            toc += '</ol></div>';
            return toc;
        }

        function processTable(tbLines) {
            var out = '<table>';
            tbLines.forEach(function(line, i) {
                var parts = line.split('||');
                var cells = parts.slice(1, parts.length - 1);
                var tag   = i === 0 ? 'th' : 'td';
                out += '<tr>' + cells.map(function(c) { return '<' + tag + '>' + parseInline(c.trim()) + '</' + tag + '>'; }).join('') + '</tr>';
            });
            return out + '</table>';
        }

        // 2패스: 렌더링
        var i = 0, tocInserted = false, hIdx = 0;
        var tableBuffer = [], listBuffer = [], listType = '';

        function flushList() {
            if (!listBuffer.length) return;
            html += '<' + listType + '>' + listBuffer.map(function(t) { return '<li>' + parseInline(t) + '</li>'; }).join('') + '</' + listType + '>';
            listBuffer = []; listType = '';
        }
        function flushTable() {
            if (!tableBuffer.length) return;
            html += processTable(tableBuffer);
            tableBuffer = [];
        }

        while (i < lines.length) {
            var line = lines[i];

            if (line.startsWith('||')) {
                flushList();
                tableBuffer.push(line);
                i++; continue;
            } else { flushTable(); }

            var h2 = line.match(/^={2}\s+(.+?)\s+={2}$/);
            var h3 = line.match(/^={3}\s+(.+?)\s+={3}$/);
            var h4 = line.match(/^={4}\s+(.+?)\s+={4}$/);
            var h5 = line.match(/^={5}\s+(.+?)\s+={5}$/);
            var hm = h2 || h3 || h4 || h5;
            if (hm) {
                flushList();
                var lvl    = h2 ? 2 : h3 ? 3 : h4 ? 4 : 5;
                var anchor = 'h-' + hIdx++;
                html += '<h' + lvl + ' id="' + anchor + '">' + parseInline(hm[1]) + '</h' + lvl + '>';
                i++; continue;
            }

            if (/^\[목차\]$|^\[TOC\]$/i.test(line.trim())) {
                flushList();
                if (!tocInserted) { html += buildTOC(); tocInserted = true; }
                i++; continue;
            }

            if (/^----+$/.test(line.trim())) {
                flushList(); html += '<hr>'; i++; continue;
            }

            if (line.startsWith('> ')) {
                flushList();
                html += '<blockquote>' + parseInline(line.substring(2)) + '</blockquote>';
                i++; continue;
            }

            if (line.startsWith(' ')) {
                flushList();
                html += '<div style="margin-left:20px;">' + parseInline(line.trim()) + '</div>';
                i++; continue;
            }

            var ulM = line.match(/^(\*{1,3})\s+(.+)$/);
            if (ulM) {
                if (listType !== 'ul') { flushList(); listType = 'ul'; }
                listBuffer.push(ulM[2]);
                i++; continue;
            }

            var olM = line.match(/^\d+\.\s+(.+)$/);
            if (olM) {
                if (listType !== 'ol') { flushList(); listType = 'ol'; }
                listBuffer.push(olM[1]);
                i++; continue;
            }

            flushList();

            if (line.trim() === '') {
                html += '<br>'; i++; continue;
            }

            html += '<p>' + parseInline(line) + '</p>';
            i++;
        }
        flushList();
        flushTable();

        if (!tocInserted && tocItems.length >= 3) html = buildTOC() + html;

        // 목차 float 해제
        html = html.replace(/<\/div>\s*(<h[2-5])/g, '</div><div style="clear:both;"></div>$1');

        // ✅ [[파일:xxx]] → <img> 렌더링 (저장된 이미지 데이터 참조)
        html = html.replace(/\[\[파일:([^\]]+)\]\]/g, function(_, fname) {
            var src = (window._wikiTempImages && window._wikiTempImages[fname]) || '';
            if (!src && window._wikiArticleImages && window._wikiArticleImages[fname]) src = window._wikiArticleImages[fname];
            if (!src) return '<span style="color:#c62828;font-size:12px;">[이미지: ' + escapeHtml(fname) + ']</span>';
            return '<img src="' + src + '" style="max-width:100%;border-radius:8px;margin:8px 0;display:block;">';
        });

        return html;
    }

    function parseInline(text) {
        if (!text) return '';
        text = escapeHtml(text);

        // 컬러 / 크기 텍스트
        text = text.replace(/\{\{\{#([a-zA-Z0-9#]+)\s(.+?)\}\}\}/g, '<span style="color:$1;">$2</span>');
        text = text.replace(/\{\{\{\+(\d)\s(.+?)\}\}\}/g, function(_, n, t) { return '<span style="font-size:' + (100 + parseInt(n) * 10) + '%;">' + t + '</span>'; });
        text = text.replace(/\{\{\{-(\d)\s(.+?)\}\}\}/g, function(_, n, t) { return '<span style="font-size:' + (100 - parseInt(n) * 8) + '%;">' + t + '</span>'; });
        // 인라인 코드
        text = text.replace(/\{\{\{(.+?)\}\}\}/g, '<code>$1</code>');
        // 굵게
        text = text.replace(/&apos;&apos;&apos;(.+?)&apos;&apos;&apos;/g, '<b>$1</b>');
        // 기울임
        text = text.replace(/&apos;&apos;(.+?)&apos;&apos;/g, '<em>$1</em>');
        // 밑줄
        text = text.replace(/__(.+?)__/g, '<u>$1</u>');
        // 취소선
        text = text.replace(/--(.+?)--/g, '<del>$1</del>');
        // 형광펜
        text = text.replace(/~~(.+?)~~/g, '<mark style="background:#fffacd;">$1</mark>');
        // 외부 링크
        text = text.replace(/\[https?:\/\/([\S]+?)\s(.+?)\]/g, '<a href="https://$1" target="_blank" rel="noopener noreferrer">$2 <i class="fas fa-external-link-alt" style="font-size:10px;"></i></a>');
        text = text.replace(/\[https?:\/\/([\S]+?)\]/g, '<a href="https://$1" target="_blank" rel="noopener noreferrer">$1 <i class="fas fa-external-link-alt" style="font-size:10px;"></i></a>');
        // ✅ 내부 링크 처리 (나무위키 방식)
        // [[#섹션]] - 같은 문서 내 앵커 이동
        // [[문서명#섹션]] - 다른 문서 열고 해당 섹션 이동
        // [[문서명|표시텍스트]] - 별칭 링크
        // [[문서명]] - 기본 링크

        text = text.replace(/\[\[([^\|\]]+)\|([^\]]+)\]\]/g, function(_, docTitle, display) {
            docTitle = docTitle.trim();
            display  = display.trim();

            // [[#섹션|표시텍스트]] - 같은 문서 내 앵커
            if (docTitle.startsWith('#')) {
                var anchor = 'h-' + docTitle.slice(1).replace(/\s+/g, '-');
                return '<a href="#" class="wiki-link" onclick="(function(){' +
                    'var headings=document.querySelectorAll(\'.nk-content h2,.nk-content h3,.nk-content h4,.nk-content h5\');' +
                    'var target=null;' +
                    'for(var i=0;i<headings.length;i++){if(headings[i].textContent.trim()===\'' + docTitle.slice(1) + '\'){target=headings[i];break;}}' +
                    'if(target){target.scrollIntoView({behavior:\'smooth\',block:\'start\'});}' +
                    '})();return false;">' + escapeHtml(display) + '</a>';
            }

            // [[문서명#섹션|표시텍스트]] - 다른 문서 + 섹션
            var hashIdx = docTitle.indexOf('#');
            if (hashIdx > 0) {
                var docPart     = docTitle.slice(0, hashIdx).replace(/\s+/g, '_');
                var sectionPart = docTitle.slice(hashIdx + 1);
                return '<a href="#" class="wiki-link" onclick="window._wikiOpenArticleSection(' +
                    "'" + encodeURIComponent(docPart) + "','" + encodeURIComponent(sectionPart) + "'" +
                    ');return false;">' + escapeHtml(display) + '</a>';
            }

            // [[문서명|표시텍스트]] - 일반 링크
            var key = docTitle.replace(/\s+/g, '_');
            return '<a href="#" class="wiki-link" onclick="window._wikiOpenArticle(' +
                "'" + encodeURIComponent(key) + "'" +
                ');return false;">' + escapeHtml(display) + '</a>';
        });

        text = text.replace(/\[\[([^\]]+)\]\]/g, function(_, docTitle) {
            docTitle = docTitle.trim();

            // [[#섹션]] - 같은 문서 내 앵커 이동
            if (docTitle.startsWith('#')) {
                var sectionName = docTitle.slice(1).trim();
                return '<a href="#" class="wiki-link" onclick="(function(){' +
                    'var headings=document.querySelectorAll(\'.nk-content h2,.nk-content h3,.nk-content h4,.nk-content h5\');' +
                    'var target=null;' +
                    'for(var i=0;i<headings.length;i++){if(headings[i].textContent.trim()===\'' + sectionName.replace(/'/g,"\\'") + '\'){target=headings[i];break;}}' +
                    'if(target){target.scrollIntoView({behavior:\'smooth\',block:\'start\'});}' +
                    '})();return false;">' + escapeHtml(sectionName) + '</a>';
            }

            // [[문서명#섹션]] - 다른 문서 + 섹션
            var hashIdx = docTitle.indexOf('#');
            if (hashIdx > 0) {
                var docPart     = docTitle.slice(0, hashIdx).replace(/\s+/g, '_');
                var sectionPart = docTitle.slice(hashIdx + 1);
                return '<a href="#" class="wiki-link" onclick="window._wikiOpenArticleSection(' +
                    "'" + encodeURIComponent(docPart) + "','" + encodeURIComponent(sectionPart) + "'" +
                    ');return false;">' + escapeHtml(docTitle) + '</a>';
            }

            // [[문서명]] - 일반 링크
            var key = docTitle.replace(/\s+/g, '_');
            return '<a href="#" class="wiki-link" onclick="window._wikiOpenArticle(' +
                "'" + encodeURIComponent(key) + "'" +
                ');return false;">' + escapeHtml(docTitle) + '</a>';
        });
        // 각주
        text = text.replace(/\[\*\s(.+?)\]/g, '<sup class="fn" title="$1">[주]</sup>');

        return text;
    }

    // ══════════════════════════════════════════════════════════
    // 16. 유틸
    // ══════════════════════════════════════════════════════════
    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    }
    function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    function highlightText(html, query) {
        return html.replace(new RegExp(escapeRegex(escapeHtml(query)), 'gi'), '<mark style="background:#fffacd;font-weight:700;border-radius:2px;">$&</mark>');
    }
    function timeAgo(ts) {
        if (!ts) return '';
        var diff = Date.now() - ts;
        var min  = Math.floor(diff / 60000);
        var hr   = Math.floor(diff / 3600000);
        var day  = Math.floor(diff / 86400000);
        if (min  < 1)   return '방금 전';
        if (min  < 60)  return min  + '분 전';
        if (hr   < 24)  return hr   + '시간 전';
        if (day  < 30)  return day  + '일 전';
        if (day  < 365) return Math.floor(day / 30) + '개월 전';
        return new Date(ts).toLocaleDateString('ko-KR');
    }

    console.log('✅ wiki.js - 나무아래키 로드 완료');
    console.log('📋 DB URL 설정 여부:', WIKI_DB_URL.includes('여기에') ? '⚠️ 미설정 (URL 교체 필요)' : '✅ 설정됨');

})();
