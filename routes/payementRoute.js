import payementController from '../controllers/payementController.js'
import express from 'express'

const router = express.Router()

router.get('/payements', payementController.getAllPayement)
router.get('/payement/:id', payementController.getPayementById)
router.post('/payement', payementController.addPayement)
router.patch('/payement/:id', payementController.updatePayement)
router.delete('/payement/:id', payementController.deletePayement)

export default router
