import platsController from '../controllers/platsController.js'
import upload from '../middlewares/multer.js'
import express from 'express'

const router = express.Router()

router.get('/plats', platsController.getAllPlats)
router.get('/plat/:id', platsController.getPlatsById)
router.post('/plat', upload.single('image_plat'), platsController.addPlats)
router.patch('/plat/:id', upload.single('image_plat'), platsController.updatePlats)
router.delete('/plat/:id', platsController.deletePlats)

export default router
