import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
};

async function addTestProfile() {
  const client = new Client(config);
  
  try {
    await client.connect();
    
    // Manually insert profile data for user ID 8
    const insertQuery = `
      INSERT INTO patient_profiles (
        user_id, date_of_birth, gender, address, blood_group,
        emergency_contact, emergency_contact_name,
        insurance_provider, insurance_number, medical_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id) DO UPDATE SET
        date_of_birth = EXCLUDED.date_of_birth,
        gender = EXCLUDED.gender,
        address = EXCLUDED.address,
        blood_group = EXCLUDED.blood_group,
        emergency_contact = EXCLUDED.emergency_contact,
        emergency_contact_name = EXCLUDED.emergency_contact_name,
        insurance_provider = EXCLUDED.insurance_provider,
        insurance_number = EXCLUDED.insurance_number,
        medical_notes = EXCLUDED.medical_notes
    `;
    
    await client.query(insertQuery, [
      8, // user_id
      '1990-01-15', // date_of_birth
      'Male', // gender
      '123 Main Street, City', // address
      'O+', // blood_group
      '9876543211', // emergency_contact
      'Jane Doe', // emergency_contact_name
      'Health Insurance Co', // insurance_provider
      'HIC123456', // insurance_number
      'No known allergies' // medical_notes
    ]);
    
    console.log('✅ Test profile data inserted successfully');
    
    // Verify the data
    const selectQuery = `
      SELECT u.id, u.name, u.email, u.phone,
             p.date_of_birth, p.gender, p.address, p.blood_group,
             p.emergency_contact, p.emergency_contact_name,
             p.insurance_provider, p.insurance_number, p.medical_notes
      FROM users u
      LEFT JOIN patient_profiles p ON u.id = p.user_id
      WHERE u.id = 8
    `;
    
    const result = await client.query(selectQuery);
    console.log('✅ Updated patient data:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

addTestProfile();