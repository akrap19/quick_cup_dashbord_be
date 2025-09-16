import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBarnahusLocationCode1712923154675 implements MigrationInterface {
    name = 'AddBarnahusLocationCode1712923154675'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`barnahus\` ADD \`location_code\` varchar(9) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`barnahus\` DROP COLUMN \`location_code\``);
    }

}
