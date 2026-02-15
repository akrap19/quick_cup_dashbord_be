import { MigrationInterface, QueryRunner } from 'typeorm'

export class MakePriceNullableInAdditionalCosts1767160000000
  implements MigrationInterface
{
  name = 'MakePriceNullableInAdditionalCosts1767160000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` MODIFY COLUMN \`price\` decimal(10,4) NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` MODIFY COLUMN \`price\` decimal(10,4) NOT NULL`
    )
  }
}

