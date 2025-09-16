import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCanAddNotesCollumn1713959302151 implements MigrationInterface {
    name = 'AddCanAddNotesCollumn1713959302151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case\` ADD \`user_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`case\` ADD \`can_add_notes\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case\` DROP COLUMN \`can_add_notes\``);
        await queryRunner.query(`ALTER TABLE \`case\` DROP COLUMN \`user_id\``);
    }

}
