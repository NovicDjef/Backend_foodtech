import express from 'express';
import complementsController from '../controllers/complementsController.js';
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js"

const router = express.Router();

router.post('/complements', adminAuthMiddleware, complementsController.createComplement);
router.put('/complements/:id', adminAuthMiddleware, complementsController.updateComplement);
router.delete('/complements/:id', adminAuthMiddleware, complementsController.deleteComplement);
router.get('/complements', complementsController.getAllComplements);
router.get('/complements/:id', complementsController.getComplementById);

export default router;