import { PrismaClient } from '@prisma/client';

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
