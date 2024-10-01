import NotificationController from '../controllers/notificationController.js';

import express from 'express';

const router = express.Router();

router.post('/send-notification', NotificationController.sendNotification);

export default router;