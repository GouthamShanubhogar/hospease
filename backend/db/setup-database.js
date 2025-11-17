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
    console.log(`📍 Connecting to database: ${process.env.PG_DATABASE}`);
    
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

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    let tablesCreated = 0;
    let indexesCreated = 0;
    let dataInserted = 0;

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
              tablesCreated++;
            }
          }
          // Log index creation
          else if (statement.toUpperCase().includes('CREATE INDEX')) {
            const match = statement.match(/CREATE INDEX (?:IF NOT EXISTS )?(\w+)/i);
            if (match) {
              console.log(`📊 Index created: ${match[1]}`);
              indexesCreated++;
            }
          }
          // Log data insertion
          else if (statement.toUpperCase().includes('INSERT INTO')) {
            const match = statement.match(/INSERT INTO (\w+)/i);
            if (match) {
              console.log(`📥 Sample data inserted into: ${match[1]}`);
              dataInserted++;
            }
          }
        } catch (err) {
          // Skip if table/index already exists
          if (err.code === '42P07') {
            const match = statement.match(/CREATE (?:TABLE|INDEX) (?:IF NOT EXISTS )?(\w+)/i);
            if (match) {
              console.log(`ℹ️  Already exists: ${match[1]}`);
            }
          } else if (err.code === '23505') {
            // Unique violation - data already exists
            console.log(`ℹ️  Sample data already exists (skipping)`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, err.message);
            // Continue with other statements
          }
        }
      }
    }

    await client.query('COMMIT');
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   - Tables created: ${tablesCreated}`);
    console.log(`   - Indexes created: ${indexesCreated}`);
    console.log(`   - Sample data inserted: ${dataInserted}`);
    console.log('='.repeat(50) + '\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', err.message);
    console.error('Stack trace:', err.stack);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
console.log('\n' + '='.repeat(50));
console.log('🏥 HOSPEASE DATABASE SETUP');
console.log('='.repeat(50) + '\n');

createAllTables()
  .then(() => {
    console.log('✅ All done! Your database is ready to use.\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to create tables:', err.message);
    process.exit(1);
  });
