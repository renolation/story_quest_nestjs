const { Client } = require('pg');

async function addUserIdToCenters() {
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

    // Add user_id column to centers table
    console.log('Adding user_id column to centers table...');
    await client.query(`
      ALTER TABLE centers
      ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE SET NULL
    `);

    // Create index
    console.log('Creating index on user_id...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_centers_user_id ON centers(user_id)
    `);

    // Link the existing center to the CENTER test user
    console.log('\nLinking center ID 1 to CENTER test user (ID 209)...');
    await client.query(`
      UPDATE centers
      SET user_id = 209
      WHERE id = 1
    `);

    console.log('✅ Migration completed successfully!');

    // Verify the update
    const result = await client.query(`
      SELECT c.id, c.name, c.user_id, u.username, u.role
      FROM centers c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = 1
    `);

    console.log('\nVerification:');
    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

addUserIdToCenters()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Failed:', err);
    process.exit(1);
  });
