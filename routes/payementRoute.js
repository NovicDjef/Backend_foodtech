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
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.post('/addpayement', payementController.addPayement);
router.get('/payements', payementController.getAllPayements);
router.get('/payements/:id', payementController.getPayementById);
router.get('/payements/status/:status', payementController.getPayementsByStatus);
router.get('/payements/check/:reference', payementController.checkPayementStatus);

// Routes protégées (nécessitant une authentification)
router.post('/payements', payementController.createPayement);
router.put('/payements/:id', authMiddleware('ADMIN'), payementController.updatePayement);
router.delete('/payements/:id', authMiddleware('ADMIN'), payementController.deletePayement);
router.get('/users/:userId/payements', authMiddleware('ADMIN'), payementController.getUserPayements);
router.patch('/payements/:id/status', authMiddleware('ADMIN'), payementController.updatePayementStatus);

// Nouvelles routes pour l'intégration MeSomb
router.post('/initiate-payment', payementController.initiatePayment);
// router.get('/application-status', authMiddleware, payementController.getApplicationStatus);
// router.post('/deposit', authMiddleware, payementController.makeDeposit);
// router.post('/collect', authMiddleware, payementController.makeCollect);


export default router;