import express from 'express';
import livraisonController from '../controllers/livraisonController.js';
import authMiddleware from '../middlewares/userAuthMiddleware.js';
// import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// // Routes publiques
// router.get('/livraisons', livraisonController.getAllLivraisons);
// router.get('/livraisons/:id', livraisonController.getLivraisonById);
// router.get('/livraisons/status/:statut', livraisonController.getLivraisonsByStatus);
// router.get('/livraisons/service/:serviceLivraisonId', livraisonController.getLivraisonsByService);

// // Routes protégées (nécessitant une authentification)
// router.post('/livraisons', adminAuthMiddleware, livraisonController.createLivraison);
// router.put('/livraisons/:id', adminAuthMiddleware, livraisonController.updateLivraison);
// router.delete('/livraisons/:id', adminAuthMiddleware, livraisonController.deleteLivraison);
// router.patch('/livraisons/:id/status', adminAuthMiddleware, livraisonController.updateLivraisonStatus);


router.get('/livraison/:id', livraisonController.getDetailsLivraison);
router.put('/commandes/delivered', livraisonController.postLivraisonAsDelivered);
router.post('/commandes/reject', livraisonController.postLivraisonAsRejected);
router.post('/commandes/accept', livraisonController.postLivraisonAsAccepted);
router.get('/livraisons/active/:livreurId', livraisonController.getLivraisonsActive);
router.get('/livraisons/historique/:livreurId', livraisonController.getLivraisonsHistorique);
router.get('/commandes/livraison/:id', livraisonController.getCommandeLivraison);
router.post('/livraison', livraisonController.postNouvelleLivraison);


router.get('/tracking/:commandeId', livraisonController.getLivraisonsTracking);
router.post('/assign', livraisonController.assignleLivraison);
router.put('/position/:livreurId', livraisonController.updateLivraison);
export default router;