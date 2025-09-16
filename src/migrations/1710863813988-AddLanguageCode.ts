import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLanguageCode1710863813988 implements MigrationInterface {
    name = 'AddLanguageCode1710863813988'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`barnahus_language\` ADD \`language_code\` varchar(3) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`barnahus_language\` DROP COLUMN \`language_code\``);
    }

}
