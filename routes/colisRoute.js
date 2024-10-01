import express from 'express';

import ColisController from '../controllers/colisController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multer.js';


const router = express.Router();

// Routes publiques
router.get('/colis', ColisController.getAllColis);
router.get('/colis/:id', ColisController.getColisById);
router.get('/users/:userId/colis', ColisController.getUserColis);
router.get('/colis/en-livraison', ColisController.getColisEnLivraison);

// Routes protégées (nécessitant une authentification)
router.post('/colis', upload.single('imageColis'), authMiddleware, ColisController.createColis);
router.put('/colis/:id', authMiddleware, ColisController.updateColis);
router.delete('/colis/:id', authMiddleware, ColisController.deleteColis);
router.post('/colis/:id/livraison', authMiddleware, ColisController.addLivraisonToColis);

export default router;