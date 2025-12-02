import pool from './config/db.js';

const createTestData = async () => {
  try {
    console.log('Checking database structure and creating test data...');

    // Check existing tables
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Available tables:', tablesResult.rows.map(r => r.table_name));

    // Check doctors table structure
    const doctorsStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'doctors'
    `);
    console.log('Doctors table structure:', doctorsStructure.rows);

    // Create a test user for patient
    const patientResult = await pool.query(`
      INSERT INTO users (name, email, phone, role, password_hash) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (email) DO NOTHING
      RETURNING id`,
      ['John Doe', 'patient@test.com', '+1234567890', 'patient', '$2a$10$examplehash']
    );
    console.log('Patient created:', patientResult.rows);

    // Create a test user for doctor  
    const doctorUserResult = await pool.query(`
      INSERT INTO users (name, email, phone, role, password_hash) 
      VALUES ($1, $2, $3, $4, $5) 
      ON CONFLICT (email) DO NOTHING
      RETURNING id`,
      ['Dr. Michael Lee', 'doctor@test.com', '+1987654321', 'doctor', '$2a$10$examplehash']
    );
    console.log('Doctor user created:', doctorUserResult.rows);

    // Get existing users
    const existingPatients = await pool.query(`
      SELECT id, name, email FROM users WHERE role = 'patient' LIMIT 3
    `);

    const existingDoctorUsers = await pool.query(`
      SELECT id, name, email FROM users WHERE role = 'doctor' LIMIT 3
    `);

    console.log('Test data created successfully!');
    console.log('Available patients:', existingPatients.rows);
    console.log('Available doctor users:', existingDoctorUsers.rows);

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await pool.end();
  }
};

createTestData();