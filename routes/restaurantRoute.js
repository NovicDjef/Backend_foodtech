import restaurantController from '../controllers/restaurantController.js'
import upload from '../middlewares/multer.js'
import express from 'express'

const router = express.Router()

router.get('/restaurants', restaurantController.getAllRestaurant)
router.get('/restaurant/:id', restaurantController.getRestaurantById)
router.post('/restaurant', upload.single('image'), restaurantController.addRestaurant)
router.patch('/restaurant/:id', upload.single('image'), restaurantController.updateRestaurant)
router.delete('/restaurant/:id', restaurantController.deleteRestaurant)

export default router
