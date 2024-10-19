

import express from 'express';
import restaurantController from '../controllers/restaurantController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/restaurants', restaurantController.getAllRestaurants);
router.get('/restaurants/:id', restaurantController.getRestaurantById);
router.get('/restaurants/search', restaurantController.searchRestaurants);

// Routes protégées (nécessitant une authentification)
router.post('/restaurants', authMiddleware('ADMIN'), restaurantController.createRestaurant);
router.put('/restaurants/:id', authMiddleware('ADMIN'), restaurantController.updateRestaurant);
router.delete('/restaurants/:id', authMiddleware('ADMIN'), restaurantController.deleteRestaurant);

export default router;