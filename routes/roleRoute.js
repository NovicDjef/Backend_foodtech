import express from 'express';
import roleController from '../controllers/roleController';


const router = express.Router();

router.post('/roles', roleController.createRole);
router.get('/roles', roleController.getAllRoles);
router.get('/roles/:id', roleController.getRoleById);
router.put('/roles/:id', roleController.updateRole);
router.delete('/roles/:id', roleController.deleteRole);

export default router;