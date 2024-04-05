import articleController from '../controllers/articleController.js'
import express from 'express'

const router = express.Router()

router.get('/articles', articleController.getAllArticle)
router.get('/article/:id', articleController.getArticleById)
router.post('/createArticle', articleController.addArticle)
router.patch('/updateArticle/:id', articleController.updateArticle)
router.delete('/deleteArticle/:id', articleController.deleteArticle)

export default router
