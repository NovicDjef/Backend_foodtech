

import express from 'express';
import platsController from '../controllers/platsController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/plats', platsController.getAllPlats);
router.get('/plats/:id', platsController.getPlatById);
router.get('/plats/search', platsController.searchPlats);
router.get('/users/:userId/favorite-plats', platsController.getUserFavoritePlats);

// Routes protégées (nécessitant une authentification)
router.post('/plats', adminAuthMiddleware, platsController.createPlat);
router.put('/plats/:id', adminAuthMiddleware, platsController.updatePlat);
router.delete('/plats/:id', adminAuthMiddleware, platsController.deletePlat);
router.post('/plats/:platId/notes', adminAuthMiddleware, platsController.addNoteToPLat);
router.post('/plats/:platId/favorites/:userId', adminAuthMiddleware, platsController.addPlatToFavorites);

export default router;