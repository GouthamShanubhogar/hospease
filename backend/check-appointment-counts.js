import pool from './config/db.js';

async function checkAppointmentCounts() {
  try {
    // Check if the column exists and has data
    const patientsResult = await pool.query(`
      SELECT patient_id, patient_name, total_appointments 
      FROM patients 
      ORDER BY patient_id
    `);
    
    console.log('Current patients with appointment counts:');
    console.table(patientsResult.rows);
    
    // Check if the trigger exists
    const triggerResult = await pool.query(`
      SELECT trigger_name, event_manipulation, event_object_table 
      FROM information_schema.triggers 
      WHERE trigger_name = 'appointment_count_trigger'
    `);
    
    console.log('\nTrigger status:');
    if (triggerResult.rows.length > 0) {
      console.log('✅ Trigger exists:', triggerResult.rows[0]);
    } else {
      console.log('❌ Trigger does not exist');
    }
    
    // Check actual appointment counts vs stored counts
    const actualCounts = await pool.query(`
      SELECT 
        p.patient_id,
        p.patient_name,
        p.total_appointments as stored_count,
        COUNT(a.id) as actual_count
      FROM patients p
      LEFT JOIN appointments a ON p.patient_id = a.patient_id
      GROUP BY p.patient_id, p.patient_name, p.total_appointments
      ORDER BY p.patient_id
    `);
    
    console.log('\nComparison of stored vs actual appointment counts:');
    console.table(actualCounts.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking appointment counts:', error);
    process.exit(1);
  }
}

checkAppointmentCounts();