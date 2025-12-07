// ===== 크리스마스 사운드 & 테마 시스템 =====

// 전역 오디오 객체
let bgmAudio = null;
let soundEnabled = true;
let bgmEnabled = true;
let currentTheme = 'default';

// 사운드 초기화
function initSoundSystem() {
    // 로컬스토리지에서 설정 불러오기
    soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    bgmEnabled = localStorage.getItem('bgmEnabled') !== 'false';
    currentTheme = localStorage.getItem('theme') || 'default';
    
    // BGM 초기화
    if (bgmEnabled && currentTheme === 'christmas') {
        initBGM();
    }
    
    // 테마 적용
    applyTheme(currentTheme, false); // 초기 로드 시 알림 표시 안함
    
    console.log("🎵 사운드 시스템 초기화 완료");
}

// 배경음악 초기화
function initBGM() {
    if (!bgmAudio) {
        bgmAudio = new Audio();
        // 로컬 mp3 파일 경로
        bgmAudio.src = "./sounds/christmas-bgm.mp3";
        bgmAudio.loop = true;
        bgmAudio.volume = 0.3;
        
        // 에러 처리
        bgmAudio.onerror = function() {
            console.error("❌ BGM 파일을 찾을 수 없습니다:", bgmAudio.src);
        };
        
        // 자동 재생 (사용자 인터랙션 후)
        document.addEventListener('click', playBGMOnce, { once: true });
    }
}

// 배경음악 재생 (최초 1회)
function playBGMOnce() {
    // ⭐ 기본 테마에서는 절대 재생 안됨
    if (currentTheme !== 'christmas') return;
    
    if (bgmAudio && bgmEnabled) {
        bgmAudio.play().then(() => {
            console.log("✅ BGM 재생 시작");
        }).catch(e => {
            console.log("⚠️ BGM 자동재생 차단됨 (사용자 클릭 필요):", e.message);
        });
    }
}

// 배경음악 재생
function playBGM() {
    // ⭐ 기본 테마에서는 절대 재생 안됨
    if (currentTheme !== 'christmas') return;
    
    if (!bgmAudio) initBGM();
    
    if (bgmAudio && bgmEnabled) {
        bgmAudio.play().then(() => {
            console.log("✅ BGM 재생");
        }).catch(e => {
            console.log("❌ BGM 재생 실패:", e.message);
        });
    }
}

// 배경음악 정지
function stopBGM() {
    if (bgmAudio) {
        bgmAudio.pause();
        bgmAudio.currentTime = 0;
    }
}

// 효과음 재생 함수 (로컬 파일 사용)
function playSound(soundType) {
    // ⭐ 기본 테마에서는 효과음 절대 재생 안됨
    if (!soundEnabled || currentTheme !== 'christmas') return;
    
    const audio = new Audio();
    
    switch(soundType) {
        case 'click':
            audio.src = "./sounds/click.mp3";
            audio.volume = 0.2;
            break;
        case 'success':
            audio.src = "./sounds/success.mp3";
            audio.volume = 0.3;
            break;
        case 'notification':
            audio.src = "./sounds/notification.mp3";
            audio.volume = 0.25;
            break;
        case 'error':
            audio.src = "./sounds/error.mp3";
            audio.volume = 0.2;
            break;
        default:
            return;
    }
    
    audio.onerror = function() {
        console.error("❌ 효과음 파일을 찾을 수 없습니다:", audio.src);
    };
    
    audio.play().catch(e => {
        console.log("⚠️ 효과음 재생 실패:", e.message);
    });
}

