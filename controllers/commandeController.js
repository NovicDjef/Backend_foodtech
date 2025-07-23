import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import { Expo } from 'expo-server-sdk';
// import expo from '../utils/notifications/expo.js';
import notifyClient from '../utils/notifications/notifyClient.js';

const prisma = new PrismaClient();

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN
});



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
      commandeId: commande.id.toString(),
      prix: commande.prix.toString(),
      position: commande.position || '',
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
    const tickets = [];
  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...receipts);
      console.log('✅ Notifications envoyées:', receipts);
    } catch (error) {
      console.error('❌ Erreur envoi chunk:', error);
    }
  }
    


    // Sauvegarder l'historique des notifications
    const notificationHistory = livreursDisponibles.map(livreur => ({
      livreurId: livreur.id,
      commandeId: commande.id,
      titre: "Nouvelle commande ",
      message: `Nouvelle commande de ${commande.prix}€`,
      type: 'NOUVELLE_COMMANDE',
      send: true
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
                        restaurant: {
                          select: { name: true, adresse: true }
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

  async getCommandesDisponibles(req, res) {
  try {
    console.log('📋 Récupération commandes disponibles...');
    
    const commandes = await prisma.commande.findMany({
      where: {
        status: 'EN_ATTENTE'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            phone: true
          }
        },
         plat: {
              include: {
                categorie: {
                      include: {
                        restaurant: {
                          select: { name: true, adresse: true }
                        }
                      }
                    }
                  }
                }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ ${commandes.length} commandes disponibles trouvées`);

    res.status(200).json({
      success: true,
      message: 'Commandes récupérées avec succès',
      commandes
    });

  } catch (error) {
    console.error('❌ Erreur récupération commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
},

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
        user: true,
        plat: true,
        //payement: true,
        // livraison: true,
        // complements: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
      });

      res.status(200).json(commandes);
    } catch (error) {
      handleServerError(res, error);
    }
    
  },


// ✅ Fonction principale d'acceptation de commande
async accepterCommande (req, res) {
  try {
    const commandeId = parseInt(req.params.id); // ✅ Corrigé : req.params.id au lieu de commandeId
    const { livreurId } = req.body;
    
    console.log(`📦 Acceptation commande ${commandeId} par livreur ${livreurId}`);

    // ✅ Validation des paramètres
    // if (!commandeId || !livreurId) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     message: 'ID commande et ID livreur requis' 
    //   });
    // }

    // ✅ Vérifier si la commande existe et est disponible
    const commande = await prisma.commande.findFirst({
      where: { 
        id: 1,
        status: 'EN_ATTENTE'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            phone: true,
            //pushToken: true
          }
        },
        plat: {
              include: {
                categorie: {
                      include: {
                        restaurant: {
                          select: {
                            id: true,
                            name: true,
                            latitude: true,
                            longitude: true,
                            adresse: true
                          }
                        }
                      }
                    }
                  }
                }
      }
    });

    if (!commande) {
      return res.status(404).json({ 
        success: false, 
        message: 'Commande non trouvée ou déjà acceptée' 
      });
    }

    // ✅ Vérifier si le livreur existe et est disponible
    const livreur = await prisma.livreur.findFirst({
      where: { 
        id: parseInt(livreurId),
        disponible: true
      },
      select: {
        id: true,
        username: true,
        prenom: true,
        telephone: true,
        note: true,
        typeVehicule: true,
        positionActuelle: true,
        pushToken: true
      }
    });

    if (!livreur) {
      return res.status(404).json({ 
        success: false, 
        message: 'Livreur non trouvé ou indisponible' 
      });
    }

    // ✅ Transaction pour assurer la cohérence
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer la livraison
      const nouvelleLivraison = await tx.livraison.create({
        data: {
          commandeId: commandeId,
          livreurId: parseInt(livreurId),
          status: 'ACCEPTEE',
          dateAcceptation: new Date(),
          dateLivraison: new Date() // Date estimée
        },
        include: {
          commande: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  phone: true
                }
              },
              plat: {
                include: {
                  restaurant: {
                    select: {
                      id: true,
                      name: true,
                      latitude: true,
                      longitude: true,
                      adresse: true
                    }
                  }
                }
              }
            }
          },
          livreur: {
            select: {
              id: true,
              username: true,
              prenom: true,
              telephone: true,
              note: true,
              typeVehicule: true,
              positionActuelle: true
            }
          }
        }
      });

      // 2. Mettre à jour le statut de la commande
      await tx.commande.update({
        where: { id: commandeId },
        data: {
          status: 'ACCEPTEE',
          livreurId: parseInt(livreurId),
          acceptedAt: new Date()
        }
      });

      // 3. Créer une notification dans l'historique
      await tx.notificationHistory.create({
        data: {
          livreurId: parseInt(livreurId),
          commandeId: commandeId,
          message: `Commande #${commandeId} acceptée par ${livreur.prenom}`,
          type: 'COMMANDE_ACCEPTEE',
          send: true
        }
      });

      return nouvelleLivraison;
    });

    console.log('✅ Livraison créée avec succès:', result.id);

    // ✅ Notifier le client immédiatement
    

    const notificationResult = await notifyClient(commande, 'VALIDER', livreur);
    console.log('📱 Résultat notification client:', notificationResult.success);

    // ✅ Émettre l'événement temps réel si WebSocket disponible
    if (global.io) {
      global.io.emit(`commande_${commandeId}_status`, {
        status: 'ACCEPTEE',
        livreur: {
          id: livreur.id,
          usernane: `${livreur.prenom} ${livreur.username}`,
          telephone: livreur.telephone,
          note: livreur.note,
          typeVehicule: livreur.typeVehicule,
          position: livreur.positionActuelle
        },
        timestamp: new Date().toISOString()
      });
    }

    // ✅ Retourner la réponse complète
    res.status(200).json({
      success: true,
      message: 'Commande acceptée avec succès',
      commande: result,
      livreur: {
        id: livreur.id,
        unername: `${livreur.prenom} ${livreur.username}`,
        telephone: livreur.telephone,
        note: livreur.note,
        typeVehicule: livreur.typeVehicule
      },
      notificationSent: notificationResult.success
    });

  } catch (error) {
    console.error('❌ Erreur acceptation commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'acceptation de la commande',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
},

  // Obtenir une commande par son ID
  async getCommandeById(req, res) {
    try {
      const { id } = req.params;
      const commande = await prisma.commande.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true,
          plat: {
            include: {
              categorie: true
            }
          },
          payement: true,
          livraison: true,
          complements: {
          include: {
            complement: {
              include: {
                restaurant: true
              }
            }
          }
        }
        }
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
          plat: true,
          payement: true,
          livraison: true,
          complements: true
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
    const { status, livreurId, restaurantName, raison } = req.body;
    
    console.log(`📡 Mise à jour commande ${id}:`, { status, livreurId });

    // Récupérer la commande actuelle pour connaître l'ancien statut
    const currentCommande = await prisma.commande.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, username: true, pushToken: true }
        },
        plat: {
          include: {
            categorie: {
                  include: {
                    restaurant: {
                      select: { name: true, adresse: true }
                    }
                  }
                }
              }
            }
          }
    });

    if (!currentCommande) {
      return res.status(404).json({
        success: false,
        message: "Commande non trouvée"
      });
    }

    const oldStatus = currentCommande.status;
    console.log(`📋 Changement de statut: ${oldStatus} → ${status}`);

    // Préparer les données à mettre à jour
    const updateData = {
      status,
      updatedAt: new Date()
    };

    // Ajouter livreurId seulement s'il est fourni
    if (livreurId !== undefined && livreurId !== null) {
      updateData.livreurId = parseInt(livreurId);
      console.log("✅ Assignation livreur:", updateData.livreurId);
    }

    console.log("📦 Données de mise à jour complètes:", updateData);

    // Mettre à jour la commande
    const updatedCommande = await prisma.commande.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: { id: true, username: true, phone: true, pushToken: true }
        },
        plat: {
          include: {
            categorie: {
                  include: {
                    restaurant: {
                      select: { name: true, adresse: true }
                    }
                  }
                }
              }
            }
          }
    });

    // 🚀 NOUVEAU: Notifications automatiques au client
    let clientNotificationResult = { success: false, message: 'Pas de notification' };

    // Récupérer les infos du livreur si nécessaire
    let livreurInfo = null;
    if (livreurId) {
      livreurInfo = await prisma.livreur.findUnique({
        where: { id: parseInt(livreurId) },
        select: {
          id: true,
          username: true,
          prenom: true,
          typeVehicule: true
        }
      });
    }

    // Envoyer la notification selon le statut
    try {
      const NOTIFIABLE_STATUSES = ['VALIDER', 'EN_COURS', 'LIVREE', 'ANNULEE'];

      const shouldNotify = NOTIFIABLE_STATUSES.includes(status);
      
      if (shouldNotify && updatedCommande.user.pushToken) {
        console.log(`📱 Envoi notification client pour statut: ${status}`);
        
        clientNotificationResult = await notifyClient(
          updatedCommande, 
          status, 
          livreurInfo,
          { 
            restaurantName: restaurantName || updatedCommande.plat?.categorie?.restaurant?.name,
            raison: raison || 'Non spécifiée'
          }
        );
      } else if (shouldNotify && !updatedCommande.user.pushToken) {
        console.warn(`⚠️ Client ${updatedCommande.user.id} sans token push - notification non envoyée`);
      }

    } catch (notificationError) {
      // Les erreurs de notification ne doivent pas faire échouer la mise à jour
      console.error('❌ Erreur notification client (non critique):', notificationError);
      clientNotificationResult = {
        success: false,
        error: notificationError.message,
        message: 'Erreur notification non critique'
      };
    }

    console.log("✅ Commande mise à jour:", {
      id: updatedCommande.id,
      status: updatedCommande.status,
      livreurId: updatedCommande.livreurId,
      clientNotified: clientNotificationResult.success
    });

    res.status(200).json({
      success: true,
      message: "Statut de la commande mis à jour avec succès",
      commande: updatedCommande,
      // 🆕 Informations sur la notification client
      clientNotification: {
        sent: clientNotificationResult.success,
        message: clientNotificationResult.message,
        userHasPushToken: !!updatedCommande.user?.pushToken,
        statusChanged: oldStatus !== status
      }
    });

  } catch (error) {
    console.error("❌ Erreur updateCommandeStatus:", error);
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
