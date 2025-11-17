import pool from '../config/db.js';

// Get all admissions
export const getAllAdmissions = async (req, res) => {
  try {
    const { status, hospital_id } = req.query;
    
    let query = `
      SELECT a.*, 
             u.name as patient_name,
             u.email as patient_email,
             u.phone as patient_phone,
             d.name as doctor_name,
             dept.name as department_name,
             h.name as hospital_name,
             b.bed_number,
             b.ward_type
      FROM admissions a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN doctors doc ON a.doctor_id = doc.id
      LEFT JOIN users d ON doc.user_id = d.id
      LEFT JOIN departments dept ON a.department_id = dept.id
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      LEFT JOIN beds b ON a.bed_id = b.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (status) {
      query += ` AND a.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (hospital_id) {
      query += ` AND a.hospital_id = $${paramIndex++}`;
      params.push(hospital_id);
    }
    
    query += ' ORDER BY a.admission_date DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({ success: false, message: 'Error fetching admissions', error: error.message });
  }
};

// Get admission by ID
export const getAdmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT a.*, 
             u.name as patient_name,
             u.email as patient_email,
             u.phone as patient_phone,
             u.date_of_birth as patient_dob,
             u.gender as patient_gender,
             u.address as patient_address,
             d.name as doctor_name,
             dept.name as department_name,
             h.name as hospital_name,
             h.address as hospital_address,
             b.bed_number,
             b.ward_type
      FROM admissions a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN doctors doc ON a.doctor_id = doc.id
      LEFT JOIN users d ON doc.user_id = d.id
      LEFT JOIN departments dept ON a.department_id = dept.id
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      LEFT JOIN beds b ON a.bed_id = b.id
      WHERE a.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching admission:', error);
    res.status(500).json({ success: false, message: 'Error fetching admission', error: error.message });
  }
};

// Create new admission
export const createAdmission = async (req, res) => {
  try {
    const {
      patient_id,
      hospital_id,
      doctor_id,
      department_id,
      bed_id,
      admission_date,
      admission_type,
      reason,
      diagnosis
    } = req.body;
    
    // Check if bed is available
    const bedResult = await pool.query('SELECT status FROM beds WHERE id = $1', [bed_id]);
    
    if (bedResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }
    
    if (bedResult.rows[0].status !== 'available') {
      return res.status(400).json({ success: false, message: 'Bed is not available' });
    }
    
    // Create admission
    const admissionQuery = `
      INSERT INTO admissions (
        patient_id, hospital_id, doctor_id, department_id, bed_id,
        admission_date, admission_type, reason, diagnosis, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
      RETURNING id
    `;
    
    const result = await pool.query(admissionQuery, [
      patient_id, hospital_id, doctor_id, department_id, bed_id,
      admission_date, admission_type, reason, diagnosis
    ]);
    
    // Assign bed to patient
    await pool.query(
      'UPDATE beds SET patient_id = $1, status = $2, assigned_date = NOW() WHERE id = $3',
      [patient_id, 'occupied', bed_id]
    );
    
    res.status(201).json({
      success: true,
      message: 'Admission created successfully',
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    console.error('Error creating admission:', error);
    res.status(500).json({ success: false, message: 'Error creating admission', error: error.message });
  }
};

// Update admission
export const updateAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctor_id, department_id, diagnosis, status } = req.body;
    
    const query = `
      UPDATE admissions 
      SET doctor_id = $1, department_id = $2, diagnosis = $3, status = $4
      WHERE id = $5
    `;
    
    const result = await pool.query(query, [doctor_id, department_id, diagnosis, status, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }
    
    res.json({ success: true, message: 'Admission updated successfully' });
  } catch (error) {
    console.error('Error updating admission:', error);
    res.status(500).json({ success: false, message: 'Error updating admission', error: error.message });
  }
};

// Discharge patient
export const dischargePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { discharge_date, discharge_summary, discharge_instructions, follow_up_date } = req.body;
    
    // Get admission details
    const admissionResult = await pool.query(
      'SELECT patient_id, bed_id, hospital_id, doctor_id, department_id FROM admissions WHERE id = $1',
      [id]
    );
    
    if (admissionResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }
    
    const { patient_id, bed_id, hospital_id, doctor_id, department_id } = admissionResult.rows[0];
    
    // Create discharge record
    const dischargeQuery = `
      INSERT INTO discharges (
        admission_id, patient_id, hospital_id, doctor_id, department_id,
        discharge_date, discharge_summary, discharge_instructions, follow_up_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    await pool.query(dischargeQuery, [
      id, patient_id, hospital_id, doctor_id, department_id,
      discharge_date, discharge_summary, discharge_instructions, follow_up_date
    ]);
    
    // Update admission status
    await pool.query('UPDATE admissions SET status = $1 WHERE id = $2', ['discharged', id]);
    
    // Release bed
    await pool.query(
      'UPDATE beds SET patient_id = NULL, status = $1, assigned_date = NULL WHERE id = $2',
      ['available', bed_id]
    );
    
    res.json({ success: true, message: 'Patient discharged successfully' });
  } catch (error) {
    console.error('Error discharging patient:', error);
    res.status(500).json({ success: false, message: 'Error discharging patient', error: error.message });
  }
};

// Get admission statistics
export const getAdmissionStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_admissions,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_admissions,
        SUM(CASE WHEN status = 'discharged' THEN 1 ELSE 0 END) as discharged_admissions,
        SUM(CASE WHEN admission_type = 'emergency' THEN 1 ELSE 0 END) as emergency_admissions,
        AVG(EXTRACT(DAY FROM (CURRENT_DATE - admission_date))) as avg_stay_days
      FROM admissions
      WHERE status = 'active'
    `;
    
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching admission stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching admission stats', error: error.message });
  }
};

// Delete admission
export const deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get admission details
    const admissionResult = await pool.query('SELECT bed_id, status FROM admissions WHERE id = $1', [id]);
    
    if (admissionResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }
    
    if (admissionResult.rows[0].status === 'active') {
      return res.status(400).json({ success: false, message: 'Cannot delete active admission. Discharge patient first.' });
    }
    
    // Delete admission
    await pool.query('DELETE FROM admissions WHERE id = $1', [id]);
    
    res.json({ success: true, message: 'Admission deleted successfully' });
  } catch (error) {
    console.error('Error deleting admission:', error);
    res.status(500).json({ success: false, message: 'Error deleting admission', error: error.message });
  }
};
