import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBarnahusLanguagesTable1706715566611 implements MigrationInterface {
    name = 'AddBarnahusLanguagesTable1706715566611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`barnahus_language\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(36) NOT NULL, \`status\` enum ('Draft', 'Published', 'Hidden') NOT NULL, \`auto_translate\` tinyint NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_fc559cc1533fd7b0b05b01ff3f\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_fc559cc1533fd7b0b05b01ff3f\` ON \`barnahus_language\``);
        await queryRunner.query(`DROP TABLE \`barnahus_language\``);
    }

}
