import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIncludeStaffName1728563385897 implements MigrationInterface {
    name = 'AddIncludeStaffName1728563385897'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`template_staff\` ADD \`include_name\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`case_staff\` ADD \`name\` varchar(50) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case_staff\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`template_staff\` DROP COLUMN \`include_name\``);
    }

}
