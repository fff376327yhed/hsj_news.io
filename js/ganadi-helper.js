// ============================================
// 🐶 가나디 이미지 관리 JavaScript (이스터에그 버전)
// ⚠️ 가나디 테마일 때만 가나디 요소를 표시
// 🎁 코너 가나디는 이스터에그로 숨김!
// ============================================

// 가나디 요소들을 저장할 변수
let ganadiHeaderElement = null;
let ganadiCornerElements = [];
let lastThemeCheck = null;
let ganadiCheckInterval = null;
let easterEggActivated = false;
let logoClickCount = 0;
let logoClickTimer = null;

/**
 * 현재 테마가 가나디 테마인지 확인
 */
function isGanadiTheme() {
    return document.body.classList.contains('ganadi-theme');
}

/**
 * 🎁 이스터에그 활성화 확인
 */
function isEasterEggActivated() {
    // 세션 스토리지에서 이스터에그 상태 확인
    return sessionStorage.getItem('ganadi_easter_egg') === 'true' || easterEggActivated;
}

/**
 * 🎁 이스터에그 활성화
 */
function activateEasterEgg() {
    easterEggActivated = true;
    sessionStorage.setItem('ganadi_easter_egg', 'true');
    console.log('🎉 가나디 이스터에그 활성화!');
    
    // 코너 가나디 표시
    if (isGanadiTheme()) {
        initGanadiCorners();
    }
    
    // 축하 메시지 표시
    showEasterEggMessage();
}

/**
 * 🎁 이스터에그 발견 메시지 표시
 */
function showEasterEggMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 3px solid #FFB6C1;
        border-radius: 20px;
        padding: 30px 40px;
        box-shadow: 0 8px 32px rgba(255, 182, 193, 0.5);
        z-index: 99999;
        text-align: center;
        animation: easterEggPop 0.5s ease-out;
    `;
    
    message.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
        <div style="font-size: 20px; font-weight: 700; color: #4A4A4A; margin-bottom: 10px;">
            이스터에그 발견!
        </div>
        <div style="font-size: 14px; color: #B0B0B0;">
            듀... 숨겨진 가나디들을 찾았어요! 🐶
        </div>
    `;
    
    document.body.appendChild(message);
    
    // 3초 후 메시지 제거
    setTimeout(() => {
        message.style.animation = 'easterEggFadeOut 0.5s ease-out forwards';
        setTimeout(() => message.remove(), 500);
    }, 3000);
}

/**
 * 🎁 이스터에그 트리거 설정
 */
function setupEasterEggTriggers() {
    // 방법 1: 로고를 5번 클릭
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', () => {
            if (easterEggActivated) return;
            
            logoClickCount++;
            
            // 타이머 초기화
            clearTimeout(logoClickTimer);
            logoClickTimer = setTimeout(() => {
                logoClickCount = 0;
            }, 2000); // 2초 안에 5번 클릭해야 함
            
            // 클릭 피드백
            if (logoClickCount < 5) {
                logo.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    logo.style.transform = 'scale(1)';
                }, 100);
            }
            
            // 5번 클릭하면 이스터에그 활성화
            if (logoClickCount >= 5) {
                activateEasterEgg();
                logoClickCount = 0;
            }
        });
    }
    
    // 방법 2: Konami Code (↑ ↑ ↓ ↓ ← → ← → B A)
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 
        'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 
        'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (easterEggActivated) return;
        
        if (e.code === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
    
    // 방법 3: 가나디 테마를 3번 껐다 켰다 하기
    let themeToggleCount = 0;
    let lastTheme = isGanadiTheme();
    
    const checkThemeToggle = setInterval(() => {
        if (easterEggActivated) {
            clearInterval(checkThemeToggle);
            return;
        }
        
        const currentTheme = isGanadiTheme();
        if (currentTheme !== lastTheme) {
            if (currentTheme) { // 가나디 테마로 켰을 때만 카운트
                themeToggleCount++;
                console.log(`🐶 테마 토글 ${themeToggleCount}/3`);
                
                if (themeToggleCount >= 3) {
                    activateEasterEgg();
                    clearInterval(checkThemeToggle);
                }
            }
            lastTheme = currentTheme;
        }
    }, 500);
}

