import { readFileSync } from 'fs';
import pool from './config/db.js';

const runMigration = async () => {
  try {
    console.log('Running patients table migration...');
    
    // Read and execute the migration file
    const migrationSQL = readFileSync('./db/migrations/004_create_patients_table.sql', 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Patients table migration completed successfully');
    console.log('✅ Created patients table with all required fields');
    console.log('✅ Added indexes and triggers');
    console.log('✅ Updated appointments table structure');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
  } finally {
    await pool.end();
  }
};

runMigration();