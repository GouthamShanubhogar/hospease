import pool from './config/db.js';

const createDoctors = async () => {
  try {
    console.log('Creating test doctors...');

    // Insert doctor records directly
    const doctors = [
      {
        name: 'Dr. Michael Lee',
        specialty: 'Neurology', 
        email: 'michael.lee@hospital.com',
        phone: '+1234567890'
      },
      {
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        email: 'sarah.johnson@hospital.com', 
        phone: '+1234567891'
      },
      {
        name: 'Dr. David Wilson',
        specialty: 'Pediatrics',
        email: 'david.wilson@hospital.com',
        phone: '+1234567892'
      }
    ];

    for (const doctor of doctors) {
      try {
        await pool.query(`
          INSERT INTO doctors (name, specialty, email, phone, experience_years, available_today, available_tomorrow, available_this_week, consultation_fee, rating, review_count, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          doctor.name,
          doctor.specialty, 
          doctor.email,
          doctor.phone,
          5, // experience_years
          true, // available_today
          true, // available_tomorrow  
          true, // available_this_week
          100.00, // consultation_fee
          4.5, // rating
          10, // review_count
          'active' // status
        ]);
        console.log(`Created doctor: ${doctor.name}`);
      } catch (error) {
        console.log(`Doctor ${doctor.name} might already exist or error:`, error.message);
      }
    }

    // Check results
    const result = await pool.query('SELECT id, name, specialty, email FROM doctors LIMIT 10');
    console.log('Doctors in database:', result.rows);

  } catch (error) {
    console.error('Error creating doctors:', error);
  } finally {
    await pool.end();
  }
};

createDoctors();