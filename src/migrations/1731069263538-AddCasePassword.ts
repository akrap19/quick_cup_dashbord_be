import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCasePassword1731069263538 implements MigrationInterface {
    name = 'AddCasePassword1731069263538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case\` ADD \`password\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`room_translation\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`room_translation\` ADD \`description\` varchar(1000) NULL`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`about_translation\` ADD \`description\` varchar(1000) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` ADD \`description\` varchar(1000) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_about\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`case_about\` ADD \`description\` varchar(1000) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_room\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`case_room\` ADD \`description\` varchar(1000) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_staff\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`case_staff\` ADD \`description\` varchar(1000) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case_staff\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`case_staff\` ADD \`description\` varchar(600) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_room\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`case_room\` ADD \`description\` varchar(600) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_about\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`case_about\` ADD \`description\` varchar(600) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` ADD \`description\` varchar(600) NULL`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`about_translation\` ADD \`description\` varchar(600) NULL`);
        await queryRunner.query(`ALTER TABLE \`room_translation\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`room_translation\` ADD \`description\` varchar(600) NULL`);
        await queryRunner.query(`ALTER TABLE \`case\` DROP COLUMN \`password\``);
    }

}
