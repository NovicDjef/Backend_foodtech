// import express from 'express';
// import payementController from '../controllers/payementController.js';

// const router = express.Router();

// router.get('/payements', payementController.getAllPayement);
// router.get('/payement/:id', payementController.getPayementById);

// router.patch('/payement/:id', payementController.updatePayement);
// router.delete('/payement/:id', payementController.deletePayement);
// router.post('/notchpay', payementController.handleWebhook);

// export default router;


import express from 'express';

import payementController from '../controllers/payementController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Routes publiques
router.post('/addpayement', payementController.addPayement);
router.get('/payements', payementController.getAllPayements);
router.get('/payements/:id', payementController.getPayementById);
router.get('/payements/status/:status', payementController.getPayementsByStatus);
router.get('/payements/check/:reference', payementController.checkPayementStatus);

// Routes protégées (nécessitant une authentification)
router.post('/payements', adminAuthMiddleware, payementController.createPayement);
router.put('/payements/:id', adminAuthMiddleware, payementController.updatePayement);
router.delete('/payements/:id', adminAuthMiddleware, payementController.deletePayement);
router.get('/users/:userId/payements', adminAuthMiddleware, payementController.getUserPayements);
router.patch('/payements/:id/status', adminAuthMiddleware, payementController.updatePayementStatus);

// Nouvelles routes pour l'intégration MeSomb
router.post('/initiate-payment', payementController.initiatePayment);
// router.get('/application-status', authMiddleware, payementController.getApplicationStatus);
// router.post('/deposit', authMiddleware, payementController.makeDeposit);
// router.post('/collect', authMiddleware, payementController.makeCollect);


export default router;