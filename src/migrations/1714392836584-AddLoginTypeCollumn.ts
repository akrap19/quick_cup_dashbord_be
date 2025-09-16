import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLoginTypeCollumn1714392836584 implements MigrationInterface {
    name = 'AddLoginTypeCollumn1714392836584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_session\` ADD \`login_type\` enum ('web', 'mobile') NOT NULL DEFAULT 'web'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_session\` DROP COLUMN \`login_type\``);
    }

}
