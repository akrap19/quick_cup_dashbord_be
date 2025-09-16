import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorCases1715089810741 implements MigrationInterface {
    name = 'RefactorCases1715089810741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`case\` DROP COLUMN \`user_id\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case\` ADD \`user_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`case\` ADD \`status\` enum ('Open', 'In Progress', 'Closed') NOT NULL DEFAULT 'Open'`);
    }

}
