import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddOwnedByToProduct1767130000000 implements MigrationInterface {
  name = 'AddOwnedByToProduct1767130000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product\` ADD COLUMN \`owned_by\` varchar(36) NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product\` DROP COLUMN \`owned_by\``
    )
  }
}

