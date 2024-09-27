import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default  {
  // Créer un nouveau menusrapide
  async createMenusRapide(req, res) {
    try {
      const { name, image, description, prix } = req.body;
      
      const newMenusRapide = await prisma.menusrapide.create({
        data: {
          name,
          image,
          description,
          prix: parseFloat(prix),
        },
      });

      res.status(201).json({
        message: "menusrapide créé avec succès",
        menusrapide: newMenusRapide
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },


  // Obtenir tous les menusrapide
  async getAllMenusRapide(req, res) {
    try {
      const menusrapides = await prisma.menusrapide.findMany({
        include: {
          notes: true,
          favoritePlats: true,
        }
      });

      res.status(200).json(menusrapides);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir un menusrapide par son ID
  async getMenusRapideById(req, res) {
    try {
      const { id } = req.params;
      const menusrapide = await prisma.menusrapide.findUnique({
        where: { id: parseInt(id) },
        include: {
          notes: true,
          favoritePlats: true,
        }
      });

      if (!menusrapide) {
        return res.status(404).json({ message: "menusrapide non trouvé" });
      }

      res.status(200).json(menusrapide);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour un menusrapide
  async updateMenusRapide(req, res) {
    try {
      const { id } = req.params;
      const { name, image, description, prix,  } = req.body;

      const updatedMenusRapide = await prisma.menusrapide.update({
        where: { id: parseInt(id) },
        data: {
          name,
          image,
          description,
          prix: prix ? parseFloat(prix) : undefined,
        },
      });

      res.status(200).json({
        message: "Menusrapide mis à jour avec succès",
        Menusrapide: updatedMenusRapide
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer un menusrapide
  async deleteMenusRapide(req, res) {
    try {
      const { id } = req.params;

      await prisma.menusrapide.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Menusrapide supprimé avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Ajouter une note à un menusrapide
  async addNoteToMenusRapide(req, res) {
    try {
      const { menusrapideId } = req.params;
      const { userId, notation } = req.body;

      const newNote = await prisma.note.create({
        data: {
          notation,
          user: { connect: { id: parseInt(userId) } },
          menusrapide: { connect: { id: parseInt(menusrapideId) } },
        },
      });

      // Mettre à jour la note moyenne du menusrapide
      const menusrapide = await prisma.menusrapide.findUnique({
        where: { id: parseInt(menusrapideId) },
        include: { notes: true },
      });

      const averageRating = menusrapide.notes.reduce((sum, note) => sum + note.notation, 0) / menusrapide.notes.length;

      await prisma.menusrapide.update({
        where: { id: parseInt(menusrapideId) },
        data: { ratings: averageRating },
      });

      res.status(200).json({
        message: "Note ajoutée au menusrapide avec succès",
        note: newNote
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Ajouter un menusrapide aux favoris d'un utilisateur
  async addMenusRapideToFavorites(req, res) {
    try {
      const { menusrapideId, userId } = req.params;

      const favoritePlat = await prisma.favoritePlats.create({
        data: {
          user: { connect: { id: parseInt(userId) } },
          menusrapide: { connect: { id: parseInt(menusrapideId) } },
        },
      });

      res.status(200).json({
        message: "menusrapide ajouté aux favoris avec succès",
        favoritePlat
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les menusrapide favoris d'un utilisateur
  async getUserFavoriteMenusRapide(req, res) {
    try {
      const { userId } = req.params;
      const favoritePlats = await prisma.favoritePlats.findMany({
        where: { userId: parseInt(userId) },
        include: {
            menusrapide: true,
        }
      });

      res.status(200).json(favoritePlats.map(fp => fp.menusrapide));
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Rechercher des menusrapide
  async searchMenusRapide(req, res) {
    try {
      const { query } = req.query;
      const menusrapides = await prisma.menusrapide.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
      });

      res.status(200).json(menusrapides);
    } catch (error) {
      handleServerError(res, error);
    }
  },
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}
