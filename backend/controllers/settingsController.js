import Joi from 'joi';
import pool from '../config/db.js';

const db = pool;

/**
 * Settings Controller
 * Handles user settings, security settings, and device management
 */

// Validation schemas
const updateSettingsSchema = Joi.object({
  language: Joi.string().valid('en', 'es', 'fr', 'de', 'hi'),
  theme: Joi.string().valid('light', 'dark'),
  date_format: Joi.string().valid('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'),
  notify_email: Joi.boolean(),
  notify_sms: Joi.boolean(),
  notify_inapp: Joi.boolean()
});

const securitySettingsSchema = Joi.object({
  two_factor: Joi.boolean().required()
});

const deviceSchema = Joi.object({
  device_name: Joi.string().max(255).required(),
  device_type: Joi.string().valid('desktop', 'mobile', 'tablet').required(),
  user_agent: Joi.string().max(1000).allow('')
});

/**
 * Get user settings
 * GET /api/settings/:userId
 */
const getUserSettings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user settings with user info
    const settingsQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        us.language,
        us.theme,
        us.date_format,
        us.notify_email,
        us.notify_sms,
        us.notify_inapp,
        us.two_factor,
        us.created_at as settings_created_at,
        us.updated_at as settings_updated_at
      FROM users u
      LEFT JOIN user_settings us ON u.id = us.user_id
      WHERE u.id = $1 AND u.status = 'active'
    `;

    const result = await db.query(settingsQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const settings = result.rows[0];

    // If no settings exist, create default settings
    if (!settings.language) {
      await db.query(
        `INSERT INTO user_settings (user_id) VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );

      // Fetch again with defaults
      const defaultResult = await db.query(settingsQuery, [userId]);
      settings = defaultResult.rows[0];
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: settings.id,
          name: settings.name,
          email: settings.email,
          role: settings.role
        },
        preferences: {
          language: settings.language || 'en',
          theme: settings.theme || 'light',
          date_format: settings.date_format || 'DD/MM/YYYY'
        },
        notifications: {
          email: settings.notify_email !== false,
          sms: settings.notify_sms !== false,
          inapp: settings.notify_inapp !== false
        },
        security: {
          two_factor: settings.two_factor || false
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update user settings
 * PUT /api/settings/:userId
 */
const updateUserSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Validate input
    const { error } = updateSettingsSchema.validate(updateData);
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
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(updateData[field]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const upsertQuery = `
      INSERT INTO user_settings (user_id, ${Object.keys(updateData).join(', ')})
      VALUES ($${paramIndex}, ${Object.keys(updateData).map((_, i) => `$${i + 1}`).join(', ')})
      ON CONFLICT (user_id) 
      DO UPDATE SET ${updateFields.join(', ')}
      RETURNING *
    `;

    // For upsert, we need to handle the values differently
    const upsertValues = [...Object.values(updateData), userId, ...Object.values(updateData)];
    
    // Simplified approach - always update if exists
    const simpleUpdateQuery = `
      UPDATE user_settings 
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    let result = await db.query(simpleUpdateQuery, values);

    // If no rows affected, insert new record
    if (result.rows.length === 0) {
      const insertQuery = `
        INSERT INTO user_settings (user_id, ${Object.keys(updateData).join(', ')})
        VALUES ($${paramIndex}, ${Object.keys(updateData).map((_, i) => `$${i + 1}`).join(', ')})
        RETURNING *
      `;
      result = await db.query(insertQuery, [userId, ...Object.values(updateData)]);
    }

    // Log activity
    await db.query(
      'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'Settings Updated', JSON.stringify({ fields: Object.keys(updateData) })]
    );

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update security settings
 * PATCH /api/settings/:userId/security
 */
const updateSecuritySettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { two_factor } = req.body;

    // Validate input
    const { error } = securitySettingsSchema.validate({ two_factor });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Update security settings
    const updateQuery = `
      UPDATE user_settings 
      SET two_factor = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING two_factor, updated_at
    `;

    let result = await db.query(updateQuery, [two_factor, userId]);

    // If no rows affected, create settings record
    if (result.rows.length === 0) {
      const insertQuery = `
        INSERT INTO user_settings (user_id, two_factor)
        VALUES ($1, $2)
        RETURNING two_factor, updated_at
      `;
      result = await db.query(insertQuery, [userId, two_factor]);
    }

    // Log security change
    await db.query(
      'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'Security Settings Changed', JSON.stringify({ two_factor, timestamp: new Date().toISOString() })]
    );

    res.status(200).json({
      success: true,
      message: `Two-factor authentication ${two_factor ? 'enabled' : 'disabled'}`,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get user devices
 * GET /api/settings/:userId/devices
 */
const getUserDevices = async (req, res) => {
  try {
    const { userId } = req.params;

    const devicesQuery = `
      SELECT 
        id,
        device_name,
        device_type,
        ip_address,
        last_active,
        is_active,
        created_at
      FROM user_devices
      WHERE user_id = $1
      ORDER BY last_active DESC
    `;

    const result = await db.query(devicesQuery, [userId]);

    const devices = result.rows.map(device => ({
      ...device,
      is_current: device.ip_address === req.ip, // Mark current device
      last_active_formatted: new Date(device.last_active).toLocaleString()
    }));

    res.status(200).json({
      success: true,
      data: {
        devices,
        total: devices.length,
        active: devices.filter(d => d.is_active).length
      }
    });

  } catch (error) {
    console.error('Error fetching user devices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Register new device
 * POST /api/settings/:userId/devices
 */
const registerDevice = async (req, res) => {
  try {
    const { userId } = req.params;
    const { device_name, device_type } = req.body;
    const ip_address = req.ip;
    const user_agent = req.get('User-Agent');

    // Validate input
    const { error } = deviceSchema.validate({ device_name, device_type, user_agent });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if device already exists (same IP and user agent)
    const existingDevice = await db.query(
      'SELECT id FROM user_devices WHERE user_id = $1 AND ip_address = $2 AND user_agent = $3',
      [userId, ip_address, user_agent]
    );

    if (existingDevice.rows.length > 0) {
      // Update last active time
      await db.query(
        'UPDATE user_devices SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
        [existingDevice.rows[0].id]
      );

      return res.status(200).json({
        success: true,
        message: 'Device session updated',
        data: { device_id: existingDevice.rows[0].id }
      });
    }

    // Register new device
    const insertQuery = `
      INSERT INTO user_devices (user_id, device_name, device_type, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, device_name, device_type, created_at
    `;

    const result = await db.query(insertQuery, [userId, device_name, device_type, ip_address, user_agent]);

    // Log new device
    await db.query(
      'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'New Device Registered', JSON.stringify({ device_name, device_type, ip_address })]
    );

    res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Logout from specific device
 * POST /api/settings/:userId/devices/logout
 */
const logoutDevice = async (req, res) => {
  try {
    const { userId } = req.params;
    const { device_id } = req.body;

    if (!device_id) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    // Deactivate device
    const updateQuery = `
      UPDATE user_devices 
      SET is_active = false, last_active = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING id, device_name
    `;

    const result = await db.query(updateQuery, [device_id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Log device logout
    await db.query(
      'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'Device Logged Out', JSON.stringify({ device_id, device_name: result.rows[0].device_name })]
    );

    res.status(200).json({
      success: true,
      message: 'Logged out from device successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error logging out device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Logout from all devices except current
 * POST /api/settings/:userId/devices/logout-all
 */
const logoutAllDevices = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentIp = req.ip;
    const currentUserAgent = req.get('User-Agent');

    // Deactivate all devices except current
    const updateQuery = `
      UPDATE user_devices 
      SET is_active = false, last_active = CURRENT_TIMESTAMP
      WHERE user_id = $1 
        AND NOT (ip_address = $2 AND user_agent = $3)
        AND is_active = true
      RETURNING COUNT(*) as logged_out_count
    `;

    const result = await db.query(
      `UPDATE user_devices 
       SET is_active = false 
       WHERE user_id = $1 
         AND NOT (ip_address = $2 AND user_agent = $3)
         AND is_active = true`,
      [userId, currentIp, currentUserAgent]
    );

    // Log mass logout
    await db.query(
      'INSERT INTO activity_log (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'All Devices Logged Out', JSON.stringify({ logged_out_count: result.rowCount })]
    );

    res.status(200).json({
      success: true,
      message: `Logged out from ${result.rowCount} devices`,
      data: {
        logged_out_count: result.rowCount
      }
    });

  } catch (error) {
    console.error('Error logging out all devices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export {
  getUserSettings,
  updateUserSettings,
  updateSecuritySettings,
  getUserDevices,
  registerDevice,
  logoutDevice,
  logoutAllDevices
};