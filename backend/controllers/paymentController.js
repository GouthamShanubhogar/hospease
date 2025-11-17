import pool from '../config/db.js';

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const { status, patient_id, payment_method } = req.query;
    
    let query = `
      SELECT p.*, 
             u.name as patient_name,
             u.email as patient_email,
             u.phone as patient_phone,
             h.name as hospital_name
      FROM payments p
      LEFT JOIN users u ON p.patient_id = u.id
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (status) {
      query += ` AND p.status = $${paramIndex++}`;
      params.push(status);
    }
    
    if (patient_id) {
      query += ` AND p.patient_id = $${paramIndex++}`;
      params.push(patient_id);
    }
    
    if (payment_method) {
      query += ` AND p.payment_method = $${paramIndex++}`;
      params.push(payment_method);
    }
    
    query += ' ORDER BY p.payment_date DESC';
    
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Error fetching payments', error: error.message });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT p.*, 
             u.name as patient_name,
             u.email as patient_email,
             u.phone as patient_phone,
             u.address as patient_address,
             h.name as hospital_name,
             h.address as hospital_address
      FROM payments p
      LEFT JOIN users u ON p.patient_id = u.id
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      WHERE p.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ success: false, message: 'Error fetching payment', error: error.message });
  }
};

// Create new payment
export const createPayment = async (req, res) => {
  try {
    const {
      patient_id,
      hospital_id,
      appointment_id,
      admission_id,
      amount,
      payment_method,
      payment_date,
      description
    } = req.body;
    
    const query = `
      INSERT INTO payments (
        patient_id, hospital_id, appointment_id, admission_id,
        amount, payment_method, payment_date, description, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed')
      RETURNING id
    `;
    
    const result = await pool.query(query, [
      patient_id, hospital_id, appointment_id, admission_id,
      amount, payment_method, payment_date, description
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: 'Error creating payment', error: error.message });
  }
};

// Update payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_method, amount } = req.body;
    
    const query = `
      UPDATE payments 
      SET status = $1, payment_method = $2, amount = $3
      WHERE id = $4
    `;
    
    const result = await pool.query(query, [status, payment_method, amount, id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    res.json({ success: true, message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ success: false, message: 'Error updating payment', error: error.message });
  }
};

// Get patient payments
export const getPatientPayments = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const query = `
      SELECT p.*, 
             h.name as hospital_name,
             a.appointment_date,
             adm.admission_date
      FROM payments p
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      LEFT JOIN appointments a ON p.appointment_id = a.id
      LEFT JOIN admissions adm ON p.admission_id = adm.id
      WHERE p.patient_id = $1
      ORDER BY p.payment_date DESC
    `;
    
    const result = await pool.query(query, [patientId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching patient payments:', error);
    res.status(500).json({ success: false, message: 'Error fetching patient payments', error: error.message });
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_revenue,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as completed_revenue,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_revenue,
        AVG(amount) as average_payment,
        COUNT(CASE WHEN payment_method = 'cash' THEN 1 END) as cash_payments,
        COUNT(CASE WHEN payment_method = 'card' THEN 1 END) as card_payments,
        COUNT(CASE WHEN payment_method = 'insurance' THEN 1 END) as insurance_payments
      FROM payments
    `;
    
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching payment stats', error: error.message });
  }
};

// Get monthly revenue
export const getMonthlyRevenue = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(payment_date, 'YYYY-MM') as month,
        SUM(amount) as revenue,
        COUNT(*) as payment_count
      FROM payments
      WHERE status = 'completed'
      GROUP BY TO_CHAR(payment_date, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `;
    
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ success: false, message: 'Error fetching monthly revenue', error: error.message });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM payments WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, message: 'Error deleting payment', error: error.message });
  }
};
