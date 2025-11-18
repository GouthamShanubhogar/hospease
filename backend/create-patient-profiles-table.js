import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration (using environment variables)
const config = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
};

async function createPatientProfilesTable() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    const createTableSQL = `
      -- Create patient_profiles table to store additional patient information
      CREATE TABLE IF NOT EXISTS patient_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        date_of_birth DATE,
        gender VARCHAR(20),
        address TEXT,
        blood_group VARCHAR(10),
        emergency_contact VARCHAR(20),
        emergency_contact_name VARCHAR(255),
        patient_type VARCHAR(50) DEFAULT 'Outpatient',
        insurance_provider VARCHAR(255),
        insurance_number VARCHAR(100),
        referring_doctor VARCHAR(255),
        medical_notes TEXT,
        estimated_cost DECIMAL(10,2) DEFAULT 0.00,
        payment_method VARCHAR(50) DEFAULT 'later',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create function to update updated_at timestamp if it doesn't exist
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = CURRENT_TIMESTAMP;
         RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      -- Create trigger to update updated_at
      DROP TRIGGER IF EXISTS update_patient_profiles_updated_at ON patient_profiles;
      CREATE TRIGGER update_patient_profiles_updated_at 
      BEFORE UPDATE ON patient_profiles 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;
    
    await client.query(createTableSQL);
    console.log('✅ Patient profiles table created successfully');
    
    await client.end();
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    process.exit(1);
  }
}

createPatientProfilesTable();