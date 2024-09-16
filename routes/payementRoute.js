// import express from 'express';
// import payementController from '../controllers/payementController.js';

// const router = express.Router();

// router.get('/payements', payementController.getAllPayement);
// router.get('/payement/:id', payementController.getPayementById);
// router.post('/payement', payementController.addPayement);
// router.patch('/payement/:id', payementController.updatePayement);
// router.delete('/payement/:id', payementController.deletePayement);
// router.post('/notchpay', payementController.handleWebhook);

// export default router;


import express from 'express';
import PayementController from '../controllers/payementController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/payements', PayementController.getAllPayements);
router.get('/payements/:id', PayementController.getPayementById);
router.get('/payements/status/:status', PayementController.getPayementsByStatus);
router.get('/payements/check/:reference', PayementController.checkPayementStatus);

// Routes protégées (nécessitant une authentification)
router.post('/payements', authMiddleware, PayementController.createPayement);
router.put('/payements/:id', authMiddleware, PayementController.updatePayement);
router.delete('/payements/:id', authMiddleware, PayementController.deletePayement);
router.get('/users/:userId/payements', authMiddleware, PayementController.getUserPayements);
router.patch('/payements/:id/status', authMiddleware, PayementController.updatePayementStatus);

// Nouvelles routes pour l'intégration MeSomb
router.post('/initiate-payment', PayementController.initiatePayment);
// router.get('/application-status', authMiddleware, PayementController.getApplicationStatus);
// router.post('/deposit', authMiddleware, PayementController.makeDeposit);
// router.post('/collect', authMiddleware, PayementController.makeCollect);


export default router;