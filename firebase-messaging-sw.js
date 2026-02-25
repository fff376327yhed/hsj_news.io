// ===== Firebase Cloud Messaging Service Worker =====
// ⚠️ index.html과 동일한 버전 사용! (8.10.0)

console.log('[SW] 🔧 Service Worker 로딩 시작');

// ✅ index.html과 동일한 버전으로 변경
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

console.log('[SW] 📦 Firebase SDK 로드 완료');

// Firebase 설정 (index.html과 동일)
firebase.initializeApp({
  apiKey: "AIzaSyDgooYtVr8-jm15-fx_WvGLCDxonLpNPuU",
  authDomain: "hsj-news.firebaseapp.com",
  databaseURL: "https://hsj-news-default-rtdb.firebaseio.com",
  projectId: "hsj-news",
  storageBucket: "hsj-news.firebasestorage.app",
  messagingSenderId: "437842430700",
  appId: "1:437842430700:web:e3822bde4cfecdc04633c9"
});

const messaging = firebase.messaging();

console.log('[SW] ✅ Firebase Messaging 초기화 완료');

// ===== 백그라운드 메시지 수신 =====
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 📨 백그라운드 메시지 수신:', payload);
  
  // data 필드에서 정보 추출 (send-notifications.js에서 보낸 형식)
  const notificationTitle = payload.data?.title || '📰 해정뉴스';
  const notificationBody = payload.data?.body || payload.data?.text || '새로운 알림';
  const articleId = payload.data?.articleId || '';
  const notificationId = payload.data?.notificationId || '';
  
  // GitHub Pages 베이스 경로 감지
  const getBasePath = () => {
    const scope = self.registration.scope;
    const url = new URL(scope);
    const pathname = url.pathname;
    
    // /hsj_news.io/ 같은 패턴 감지
    const match = pathname.match(/^\/([^\/]+)\/?$/);
    if (match && match[1] && match[1] !== '') {
      return `/${match[1]}`;
    }
    return '';
  };
  
  const basePath = getBasePath();
  console.log('[SW] 🌐 베이스 경로:', basePath || '(루트)');
  
  // 알림 옵션
  const notificationOptions = {
    body: notificationBody,
    icon: `${basePath}/favicon/android-icon-192x192.png`,
    badge: `${basePath}/favicon/favicon-16x16.png`,
    tag: notificationId || `notif-${Date.now()}`, // 같은 tag는 덮어씀
    renotify: false, // 같은 tag여도 다시 알림 안 울림
    requireInteraction: false, // 자동으로 사라짐
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    data: {
      articleId: articleId,
      url: articleId ? `${basePath}/?page=article&id=${articleId}` : `${basePath}/`,
      notificationId: notificationId
    },
    actions: [
      {
        action: 'open',
        title: '📰 보기',
        icon: `${basePath}/favicon/favicon-32x32.png`
      },
      {
        action: 'close',
        title: '닫기'
      }
    ]
  };
  
  console.log('[SW] 🔔 알림 표시:', notificationTitle);
  
  // 알림 표시
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ===== 알림 클릭 이벤트 =====
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 👆 알림 클릭:', event.action);
  
  event.notification.close(); // 알림 닫기
  
  // "닫기" 버튼 클릭 시 아무것도 안 함
  if (event.action === 'close') {
    console.log('[SW] ❌ 닫기 버튼 클릭');
    return;
  }
  
  // 기사로 이동할 URL
  const urlToOpen = event.notification.data?.url || '/';
  
  console.log('[SW] 🔗 이동할 URL:', urlToOpen);
  
  // 페이지 열기/포커스
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      // 이미 열린 창이 있으면 해당 탭에서 이동
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        const targetUrl = new URL(urlToOpen, self.location.origin);
        
        if (clientUrl.origin === targetUrl.origin) {
          console.log('[SW] ✅ 기존 창에서 이동:', urlToOpen);
          return client.focus().then(() => {
            // ✅ 실제 페이지 이동 (postMessage만으로는 이동 안 됨)
            return client.navigate(urlToOpen);
          });
        }
      }
      
      // 열린 창이 없으면 새 창 열기
      if (clients.openWindow) {
        console.log('[SW] 🆕 새 창 열기:', urlToOpen);
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ===== Service Worker 설치 =====
self.addEventListener('install', (event) => {
  console.log('[SW] 📥 설치 시작');
  self.skipWaiting(); // 즉시 활성화
});

// ===== Service Worker 활성화 =====
self.addEventListener('activate', (event) => {
  console.log('[SW] ⚡ 활성화');
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('[SW] ✅ 모든 클라이언트 제어 시작');
    })
  );
});

// ===== 페이지에서 보낸 메시지 처리 (옵션) =====
self.addEventListener('message', (event) => {
  console.log('[SW] 💬 메시지 수신:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] 🎉 Service Worker 완전히 로드됨');
