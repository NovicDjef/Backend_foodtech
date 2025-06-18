// sendNotification.js
import { Expo } from 'expo-server-sdk';

// ✅ Aucune auth nécessaire ici
const expo = new Expo();

async function sendPushNotification(toToken, message) {
  if (!Expo.isExpoPushToken(toToken)) {
    console.error(`❌ Token invalide : ${toToken}`);
    return;
  }

  const messages = [{
    to: toToken,
    sound: 'default',
    body: message,
    data: { withSome: 'data' },
  }];

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      console.log('✅ Notification envoyée:', receipts);
    } catch (error) {
      console.error('❌ Erreur envoi chunk:', error);
    }
  }
}

// 🔁 Appel de test
(async () => {
  const token = 'ExponentPushToken[PASTE_TON_TOKEN_ICI]';
  await sendPushNotification(token, '🚀 Test de notification push');
})();