/**
 * 🆕 페이지 코너에 고정된 작은 가나디들 추가 (이스터에그 활성화 시에만)
 */
function initGanadiCorners() {
    // 이미 생성된 코너 가나디가 있으면 제거
    removeGanadiCorners();
    
    // 가나디 테마가 아니거나 이스터에그가 활성화되지 않았으면 아무것도 하지 않음
    if (!isGanadiTheme() || !isEasterEggActivated()) {
        return;
    }
    
    // 코너 가나디 설정 (고정 위치, 작고 은은하게)
    const corners = [
        { position: 'top-left', image: 'images/ganadi1.png', size: '50px' },
        { position: 'top-right', image: 'images/ganadi2.png', size: '45px' },
        { position: 'bottom-left', image: 'images/ganadi3.png', size: '55px' },
        { position: 'bottom-right', image: 'images/ganadi4.png', size: '50px' }
    ];
    
    corners.forEach(corner => {
        const cornerDiv = document.createElement('div');
        cornerDiv.className = `ganadi-corner ganadi-corner-${corner.position}`;
        cornerDiv.setAttribute('data-ganadi', 'true');
        
        // 위치에 따른 스타일 설정
        const positions = {
            'top-left': 'top: 80px; left: 10px;',
            'top-right': 'top: 80px; right: 10px;',
            'bottom-left': 'bottom: 80px; left: 10px;',
            'bottom-right': 'bottom: 80px; right: 10px;'
        };
        
        cornerDiv.style.cssText = `
            position: fixed;
            ${positions[corner.position]}
            width: ${corner.size};
            height: ${corner.size};
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            pointer-events: none;
            z-index: 1;
            animation: ganadiAppear 0.5s ease-out forwards;
            animation-delay: ${corners.indexOf(corner) * 0.1}s;
        `;
        
        const img = document.createElement('img');
        img.src = corner.image;
        img.alt = '가나디';
        img.style.cssText = 'width: 100%; height: 100%; object-fit: contain;';
        img.onerror = function() {
            this.parentElement.style.display = 'none';
        };
        
        cornerDiv.appendChild(img);
        document.body.appendChild(cornerDiv);
        ganadiCornerElements.push(cornerDiv);
    });
    
    // 호버 효과 추가
    ganadiCornerElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.opacity = '0.6';
            this.style.transform = 'scale(1.1)';
        });
        element.addEventListener('mouseleave', function() {
            this.style.opacity = '0.25';
            this.style.transform = 'scale(1)';
        });
    });
}

/**
 * 코너 가나디들 제거
 */
