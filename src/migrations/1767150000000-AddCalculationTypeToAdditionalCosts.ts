import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCalculationTypeToAdditionalCosts1767150000000
  implements MigrationInterface
{
  name = 'AddCalculationTypeToAdditionalCosts1767150000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` ADD COLUMN \`calculation_type\` enum ('overall', 'by_product') NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` DROP COLUMN \`calculation_type\``
    )
  }
}

