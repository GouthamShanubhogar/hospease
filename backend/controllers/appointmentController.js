import pool from '../config/db.js';

// Get all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const { patient_id, doctor_id, status, date } = req.query;
    
    let query = `
      SELECT a.*, 
             p.patient_name,
             p.email_address as patient_email,
             p.phone_number as patient_phone,
             d.name as doctor_name,
             d.specialty as specialization,
             a.token_number
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.patient_id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (patient_id) {
      query += ` AND a.patient_id = $${paramIndex++}`;
      params.push(patient_id);
    }
    
    if (doctor_id) {
      query += ` AND a.doctor_id = $${paramIndex++}`;
      params.push(doctor_id);
    }
    
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
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
  }
};

// Legacy endpoint for backward compatibility
export const listAppointments = async (req, res) => {
  try {
    const { user_id, doctor_id, date } = req.query;
    const conditions = [];
    const values = [];
    let idx = 1;
    if (user_id) { conditions.push(`a.patient_id = $${idx++}`); values.push(user_id); }
    if (doctor_id) { conditions.push(`a.doctor_id = $${idx++}`); values.push(doctor_id); }
    if (date) { conditions.push(`a.appointment_date = $${idx++}`); values.push(date); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT a.*, u.name as patient_name, d.name as doctor_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN doctors doc ON a.doctor_id = doc.id
      LEFT JOIN users d ON doc.user_id = d.id
      ${where}
      ORDER BY a.appointment_date, a.appointment_time`;
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error listing appointments:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to list appointments', error: err.message });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT a.*, 
             u.name as patient_name,
             u.email as patient_email,
             u.phone as patient_phone,
             u.date_of_birth as patient_dob,
             u.gender as patient_gender,
             d.name as doctor_name,
             doc.specialization,
             dept.name as department_name,
             h.name as hospital_name,
             h.address as hospital_address
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN doctors doc ON a.doctor_id = doc.id
      LEFT JOIN users d ON doc.user_id = d.id
      LEFT JOIN departments dept ON a.department_id = dept.id
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ success: false, message: 'Error fetching appointment', error: error.message });
  }
};

// Create new appointment
export const createAppointment = async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      hospital_id,
      department_id,
      appointment_date,
      appointment_time,
      preferred_time,
      reason,
      notes,
      status
    } = req.body;
    
    if (!patient_id || !doctor_id) {
      return res.status(400).json({ success: false, message: 'patient_id and doctor_id are required' });
    }

    // Use preferred_time if appointment_time is not provided
    const time = appointment_time || preferred_time;
    
    // Use default hospital_id if not provided
    const finalHospitalId = hospital_id || null;
    
    // Generate token number for the appointment
    // Get the highest token number for this doctor on this date
    const tokenQuery = `
      SELECT COALESCE(MAX(token_number), 0) + 1 as next_token
      FROM appointments
      WHERE doctor_id = $1 AND appointment_date = $2
    `;
    
    const tokenResult = await pool.query(tokenQuery, [doctor_id, appointment_date]);
    const token_number = tokenResult.rows[0].next_token;
    
    const query = `
      INSERT INTO appointments (
        patient_id, doctor_id, hospital_id, department_id,
        appointment_date, appointment_time, token_number, reason, notes, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      patient_id, 
      doctor_id, 
      finalHospitalId, 
      department_id || null,
      appointment_date, 
      time, 
      token_number, 
      reason || 'General consultation', 
      notes || null,
      status || 'booked'
    ]);
    
    const appointment = result.rows[0];
    
    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      io.to(`doctor_${doctor_id}`).emit('new_appointment', appointment);
      io.to(`user_${patient_id}`).emit('appointment_created', {
        ...appointment,
        message: `Your appointment is scheduled. Your token number is ${token_number}.`
      });
    }
    
    res.status(201).json({
      success: true,
      message: `Appointment created successfully. Token number: ${token_number}`,
      data: appointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, message: 'Error creating appointment', error: error.message });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_date, appointment_time, status, reason, notes } = req.body;
    
    const query = `
      UPDATE appointments 
      SET appointment_date = $1, appointment_time = $2, status = $3, reason = $4, notes = $5
      WHERE id = $6
      RETURNING *
    `;
    
    const result = await pool.query(query, [appointment_date, appointment_time, status, reason, notes, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({ success: true, message: 'Appointment updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ success: false, message: 'Error updating appointment', error: error.message });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, ['cancelled', id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ success: false, message: 'Error cancelling appointment', error: error.message });
  }
};

// Confirm appointment
export const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, ['confirmed', id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({ success: true, message: 'Appointment confirmed successfully' });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ success: false, message: 'Error confirming appointment', error: error.message });
  }
};

// Complete appointment
export const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE appointments 
      SET status = $1, completed_at = CURRENT_TIMESTAMP
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, ['completed', id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    const appointment = result.rows[0];
    
    // Emit socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${appointment.patient_id}`).emit('appointment_completed', {
        message: 'Your appointment has been completed. Thank you!',
        appointment: appointment
      });
    }
    
    res.json({ success: true, message: 'Appointment completed successfully', data: appointment });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ success: false, message: 'Error completing appointment', error: error.message });
  }
};

