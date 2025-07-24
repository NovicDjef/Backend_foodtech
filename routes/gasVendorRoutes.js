import express from 'express';
import gasVendorController from '../controllers/gasVendorController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';
import userAuthMiddleware from '../middlewares/userAuthMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/gas/vendors', gasVendorController.getAllGasVendors);
router.get('/gas/vendors/:id', gasVendorController.getGasVendorById);
router.get('/gas/vendors/ville/:villeId', gasVendorController.getVendorsByVille);
router.get('/gas/vendors/search', gasVendorController.searchVendorsByLocation);
router.get('/gas/vendors/:id/stats', gasVendorController.getVendorStats);

// Routes nécessitant une authentification utilisateur
router.post('/gas/vendors/nearby', userAuthMiddleware, gasVendorController.getNearbyVendors);

// Routes protégées (admin seulement)
router.post('/gas/vendors', adminAuthMiddleware, gasVendorController.createGasVendor);
router.put('/gas/vendors/:id', adminAuthMiddleware, gasVendorController.updateGasVendor);
router.delete('/gas/vendors/:id', adminAuthMiddleware, gasVendorController.deleteGasVendor);
router.patch('/gas/vendors/:id/status', adminAuthMiddleware, gasVendorController.toggleVendorStatus);

export default router;
