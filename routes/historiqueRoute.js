import historiqueController from '../controllers/historiqueController.js'
import express from 'express'

const router = express.Router()

router.get('/historiques', historiqueController.getAllHistorique)
router.get('/historique/:id', historiqueController.getHistoriqueById)
router.post('/historique', historiqueController.addHistorique)
router.patch('/historique/:id', historiqueController.updateHistorique)
router.delete('/historique/:id', historiqueController.deleteHistorique)

export default router
