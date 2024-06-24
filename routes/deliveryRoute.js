import villeController from '../controllers/villeController.js'
import express from 'express'

const router = express.Router()

router.get('/villes', villeController.getAllVille)
router.get('/ville/:id', villeController.getVilleById)
router.post('/ville', villeController.addVille)
router.patch('/ville/:id', villeController.updateVille)
router.delete('/ville/:id', villeController.deleteVille)

export default router
