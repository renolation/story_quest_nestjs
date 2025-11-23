const { Pool } = require('pg');

/**
 * Migration: Create Teachers Table
 *
 * Teachers are users with TEACHER role who belong to a CENTER.
 * Teachers create content and manage assigned students.
 *
 * Access Control:
 * - AGENCY: Can create teachers for any center (must specify center_id)
 * - CENTER: Can create teachers for own center only (auto-assigned to their center)
 * - Teacher belongs to exactly ONE center
 */

async function createTeachersTable() {
  // Load .env file
  require('dotenv').config();

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE || 'english_app',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'renolation',
  });

  try {
    console.log('🔧 Creating teachers table...\n');

    // Check if table already exists
    const tableCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'teachers'
    `);

    if (tableCheck.rows.length > 0) {
      console.log('✅ Table teachers already exists. Skipping creation...');
      return;
    }

    // Create teachers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        center_id INT NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
        branch_id INT REFERENCES branches(id) ON DELETE SET NULL,
        employee_id VARCHAR(50),
        specialization VARCHAR(255),
        bio TEXT,
        hire_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    console.log('✅ Created teachers table');

    // Create indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers(user_id)
    `);
    console.log('✅ Created index on user_id');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_teachers_center_id ON teachers(center_id)
    `);
    console.log('✅ Created index on center_id');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_teachers_branch_id ON teachers(branch_id)
    `);
    console.log('✅ Created index on branch_id');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers(status)
    `);
    console.log('✅ Created index on status');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_teachers_employee_id ON teachers(employee_id)
    `);
    console.log('✅ Created index on employee_id');

    // Show table structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'teachers'
      ORDER BY ordinal_position
    `);

    console.log('\n📊 Teachers Table Structure:');
    console.table(tableInfo.rows);

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Error creating teachers table:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
createTeachersTable()
  .then(() => {
    console.log('\n✅ Teachers table migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
