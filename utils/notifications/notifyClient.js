import { PrismaClient } from '@prisma/client';
import { Expo } from 'expo-server-sdk'; 
import generateClientMessage from './messageGenerators.js';

const prisma = new PrismaClient();

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN
});

const notifyClient = async (commande, status, livreurInfo = null, extraData = {}) => {
  try {
    console.log(`📱 Notification client pour commande ${commande.id}, statut: ${status}`);
    
    // Récupérer les informations du client
    const client = await prisma.user.findUnique({
      where: { id: commande.userId },
      select: { id: true, username: true, pushToken: true }
    });
    // const client = await prisma.user.findFirst({
    //   where: { pushToken: { not: null } },
    //   select: { id: true, username: true, pushToken: true }
    // });


    // Vérifications du client et du token
    if (!client) {
      console.warn(`❌ Client avec ID ${commande.userId} non trouvé`);
      return { 
        success: false, 
        message: 'Client non trouvé',
        clientId: commande.userId 
      };
    }

    if (!client.pushToken) {
      console.warn(`❌ Client ${client.id} (${client.username}) sans token push`);
      return { 
        success: false, 
        message: 'Token push manquant',
        clientId: client.id,
        clientName: client.username 
      };
    }

    if (!Expo.isExpoPushToken(client.pushToken)) {
      console.warn(`❌ Token invalide pour ${client.username}:`, client.pushToken);
      return { 
        success: false, 
        message: 'Token push invalide',
        clientId: client.id,
        clientName: client.username 
      };
    }

    // Générer le message selon le statut
    const messageData = generateClientMessage(status, commande, livreurInfo, extraData);
    
    if (!messageData) {
      console.warn(`⚠️ Statut '${status}' non géré par le générateur de messages`);
      return { 
        success: false, 
        message: `Statut '${status}' non géré`,
        status 
      };
    }

    console.log(`📄 Message généré pour ${client.username}:`, {
      title: messageData.title,
      body: messageData.body,
      type: messageData.type
    });

    // Préparer les données de notification
    const notificationData = {
      type: messageData.type,
      commandeId: commande.id.toString(),
      status: status,
      timestamp: new Date().toISOString(),
      ...extraData
    };

    // Ajouter info livreur si disponible
    if (livreurInfo) {
      notificationData.livreur = {
        id: livreurInfo.id.toString(),
        username: livreurInfo.username || 'Livreur',
        telephone: livreurInfo.telephone || null
      };
    }

    // Construire le message de notification
    const message = {
      to: client.pushToken,
      sound: 'default',
      title: messageData.title,
      body: messageData.body,
      data: notificationData,
      priority: 'high',
      channelId: 'delivery-updates'
    };

    console.log(`📤 Envoi notification à ${client.username} (${client.pushToken.substring(0, 20)}...)`);

    // Envoyer la notification avec gestion robuste
    let ticket;
    let notificationSuccess = false;

    try {
      // Utiliser chunkPushNotifications pour la cohérence (même si un seul message)
      const chunks = expo.chunkPushNotifications([message]);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const receipts = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...receipts);
          console.log('✅ Notification envoyée, reçu:', receipts);
        } catch (chunkError) {
          console.error('❌ Erreur envoi chunk:', chunkError);
          throw chunkError;
        }
      }

      ticket = tickets[0]; // Premier (et seul) ticket
      notificationSuccess = ticket && ticket.status === 'ok';

      if (notificationSuccess) {
        console.log(`✅ Notification client envoyée avec succès à ${client.username}`);
      } else {
        console.warn(`⚠️ Notification envoyée mais statut: ${ticket?.status}`, ticket);
      }

    } catch (sendError) {
      console.error(`❌ Erreur lors de l'envoi de notification:`, sendError.message);
      notificationSuccess = false;
      ticket = { status: 'error', message: sendError.message };
    }

    // Sauvegarder l'historique de notification
    // try {
    //   await prisma.notificationHistory.create({
    //     data: {
    //       Id: client.id,
    //       livreurId: livreurInfo?.id || null,
    //       commandeId: commande.id,
    //       titre: messageData.title,
    //       message: messageData.body,
    //       type: messageData.type.toUpperCase(),
    //       send: notificationSuccess
    //     }
    //   });
      
    //   console.log('✅ Historique notification sauvegardé');
      
    // } catch (historyError) {
    //   console.warn('⚠️ Erreur sauvegarde historique notification:', historyError.message);
    //   // Ne pas faire échouer la fonction pour une erreur d'historique
    // }

    // Retourner le résultat
    return {
      success: notificationSuccess,
      message: notificationSuccess 
        ? 'Notification envoyée avec succès' 
        : 'Notification envoyée mais avec des erreurs',
      clientId: client.id,
      clientName: client.username,
      ticket: ticket,
      notificationData
    };

  } catch (error) {
    console.error('❌ Erreur générale dans notifyClient:', error.message);
    console.error('Stack trace:', error.stack);
    
    return {
      success: false,
      message: 'Erreur lors de l\'envoi de notification',
      error: error.message,
      commandeId: commande?.id
    };
  }
};

// ✅ Fonction utilitaire pour notifier plusieurs clients (bonus)
const notifyMultipleClients = async (commandes, status, livreurInfo = null, extraData = {}) => {
  try {
    console.log(`📢 Notification de ${commandes.length} clients pour statut: ${status}`);
    
    const results = [];
    const successCount = { success: 0, failed: 0 };

    // Traiter chaque commande individuellement
    for (const commande of commandes) {
      try {
        const result = await notifyClient(commande, status, livreurInfo, extraData);
        results.push({
          commandeId: commande.id,
          clientId: commande.userId,
          ...result
        });

        if (result.success) {
          successCount.success++;
        } else {
          successCount.failed++;
        }

        // Petit délai pour éviter de surcharger le serveur Expo
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Erreur notification commande ${commande.id}:`, error);
        results.push({
          commandeId: commande.id,
          clientId: commande.userId,
          success: false,
          message: error.message
        });
        successCount.failed++;
      }
    }

    console.log(`📊 Résultat notifications multiples: ${successCount.success} succès, ${successCount.failed} échecs`);

    return {
      success: successCount.success > 0,
      message: `${successCount.success}/${commandes.length} notifications envoyées`,
      summary: successCount,
      details: results
    };

  } catch (error) {
    console.error('❌ Erreur notification multiple clients:', error);
    return {
      success: false,
      message: 'Erreur lors des notifications multiples',
      error: error.message
    };
  }
};

// ✅ Fonction de test pour vérifier qu'une notification fonctionne
const testNotifyClient = async (userId, testMessage = 'Test de notification') => {
  try {
    const client = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, pushToken: true }
    });

    if (!client?.pushToken || !Expo.isExpoPushToken(client.pushToken)) {
      return { success: false, message: 'Client ou token invalide' };
    }

    const message = {
      to: client.pushToken,
      sound: 'default',
      title: '🧪 Test de notification',
      body: testMessage,
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      },
      priority: 'normal'
    };

    const [ticket] = await expo.sendPushNotificationsAsync([message]);
    
    console.log(`🧪 Test notification pour ${client.username}:`, ticket);

    return {
      success: ticket.status === 'ok',
      message: `Test ${ticket.status === 'ok' ? 'réussi' : 'échoué'}`,
      clientName: client.username,
      ticket
    };

  } catch (error) {
    console.error('❌ Erreur test notification:', error);
    return {
      success: false,
      message: 'Erreur lors du test',
      error: error.message
    };
  }
};

export default notifyClient;
export { notifyMultipleClients, testNotifyClient };