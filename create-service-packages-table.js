const { Pool } = require('pg');
require('dotenv').config();

async function createServicePackagesTable() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'renolation',
    database: process.env.DB_DATABASE || 'renolation',
  });

  try {
    console.log('🔧 Creating service_packages table...\n');

    // Create service_packages table
    console.log('Creating service_packages table...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS service_packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        features JSONB,
        max_students INT,
        max_branches INT,
        max_teachers INT,
        price_monthly DECIMAL(10,2),
        price_yearly DECIMAL(10,2),
        trial_days INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await pool.query(createTableQuery);
    console.log('  ✅ service_packages table created/verified');

    // Add unique constraint on name
    console.log('\nAdding unique constraint on name...');
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'service_packages_name_unique'
        ) THEN
          ALTER TABLE service_packages
          ADD CONSTRAINT service_packages_name_unique UNIQUE (name);
        END IF;
      END $$;
    `);
    console.log('  ✅ Unique constraint added');

    console.log('\n✅ Database schema created successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart the NestJS server (if running)');
    console.log('   2. Test the Service Packages endpoints');
    console.log('   3. Create some sample packages via API');

  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createServicePackagesTable();
