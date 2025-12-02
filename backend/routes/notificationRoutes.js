import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  createNotification,
  deleteNotification,
  getNotificationStats
} from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * Notification Routes
 * All routes require authentication
 */

// GET /api/notifications/:userId - Get user notifications
router.get('/:userId', verifyToken, getUserNotifications);

// GET /api/notifications/:userId/stats - Get notification statistics
router.get('/:userId/stats', verifyToken, getNotificationStats);

// POST /api/notifications - Create notification (admin/system)
router.post('/', verifyToken, createNotification);

// PATCH /api/notifications/:id/read - Mark specific notification as read
router.patch('/:id/read', verifyToken, markNotificationAsRead);

// PATCH /api/notifications/:userId/read-all - Mark all notifications as read
router.patch('/:userId/read-all', verifyToken, markAllNotificationsAsRead);

// DELETE /api/notifications/:id - Delete specific notification
router.delete('/:id', verifyToken, deleteNotification);

// DELETE /api/notifications/:userId/clear - Clear all notifications
router.delete('/:userId/clear', verifyToken, clearAllNotifications);

export default router;