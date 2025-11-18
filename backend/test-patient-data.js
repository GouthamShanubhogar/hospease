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

async function testPatientData() {
  const client = new Client(config);
  
  try {
    await client.connect();
    
    // Check if our test patient was saved with profile data
    const query = `
      SELECT u.id, u.name, u.email, u.phone,
             p.date_of_birth, p.gender, p.address, p.blood_group,
             p.emergency_contact, p.emergency_contact_name,
             p.insurance_provider, p.insurance_number, p.medical_notes
      FROM users u
      LEFT JOIN patient_profiles p ON u.id = p.user_id
      WHERE u.email = 'john.doe@example.com'
    `;
    
    const result = await client.query(query);
    
    if (result.rows.length > 0) {
      console.log('✅ Patient data found:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('❌ No patient data found');
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPatientData();