import express from 'express';
import ReservationController from '../controllers/reservationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/reservations', ReservationController.getAllReservations);
router.get('/reservations/:id', ReservationController.getReservationById);
router.get('/users/:userId/reservations', ReservationController.getUserReservations);
router.get('/restaurants/:restaurantId/reservations', ReservationController.getRestaurantReservations);
router.get('/check-availability', ReservationController.checkTableAvailability);

// Routes protégées (nécessitant une authentification)
router.post('/reservations', authMiddleware, ReservationController.createReservation);
router.put('/reservations/:id', authMiddleware, ReservationController.updateReservation);
router.delete('/reservations/:id', authMiddleware, ReservationController.deleteReservation);

export default router;