function removeGanadiCorners() {
    ganadiCornerElements.forEach(element => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
    ganadiCornerElements = [];
}

/**
 * 헤더에 가나디 추가 (가나디 테마일 때만)
 */
function initGanadiHeader() {
    // 이미 생성된 헤더 가나디가 있으면 제거
    removeGanadiHeader();
    
    // 가나디 테마가 아니면 아무것도 하지 않음
    if (!isGanadiTheme()) {
        return;
    }
    
    const header = document.querySelector('header');
    if (!header) return;
    
    const ganadiDiv = document.createElement('div');
    ganadiDiv.className = 'ganadi-header';
    ganadiDiv.setAttribute('data-ganadi', 'true');
    
    const img = document.createElement('img');
    img.src = 'images/ganadi-header.png';
    img.alt = '가나디';
    img.onerror = function() {
        this.parentElement.style.display = 'none';
    };
    
    ganadiDiv.appendChild(img);
    header.appendChild(ganadiDiv);
    ganadiHeaderElement = ganadiDiv;
}

/**
 * 헤더 가나디 제거
 */
function removeGanadiHeader() {
    if (ganadiHeaderElement && ganadiHeaderElement.parentNode) {
        ganadiHeaderElement.parentNode.removeChild(ganadiHeaderElement);
        ganadiHeaderElement = null;
    }
}

/**
 * 모든 가나디 요소 초기화 (테마에 따라)
 */
function updateGanadiElements() {
    if (isGanadiTheme()) {
        // 가나디 테마면 가나디 추가
        initGanadiHeader(); // 헤더는 항상 표시
        
        // 코너 가나디는 이스터에그 활성화 시에만
        if (isEasterEggActivated()) {
            initGanadiCorners();
        }
        
        setTimeout(addGanadiToCommentForm, 500);
    } else {
        // 다른 테마면 가나디 제거
        removeGanadiHeader();
        removeGanadiCorners();
        removeGanadiFromCommentForm();
    }
}

/**
 * 🆕 주기적으로 가나디 상태 확인 및 복원
 */
function startGanadiWatcher() {
    // 기존 인터벌이 있으면 제거
    if (ganadiCheckInterval) {
        clearInterval(ganadiCheckInterval);
    }
    
    // 1초마다 가나디 상태 체크
    ganadiCheckInterval = setInterval(() => {
        const currentTheme = isGanadiTheme();
        
        // 테마가 변경되었거나, 가나디 테마인데 요소가 없을 때 복원
        if (currentTheme !== lastThemeCheck) {
            console.log('🐶 테마 변경 감지:', currentTheme ? '가나디 테마' : '다른 테마');
            updateGanadiElements();
            lastThemeCheck = currentTheme;
        } else if (currentTheme) {
            // 가나디 테마인데 요소가 사라졌는지 확인
            const hasHeader = document.querySelector('.ganadi-header[data-ganadi="true"]') !== null;
            
            if (!hasHeader) {
                console.log('🐶 가나디 요소 복원 중...');
                updateGanadiElements();
            }
            
            // 이스터에그가 활성화된 경우 코너 가나디도 확인
            if (isEasterEggActivated()) {
                const hasCorners = document.querySelectorAll('.ganadi-corner[data-ganadi="true"]').length > 0;
                if (!hasCorners) {
                    console.log('🐶 코너 가나디 복원 중...');
                    initGanadiCorners();
                }
            }
        }
    }, 1000);
}

/**
 * 🆕 특정 행동 시 가나디 보너스 효과 표시
 * @param {string} action - 행동 종류 ('like', 'comment')
 */
function showGanadiBonusEffect(action = 'like') {
    if (!isGanadiTheme()) return;
    
    const bonusGanadi = document.createElement('div');
    bonusGanadi.className = 'ganadi-bonus-effect';
    bonusGanadi.setAttribute('data-ganadi-bonus', 'true');
    
    // 랜덤 위치 설정 (화면 중앙 부근에 생성)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = (Math.random() - 0.5) * 200; // ±100px
    const offsetY = (Math.random() - 0.5) * 200; // ±100px
    const x = Math.max(50, Math.min(window.innerWidth - 150, centerX + offsetX));
    const y = Math.max(50, Math.min(window.innerHeight - 150, centerY + offsetY));
    
    bonusGanadi.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 70px;
        height: 70px;
        z-index: 9999;
        pointer-events: none;
        animation: ganadi-pop 1.5s ease-out forwards;
    `;
    
    const img = document.createElement('img');
    // 행동에 따라 다른 이미지 표시
    const bonusImages = {
        'like': 'images/ganadi4.png',
        'comment': 'images/ganadi5.png'
    };
    img.src = bonusImages[action] || 'images/ganadi1.png';
    img.alt = '가나디';
    img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(2px 2px 8px rgba(255, 182, 193, 0.6));';
    
    bonusGanadi.appendChild(img);
    document.body.appendChild(bonusGanadi);
    
    // 1.5초 후 제거
    setTimeout(() => {
        if (bonusGanadi && bonusGanadi.parentNode) {
            bonusGanadi.parentNode.removeChild(bonusGanadi);
        }
    }, 1500);
}

/**
 * 빈 화면 표시 (기사가 없을 때 등) - 가나디 테마일 때만 가나디 이미지 사용
 * @param {string} containerId - 빈 화면을 표시할 컨테이너 ID
 * @param {string} message - 표시할 메시지
 * @param {string} submessage - 표시할 서브 메시지
 */
function showGanadiEmpty(containerId, message = "🐶 듀... 아무것도 없어요", submessage = "") {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 가나디 테마일 때만 가나디 이미지 표시
    if (isGanadiTheme()) {
        container.innerHTML = `
            <div class="ganadi-empty">
                <div class="ganadi-empty-image">
                    <img src="images/ganadi-sad.png" alt="가나디" onerror="this.src='images/ganadi1.png'">
                </div>
                <div class="ganadi-empty-text">${message}</div>
                ${submessage ? `<div class="ganadi-empty-subtext">${submessage}</div>` : ''}
            </div>
        `;
    } else {
        // 다른 테마일 때는 텍스트만 표시
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 18px; color: #666; font-weight: 600; margin-bottom: 8px;">
                    ${message}
                </div>
                ${submessage ? `<div style="font-size: 14px; color: #999;">${submessage}</div>` : ''}
            </div>
        `;
    }
}

