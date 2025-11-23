const { Pool } = require('pg');
require('dotenv').config();

async function createOffersTable() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'renolation',
    database: process.env.DB_DATABASE || 'renolation',
  });

  try {
    console.log('🔧 Creating offers table and updating center_subscriptions...\n');

    // Create offers table
    console.log('Creating offers table...');
    const createOffersTableQuery = `
      CREATE TABLE IF NOT EXISTS offers (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
        discount_value DECIMAL(10, 2) NOT NULL,
        package_id INT REFERENCES service_packages(id) ON DELETE CASCADE,
        valid_from TIMESTAMP NOT NULL,
        valid_until TIMESTAMP NOT NULL,
        max_uses INT,
        max_uses_per_center INT,
        current_uses INT DEFAULT 0 NOT NULL,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `;
    await pool.query(createOffersTableQuery);
    console.log('  ✅ offers table created/verified');

    // Add indexes for offers
    console.log('\nAdding indexes for offers table...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_offers_code
      ON offers(code);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_offers_status
      ON offers(status);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_offers_package_id
      ON offers(package_id);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_offers_valid_from
      ON offers(valid_from);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_offers_valid_until
      ON offers(valid_until);
    `);
    console.log('  ✅ Indexes created for offers table');

    // Add offer-related columns to center_subscriptions table
    console.log('\nUpdating center_subscriptions table...');

    // Check if columns already exist
    const checkColumnsQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'center_subscriptions'
      AND column_name IN ('applied_offer_id', 'original_price', 'discount_amount', 'final_price')
    `;
    const { rows: existingColumns } = await pool.query(checkColumnsQuery);
    const existingColumnNames = existingColumns.map(row => row.column_name);

    if (!existingColumnNames.includes('applied_offer_id')) {
      await pool.query(`
        ALTER TABLE center_subscriptions
        ADD COLUMN applied_offer_id INT REFERENCES offers(id) ON DELETE SET NULL
      `);
      console.log('  ✅ Added applied_offer_id column');
    } else {
      console.log('  ⏭️  applied_offer_id column already exists');
    }

    if (!existingColumnNames.includes('original_price')) {
      await pool.query(`
        ALTER TABLE center_subscriptions
        ADD COLUMN original_price DECIMAL(10, 2)
      `);
      console.log('  ✅ Added original_price column');
    } else {
      console.log('  ⏭️  original_price column already exists');
    }

    if (!existingColumnNames.includes('discount_amount')) {
      await pool.query(`
        ALTER TABLE center_subscriptions
        ADD COLUMN discount_amount DECIMAL(10, 2)
      `);
      console.log('  ✅ Added discount_amount column');
    } else {
      console.log('  ⏭️  discount_amount column already exists');
    }

    if (!existingColumnNames.includes('final_price')) {
      await pool.query(`
        ALTER TABLE center_subscriptions
        ADD COLUMN final_price DECIMAL(10, 2)
      `);
      console.log('  ✅ Added final_price column');
    } else {
      console.log('  ⏭️  final_price column already exists');
    }

    // Add index for applied_offer_id
    console.log('\nAdding indexes for center_subscriptions...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_center_subscriptions_applied_offer_id
      ON center_subscriptions(applied_offer_id);
    `);
    console.log('  ✅ Indexes created for center_subscriptions');

    console.log('\n✅ Database schema updated successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✓ offers table created with all columns and indexes');
    console.log('   ✓ center_subscriptions table updated with offer fields');
    console.log('   ✓ All foreign keys and constraints in place');
    console.log('\n🎯 Next steps:');
    console.log('   1. The NestJS server will auto-reload');
    console.log('   2. Test the offer endpoints');
    console.log('   3. AGENCY can now create promotional offers!');
    console.log('   4. CENTERS can validate and redeem offers when purchasing!');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createOffersTable();
