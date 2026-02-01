import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMaxPiecesToAdditionalCosts1767038000000
  implements MigrationInterface
{
  name = 'AddMaxPiecesToAdditionalCosts1767038000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` ADD COLUMN \`max_pieces\` int NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` DROP COLUMN \`max_pieces\``
    )
  }
}
