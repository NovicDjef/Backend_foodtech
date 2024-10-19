import express from 'express';
import livraisonController from '../controllers/livraisonController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/livraisons', livraisonController.getAllLivraisons);
router.get('/livraisons/:id', livraisonController.getLivraisonById);
router.get('/livraisons/status/:statut', livraisonController.getLivraisonsByStatus);
router.get('/livraisons/service/:serviceLivraisonId', livraisonController.getLivraisonsByService);

// Routes protégées (nécessitant une authentification)
router.post('/livraisons', authMiddleware('ADMIN'), livraisonController.createLivraison);
router.put('/livraisons/:id', authMiddleware('ADMIN'), livraisonController.updateLivraison);
router.delete('/livraisons/:id', authMiddleware('ADMIN'), livraisonController.deleteLivraison);
router.patch('/livraisons/:id/status', authMiddleware('ADMIN'), livraisonController.updateLivraisonStatus);

export default router;