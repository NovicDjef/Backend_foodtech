import express from 'express';
import livraisonController from '../controllers/livraisonController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/livraisons', livraisonController.getAllLivraisons);
router.get('/livraisons/:id', livraisonController.getLivraisonById);
router.get('/livraisons/status/:statut', livraisonController.getLivraisonsByStatus);
router.get('/livraisons/service/:serviceLivraisonId', livraisonController.getLivraisonsByService);

// Routes protégées (nécessitant une authentification)
router.post('/livraisons', adminAuthMiddleware, livraisonController.createLivraison);
router.put('/livraisons/:id', adminAuthMiddleware, livraisonController.updateLivraison);
router.delete('/livraisons/:id', adminAuthMiddleware, livraisonController.deleteLivraison);
router.patch('/livraisons/:id/status', adminAuthMiddleware, livraisonController.updateLivraisonStatus);

export default router;