

import express from 'express';
import CategorieController from '../controllers/categorieController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/categories', CategorieController.getAllCategories);
router.get('/categories/:id', CategorieController.getCategorieById);
router.get('/categories/:id/plats', CategorieController.getPlatsByCategorie);
router.get('/menus/:menuId/categories', CategorieController.getCategoriesByMenu);

// Routes protégées (nécessitant une authentification)
router.post('/categories', authMiddleware, CategorieController.createCategorie);
router.put('/categories/:id', authMiddleware, CategorieController.updateCategorie);
router.delete('/categories/:id', authMiddleware, CategorieController.deleteCategorie);
router.post('/categories/:categorieId/plats', authMiddleware, CategorieController.addPlatToCategorie);

export default router;