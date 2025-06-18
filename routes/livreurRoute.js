import express from 'express';
import upload from '../middlewares/multer.js';
import livreurController from '../controllers/livreurController.js';

const router = express.Router();

// Routes pour les livreurs
router.get('/livreurs', livreurController.getAllLivreur);
router.post('/livreur/signup', upload.single('image'), livreurController.signUpLivreur);
router.post('/livreur/login', livreurController.loginLivreur);
router.delete('/livreur/:id', livreurController.deleteLivreur);
router.patch('/livreur/:id', upload.single('image'), livreurController.updateLivreur);
router.put('/livreur/location', livreurController.updatePositionLivreur);
router.get('livreur/:id/stats', livreurController.getStatsLivreur);
router.post('/livreur/register-push-token', livreurController.postRegisterPushToken);
router.put('/commandes/livreur/location', livreurController.updatePositionLivreurCommande);
router.put('/livreur/status', livreurController.updateLivreurStatus);
router.get('/livreur/:id/status', livreurController.getLivreurStatus);
router.patch('/livreur/:id/disponibilite', livreurController.toggleLivreurDisponibilite);
router.get('/debug/tokens', livreurController.debugTokens);

// Routes bonus
router.patch('/livreur/:id/disponibilite', livreurController.updateDisponibilite);
router.patch('/livreur/:id/position', livreurController.updatePosition);

export default router;