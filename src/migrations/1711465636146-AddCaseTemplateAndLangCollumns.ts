import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCaseTemplateAndLangCollumns1711465636146 implements MigrationInterface {
    name = 'AddCaseTemplateAndLangCollumns1711465636146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case\` ADD \`template_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`case\` ADD \`language_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`case\` ADD CONSTRAINT \`FK_a23c8106c3dc811d0ef57366329\` FOREIGN KEY (\`template_id\`) REFERENCES \`template\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case\` ADD CONSTRAINT \`FK_8b33fa87fe3fd91c28b3c4ed1af\` FOREIGN KEY (\`language_id\`) REFERENCES \`barnahus_language\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case\` DROP FOREIGN KEY \`FK_8b33fa87fe3fd91c28b3c4ed1af\``);
        await queryRunner.query(`ALTER TABLE \`case\` DROP FOREIGN KEY \`FK_a23c8106c3dc811d0ef57366329\``);
        await queryRunner.query(`ALTER TABLE \`case\` DROP COLUMN \`language_id\``);
        await queryRunner.query(`ALTER TABLE \`case\` DROP COLUMN \`template_id\``);
    }

}
