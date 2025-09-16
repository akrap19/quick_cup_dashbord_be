import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShouldChangePassword1731337363430 implements MigrationInterface {
    name = 'AddShouldChangePassword1731337363430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case\` ADD \`should_change_password\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`user_session\` CHANGE \`login_type\` \`login_type\` enum ('web', 'mobile', 'case') NOT NULL DEFAULT 'web'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_session\` CHANGE \`login_type\` \`login_type\` enum ('web', 'mobile') NOT NULL DEFAULT 'web'`);
        await queryRunner.query(`ALTER TABLE \`case\` DROP COLUMN \`should_change_password\``);
    }

}
