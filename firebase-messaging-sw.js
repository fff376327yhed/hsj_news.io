// ===== Firebase Cloud Messaging Service Worker =====

const DEBUG = false; // 프로덕션: false / 개발: true
const _log = (...a) => DEBUG && console.log('[SW]', ...a);

importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

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

// ✅ 사이트 고정 베이스 URL
const BASE_URL = 'https://fff376327yhed.github.io/hsj_news.io';

// ===== 백그라운드 메시지 수신 =====
messaging.onBackgroundMessage((payload) => {
  _log('📨 백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.data?.title || '📰 해정뉴스';
  const notificationBody  = payload.data?.body  || payload.data?.text || '새로운 알림';
  const articleId         = payload.data?.articleId     || '';
  const notificationId    = payload.data?.notificationId || '';

  const targetUrl = articleId
    ? `${BASE_URL}/?page=article&id=${articleId}`
    : `${BASE_URL}/?page=home`;

  const notificationOptions = {
    body: notificationBody,
    icon:  `${BASE_URL}/favicon/android-icon-192x192.png`,
    badge: `${BASE_URL}/favicon/badge-96x96.png`,
    // ✅ 최적화: notificationId 없을 때 'hsj-news-default' 고정 tag 사용
    //    → 같은 종류 알림끼리 그룹화되어 알림 범람 방지
    tag:      notificationId || 'hsj-news-default',
    renotify: !!notificationId, // ✅ notificationId 있을 때만 재알림 (진동/소리)
    requireInteraction: false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    data: {
      targetUrl,
      articleId,
      notificationId
    },
    actions: [
      { action: 'open',  title: '📰 보기' },
      { action: 'close', title: '닫기' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ===== 알림 클릭 이벤트 =====
self.addEventListener('notificationclick', (event) => {
  _log('👆 알림 클릭:', event.action);

  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.targetUrl || `${BASE_URL}/?page=home`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const existingClient = clientList.find(c => c.url.startsWith(BASE_URL));

        if (existingClient) {
          // ✅ 최적화: focus 후 openWindow(다른 URL) → 탭 2개 열리는 버그 수정
          //    postMessage로 기존 탭에 네비게이션 신호를 보내 탭 1개만 사용
          return existingClient.focus().then(() => {
            existingClient.postMessage({ type: 'SW_NAVIGATE', url: targetUrl });
          });
        }

        // 기존 탭 없으면 새 탭 열기
        return clients.openWindow(targetUrl);
      })
      .catch(() => clients.openWindow(targetUrl))
  );
});

// ===== Service Worker 설치 =====
self.addEventListener('install', (event) => {
  _log('📥 설치');
  self.skipWaiting();
});

// ===== Service Worker 활성화 =====
self.addEventListener('activate', (event) => {
  _log('⚡ 활성화');
  event.waitUntil(
    self.clients.claim().then(() => { _log('✅ 클라이언트 제어 시작'); })
  );
});

// ===== 메인 페이지로부터 메시지 수신 =====
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});