// 테마 적용 함수 (수정: 기본 테마는 style.css만 사용)
function applyTheme(theme, showNotification = true) {
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    const christmasStylesheet = document.getElementById('christmasStylesheet');
    
    if (theme === 'christmas') {
        // 크리스마스 테마 활성화
        if (!christmasStylesheet) {
            const link = document.createElement('link');
            link.id = 'christmasStylesheet';
            link.rel = 'stylesheet';
            link.href = './style1.css';
            document.head.appendChild(link);
        }
        
        // ⭐ 사운드 자동 활성화
        soundEnabled = true;
        bgmEnabled = true;
        localStorage.setItem('soundEnabled', 'true');
        localStorage.setItem('bgmEnabled', 'true');
        
        // BGM 재생
        playBGM();
        
        // ⭐ UI 토글 상태 업데이트
        setTimeout(() => {
            const soundToggle = document.getElementById('soundToggle');
            const bgmToggle = document.getElementById('bgmToggle');
            if(soundToggle) soundToggle.checked = true;
            if(bgmToggle) bgmToggle.checked = true;
        }, 100);
        
        if (showNotification) {
            showToastNotification("🎄 크리스마스 테마", "크리스마스 테마가 적용되었습니다! (사운드 활성화)", null);
        }
    } else {
        // ⭐ 기본 테마 (style.css만 사용, 모든 사운드 강제 종료)
        if (christmasStylesheet) {
            christmasStylesheet.remove();
        }
        
        // ⭐ BGM 강제 정지
        stopBGM();
        
        // ⭐ 사운드 설정 강제 비활성화
        soundEnabled = false;
        bgmEnabled = false;
        localStorage.setItem('soundEnabled', 'false');
        localStorage.setItem('bgmEnabled', 'false');
        
        // ⭐ UI 토글 상태 업데이트
        setTimeout(() => {
            const soundToggle = document.getElementById('soundToggle');
            const bgmToggle = document.getElementById('bgmToggle');
            if(soundToggle) soundToggle.checked = false;
            if(bgmToggle) bgmToggle.checked = false;
        }, 100);
        
        if (showNotification) {
            showToastNotification("📰 기본 테마", "기본 테마가 적용되었습니다. (사운드 비활성화)", null);
        }
    }
}

