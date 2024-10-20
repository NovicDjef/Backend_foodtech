import express from 'express';
import reservationController from '../controllers/reservationController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/reservations', reservationController.getAllReservations);
router.get('/reservations/:id', reservationController.getReservationById);
router.get('/users/:userId/reservations', reservationController.getUserReservations);
router.get('/restaurants/:restaurantId/reservations', reservationController.getRestaurantReservations);
router.get('/check-availability', reservationController.checkTableAvailability);

// Routes protégées (nécessitant une authentification)
router.post('/reservations', adminAuthMiddleware, reservationController.createReservation);
router.put('/reservations/:id', adminAuthMiddleware, reservationController.updateReservation);
router.delete('/reservations/:id', adminAuthMiddleware, reservationController.deleteReservation);

export default router;