import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTranslateableBoolean1708422832842 implements MigrationInterface {
    name = 'AddTranslateableBoolean1708422832842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`barnahus_language\` ADD \`translateable\` tinyint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`barnahus_language\` DROP COLUMN \`translateable\``);
    }

}
