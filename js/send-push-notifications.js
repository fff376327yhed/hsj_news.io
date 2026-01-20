const admin = require('firebase-admin');

// ===== Firebase Admin 초기화 =====
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://hsj-news-default-rtdb.firebaseio.com'
});

const db = admin.database();

console.log('🚀 푸시 알림 전송 시작...');

// ===== 메인 함수 =====
async function sendPushNotifications() {
  try {
    // 1. 모든 사용자 조회
    const usersSnapshot = await db.ref('users').once('value');
    const usersData = usersSnapshot.val() || {};
    
    console.log(`👥 총 사용자 수: ${Object.keys(usersData).length}명`);
    
    let totalSent = 0;
    let totalFailed = 0;
    
    // 2. 각 사용자별로 처리
    for (const [uid, userData] of Object.entries(usersData)) {
      if (!userData.fcmTokens) {
        continue; // FCM 토큰이 없으면 스킵
      }
      
      // 3. 읽지 않은 알림 중 푸시되지 않은 것 조회
      const notificationsSnapshot = await db.ref(`notifications/${uid}`)
        .orderByChild('pushed')
        .equalTo(false)
        .once('value');
      
      const notifications = notificationsSnapshot.val() || {};
      const unpushedNotifications = Object.entries(notifications);
      
      if (unpushedNotifications.length === 0) {
        continue; // 보낼 알림 없음
      }
      
      console.log(`📤 ${userData.email || uid}: ${unpushedNotifications.length}개 알림 전송 중...`);
      
      // 4. 각 FCM 토큰으로 전송
      const tokens = Object.values(userData.fcmTokens).map(t => t.token);
      
      for (const [notifId, notification] of unpushedNotifications) {
        const message = {
          data: {
            title: notification.title || '📰 해정뉴스',
            body: notification.text || '새로운 알림',
            text: notification.text || '',
            articleId: notification.articleId || '',
            type: notification.type || 'notification',
            notificationId: notifId
          },
          tokens: tokens
        };
        
        try {
          // FCM 메시지 전송
          const response = await admin.messaging().sendMulticast(message);
          
          console.log(`  ✅ 성공: ${response.successCount}개, 실패: ${response.failureCount}개`);
          
          totalSent += response.successCount;
          totalFailed += response.failureCount;
          
          // 5. 전송 완료 표시
          await db.ref(`notifications/${uid}/${notifId}`).update({
            pushed: true,
            pushedAt: Date.now()
          });
          
          // 실패한 토큰 정리
          if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                const errorCode = resp.error?.code;
                
                // 유효하지 않은 토큰 삭제
                if (errorCode === 'messaging/invalid-registration-token' ||
                    errorCode === 'messaging/registration-token-not-registered') {
                  const tokenToRemove = tokens[idx];
                  const tokenKey = Object.keys(userData.fcmTokens).find(
                    key => userData.fcmTokens[key].token === tokenToRemove
                  );
                  
                  if (tokenKey) {
                    console.log(`  🗑️ 유효하지 않은 토큰 삭제: ${tokenKey}`);
                    db.ref(`users/${uid}/fcmTokens/${tokenKey}`).remove();
                  }
                }
              }
            });
          }
          
        } catch (error) {
          console.error(`  ❌ 전송 실패 (${notifId}):`, error.message);
          totalFailed++;
        }
      }
    }
    
    console.log('\n📊 전송 결과:');
    console.log(`  ✅ 성공: ${totalSent}개`);
    console.log(`  ❌ 실패: ${totalFailed}개`);
    console.log('✅ 푸시 알림 전송 완료!');
    
  } catch (error) {
    console.error('❌ 푸시 알림 전송 중 오류:', error);
    process.exit(1);
  }
}

// 실행
sendPushNotifications().then(() => {
  process.exit(0);
});
