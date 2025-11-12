import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeIdFromUuidToInt1736688000000 implements MigrationInterface {
  name = 'ChangeIdFromUuidToInt1736688000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    /**
     * CRITICAL MIGRATION: Convert all UUID primary keys to INT auto-increment
     *
     * WARNING: This migration will DROP ALL EXISTING DATA due to the fundamental
     * change in primary key types. This is necessary because:
     * 1. UUID strings cannot be converted to integers
     * 2. All foreign key relationships must be rebuilt
     * 3. This is a breaking change requiring a fresh database
     *
     * BACKUP YOUR DATA BEFORE RUNNING THIS MIGRATION!
     */

    // Step 1: Drop all tables in reverse order of dependencies
    // This ensures foreign key constraints don't block the drops
    await queryRunner.query(`DROP TABLE IF EXISTS "student_question_answers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_level_attempts" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_unit_progress" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_chapter_progress" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "answer_options" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "questions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "levels" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "units" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chapters" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);

    // Step 2: Recreate all tables with INT primary keys

    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "username" VARCHAR(100) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL,
        "full_name" VARCHAR(255) NOT NULL,
        "role" VARCHAR(50) NOT NULL,
        "avatar_url" VARCHAR(500),
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      )
    `);

    // Create indexes for users
    await queryRunner.query(`CREATE INDEX "idx_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "idx_users_role" ON "users" ("role")`);

    // Chapters table
    await queryRunner.query(`
      CREATE TABLE "chapters" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "thumbnail_url" VARCHAR(500),
        "order_index" INTEGER NOT NULL UNIQUE,
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_chapters_order" ON "chapters" ("order_index")`);

    // Units table
    await queryRunner.query(`
      CREATE TABLE "units" (
        "id" SERIAL PRIMARY KEY,
        "chapter_id" INTEGER NOT NULL,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "thumbnail_url" VARCHAR(500),
        "order_index" INTEGER NOT NULL,
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        CONSTRAINT "fk_units_chapter" FOREIGN KEY ("chapter_id")
          REFERENCES "chapters" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_units_chapter" ON "units" ("chapter_id")`);
    await queryRunner.query(`CREATE INDEX "idx_units_order" ON "units" ("chapter_id", "order_index")`);

    // Levels table
    await queryRunner.query(`
      CREATE TABLE "levels" (
        "id" SERIAL PRIMARY KEY,
        "unit_id" INTEGER NOT NULL,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "order_index" INTEGER NOT NULL,
        "time_limit_seconds" INTEGER,
        "passing_score" INTEGER DEFAULT 70,
        "total_points" INTEGER DEFAULT 100,
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        CONSTRAINT "fk_levels_unit" FOREIGN KEY ("unit_id")
          REFERENCES "units" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_levels_unit" ON "levels" ("unit_id")`);
    await queryRunner.query(`CREATE INDEX "idx_levels_order" ON "levels" ("unit_id", "order_index")`);

    // Questions table
    await queryRunner.query(`
      CREATE TABLE "questions" (
        "id" SERIAL PRIMARY KEY,
        "level_id" INTEGER NOT NULL,
        "question_type" VARCHAR(50) NOT NULL,
        "question_text" TEXT NOT NULL,
        "question_audio_url" VARCHAR(500),
        "question_image_url" VARCHAR(500),
        "question_place" VARCHAR(50),
        "answer_place" VARCHAR(50),
        "order_index" INTEGER NOT NULL,
        "points" INTEGER DEFAULT 10,
        "hint" TEXT,
        "explanation" TEXT,
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        CONSTRAINT "fk_questions_level" FOREIGN KEY ("level_id")
          REFERENCES "levels" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_questions_level" ON "questions" ("level_id")`);
    await queryRunner.query(`CREATE INDEX "idx_questions_order" ON "questions" ("level_id", "order_index")`);

    // Answer Options table
    await queryRunner.query(`
      CREATE TABLE "answer_options" (
        "id" SERIAL PRIMARY KEY,
        "question_id" INTEGER NOT NULL,
        "option_text" TEXT NOT NULL,
        "option_image_url" VARCHAR(500),
        "option_audio_url" VARCHAR(500),
        "is_correct" BOOLEAN DEFAULT false,
        "order_index" INTEGER NOT NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        CONSTRAINT "fk_answer_options_question" FOREIGN KEY ("question_id")
          REFERENCES "questions" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_answer_options_question" ON "answer_options" ("question_id")`);

    // Student Level Attempts table
    await queryRunner.query(`
      CREATE TABLE "student_level_attempts" (
        "id" SERIAL PRIMARY KEY,
        "student_id" INTEGER NOT NULL,
        "level_id" INTEGER NOT NULL,
        "score" INTEGER NOT NULL,
        "points_earned" INTEGER NOT NULL,
        "time_spent_seconds" INTEGER,
        "is_completed" BOOLEAN DEFAULT false,
        "is_passed" BOOLEAN DEFAULT false,
        "started_at" TIMESTAMP DEFAULT now(),
        "completed_at" TIMESTAMP,
        CONSTRAINT "fk_student_level_attempts_student" FOREIGN KEY ("student_id")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_student_level_attempts_level" FOREIGN KEY ("level_id")
          REFERENCES "levels" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_student_level_attempts_student" ON "student_level_attempts" ("student_id")`);
    await queryRunner.query(`CREATE INDEX "idx_student_level_attempts_level" ON "student_level_attempts" ("level_id")`);
    await queryRunner.query(`CREATE INDEX "idx_student_level_attempts_completed" ON "student_level_attempts" ("student_id", "level_id", "is_completed")`);

    // Student Question Answers table
    await queryRunner.query(`
      CREATE TABLE "student_question_answers" (
        "id" SERIAL PRIMARY KEY,
        "attempt_id" INTEGER NOT NULL,
        "question_id" INTEGER NOT NULL,
        "student_id" INTEGER NOT NULL,
        "selected_option_id" INTEGER,
        "answer_text" TEXT,
        "answer_audio_url" VARCHAR(500),
        "is_correct" BOOLEAN,
        "points_earned" INTEGER DEFAULT 0,
        "time_spent_seconds" INTEGER,
        "answered_at" TIMESTAMP DEFAULT now(),
        CONSTRAINT "fk_student_question_answers_attempt" FOREIGN KEY ("attempt_id")
          REFERENCES "student_level_attempts" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_student_question_answers_question" FOREIGN KEY ("question_id")
          REFERENCES "questions" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_student_question_answers_student" FOREIGN KEY ("student_id")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_student_question_answers_option" FOREIGN KEY ("selected_option_id")
          REFERENCES "answer_options" ("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_student_question_answers_attempt" ON "student_question_answers" ("attempt_id")`);
    await queryRunner.query(`CREATE INDEX "idx_student_question_answers_student" ON "student_question_answers" ("student_id")`);

    // Student Unit Progress table
    await queryRunner.query(`
      CREATE TABLE "student_unit_progress" (
        "id" SERIAL PRIMARY KEY,
        "student_id" INTEGER NOT NULL,
        "unit_id" INTEGER NOT NULL,
        "total_levels" INTEGER DEFAULT 0,
        "completed_levels" INTEGER DEFAULT 0,
        "total_points_available" INTEGER DEFAULT 0,
        "total_points_earned" INTEGER DEFAULT 0,
        "average_score" DECIMAL(5,2) DEFAULT 0,
        "last_accessed_at" TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT now(),
        CONSTRAINT "fk_student_unit_progress_student" FOREIGN KEY ("student_id")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_student_unit_progress_unit" FOREIGN KEY ("unit_id")
          REFERENCES "units" ("id") ON DELETE CASCADE,
        CONSTRAINT "uq_student_unit" UNIQUE ("student_id", "unit_id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_student_unit_progress_student" ON "student_unit_progress" ("student_id")`);
    await queryRunner.query(`CREATE INDEX "idx_student_unit_progress_unit" ON "student_unit_progress" ("unit_id")`);

    // Student Chapter Progress table
    await queryRunner.query(`
      CREATE TABLE "student_chapter_progress" (
        "id" SERIAL PRIMARY KEY,
        "student_id" INTEGER NOT NULL,
        "chapter_id" INTEGER NOT NULL,
        "total_units" INTEGER DEFAULT 0,
        "completed_units" INTEGER DEFAULT 0,
        "total_points_available" INTEGER DEFAULT 0,
        "total_points_earned" INTEGER DEFAULT 0,
        "average_score" DECIMAL(5,2) DEFAULT 0,
        "last_accessed_at" TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT now(),
        CONSTRAINT "fk_student_chapter_progress_student" FOREIGN KEY ("student_id")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_student_chapter_progress_chapter" FOREIGN KEY ("chapter_id")
          REFERENCES "chapters" ("id") ON DELETE CASCADE,
        CONSTRAINT "uq_student_chapter" UNIQUE ("student_id", "chapter_id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_student_chapter_progress_student" ON "student_chapter_progress" ("student_id")`);
    await queryRunner.query(`CREATE INDEX "idx_student_chapter_progress_chapter" ON "student_chapter_progress" ("chapter_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * ROLLBACK: Convert back to UUID (requires fresh database)
     * This will also drop all data.
     */

    // Drop all tables
    await queryRunner.query(`DROP TABLE IF EXISTS "student_question_answers" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_level_attempts" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_unit_progress" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_chapter_progress" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "answer_options" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "questions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "levels" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "units" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chapters" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);

    // Recreate with UUID (you would need to add the full CREATE TABLE statements with UUID here)
    // This is a placeholder - in production you'd want the original schema
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `);

    // Note: Full rollback would require recreating all tables with UUID
    // This is left as a placeholder since rolling back would also lose all data
  }
}