/**
 * 로딩 표시 - 가나디 테마일 때만 가나디 이미지 사용
 * @param {string} containerId - 로딩을 표시할 컨테이너 ID
 */
function showGanadiLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 가나디 테마일 때만 가나디 이미지 표시
    if (isGanadiTheme()) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div class="ganadi-loading">
                    <img src="images/ganadi-loading.png" alt="로딩중" onerror="this.src='images/ganadi1.png'">
                </div>
                <div style="margin-top: 16px; color: var(--ganadi-soft-gray);">
                    듀... 잠시만요...
                </div>
            </div>
        `;
    } else {
        // 다른 테마일 때는 기본 로딩 표시
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 32px; color: #999;">⏳</div>
                <div style="margin-top: 16px; color: #999; font-size: 14px;">
                    잠시만 기다려주세요...
                </div>
            </div>
        `;
    }
}

/**
 * 댓글 입력창에 가나디 추가 (가나디 테마일 때만)
 */
function addGanadiToCommentForm() {
    // 가나디 테마가 아니면 아무것도 하지 않음
    if (!isGanadiTheme()) {
        return;
    }
    
    const commentForms = document.querySelectorAll('.comment-form, .reply-form');
    
    commentForms.forEach(form => {
        // 이미 가나디가 있으면 스킵
        if (form.querySelector('.comment-form-ganadi')) return;
        
        // 폼을 relative position으로 설정
        form.style.position = 'relative';
        
        const ganadiDiv = document.createElement('div');
        ganadiDiv.className = 'comment-form-ganadi';
        ganadiDiv.setAttribute('data-ganadi', 'true');
        
        const img = document.createElement('img');
        img.src = 'images/ganadi-comment.png';
        img.alt = '가나디';
        img.onerror = function() {
            this.parentElement.style.display = 'none';
        };
        
        ganadiDiv.appendChild(img);
        form.appendChild(ganadiDiv);
    });
}

/**
 * 댓글 폼에서 가나디 제거
 */
function removeGanadiFromCommentForm() {
    const ganadiElements = document.querySelectorAll('.comment-form-ganadi[data-ganadi="true"]');
    ganadiElements.forEach(element => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
}

/**
 * 테마 변경 감지 - MutationObserver 사용
 */
function watchThemeChanges() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                // body의 클래스가 변경되면 가나디 요소 업데이트
                updateGanadiElements();
            }
        });
    });
    
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
}

/**
 * 🆕 특정 이벤트에 가나디 보너스 효과 연결
 */
function attachGanadiBonusEvents() {
    if (!isGanadiTheme()) return;
    
    // 좋아요 버튼 클릭 시 (확률 80%)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.vote-btn, .like-btn')) {
            if (Math.random() < 0.8) {
                showGanadiBonusEffect('like');
            }
        }
    });
    
    // 댓글 작성 완료 시 (항상 표시)
    const originalSubmitComment = window.submitComment;
    if (typeof originalSubmitComment === 'function') {
        window.submitComment = function() {
            const result = originalSubmitComment.apply(this, arguments);
            showGanadiBonusEffect('comment');
            return result;
        };
    }
}

/**
 * 🆕 CSS 애니메이션 추가
 */
