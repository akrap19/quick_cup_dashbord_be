import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDynamicMessages1706107007210 implements MigrationInterface {
    name = 'AddDynamicMessages1706107007210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`dynamic_messages\` (\`id\` varchar(36) NOT NULL, \`slug\` varchar(36) NOT NULL, \`title\` varchar(127) NOT NULL, \`message\` varchar(255) NOT NULL, \`redirect_url\` varchar(255) NULL, \`type\` enum ('Error', 'Success', 'Info', '404') NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_abbf8916d99608f357e25ac3b8\` (\`slug\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_abbf8916d99608f357e25ac3b8\` ON \`dynamic_messages\``);
        await queryRunner.query(`DROP TABLE \`dynamic_messages\``);
    }

}
