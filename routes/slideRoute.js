import slideController from '../controllers/slideController.js'
// import upload from '../middlewares/multer.js'
import express from 'express'

import multer from 'multer';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });
  
const router = express.Router()

router.get('/slides', slideController.getAllSlide)
router.get('/slide/:id', slideController.getSlideById)
router.post('/slide', upload.single('image'), slideController.addSlide)
router.patch('/slide/:id', slideController.updateSlide)
router.delete('/slide/:id', slideController.deleteSlide)

export default router
