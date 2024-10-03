import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const { notifications: Notifications } = prisma;

export default {
  async getAllNotifications(req, res) {
    try {
      const data = await Notifications.findMany();
      if (data.length > 0) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'No notifications found' });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Something went wrong',
        error,
      });
    }
  },

  // Get a single notification by ID
  async getNotificationById(req, res) {
    const id = parseInt(req.params.id);
    try {
      const data = await Notifications.findUnique({ where: { id } });
      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ message: 'Notification not found' });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Something went wrong',
        error,
      });
    }
  },

  // Create a new notification
  async createNotification(req, res) {
    const notification = {
      name: req.body.name,
      description: req.body.description,
    };
    try {
      const result = await Notifications.create({ data: notification });
      res.status(201).json({
        message: 'Notification created successfully',
        result,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Something went wrong',
        error,
      });
    }
  },

  // Update an existing notification
  async updateNotification(req, res) {
    const id = parseInt(req.params.id);
    const notification = {
      name: req.body.name,
      description: req.body.description,
    };
    try {
      const result = await Notifications.update({
        where: { id },
        data: notification,
      });
      res.status(200).json({
        message: 'Notification updated successfully',
        result,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Something went wrong',
        error,
      });
    }
  },

  // Delete a notification by ID
  async deleteNotification(req, res) {
    const id = parseInt(req.params.id);
    try {
      const result = await Notifications.delete({ where: { id } });
      res.status(200).json({
        message: 'Notification deleted successfully',
        result,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Something went wrong',
        error,
      });
    }
  },
};
