import slideController from '../controllers/slideController.js'
import upload from '../middlewares/multer.js'
import express from 'express'


const router = express.Router()

router.get('/slides', slideController.getAllSlide)
router.get('/slide/:id', slideController.getSlideById)
router.post('/slide', upload.single('image'), slideController.addSlide)
router.patch('/slide/:id', upload.single('image'), slideController.updateSlide)
router.delete('/slide/:id', slideController.deleteSlide)

export default router