// ⭐ 기존 updateSettings 함수를 완전히 대체
async function updateSettingsWithDesign() {
    // 1. 프로필 카드
    const el = document.getElementById("profileNickname");
    if (el) {
        const user = auth.currentUser;
        if(user) {
            const nicknameChangeSnapshot = await db.ref("users/" + user.uid + "/nicknameChanged").once("value");
            const hasChangedNickname = nicknameChangeSnapshot.val() || false;
            const userSnapshot = await db.ref("users/" + user.uid).once("value");
            const userData = userSnapshot.val() || {};
            const isVIP = userData.isVIP || false;
            const warningCount = userData.warningCount || 0;
            
            // 프로필 사진 (장식 포함)
            const photoUrl = userData.profilePhoto || null;
            const decoratedPhotoHTML = await createProfilePhotoWithDecorations(photoUrl, 120, user.email);
            
            el.innerHTML = `
            <div style="background:white !important; border:1px solid #dadce0; padding:20px; border-radius:8px; margin-bottom:20px;">
                <h4 style="margin:0 0 15px 0; color:#202124;">내 정보</h4>
                
                <!-- 프로필 사진 표시 -->
                <div style="text-align:center; margin-bottom:20px;">
                    <div id="userProfilePhotoPreview" style="margin-bottom:15px;">
                        ${decoratedPhotoHTML}
                    </div>
                    <button onclick="openProfilePhotoModal()" class="btn-secondary" style="font-size:13px;">
                        <i class="fas fa-camera"></i> 프로필 사진 변경
                    </button>
                </div>
                
                <p style="margin:8px 0; color:#202124 !important;"><strong style="color:#202124;">이름:</strong> ${user.displayName || '미설정'}${isVIP ? ' <span class="vip-badge">⭐ VIP</span>' : ''}</p>
                <p style="margin:8px 0; color:#202124 !important;"><strong style="color:#202124;">이메일:</strong> ${user.email}</p>
                ${warningCount > 0 ? `<p style="margin:8px 0; color:#d93025;"><strong>⚠️ 경고:</strong> ${warningCount}회</p>` : ''}
                ${hasChangedNickname ? 
                    '<p style="margin:8px 0; color:#9aa0a6; font-size:13px;">닉네임 변경 완료됨</p>' : 
                    '<button onclick="changeNickname()" class="btn-block" style="margin-top:15px; background:#fff; border:1px solid #dadce0;">닉네임 변경 (1회)</button>'
                }
            </div>
            `;
            
            // 알림 토글 상태 업데이트
            const notificationToggle = document.getElementById("notificationToggle");
            if(notificationToggle) {
                notificationToggle.checked = userData.notificationsEnabled !== false;
            }
        } else {
            el.innerHTML = `<div style="background:#fff; border:1px solid #dadce0; padding:20px; border-radius:8px; text-align:center;">
                <p style="color:#5f6368;">로그인이 필요합니다.</p>
                <button onclick="googleLogin()" class="btn-primary" style="width:100%; margin-top:15px;">Google 로그인</button>
            </div>`;
        }
    }

    // 2. 디자인 설정 카드 추가 (기존 것 제거 후)
    const existingDesignCard = document.getElementById('designSettingsCard');
    if (existingDesignCard) {
        existingDesignCard.remove();
    }
    
    const notificationCard = document.querySelector('.settings-card');
    if (notificationCard) {
        // ⭐ 사운드 설정은 항상 표시 (크리스마스 테마 여부 표시)
        const soundSettingsHTML = `
            <!-- 사운드 설정 -->
            <div style="border-top:1px solid #eee; padding-top:20px; margin-top:20px;">
                ${currentTheme !== 'christmas' ? '<div style="background:#fff3cd; padding:12px; border-radius:6px; margin-bottom:15px; font-size:13px; color:#856404;"><i class="fas fa-info-circle"></i> <strong>사운드 기능은 크리스마스 테마에서 활성화됩니다</strong></div>' : ''}
                
                <label class="toggle-label">
                    <input type="checkbox" id="soundToggle" onchange="toggleSound()" ${soundEnabled ? 'checked' : ''} ${currentTheme !== 'christmas' ? 'disabled' : ''}>
                    <span class="toggle-slider"></span>
                    <div class="toggle-text">
                        <strong>🔊 효과음</strong>
                        <small>버튼 클릭, 알림 등의 효과음</small>
                    </div>
                </label>
            </div>
            
            <div style="margin-top:15px;">
                <label class="toggle-label">
                    <input type="checkbox" id="bgmToggle" onchange="toggleBGM()" ${bgmEnabled ? 'checked' : ''} ${currentTheme !== 'christmas' ? 'disabled' : ''}>
                    <span class="toggle-slider"></span>
                    <div class="toggle-text">
                        <strong>🎵 배경음악</strong>
                        <small>크리스마스 테마 배경음악</small>
                    </div>
                </label>
            </div>
        `;
           
        const designSettingsHTML = `
    <div id="designSettingsCard" class="settings-card" style="margin-top:20px; background:white !important;">
        
        <!-- 테마 선택 -->
        <div style="margin-bottom:20px;">
            <label style="display:block; margin-bottom:10px; font-weight:600; color:#202124 !important;">테마 선택</label>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <button onclick="selectTheme('default')" 
                                class="theme-btn ${currentTheme === 'default' ? 'active' : ''}" 
                                id="defaultThemeBtn"
                                style="padding:15px; border:2px solid ${currentTheme === 'default' ? '#00376b' : '#dadce0'}; border-radius:8px; background:${currentTheme === 'default' ? '#e8f0fe' : 'white'}; cursor:pointer; transition:all 0.3s;">
                            <div style="font-size:24px; margin-bottom:5px;">📰</div>
                            <div style="font-weight:600;">기본 테마</div>
                        </button>
                        <button onclick="selectTheme('christmas')" 
                                class="theme-btn ${currentTheme === 'christmas' ? 'active' : ''}"
                                id="christmasThemeBtn"
                                style="padding:15px; border:2px solid ${currentTheme === 'christmas' ? '#c41e3a' : '#dadce0'}; border-radius:8px; background:${currentTheme === 'christmas' ? '#fff5f5' : 'white'}; cursor:pointer; transition:all 0.3s;">
                            <div style="font-size:24px; margin-bottom:5px;">🎄</div>
                            <div style="font-weight:600;">크리스마스</div>
                        </button>
                    </div>
                </div>
                
                ${soundSettingsHTML}
            </div>
        `;
        
        notificationCard.insertAdjacentHTML('afterend', designSettingsHTML);
    }

    // 3. 관리자 모드 표시
    const adminIndicator = document.getElementById("adminModeIndicator");
    if(adminIndicator) {
        if(isAdmin()) {
            adminIndicator.innerHTML = `
                <div style="background:#e8f0fe; border:1px solid #1967d2; padding:15px; border-radius:8px; margin:20px 0;">
                    <h4 style="margin:0 0 10px 0; color:#1967d2;">🛡️ 관리자 모드 ON</h4>
                    <button onclick="disableAdminMode()" class="btn-block" style="background:#fff; color:#1967d2; border:1px solid #1967d2;">모드 해제</button>
                </div>
            `;
        } else {
            adminIndicator.innerHTML = '';
        }
    }
    
    // 팔로우 사용자 로드
    if (document.getElementById("notificationToggle")?.checked) {
        loadFollowUsers();
    }
}

