// ===== script2.js: 알림 기능 =====

let notificationsEnabled = false;
let lastArticleId = null;

// 알림 권한 요청 및 초기화
async function initializeNotifications() {
    // 브라우저가 알림을 지원하는지 확인
    if (!("Notification" in window)) {
        console.log("이 브라우저는 알림을 지원하지 않습니다.");
        return;
    }

    // 저장된 알림 설정 불러오기
    const savedSetting = localStorage.getItem("notificationsEnabled");
    if (savedSetting === null) {
        // 기본값: 켜짐
        notificationsEnabled = true;
        localStorage.setItem("notificationsEnabled", "true");
    } else {
        notificationsEnabled = savedSetting === "true";
    }

    // 체크박스 상태 업데이트
    const checkbox = document.getElementById("notificationToggle");
    if (checkbox) {
        checkbox.checked = notificationsEnabled;
    }

    // 알림이 활성화되어 있으면 권한 요청
    if (notificationsEnabled) {
        await requestNotificationPermission();
    }

    updateNotificationStatus();
    
    // 마지막 기사 ID 불러오기
    const savedLastArticleId = localStorage.getItem("lastArticleId");
    if (savedLastArticleId) {
        lastArticleId = savedLastArticleId;
    }

    // 새 기사 감지 시작
    if (notificationsEnabled) {
        startArticleListener();
    }
}

// 알림 권한 요청
async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        updateNotificationStatus();
        return permission === "granted";
    }

    return false;
}

// 알림 토글
async function toggleNotifications() {
    const checkbox = document.getElementById("notificationToggle");
    notificationsEnabled = checkbox.checked;
    
    localStorage.setItem("notificationsEnabled", notificationsEnabled.toString());

    if (notificationsEnabled) {
        const granted = await requestNotificationPermission();
        if (!granted) {
            // 권한이 거부되면 체크박스 다시 해제
            checkbox.checked = false;
            notificationsEnabled = false;
            localStorage.setItem("notificationsEnabled", "false");
            alert("알림 권한이 거부되었습니다.\n브라우저 설정에서 알림 권한을 허용해주세요.");
        } else {
            startArticleListener();
            alert("새 기사 알림이 활성화되었습니다! 📢");
        }
    } else {
        alert("새 기사 알림이 비활성화되었습니다.");
    }

    updateNotificationStatus();
}

// 알림 상태 표시 업데이트
function updateNotificationStatus() {
    const statusDiv = document.getElementById("notificationStatus");
    if (!statusDiv) return;

    if (!("Notification" in window)) {
        statusDiv.innerHTML = `
            <div style="background:#f8d7da;color:#721c24;padding:10px;border-radius:6px;">
                ⚠️ 이 브라우저는 알림을 지원하지 않습니다.
            </div>
        `;
        return;
    }

    if (notificationsEnabled) {
        if (Notification.permission === "granted") {
            statusDiv.innerHTML = `
                <div style="background:#d4edda;color:#155724;padding:10px;border-radius:6px;">
                    ✅ 알림이 활성화되었습니다
                </div>
            `;
        } else if (Notification.permission === "denied") {
            statusDiv.innerHTML = `
                <div style="background:#f8d7da;color:#721c24;padding:10px;border-radius:6px;">
                    ❌ 알림 권한이 차단되었습니다<br>
                    <small>브라우저 설정에서 알림 권한을 허용해주세요</small>
                </div>
            `;
        } else {
            statusDiv.innerHTML = `
                <div style="background:#fff3cd;color:#856404;padding:10px;border-radius:6px;">
                    ⏳ 알림 권한을 허용해주세요
                </div>
            `;
        }
    } else {
        statusDiv.innerHTML = `
            <div style="background:#e2e3e5;color:#383d41;padding:10px;border-radius:6px;">
                🔕 알림이 비활성화되었습니다
            </div>
        `;
    }
}

