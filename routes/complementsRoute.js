import express from 'express';
import complementsController from '../controllers/complementsController.js';

const router = express.Router();

router.post('/complements', complementsController.createComplement);
router.put('/complements/:id', complementsController.updateComplement);
router.delete('/complements/:id', complementsController.deleteComplement);
router.get('/complements', complementsController.getAllComplements);
router.get('/complements/:id', complementsController.getComplementById);

export default router;