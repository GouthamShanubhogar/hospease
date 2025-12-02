import fs from 'fs';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: parseInt(process.env.PG_PORT || '5432'),
});

async function runMigration() {
  console.log('🔄 Running migration 005_profile_notifications_settings.sql');
  
  const migrationPath = path.join(process.cwd(), 'db', 'migrations', '005_profile_notifications_settings.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Execute the entire SQL as one statement to handle DO blocks properly
    console.log('📝 Executing migration...');
    await client.query(sql);
    
    await client.query('COMMIT');
    console.log('✅ Migration completed successfully!');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    console.error('Full error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);