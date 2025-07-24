import express from 'express';
import gasOrderController from '../controllers/gasOrderController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';
import userAuthMiddleware from '../middlewares/userAuthMiddleware.js';

const router = express.Router();

// Routes nécessitant une authentification utilisateur
router.post('/gas/orders', userAuthMiddleware, gasOrderController.createGasOrder);
router.get('/gas/orders/user/:userId', userAuthMiddleware, gasOrderController.getUserOrders);
router.get('/gas/orders/:id', userAuthMiddleware, gasOrderController.getGasOrderById);
router.get('/gas/orders/number/:orderNumber', userAuthMiddleware, gasOrderController.getGasOrderByNumber);
router.patch('/gas/orders/:id/cancel', userAuthMiddleware, gasOrderController.cancelOrder);

// Routes protégées (admin seulement)
router.get('/gas/orders', adminAuthMiddleware, gasOrderController.getAllGasOrders);
router.get('/gas/orders/vendor/:vendorId', adminAuthMiddleware, gasOrderController.getVendorOrders);
router.patch('/gas/orders/:id/status', adminAuthMiddleware, gasOrderController.updateOrderStatus);
router.patch('/gas/orders/:id/assign', adminAuthMiddleware, gasOrderController.assignDeliveryPerson);
router.get('/gas/orders/stats', adminAuthMiddleware, gasOrderController.getOrdersStats);

export default router;
