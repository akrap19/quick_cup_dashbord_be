import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateEventModel1762713304598 implements MigrationInterface {
  name = 'UpdateEventModel1762713304598'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`event_model\` ADD \`user_id\` varchar(255) NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`event_model\` ADD \`userId\` varchar(36) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`event_model\` ADD CONSTRAINT \`FK_cca54a7dc79d10d04ba12fe7af4\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`event_model\` DROP FOREIGN KEY \`FK_cca54a7dc79d10d04ba12fe7af4\``
    )
    await queryRunner.query(
      `ALTER TABLE \`event_model\` DROP COLUMN \`userId\``
    )
    await queryRunner.query(
      `ALTER TABLE \`event_model\` DROP COLUMN \`user_id\``
    )
  }
}
