import categorieController from '../controllers/categorieController.js'
import upload from '../middlewares/multer.js'
import express from 'express'

const router = express.Router()

router.get('/categories', categorieController.getAllCategorie)
router.get('/categorie/:id', categorieController.getCategorieById)
router.post('/categorie', upload.single('image'), categorieController.addCategorie)
router.delete('/categorie/:id', categorieController.deleteCategorie)
router.patch('/categorie/:id', upload.single('image'), categorieController.updateCategorie)

export default router
