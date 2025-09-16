import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedNewEmail1706087003605 implements MigrationInterface {
    name = 'AddedNewEmail1706087003605'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`new_email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`verification_uid\` CHANGE \`type\` \`type\` enum ('Registration', 'ResetPassword', 'ChangeEmail') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`verification_uid\` CHANGE \`type\` \`type\` enum ('Registration', 'ResetPassword') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`new_email\``);
    }

}
