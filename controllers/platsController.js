import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default  {
  // Créer un nouveau plat
  async createPlat(req, res) {
    try {
      const { name, image, description, prix, categorieId } = req.body;
      
      const newPlat = await prisma.plats.create({
        data: {
          name,
          image,
          description,
          prix: parseFloat(prix),
          categorie: categorieId ? { connect: { id: parseInt(categorieId) } } : undefined,
        },
        include: {
          categorie: true,
        },
      });

      res.status(201).json({
        message: "Plat créé avec succès",
        plat: newPlat
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

// async  getPlatWithComplements(req, res) {
//     const plat = await prisma.plats.findUnique({
//       where: { id: platId },
//       include: {
//         complements: true,
//       },
//     })
//     return plat
//   },

  // Obtenir tous les plats
  async getAllPlats(req, res) {
    try {
      const plats = await prisma.plats.findMany({
        include: {
          categorie: true,
          notes: true,
          favoritePlats: true,
        }
      });

      res.status(200).json(plats);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir un plat par son ID
  async getPlatById(req, res) {
    try {
      const { id } = req.params;
      const plat = await prisma.plats.findUnique({
        where: { id: parseInt(id) },
        include: {
          categorie: true,
          notes: true,
          favoritePlats: true,
        }
      });

      if (!plat) {
        return res.status(404).json({ message: "Plat non trouvé" });
      }

      res.status(200).json(plat);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour un plat
  async updatePlat(req, res) {
    try {
      const { id } = req.params;
      const { name, image, description, prix, categorieId } = req.body;

      const updatedPlat = await prisma.plats.update({
        where: { id: parseInt(id) },
        data: {
          name,
          image,
          description,
          prix: prix ? parseFloat(prix) : undefined,
          categorie: categorieId ? { connect: { id: parseInt(categorieId) } } : undefined,
        },
        include: {
          categorie: true,
        },
      });

      res.status(200).json({
        message: "Plat mis à jour avec succès",
        plat: updatedPlat
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer un plat
  async deletePlat(req, res) {
    try {
      const { id } = req.params;

      await prisma.plats.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Plat supprimé avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Ajouter une note à un plat
  async addNoteToPLat(req, res) {
    try {
      const { platId } = req.params;
      const { userId, notation } = req.body;

      const newNote = await prisma.note.create({
        data: {
          notation,
          user: { connect: { id: parseInt(userId) } },
          plats: { connect: { id: parseInt(platId) } },
        },
      });

      // Mettre à jour la note moyenne du plat
      const plat = await prisma.plats.findUnique({
        where: { id: parseInt(platId) },
        include: { notes: true },
      });

      const averageRating = plat.notes.reduce((sum, note) => sum + note.notation, 0) / plat.notes.length;

      await prisma.plats.update({
        where: { id: parseInt(platId) },
        data: { ratings: averageRating },
      });

      res.status(200).json({
        message: "Note ajoutée au plat avec succès",
        note: newNote
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Ajouter un plat aux favoris d'un utilisateur
  async addPlatToFavorites(req, res) {
    try {
      const { platId, userId } = req.params;

      const favoritePlat = await prisma.favoritePlats.create({
        data: {
          user: { connect: { id: parseInt(userId) } },
          plats: { connect: { id: parseInt(platId) } },
        },
      });

      res.status(200).json({
        message: "Plat ajouté aux favoris avec succès",
        favoritePlat
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les plats favoris d'un utilisateur
  async getUserFavoritePlats(req, res) {
    try {
      const { userId } = req.params;
      const favoritePlats = await prisma.favoritePlats.findMany({
        where: { userId: parseInt(userId) },
        include: {
          plats: true,
        }
      });

      res.status(200).json(favoritePlats.map(fp => fp.plats));
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Rechercher des plats
  async searchPlats(req, res) {
    try {
      const { query } = req.query;
      const plats = await prisma.plats.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          categorie: true,
        }
      });

      res.status(200).json(plats);
    } catch (error) {
      handleServerError(res, error);
    }
  },
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}
