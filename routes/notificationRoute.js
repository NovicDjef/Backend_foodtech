import express from 'express';
import notificationsController from '../controllers/notificationController.js';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

router.get('/notifications', notificationsController.getAllNotifications);
router.get('/notifications/:id', notificationsController.getNotificationById);
router.post('/notification', adminAuthMiddleware, notificationsController.createNotification);
router.put('/notifications/:id', notificationsController.updateNotification);
router.delete('/notifications/:id', notificationsController.deleteNotification);

export default router;