function injectGanadiAnimations() {
    if (document.getElementById('ganadi-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'ganadi-animations';
    style.textContent = `
        @keyframes ganadi-pop {
            0% {
                opacity: 0;
                transform: scale(0) rotate(0deg);
            }
            20% {
                opacity: 1;
                transform: scale(1.3) rotate(15deg);
            }
            50% {
                opacity: 1;
                transform: scale(1) rotate(-10deg);
            }
            100% {
                opacity: 0;
                transform: scale(0.5) translateY(-100px) rotate(20deg);
            }
        }
        
        @keyframes ganadiAppear {
            0% {
                opacity: 0;
                transform: scale(0) rotate(-180deg);
            }
            60% {
                opacity: 0.4;
                transform: scale(1.2) rotate(10deg);
            }
            100% {
                opacity: 0.25;
                transform: scale(1) rotate(0deg);
            }
        }
        
        @keyframes easterEggPop {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.5);
            }
            50% {
                transform: translate(-50%, -50%) scale(1.1);
            }
            100% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        @keyframes easterEggFadeOut {
            to {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
        }
        
        /* 모바일 반응형 - 코너 가나디 크기 조정 */
        @media (max-width: 768px) {
            .ganadi-corner {
                opacity: 0.15 !important;
            }
            .ganadi-corner:hover {
                opacity: 0.4 !important;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 페이지 로드 시 가나디 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🐶 가나디 헬퍼 초기화 시작 (이스터에그 버전)');
    console.log('🎁 이스터에그 힌트:');
    console.log('  1. 로고를 빠르게 5번 클릭');
    console.log('  2. 키보드로 ↑↑↓↓←→←→BA 입력 (Konami Code)');
    console.log('  3. 가나디 테마를 3번 껐다 켜기');
    
    // CSS 애니메이션 추가
    injectGanadiAnimations();
    
    // 이스터에그 세션 스토리지 확인
    if (sessionStorage.getItem('ganadi_easter_egg') === 'true') {
        easterEggActivated = true;
        console.log('🎉 이스터에그 이미 활성화됨!');
    }
    
    // 테마 변경 감지 시작
    watchThemeChanges();
    
    // 초기 가나디 요소 설정
    updateGanadiElements();
    lastThemeCheck = isGanadiTheme();
    
    // 주기적 감시 시작
    startGanadiWatcher();
    
    // 이스터에그 트리거 설정
    setTimeout(() => {
        setupEasterEggTriggers();
    }, 500);
    
    // 보너스 효과 이벤트 연결
    setTimeout(() => {
        attachGanadiBonusEvents();
    }, 1000);
    
    console.log('✅ 가나디 헬퍼 초기화 완료');
});

// 페이지 전환 시 가나디 복원
if (typeof window.hideAll === 'function') {
    const originalHideAll = window.hideAll;
    window.hideAll = function() {
        originalHideAll.apply(this, arguments);
        // 페이지 전환 후 가나디 복원
        setTimeout(() => {
            if (isGanadiTheme()) {
                updateGanadiElements();
            }
        }, 100);
    };
}

// ============================================
// 전역 함수로 노출 (외부에서 사용 가능)
// ============================================
window.showGanadiEmpty = showGanadiEmpty;
window.showGanadiLoading = showGanadiLoading;
window.updateGanadiElements = updateGanadiElements;
window.showGanadiBonusEffect = showGanadiBonusEffect;
window.isGanadiTheme = isGanadiTheme;
window.activateEasterEgg = activateEasterEgg; // 수동 활성화용

// ============================================
// 사용 예시:
// ============================================

/*
// 1. 기사가 없을 때
showGanadiEmpty('articlesList', '🐶 듀... 아직 기사가 없어요', '첫 번째 기사를 작성해보세요!');

// 2. 로딩 중일 때
showGanadiLoading('articlesList');

// 3. 수동으로 보너스 효과 표시
showGanadiBonusEffect('like'); // 'like', 'comment'

// 4. 수동으로 가나디 요소 업데이트
updateGanadiElements();

// 5. 현재 테마 확인
if (isGanadiTheme()) {
    console.log('현재 가나디 테마입니다!');
}

// 6. 수동으로 이스터에그 활성화
activateEasterEgg();
*/