import express from 'express';

import commandeController from '../controllers/commandeController.js';
import userAuthMiddleware from '../middlewares/userAuthMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/commandes', commandeController.getAllCommandes);
router.get('/commandes/:id', commandeController.getCommandeById);
router.get('/users/:userId/commandes', commandeController.getUserCommandes);
router.get('/commandes/status/:status', commandeController.getCommandesByStatus);

// Routes protégées (nécessitant une authentification)
router.post('/commandes', userAuthMiddleware, commandeController.createCommande);
// router.put('/commandes/:id', commandeController.updateCommande);
router.delete('/commandes/:id', userAuthMiddleware, commandeController.deleteCommande);
router.patch('/commande/:id', userAuthMiddleware, commandeController.updateCommandeStatus);
router.post('/commandes/:id/payment', userAuthMiddleware, commandeController.addPaymentToCommande);

export default router;