// Get appointments by date
export const getAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    const query = `
      SELECT a.*, 
             u.name as patient_name,
             d.name as doctor_name,
             h.name as hospital_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN doctors doc ON a.doctor_id = doc.id
      LEFT JOIN users d ON doc.user_id = d.id
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.appointment_date = $1
      ORDER BY a.appointment_time
    `;
    
    const result = await pool.query(query, [date]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching appointments by date:', error);
    res.status(500).json({ success: false, message: 'Error fetching appointments by date', error: error.message });
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

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM appointments WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ success: false, message: 'Error deleting appointment', error: error.message });
  }
};

// ============================================
// TOKEN QUEUE MANAGEMENT & NOTIFICATIONS
// ============================================

// Get current token being served by doctor
export const getCurrentToken = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    const today = date || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT current_token 
      FROM doctors 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [doctorId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    const currentToken = result.rows[0].current_token || 0;
    
    // Get details of appointments in queue
    const queueQuery = `
      SELECT a.*, u.name as patient_name, u.phone as patient_phone
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      WHERE a.doctor_id = $1 
        AND a.appointment_date = $2
        AND a.status IN ('scheduled', 'confirmed')
      ORDER BY a.token_number ASC
    `;
    
    const queueResult = await pool.query(queueQuery, [doctorId, today]);
    
    res.json({
      success: true,
      data: {
        currentToken,
        totalAppointments: queueResult.rows.length,
        queue: queueResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching current token:', error);
    res.status(500).json({ success: false, message: 'Error fetching current token', error: error.message });
  }
};

// Advance to next token
export const advanceToken = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    const today = date || new Date().toISOString().split('T')[0];
    
    // Get current token
    const doctorResult = await pool.query('SELECT current_token FROM doctors WHERE id = $1', [doctorId]);
    
    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    const currentToken = doctorResult.rows[0].current_token || 0;
    const nextToken = currentToken + 1;
    
    // Update doctor's current token
    await pool.query('UPDATE doctors SET current_token = $1 WHERE id = $2', [nextToken, doctorId]);
    
    // Mark current appointment as in-progress
    await pool.query(`
      UPDATE appointments 
      SET status = 'in-progress' 
      WHERE doctor_id = $1 
        AND appointment_date = $2 
        AND token_number = $3
        AND status IN ('scheduled', 'confirmed')
    `, [doctorId, today, nextToken]);
    
    // Get the current and next appointments
    const currentAppointment = await pool.query(`
      SELECT a.*, u.name as patient_name, u.phone as patient_phone, u.email as patient_email
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      WHERE a.doctor_id = $1 
        AND a.appointment_date = $2 
        AND a.token_number = $3
    `, [doctorId, today, nextToken]);
    
    const nextAppointments = await pool.query(`
      SELECT a.*, u.name as patient_name, u.phone as patient_phone, u.email as patient_email
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      WHERE a.doctor_id = $1 
        AND a.appointment_date = $2 
        AND a.token_number IN ($3, $4)
        AND a.status IN ('scheduled', 'confirmed')
      ORDER BY a.token_number ASC
    `, [doctorId, today, nextToken + 1, nextToken + 2]);
    
    // Emit socket notifications
    const io = req.app.get('io');
    if (io) {
      // Notify current patient
      if (currentAppointment.rows.length > 0) {
        const current = currentAppointment.rows[0];
        io.to(`user_${current.patient_id}`).emit('your_turn', {
          message: 'It\'s your turn! Please proceed to the consultation room.',
          appointment: current,
          token: nextToken
        });
      }
      
      // Notify next 2 patients
      nextAppointments.rows.forEach((appointment, index) => {
        const position = index + 1;
        io.to(`user_${appointment.patient_id}`).emit('turn_approaching', {
          message: `Your turn is ${position === 1 ? 'next' : `in ${position} patients`}. Please be ready.`,
          appointment: appointment,
          position: position
        });
      });
      
      // Broadcast queue update to all connected clients
      io.emit('queue_updated', {
        doctorId,
        currentToken: nextToken,
        date: today
      });
    }
    
    res.json({
      success: true,
      message: `Advanced to token ${nextToken}`,
      data: {
        currentToken: nextToken,
        currentAppointment: currentAppointment.rows[0] || null,
        upcomingAppointments: nextAppointments.rows
      }
    });
  } catch (error) {
    console.error('Error advancing token:', error);
    res.status(500).json({ success: false, message: 'Error advancing token', error: error.message });
  }
};

