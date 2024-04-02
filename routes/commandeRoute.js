import commandeController from '../controllers/commandeController.js'
import upload from '../middlewares/multer.js'
import express from 'express'

const router = express.Router()

router.get('/commandes', commandeController.getAllCommande)
router.get('/commande/:id', commandeController.getCommandeById)
router.post('/commande', upload.single('image'), commandeController.addCommande)
router.patch('/commande/:id', commandeController.updateCommande)
router.delete('/commande/:id', commandeController.deleteCommande)

export default router


