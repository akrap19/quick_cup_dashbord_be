import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddStatusToProduct1767030000000 implements MigrationInterface {
  name = 'AddStatusToProduct1767030000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product\` ADD \`status\` enum ('Active', 'Deleted') NOT NULL DEFAULT 'Active'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`status\``)
  }
}
