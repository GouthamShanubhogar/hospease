import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: parseInt(process.env.PG_PORT || '5432'),
});

async function fixUserPassword() {
  try {
    const user = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = $1', ['abcd@gmail.com']);
    console.log('User details:', user.rows[0]);
    
    if (user.rows[0] && !user.rows[0].password_hash) {
      console.log('User has no password_hash, updating...');
      const hashedPassword = await bcrypt.hash('Abcd1020', 10);
      
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [hashedPassword, 'abcd@gmail.com']
      );
      console.log('Password updated successfully');
    } else if (user.rows[0]) {
      console.log('User already has password_hash');
    } else {
      console.log('User not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

fixUserPassword();