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

// Routes bonus
router.patch('/livreur/:id/disponibilite', livreurController.updateDisponibilite);
router.patch('/livreur/:id/position', livreurController.updatePosition);

export default router;