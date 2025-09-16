import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPassword1739799455596 implements MigrationInterface {
    name = 'AddPassword1739799455596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`template\` ADD \`password\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`template\` DROP COLUMN \`password\``);
    }

}
