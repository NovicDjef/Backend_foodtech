import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
  // Créer un prix de livraison pour une commande
  async createCommandePrix(req, res) {
    const { montant, description, status } = req.body;
    try {
      const newPrix = await prisma.prixLivraisonCommande.create({
        data: { montant, description, status }
      });
      res.status(201).json({ message: "Prix de livraison pour commande créé", prix: newPrix });
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la création du prix", error: error.message });
    }
  },

  // Créer un prix de livraison pour un colis
  async createColisPrix(req, res) {
    const { montant, description, status } = req.body;
    try {
      const newPrix = await prisma.prixLivraisonColis.create({
        data: { montant, description, status }
      });
      res.status(201).json({ message: "Prix de livraison pour colis créé", prix: newPrix });
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la création du prix", error: error.message });
    }
  },

  // Lister tous les prix de livraison pour les commandes
  async listCommandePrix(req, res) {
    try {
      const prix = await prisma.prixLivraisonCommande.findMany();
      res.status(200).json(prix);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des prix", error: error.message });
    }
  },

  // Lister tous les prix de livraison pour les colis
  async listColisPrix(req, res) {
    try {
      const prix = await prisma.prixLivraisonColis.findMany();
      res.status(200).json(prix);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des prix", error: error.message });
    }
  },

  // Modifier un prix de livraison pour une commande
  async updateCommandePrix(req, res) {
    const { id } = req.params;
    const { montant, description, status } = req.body;
    try {
      const updatedPrix = await prisma.prixLivraisonCommande.update({
        where: { id: parseInt(id) },
        data: { montant, description, status }
      });
      res.status(200).json({ message: "Prix de livraison pour commande mis à jour", prix: updatedPrix });
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour du prix", error: error.message });
    }
  },

  // Modifier un prix de livraison pour un colis
  async updateColisPrix(req, res) {
    const { id } = req.params;
    const { montant, description, status } = req.body;
    try {
      const updatedPrix = await prisma.prixLivraisonColis.update({
        where: { id: parseInt(id) },
        data: { montant, description, status }
      });
      res.status(200).json({ message: "Prix de livraison pour colis mis à jour", prix: updatedPrix });
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour du prix", error: error.message });
    }
  },

  // Supprimer un prix de livraison pour une commande
  async deleteCommandePrix(req, res) {
    const { id } = req.params;
    try {
      await prisma.prixLivraisonCommande.delete({
        where: { id: parseInt(id) }
      });
      res.status(200).json({ message: "Prix de livraison pour commande supprimé" });
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la suppression du prix", error: error.message });
    }
  },

  // Supprimer un prix de livraison pour un colis
  async deleteColisPrix(req, res) {
    const { id } = req.params;
    try {
      await prisma.prixLivraisonColis.delete({
        where: { id: parseInt(id) }
      });
      res.status(200).json({ message: "Prix de livraison pour colis supprimé" });
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la suppression du prix", error: error.message });
    }
  }
};

