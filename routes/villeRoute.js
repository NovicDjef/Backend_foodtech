
import express from 'express';
import villeController from '../controllers/villeController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/villes', villeController.getAllVilles);
router.get('/villes/:id', villeController.getVilleById);
router.get('/villes/:id/restaurants', villeController.getRestaurantsByVille);
router.get('/villes/search', villeController.searchVilles);

// Routes protégées (nécessitant une authentification)
router.post('/villes', adminAuthMiddleware, villeController.createVille);
router.put('/villes/:id', adminAuthMiddleware, villeController.updateVille);
router.delete('/villes/:id', adminAuthMiddleware, villeController.deleteVille);

export default router;