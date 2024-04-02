import articleController from '../controllers/articleController.js'
import express from 'express'

const router = express.Router()

router.get('/articles', articleController.getAllArticle)
router.get('/article/:id', articleController.getArticleById)
router.post('/article', articleController.addArticle)
router.patch('/article/:id', articleController.updateArticle)
router.delete('/article/:id', articleController.deleteArticle)

export default router
