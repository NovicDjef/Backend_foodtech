import express from 'express';
import UserRoleController from '../controllers/UserRoleController';



const router = express.Router();

router.post('/user-roles', UserRoleController.addUserRole);
router.get('/user-roles', UserRoleController.getUserRoles);
router.get('/user-roles/:adminId', UserRoleController.getUserRolesByAdmin);
router.put('/user-roles', UserRoleController.updateUserRole);
router.delete('/user-roles/:adminId/:roleId', UserRoleController.deleteUserRole);

export default router;