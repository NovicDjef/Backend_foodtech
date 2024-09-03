import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
  // Créer une nouvelle commande
  async createCommande(req, res) {
    try {
      const { userId, platsId, quantity, prix, recommandation, position } = req.body;
      
      const newCommande = await prisma.commande.create({
        data: {
          quantity: parseInt(quantity),
          prix: parseFloat(prix),
          recommandation,
          position,
          status: 'EN_COURS',
          user: { connect: { id: parseInt(userId) } },
          plats: { connect: { id: parseInt(platsId) } },
        },
        include: {
          user: true,
          plats: true,
        },
      });

      res.status(201).json({
        message: "Commande créée avec succès",
        commande: newCommande
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir toutes les commandes
  async getAllCommandes(req, res) {
    try {
      const commandes = await prisma.commande.findMany({
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
