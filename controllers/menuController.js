import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default  {
  // Créer un nouveau menu
  async createMenu(req, res) {
    try {
      const { name, restaurantId } = req.body;
      
      const newMenu = await prisma.menu.create({
        data: {
          name,
          restaurant: { connect: { id: parseInt(restaurantId) } },
        },
        include: {
          restaurant: true,
        },
      });

      res.status(201).json({
        message: "Menu créé avec succès",
        menu: newMenu
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir tous les menus
  async getAllMenus(req, res) {
    try {
      const menus = await prisma.menu.findMany({
        include: {
          restaurant: true,
          categories: true,
        }
      });

      res.status(200).json(menus);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir un menu par son ID
  async getMenuById(req, res) {
    try {
      const { id } = req.params;
      const menu = await prisma.menu.findUnique({
        where: { id: parseInt(id) },
        include: {
          restaurant: true,
          categories: {
            include: {
              plats: true,
            },
          },
        }
      });

      if (!menu) {
        return res.status(404).json({ message: "Menu non trouvé" });
      }

      res.status(200).json(menu);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour un menu
  async updateMenu(req, res) {
    try {
      const { id } = req.params;
      const { name, restaurantId } = req.body;

      const updatedMenu = await prisma.menu.update({
        where: { id: parseInt(id) },
        data: {
          name,
          restaurant: restaurantId ? { connect: { id: parseInt(restaurantId) } } : undefined,
        },
        include: {
          restaurant: true,
        },
      });

      res.status(200).json({
        message: "Menu mis à jour avec succès",
        menu: updatedMenu
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer un menu
  async deleteMenu(req, res) {
    try {
      const { id } = req.params;

      await prisma.menu.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Menu supprimé avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les catégories d'un menu spécifique
  async getCategoriesByMenu(req, res) {
    try {
      const { id } = req.params;
      const menu = await prisma.menu.findUnique({
        where: { id: parseInt(id) },
        include: {
          categories: {
            include: {
              plats: true,
            },
          },
        }
      });

      if (!menu) {
        return res.status(404).json({ message: "Menu non trouvé" });
      }

      res.status(200).json(menu.categories);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Ajouter une catégorie à un menu
  async addCategoryToMenu(req, res) {
    try {
      const { menuId } = req.params;
      const { name, image, description } = req.body;

      const updatedMenu = await prisma.menu.update({
        where: { id: parseInt(menuId) },
        data: {
          categories: {
            create: {
              name,
              image,
              description,
            },
          },
        },
        include: {
          categories: true,
        },
      });

      res.status(200).json({
        message: "Catégorie ajoutée au menu avec succès",
        menu: updatedMenu
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les menus d'un restaurant spécifique
  async getMenusByRestaurant(req, res) {
    try {
      const { restaurantId } = req.params;
      const menus = await prisma.menu.findMany({
        where: { restaurantId: parseInt(restaurantId) },
        include: {
          categories: {
            include: {
              plats: true,
            },
          },
        }
      });

      res.status(200).json(menus);
    } catch (error) {
      handleServerError(res, error);
    }
  },
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}