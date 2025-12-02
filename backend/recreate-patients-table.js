import pool from './config/db.js';

const recreatePatientsTable = async () => {
  try {
    console.log('Dropping existing patients table...');
    
    // Drop the existing patients table and related constraints
    await pool.query(`
      DROP TABLE IF EXISTS patients CASCADE;
    `);
    
    console.log('✅ Existing patients table dropped');
    
    console.log('Creating new patients table...');
    
    // Create the new patients table with correct structure
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
          patient_id SERIAL PRIMARY KEY,
          patient_name VARCHAR(255) NOT NULL,
          email_address VARCHAR(255) UNIQUE NOT NULL,
          phone_number VARCHAR(20) NOT NULL,
          date_of_birth DATE NOT NULL,
          gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
          blood_group VARCHAR(5) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
          address TEXT,
          emergency_contact_name VARCHAR(255),
          emergency_contact_phone VARCHAR(20),
          additional_notes TEXT,
          patient_type VARCHAR(20) DEFAULT 'Outpatient' CHECK (patient_type IN ('Outpatient', 'Inpatient', 'Emergency')),
          registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Discharged')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ New patients table created');
    
    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email_address);
      CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone_number);
      CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(patient_name);
      CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
    `);
    
    console.log('✅ Indexes created');
    
    // Create trigger function for updating timestamp
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_patients_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Create the trigger
    await pool.query(`
      DROP TRIGGER IF EXISTS update_patients_timestamp ON patients;
      CREATE TRIGGER update_patients_timestamp
          BEFORE UPDATE ON patients
          FOR EACH ROW
          EXECUTE FUNCTION update_patients_timestamp();
    `);
    
    console.log('✅ Timestamp trigger created');
    
    // Update appointments table to have the new patient reference column
    await pool.query(`
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS new_patient_id INTEGER REFERENCES patients(patient_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_new_patient ON appointments(new_patient_id);
    `);
    
    console.log('✅ Appointments table updated with new patient reference');
    
    console.log('🎉 Patients table recreation completed successfully!');
    console.log('📋 Table structure:');
    console.log('   - patient_id (Primary Key)');
    console.log('   - patient_name (Required)');
    console.log('   - email_address (Unique, Required)');
    console.log('   - phone_number (Required)');
    console.log('   - date_of_birth (Required)');
    console.log('   - gender (Required: Male/Female/Other)');
    console.log('   - blood_group (Optional: A+/A-/B+/B-/AB+/AB-/O+/O-)');
    console.log('   - address (Optional)');
    console.log('   - emergency_contact_name (Optional)');
    console.log('   - emergency_contact_phone (Optional)');
    console.log('   - additional_notes (Optional)');
    console.log('   - patient_type (Default: Outpatient)');
    console.log('   - status (Default: Active)');
    console.log('   - registration_date, created_at, updated_at (Auto-managed)');
    
  } catch (error) {
    console.error('❌ Error recreating patients table:', error);
  } finally {
    await pool.end();
  }
};

recreatePatientsTable();