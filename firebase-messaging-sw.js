// Service Worker for Firebase Cloud Messaging (FCM)
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

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

// 백그라운드 메시지 수신 (탭이 닫혀있거나 백그라운드일 때)
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] 백그라운드 메시지 수신:', payload);
  
  const notificationTitle = payload.notification?.title || '📰 해정뉴스';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.content || '',
    icon: '/icon-192x192.png', // 알림 아이콘 (없으면 제거 가능)
    badge: '/badge-72x72.png', // 뱃지 아이콘 (없으면 제거 가능)
    tag: payload.data?.type || 'notification',
    data: payload.data,
    requireInteraction: false, // 사용자가 클릭할 때까지 유지
    vibrate: [200, 100, 200] // 진동 패턴
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] 알림 클릭:', event.notification);
  
  event.notification.close();
  
  // 사이트 열기
  event.waitUntil(
    clients.openWindow('/') // 또는 특정 기사 페이지로 이동
  );
});
