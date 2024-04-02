import livraisonController from '../controllers/livraisonController.js'
import express from 'express'

const router = express.Router()

router.get('/livraisons', livraisonController.getAllLivraison)
router.get('/livraison/:id', livraisonController.getLivraisonById)
router.post('/livraison', livraisonController.addLivraison)
router.patch('/livraison/:id', livraisonController.updateLivraison)
router.delete('/livraison/:id', livraisonController.deleteLivraison)

export default router
