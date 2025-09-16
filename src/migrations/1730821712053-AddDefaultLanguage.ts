import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultLanguage1730821712053 implements MigrationInterface {
    name = 'AddDefaultLanguage1730821712053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`barnahus_language\` ADD \`is_default\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`barnahus_language\` DROP COLUMN \`is_default\``);
    }

}
