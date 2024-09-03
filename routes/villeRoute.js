
import express from 'express';
import VilleController from '../controllers/VilleController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/villes', VilleController.getAllVilles);
router.get('/villes/:id', VilleController.getVilleById);
router.get('/villes/:id/restaurants', VilleController.getRestaurantsByVille);
router.get('/villes/search', VilleController.searchVilles);

// Routes protégées (nécessitant une authentification)
router.post('/villes', authMiddleware, VilleController.createVille);
router.put('/villes/:id', authMiddleware, VilleController.updateVille);
router.delete('/villes/:id', authMiddleware, VilleController.deleteVille);

export default router;