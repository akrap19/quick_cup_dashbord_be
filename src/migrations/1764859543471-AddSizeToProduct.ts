import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSizeToProduct1764859543471 implements MigrationInterface {
  name = 'AddSizeToProduct1764859543471'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product\` ADD \`size\` varchar(128) NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`size\``)
  }
}
