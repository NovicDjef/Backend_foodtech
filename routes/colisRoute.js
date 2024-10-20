import express from 'express';

import colisController from '../controllers/colisController.js';
import userAuthMiddleware from '../middlewares/userAuthMiddleware.js';
import upload from '../middlewares/multer.js';


const router = express.Router();

// Routes publiques
router.get('/colis', colisController.getAllColis);
router.get('/colis/:id', colisController.getColisById);
router.get('/users/:userId/colis', colisController.getUserColis);
router.get('/colis/en-livraison', colisController.getColisEnLivraison);

// Routes protégées (nécessitant une authentification)
router.post('/colis', upload.single('imageColis'), userAuthMiddleware, colisController.createColis);
router.put('/colis/:id', colisController.updateCommandeStatus);
router.delete('/colis/:id', userAuthMiddleware, colisController.deleteColis);
router.post('/colis/:id/livraison', userAuthMiddleware, colisController.addLivraisonToColis);

export default router;