import { MigrationInterface, QueryRunner } from 'typeorm'

export class AppCleanUp1759170117851 implements MigrationInterface {
  name = 'AppCleanUp1759170117851'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_session\` DROP FOREIGN KEY \`FK_13275383dcdf095ee29f2b3455a\``
    )
    await queryRunner.query(
      `ALTER TABLE \`verification_uid\` DROP FOREIGN KEY \`FK_63a7c3d33457bd557224ccd88d7\``
    )
    await queryRunner.query(
      `ALTER TABLE \`user_role\` DROP FOREIGN KEY \`FK_9cbb77db19b830dbda4f8ee33d6\``
    )
    await queryRunner.query(
      `ALTER TABLE \`user_role\` CHANGE \`assigned_by_id\` \`assigned_by_id\` varchar(255) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`new_email\` \`new_email\` varchar(255) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`password\` \`password\` varchar(255) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`phone_number\` \`phone_number\` varchar(14) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`api_key\` CHANGE \`description\` \`description\` varchar(100) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`user_role\` ADD CONSTRAINT \`FK_9cbb77db19b830dbda4f8ee33d6\` FOREIGN KEY (\`assigned_by_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`user_session\` ADD CONSTRAINT \`FK_13275383dcdf095ee29f2b3455a\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`verification_uid\` ADD CONSTRAINT \`FK_63a7c3d33457bd557224ccd88d7\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`verification_uid\` DROP FOREIGN KEY \`FK_63a7c3d33457bd557224ccd88d7\``
    )
    await queryRunner.query(
      `ALTER TABLE \`user_session\` DROP FOREIGN KEY \`FK_13275383dcdf095ee29f2b3455a\``
    )
    await queryRunner.query(
      `ALTER TABLE \`user_role\` DROP FOREIGN KEY \`FK_9cbb77db19b830dbda4f8ee33d6\``
    )
    await queryRunner.query(
      `ALTER TABLE \`api_key\` CHANGE \`description\` \`description\` varchar(100) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`phone_number\` \`phone_number\` varchar(14) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`password\` \`password\` varchar(255) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`new_email\` \`new_email\` varchar(255) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`user_role\` CHANGE \`assigned_by_id\` \`assigned_by_id\` varchar(255) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`user_role\` ADD CONSTRAINT \`FK_9cbb77db19b830dbda4f8ee33d6\` FOREIGN KEY (\`assigned_by_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`verification_uid\` ADD CONSTRAINT \`FK_63a7c3d33457bd557224ccd88d7\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`user_session\` ADD CONSTRAINT \`FK_13275383dcdf095ee29f2b3455a\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }
}
