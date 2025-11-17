import pool from '../config/db.js';

// Get all lab reports
export const getAllLabReports = async (req, res) => {
  try {
    const { patient_id, status } = req.query;
    
    let query = `
      SELECT lr.*, 
             u.name as patient_name,
             u.email as patient_email,
             d.name as doctor_name,
             h.name as hospital_name
      FROM lab_reports lr
      LEFT JOIN users u ON lr.patient_id = u.id
      LEFT JOIN doctors doc ON lr.doctor_id = doc.id
      LEFT JOIN users d ON doc.user_id = d.id
      LEFT JOIN hospitals h ON lr.hospital_id = h.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (patient_id) {
      query += ` AND lr.patient_id = $${paramIndex++}`;
      params.push(patient_id);
    }
    
    if (status) {
      query += ` AND lr.status = $${paramIndex++}`;
      params.push(status);
    }
    
    query += ' ORDER BY lr.test_date DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching lab reports:', error);
    res.status(500).json({ success: false, message: 'Error fetching lab reports', error: error.message });
  }
};

// Get lab report by ID
export const getLabReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT lr.*, 
             u.name as patient_name,
             u.email as patient_email,
             u.phone as patient_phone,
             u.date_of_birth as patient_dob,
             u.gender as patient_gender,
             d.name as doctor_name,
             doc.specialization,
             h.name as hospital_name,
             h.address as hospital_address
      FROM lab_reports lr
      LEFT JOIN users u ON lr.patient_id = u.id
      LEFT JOIN doctors doc ON lr.doctor_id = doc.id
      LEFT JOIN users d ON doc.user_id = d.id
      LEFT JOIN hospitals h ON lr.hospital_id = h.id
      WHERE lr.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lab report not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching lab report:', error);
    res.status(500).json({ success: false, message: 'Error fetching lab report', error: error.message });
  }
};

// Create new lab report
export const createLabReport = async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      hospital_id,
      test_name,
      test_type,
      test_date,
      results,
      reference_range,
      notes
    } = req.body;
    
    const query = `
      INSERT INTO lab_reports (
        patient_id, doctor_id, hospital_id,
        test_name, test_type, test_date, results, reference_range, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'completed')
      RETURNING id
    `;
    
    const result = await pool.query(query, [
      patient_id, doctor_id, hospital_id,
      test_name, test_type, test_date, results, reference_range, notes
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Lab report created successfully',
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    console.error('Error creating lab report:', error);
    res.status(500).json({ success: false, message: 'Error creating lab report', error: error.message });
  }
};

// Update lab report
export const updateLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { results, reference_range, notes, status } = req.body;
    
    const query = `
      UPDATE lab_reports 
      SET results = $1, reference_range = $2, notes = $3, status = $4
      WHERE id = $5
    `;
    
    const result = await pool.query(query, [results, reference_range, notes, status, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Lab report not found' });
    }
    
    res.json({ success: true, message: 'Lab report updated successfully' });
  } catch (error) {
    console.error('Error updating lab report:', error);
    res.status(500).json({ success: false, message: 'Error updating lab report', error: error.message });
  }
};

// Get patient lab reports
export const getPatientLabReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const query = `
      SELECT lr.*, 
             d.name as doctor_name,
             doc.specialization,
             h.name as hospital_name
      FROM lab_reports lr
      LEFT JOIN doctors doc ON lr.doctor_id = doc.id
      LEFT JOIN users d ON doc.user_id = d.id
      LEFT JOIN hospitals h ON lr.hospital_id = h.id
      WHERE lr.patient_id = $1
      ORDER BY lr.test_date DESC
    `;
    
    const result = await pool.query(query, [patientId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching patient lab reports:', error);
    res.status(500).json({ success: false, message: 'Error fetching patient lab reports', error: error.message });
  }
};

// Get lab reports by status
export const getLabReportsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    const query = `
      SELECT lr.*, 
             u.name as patient_name,
             d.name as doctor_name,
             h.name as hospital_name
      FROM lab_reports lr
      LEFT JOIN users u ON lr.patient_id = u.id
      LEFT JOIN doctors doc ON lr.doctor_id = doc.id
      LEFT JOIN users d ON doc.user_id = d.id
      LEFT JOIN hospitals h ON lr.hospital_id = h.id
      WHERE lr.status = $1
      ORDER BY lr.test_date DESC
    `;
    
    const result = await pool.query(query, [status]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching lab reports by status:', error);
    res.status(500).json({ success: false, message: 'Error fetching lab reports by status', error: error.message });
  }
};

// Get lab report statistics
export const getLabReportStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_reports,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_reports,
        COUNT(DISTINCT test_type) as test_types_count
      FROM lab_reports
    `;
    
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching lab report stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching lab report stats', error: error.message });
  }
};

// Delete lab report
export const deleteLabReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM lab_reports WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Lab report not found' });
    }
    
    res.json({ success: true, message: 'Lab report deleted successfully' });
  } catch (error) {
    console.error('Error deleting lab report:', error);
    res.status(500).json({ success: false, message: 'Error deleting lab report', error: error.message });
  }
};
