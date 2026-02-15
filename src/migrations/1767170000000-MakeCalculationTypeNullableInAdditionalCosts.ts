import { MigrationInterface, QueryRunner } from 'typeorm'

export class MakeCalculationTypeNullableInAdditionalCosts1767170000000
  implements MigrationInterface
{
  name = 'MakeCalculationTypeNullableInAdditionalCosts1767170000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists
    const columns = await queryRunner.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'additional_costs' 
       AND COLUMN_NAME = 'calculation_type'`
    )

    if (columns.length > 0) {
      // Modify the column to allow NULL
      await queryRunner.query(
        `ALTER TABLE \`additional_costs\` MODIFY COLUMN \`calculation_type\` enum ('overall', 'by_product') NULL`
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists
    const columns = await queryRunner.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'additional_costs' 
       AND COLUMN_NAME = 'calculation_type'`
    )

    if (columns.length > 0) {
      // Modify the column back to NOT NULL (with a default for existing NULL values)
      await queryRunner.query(
        `UPDATE \`additional_costs\` SET \`calculation_type\` = 'overall' WHERE \`calculation_type\` IS NULL`
      )
      await queryRunner.query(
        `ALTER TABLE \`additional_costs\` MODIFY COLUMN \`calculation_type\` enum ('overall', 'by_product') NOT NULL DEFAULT 'overall'`
      )
    }
  }
}

