import express from 'express';
import menuController from '../controllers/menuController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Routes publiques
router.get('/menus', menuController.getAllMenus);
router.get('/menus/:id', menuController.getMenuById);
router.get('/menus/:id/categories', menuController.getCategoriesByMenu);
router.get('/restaurants/:restaurantId/menus', menuController.getMenusByRestaurant);

// Routes protégées (nécessitant une authentification)
router.post('/menus', menuController.createMenu);
router.put('/menus/:id', adminAuthMiddleware, menuController.updateMenu);
router.delete('/menus/:id', adminAuthMiddleware, menuController.deleteMenu);
router.post('/menus/:menuId/categories', adminAuthMiddleware, menuController.addCategoryToMenu);

export default router;