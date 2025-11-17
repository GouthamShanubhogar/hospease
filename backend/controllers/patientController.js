import pool from '../config/db.js';

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    // Try with appointments join
    let query = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        COUNT(DISTINCT a.appointment_id) as total_appointments
      FROM users u
      LEFT JOIN appointments a ON u.user_id = a.patient_id
      WHERE u.role = 'patient'
      GROUP BY u.user_id, u.name, u.email, u.phone, u.created_at
      ORDER BY u.created_at DESC
    `;
    
    try {
      const result = await pool.query(query);
      if (result.rows.length > 0) {
        return res.json({ success: true, data: result.rows });
      }
    } catch (err) {
      console.log('Appointments table not found, using simple query:', err.message);
    }
    
    // Fallback to simple query without joins
    const simpleQuery = `
      SELECT 
        user_id,
        name,
        email,
        phone,
        created_at,
        0 as total_appointments
      FROM users 
      WHERE role = 'patient'
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(simpleQuery);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.json({ 
      success: true, 
      data: [] 
    });
  }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT u.*, 
             (SELECT COUNT(*) FROM appointments WHERE patient_id = u.id) as total_appointments,
             (SELECT COUNT(*) FROM admissions WHERE patient_id = u.id) as total_admissions,
             (SELECT COUNT(*) FROM medical_records WHERE patient_id = u.id) as total_records
      FROM users u
      WHERE u.id = ? AND u.role = 'patient'
    `;
    
    const [patients] = await pool.query(query, [id]);
    
    if (patients.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    res.json({ success: true, data: patients[0] });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ success: false, message: 'Error fetching patient', error: error.message });
  }
};

// Create new patient
export const createPatient = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      date_of_birth,
      gender,
      address,
      blood_group,
      emergency_contact,
      emergency_contact_name,
      patient_type,
      insurance_provider,
      insurance_number,
      referring_doctor,
      notes,
      estimated_cost,
      payment_method
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !date_of_birth || !gender) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, phone, date of birth, and gender are required' 
      });
    }

    // Check if email already exists
    const emailCheck = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Insert patient
    const query = `
      INSERT INTO users (
        name, email, phone, role, created_at, updated_at
      ) VALUES ($1, $2, $3, 'patient', NOW(), NOW())
      RETURNING user_id, name, email, phone
    `;
    
    const result = await pool.query(query, [name, email, phone]);
    const patientId = result.rows[0].user_id;
    
    // Create patient profile with additional details
    try {
      const profileQuery = `
        INSERT INTO patient_profiles (
          user_id, 
          date_of_birth, 
          gender, 
          address, 
          blood_group,
          emergency_contact,
          emergency_contact_name,
          patient_type,
          insurance_provider,
          insurance_number,
          referring_doctor,
          notes,
          estimated_cost,
          payment_method,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      `;
      
      await pool.query(profileQuery, [
        patientId,
        date_of_birth,
        gender,
        address || null,
        blood_group || null,
        emergency_contact || null,
        emergency_contact_name || null,
        patient_type || 'Outpatient',
        insurance_provider || null,
        insurance_number || null,
        referring_doctor || null,
        notes || null,
        estimated_cost || 0,
        payment_method || 'later'
      ]);
    } catch (profileError) {
      console.log('Patient profile table does not exist, skipping profile creation:', profileError.message);
    }
    
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating patient', 
      error: error.message 
    });
  }
};

// Update patient
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status } = req.body;
    
    const query = `
      UPDATE users 
      SET name = ?, email = ?, phone = ?, status = ?
      WHERE id = ? AND role = 'patient'
    `;
    
    const [result] = await pool.query(query, [name, email, phone, status, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    res.json({ success: true, message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ success: false, message: 'Error updating patient', error: error.message });
  }
};

// Delete patient
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM users WHERE id = ? AND role = ?';
    const [result] = await pool.query(query, [id, 'patient']);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ success: false, message: 'Error deleting patient', error: error.message });
  }
};

// Get patient medical records
export const getPatientMedicalRecords = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT mr.*, u.name as doctor_name
      FROM medical_records mr
      LEFT JOIN users u ON mr.doctor_id = u.id
      WHERE mr.patient_id = ?
      ORDER BY mr.record_date DESC
    `;
    
    const [records] = await pool.query(query, [id]);
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ success: false, message: 'Error fetching medical records', error: error.message });
  }
};

// Get patient appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT a.*, 
             u.name as doctor_name,
             d.name as department_name
      FROM appointments a
      LEFT JOIN users u ON a.doctor_id = u.id
      LEFT JOIN departments d ON a.department_id = d.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;
    
    const [appointments] = await pool.query(query, [id]);
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
  }
};
