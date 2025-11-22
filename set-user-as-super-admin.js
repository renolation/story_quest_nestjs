const { Pool } = require('pg');

/**
 * Script: Set User as Super Admin
 *
 * This script sets an existing user as the super admin.
 *
 * Usage:
 *   node set-user-as-super-admin.js <user_id>
 *
 * Example:
 *   node set-user-as-super-admin.js 188
 */

async function setUserAsSuperAdmin() {
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
    // Get user ID from command line argument
    const userId = process.argv[2];

    if (!userId) {
      console.log('❌ Error: User ID is required');
      console.log('Usage: node set-user-as-super-admin.js <user_id>');
      console.log('Example: node set-user-as-super-admin.js 188');
      process.exit(1);
    }

    console.log(`🔧 Setting user ${userId} as super admin...\n`);

    // Check if super admin already exists
    const existingSuperAdmin = await pool.query(
      'SELECT id, email, username FROM users WHERE is_super_admin = true'
    );

    if (existingSuperAdmin.rows.length > 0) {
      console.log('⚠️  Super Admin already exists:');
      console.table(existingSuperAdmin.rows);
      console.log('\n❌ Cannot create another super admin. Only ONE super admin is allowed.');
      console.log('💡 First remove is_super_admin flag from the existing user:\n');
      console.log(`   UPDATE users SET is_super_admin = false WHERE id = ${existingSuperAdmin.rows[0].id};`);
      process.exit(1);
    }

    // Check if user exists
    const user = await pool.query(
      'SELECT id, email, username, role FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      console.log(`❌ User with ID ${userId} not found`);
      process.exit(1);
    }

    console.log('📋 User Details:');
    console.table(user.rows);

    // Check if user has AGENCY role
    if (user.rows[0].role !== 'agency') {
      console.log('\n⚠️  Warning: User does not have AGENCY role');
      console.log('   Current role:', user.rows[0].role);
      console.log('   Super admin must have AGENCY role');
      console.log('\n💡 First update user role to AGENCY:\n');
      console.log(`   UPDATE users SET role = 'agency' WHERE id = ${userId};`);
      process.exit(1);
    }

    // Update user to be super admin
    await pool.query(
      'UPDATE users SET is_super_admin = true WHERE id = $1',
      [userId]
    );

    console.log('\n✅ User successfully set as super admin!\n');

    // Show updated user
    const updatedUser = await pool.query(
      'SELECT id, email, username, role, is_super_admin FROM users WHERE id = $1',
      [userId]
    );

    console.log('📋 Updated User:');
    console.table(updatedUser.rows);

    console.log('\n⚠️  IMPORTANT: This user can now create agencies!');
    console.log('⚠️  SECURITY: Keep credentials secure!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run script
setUserAsSuperAdmin()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
