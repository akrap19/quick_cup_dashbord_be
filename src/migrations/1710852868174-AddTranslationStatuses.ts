import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTranslationStatuses1710852868174 implements MigrationInterface {
    name = 'AddTranslationStatuses1710852868174'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`room_translation\` ADD \`status\` enum ('Draft', 'Published', 'Hidden') NOT NULL DEFAULT 'Draft'`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` ADD \`status\` enum ('Draft', 'Published', 'Hidden') NOT NULL DEFAULT 'Draft'`);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` ADD \`status\` enum ('Draft', 'Published', 'Hidden') NOT NULL DEFAULT 'Draft'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff_translation\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`about_translation\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`room_translation\` DROP COLUMN \`status\``);
    }

}
