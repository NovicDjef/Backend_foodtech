

import express from 'express';
import categorieController from '../controllers/categorieController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/categories', categorieController.getAllCategories);
router.get('/categories/:id', categorieController.getCategorieById);
router.get('/categories/:id/plats', categorieController.getPlatsByCategorie);
router.get('/menus/:menuId/categories', categorieController.getCategoriesByMenu);

// Routes protégées (nécessitant une authentification)
router.post('/categories', adminAuthMiddleware, categorieController.createCategorie);
router.put('/categories/:id', adminAuthMiddleware, categorieController.updateCategorie);
router.delete('/categories/:id', adminAuthMiddleware, categorieController.deleteCategorie);
router.post('/categories/:categorieId/plats', adminAuthMiddleware, categorieController.addPlatToCategorie);

export default router;