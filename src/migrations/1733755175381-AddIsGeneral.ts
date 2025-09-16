import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsGeneral1733755175381 implements MigrationInterface {
    name = 'AddIsGeneral1733755175381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`template\` ADD \`is_general\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`template\` DROP COLUMN \`is_general\``);
    }

}
