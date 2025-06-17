import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import { Expo } from 'expo-server-sdk';

const prisma = new PrismaClient();
const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN
});

//  const chunks = expo.chunkPushNotifications(messages);
//  for (const chunk of chunks) {
//     try {
//       const receipts = await expo.sendPushNotificationsAsync(chunk);
//       console.log('✅ Notifications envoyées:', receipts);
//     } catch (error) {
//       console.error('❌ Erreur envoi chunk:', error);
//     }
//   }

const notifyAllLivreurs = async (commande) => {
  try {
    console.log('📢 Notification des livreurs pour commande:', commande.id);
    
    // Récupérer tous les livreurs disponibles avec pushToken
    const livreursDisponibles = await prisma.livreur.findMany({
      where: {
        disponible: true,
        pushToken: {
          not: null
        }
      },
      select: {
        id: true,
        username: true,
        pushToken: true,
        positionActuelle: true
      }
    });

    console.log(`📱 ${livreursDisponibles.length} livreurs disponibles trouvés`);

    if (livreursDisponibles.length === 0) {
      return {
        success: false,
        message: 'Aucun livreur disponible',
        sentTo: []
      };
    }

    // Préparer les messages de notification
    const messages = [];
    const notificationData = {
      type: 'nouvelle_commande',
      commandeId: commande.id,
      prix: commande.prix,
      position: commande.position,
      restaurant: commande.plat?.restaurant?.name || 'Restaurant',
      timestamp: new Date().toISOString()
    };

    livreursDisponibles.forEach(livreur => {
      // Vérifier que le pushToken est valide
      if (Expo.isExpoPushToken(livreur.pushToken)) {
        messages.push({
          to: livreur.pushToken,
          sound: 'default',
          title: '🍽️ Nouvelle commande disponible !',
          body: `Commande de ${commande.prix}€ - ${commande.plat?.restaurant?.name || 'Restaurant'}`,
          data: notificationData,
          priority: 'high',
          channelId: 'commandes'
        });
      } else {
        console.warn(`⚠️ Token invalide pour ${livreur.username}:`, livreur.pushToken);
      }
    });

    console.log(`📤 Envoi de ${messages.length} notifications...`);

    // Envoyer les notifications par chunks
    const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      console.log('✅ Notifications envoyées:', receipts);
    } catch (error) {
      console.error('❌ Erreur envoi chunk:', error);
    }
  }
    
    
    let tickets = [];

for (let chunk of expo.chunkPushNotifications(messages)) {
  try {
    let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    tickets.push(...ticketChunk);
  } catch (error) {
    console.error('Erreur envoi chunk:', error);
  }
}


    // Sauvegarder l'historique des notifications
    const notificationHistory = livreursDisponibles.map(livreur => ({
      livreurId: livreur.id,
      commandeId: commande.id,
      titre: "Nouvelle commande ",
      message: `Nouvelle commande de ${commande.prix}€`,
      type: 'NOUVELLE_COMMANDE',
      sent: true
    }));

    try {
      await prisma.notificationHistory.createMany({
        data: notificationHistory,
        skipDuplicates: true
      });
      console.log('✅ Historique notifications sauvegardé');
    } catch (historyError) {
      console.warn('⚠️ Erreur sauvegarde historique:', historyError);
    }

    return {
      success: true,
      message: `Notifications envoyées à ${livreursDisponibles.length} livreurs`,
      sentTo: livreursDisponibles.map(l => ({ id: l.id, username: l.username })),
      tickets: tickets.length
    };

  } catch (error) {
    console.error('❌ Erreur notification livreurs:', error);
    return {
      success: false,
      message: 'Erreur lors de l\'envoi des notifications',
      error: error.message
    };
  }
}

