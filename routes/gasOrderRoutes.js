import express from 'express';
import gasOrderController from '../controllers/gasOrderController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';
import userAuthMiddleware from '../middlewares/userAuthMiddleware.js';

const router = express.Router();

// Routes nécessitant une authentification utilisateur
router.post('/orders', userAuthMiddleware, gasOrderController.createGasOrder);
router.get('/orders/user/:userId', userAuthMiddleware, gasOrderController.getUserOrders);
router.get('/orders/:id', userAuthMiddleware, gasOrderController.getGasOrderById);
router.get('/orders/number/:orderNumber', userAuthMiddleware, gasOrderController.getGasOrderByNumber);
router.patch('/orders/:id/cancel', userAuthMiddleware, gasOrderController.cancelOrder);

// Routes protégées (admin seulement)
router.get('/orders', adminAuthMiddleware, gasOrderController.getAllGasOrders);
router.get('/orders/vendor/:vendorId', adminAuthMiddleware, gasOrderController.getVendorOrders);
router.patch('/orders/:id', gasOrderController.updateOrderStatus);
router.patch('/orders/:id/assign', adminAuthMiddleware, gasOrderController.assignDeliveryPerson);
router.get('/orders/stats', adminAuthMiddleware, gasOrderController.getOrdersStats);

export default router;
