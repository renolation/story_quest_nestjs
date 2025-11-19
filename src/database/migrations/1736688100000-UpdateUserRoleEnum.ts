import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Update User Role Enum
 *
 * This migration updates the users_role_enum to match the new 5-role system:
 * - AGENCY (was "admin") - Super Admin (Web Only)
 * - CENTER - Organization Admin (Web Only)
 * - TEACHER - Instructor (Web Only)
 * - REVIEWER - Content Moderator (Web Only)
 * - STUDENT - End User (Mobile Only)
 *
 * Removes old roles: "admin", "parent" (if they exist)
 */
export class UpdateUserRoleEnum1736688100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Update existing "admin" users to "agency"
    await queryRunner.query(`
      UPDATE users
      SET role = 'agency'
      WHERE role = 'admin';
    `);

    // Step 2: Update existing "parent" users to "student" (if any exist)
    await queryRunner.query(`
      UPDATE users
      SET role = 'student'
      WHERE role = 'parent';
    `);

    // Step 3: Create a new enum type with the correct values
    await queryRunner.query(`
      CREATE TYPE users_role_enum_new AS ENUM (
        'agency',
        'center',
        'teacher',
        'reviewer',
        'student'
      );
    `);

    // Step 4: Alter the column to use the new enum type
    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN role TYPE users_role_enum_new
      USING role::text::users_role_enum_new;
    `);

    // Step 5: Drop the old enum type
    await queryRunner.query(`
      DROP TYPE users_role_enum;
    `);

    // Step 6: Rename the new enum type to the original name
    await queryRunner.query(`
      ALTER TYPE users_role_enum_new RENAME TO users_role_enum;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse migration: Revert to old enum with "admin" instead of "agency"
    // Note: This will lose "center" and "reviewer" roles if they exist

    // Step 1: Create the old enum type
    await queryRunner.query(`
      CREATE TYPE users_role_enum_old AS ENUM (
        'admin',
        'teacher',
        'student'
      );
    `);

    // Step 2: Update "agency" users to "admin"
    await queryRunner.query(`
      UPDATE users
      SET role = 'admin'
      WHERE role = 'agency';
    `);

    // Step 3: Update "center" and "reviewer" users to "admin" (fallback)
    await queryRunner.query(`
      UPDATE users
      SET role = 'admin'
      WHERE role IN ('center', 'reviewer');
    `);

    // Step 4: Alter the column to use the old enum type
    await queryRunner.query(`
      ALTER TABLE users
      ALTER COLUMN role TYPE users_role_enum_old
      USING role::text::users_role_enum_old;
    `);

    // Step 5: Drop the new enum type
    await queryRunner.query(`
      DROP TYPE users_role_enum;
    `);

    // Step 6: Rename the old enum type back
    await queryRunner.query(`
      ALTER TYPE users_role_enum_old RENAME TO users_role_enum;
    `);
  }
}
