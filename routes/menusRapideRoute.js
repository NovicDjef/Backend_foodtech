

import express from 'express';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';
import menusrapideController from '../controllers/menusrapideController.js';

const router = express.Router();

// Routes publiques
router.get('/menusrapides', menusrapideController.getAllMenusRapide);
router.get('/menusrapide/:id', menusrapideController.getMenusRapideById);
router.get('/menusrapide/search', menusrapideController.searchMenusRapide);
router.get('/users/:userId/favorite-plats', menusrapideController.getUserFavoriteMenusRapide);

// Routes protégées (nécessitant une authentification)
router.post('/menusrapides', adminAuthMiddleware, menusrapideController.createMenusRapide);
router.put('/menusrapide/:id', adminAuthMiddleware, menusrapideController.updateMenusRapide);
router.delete('/menusrapide/:id', adminAuthMiddleware, menusrapideController.deleteMenusRapide);
router.post('/menusrapide/:platId/notes', adminAuthMiddleware, menusrapideController.addNoteToMenusRapide);
router.post('/menusrapide/:platId/favorites/:userId', adminAuthMiddleware, menusrapideController.addMenusRapideToFavorites);

export default router;