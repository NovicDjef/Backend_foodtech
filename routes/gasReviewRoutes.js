import express from 'express';
import gasReviewController from '../controllers/gasReviewController.js';
import userAuthMiddleware from '../middlewares/userAuthMiddleware.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/gas/vendors/:vendorId/reviews', gasReviewController.getVendorReviews);
router.get('/gas/vendors/:vendorId/reviews/stats', gasReviewController.getVendorReviewStats);
router.get('/gas/orders/:orderId/review', gasReviewController.getOrderReview);

// Routes nécessitant une authentification utilisateur
router.post('/gas/reviews/vendor', userAuthMiddleware, gasReviewController.createVendorReview);
router.post('/gas/reviews/order', userAuthMiddleware, gasReviewController.createOrderReview);
router.get('/gas/reviews/user/:userId', userAuthMiddleware, gasReviewController.getUserReviews);
router.put('/gas/reviews/order/:id', userAuthMiddleware, gasReviewController.updateOrderReview);
router.delete('/gas/reviews/vendor/:id', userAuthMiddleware, gasReviewController.deleteVendorReview);
router.delete('/gas/reviews/order/:id', userAuthMiddleware, gasReviewController.deleteOrderReview);

export default router;