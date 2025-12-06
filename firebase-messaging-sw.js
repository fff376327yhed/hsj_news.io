// Service Worker for Firebase Cloud Messaging (FCM)
// 절대 경로로 import (GitHub Pages 호환)
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

console.log('[Service Worker] 로딩 시작');

// Firebase 설정 (index.html과 동일하게)
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

console.log('[Service Worker] Firebase Messaging 초기화 완료');

// 백그라운드 메시지 수신 (탭이 닫혀있거나 백그라운드일 때)
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] 백그라운드 메시지 수신:', payload);
  
  // 알림 제목과 본문 추출 (data 우선, 없으면 notification 사용)
  const notificationTitle = payload.data?.title || payload.notification?.title || '📰 해정뉴스';
  const notificationBody = payload.data?.body || payload.data?.text || payload.notification?.body || '새로운 알림이 있습니다';
  
  const notificationOptions = {
    body: notificationBody,
    icon: '/favicon/android-icon-192x192.png', // 알림 아이콘
    badge: '/favicon/favicon-16x16.png', // 뱃지 아이콘
    tag: payload.data?.notificationId || 'notification-' + Date.now(),
    data: {
      articleId: payload.data?.articleId || '',
      type: payload.data?.type || 'notification',
      url: payload.data?.articleId ? `/?page=article&id=${payload.data.articleId}` : '/',
      timestamp: Date.now()
    },
    requireInteraction: false, // 자동으로 사라짐
    vibrate: [200, 100, 200], // 진동 패턴
    timestamp: Date.now(),
    silent: false, // 소리 켜기
    actions: [
      {
        action: 'open',
        title: '📰 기사 보기'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ]
  };

  console.log('[Service Worker] 알림 표시:', notificationTitle);
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] 알림 클릭:', event.action);
  
  event.notification.close();
  
  // 액션에 따라 처리
  if (event.action === 'close') {
    // 닫기 버튼 클릭 시 아무것도 안 함
    return;
  }
  
  // 기본 클릭 또는 "기사 보기" 클릭
  let urlToOpen = event.notification.data?.url || '/';
  const articleId = event.notification.data?.articleId;
  
  // GitHub Pages 서브디렉토리 대응
  const basePath = self.registration.scope.match(/\/([^\/]+)\/$/);
  if (basePath && basePath[1] && !urlToOpen.includes(basePath[1])) {
    urlToOpen = `/${basePath[1]}${urlToOpen}`;
  }
  
  console.log('[Service Worker] 열 URL:', urlToOpen);
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
    .then((clientList) => {
      // 이미 열린 창이 있으면 포커스하고 메시지 전송
      for (const client of clientList) {
        const clientUrl = new URL(client.url);
        const targetUrl = new URL(urlToOpen, self.location.origin);
        
        if (clientUrl.origin === targetUrl.origin) {
          return client.focus().then(() => {
            // 페이지에 메시지 전송하여 라우팅
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: urlToOpen,
              articleId: articleId
            });
          });
        }
      }
      
      // 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Service Worker 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 설치됨');
  self.skipWaiting(); // 즉시 활성화
});

// Service Worker 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 활성화됨');
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('[Service Worker] 모든 클라이언트 제어 시작');
    })
  );
});

// 주기적으로 연결 상태 확인 (옵션)
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-notifications') {
    console.log('[Service Worker] 백그라운드 동기화 실행');
    event.waitUntil(checkForNewNotifications());
  }
});

// 백그라운드 동기화 함수 (필요시)
async function checkForNewNotifications() {
  try {
    console.log('[Service Worker] 새 알림 확인 중...');
    // 여기서 서버에 새 알림이 있는지 확인 가능
  } catch (error) {
    console.error('[Service Worker] 알림 확인 오류:', error);
  }
}

console.log('[Service Worker] 완전히 로드됨');
