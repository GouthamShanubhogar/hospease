import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    // Use the patients table directly
    const query = `
      SELECT 
        patient_id as id,
        patient_name,
        email_address as email,
        phone_number as phone,
        date_of_birth,
        gender,
        blood_group,
        address,
        patient_type,
        status,
        total_appointments,
        created_at
      FROM patients 
      WHERE status = 'Active'
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.json({ 
      success: false, 
      message: 'Error fetching patients',
      data: [] 
    });
  }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to get patient with profile data first
    let query = `
      SELECT u.id, u.name as patient_name, u.email, u.phone, u.created_at,
             p.date_of_birth, p.gender, p.address, p.blood_group,
             p.emergency_contact, p.emergency_contact_name,
             p.patient_type, p.insurance_provider, p.insurance_number,
             p.referring_doctor, p.medical_notes,
             (SELECT COUNT(*) FROM appointments WHERE patient_id = u.id) as total_appointments
      FROM users u
      LEFT JOIN patient_profiles p ON u.id = p.user_id
      WHERE u.id = $1 AND u.role = 'patient'
    `;
    
    let result;
    try {
      result = await pool.query(query, [id]);
    } catch (error) {
      // If patient_profiles table doesn't exist, use basic query
      console.log('Patient profiles table not found, using basic query:', error.message);
      query = `
        SELECT u.id, u.name as patient_name, u.email, u.phone, u.created_at,
               null as date_of_birth, null as gender, null as address, null as blood_group,
               null as emergency_contact, null as emergency_contact_name,
               null as patient_type, null as insurance_provider, null as insurance_number,
               null as referring_doctor, null as medical_notes,
               (SELECT COUNT(*) FROM appointments WHERE patient_id = u.id) as total_appointments
        FROM users u
        WHERE u.id = $1 AND u.role = 'patient'
      `;
      result = await pool.query(query, [id]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
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
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Generate a default password for patient (they can change it later)
    const defaultPassword = await bcrypt.hash('patient123', 10);
    
    // Insert patient
    const query = `
      INSERT INTO users (
        name, email, phone, password, role, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, 'patient', NOW(), NOW())
      RETURNING id, name, email, phone
    `;
    
    const result = await pool.query(query, [name, email, phone, defaultPassword]);
    const patientId = result.rows[0].id;
    
    // Create patient profile with additional details
    try {
      console.log('Creating patient profile for user ID:', patientId);
      console.log('Profile data:', {
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
        notes
      });
      
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
          medical_notes,
          estimated_cost,
          payment_method,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      `;
      
      const profileResult = await pool.query(profileQuery, [
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
      
      console.log('Profile created successfully:', profileResult.rowCount);
    } catch (profileError) {
      console.error('Patient profile creation error:', profileError);
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
    const { 
      patientName, 
      email, 
      contact, 
      dateOfBirth,
      gender,
      address,
      bloodGroup,
      emergencyContact,
      emergencyContactName,
      insuranceProvider,
      insuranceNumber,
      notes
    } = req.body;
    
    // Update basic user information
    const userQuery = `
      UPDATE users 
      SET name = $1, email = $2, phone = $3, updated_at = NOW()
      WHERE id = $4 AND role = 'patient'
    `;
    
    const userResult = await pool.query(userQuery, [patientName, email, contact, id]);
    
    if (userResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    // Try to update patient profile (if table exists)
    try {
      const profileQuery = `
        INSERT INTO patient_profiles (
          user_id, date_of_birth, gender, address, blood_group,
          emergency_contact, emergency_contact_name,
          insurance_provider, insurance_number, medical_notes, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          date_of_birth = EXCLUDED.date_of_birth,
          gender = EXCLUDED.gender,
          address = EXCLUDED.address,
          blood_group = EXCLUDED.blood_group,
          emergency_contact = EXCLUDED.emergency_contact,
          emergency_contact_name = EXCLUDED.emergency_contact_name,
          insurance_provider = EXCLUDED.insurance_provider,
          insurance_number = EXCLUDED.insurance_number,
          medical_notes = EXCLUDED.medical_notes,
          updated_at = NOW()
      `;
      
      await pool.query(profileQuery, [
        id,
        dateOfBirth || null,
        gender || null,
        address || null,
        bloodGroup || null,
        emergencyContact || null,
        emergencyContactName || null,
        insuranceProvider || null,
        insuranceNumber || null,
        notes || null
      ]);
    } catch (profileError) {
      console.log('Patient profile update failed (table may not exist):', profileError.message);
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
