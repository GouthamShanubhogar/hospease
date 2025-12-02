import bcrypt from 'bcryptjs';
import Joi from 'joi';
import pool from '../config/db.js';

const db = pool;

/**
 * Profile Controller
 * Handles user profile management, password changes, and activity logs
 */

// Validation schemas
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).allow(''),
  department: Joi.string().max(255).allow(''),
  avatar_url: Joi.string().uri().allow('')
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

/**
 * Get user profile information
 * GET /api/profile/:userId
 */
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate user ID
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Fetch user profile with department info
    const profileQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.department,
        u.avatar_url,
        u.last_login,
        u.status,
        u.created_at,
        us.language,
        us.theme,
        us.date_format
      FROM users u
      LEFT JOIN user_settings us ON u.id = us.user_id
      WHERE u.id = $1 AND u.status = 'active'
    `;
    
    const result = await db.query(profileQuery, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = result.rows[0];
    
    // Remove sensitive information
    delete profile.password_hash;
    
    res.status(200).json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update user profile
 * PUT /api/profile/:userId
 */
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Validate input
    const { error } = updateProfileSchema.validate(updateData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user exists
    const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(field => {
      if (updateData[field] !== undefined && ['name', 'phone', 'department', 'avatar_url'].includes(field)) {
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(updateData[field]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add updated_at and user ID
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, phone, department, avatar_url, updated_at
    `;

    const result = await db.query(updateQuery, values);

    // Log activity
    await db.query(
      'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'Profile Updated', JSON.stringify({ fields: Object.keys(updateData) })]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Change user password
 * PATCH /api/profile/:userId/password
 */
const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    // Validate input
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get current password hash
    const userQuery = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentPasswordHash = userQuery.rows[0].password_hash;

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, currentPasswordHash);
    if (!isOldPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Log activity
    await db.query(
      'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'Password Changed', JSON.stringify({ timestamp: new Date().toISOString() })]
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get user activity log
 * GET /api/profile/:userId/activity
 */
const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Validate pagination parameters
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    
    if (isNaN(limitNum) || isNaN(offsetNum) || limitNum > 100) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const activityQuery = `
      SELECT 
        id,
        action,
        details,
        timestamp
      FROM activity_log
      WHERE user_id = $1
      ORDER BY timestamp DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = 'SELECT COUNT(*) FROM activity_log WHERE user_id = $1';

    const [activityResult, countResult] = await Promise.all([
      db.query(activityQuery, [userId, limitNum, offsetNum]),
      db.query(countQuery, [userId])
    ]);

    const activities = activityResult.rows;
    const totalCount = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          total: totalCount,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Log user activity (helper function for other controllers to use)
 */
const logActivity = async (userId, action, details = {}) => {
  try {
    await db.query(
      'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, action, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserActivity,
  logActivity
};