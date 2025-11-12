import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateUserModel1762657517777 implements MigrationInterface {
  name = 'UpdateUserModel1762657517777'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`location\` varchar(255) NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`location\``)
  }
}
