import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChapterOwnership1732250000000 implements MigrationInterface {
  name = 'AddChapterOwnership1732250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add center_id column (nullable) for organization-specific chapters
    await queryRunner.query(`
      ALTER TABLE "chapters"
      ADD COLUMN "center_id" INTEGER NULL
    `);

    // Add is_public column (default false)
    await queryRunner.query(`
      ALTER TABLE "chapters"
      ADD COLUMN "is_public" BOOLEAN NOT NULL DEFAULT false
    `);

    // Add foreign key constraint to centers table
    await queryRunner.query(`
      ALTER TABLE "chapters"
      ADD CONSTRAINT "FK_chapters_center_id"
      FOREIGN KEY ("center_id")
      REFERENCES "centers"("id")
      ON DELETE CASCADE
    `);

    // Remove unique constraint from order_index since we now have chapters per organization
    await queryRunner.query(`
      ALTER TABLE "chapters"
      DROP CONSTRAINT IF EXISTS "UQ_chapters_order_index"
    `);

    // Add composite unique constraint: order_index unique per organization
    // (center_id, order_index) for org-specific chapters
    // NULL center_id with order_index for public chapters
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_chapters_center_order"
      ON "chapters" ("center_id", "order_index")
      WHERE "center_id" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_chapters_public_order"
      ON "chapters" ("order_index")
      WHERE "center_id" IS NULL AND "is_public" = true
    `);

    // Add check constraint: if center_id is NULL, then is_public must be true
    await queryRunner.query(`
      ALTER TABLE "chapters"
      ADD CONSTRAINT "CHK_chapters_public_ownership"
      CHECK (
        (center_id IS NULL AND is_public = true) OR
        (center_id IS NOT NULL AND is_public = false)
      )
    `);

    // Create index for querying public chapters
    await queryRunner.query(`
      CREATE INDEX "IDX_chapters_is_public" ON "chapters" ("is_public")
    `);

    // Create index for querying by center
    await queryRunner.query(`
      CREATE INDEX "IDX_chapters_center_id" ON "chapters" ("center_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_chapters_center_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_chapters_is_public"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_chapters_public_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_chapters_center_order"`);

    // Drop check constraint
    await queryRunner.query(
      `ALTER TABLE "chapters" DROP CONSTRAINT IF EXISTS "CHK_chapters_public_ownership"`,
    );

    // Drop foreign key
    await queryRunner.query(
      `ALTER TABLE "chapters" DROP CONSTRAINT IF EXISTS "FK_chapters_center_id"`,
    );

    // Drop columns
    await queryRunner.query(`ALTER TABLE "chapters" DROP COLUMN "is_public"`);
    await queryRunner.query(`ALTER TABLE "chapters" DROP COLUMN "center_id"`);

    // Restore unique constraint on order_index
    await queryRunner.query(`
      ALTER TABLE "chapters"
      ADD CONSTRAINT "UQ_chapters_order_index" UNIQUE ("order_index")
    `);
  }
}
