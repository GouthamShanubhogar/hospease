import pool from '../config/db.js';

// Get all prescriptions
export const getAllPrescriptions = async (req, res) => {
  try {
    const { patient_id, doctor_id } = req.query;
    
    let query = `
      SELECT pr.*, 
             u.name as patient_name,
             d.name as doctor_name,
             dept.name as department_name
      FROM prescriptions pr
      LEFT JOIN users u ON pr.patient_id = u.id
      LEFT JOIN doctors doc ON pr.doctor_id = doc.id
      LEFT JOIN users d ON doc.user_id = d.id
      LEFT JOIN departments dept ON doc.department_id = dept.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (patient_id) {
      query += ` AND pr.patient_id = $${paramIndex++}`;
      params.push(patient_id);
    }
    
    if (doctor_id) {
      query += ` AND pr.doctor_id = $${paramIndex++}`;
      params.push(doctor_id);
    }
    
    query += ' ORDER BY pr.prescription_date DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ success: false, message: 'Error fetching prescriptions', error: error.message });
  }
};

// Get prescription by ID
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT pr.*, 
             u.name as patient_name,
             u.email as patient_email,
             u.phone as patient_phone,
             u.date_of_birth as patient_dob,
             u.gender as patient_gender,
             d.name as doctor_name,
             doc.specialization,
             dept.name as department_name,
             h.name as hospital_name
      FROM prescriptions pr
      LEFT JOIN users u ON pr.patient_id = u.id
      LEFT JOIN doctors doc ON pr.doctor_id = doc.id
      LEFT JOIN users d ON doc.user_id = d.id
      LEFT JOIN departments dept ON doc.department_id = dept.id
      LEFT JOIN hospitals h ON doc.hospital_id = h.id
      WHERE pr.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ success: false, message: 'Error fetching prescription', error: error.message });
  }
};

// Create new prescription
export const createPrescription = async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      appointment_id,
      admission_id,
      prescription_date,
      medications,
      dosage,
      instructions,
      diagnosis,
      notes
    } = req.body;
    
    const query = `
      INSERT INTO prescriptions (
        patient_id, doctor_id, appointment_id, admission_id,
        prescription_date, medications, dosage, instructions, diagnosis, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;
    
    const result = await pool.query(query, [
      patient_id, doctor_id, appointment_id, admission_id,
      prescription_date, medications, dosage, instructions, diagnosis, notes
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ success: false, message: 'Error creating prescription', error: error.message });
  }
};

// Update prescription
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { medications, dosage, instructions, notes } = req.body;
    
    const query = `
      UPDATE prescriptions 
      SET medications = $1, dosage = $2, instructions = $3, notes = $4
      WHERE id = $5
    `;
    
    const result = await pool.query(query, [medications, dosage, instructions, notes, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    
    res.json({ success: true, message: 'Prescription updated successfully' });
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ success: false, message: 'Error updating prescription', error: error.message });
  }
};

// Get patient prescriptions
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const query = `
      SELECT pr.*, 
             d.name as doctor_name,
             doc.specialization,
             dept.name as department_name,
             a.appointment_date
      FROM prescriptions pr
      LEFT JOIN doctors doc ON pr.doctor_id = doc.id
      LEFT JOIN users d ON doc.user_id = d.id
      LEFT JOIN departments dept ON doc.department_id = dept.id
      LEFT JOIN appointments a ON pr.appointment_id = a.id
      WHERE pr.patient_id = $1
      ORDER BY pr.prescription_date DESC
    `;
    
    const result = await pool.query(query, [patientId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({ success: false, message: 'Error fetching patient prescriptions', error: error.message });
  }
};

// Get doctor prescriptions
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const query = `
      SELECT pr.*, 
             u.name as patient_name,
             u.email as patient_email,
             u.phone as patient_phone,
             a.appointment_date
      FROM prescriptions pr
      LEFT JOIN users u ON pr.patient_id = u.id
      LEFT JOIN appointments a ON pr.appointment_id = a.id
      WHERE pr.doctor_id = $1
      ORDER BY pr.prescription_date DESC
    `;
    
    const result = await pool.query(query, [doctorId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching doctor prescriptions:', error);
    res.status(500).json({ success: false, message: 'Error fetching doctor prescriptions', error: error.message });
  }
};

// Delete prescription
export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM prescriptions WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    
    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ success: false, message: 'Error deleting prescription', error: error.message });
  }
};
