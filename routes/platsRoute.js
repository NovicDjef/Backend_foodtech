

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
router.post('/plats', authMiddleware('ADMIN'), platsController.createPlat);
router.put('/plats/:id', authMiddleware('ADMIN'), platsController.updatePlat);
router.delete('/plats/:id', authMiddleware('ADMIN'), platsController.deletePlat);
router.post('/plats/:platId/notes', authMiddleware('ADMIN'), platsController.addNoteToPLat);
router.post('/plats/:platId/favorites/:userId', authMiddleware('ADMIN'), platsController.addPlatToFavorites);

export default router;