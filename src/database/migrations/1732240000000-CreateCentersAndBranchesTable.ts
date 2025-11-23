import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateCentersAndBranchesTable
 *
 * Purpose:
 * Creates the centers and branches tables for the multi-tenant organization system.
 * This migration MUST run BEFORE the chapter ownership migration (1732250000000).
 *
 * Tables Created:
 * 1. centers - Main organization/center records
 * 2. branches - Branch locations under each center
 *
 * Business Rules:
 * - Centers can be managed by AGENCY users (super admins)
 * - Each center can have multiple branches
 * - Centers have three statuses: active, inactive, suspended
 * - Email addresses must be unique across centers
 * - Deleting a center cascades to all its branches
 * - Setting agency_id to NULL preserves center data if agency is deleted
 */
export class CreateCentersAndBranchesTable1732240000000
  implements MigrationInterface
{
  name = 'CreateCentersAndBranchesTable1732240000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // CENTERS TABLE
    // ============================================

    // Create centers table
    await queryRunner.query(`
      CREATE TABLE centers (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL,
        phone VARCHAR(20) NULL,
        address TEXT NULL,
        logo_url VARCHAR(500) NULL,
        business_license VARCHAR(255) NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_centers_agency_id
          FOREIGN KEY (agency_id)
          REFERENCES users(id)
          ON DELETE SET NULL,
        CONSTRAINT chk_centers_status
          CHECK (status IN ('active', 'inactive', 'suspended')),
        CONSTRAINT uq_centers_email
          UNIQUE (email)
      );
    `);

    // Create indexes for centers table
    await queryRunner.query(`
      CREATE INDEX idx_centers_agency_id ON centers(agency_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_centers_status ON centers(status);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_centers_email ON centers(email) WHERE email IS NOT NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX idx_centers_created_at ON centers(created_at);
    `);

    // ============================================
    // BRANCHES TABLE
    // ============================================

    // Create branches table
    await queryRunner.query(`
      CREATE TABLE branches (
        id SERIAL PRIMARY KEY,
        center_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        address TEXT NULL,
        phone VARCHAR(20) NULL,
        email VARCHAR(255) NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_branches_center_id
          FOREIGN KEY (center_id)
          REFERENCES centers(id)
          ON DELETE CASCADE
      );
    `);

    // Create indexes for branches table
    await queryRunner.query(`
      CREATE INDEX idx_branches_center_id ON branches(center_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_branches_is_active ON branches(is_active);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_branches_created_at ON branches(created_at);
    `);

    // Create composite index for fast lookup of branches by center and name
    await queryRunner.query(`
      CREATE INDEX idx_branches_center_name ON branches(center_id, name);
    `);

    // ============================================
    // TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
    // ============================================

    // Create trigger function for updating updated_at timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger for centers table
    await queryRunner.query(`
      CREATE TRIGGER update_centers_updated_at
      BEFORE UPDATE ON centers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create trigger for branches table
    await queryRunner.query(`
      CREATE TRIGGER update_branches_updated_at
      BEFORE UPDATE ON branches
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ============================================
    // DROP TRIGGERS
    // ============================================

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_branches_updated_at ON branches;`,
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_centers_updated_at ON centers;`,
    );

    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column();`,
    );

    // ============================================
    // DROP TABLES (CASCADE to remove dependencies)
    // ============================================

    // Drop branches first due to foreign key dependency
    await queryRunner.query(`DROP TABLE IF EXISTS branches CASCADE;`);

    // Drop centers table
    await queryRunner.query(`DROP TABLE IF EXISTS centers CASCADE;`);
  }
}
