import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePronunciationAndGamificationTables1732200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // PRONUNCIATION MODULE
    // ============================================

    // Create pronunciation_attempts table
    await queryRunner.query(`
      CREATE TABLE pronunciation_attempts (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        reference_text TEXT NOT NULL,
        recognized_text TEXT,
        pronunciation_score DECIMAL(5,2),
        accuracy_score DECIMAL(5,2),
        fluency_score DECIMAL(5,2),
        completeness_score DECIMAL(5,2),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pronunciation_score_range CHECK (pronunciation_score IS NULL OR (pronunciation_score >= 0 AND pronunciation_score <= 100)),
        CONSTRAINT accuracy_score_range CHECK (accuracy_score IS NULL OR (accuracy_score >= 0 AND accuracy_score <= 100)),
        CONSTRAINT fluency_score_range CHECK (fluency_score IS NULL OR (fluency_score >= 0 AND fluency_score <= 100)),
        CONSTRAINT completeness_score_range CHECK (completeness_score IS NULL OR (completeness_score >= 0 AND completeness_score <= 100))
      );
    `);

    // Create indexes for pronunciation_attempts
    await queryRunner.query(`
      CREATE INDEX idx_pronunciation_attempts_student_id ON pronunciation_attempts(student_id);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_pronunciation_attempts_question_id ON pronunciation_attempts(question_id);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_pronunciation_attempts_created_at ON pronunciation_attempts(created_at);
    `);

    // ============================================
    // GAMIFICATION MODULE
    // ============================================

    // Create achievements table
    await queryRunner.query(`
      CREATE TABLE achievements (
        id SERIAL PRIMARY KEY,
        code VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon_url VARCHAR(500),
        points_reward INTEGER NOT NULL DEFAULT 0,
        tier VARCHAR(50) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT tier_check CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
        CONSTRAINT points_reward_positive CHECK (points_reward >= 0)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_achievements_code ON achievements(code);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_achievements_is_active ON achievements(is_active);
    `);

    // Create student_achievements table
    await queryRunner.query(`
      CREATE TABLE student_achievements (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
        unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_student_achievement UNIQUE (student_id, achievement_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_student_achievements_student_id ON student_achievements(student_id);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_student_achievements_achievement_id ON student_achievements(achievement_id);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_student_achievements_unlocked_at ON student_achievements(unlocked_at);
    `);

    // Create student_points table
    await queryRunner.query(`
      CREATE TABLE student_points (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        total_points INTEGER NOT NULL DEFAULT 0,
        current_streak INTEGER NOT NULL DEFAULT 0,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        last_activity_date DATE,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT total_points_non_negative CHECK (total_points >= 0),
        CONSTRAINT current_streak_non_negative CHECK (current_streak >= 0),
        CONSTRAINT longest_streak_non_negative CHECK (longest_streak >= 0)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_student_points_student_id ON student_points(student_id);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_student_points_total_points ON student_points(total_points DESC);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_student_points_last_activity_date ON student_points(last_activity_date);
    `);

    // Create point_transactions table
    await queryRunner.query(`
      CREATE TABLE point_transactions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        points INTEGER NOT NULL,
        reason VARCHAR(100) NOT NULL,
        reference_id INTEGER,
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT reason_check CHECK (reason IN ('level_complete', 'achievement_unlock', 'perfect_score', 'streak_bonus', 'daily_login', 'admin_adjustment'))
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_point_transactions_student_id ON point_transactions(student_id);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_point_transactions_reason ON point_transactions(reason);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop gamification tables
    await queryRunner.query(`DROP TABLE IF EXISTS point_transactions CASCADE;`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS student_points CASCADE;`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS student_achievements CASCADE;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS achievements CASCADE;`);

    // Drop pronunciation tables
    await queryRunner.query(
      `DROP TABLE IF EXISTS pronunciation_attempts CASCADE;`,
    );
  }
}