// 기존 updateSettings를 오버라이드
if (typeof window.updateSettings !== 'undefined') {
    const originalUpdateSettings = window.updateSettings;
    window.updateSettings = async function() {
        await updateSettingsWithDesign();
    };
} else {
    window.updateSettings = updateSettingsWithDesign;
}

// 테마 선택 함수 (수정 버전)
window.selectTheme = async function(theme) {
    // 크리스마스 테마 구매 확인
    if(theme === 'christmas') {
        if(!isLoggedIn()) {
            alert("로그인이 필요합니다!");
            return;
        }
        
        const uid = getUserId();
        const snapshot = await db.ref("users/" + uid + "/inventory").once("value");
        const inventory = snapshot.val() || [];
        
        if(!inventory.includes('christmas_theme')) {
            if(confirm("🎄 크리스마스 테마는 구매가 필요합니다!\n\n상점으로 이동하시겠습니까?")) {
                showShop();
            }
            return;
        }
    }
    
    // 효과음 재생
    if (currentTheme === 'christmas') {
        playSound('click');
    }
    
    applyTheme(theme, true);
    
    // 버튼 스타일 업데이트
    const defaultBtn = document.getElementById('defaultThemeBtn');
    const christmasBtn = document.getElementById('christmasThemeBtn');
    
    if (defaultBtn && christmasBtn) {
        if (theme === 'default') {
            defaultBtn.style.borderColor = '#00376b';
            defaultBtn.style.background = '#e8f0fe';
            christmasBtn.style.borderColor = '#dadce0';
            christmasBtn.style.background = 'white';
        } else {
            christmasBtn.style.borderColor = '#c41e3a';
            christmasBtn.style.background = '#fff5f5';
            defaultBtn.style.borderColor = '#dadce0';
            defaultBtn.style.background = 'white';
        }
    }
    
    updateSettingsWithDesign();
}

// 효과음 토글
window.toggleSound = function() {
    // ⭐ 기본 테마에서는 작동 안함
    if (currentTheme !== 'christmas') return;
    
    soundEnabled = document.getElementById('soundToggle').checked;
    localStorage.setItem('soundEnabled', soundEnabled);
    
    if (soundEnabled) {
        playSound('success');
        showToastNotification("🔊 효과음 활성화", "효과음이 켜졌습니다.", null);
    } else {
        showToastNotification("🔇 효과음 비활성화", "효과음이 꺼졌습니다.", null);
    }
}

// 배경음악 토글
window.toggleBGM = function() {
    // ⭐ 기본 테마에서는 작동 안함
    if (currentTheme !== 'christmas') return;
    
    bgmEnabled = document.getElementById('bgmToggle').checked;
    localStorage.setItem('bgmEnabled', bgmEnabled);
    
    if (bgmEnabled) {
        playBGM();
        playSound('success');
        showToastNotification("🎵 배경음악 활성화", "크리스마스 배경음악이 재생됩니다.", null);
    } else {
        stopBGM();
        showToastNotification("🎵 배경음악 비활성화", "배경음악이 꺼졌습니다.", null);
    }
}

// 버튼 클릭 시 효과음 (이벤트 위임)
document.addEventListener('click', function(e) {
    if (!soundEnabled || currentTheme !== 'christmas') return;
    
    const target = e.target.closest('button, .btn, .nav-btn, .chip, .vote-btn, .article-card, .notification-card');
    
    if (target) {
        // 투표 버튼은 success 사운드
        if (target.matches('.vote-btn')) {
            playSound('success');
        } 
        // 나머지는 click 사운드
        else {
            playSound('click');
        }
    }
}, true);

// 페이지 로드 시 초기화
window.addEventListener('load', function() {
    // 사운드 시스템 초기화
    initSoundSystem();
    
    // 설정 페이지가 열릴 때마다 디자인 설정 표시
    const originalShowSettings = window.showSettings;
    if (originalShowSettings) {
        window.showSettings = function() {
            originalShowSettings();
            setTimeout(() => {
                updateSettingsWithDesign();
            }, 100);
        };
    }
});

console.log("🎄 크리스마스 사운드 & 테마 시스템 로드 완료");
console.log("📰 기본 테마: style.css 사용");
console.log("🎄 크리스마스 테마: style.css + style1.css 사용");
