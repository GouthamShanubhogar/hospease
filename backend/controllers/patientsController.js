import pool from '../config/db.js';

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        patient_id,
        patient_name,
        email_address,
        phone_number,
        date_of_birth,
        gender,
        blood_group,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        additional_notes,
        patient_type,
        status,
        registration_date,
        created_at,
        total_appointments
      FROM patients
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (search) {
      query += ` AND (patient_name ILIKE $${paramIndex} OR email_address ILIKE $${paramIndex} OR phone_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM patients WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;
    
    if (search) {
      countQuery += ` AND (patient_name ILIKE $${countParamIndex} OR email_address ILIKE $${countParamIndex} OR phone_number ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }
    
    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const totalPatients = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPatients / limit),
        totalPatients,
        hasNextPage: page * limit < totalPatients,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, message: 'Error fetching patients', error: error.message });
  }
};

// Create a new patient
export const createPatient = async (req, res) => {
  try {
    const {
      patient_name,
      email_address,
      phone_number,
      date_of_birth,
      gender,
      blood_group,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      additional_notes,
      patient_type = 'Outpatient'
    } = req.body;

    // Validate required fields
    if (!patient_name || !email_address || !phone_number || !date_of_birth || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, email, phone, date of birth, and gender are required'
      });
    }

    // Check if patient with same email already exists
    const existingPatient = await pool.query(
      'SELECT patient_id FROM patients WHERE email_address = $1',
      [email_address]
    );

    if (existingPatient.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A patient with this email address already exists'
      });
    }

    const query = `
      INSERT INTO patients (
        patient_name, email_address, phone_number, date_of_birth,
        gender, blood_group, address, emergency_contact_name,
        emergency_contact_phone, additional_notes, patient_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const result = await pool.query(query, [
      patient_name,
      email_address,
      phone_number,
      date_of_birth,
      gender,
      blood_group || null,
      address || null,
      emergency_contact_name || null,
      emergency_contact_phone || null,
      additional_notes || null,
      patient_type
    ]);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        message: 'A patient with this email address already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error registering patient',
        error: error.message
      });
    }
  }
};

// Get a patient by ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT * FROM patients WHERE patient_id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message
    });
  }
};

// Update a patient
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      patient_name,
      email_address,
      phone_number,
      date_of_birth,
      gender,
      blood_group,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      additional_notes,
      patient_type,
      status
    } = req.body;

    const query = `
      UPDATE patients SET
        patient_name = COALESCE($1, patient_name),
        email_address = COALESCE($2, email_address),
        phone_number = COALESCE($3, phone_number),
        date_of_birth = COALESCE($4, date_of_birth),
        gender = COALESCE($5, gender),
        blood_group = COALESCE($6, blood_group),
        address = COALESCE($7, address),
        emergency_contact_name = COALESCE($8, emergency_contact_name),
        emergency_contact_phone = COALESCE($9, emergency_contact_phone),
        additional_notes = COALESCE($10, additional_notes),
        patient_type = COALESCE($11, patient_type),
        status = COALESCE($12, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = $13
      RETURNING *
    `;

    const result = await pool.query(query, [
      patient_name,
      email_address,
      phone_number,
      date_of_birth,
      gender,
      blood_group,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      additional_notes,
      patient_type,
      status,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient',
      error: error.message
    });
  }
};

// Delete a patient (soft delete by changing status)
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE patients SET 
        status = 'Inactive',
        updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Patient deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting patient',
      error: error.message
    });
  }
};

// Search patients
export const searchPatients = async (req, res) => {
  try {
    const { query: searchQuery } = req.query;
    
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const query = `
      SELECT 
        patient_id,
        patient_name,
        email_address,
        phone_number,
        date_of_birth,
        gender,
        blood_group,
        patient_type,
        status
      FROM patients
      WHERE 
        patient_name ILIKE $1 OR 
        email_address ILIKE $1 OR 
        phone_number ILIKE $1
      AND status = 'Active'
      ORDER BY patient_name
      LIMIT 20
    `;
    
    const result = await pool.query(query, [`%${searchQuery}%`]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching patients',
      error: error.message
    });
  }
};