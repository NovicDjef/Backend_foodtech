import express from 'express';
import reservationController from '../controllers/reservationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/reservations', reservationController.getAllReservations);
router.get('/reservations/:id', reservationController.getReservationById);
router.get('/users/:userId/reservations', reservationController.getUserReservations);
router.get('/restaurants/:restaurantId/reservations', reservationController.getRestaurantReservations);
router.get('/check-availability', reservationController.checkTableAvailability);

// Routes protégées (nécessitant une authentification)
router.post('/reservations', authMiddleware, reservationController.createReservation);
router.put('/reservations/:id', authMiddleware, reservationController.updateReservation);
router.delete('/reservations/:id', authMiddleware, reservationController.deleteReservation);

export default router;