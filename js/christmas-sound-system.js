// applyTheme 함수 내부 수정
function applyTheme(theme, showNotification = true) {
    currentTheme = theme;
    window.currentTheme = theme; // ✅ 추가
    // ...
}

// 전역 오디오 객체 및 설정 변수
let bgmAudio = null;
let soundEnabled = false; 
let bgmEnabled = false;
let currentTheme = 'default';

// 1. 사운드 시스템 초기화
async function initSoundSystem() {
    console.log("🚀 사운드 시스템 초기화 시작...");
    
    if(typeof isLoggedIn === 'function' && isLoggedIn()) {
        const uid = getUserId();
        try {
            const themeSnap = await db.ref("users/" + uid + "/activeTheme").once("value");
            const soundSnap = await db.ref("users/" + uid + "/activeSounds").once("value");
            const bgmSnap = await db.ref("users/" + uid + "/activeBGM").once("value");
            
            if(themeSnap.exists()) currentTheme = themeSnap.val();
            if(soundSnap.exists()) soundEnabled = soundSnap.val();
            if(bgmSnap.exists()) bgmEnabled = bgmSnap.val();
            
            console.log(`✅ 설정 로드: 테마[${currentTheme}], 효과음[${soundEnabled}], BGM[${bgmEnabled}]`);
        } catch(error) {
            console.error("❌ Firebase 설정 로드 실패:", error);
        }
    }
    
    applyTheme(currentTheme, false);
}

// 2. 테마 적용
function applyTheme(theme, showNotification = true) {
    currentTheme = theme;
    window.currentTheme = theme; // ✅ 전역으로 노출
    const christmasStylesheet = document.getElementById('christmasStylesheet');
    
    if (theme === 'christmas') {
        if (!christmasStylesheet) {
            const link = document.createElement('link');
            link.id = 'christmasStylesheet';
            link.rel = 'stylesheet';
            link.href = './style1.css'; 
            document.head.appendChild(link);
        }
        
        if(bgmEnabled) playBGM();

        if (showNotification) {
            showToastNotification("🎄 테마 변경", "크리스마스 테마가 적용되었습니다.", null);
        }
    } else {
        if (christmasStylesheet) {
            christmasStylesheet.remove();
        }
        
        stopBGM();

        if (showNotification) {
            showToastNotification("📰 테마 변경", "기본 테마가 적용되었습니다.", null);
        }
    }
}

// 3. 테마 선택
window.selectTheme = async function(theme) {
    if(!isLoggedIn()) {
        alert("로그인이 필요합니다!");
        return;
    }
    
    if(theme === 'christmas') {
        const uid = getUserId();
        const snapshot = await db.ref("users/" + uid + "/inventory").once("value");
        const inventory = snapshot.val() || [];
        
        if(!inventory.includes('christmas_theme')) {
            if(confirm("🎄 크리스마스 테마는 상점에서 구매해야 합니다.\n이동하시겠습니까?")) {
                showShop();
            }
            return;
        }
    }
    
    playSound('click');
    
    const uid = getUserId();
    await db.ref("users/" + uid + "/activeTheme").set(theme);
    
    applyTheme(theme, true);
    
    if(typeof updateSettings === 'function') {
        updateSettings();
    }
}

// 4. BGM 초기화 및 재생
function initBGM() {
    if (!bgmAudio) {
        bgmAudio = new Audio();
        bgmAudio.src = "./sounds/christmas-bgm.mp3"; 
        bgmAudio.loop = true;
        bgmAudio.volume = 0.3;
    }
}

// 4. BGM 재생 함수 수정
function playBGM() {
    if (!bgmAudio) initBGM();
    
    // ✅ 로딩 확인 추가
    if (bgmAudio.readyState < 2) {
        console.log("⏳ BGM 로딩 중...");
        bgmAudio.addEventListener('canplay', function() {
            bgmAudio.play().catch(e => {
                console.log("⚠️ BGM 자동재생 차단:", e.message);
                showBGMUnlockPrompt();
            });
        }, { once: true });
    } else {
        const playPromise = bgmAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("✅ BGM 재생 시작");
            }).catch(error => {
                console.log("⚠️ BGM 자동재생 차단:", error.message);
                showBGMUnlockPrompt();
            });
        }
    }
}

// ... 기존 playBGM 함수 아래에 이 코드를 추가하세요 ...

// ✅ [추가] BGM 정지 함수
function stopBGM() {
    if (bgmAudio) {
        bgmAudio.pause();          // 재생 일시정지
        bgmAudio.currentTime = 0;  // 재생 위치를 처음으로 되돌림
        console.log("🛑 BGM 정지됨");
    }
}

// ...

