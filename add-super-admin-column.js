const { Pool } = require('pg');

/**
 * Migration: Add is_super_admin column to users table
 *
 * This adds a boolean flag to identify the one true super admin
 * who has permission to create agencies.
 */

async function addSuperAdminColumn() {
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
    console.log('🔧 Adding is_super_admin column to users table...');

    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'is_super_admin'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ Column is_super_admin already exists. Skipping...');
      return;
    }

    // Add is_super_admin column
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN is_super_admin BOOLEAN DEFAULT false NOT NULL
    `);

    console.log('✅ Successfully added is_super_admin column');

    // Create index for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_is_super_admin
      ON users(is_super_admin)
    `);

    console.log('✅ Created index on is_super_admin column');

    // Show current super admins (should be none initially)
    const superAdmins = await pool.query(`
      SELECT id, email, username, role, is_super_admin
      FROM users
      WHERE is_super_admin = true
    `);

    console.log('\n📊 Current Super Admins:');
    if (superAdmins.rows.length === 0) {
      console.log('   No super admins found. Run the seed script to create one.');
    } else {
      console.table(superAdmins.rows);
    }

  } catch (error) {
    console.error('❌ Error adding is_super_admin column:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
addSuperAdminColumn()
  .then(() => {
    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