// 새 기사 감지 리스너 시작
function startArticleListener() {
    if (!notificationsEnabled) return;

    // Firebase 실시간 리스너
    db.ref("articles").orderByChild("createdAt").limitToLast(1).on("child_added", (snapshot) => {
        const article = snapshot.val();
        
        // 첫 로드 시 또는 이미 알림을 보낸 기사는 제외
        if (!article || !article.id) return;
        
        // 페이지 로드 후 처음 감지된 기사는 제외 (기존 기사)
        if (lastArticleId === null) {
            lastArticleId = article.id;
            localStorage.setItem("lastArticleId", article.id);
            return;
        }

        // 이미 알림을 보낸 기사는 제외
        if (lastArticleId === article.id) return;

        // 자신이 작성한 기사는 알림 제외
        const currentUserEmail = getUserEmail();
        if (article.authorEmail === currentUserEmail) {
            lastArticleId = article.id;
            localStorage.setItem("lastArticleId", article.id);
            return;
        }

        // 새 기사 알림 표시
        showArticleNotification(article);
        
        // 마지막 기사 ID 업데이트
        lastArticleId = article.id;
        localStorage.setItem("lastArticleId", article.id);
    });
}

// 기사 알림 표시
function showArticleNotification(article) {
    if (!notificationsEnabled) return;
    if (Notification.permission !== "granted") return;

    const title = "📰 새 기사가 게시되었습니다!";
    const options = {
        body: `[${article.category}] ${article.title}\n작성자: ${article.author}`,
        tag: article.id, // 같은 기사에 대한 중복 알림 방지
        requireInteraction: false, // 자동으로 사라지게 설정
        silent: false,
        data: {
            articleId: article.id,
            url: window.location.href
        }
    };

    // 썸네일이 있으면 icon으로 사용
    if (article.thumbnail) {
        options.icon = article.thumbnail;
    }

    try {
        const notification = new Notification(title, options);

        // 알림 클릭 시 해당 기사로 이동
        notification.onclick = function(event) {
            event.preventDefault();
            window.focus();
            showArticleDetail(article.id);
            notification.close();
        };

        // 자동으로 5초 후 닫기
        setTimeout(() => {
            notification.close();
        }, 5000);

    } catch (error) {
        console.error("알림 표시 오류:", error);
    }
}

// 테스트 알림 (관리자용)
function sendTestNotification() {
    if (!notificationsEnabled) {
        return alert("알림이 비활성화되어 있습니다.");
    }

    if (Notification.permission !== "granted") {
        return alert("알림 권한이 필요합니다.");
    }

    const testArticle = {
        id: "test",
        category: "테스트",
        title: "테스트 알림입니다",
        author: "시스템",
        thumbnail: null
    };

    showArticleNotification(testArticle);
    alert("테스트 알림이 전송되었습니다!");
}

// 설정 페이지가 표시될 때 알림 설정 초기화
const originalUpdateSettings = window.updateSettings;
if (originalUpdateSettings) {
    window.updateSettings = async function() {
        await originalUpdateSettings();
        
        // 알림 설정 표시
        const notificationToggle = document.getElementById("notificationToggle");
        if (notificationToggle) {
            notificationToggle.checked = notificationsEnabled;
        }
        updateNotificationStatus();
        
        // 관리자에게 테스트 버튼 표시
        if (isAdmin()) {
            const notificationSettings = document.getElementById("notificationSettings");
            if (notificationSettings && !document.getElementById("testNotificationBtn")) {
                const testBtn = document.createElement("button");
                testBtn.id = "testNotificationBtn";
                testBtn.className = "btn btn-warning";
                testBtn.style.cssText = "width:100%;margin-top:15px;font-size:13px;";
                testBtn.textContent = "🔔 테스트 알림 보내기";
                testBtn.onclick = sendTestNotification;
                notificationSettings.appendChild(testBtn);
            }
        }
    };
}

// 페이지 로드 시 알림 초기화
window.addEventListener("load", () => {
    setTimeout(() => {
        initializeNotifications();
    }, 500);
});

// 페이지를 떠날 때 리스너 정리
window.addEventListener("beforeunload", () => {
    if (db && db.ref) {
        db.ref("articles").off("child_added");
    }
});