export default {
  
async createCommande(req, res) {
  console.log("Corps de la requête reçue:", req.body);

  const commandeData = req.body.commandeData;
  const userId = req.user.id;

  if (!commandeData || Object.keys(commandeData).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Aucune donnée de commande n'a été envoyée",
      userMessage: "Les données de la commande sont manquantes."
    });
  }
  // Vérification que l'utilisateur est bien authentifié
  if (!userId) {
    return res.status(404).json({
      success: false,
      message: "Utilisateur non trouvé",
      userMessage: "L'utilisateur est introuvable ou non authentifié."
    });
  }

  const { platsId, quantity, prix, recommandation, position, telephone, complements } = commandeData;

  if (!platsId) {
    return res.status(400).json({
      success: false,
      message: "Le champ platsId est manquant",
      userMessage: "Veuillez fournir l'identifiant du plat."
    });
  }

  if (!quantity) {
    return res.status(400).json({
      success: false,
      message: "Le champ quantity est manquant",
      userMessage: "Veuillez spécifier la quantité."
    });
  }

  if (!prix) {
    return res.status(400).json({
      success: false,
      message: "Le champ prix est manquant",
      userMessage: "Veuillez indiquer le prix."
    });
  }

  if (!telephone) {
    return res.status(400).json({
      success: false,
      message: "Le champ telephone est manquant",
      userMessage: "Veuillez fournir un numéro de téléphone."
    });
  }

  try {
    // Créer la commande principale
    const newCommande = await prisma.commande.create({
      data: {
        quantity: parseInt(quantity),
        prix: parseFloat(prix),
        recommandation: recommandation || '',
        position: position || '',
        status: "EN_ATTENTE",
        telephone: telephone ? parseInt(telephone) : null,
        user: { connect: { id: parseInt(userId) } },
        plat: { connect: { id: parseInt(platsId) } },
      },
     include: {
        user: {
          select: { username: true, phone: true }
        },
        plat: {
              include: {
                categorie: {
                  include: {
                    menu: {
                      include: {
                        restaurant: {
                          select: { name: true, adresse: true }
                        }
                      }
                    }
                  }
                }
              }
            }
      }
    });

 
    if (complements && complements.length > 0) {
      const complementsData = complements.map(complement => ({
        quantity: complement.quantity,
        complementId: complement.complementId,
        name: complement.name,
        price: complement.price,
        commandeId: newCommande.id
      }));
    
      await prisma.commandeComplement.createMany({
        data: complementsData
      });
    }
    
     const notificationResult = await notifyAllLivreurs(newCommande);

    res.status(201).json({
      success: true,
      message: "Votre commande a été passée avec succès !",
      userMessage: "Votre commande a été passée avec succès !",
      commande: newCommande,
      notificationResult
    });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la commande",
      userMessage: "Désolé, une erreur est survenue lors de la passation de votre commande. Veuillez réessayer.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},

// async notifyAllLivreurs (commandeData) {
//   try {
//     // 1. Récupérer tous les livreurs en ligne avec token push
//     const livreursOnline = await prisma.livreur.findMany({
//       where: {
//         disponible: true, // En ligne
//         pushToken: { not: null } // Ont un token push
//       }
//     });

//     console.log(`📢 Notification de commande à ${livreursOnline.length} livreurs`);
//     console.log(`📢 Notification de commande ${commandeData.id} à ${livreursOnline.length} livreurs`);
    
//     // 2. Préparer les données de notification
//     const notificationData = {
//       commandeId: commandeData.id,
//       restaurant: commandeData.plat.restaurant.name,
//       clientNom: commandeData.user.name,
//       clientTelephone: commandeData.telephone,
//       adresseLivraison: commandeData.position,
//       prix: commandeData.prix,
//       platNom: commandeData.plat.name,
//       quantity: commandeData.quantity,
//       recommandations: commandeData.recommandation || '',
//       restaurantLat: commandeData.plat.restaurant.latitude,
//       restaurantLng: commandeData.plat.restaurant.longitude,
//       timestamp: new Date().toISOString()
//     };

//     // 3. Envoyer notification à tous les livreurs
//     const notificationPromises = livreursOnline.map(livreur => 
//       sendPushNotificationToLivreur(livreur.pushToken, notificationData, livreur.id)
//     );

//     await Promise.all(notificationPromises);
    
//     return { success: true, livreurCount: livreursOnline.length };
    
//   } catch (error) {
//     console.error('❌ Erreur notification livreurs:', error);
//     throw error;
//   }
// },

// 🔔 Envoyer notification push individuelle



async sendPushNotificationToLivreur (pushToken, commandeData, livreurId) {
  try {
    const message = {
      token: pushToken,
      notification: {
        title: "🚚 Nouvelle Commande Disponible !",
        body: `${commandeData.restaurant} - ${commandeData.prix} FCFA - ${commandeData.clientNom}`
      },
      data: {
        type: 'NEW_COMMANDE',
        commandeId: commandeData.commandeId.toString(),
        restaurant: commandeData.restaurant,
        clientNom: commandeData.clientNom,
        clientTelephone: commandeData.clientTelephone,
        adresse: commandeData.adresseLivraison,
        prix: commandeData.prix.toString(),
        platNom: commandeData.platNom,
        quantity: commandeData.quantity.toString(),
        recommandations: commandeData.recommandations,
        restaurantLat: commandeData.restaurantLat.toString(),
        restaurantLng: commandeData.restaurantLng.toString(),
        timestamp: commandeData.timestamp
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'new-orders',
          sound: 'default',
          priority: 'max'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            'content-available': 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ Notification envoyée au livreur ${livreurId}:`, response);
    
  } catch (error) {
    console.error(`❌ Erreur envoi notification livreur ${livreurId}:`, error);
  }
},


  // Obtenir toutes les commandes
  async getAllCommandes(req, res) {
    try {
      const commandes = await prisma.commande.findMany({
        include: {
          //user: true,
          //plats: true,
          // payement: true,
          // livraison: true,
        }
      });

      res.status(200).json(commandes);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir une commande par son ID
  async getCommandeById(req, res) {
    try {
      const { id } = req.params;
      const commande = await prisma.commande.findUnique({
        where: { id: parseInt(id) },
        // include: {
        //   user: true,
        //   plats: true,
        //   payement: true,
        //   livraison: true,
        // }
      });

      if (!commande) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }

      res.status(200).json(commande);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer une commande
  async deleteCommande(req, res) {
    try {
      const { id } = req.params;

      await prisma.commande.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Commande supprimée avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les commandes d'un utilisateur spécifique
  async getUserCommandes(req, res) {
    try {
      const { userId } = req.params;
      const commandes = await prisma.commande.findMany({
        where: { userId: parseInt(userId) },
        include: {
          plats: true,
          payement: true,
          livraison: true,
        }
      });

      res.status(200).json(commandes);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour le statut d'une commande
  async updateCommandeStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedCommande = await prisma.commande.update({
        where: { id: parseInt(id) },
        data: { status },
      });

      res.status(200).json({
        message: "Statut de la commande mis à jour avec succès",
        commande: updatedCommande
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Ajouter un paiement à une commande
  async addPaymentToCommande(req, res) {
    try {
      const { id } = req.params;
      const { amount, mode_payement, currency, status, reference, phone, email } = req.body;

      const updatedCommande = await prisma.commande.update({
        where: { id: parseInt(id) },
        data: {
          payement: {
            create: {
              amount: parseFloat(amount),
              mode_payement,
              currency,
              status,
              reference,
              phone,
              email,
            }
          }
        },
        include: {
          payement: true,
        }
      });

      res.status(200).json({
        message: "Paiement ajouté à la commande avec succès",
        commande: updatedCommande
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les commandes par statut
  async getCommandesByStatus(req, res) {
    try {
      const { status } = req.params;
      const commandes = await prisma.commande.findMany({
        where: { status },
        include: {
          user: true,
          plats: true,
          payement: true,
          livraison: true,
        }
      });

      res.status(200).json(commandes);
    } catch (error) {
      handleServerError(res, error);
    }
  },
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}
