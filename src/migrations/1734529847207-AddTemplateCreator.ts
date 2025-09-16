import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTemplateCreator1734529847207 implements MigrationInterface {
    name = 'AddTemplateCreator1734529847207'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`template\` ADD \`added_by_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`template\` ADD CONSTRAINT \`FK_f77c98b08a95ade117e01b4b7c4\` FOREIGN KEY (\`added_by_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`template\` DROP FOREIGN KEY \`FK_f77c98b08a95ade117e01b4b7c4\``);
        await queryRunner.query(`ALTER TABLE \`template\` DROP COLUMN \`added_by_id\``);
    }

}
