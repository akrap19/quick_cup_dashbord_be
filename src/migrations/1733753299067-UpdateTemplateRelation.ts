import { MigrationInterface, QueryRunner } from "typeorm";

export class Temp1733753299067 implements MigrationInterface {
    name = 'Temp1733753299067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case\` DROP FOREIGN KEY \`FK_a23c8106c3dc811d0ef57366329\``);
        await queryRunner.query(`ALTER TABLE \`case\` ADD CONSTRAINT \`FK_a23c8106c3dc811d0ef57366329\` FOREIGN KEY (\`template_id\`) REFERENCES \`template\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case\` DROP FOREIGN KEY \`FK_a23c8106c3dc811d0ef57366329\``);
        await queryRunner.query(`ALTER TABLE \`case\` ADD CONSTRAINT \`FK_a23c8106c3dc811d0ef57366329\` FOREIGN KEY (\`template_id\`) REFERENCES \`template\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
