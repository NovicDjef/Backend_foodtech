import adminController from '../controllers/adminController.js'
import express from 'express'
import upload from '../middlewares/multer.js'

const router = express.Router()

router.get('/admins', adminController.getAllAdmin)
router.get('/admin/:id', adminController.getAdminById)
router.post('/admin/signIn',upload.single('image'), adminController.signUpAdmin)
router.post('/admin/login', adminController.login)

export default router
