const { Pool } = require('pg');
require('dotenv').config();

async function fixDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'renolation',
    database: process.env.DB_DATABASE || 'renolation',
  });

  try {
    console.log('🔧 Fixing database schema for agencies...\n');

    // Step 1: Drop existing foreign key constraint if it exists
    console.log('Step 1: Dropping existing foreign key constraint from centers table...');
    const fkQuery = `
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'centers'::regclass
      AND conname LIKE '%agency%' OR conname = 'FK_8d937a815bfb5bccbb5b9ed4c49';
    `;
    const fkResult = await pool.query(fkQuery);

    if (fkResult.rows.length > 0) {
      const constraintName = fkResult.rows[0].conname;
      console.log(`  Found constraint: ${constraintName}`);
      await pool.query(`ALTER TABLE centers DROP CONSTRAINT IF EXISTS ${constraintName}`);
      console.log('  ✅ Dropped existing constraint');
    } else {
      console.log('  No existing constraint found');
    }

    // Step 2: Set all existing agency_id values to NULL
    console.log('\nStep 2: Setting all centers.agency_id to NULL...');
    const updateResult = await pool.query('UPDATE centers SET agency_id = NULL WHERE agency_id IS NOT NULL');
    console.log(`  ✅ Updated ${updateResult.rowCount} rows`);

    // Step 3: Create agencies table if it doesn't exist
    console.log('\nStep 3: Creating agencies table...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS agencies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        address TEXT,
        logo_url VARCHAR(500),
        description TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await pool.query(createTableQuery);
    console.log('  ✅ Agencies table created/verified');

    // Step 4: Add foreign key constraint
    console.log('\nStep 4: Adding foreign key constraint from centers to agencies...');
    await pool.query(`
      ALTER TABLE centers
      ADD CONSTRAINT FK_centers_agency
      FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE SET NULL
    `);
    console.log('  ✅ Foreign key constraint added');

    console.log('\n✅ Database schema fixed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the NestJS server');
    console.log('   2. Test the Agency endpoints');

  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixDatabase();
