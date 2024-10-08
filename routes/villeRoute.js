
import express from 'express';
import villeController from '../controllers/villeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/villes', villeController.getAllVilles);
router.get('/villes/:id', villeController.getVilleById);
router.get('/villes/:id/restaurants', villeController.getRestaurantsByVille);
router.get('/villes/search', villeController.searchVilles);

// Routes protégées (nécessitant une authentification)
router.post('/villes', authMiddleware, villeController.createVille);
router.put('/villes/:id', authMiddleware, villeController.updateVille);
router.delete('/villes/:id', authMiddleware, villeController.deleteVille);

export default router;