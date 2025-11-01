import pool from '../config/db.js';

export const listAppointments = async (req, res) => {
  try {
    const { user_id, doctor_id, date } = req.query;
    const conditions = [];
    const values = [];
    let idx = 1;
    if (user_id) { conditions.push(`a.user_id = $${idx++}`); values.push(user_id); }
    if (doctor_id) { conditions.push(`a.doctor_id = $${idx++}`); values.push(doctor_id); }
    if (date) { conditions.push(`a.appointment_date = $${idx++}`); values.push(date); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT a.*, u.name as patient_name, d.name as doctor_name
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
      ${where}
      ORDER BY a.appointment_date, a.token_number`;
  const result = await pool.query(query, values);
  // Return array directly for frontend list usage
  res.json(result.rows);
  } catch (err) {
    console.error('Error listing appointments:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to list appointments', error: err.message });
  }
};

export const createAppointment = async (req, res) => {
  const { user_id, doctor_id, hospital_id, preferred_time } = req.body;
  if (!user_id || !doctor_id || !hospital_id) return res.status(400).json({ status: 'error', message: 'user_id, doctor_id and hospital_id are required' });
  try {
    const appointment_date = (preferred_time && preferred_time.slice(0,10)) || new Date().toISOString().slice(0,10);
    // Get max token for doctor for that date
    const maxRes = await pool.query(
      'SELECT MAX(token_number) as max FROM appointments WHERE doctor_id = $1 AND appointment_date = $2',
      [doctor_id, appointment_date]
    );
    const nextToken = (maxRes.rows[0].max || 0) + 1;

    const insertRes = await pool.query(
      `INSERT INTO appointments (user_id, doctor_id, hospital_id, token_number, appointment_date, preferred_time, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING *`,
      [user_id, doctor_id, hospital_id, nextToken, appointment_date, preferred_time || null, 'booked']
    );

    const appointment = insertRes.rows[0];

    // Emit socket events to doctor room and user room
    const io = req.app.get('io');
    if (io) {
      io.to(`doctor_${doctor_id}`).emit('new_appointment', appointment);
      io.to(`user_${user_id}`).emit('appointment_created', appointment);
    }

    res.status(201).json({ status: 'success', appointment, token_number: nextToken });
  } catch (err) {
    console.error('Error creating appointment:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to create appointment', error: err.message });
  }
};

export const getAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM appointments WHERE appointment_id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    res.json({ status: 'success', appointment: result.rows[0] });
  } catch (err) {
    console.error('Error fetching appointment:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to fetch appointment', error: err.message });
  }
};

export default {
  listAppointments,
  createAppointment,
  getAppointment,
};
