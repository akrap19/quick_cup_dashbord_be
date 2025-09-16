import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCaseTable1711367784196 implements MigrationInterface {
    name = 'AddCaseTable1711367784196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`case\` (\`id\` varchar(36) NOT NULL, \`custom_id\` varchar(36) NOT NULL, \`status\` enum ('Open', 'InProgress', 'Closed', 'Other') NOT NULL DEFAULT 'Open', \`barnahus_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_1b27564a7b7ab852da013b6fb3\` (\`custom_id\`), UNIQUE INDEX \`IDX_b3a0ef322028569f55b1e199ab\` (\`custom_id\`, \`barnahus_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`case\` ADD CONSTRAINT \`FK_6ae79389b53faff900137973a9f\` FOREIGN KEY (\`barnahus_id\`) REFERENCES \`barnahus\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case\` DROP FOREIGN KEY \`FK_6ae79389b53faff900137973a9f\``);
        await queryRunner.query(`DROP INDEX \`IDX_b3a0ef322028569f55b1e199ab\` ON \`case\``);
        await queryRunner.query(`DROP INDEX \`IDX_1b27564a7b7ab852da013b6fb3\` ON \`case\``);
        await queryRunner.query(`DROP TABLE \`case\``);
    }

}
