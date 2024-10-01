import { getUserTokenFromDatabase } from '../services/userService.js';

export default {
  async sendNotification(req, res){
    const { userId, title, body } = req.body;
    
    try {
      const userToken = await getUserTokenFromDatabase(userId);
      
      if (!Expo.isExpoPushToken(userToken)) {
        console.error(`Le token Push ${userToken} n'est pas un token Expo Push valide`);
        return res.status(400).send('Token invalide');
      }
      
      const message = {
        to: userToken,
        sound: 'default',
        title: title,
        body: body,
        data: { someData: 'goes here' },
      }
      
      const ticket = await global.expo.sendPushNotificationsAsync([message]);
      console.log('Notification envoyée:', ticket);
      res.status(200).send('Notification envoyée avec succès');
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error);
      res.status(500).send("Erreur lors de l'envoi de la notification");
    }
  },
}
