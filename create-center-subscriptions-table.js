const { Pool } = require('pg');
require('dotenv').config();

async function createCenterSubscriptionsTable() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'renolation',
    database: process.env.DB_DATABASE || 'renolation',
  });

  try {
    console.log('🔧 Creating center_subscriptions table...\n');

    // Create center_subscriptions table
    console.log('Creating center_subscriptions table...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS center_subscriptions (
        id SERIAL PRIMARY KEY,
        center_id INT NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
        package_id INT NOT NULL REFERENCES service_packages(id) ON DELETE RESTRICT,
        start_date TIMESTAMP NOT NULL,
        expiry_date TIMESTAMP NOT NULL,
        auto_renew BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'trial')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await pool.query(createTableQuery);
    console.log('  ✅ center_subscriptions table created/verified');

    // Add indexes for performance
    console.log('\nAdding indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_center_subscriptions_center_id
      ON center_subscriptions(center_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_center_subscriptions_package_id
      ON center_subscriptions(package_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_center_subscriptions_status
      ON center_subscriptions(status);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_center_subscriptions_expiry_date
      ON center_subscriptions(expiry_date);
    `);
    console.log('  ✅ Indexes created');

    console.log('\n✅ Database schema created successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. The NestJS server will auto-reload');
    console.log('   2. Test the subscription endpoints');
    console.log('   3. CENTER can now purchase packages!');

  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createCenterSubscriptionsTable();
