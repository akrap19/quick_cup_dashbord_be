import { MigrationInterface, QueryRunner } from "typeorm";

export class AddApiKey1741182002142 implements MigrationInterface {
    name = 'AddApiKey1741182002142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`api_key\` (\`id\` varchar(36) NOT NULL, \`key\` varchar(20) NOT NULL, \`description\` varchar(100) NULL, \`is_active\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_fb080786c16de6ace7ed0b69f7\` (\`key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_fb080786c16de6ace7ed0b69f7\` ON \`api_key\``);
        await queryRunner.query(`DROP TABLE \`api_key\``);
    }

}
