

import express from 'express';
import categorieController from '../controllers/categorieController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/categories', categorieController.getAllCategories);
router.get('/categories/:id', categorieController.getCategorieById);
router.get('/categories/:id/plats', categorieController.getPlatsByCategorie);
router.get('/menus/:menuId/categories', categorieController.getCategoriesByMenu);

// Routes protégées (nécessitant une authentification)
router.post('/categories', authMiddleware, categorieController.createCategorie);
router.put('/categories/:id', authMiddleware, categorieController.updateCategorie);
router.delete('/categories/:id', authMiddleware, categorieController.deleteCategorie);
router.post('/categories/:categorieId/plats', authMiddleware, categorieController.addPlatToCategorie);

export default router;