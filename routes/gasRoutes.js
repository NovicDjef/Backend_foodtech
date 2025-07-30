import express from 'express';
import gasVendorController from '../controllers/gasVendorController.js';
import gasOrderController from '../controllers/gasOrderController.js';
import gasReviewController from '../controllers/gasReviewController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';
import userAuthMiddleware from '../middlewares/userAuthMiddleware.js';
import authWithRoles from '../middlewares/authWithRoles.js';

const router = express.Router();


// Routes publiques vendeurs
router.get('/vendors', gasVendorController.getAllGasVendors);
router.get('/vendors/:id', gasVendorController.getGasVendorById);
router.get('/vendors/ville/:villeId', gasVendorController.getVendorsByVille);
router.get('/vendors/search', gasVendorController.searchVendorsByLocation);
router.get('/vendors/:id/stats', gasVendorController.getVendorStats);

// Routes authentifiées vendeurs
router.post('/vendors/nearby', userAuthMiddleware, gasVendorController.getNearbyVendors);

// Routes admin vendeurs
router.post('/vendors', adminAuthMiddleware, gasVendorController.createGasVendor);
router.put('/vendors/:id', adminAuthMiddleware, gasVendorController.updateGasVendor);
router.delete('/vendors/:id', adminAuthMiddleware, gasVendorController.deleteGasVendor);
router.patch('/vendors/:id/status', adminAuthMiddleware, gasVendorController.toggleVendorStatus);

// ========================================
// ROUTES COMMANDES
// ========================================

// Routes authentifiées commandes
router.post('/orders', userAuthMiddleware, gasOrderController.createGasOrder);
router.get('/orders/user/:userId', gasOrderController.getUserOrders);
router.get('/orders/:id', gasOrderController.getGasOrderById);
router.get('/orders/number/:orderNumber', gasOrderController.getGasOrderByNumber);
router.patch('/orders/:id/cancel', userAuthMiddleware, gasOrderController.cancelOrder);

// Routes admin commandes
router.get('/orders', gasOrderController.getAllGasOrders);
router.get('/orders/vendor/:vendorId', authWithRoles('admin', 'livreur'), gasOrderController.getVendorOrders);
router.patch('/orders/:id/status', authWithRoles('admin', 'livreur'), gasOrderController.updateOrderStatus);
router.patch('/orders/:id/assign', authWithRoles('admin', 'livreur'), gasOrderController.assignDeliveryPerson);
router.get('/orders/stats', authWithRoles('admin', 'livreur'), gasOrderController.getOrdersStats);

// ========================================
// ROUTES AVIS
// ========================================

// Routes publiques avis
router.get('/vendors/:vendorId/reviews', gasReviewController.getVendorReviews);
router.get('/vendors/:vendorId/reviews/stats', gasReviewController.getVendorReviewStats);
router.get('/orders/:orderId/review', gasReviewController.getOrderReview);

// Routes authentifiées avis
router.post('/reviews/vendor', userAuthMiddleware, gasReviewController.createVendorReview);
router.post('/reviews/order', userAuthMiddleware, gasReviewController.createOrderReview);
router.get('/reviews/user/:userId', userAuthMiddleware, gasReviewController.getUserReviews);
router.put('/reviews/order/:id', userAuthMiddleware, gasReviewController.updateOrderReview);
router.delete('/reviews/vendor/:id', userAuthMiddleware, gasReviewController.deleteVendorReview);
router.delete('/reviews/order/:id', userAuthMiddleware, gasReviewController.deleteOrderReview);

export default router;
