const { Client } = require('pg');

async function testTeachers() {
  const client = new Client({
    host: process.env.DB_HOST || '103.188.82.191',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'renolation',
    password: process.env.DB_PASSWORD || 'renolation',
    database: process.env.DB_DATABASE || 'main_db',
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    // Check existing users
    const usersResult = await client.query(`
      SELECT id, email, username, role, is_super_admin
      FROM users
      WHERE role IN ('agency', 'center') OR is_super_admin = true
      LIMIT 10
    `);
    console.log('=== Existing Admin/Agency/Center Users ===');
    console.table(usersResult.rows);

    // Check existing centers
    const centersResult = await client.query(`
      SELECT id, name, status
      FROM centers
      LIMIT 5
    `);
    console.log('\n=== Existing Centers ===');
    console.table(centersResult.rows);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

testTeachers();
