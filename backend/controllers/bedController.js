import pool from '../config/db.js';

// Get all beds
export const getAllBeds = async (req, res) => {
  try {
    const { status, hospital_id, ward_type } = req.query;
    
    let query = `
      SELECT b.*, 
             h.name as hospital_name,
             d.name as department_name,
             u.name as patient_name
      FROM beds b
      LEFT JOIN hospitals h ON b.hospital_id = h.id
      LEFT JOIN departments d ON b.department_id = d.id
      LEFT JOIN users u ON b.patient_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    
    if (status) {
      query += ` AND b.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (hospital_id) {
      query += ` AND b.hospital_id = $${paramIndex++}`;
      params.push(hospital_id);
    }
    
    if (ward_type) {
      query += ` AND b.ward_type = $${paramIndex++}`;
      params.push(ward_type);
    }
    
    query += ' ORDER BY b.bed_number';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching beds:', error);
    res.status(500).json({ success: false, message: 'Error fetching beds', error: error.message });
  }
};

// Get bed availability stats
export const getBedStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_beds,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_beds,
        SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_beds,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_beds,
        ward_type
      FROM beds
      GROUP BY ward_type
    `;
    
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching bed stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching bed stats', error: error.message });
  }
};

// Assign bed to patient
export const assignBed = async (req, res) => {
  try {
    const { id } = req.params;
    const { patient_id } = req.body;
    
    const query = `
      UPDATE beds 
      SET patient_id = $1, status = 'occupied', assigned_date = NOW()
      WHERE id = $2 AND status = 'available'
    `;
    
    const result = await pool.query(query, [patient_id, id]);
    
    if (result.rowCount === 0) {
      return res.status(400).json({ success: false, message: 'Bed not available or not found' });
    }
    
    res.json({ success: true, message: 'Bed assigned successfully' });
  } catch (error) {
    console.error('Error assigning bed:', error);
    res.status(500).json({ success: false, message: 'Error assigning bed', error: error.message });
  }
};

// Release bed
export const releaseBed = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE beds 
      SET patient_id = NULL, status = 'available', assigned_date = NULL
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }
    
    res.json({ success: true, message: 'Bed released successfully' });
  } catch (error) {
    console.error('Error releasing bed:', error);
    res.status(500).json({ success: false, message: 'Error releasing bed', error: error.message });
  }
};

// Create new bed
export const createBed = async (req, res) => {
  try {
    const { bed_number, hospital_id, department_id, ward_type } = req.body;
    
    const query = `
      INSERT INTO beds (bed_number, hospital_id, department_id, ward_type, status)
      VALUES ($1, $2, $3, $4, 'available')
      RETURNING id
    `;
    
    const result = await pool.query(query, [bed_number, hospital_id, department_id, ward_type]);
    
    res.status(201).json({
      success: true,
      message: 'Bed created successfully',
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    console.error('Error creating bed:', error);
    res.status(500).json({ success: false, message: 'Error creating bed', error: error.message });
  }
};

// Update bed
export const updateBed = async (req, res) => {
  try {
    const { id } = req.params;
    const { bed_number, ward_type, status, department_id } = req.body;
    
    const query = `
      UPDATE beds 
      SET bed_number = $1, ward_type = $2, status = $3, department_id = $4
      WHERE id = $5
    `;
    
    const result = await pool.query(query, [bed_number, ward_type, status, department_id, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }
    
    res.json({ success: true, message: 'Bed updated successfully' });
  } catch (error) {
    console.error('Error updating bed:', error);
    res.status(500).json({ success: false, message: 'Error updating bed', error: error.message });
  }
};

// Delete bed
export const deleteBed = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if bed is occupied
    const bedResult = await pool.query('SELECT status FROM beds WHERE id = $1', [id]);
    
    if (bedResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }
    
    if (bedResult.rows[0].status === 'occupied') {
      return res.status(400).json({ success: false, message: 'Cannot delete occupied bed' });
    }
    
    const query = 'DELETE FROM beds WHERE id = $1';
    await pool.query(query, [id]);
    
    res.json({ success: true, message: 'Bed deleted successfully' });
  } catch (error) {
    console.error('Error deleting bed:', error);
    res.status(500).json({ success: false, message: 'Error deleting bed', error: error.message });
  }
};
