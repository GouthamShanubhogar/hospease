import pool from '../config/db.js';

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const { hospital_id, department_id, specialization } = req.query;
    
    // Use the doctors table directly
    let query = `
      SELECT 
        id as doctor_id,
        name,
        email,
        phone,
        specialty as specialization,
        sub_specialty,
        experience_years,
        location,
        qualification,
        consultation_fee,
        rating,
        status,
        available_today,
        available_tomorrow,
        available_this_week,
        bio
      FROM doctors
      WHERE status = 'active'
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (hospital_id) {
      query += ` AND hospital_id = $${paramIndex++}`;
      params.push(hospital_id);
    }
    
    if (department_id) {
      query += ` AND department_id = $${paramIndex++}`;
      params.push(department_id);
    }
    
    if (specialization) {
      query += ` AND specialty ILIKE $${paramIndex++}`;
      params.push(`%${specialization}%`);
    }
    
    query += ' ORDER BY name';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.json({ 
      success: false, 
      message: 'Error fetching doctors',
      data: [] 
    });
  }
};

// Legacy endpoint for backward compatibility
export const listDoctors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, 
              u.name as doctor_name,
              h.name as hospital_name
       FROM doctors d
       LEFT JOIN users u ON d.user_id = u.id
       LEFT JOIN hospitals h ON d.hospital_id = h.id
       ORDER BY u.name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error listing doctors:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to list doctors', error: err.message });
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM doctors WHERE id = $1 AND status = $2', [id, 'active']);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ success: false, message: 'Error fetching doctor', error: error.message });
  }
};

export const createDoctor = async (req, res) => {
  try {
    const { user_id, hospital_id, department_id, specialization, qualification, experience_years } = req.body;
    
    if (!user_id || !hospital_id) {
      return res.status(400).json({ success: false, message: 'user_id and hospital_id are required' });
    }
    
    const query = `
      INSERT INTO doctors (user_id, hospital_id, department_id, specialization, qualification, experience_years)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [user_id, hospital_id, department_id, specialization, qualification, experience_years]);
    
    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ success: false, message: 'Error creating doctor', error: error.message });
  }
};

// Update doctor
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { department_id, specialization, qualification, experience_years } = req.body;
    
    const query = `
      UPDATE doctors 
      SET department_id = $1, specialization = $2, qualification = $3, experience_years = $4
      WHERE id = $5
      RETURNING *
    `;
    
    const result = await pool.query(query, [department_id, specialization, qualification, experience_years, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    res.json({ success: true, message: 'Doctor updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ success: false, message: 'Error updating doctor', error: error.message });
  }
};

// Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM doctors WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ success: false, message: 'Error deleting doctor', error: error.message });
  }
};

// Get doctor schedule
export const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const query = `
      SELECT ss.*, 
             u.name as doctor_name,
             d.specialization,
             h.name as hospital_name
      FROM staff_schedules ss
      LEFT JOIN doctors doc ON ss.doctor_id = doc.id
      LEFT JOIN users u ON doc.user_id = u.id
      LEFT JOIN doctors d ON ss.doctor_id = d.id
      LEFT JOIN hospitals h ON ss.hospital_id = h.id
      WHERE ss.doctor_id = $1
      ORDER BY ss.day_of_week, ss.start_time
    `;
    
    const result = await pool.query(query, [doctorId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    res.status(500).json({ success: false, message: 'Error fetching doctor schedule', error: error.message });
  }
};

// Get doctor appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, date } = req.query;
    
    let query = `
      SELECT a.*, 
             u.name as patient_name,
             u.email as patient_email,
             u.phone as patient_phone,
             h.name as hospital_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.doctor_id = $1
    `;
    
    const params = [doctorId];
    let paramIndex = 2;
    
    if (status) {
      query += ` AND a.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (date) {
      query += ` AND a.appointment_date = $${paramIndex++}`;
      params.push(date);
    }
    
    query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ success: false, message: 'Error fetching doctor appointments', error: error.message });
  }
};

// Get doctors by specialization
export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    
    const query = `
      SELECT d.*, 
             u.name as doctor_name,
             u.email,
             u.phone,
             dept.name as department_name,
             h.name as hospital_name
      FROM doctors d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      LEFT JOIN hospitals h ON d.hospital_id = h.id
      WHERE d.specialization ILIKE $1
      ORDER BY u.name
    `;
    
    const result = await pool.query(query, [`%${specialization}%`]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching doctors by specialization:', error);
    res.status(500).json({ success: false, message: 'Error fetching doctors by specialization', error: error.message });
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
