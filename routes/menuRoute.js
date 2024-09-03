import express from 'express';
import MenuController from '../controllers/menuController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/menus', MenuController.getAllMenus);
router.get('/menus/:id', MenuController.getMenuById);
router.get('/menus/:id/categories', MenuController.getCategoriesByMenu);
router.get('/restaurants/:restaurantId/menus', MenuController.getMenusByRestaurant);

// Routes protégées (nécessitant une authentification)
router.post('/menus', authMiddleware, MenuController.createMenu);
router.put('/menus/:id', authMiddleware, MenuController.updateMenu);
router.delete('/menus/:id', authMiddleware, MenuController.deleteMenu);
router.post('/menus/:menuId/categories', authMiddleware, MenuController.addCategoryToMenu);

export default router;