// Reset doctor's token counter (usually done at end of day or start of new day)
export const resetTokenCounter = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    await pool.query('UPDATE doctors SET current_token = 0 WHERE id = $1', [doctorId]);
    
    res.json({
      success: true,
      message: 'Token counter reset successfully'
    });
  } catch (error) {
    console.error('Error resetting token counter:', error);
    res.status(500).json({ success: false, message: 'Error resetting token counter', error: error.message });
  }
};


// Legacy endpoint for backward compatibility
export const getAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Appointment not found' });
    res.json({ status: 'success', appointment: result.rows[0] });
  } catch (err) {
    console.error('Error fetching appointment:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to fetch appointment', error: err.message });
  }
};

// Get appointment statistics
export const getAppointmentStats = async (req, res) => {
  try {
    const { doctor_id, date_range } = req.query;
    
    let dateFilter = '';
    let params = [];
    let paramIndex = 1;
    
    if (doctor_id) {
      dateFilter += ` AND doctor_id = $${paramIndex++}`;
      params.push(doctor_id);
    }
    
    if (date_range) {
      const [startDate, endDate] = date_range.split(',');
      dateFilter += ` AND appointment_date BETWEEN $${paramIndex++} AND $${paramIndex++}`;
      params.push(startDate, endDate);
    } else {
      // Default to current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      dateFilter += ` AND appointment_date BETWEEN $${paramIndex++} AND $${paramIndex++}`;
      params.push(startOfMonth, endOfMonth);
    }
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_count,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
        COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show_count,
        AVG(CASE 
          WHEN status = 'completed' AND updated_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (updated_at - created_at))/60 
        END) as avg_consultation_time_minutes
      FROM appointments 
      WHERE 1=1 ${dateFilter}
    `;
    
    const result = await pool.query(statsQuery, params);
    const stats = result.rows[0];
    
    // Convert numeric strings to numbers
    Object.keys(stats).forEach(key => {
      if (stats[key] !== null && !isNaN(stats[key])) {
        stats[key] = parseInt(stats[key]) || parseFloat(stats[key]);
      }
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching appointment stats', error: error.message });
  }
};

// Get upcoming appointments for a patient
export const getPatientUpcomingAppointments = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT a.*, 
             d.name as doctor_name,
             d.specialization,
             dept.name as department_name,
             h.name as hospital_name,
             h.address as hospital_address
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN departments dept ON a.department_id = dept.id
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.patient_id = $1 
        AND a.appointment_date >= $2
        AND a.status IN ('scheduled', 'confirmed')
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      LIMIT 10
    `;
    
    const result = await pool.query(query, [patient_id, today]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ success: false, message: 'Error fetching upcoming appointments', error: error.message });
  }
};

// Reschedule appointment
export const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_date, new_time, reason } = req.body;
    
    if (!new_date || !new_time) {
      return res.status(400).json({ success: false, message: 'New date and time are required' });
    }
    
    // Check if appointment exists
    const appointmentCheck = await pool.query('SELECT * FROM appointments WHERE appointment_id = $1', [id]);
    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    const appointment = appointmentCheck.rows[0];
    
    // Update appointment with new schedule
    const updateQuery = `
      UPDATE appointments 
      SET appointment_date = $1, 
          appointment_time = $2, 
          status = 'rescheduled',
          notes = COALESCE(notes, '') || $3,
          updated_at = NOW()
      WHERE appointment_id = $4
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [
      new_date, 
      new_time, 
      reason ? `\\nRescheduled: ${reason}` : '\\nRescheduled by request',
      id
    ]);
    
    // Emit socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${appointment.patient_id}`).emit('appointment_rescheduled', {
        appointment: result.rows[0],
        message: `Your appointment has been rescheduled to ${new_date} at ${new_time}`
      });
      
      io.to(`doctor_${appointment.doctor_id}`).emit('appointment_rescheduled', {
        appointment: result.rows[0],
        message: 'An appointment has been rescheduled'
      });
    }
    
    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ success: false, message: 'Error rescheduling appointment', error: error.message });
  }
};

// Mark appointment as no-show
export const markNoShow = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE appointments 
      SET status = 'no_show', updated_at = NOW()
      WHERE appointment_id = $1
      RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    
    res.json({
      success: true,
      message: 'Appointment marked as no-show',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error marking no-show:', error);
    res.status(500).json({ success: false, message: 'Error marking no-show', error: error.message });
  }
};
