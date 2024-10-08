

import express from 'express';
import platsController from '../controllers/platsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/plats', platsController.getAllPlats);
router.get('/plats/:id', platsController.getPlatById);
router.get('/plats/search', platsController.searchPlats);
router.get('/users/:userId/favorite-plats', platsController.getUserFavoritePlats);

// Routes protégées (nécessitant une authentification)
router.post('/plats', authMiddleware, platsController.createPlat);
router.put('/plats/:id', authMiddleware, platsController.updatePlat);
router.delete('/plats/:id', authMiddleware, platsController.deletePlat);
router.post('/plats/:platId/notes', authMiddleware, platsController.addNoteToPLat);
router.post('/plats/:platId/favorites/:userId', authMiddleware, platsController.addPlatToFavorites);

export default router;