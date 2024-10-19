import adminController from '../controllers/adminController.js'
import express from 'express'
import upload from '../middlewares/multer.js'

const router = express.Router()

router.get('/admins', adminController.getAllAdmins)
router.get('/admin/:id', adminController.getAdminById)
router.post('/admin/signIn',upload.single('image'), adminController.signUpAdmin)
router.post('/admin/login', adminController.login)
router.delete('/admin/:id', adminController.deleteAdmin)
router.patch('/admin/:id', adminController.updateAdmin)
export default router
