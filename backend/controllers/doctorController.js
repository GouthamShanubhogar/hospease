import pool from '../config/db.js';

export const listDoctors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, h.name as hospital_name
       FROM doctors d
       LEFT JOIN hospitals h ON d.hospital_id = h.hospital_id
       ORDER BY d.name`
    );
    // Return array directly to match frontend (res.data)
    res.json(result.rows);
  } catch (err) {
    console.error('Error listing doctors:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to list doctors', error: err.message });
  }
};

export const createDoctor = async (req, res) => {
  const { name, hospital_id, specialty } = req.body;
  if (!name || !hospital_id) return res.status(400).json({ status: 'error', message: 'Name and hospital_id required' });
  try {
    const result = await pool.query(
      'INSERT INTO doctors (name, hospital_id, specialty, current_token) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, hospital_id, specialty || null, 0]
    );
    res.status(201).json({ status: 'success', doctor: result.rows[0] });
  } catch (err) {
    console.error('Error creating doctor:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to create doctor', error: err.message });
  }
};

export const updateCurrentToken = async (req, res) => {
  const { id } = req.params;
  const { current_token } = req.body;
  if (current_token == null) return res.status(400).json({ status: 'error', message: 'current_token is required' });
  try {
    const result = await pool.query(
      'UPDATE doctors SET current_token = $1 WHERE doctor_id = $2 RETURNING *',
      [current_token, id]
    );
    const updated = result.rows[0];
    // Emit socket event to notify waiting patients
    const io = req.app.get('io');
    if (io) io.to(`doctor_${id}`).emit('token_updated', { doctor_id: id, current_token });
    res.json({ status: 'success', doctor: updated });
  } catch (err) {
    console.error('Error updating current token:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to update token', error: err.message });
  }
};

export const getTodaysPatients = async (req, res) => {
  const { id } = req.params; // doctor id
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as patient_name, u.phone
       FROM appointments a
       LEFT JOIN users u ON a.user_id = u.user_id
       WHERE a.doctor_id = $1 AND a.appointment_date = $2
       ORDER BY a.token_number`,
      [id, date]
    );
    res.json({ status: 'success', patients: result.rows });
  } catch (err) {
    console.error('Error fetching today\'s patients:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to fetch patients', error: err.message });
  }
};

export const markConsultationCompleted = async (req, res) => {
  const { id } = req.params; // appointment id
  try {
    const result = await pool.query(
      'UPDATE appointments SET status = $1, completed_at = NOW() WHERE appointment_id = $2 RETURNING *',
      ['completed', id]
    );
    res.json({ status: 'success', appointment: result.rows[0] });
  } catch (err) {
    console.error('Error marking consultation complete:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to mark completed', error: err.message });
  }
};

export default {
  listDoctors,
  createDoctor,
  updateCurrentToken,
  getTodaysPatients,
  markConsultationCompleted,
};
