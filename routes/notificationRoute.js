import express from 'express';
import notificationsController from '../controllers/notificationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/notifications', notificationsController.getAllNotifications);
router.get('/notifications/:id', notificationsController.getNotificationById);
router.post('/notification', authMiddleware, notificationsController.createNotification);
router.put('/notifications/:id', notificationsController.updateNotification);
router.delete('/notifications/:id', notificationsController.deleteNotification);

export default router;
