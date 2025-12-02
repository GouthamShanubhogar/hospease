import Joi from 'joi';
import pool from '../config/db.js';

const db = pool;

/**
 * Notifications Controller
 * Handles user notifications management
 */

// Validation schemas
const createNotificationSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  title: Joi.string().min(1).max(255).required(),
  message: Joi.string().min(1).required(),
  type: Joi.string().valid('info', 'warning', 'success', 'token', 'appointment').default('info')
});

/**
 * Get user notifications
 * GET /api/notifications/:userId
 */
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { filter = 'all', limit = 50, offset = 0 } = req.query;

    // Validate pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    
    if (isNaN(limitNum) || isNaN(offsetNum) || limitNum > 100) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    // Build query based on filter
    let whereClause = 'WHERE user_id = $1';
    const queryParams = [userId];
    
    if (filter === 'unread') {
      whereClause += ' AND is_read = false';
    } else if (filter === 'read') {
      whereClause += ' AND is_read = true';
    } else if (filter !== 'all') {
      // Filter by type
      whereClause += ' AND type = $2';
      queryParams.push(filter);
    }

    const notificationsQuery = `
      SELECT 
        id,
        title,
        message,
        type,
        is_read,
        created_at,
        updated_at
      FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const countQuery = `
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN is_read = false THEN 1 END) as unread
      FROM notifications
      WHERE user_id = $1
    `;

    queryParams.push(limitNum, offsetNum);

    const [notificationsResult, countResult] = await Promise.all([
      db.query(notificationsQuery, queryParams),
      db.query(countQuery, [userId])
    ]);

    const notifications = notificationsResult.rows;
    const { total, unread } = countResult.rows[0];

    // Group notifications by date
    const groupedNotifications = notifications.reduce((acc, notification) => {
      const date = new Date(notification.created_at).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(notification);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        notifications: groupedNotifications,
        stats: {
          total: parseInt(total),
          unread: parseInt(unread),
          read: parseInt(total) - parseInt(unread)
        },
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < parseInt(total)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // From auth middleware

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    // Verify notification belongs to user and update
    const updateQuery = `
      UPDATE notifications 
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2 AND is_read = false
      RETURNING id, title, is_read, updated_at
    `;

    const result = await db.query(updateQuery, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found or already read' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Mark all notifications as read
 * PATCH /api/notifications/:userId/read-all
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const authUserId = req.user?.id;

    // Ensure user can only update their own notifications
    if (parseInt(userId) !== authUserId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateQuery = `
      UPDATE notifications 
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = false
      RETURNING COUNT(*) as updated_count
    `;

    const result = await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: `All notifications marked as read`,
      data: {
        updatedCount: result.rowCount,
        remainingUnread: parseInt(countResult.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Clear all notifications for user
 * DELETE /api/notifications/:userId/clear
 */
const clearAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const authUserId = req.user?.id;

    // Ensure user can only delete their own notifications
    if (parseInt(userId) !== authUserId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const deleteQuery = 'DELETE FROM notifications WHERE user_id = $1';
    const result = await db.query(deleteQuery, [userId]);

    // Log activity
    await db.query(
      'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'Notifications Cleared', JSON.stringify({ deletedCount: result.rowCount })]
    );

    res.status(200).json({
      success: true,
      message: 'All notifications cleared successfully',
      data: {
        deletedCount: result.rowCount
      }
    });

  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create notification (system function)
 * POST /api/notifications
 */
const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type = 'info' } = req.body;

    // Validate input
    const { error } = createNotificationSchema.validate({ userId, title, message, type });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Verify user exists
    const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const insertQuery = `
      INSERT INTO notifications (user_id, title, message, type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, message, type, is_read, created_at
    `;

    const result = await db.query(insertQuery, [userId, title, message, type]);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete specific notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const deleteQuery = `
      DELETE FROM notifications 
      WHERE id = $1 AND user_id = $2
      RETURNING id, title
    `;

    const result = await db.query(deleteQuery, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get notification statistics
 * GET /api/notifications/:userId/stats
 */
const getNotificationStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread,
        COUNT(CASE WHEN type = 'appointment' THEN 1 END) as appointments,
        COUNT(CASE WHEN type = 'token' THEN 1 END) as tokens,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as today
      FROM notifications
      WHERE user_id = $1
    `;

    const result = await db.query(statsQuery, [userId]);
    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        total: parseInt(stats.total),
        unread: parseInt(stats.unread),
        read: parseInt(stats.total) - parseInt(stats.unread),
        appointments: parseInt(stats.appointments),
        tokens: parseInt(stats.tokens),
        today: parseInt(stats.today)
      }
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  createNotification,
  deleteNotification,
  getNotificationStats
};