

import express from 'express';
import PlatsController from '../controllers/platsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/plats', PlatsController.getAllPlats);
router.get('/plats/:id', PlatsController.getPlatById);
router.get('/plats/search', PlatsController.searchPlats);
router.get('/users/:userId/favorite-plats', PlatsController.getUserFavoritePlats);

// Routes protégées (nécessitant une authentification)
router.post('/plats', authMiddleware, PlatsController.createPlat);
router.put('/plats/:id', authMiddleware, PlatsController.updatePlat);
router.delete('/plats/:id', authMiddleware, PlatsController.deletePlat);
router.post('/plats/:platId/notes', authMiddleware, PlatsController.addNoteToPLat);
router.post('/plats/:platId/favorites/:userId', authMiddleware, PlatsController.addPlatToFavorites);

export default router;