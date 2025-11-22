const { Pool } = require('pg');

async function checkSuperAdmin() {
  require('dotenv').config();

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  try {
    const result = await pool.query(
      'SELECT id, email, username, role, is_super_admin FROM users WHERE id = 188'
    );

    console.log('Super Admin User:');
    console.table(result.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkSuperAdmin();
