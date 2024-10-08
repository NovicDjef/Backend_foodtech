

import express from 'express';
import RestaurantController from '../controllers/restaurantController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/restaurants', RestaurantController.getAllRestaurants);
router.get('/restaurants/:id', RestaurantController.getRestaurantById);
router.get('/restaurants/search', RestaurantController.searchRestaurants);

// Routes protégées (nécessitant une authentification)
router.post('/restaurants', authMiddleware, RestaurantController.createRestaurant);
router.put('/restaurants/:id', authMiddleware, RestaurantController.updateRestaurant);
router.delete('/restaurants/:id', authMiddleware, RestaurantController.deleteRestaurant);

export default router;