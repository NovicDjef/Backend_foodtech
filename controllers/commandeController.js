import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
  // // Créer une nouvelle commande
  // async createCommande(req, res) {
  //   try {
  //     const { userId, platsId, quantity, prix, recommandation, telephone, position } = req.body;
      
  //     console.log("Données reçues:", { userId, platsId, quantity, telephone, prix, recommandation, position });
  
  //     // Validation des données
  //     if (!userId || !platsId || !quantity || !prix) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Données manquantes",
  //         userMessage: "Veuillez fournir toutes les informations nécessaires pour la commande."
  //       });
  //     }
  
  //     const commandeData = {
  //       quantity: parseInt(quantity),
  //       prix: parseFloat(prix),
  //       recommandation: recommandation || '',
  //       position: position || '',
  //       status: 'EN_COURS',
  //       telephone: telephone || '',
  //       user: { connect: { id: parseInt(userId) } },
  //       plat: { connect: { id: parseInt(platsId) } },
  //     };
  
  //     console.log("Données préparées pour Prisma:", commandeData);
  
  //     const newCommande = await prisma.commande.create({
  //       data: commandeData,
  //       include: {
  //         user: true,
  //         plat: true,
  //       },
  //     });
  
  //     console.log("Commande créée:", newCommande);
  
  //     res.status(201).json({
  //       success: true,
  //       message: "Commande créée avec succès",
  //       userMessage: "Votre commande a été passée avec succès ! Vous recevrez bientôt une confirmation.",
  //       commande: newCommande
  //     });
  //   } catch (error) {
  //     console.error('Erreur détaillée lors de la création de la commande:', error);
  
  //     if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //       // Gestion des erreurs spécifiques à Prisma
  //       if (error.code === 'P2002') {
  //         return res.status(400).json({
  //           success: false,
  //           message: "Contrainte unique violée",
  //           userMessage: "Cette commande ne peut pas être créée car elle viole une contrainte unique."
  //         });
  //       }
  //       // Ajoutez d'autres codes d'erreur Prisma si nécessaire
  //     }
  
  //     res.status(500).json({
  //       success: false,
  //       message: "Erreur lors de la création de la commande",
  //       userMessage: "Désolé, une erreur est survenue lors de la passation de votre commande. Veuillez réessayer.",
  //       error: process.env.NODE_ENV === 'development' ? error.message : undefined
  //     });
  //   }
  // },
  async createCommande(req, res) {
    console.log("Corps de la requête reçue:", req.body);
  
    // Extraction des données de l'objet commandeData
    const commandeData  = req.body;
  
    if (!commandeData) {
      return res.status(400).json({
        success: false,
        message: "Données de commande manquantes",
        userMessage: "Les données de la commande sont manquantes."
      });
    }
  
    const { userId, platsId, quantity, prix, recommandation, position, status, telephone } = commandeData;
  
    console.log("Données extraites:", commandeData);
  
    if (!userId || !platsId || !quantity || !prix) {
      return res.status(400).json({
        success: false,
        message: "Données essentielles manquantes",
        userMessage: "Veuillez fournir toutes les informations nécessaires pour la commande."
      });
    }
  
    try {
      const newCommande = await prisma.commande.create({
        data: {
          quantity: parseInt(quantity),
          prix: parseFloat(prix),
          recommandation: recommandation || '',
          position: position || '',
          status: status || 'EN_COURS',
          telephone: parseInt(telephone) || '',
          user: { connect: { id: parseInt(userId) } },
          plat: { connect: { id: parseInt(platsId) } },
        },
        include: {
          user: true,
          plat: true,
        },
      });
  
      console.log("Nouvelle commande créée:", newCommande);
  
      res.status(201).json({
        success: true,
        message: "Commande créée avec succès",
        userMessage: "Votre commande a été passée avec succès !",
        commande: newCommande
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
        include: {
          user: true,
          plats: true,
          payement: true,
          livraison: true,
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

  // Mettre à jour une commande
  async updateCommande(req, res) {
    try {
      const { id } = req.params;
      const { quantity, prix, recommandation, position, status } = req.body;

      const updatedCommande = await prisma.commande.update({
        where: { id: parseInt(id) },
        data: {
          quantity: quantity ? parseInt(quantity) : undefined,
          prix: prix ? parseFloat(prix) : undefined,
          recommandation,
          position,
          status,
        },
        include: {
          user: true,
          plats: true,
        },
      });

      res.status(200).json({
        message: "Commande mise à jour avec succès",
        commande: updatedCommande
      });
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
