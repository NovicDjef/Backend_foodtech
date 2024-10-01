import express from 'express';

import CommandeController from '../controllers/commandeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/commandes', CommandeController.getAllCommandes);
router.get('/commandes/:id', CommandeController.getCommandeById);
router.get('/users/:userId/commandes', CommandeController.getUserCommandes);
router.get('/commandes/status/:status', CommandeController.getCommandesByStatus);

// Routes protégées (nécessitant une authentification)
router.post('/commandes', authMiddleware, CommandeController.createCommande);
// router.put('/commandes/:id', CommandeController.updateCommande);
router.delete('/commandes/:id', authMiddleware, CommandeController.deleteCommande);
router.patch('/commande/:id', authMiddleware, CommandeController.updateCommandeStatus);
router.post('/commandes/:id/payment', authMiddleware, CommandeController.addPaymentToCommande);

export default router;