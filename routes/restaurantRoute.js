

import express from 'express';
import restaurantController from '../controllers/restaurantController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';
import upload from '../middlewares/multer.js';

const router = express.Router();

// Routes publiques
router.get('/restaurants', restaurantController.getAllRestaurants);
router.get('/restaurants/:id', restaurantController.getRestaurantById);
router.get('/restaurants/search', restaurantController.searchRestaurants);

// Routes protégées (nécessitant une authentification)
router.post('/restaurants', upload.single('image'), adminAuthMiddleware, restaurantController.createRestaurant);
router.put('/restaurants/:id', adminAuthMiddleware, restaurantController.updateRestaurant);
router.delete('/restaurants/:id', adminAuthMiddleware, restaurantController.deleteRestaurant);

export default router;