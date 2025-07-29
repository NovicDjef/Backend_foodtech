import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

 export default {
  // Créer un nouveau restaurant
  async createRestaurant(req, res) {
    try {
      const { name, phone, adresse, image, description, ratings, latitude, longitude, adminId, villeId } = req.body;
      const imagePath = req.file ? req.file.path : null;
       const rating = parseFloat(ratings);
      const newRestaurant = await prisma.restaurant.create({
        data: {
          name,
          phone,
          adresse,
          image: imagePath,
          description,
          ratings: rating,
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
          categories: true,
          heuresOuverture: true,
          ville: true,
          complements: true,
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
          categories: true,
          heuresOuverture: true,
          ville: true,
          complements: true,
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
    const {
      name,
      phone,
      adresse,
      image,
      description,
      latitude,
      longitude,
      adminId,
      villeId
    } = req.body;

    const dataToUpdate = {};

    if (name?.trim()) dataToUpdate.name = name.trim();
    if (phone?.trim()) dataToUpdate.phone = phone.trim();
    if (adresse?.trim()) dataToUpdate.adresse = adresse.trim();
    if (image?.trim()) dataToUpdate.image = image.trim();
    if (description?.trim()) dataToUpdate.description = description.trim();

    if (latitude && !isNaN(parseFloat(latitude))) {
      dataToUpdate.latitude = parseFloat(latitude);
    }

    if (longitude && !isNaN(parseFloat(longitude))) {
      dataToUpdate.longitude = parseFloat(longitude);
    }

    if (adminId && !isNaN(parseInt(adminId))) {
      dataToUpdate.admin = { connect: { id: parseInt(adminId) } };
    }

    if (villeId && !isNaN(parseInt(villeId))) {
      dataToUpdate.ville = { connect: { id: parseInt(villeId) } };
    }

    console.log("🔁 Données à mettre à jour :", dataToUpdate);

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.status(200).json({
      message: "Restaurant mis à jour avec succès",
      restaurant: updatedRestaurant
    });
  } catch (error) {
    console.error("💥 Erreur updateRestaurant :", error);
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
