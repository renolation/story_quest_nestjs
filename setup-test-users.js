const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function setupTestUsers() {
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

    const testPassword = 'Test123456';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Create or update AGENCY user
    const agencyResult = await client.query(`
      INSERT INTO users (email, username, password_hash, full_name, role, is_active, is_super_admin, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE
      SET password_hash = $3, updated_at = NOW()
      RETURNING id, email, username, role, is_super_admin
    `, ['agency_test@example.com', 'agency_test', hashedPassword, 'Agency Test User', 'agency', true, true]);

    console.log('✅ Created/Updated AGENCY user:');
    console.table(agencyResult.rows);

    // Create or update CENTER user (linked to center ID 1)
    const centerResult = await client.query(`
      INSERT INTO users (email, username, password_hash, full_name, role, is_active, is_super_admin, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE
      SET password_hash = $3, updated_at = NOW()
      RETURNING id, email, username, role, is_super_admin
    `, ['center_test@example.com', 'center_test', hashedPassword, 'Center Test User', 'center', true, false]);

    console.log('\n✅ Created/Updated CENTER user:');
    console.table(centerResult.rows);

    // Link CENTER user to center (update centers table)
    const centerLinkResult = await client.query(`
      UPDATE centers
      SET user_id = $1, updated_at = NOW()
      WHERE id = 1
      RETURNING id, name, user_id
    `, [centerResult.rows[0].id]);

    console.log('\n✅ Linked CENTER user to center:');
    console.table(centerLinkResult.rows);

    console.log(`\n========== TEST CREDENTIALS ==========`);
    console.log(`AGENCY User:`);
    console.log(`  Email: agency_test@example.com`);
    console.log(`  Username: agency_test`);
    console.log(`  Password: ${testPassword}`);
    console.log(``);
    console.log(`CENTER User:`);
    console.log(`  Email: center_test@example.com`);
    console.log(`  Username: center_test`);
    console.log(`  Password: ${testPassword}`);
    console.log(`  Linked to Center ID: 1`);
    console.log(`======================================`);

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

setupTestUsers();
