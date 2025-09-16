import { MigrationInterface, QueryRunner } from "typeorm";

export class AboutEndpoints1709306287246 implements MigrationInterface {
    name = 'AboutEndpoints1709306287246'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`about_image\` (\`id\` varchar(36) NOT NULL, \`about_id\` varchar(255) NOT NULL, \`media_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_bdcbe67f9f844b2ca0570134f7\` (\`about_id\`, \`media_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`about_translation\` (\`id\` varchar(36) NOT NULL, \`about_id\` varchar(255) NOT NULL, \`language_id\` varchar(255) NOT NULL, \`title\` varchar(45) NOT NULL, \`description\` varchar(45) NOT NULL, \`audio_id\` varchar(255) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_b37e9cc6bde10c7e3a80bca302\` (\`title\`), UNIQUE INDEX \`IDX_2335f094881315bebbcb484bfa\` (\`description\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`about\` (\`id\` varchar(36) NOT NULL, \`barnahus_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`about_image\` ADD CONSTRAINT \`FK_c455baf8b2f9b4d396b14d85f61\` FOREIGN KEY (\`about_id\`) REFERENCES \`about\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`about_image\` ADD CONSTRAINT \`FK_d24db1f72311dd9166619f562a5\` FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` ADD CONSTRAINT \`FK_9cb41dabc8c7a0800597f69e116\` FOREIGN KEY (\`about_id\`) REFERENCES \`about\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` ADD CONSTRAINT \`FK_4b0c6bbd954200b7ff529e48c19\` FOREIGN KEY (\`language_id\`) REFERENCES \`barnahus_language\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` ADD CONSTRAINT \`FK_855da2697c307f78e5ec664f3ba\` FOREIGN KEY (\`audio_id\`) REFERENCES \`media\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`about\` ADD CONSTRAINT \`FK_c99a4b01c8999e36cbe1152016e\` FOREIGN KEY (\`barnahus_id\`) REFERENCES \`barnahus\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`about\` DROP FOREIGN KEY \`FK_c99a4b01c8999e36cbe1152016e\``);
        await queryRunner.query(`ALTER TABLE \`about_translation\` DROP FOREIGN KEY \`FK_855da2697c307f78e5ec664f3ba\``);
        await queryRunner.query(`ALTER TABLE \`about_translation\` DROP FOREIGN KEY \`FK_4b0c6bbd954200b7ff529e48c19\``);
        await queryRunner.query(`ALTER TABLE \`about_translation\` DROP FOREIGN KEY \`FK_9cb41dabc8c7a0800597f69e116\``);
        await queryRunner.query(`ALTER TABLE \`about_image\` DROP FOREIGN KEY \`FK_d24db1f72311dd9166619f562a5\``);
        await queryRunner.query(`ALTER TABLE \`about_image\` DROP FOREIGN KEY \`FK_c455baf8b2f9b4d396b14d85f61\``);
        await queryRunner.query(`DROP TABLE \`about\``);
        await queryRunner.query(`DROP INDEX \`IDX_2335f094881315bebbcb484bfa\` ON \`about_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_b37e9cc6bde10c7e3a80bca302\` ON \`about_translation\``);
        await queryRunner.query(`DROP TABLE \`about_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_bdcbe67f9f844b2ca0570134f7\` ON \`about_image\``);
        await queryRunner.query(`DROP TABLE \`about_image\``);
    }

}
