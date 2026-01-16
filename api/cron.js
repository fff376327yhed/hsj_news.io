const admin = require('firebase-admin');

// Firebase Admin 초기화 (한 번만)
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    
    console.log('✅ Firebase Admin 초기화 완료');
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error.message);
  }
}

const db = admin.database();

// 알림 전송 함수
async function sendNotifications() {
  try {
    console.log('📊 데이터베이스 읽기 중...');
    
    const notificationsSnapshot = await db.ref('notifications').once('value');
    const usersSnapshot = await db.ref('users').once('value');
    
    const notificationsData = notificationsSnapshot.val() || {};
    const usersData = usersSnapshot.val() || {};
    
    let totalSent = 0;
    let totalFailed = 0;
    let processedUsers = 0;
    let skippedUsers = 0;
    
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    console.log(`👥 총 ${Object.keys(notificationsData).length}명의 알림 확인 중...`);
    
    for (const [uid, userNotifications] of Object.entries(notificationsData)) {
      const user = usersData[uid];
      
      if (!user || !user.fcmTokens) {
        skippedUsers++;
        continue;
      }
      
      if (user.notificationsEnabled === false) {
        skippedUsers++;
        continue;
      }
      
      const unreadNotifications = Object.entries(userNotifications)
        .filter(([_, notif]) => {
          if (notif.read) return false;
          if (notif.pushed) return false;
          if (notif.timestamp < fiveMinutesAgo) return false;
          return true;
        })
        .map(([id, notif]) => ({ id, ...notif }));
      
      if (unreadNotifications.length === 0) {
        continue;
      }
      
      console.log(`\n📬 알림 전송: ${user.email || uid} (${unreadNotifications.length}개)`);
      processedUsers++;
      
      const tokens = Object.values(user.fcmTokens)
        .map(t => t.token)
        .filter(t => t);
      
      if (tokens.length === 0) {
        continue;
      }
      
      for (const notification of unreadNotifications) {
        const recheck = await db.ref(`notifications/${uid}/${notification.id}/pushed`).once('value');
        if (recheck.val() === true) {
          continue;
        }
        
        await db.ref(`notifications/${uid}/${notification.id}`).update({
          pushed: true,
          pushedAt: Date.now(),
          pushAttemptedAt: Date.now()
        });
        
        const message = {
          data: {
            title: notification.title || '📰 해정뉴스',
            body: notification.text || '새로운 알림이 있습니다',
            text: notification.text || '새로운 알림이 있습니다',
            articleId: notification.articleId || '',
            type: notification.type || 'notification',
            notificationId: notification.id,
            timestamp: Date.now().toString()
          },
          tokens: tokens,
          android: {
            priority: 'high',
            notification: {
              title: notification.title || '📰 해정뉴스',
              body: notification.text || '새로운 알림이 있습니다',
              icon: 'ic_notification',
              color: '#c62828',
              sound: 'default',
              channelId: 'default',
              tag: notification.id,
              clickAction: 'FLUTTER_NOTIFICATION_CLICK'
            }
          },
          apns: {
            payload: {
              aps: {
                alert: {
                  title: notification.title || '📰 해정뉴스',
                  body: notification.text || '새로운 알림이 있습니다'
                },
                sound: 'default',
                badge: 1,
                'thread-id': notification.id,
                'mutable-content': 1
              }
            }
          },
          webpush: {
            notification: {
              title: notification.title || '📰 해정뉴스',
              body: notification.text || '새로운 알림이 있습니다',
              icon: 'https://fff376327yhed.github.io/hsj_news.io/favicon/android-icon-192x192.png',
              badge: 'https://fff376327yhed.github.io/hsj_news.io/favicon/favicon-16x16.png',
              vibrate: [200, 100, 200],
              requireInteraction: false,
              tag: notification.id,
              renotify: false
            },
            fcmOptions: {
              link: notification.articleId ? 
                `https://fff376327yhed.github.io/hsj_news.io/?page=article&id=${notification.articleId}` : 
                'https://fff376327yhed.github.io/hsj_news.io/'
            }
          }
        };
        
        try {
          console.log(`   📤 전송: "${notification.title}"`);
          const response = await admin.messaging().sendEachForMulticast(message);
          
          console.log(`   ✅ 성공: ${response.successCount}, ❌ 실패: ${response.failureCount}`);
          
          totalSent += response.successCount;
          totalFailed += response.failureCount;
          
          await db.ref(`notifications/${uid}/${notification.id}`).update({
            pushSuccessCount: response.successCount,
            pushFailureCount: response.failureCount,
            lastPushAt: Date.now()
          });
          
          if (response.failureCount > 0) {
            const tokensToRemove = [];
            
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                const errorCode = resp.error?.code;
                if (errorCode === 'messaging/invalid-registration-token' ||
                    errorCode === 'messaging/registration-token-not-registered') {
                  tokensToRemove.push(tokens[idx]);
                }
              }
            });
            
            if (tokensToRemove.length > 0) {
              for (const token of tokensToRemove) {
                const tokenKey = Buffer.from(token)
                  .toString('base64')
                  .substring(0, 20)
                  .replace(/[^a-zA-Z0-9]/g, '');
                
                await db.ref(`users/${uid}/fcmTokens/${tokenKey}`).remove();
              }
            }
          }
          
        } catch (error) {
          console.error(`  ❌ 전송 오류:`, error.message);
          totalFailed++;
          
          await db.ref(`notifications/${uid}/${notification.id}`).update({
            pushed: false,
            pushError: error.message,
            pushErrorAt: Date.now()
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 전송 완료:');
    console.log(`   👥 처리: ${processedUsers}명, 스킵: ${skippedUsers}명`);
    console.log(`   ✅ 성공: ${totalSent}건, ❌ 실패: ${totalFailed}건`);
    console.log('='.repeat(60));
    
    return { totalSent, totalFailed, processedUsers };
    
  } catch (error) {
    console.error('❌ 오류:', error);
    throw error;
  }
}

// Vercel Serverless Function
export default async function handler(req, res) {
  // Vercel Cron 인증 확인
  const authHeader = req.headers.authorization;
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('❌ 인증 실패');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  console.log('🔔 Vercel Cron 실행:', new Date().toISOString());
  console.log('⏰ 정확히 5분마다 실행됨');
  
  try {
    const result = await sendNotifications();
    
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      result: result
    });
    
  } catch (error) {
    console.error('❌ 실행 실패:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}