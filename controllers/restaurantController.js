import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

 export default {
  // Créer un nouveau restaurant
  async createRestaurant(req, res) {
    try {
      const { name, phone, adresse, image, description, latitude, longitude, adminId, villeId } = req.body;
      
      const newRestaurant = await prisma.restaurant.create({
        data: {
          name,
          phone,
          adresse,
          image,
          description,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          admin: adminId ? { connect: { id: parseInt(adminId) } } : undefined,
          ville: villeId ? { connect: { id: parseInt(villeId) } } : undefined,
        },
      });
console.log("restaurant :", newRestaurant)
      res.status(201).json({
        message: "Restaurant créé avec succès",
        restaurant: newRestaurant
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir tous les restaurants
  async getAllRestaurants(req, res) {
    try {
      const restaurants = await prisma.restaurant.findMany({
        include: {
          menus: true,
          heuresOuverture: true,
          ville: true,
          admin: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      });

      res.status(200).json(restaurants);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir un restaurant par son ID
  async getRestaurantById(req, res) {
    try {
      const { id } = req.params;
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: parseInt(id) },
        include: {
          menus: true,
          heuresOuverture: true,
          ville: true,
          admin: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      });

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant non trouvé" });
      }

      res.status(200).json(restaurant);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour un restaurant
  async updateRestaurant(req, res) {
    try {
      const { id } = req.params;
      const { name, phone, adresse, image, description, latitude, longitude, adminId, villeId } = req.body;

      const updatedRestaurant = await prisma.restaurant.update({
        where: { id: parseInt(id) },
        data: {
          name,
          phone,
          adresse,
          image,
          description,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          admin: adminId ? { connect: { id: parseInt(adminId) } } : undefined,
          ville: villeId ? { connect: { id: parseInt(villeId) } } : undefined,
        },
      });

      res.status(200).json({
        message: "Restaurant mis à jour avec succès",
        restaurant: updatedRestaurant
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer un restaurant
  async deleteRestaurant(req, res) {
    try {
      const { id } = req.params;

      await prisma.restaurant.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Restaurant supprimé avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Rechercher des restaurants par nom ou adresse
  async searchRestaurants(req, res) {
    try {
      const { query } = req.query;
      const restaurants = await prisma.restaurant.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { adresse: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          ville: true,
        },
      });

      res.status(200).json(restaurants);
    } catch (error) {
      handleServerError(res, error);
    }
  },
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}
