import express from 'express';
import LivraisonController from '../controllers/livraisonController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/livraisons', LivraisonController.getAllLivraisons);
router.get('/livraisons/:id', LivraisonController.getLivraisonById);
router.get('/livraisons/status/:statut', LivraisonController.getLivraisonsByStatus);
router.get('/livraisons/service/:serviceLivraisonId', LivraisonController.getLivraisonsByService);

// Routes protégées (nécessitant une authentification)
router.post('/livraisons', authMiddleware, LivraisonController.createLivraison);
router.put('/livraisons/:id', authMiddleware, LivraisonController.updateLivraison);
router.delete('/livraisons/:id', authMiddleware, LivraisonController.deleteLivraison);
router.patch('/livraisons/:id/status', authMiddleware, LivraisonController.updateLivraisonStatus);

export default router;