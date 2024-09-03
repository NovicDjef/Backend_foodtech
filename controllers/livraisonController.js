import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default  {
  // Créer une nouvelle livraison
  async createLivraison(req, res) {
    try {
      const { type, statut, adresseDepart, adresseArrivee, commandeId, colisId, serviceLivraisonId } = req.body;
      
      const newLivraison = await prisma.livraison.create({
        data: {
          type,
          statut,
          adresseDepart,
          adresseArrivee,
          dateLivraison: new Date(),
          commande: commandeId ? { connect: { id: parseInt(commandeId) } } : undefined,
          colis: colisId ? { connect: { id: parseInt(colisId) } } : undefined,
          serviceLivraison: serviceLivraisonId ? { connect: { id: parseInt(serviceLivraisonId) } } : undefined,
        },
        include: {
          commande: true,
          colis: true,
          serviceLivraison: true,
        },
      });

      res.status(201).json({
        message: "Livraison créée avec succès",
        livraison: newLivraison
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir toutes les livraisons
  async getAllLivraisons(req, res) {
    try {
      const livraisons = await prisma.livraison.findMany({
        include: {
          commande: true,
          colis: true,
          serviceLivraison: true,
        }
      });

      res.status(200).json(livraisons);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir une livraison par son ID
  async getLivraisonById(req, res) {
    try {
      const { id } = req.params;
      const livraison = await prisma.livraison.findUnique({
        where: { id: parseInt(id) },
        include: {
          commande: true,
          colis: true,
          serviceLivraison: true,
        }
      });

      if (!livraison) {
        return res.status(404).json({ message: "Livraison non trouvée" });
      }

      res.status(200).json(livraison);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour une livraison
  async updateLivraison(req, res) {
    try {
      const { id } = req.params;
      const { statut, adresseDepart, adresseArrivee, serviceLivraisonId } = req.body;

      const updatedLivraison = await prisma.livraison.update({
        where: { id: parseInt(id) },
        data: {
          statut,
          adresseDepart,
          adresseArrivee,
          serviceLivraison: serviceLivraisonId ? 
            { connect: { id: parseInt(serviceLivraisonId) } } : undefined,
        },
        include: {
          commande: true,
          colis: true,
          serviceLivraison: true,
        },
      });

      res.status(200).json({
        message: "Livraison mise à jour avec succès",
        livraison: updatedLivraison
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer une livraison
  async deleteLivraison(req, res) {
    try {
      const { id } = req.params;

      await prisma.livraison.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Livraison supprimée avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les livraisons par statut
  async getLivraisonsByStatus(req, res) {
    try {
      const { statut } = req.params;
      const livraisons = await prisma.livraison.findMany({
        where: { statut },
        include: {
          commande: true,
          colis: true,
          serviceLivraison: true,
        }
      });

      res.status(200).json(livraisons);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les livraisons par service de livraison
  async getLivraisonsByService(req, res) {
    try {
      const { serviceLivraisonId } = req.params;
      const livraisons = await prisma.livraison.findMany({
        where: { serviceLivraisonId: parseInt(serviceLivraisonId) },
        include: {
          commande: true,
          colis: true,
          serviceLivraison: true,
        }
      });

      res.status(200).json(livraisons);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour le statut d'une livraison
  async updateLivraisonStatus(req, res) {
    try {
      const { id } = req.params;
      const { statut } = req.body;

      const updatedLivraison = await prisma.livraison.update({
        where: { id: parseInt(id) },
        data: { statut },
        include: {
          commande: true,
          colis: true,
          serviceLivraison: true,
        },
      });

      res.status(200).json({
        message: "Statut de la livraison mis à jour avec succès",
        livraison: updatedLivraison
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}
