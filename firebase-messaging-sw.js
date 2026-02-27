// ===== Firebase Cloud Messaging Service Worker =====

console.log('[SW] 🔧 Service Worker 로딩 시작');

importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

console.log('[SW] 📦 Firebase SDK 로드 완료');

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

// ✅ 사이트 고정 베이스 URL
const BASE_URL = 'https://fff376327yhed.github.io/hsj_news.io';

// ===== 백그라운드 메시지 수신 =====
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 📨 백그라운드 메시지 수신:', payload);
  
  const notificationTitle = payload.data?.title || '📰 해정뉴스';
  const notificationBody = payload.data?.body || payload.data?.text || '새로운 알림';
  const articleId = payload.data?.articleId || '';
  const notificationId = payload.data?.notificationId || '';
  
  // ✅ articleId 유무에 따라 URL 결정
  const targetUrl = articleId
    ? `${BASE_URL}/?page=article&id=${articleId}`
    : `${BASE_URL}/?page=home`;
  
  console.log('[SW] 🔗 알림 클릭 시 이동 URL:', targetUrl);
  
  const notificationOptions = {
    body: notificationBody,
    icon: `${BASE_URL}/favicon/android-icon-192x192.png`,
    badge: `${BASE_URL}/favicon/favicon-16x16.png`,
    tag: notificationId || `notif-${Date.now()}`,
    renotify: false,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    data: {
      // ✅ targetUrl을 data에 저장해 notificationclick에서 사용
      targetUrl: targetUrl,
      articleId: articleId,
      notificationId: notificationId
    },
    actions: [
      {
        action: 'open',
        title: '📰 보기'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ]
  };
  
  console.log('[SW] 🔔 알림 표시:', notificationTitle);
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ===== 알림 클릭 이벤트 =====
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] 👆 알림 클릭:', event.action);
  
  event.notification.close();
  
  // "닫기" 버튼이면 아무것도 안 함
  if (event.action === 'close') {
    console.log('[SW] ❌ 닫기 버튼 클릭');
    return;
  }

  // ✅ data에 저장된 targetUrl 사용, 없으면 홈으로 fallback
  const targetUrl = event.notification.data?.targetUrl || `${BASE_URL}/?page=home`;
  
  console.log('[SW] 🔗 이동할 URL:', targetUrl);

  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      // 이미 열린 해정뉴스 탭이 있으면 포커스 후 이동
      for (const client of clientList) {
        if (client.url.startsWith(BASE_URL)) {
          console.log('[SW] ✅ 기존 탭에서 이동:', targetUrl);
          return client.focus().then(() => client.navigate(targetUrl));
        }
      }
      
      // 열린 탭이 없으면 새 탭으로 열기
      console.log('[SW] 🆕 새 탭 열기:', targetUrl);
      return clients.openWindow(targetUrl);
    })
  );
});

// ===== Service Worker 설치 =====
self.addEventListener('install', (event) => {
  console.log('[SW] 📥 설치');
  self.skipWaiting();
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

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] 🎉 Service Worker 완전히 로드됨');
