#!/usr/bin/env node

/**
 * Database Enum Fix Script
 *
 * This script connects to PostgreSQL and fixes the users_role_enum
 * to support the new 5-role system.
 */

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const queries = [
  {
    name: 'Update admin to agency',
    sql: `UPDATE users SET role = 'agency' WHERE role = 'admin';`
  },
  {
    name: 'Update parent to student',
    sql: `UPDATE users SET role = 'student' WHERE role = 'parent';`
  },
  {
    name: 'Create new enum type',
    sql: `CREATE TYPE users_role_enum_new AS ENUM ('agency', 'center', 'teacher', 'reviewer', 'student');`
  },
  {
    name: 'Alter column to use new enum',
    sql: `ALTER TABLE users ALTER COLUMN role TYPE users_role_enum_new USING role::text::users_role_enum_new;`
  },
  {
    name: 'Drop old enum type',
    sql: `DROP TYPE users_role_enum;`
  },
  {
    name: 'Rename new enum type',
    sql: `ALTER TYPE users_role_enum_new RENAME TO users_role_enum;`
  },
  {
    name: 'Verify enum values',
    sql: `SELECT enum_range(NULL::users_role_enum) AS available_roles;`
  },
  {
    name: 'Count users by role',
    sql: `SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role;`
  }
];

async function fixDatabaseEnum() {
  console.log('🔧 Starting database enum fix...\n');
  console.log(`Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    for (const query of queries) {
      try {
        console.log(`⏳ ${query.name}...`);
        const result = await client.query(query.sql);

        if (result.rows && result.rows.length > 0) {
          console.log('   Result:', JSON.stringify(result.rows, null, 2));
        } else if (result.rowCount !== undefined) {
          console.log(`   ✓ Success (${result.rowCount} rows affected)`);
        } else {
          console.log('   ✓ Success');
        }
      } catch (error) {
        // Some errors are expected (like updating non-existent roles)
        if (error.message.includes('does not exist')) {
          console.log('   ℹ️  Skipped (role does not exist)');
        } else {
          console.error(`   ❌ Error: ${error.message}`);
          throw error;
        }
      }
    }

    console.log('\n✅ Database enum fix completed successfully!');
    console.log('\n🎉 You can now restart your NestJS application.');

  } catch (error) {
    console.error('\n❌ Failed to fix database enum:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixDatabaseEnum();
