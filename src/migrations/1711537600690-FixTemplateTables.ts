import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTemplateTables1711537600690 implements MigrationInterface {
    name = 'FixTemplateTables1711537600690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`template_room\` CHANGE \`include_image\` \`include_images\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`template_about\` ADD \`include_description\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`template_about\` ADD \`include_audio\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`template_about\` ADD \`include_images\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`template_staff\` ADD \`include_description\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`template_staff\` ADD \`include_images\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`template\` ADD \`name\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`template\` ADD UNIQUE INDEX \`IDX_a62147c0d6b868e797061e142a\` (\`name\`)`);
        await queryRunner.query(`ALTER TABLE \`template\` ADD \`status\` enum ('Draft', 'Published', 'Hidden') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`template\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`template\` DROP INDEX \`IDX_a62147c0d6b868e797061e142a\``);
        await queryRunner.query(`ALTER TABLE \`template\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`template_staff\` DROP COLUMN \`include_images\``);
        await queryRunner.query(`ALTER TABLE \`template_staff\` DROP COLUMN \`include_description\``);
        await queryRunner.query(`ALTER TABLE \`template_about\` DROP COLUMN \`include_images\``);
        await queryRunner.query(`ALTER TABLE \`template_about\` DROP COLUMN \`include_audio\``);
        await queryRunner.query(`ALTER TABLE \`template_about\` DROP COLUMN \`include_description\``);
        await queryRunner.query(`ALTER TABLE \`template_room\` CHANGE \`include_images\` \`include_image\` tinyint NOT NULL DEFAULT '1'`);
    }

}
