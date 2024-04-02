import menuController from '../controllers/menuController.js'
import upload from '../middlewares/multer.js'
import express from 'express'

const router = express.Router()

router.get('/menus', menuController.getAllMenu)
router.get('/menu/:id', menuController.getMenuById)
router.post('/menu', upload.single('image'), menuController.addMenu)
router.patch('/menu/:id', menuController.updateMenu)
router.delete('/menu/:id', menuController.deleteMenu)

export default router
