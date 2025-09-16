import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCharacterLimits1726746845468 implements MigrationInterface {
    name = 'AddCharacterLimits1726746845468'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`room_translation\` MODIFY COLUMN \`title\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`room_translation\` MODIFY COLUMN \`description\` varchar(600) NULL`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` MODIFY COLUMN \`title\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` MODIFY COLUMN \`description\` varchar(600) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` MODIFY COLUMN \`title\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` MODIFY COLUMN \`description\` varchar(600) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` MODIFY COLUMN \`name\` varchar(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`case_about\` MODIFY COLUMN \`title\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_about\` MODIFY COLUMN \`description\` varchar(600) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_room\` MODIFY COLUMN \`title\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_room\` MODIFY COLUMN \`description\` varchar(600) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_staff\` MODIFY COLUMN \`title\` varchar(50) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_staff\` MODIFY COLUMN \`description\` varchar(600) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case_staff\` MODIFY COLUMN \`description\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_staff\` MODIFY COLUMN \`title\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_room\` MODIFY COLUMN \`description\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_room\` MODIFY COLUMN \`title\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_about\` MODIFY COLUMN \`description\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_about\` MODIFY COLUMN \`title\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff\` MODIFY COLUMN \`name\` varchar(45) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` MODIFY COLUMN \`description\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` MODIFY COLUMN \`title\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` MODIFY COLUMN \`description\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` MODIFY COLUMN \`title\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`room_translation\` MODIFY COLUMN \`description\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`room_translation\` MODIFY COLUMN \`title\` varchar(45) NULL`);
    }

}
