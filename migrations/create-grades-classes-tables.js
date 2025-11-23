const { Client } = require('pg');

async function createGradesClassesTables() {
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

    // ============================================
    // 1. CREATE GRADES TABLE
    // ============================================
    console.log('Creating grades table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        grade_level INT NOT NULL UNIQUE CHECK (grade_level BETWEEN 3 AND 5),
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert default grades (3, 4, 5)
    console.log('Inserting default grade levels...');
    await client.query(`
      INSERT INTO grades (grade_level, description)
      VALUES
        (3, 'Grade 3 - Ages 8-9'),
        (4, 'Grade 4 - Ages 9-10'),
        (5, 'Grade 5 - Ages 10-11')
      ON CONFLICT (grade_level) DO NOTHING
    `);

    // ============================================
    // 2. CREATE CLASSES TABLE
    // ============================================
    console.log('Creating classes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        branch_id INT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        grade_id INT NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        teacher_id INT REFERENCES users(id) ON DELETE SET NULL,
        max_students INT NOT NULL DEFAULT 30 CHECK (max_students > 0),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for classes
    console.log('Creating indexes on classes table...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_classes_branch_id ON classes(branch_id);
      CREATE INDEX IF NOT EXISTS idx_classes_grade_id ON classes(grade_id);
      CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
      CREATE INDEX IF NOT EXISTS idx_classes_is_active ON classes(is_active);
    `);

    // ============================================
    // 3. CREATE STUDENT_CLASSES TABLE
    // ============================================
    console.log('Creating student_classes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_classes (
        id SERIAL PRIMARY KEY,
        student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(student_id, class_id)
      )
    `);

    // Create indexes for student_classes
    console.log('Creating indexes on student_classes table...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_student_classes_student_id ON student_classes(student_id);
      CREATE INDEX IF NOT EXISTS idx_student_classes_class_id ON student_classes(class_id);
    `);

    console.log('\n✅ Migration completed successfully!');

    // Verify tables
    const gradesResult = await client.query('SELECT * FROM grades ORDER BY grade_level');
    console.log('\n📚 Grades created:');
    console.table(gradesResult.rows);

    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('grades', 'classes', 'student_classes')
      ORDER BY table_name
    `);
    console.log('\n📋 Tables created:');
    console.table(tablesResult.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

createGradesClassesTables()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Failed:', err);
    process.exit(1);
  });
