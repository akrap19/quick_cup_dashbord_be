import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCalculationStatusToAdditionalCosts1767037000000
  implements MigrationInterface
{
  name = 'AddCalculationStatusToAdditionalCosts1767037000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` ADD COLUMN \`calculation_status\` enum ('available', 'in_use', 'maintenance', 'reserved', 'damaged', 'owned_by_client') NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` DROP COLUMN \`calculation_status\``
    )
  }
}
