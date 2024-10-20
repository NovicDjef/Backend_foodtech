
import express from 'express';
import prixController from '../controllers/prixController.js';
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js"


const router = express.Router();

// Routes pour les prix de livraison des commandes
router.post('/prixcommande', prixController.createCommandePrix);
router.get('/prixcommande', prixController.listCommandePrix);
router.put('/prixcommande/:id', prixController.updateCommandePrix);
router.delete('/prixcommande/:id', prixController.deleteCommandePrix);

// Routes pour les prix de livraison des colis
router.post('/prixcolis', adminAuthMiddleware, prixController.createColisPrix);
router.get('/prixcolis', adminAuthMiddleware, prixController.listColisPrix);
router.put('/prixcolis/:id', adminAuthMiddleware, prixController.updateColisPrix);
router.delete('/prixcolis/:id', adminAuthMiddleware, prixController.deleteColisPrix);

export default router;