// BGM 잠금 해제 안내
function showBGMUnlockPrompt() {
    const prompt = document.createElement('div');
    prompt.id = 'bgmUnlockPrompt';
    prompt.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        cursor: pointer;
        animation: slideIn 0.3s ease;
    `;
    prompt.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <i class="fas fa-music" style="font-size:24px;"></i>
            <div>
                <div style="font-weight:700; margin-bottom:3px;">🎵 BGM 재생하기</div>
                <div style="font-size:12px; opacity:0.9;">클릭하여 배경음악 시작</div>
            </div>
        </div>
    `;
    
    prompt.onclick = function() {
        if(bgmAudio) {
            bgmAudio.play().then(() => {
                console.log("✅ 사용자 클릭으로 BGM 재생");
                prompt.remove();
            });
        }
    };
    
    document.body.appendChild(prompt);
    
    // 10초 후 자동 제거
    setTimeout(() => {
        if(prompt.parentElement) prompt.remove();
    }, 10000);
}

// 5. BGM 토글 함수 수정
window.toggleBGM = async function(isChecked) {
    if(typeof isChecked !== 'boolean') {
        const toggle = document.getElementById('bgmToggleCheckbox');
        if(toggle) isChecked = toggle.checked;
    }

    bgmEnabled = isChecked;
    
    if(isLoggedIn()) {
        const uid = getUserId();
        
        // 인벤토리 확인
        const inventorySnapshot = await db.ref("users/" + uid + "/inventory").once("value");
        const inventory = inventorySnapshot.val() || [];
        
        if(!inventory.includes('christmas_bgm')) {
            alert("🎵 크리스마스 BGM은 상점에서 구매해야 합니다!");
            
            // 체크박스 원상복구
            const checkbox = document.getElementById('bgmToggleCheckbox');
            if(checkbox) checkbox.checked = false;
            bgmEnabled = false; // ✅ 상태도 원복
            return;
        }
        
        // ✅ Firebase에 저장
        await db.ref("users/" + uid + "/activeBGM").set(isChecked);
    }
    
    if(isChecked) {
        playBGM(); // ✅ 테마 체크 없이 바로 재생
        showToastNotification("🎵 BGM 켜짐", "배경음악이 재생됩니다.", null);
    } else {
        stopBGM();
        showToastNotification("🔇 BGM 꺼짐", "배경음악이 꺼졌습니다.", null);
    }
    
    // ✅ 체크박스 동기화 (확실하게)
    const checkbox = document.getElementById('bgmToggleCheckbox');
    if(checkbox) {
        checkbox.checked = isChecked;
    }
}

// 6. 효과음 재생
function playSound(type) {
    if (!soundEnabled) return;

    const audio = new Audio();
    audio.volume = 0.5;
    
    switch(type) {
        case 'click': audio.src = "./sounds/click.mp3"; break;
        case 'success': audio.src = "./sounds/success.mp3"; break;
        case 'notification': audio.src = "./sounds/notification.mp3"; break;
        case 'error': audio.src = "./sounds/error.mp3"; break;
        default: return;
    }
    
    audio.play().then(() => {
        console.log("🔊 효과음 재생:", type);
    }).catch(e => {
        console.log("⚠️ 효과음 재생 실패:", e);
    }); 
}

// 7. 효과음 토글 함수 수정
window.toggleSounds = async function(isChecked) {
    if(typeof isChecked !== 'boolean') {
        const toggle = document.getElementById('soundToggle');
        if(toggle) isChecked = toggle.checked;
    }

    soundEnabled = isChecked;
    
    if(isLoggedIn()) {
        const uid = getUserId();
        
        // 인벤토리 확인
        const inventorySnapshot = await db.ref("users/" + uid + "/inventory").once("value");
        const inventory = inventorySnapshot.val() || [];
        
        if(!inventory.includes('christmas_sounds')) {
            alert("🔊 크리스마스 효과음은 상점에서 구매해야 합니다!");
            
            // 체크박스 원상복구
            const checkbox = document.getElementById('soundToggle');
            if(checkbox) checkbox.checked = false;
            soundEnabled = false; // ✅ 상태도 원복
            return;
        }
        
        // ✅ Firebase에 저장
        await db.ref("users/" + uid + "/activeSounds").set(isChecked);
    }
    
    showToastNotification(
        isChecked ? "🔊 효과음 켜짐" : "🔇 효과음 꺼짐",
        isChecked ? "효과음이 활성화되었습니다." : "효과음이 비활성화되었습니다.",
        null
    );
    
    // 테스트 효과음 재생
    if(isChecked) {
        playSound('success');
    }
    
    // ✅ 체크박스 동기화 (확실하게)
    const checkbox = document.getElementById('soundToggle');
    if(checkbox) {
        checkbox.checked = isChecked;
    }
}

// 8. 페이지 클릭 시 BGM 자동재생 (테마 체크 제거)
document.addEventListener('click', function() {
    // ✅ 수정: 테마와 관계없이 BGM이 켜져있으면 재생
    if(bgmEnabled && bgmAudio && bgmAudio.paused) {
        bgmAudio.play().catch(()=>{});
    }
}, { once: true });

// 9. UI 클릭음 바인딩
document.addEventListener('click', function(e) {
    if(e.target.closest('button, .btn, .nav-btn, .chip')) {
        playSound('click');
    }
});

console.log("🎄 크리스마스 사운드 & 테마 시스템 로드 완료");
