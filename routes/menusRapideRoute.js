

import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import menusrapideController from '../controllers/menusrapideController.js';

const router = express.Router();

// Routes publiques
router.get('/menusrapides', menusrapideController.getAllMenusRapide);
router.get('/menusrapide/:id', menusrapideController.getMenusRapideById);
router.get('/menusrapide/search', menusrapideController.searchMenusRapide);
router.get('/users/:userId/favorite-plats', menusrapideController.getUserFavoriteMenusRapide);

// Routes protégées (nécessitant une authentification)
router.post('/menusrapides', menusrapideController.createMenusRapide);
router.put('/menusrapide/:id', authMiddleware('ADMIN'), menusrapideController.updateMenusRapide);
router.delete('/menusrapide/:id', authMiddleware('ADMIN'), menusrapideController.deleteMenusRapide);
router.post('/menusrapide/:platId/notes', authMiddleware('ADMIN'), menusrapideController.addNoteToMenusRapide);
router.post('/menusrapide/:platId/favorites/:userId', authMiddleware('ADMIN'), menusrapideController.addMenusRapideToFavorites);

export default router;