import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTemplateTables1711368064513 implements MigrationInterface {
    name = 'AddTemplateTables1711368064513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`template_room\` (\`id\` varchar(36) NOT NULL, \`template_id\` varchar(255) NOT NULL, \`room_id\` varchar(255) NOT NULL, \`order_number\` int NOT NULL, \`include_description\` tinyint NOT NULL DEFAULT 1, \`include_audio\` tinyint NOT NULL DEFAULT 1, \`include_image\` tinyint NOT NULL DEFAULT 1, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_a80255b740bd8888a4e92b6a48\` (\`template_id\`, \`room_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`template_about\` (\`id\` varchar(36) NOT NULL, \`template_id\` varchar(255) NOT NULL, \`about_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_a0630282dd3dbe7ff06e3c7517\` (\`template_id\`, \`about_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`template_staff\` (\`id\` varchar(36) NOT NULL, \`template_id\` varchar(255) NOT NULL, \`staff_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_325f49e8778b1783dcce3a107a\` (\`template_id\`, \`staff_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`template\` (\`id\` varchar(36) NOT NULL, \`barnahus_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`template_room\` ADD CONSTRAINT \`FK_fbe211b593ea30de30490d10c2f\` FOREIGN KEY (\`template_id\`) REFERENCES \`template\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`template_room\` ADD CONSTRAINT \`FK_3f4c1297ed50de52417614ba11f\` FOREIGN KEY (\`room_id\`) REFERENCES \`room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`template_about\` ADD CONSTRAINT \`FK_144d160e0179a28cd99d2720975\` FOREIGN KEY (\`template_id\`) REFERENCES \`template\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`template_about\` ADD CONSTRAINT \`FK_f1450732b017a183c032ee558b8\` FOREIGN KEY (\`about_id\`) REFERENCES \`about\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`template_staff\` ADD CONSTRAINT \`FK_2124d2e1d1a2134bb81a714cd35\` FOREIGN KEY (\`template_id\`) REFERENCES \`template\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`template_staff\` ADD CONSTRAINT \`FK_255d52c12e95ac48e92c69e2db7\` FOREIGN KEY (\`staff_id\`) REFERENCES \`staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`template\` ADD CONSTRAINT \`FK_df1c96ef22af1832d4ef99933b0\` FOREIGN KEY (\`barnahus_id\`) REFERENCES \`barnahus\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`template\` DROP FOREIGN KEY \`FK_df1c96ef22af1832d4ef99933b0\``);
        await queryRunner.query(`ALTER TABLE \`template_staff\` DROP FOREIGN KEY \`FK_255d52c12e95ac48e92c69e2db7\``);
        await queryRunner.query(`ALTER TABLE \`template_staff\` DROP FOREIGN KEY \`FK_2124d2e1d1a2134bb81a714cd35\``);
        await queryRunner.query(`ALTER TABLE \`template_about\` DROP FOREIGN KEY \`FK_f1450732b017a183c032ee558b8\``);
        await queryRunner.query(`ALTER TABLE \`template_about\` DROP FOREIGN KEY \`FK_144d160e0179a28cd99d2720975\``);
        await queryRunner.query(`ALTER TABLE \`template_room\` DROP FOREIGN KEY \`FK_3f4c1297ed50de52417614ba11f\``);
        await queryRunner.query(`ALTER TABLE \`template_room\` DROP FOREIGN KEY \`FK_fbe211b593ea30de30490d10c2f\``);
        await queryRunner.query(`DROP TABLE \`template\``);
        await queryRunner.query(`DROP INDEX \`IDX_325f49e8778b1783dcce3a107a\` ON \`template_staff\``);
        await queryRunner.query(`DROP TABLE \`template_staff\``);
        await queryRunner.query(`DROP INDEX \`IDX_a0630282dd3dbe7ff06e3c7517\` ON \`template_about\``);
        await queryRunner.query(`DROP TABLE \`template_about\``);
        await queryRunner.query(`DROP INDEX \`IDX_a80255b740bd8888a4e92b6a48\` ON \`template_room\``);
        await queryRunner.query(`DROP TABLE \`template_room\``);
    }

}
