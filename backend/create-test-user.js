import pool from './config/db.js';
import bcrypt from 'bcrypt';

async function createTestUser() {
  try {
    // Check if test user already exists
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", ['test@hospease.com']);
    
    if (existing.rows.length > 0) {
      console.log('✅ Test user already exists:');
      console.log('Email: test@hospease.com');
      console.log('Password: Test@123');
      console.log('Role:', existing.rows[0].role);
      await pool.end();
      return;
    }

    // Create test user with password "Test@123"
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    
    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role`,
      ['Test User', 'test@hospease.com', hashedPassword, '+1234567890', 'admin']
    );

    console.log('✅ Test user created successfully!');
    console.log('Email: test@hospease.com');
    console.log('Password: Test@123');
    console.log('User details:', result.rows[0]);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createTestUser();
