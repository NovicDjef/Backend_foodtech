import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

 export default  {
  // Créer une nouvelle catégorie
  async createCategorie(req, res) {
    try {
      const { name, image, description, menuId } = req.body;
      
      const newCategorie = await prisma.categorie.create({
        data: {
          name,
          image,
          description,
          menu: menuId ? { connect: { id: parseInt(menuId) } } : undefined,
        },
        include: {
          menu: true,
        },
      });

      res.status(201).json({
        message: "Catégorie créée avec succès",
        categorie: newCategorie
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir toutes les catégories
  async getAllCategories(req, res) {
    try {
      const categories = await prisma.categorie.findMany({
        include: {
          menu: true,
          plats: true,
        }
      });

      res.status(200).json(categories);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir une catégorie par son ID
  async getCategorieById(req, res) {
    try {
      const { id } = req.params;
      const categorie = await prisma.categorie.findUnique({
        where: { id: parseInt(id) },
        include: {
          menu: true,
          plats: true,
        }
      });

      if (!categorie) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }

      res.status(200).json(categorie);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Mettre à jour une catégorie
  async updateCategorie(req, res) {
    try {
      const { id } = req.params;
      const { name, image, description, menuId } = req.body;

      const updatedCategorie = await prisma.categorie.update({
        where: { id: parseInt(id) },
        data: {
          name,
          image,
          description,
          menu: menuId ? { connect: { id: parseInt(menuId) } } : undefined,
        },
        include: {
          menu: true,
        },
      });

      res.status(200).json({
        message: "Catégorie mise à jour avec succès",
        categorie: updatedCategorie
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Supprimer une catégorie
  async deleteCategorie(req, res) {
    try {
      const { id } = req.params;

      await prisma.categorie.delete({
        where: { id: parseInt(id) }
      });

      res.status(200).json({ message: "Catégorie supprimée avec succès" });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les plats d'une catégorie spécifique
  async getPlatsByCategorie(req, res) {
    try {
      const { id } = req.params;
      const categorie = await prisma.categorie.findUnique({
        where: { id: parseInt(id) },
        include: {
          plats: true,
        }
      });

      if (!categorie) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }

      res.status(200).json(categorie.plats);
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Ajouter un plat à une catégorie
  async addPlatToCategorie(req, res) {
    try {
      const { categorieId } = req.params;
      const { name, image, description, prix, quantity } = req.body;

      const updatedCategorie = await prisma.categorie.update({
        where: { id: parseInt(categorieId) },
        data: {
          plats: {
            create: {
              name,
              image,
              description,
              prix: parseFloat(prix),
              quantity: parseInt(quantity),
            },
          },
        },
        include: {
          plats: true,
        },
      });

      res.status(200).json({
        message: "Plat ajouté à la catégorie avec succès",
        categorie: updatedCategorie
      });
    } catch (error) {
      handleServerError(res, error);
    }
  },

  // Obtenir les catégories d'un menu spécifique
  async getCategoriesByMenu(req, res) {
    try {
      const { menuId } = req.params;
      const categories = await prisma.categorie.findMany({
        where: { menuId: parseInt(menuId) },
        include: {
          plats: true,
        }
      });

      res.status(200).json(categories);
    } catch (error) {
      handleServerError(res, error);
    }
  },
};

function handleServerError(res, error) {
  console.error('Erreur serveur:', error);
  res.status(500).json({ message: 'Une erreur est survenue', error: error.message });
}