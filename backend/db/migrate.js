import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: parseInt(process.env.PG_PORT || '5432'),
});

async function createAllTables() {
  const client = await pool.connect();
  try {
    console.log('🔄 Starting database migration...');
    await client.query('BEGIN');

    // Read and execute the complete schema file
    const schemaPath = path.join(__dirname, 'complete_schema.sql');
    console.log('📖 Reading schema from:', schemaPath);
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema file not found:', schemaPath);
      throw new Error('complete_schema.sql file not found');
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await client.query(statement + ';');
          
          // Log table creation
          if (statement.toUpperCase().includes('CREATE TABLE')) {
            const match = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i);
            if (match) {
              console.log(`✅ Table created: ${match[1]}`);
            }
          }
        } catch (err) {
          // Skip if table already exists
          if (err.code === '42P07') {
            const match = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i);
            if (match) {
              console.log(`ℹ️  Table already exists: ${match[1]}`);
            }
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, err.message);
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Run migrations if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createAllTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { createAllTables };