import { PrismaClient } from '@prisma/client';
import notifyClient from '../utils/notifications/notifyClient.js';

const prisma = new PrismaClient();

export default {
  // Créer un nouveau colis
  async createColis(req, res) {
   
    try {
      const { description, poids, adresseDepart, adresseArrivee, usernameSend, usernamRecive, phoneRecive, prix } = req.body;
      const userId = req.user.id;
      const imagePath = req.file ? `/images/${req.file.filename}` : null;
      console.log("imageColis :", imagePath)
      const newColis = await prisma.colis.create({
        data: {
          description,
          poids: parseFloat(poids),
          adresseDepart,
          adresseArrivee,
          imageColis: imagePath,
          prix: parseFloat(prix),
          status: 'EN_ATTENTE', 
          usernameSend,
          usernamRecive,
          phoneRecive: phoneRecive ? parseFloat(phoneRecive) : undefined,
          user: { connect: { id: userId } },
        },
        include: {
          user: true,
          livraison: true,
        },
      });

      res.status(201).json({
        message: "Colis créé avec succès",
        colis: newColis
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async accepterColis (req, res) {
  try {
    const colisId = parseInt(req.params.id); // ✅ Corrigé : req.params.id au lieu de commandeId
    const { livreurId } = req.body;
    
    console.log(`📦 Acceptation colis ${colisId} par livreur ${livreurId}`);

    // ✅ Vérifier si la colis existe et est disponible
    const colis = await prisma.colis.findFirst({
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
        livraison: true
      }
    });

    if (!colis) {
      return res.status(404).json({ 
        success: false, 
        message: 'colis non trouvée ou déjà acceptée' 
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
          colisId: colisId,
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
      await tx.colis.update({
        where: { id: colisId },
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
          colisId: colisId,
          message: `Commande #${colisId} acceptée par ${livreur.prenom}`,
          type: 'COMMANDE_ACCEPTEE',
          send: true
        }
      });

      return nouvelleLivraison;
    });

    console.log('✅ Livraison créée avec succès:', result.id);

    // ✅ Notifier le client immédiatement
    

    const notificationResult = await notifyClient(colis, 'VALIDER', livreur);
    console.log('📱 Résultat notification client:', notificationResult.success);

    // ✅ Émettre l'événement temps réel si WebSocket disponible
    if (global.io) {
      global.io.emit(`commande_${colisId}_status`, {
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

  // Obtenir tous les colis
  async getAllColis(req, res) {
    try {
      const colis = await prisma.colis.findMany({
        include: {
          user: true,
          livraison: true,
        }
      });

      res.status(200).json(colis);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir un colis par son ID
  async getColisById(req, res) {
    try {
      const { id } = req.params;
      const colis = await prisma.colis.findUnique({
        where: { id: parseInt(id) },
        include: {
          user: true,
          livraison: true,
        }
      });

      if (!colis) {
        return res.status(404).json({ message: "Colis non trouvé" });
      }

      res.status(200).json(colis);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour un colis
  async updateColis(req, res) {
    try {
      const { id } = req.params;
      const { description, poids, adresseDepart, adresseArrivee } = req.body;

      const updatedColis = await prisma.colis.update({
        where: { id: parseInt(id) },
        data: {
          description,
          poids: poids ? parseFloat(poids) : undefined,
          imageColis,
          sernameSend,
          usernamRecive,
          phoneRecive: phoneRecive ? parseFloat(phoneRecive) : undefined, 
          adresseDepart,
          adresseArrivee,
        },
        include: {
          user: true,
          livraison: true,
        },
      });

      res.status(200).json({
        message: "Colis mis à jour avec succès",
        colis: updatedColis
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },
  async updateCommandeStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedCommande = await prisma.colis.update({
        where: { id: parseInt(id) },
        data: { status },
      });

      res.status(200).json({
        message: "Statut de la Colis mis à jour avec succès",
        commande: updatedCommande
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  async updateColisStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, livreurId, raison } = req.body;
    
    console.log(`📡 Mise à jour colis ${id}:`, { status, livreurId });

    // Récupérer le colis actuel pour connaître l'ancien statut
    const currentColis = await prisma.colis.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, username: true, pushToken: true, phone: true }
        },
        livreur: {
          select: { id: true, username: true, prenom: true, typeVehicule: true }
        }
      }
    });

    if (!currentColis) {
      return res.status(404).json({
        success: false,
        message: "Colis non trouvé"
      });
    }

    const oldStatus = currentColis.status;
    console.log(`📋 Changement de statut colis: ${oldStatus} → ${status}`);

    // Préparer les données à mettre à jour
    const updateData = {
      status,
      updatedAt: new Date()
    };

    // Ajouter livreurId seulement s'il est fourni
    if (livreurId !== undefined && livreurId !== null) {
        updateData.livreur = {
          connect: { id: parseInt(livreurId) }
    };
      console.log("✅ Assignation livreur colis:", updateData.livreurId);
    }

    // ✅ NOUVEAU: Mise à jour des timestamps selon le statut
    switch (status) {
      case 'VALIDER':
      case 'CONFIRMED':
        updateData.updatedAt = new Date();
        break;
      case 'EN_COURS':
      case 'IN_TRANSIT':
        updateData.updatedAt = new Date();
        break;
      case 'LIVREE':
      case 'DELIVERED':
        updateData.updatedAt = new Date();
        break;
      case 'ANNULEE':
      case 'CANCELLED':
        updateData.updatedAt = new Date();
        break;
    }

    console.log("📦 Données de mise à jour colis complètes:", updateData);

    // Mettre à jour le colis
    const updatedColis = await prisma.colis.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: { id: true, username: true, phone: true, pushToken: true}
        },
        livreur: {
          select: { id: true, username: true, prenom: true, typeVehicule: true }
        }
      }
    });

    // 🚀 NOUVEAU: Notifications automatiques au client pour colis
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
          typeVehicule: true,
          telephone: true
        }
      });
    }

    // Envoyer la notification selon le statut
    try {
      const NOTIFIABLE_STATUSES = ['VALIDER', 'CONFIRMED', 'EN_COURS', 'IN_TRANSIT', 'LIVREE', 'DELIVERED', 'ANNULEE', 'CANCELLED'];

      const shouldNotify = NOTIFIABLE_STATUSES.includes(status);
      
      if (shouldNotify && updatedColis.user.pushToken) {
        console.log(`📱 Envoi notification client colis pour statut: ${status}`);
        
        clientNotificationResult = await notifyClient(
          updatedColis, 
          status, 
          livreurInfo,
          { 
            raison: raison || 'Non spécifiée'
          }
        );
      } else if (shouldNotify && !updatedColis.user.pushToken) {
        console.warn(`⚠️ Client ${updatedColis.user.id} sans token push - notification colis non envoyée`);
      }

    } catch (notificationError) {
      // Les erreurs de notification ne doivent pas faire échouer la mise à jour
      console.error('❌ Erreur notification client colis (non critique):', notificationError);
      clientNotificationResult = {
        success: false,
        error: notificationError.message,
        message: 'Erreur notification non critique'
      };
    }

    console.log("✅ Colis mis à jour:", {
      id: updatedColis.id,
      status: updatedColis.status,
      livreurId: updatedColis.livreurId,
      clientNotified: clientNotificationResult.success
    });

    res.status(200).json({
      success: true,
      message: "Statut du colis mis à jour avec succès",
      colis: updatedColis,
      // 🆕 Informations sur la notification client
      clientNotification: {
        sent: clientNotificationResult.success,
        message: clientNotificationResult.message,
        userHasPushToken: !!updatedColis.user?.pushToken,
        statusChanged: oldStatus !== status,
        oldStatus: oldStatus,
        newStatus: status
      }
    });

  } catch (error) {
    console.error("❌ Erreur updateColisStatus:", error);
    handleServerError(res, error);
  }
},


  // Supprimer un colis
  async deleteColis(req, res) {
    try {
      const { id } = req.params;

      await prisma.colis.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Colis supprimé avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },
/*******  33a027bc-1615-4810-9ed6-61527828e8d7  *******/

  // Obtenir les colis d'un utilisateur spécifique
  async getUserColis(req, res) {
    try {
      const { userId } = req.params;
      const colis = await prisma.colis.findMany({
        where: { userId: parseInt(userId) },
        include: {
          livraison: true,
        }
      });

      res.status(200).json(colis);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Associer une livraison à un colis
  async addLivraisonToColis(req, res) {
    try {
      const { id } = req.params;
      const { type, statut, serviceLivraisonId } = req.body;

      const updatedColis = await prisma.colis.update({
        where: { id: parseInt(id) },
        data: {
          livraison: {
            create: {
              type,
              statut,
              adresseDepart: '',  // À remplir avec les données du colis
              adresseArrivee: '', // À remplir avec les données du colis
              serviceLivraison: serviceLivraisonId ? 
                { connect: { id: parseInt(serviceLivraisonId) } } : undefined,
            }
          }
        },
        include: {
          livraison: true,
        }
      });

      res.status(200).json({
        message: "Livraison associée au colis avec succès",
        colis: updatedColis
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les colis en cours de livraison
  async getColisEnLivraison(req, res) {
    try {
      const colis = await prisma.colis.findMany({
        where: {
          livraison: {
            statut: 'NON_LIVRE'
          }
        },
        include: {
          user: true,
          livraison: true,
        }
      });

      res.status(200).json(colis);
    } catch (error) {
      handleServerError(res, error);
    }
  },
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}
