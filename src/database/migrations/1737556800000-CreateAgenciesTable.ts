import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAgenciesTable1737556800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Drop existing foreign key if it exists (from centers.agency_id -> users.id)
    const centersTable = await queryRunner.getTable('centers');
    const existingForeignKey = centersTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('agency_id') !== -1,
    );
    if (existingForeignKey) {
      await queryRunner.dropForeignKey('centers', existingForeignKey);
    }

    // Step 2: Set all existing agency_id values in centers to NULL
    // (because they currently point to users, not agencies)
    await queryRunner.query(`UPDATE centers SET agency_id = NULL WHERE agency_id IS NOT NULL`);

    // Step 3: Create agencies table
    await queryRunner.createTable(
      new Table({
        name: 'agencies',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'logo_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'suspended'],
            default: "'active'",
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Step 4: Add foreign key constraint from centers to agencies
    await queryRunner.createForeignKey(
      'centers',
      new TableForeignKey({
        columnNames: ['agency_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'agencies',
        onDelete: 'SET NULL',
        name: 'FK_centers_agency',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key from centers table
    const table = await queryRunner.getTable('centers');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('agency_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('centers', foreignKey);
    }

    // Drop agencies table
    await queryRunner.dropTable('agencies');
  }
}
