import pool from './config/db.js';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    const migrationPath = path.join(process.cwd(), 'db', 'migrations', '006_add_appointment_count.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration: 006_add_appointment_count.sql');
    await pool.query(migrationSQL);
    console.log('✅ Migration completed successfully');
    
    // Test the column was added
    const result = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'total_appointments'");
    if (result.rows.length > 0) {
      console.log('✅ total_appointments column added successfully');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();