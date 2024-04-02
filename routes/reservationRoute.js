import reservationController from '../controllers/reservationController.js'
import express from 'express'

const router = express.Router()

router.get('/reservations', reservationController.getAllReservation)
router.get('/reservation/:id', reservationController.getReservationById)
router.post('/reservation', reservationController.addReservation)
router.patch('/reservation/:id', reservationController.updateReservation)
router.delete('/reservation/:id', reservationController.deleteReservation)

export default router
