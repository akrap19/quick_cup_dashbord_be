import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailTemplates1706710311312 implements MigrationInterface {
    name = 'AddEmailTemplates1706710311312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`email_template\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`template_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`email_template\``);
    }

}
