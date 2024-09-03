import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

 export default  {
  // Créer une nouvelle ville
  async createVille(req, res) {
    try {
      const { name, longitude, latitude } = req.body;
      
      const newVille = await prisma.ville.create({
        data: {
          name,
          longitude: longitude ? parseFloat(longitude) : null,
          latitude: latitude ? parseFloat(latitude) : null,
        },
      });

      res.status(201).json({
        message: "Ville créée avec succès",
        ville: newVille
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir toutes les villes
  async getAllVilles(req, res) {
    try {
      const villes = await prisma.ville.findMany({
        include: {
          restaurants: {
            select: {
              id: true,
              name: true,
              adresse: true
            }
          }
        }
      });

      res.status(200).json(villes);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir une ville par son ID
  async getVilleById(req, res) {
    try {
      const { id } = req.params;
      const ville = await prisma.ville.findUnique({
        where: { id: parseInt(id) },
        include: {
          restaurants: true
        }
      });

      if (!ville) {
        return res.status(404).json({ message: "Ville non trouvée" });
      }

      res.status(200).json(ville);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour une ville
  async updateVille(req, res) {
    try {
      const { id } = req.params;
      const { name, longitude, latitude } = req.body;

      const updatedVille = await prisma.ville.update({
        where: { id: parseInt(id) },
        data: {
          name,
          longitude: longitude ? parseFloat(longitude) : null,
          latitude: latitude ? parseFloat(latitude) : null,
        },
      });

      res.status(200).json({
        message: "Ville mise à jour avec succès",
        ville: updatedVille
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer une ville
  async deleteVille(req, res) {
    try {
      const { id } = req.params;

      // Vérifier si la ville a des restaurants associés
      const villeWithRestaurants = await prisma.ville.findUnique({
        where: { id: parseInt(id) },
        include: { restaurants: true }
      });

      if (villeWithRestaurants && villeWithRestaurants.restaurants.length > 0) {
        return res.status(400).json({ message: "Impossible de supprimer la ville car elle contient des restaurants" });
      }

      await prisma.ville.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Ville supprimée avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les restaurants d'une ville spécifique
  async getRestaurantsByVille(req, res) {
    try {
      const { id } = req.params;
      const ville = await prisma.ville.findUnique({
        where: { id: parseInt(id) },
        include: {
          restaurants: {
            include: {
              menus: true,
              heuresOuverture: true
            }
          }
        }
      });

      if (!ville) {
        return res.status(404).json({ message: "Ville non trouvée" });
      }

      res.status(200).json(ville.restaurants);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Rechercher des villes par nom
  async searchVilles(req, res) {
    try {
      const { query } = req.query;
      const villes = await prisma.ville.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        include: {
          restaurants: {
            select: {
              id: true,
              name: true,
              adresse: true
            }
          }
        }
      });

      res.status(200).json(villes);
    } catch (error) {
      handleServerError(res, error);
    }
  }
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}

