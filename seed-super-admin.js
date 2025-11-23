const { Pool } = require('pg');
const bcrypt = require('bcrypt');

/**
 * Seed Script: Create Super Admin User
 *
 * This script creates the first super admin user who has permission
 * to create agencies. Only ONE super admin should exist in the system.
 *
 * Usage:
 *   node seed-super-admin.js
 *
 * Or with custom credentials:
 *   SUPER_ADMIN_EMAIL=admin@example.com \
 *   SUPER_ADMIN_USERNAME=superadmin \
 *   SUPER_ADMIN_PASSWORD=SecurePass123 \
 *   SUPER_ADMIN_FULLNAME="System Administrator" \
 *   node seed-super-admin.js
 */

async function seedSuperAdmin() {
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
    console.log('🚀 Creating Super Admin User...\n');

    // Get super admin credentials from environment or use defaults
    const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@storyquest.com';
    const username = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';
    const fullName = process.env.SUPER_ADMIN_FULLNAME || 'System Super Administrator';

    // Check if super admin already exists
    const existingSuperAdmin = await pool.query(
      'SELECT id, email, username, is_super_admin FROM users WHERE is_super_admin = true'
    );

    if (existingSuperAdmin.rows.length > 0) {
      console.log('⚠️  Super Admin already exists:');
      console.table(existingSuperAdmin.rows);
      console.log('\n❌ Cannot create another super admin. Only ONE super admin is allowed.');
      console.log('💡 To create a new super admin, first remove is_super_admin flag from existing user.');
      return;
    }

    // Check if user with email already exists
    const existingUser = await pool.query(
      'SELECT id, email, username, role FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  User with this email or username already exists:');
      console.table(existingUser.rows);
      console.log('\n💡 You can update this user to be super admin instead:');
      console.log(`   UPDATE users SET is_super_admin = true WHERE id = ${existingUser.rows[0].id};`);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create super admin user
    const result = await pool.query(
      `INSERT INTO users (
        email,
        username,
        password_hash,
        full_name,
        role,
        is_active,
        is_super_admin,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, email, username, full_name, role, is_super_admin, created_at`,
      [email, username, passwordHash, fullName, 'agency', true, true]
    );

    console.log('✅ Super Admin created successfully!\n');
    console.log('📋 Super Admin Details:');
    console.table(result.rows);

    console.log('\n🔐 Login Credentials:');
    console.log('   Email/Username:', email, 'or', username);
    console.log('   Password:', password);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('⚠️  SECURITY: This user can create agencies. Keep credentials secure!\n');

    // Show all users with AGENCY role for verification
    const allAgencyUsers = await pool.query(
      `SELECT id, email, username, full_name, role, is_super_admin, is_active
       FROM users
       WHERE role = 'agency'
       ORDER BY is_super_admin DESC, id ASC`
    );

    console.log('📊 All AGENCY Role Users:');
    console.table(allAgencyUsers.rows);

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seed script
seedSuperAdmin()
  .then(() => {
    console.log('\n✅ Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed script failed:', error);
    process.exit(1);
  });
