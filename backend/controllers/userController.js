import pool from '../config/db.js';
import bcrypt from 'bcrypt';

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(400).json({ status: 'error', message: 'User id missing' });

    const result = await pool.query(
      'SELECT user_id, name, email, phone, role FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'User not found' });

    res.json({ status: 'success', user: result.rows[0] });
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to fetch profile', error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) return res.status(400).json({ status: 'error', message: 'User id missing' });

    const { name, phone, password } = req.body;

    // Build dynamic query
    const updates = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${idx++}`);
      values.push(phone);
    }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push(`password = $${idx++}`);
      values.push(hashed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No fields to update' });
    }

    values.push(userId);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${idx} RETURNING user_id, name, email, phone, role`;

    const result = await pool.query(query, values);
    res.json({ status: 'success', user: result.rows[0] });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to update profile', error: err.message });
  }
};

export default {
  getProfile,
  updateProfile,
};
