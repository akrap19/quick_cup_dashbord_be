import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddEnableUploadToAdditionalCosts1767110000000
  implements MigrationInterface
{
  name = 'AddEnableUploadToAdditionalCosts1767110000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` ADD COLUMN \`enable_upload\` boolean NOT NULL DEFAULT false`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` DROP COLUMN \`enable_upload\``
    )
  }
}

