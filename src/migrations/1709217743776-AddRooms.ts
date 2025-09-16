import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRooms1709217743776 implements MigrationInterface {
    name = 'AddRooms1709217743776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`media\` (\`id\` varchar(36) NOT NULL, \`url\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`type\` enum ('Image', 'Audio', 'Video') NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_42a60c07e4b566f0cc06a1eaaf\` (\`url\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room_translation\` (\`id\` varchar(36) NOT NULL, \`room_id\` varchar(255) NOT NULL, \`language_id\` varchar(255) NOT NULL, \`title\` varchar(45) NOT NULL, \`description\` varchar(45) NOT NULL, \`audio_id\` varchar(255) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_aaf7a643f1d68475a57f1eceea\` (\`title\`), UNIQUE INDEX \`IDX_afd12b86b9954f6aa0b7fbd8a5\` (\`description\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room_image\` (\`id\` varchar(36) NOT NULL, \`room_id\` varchar(255) NOT NULL, \`media_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ce3d68b0ee4350a52eac4bfea4\` (\`room_id\`, \`media_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room\` (\`id\` varchar(36) NOT NULL, \`barnahus_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`room_translation\` ADD CONSTRAINT \`FK_06c265a01bc34e760993ddc6cc1\` FOREIGN KEY (\`room_id\`) REFERENCES \`room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room_translation\` ADD CONSTRAINT \`FK_149dafb2ac23c8a9051bab9842b\` FOREIGN KEY (\`language_id\`) REFERENCES \`barnahus_language\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room_translation\` ADD CONSTRAINT \`FK_a765343fdfc5d56080a3ab34b49\` FOREIGN KEY (\`audio_id\`) REFERENCES \`media\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room_image\` ADD CONSTRAINT \`FK_35ee2cf0c1288e44be6a54da441\` FOREIGN KEY (\`room_id\`) REFERENCES \`room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room_image\` ADD CONSTRAINT \`FK_e17b0be81560c1d460994d3e1b7\` FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room\` ADD CONSTRAINT \`FK_08e9e5a1dc1e7755402e32ad55e\` FOREIGN KEY (\`barnahus_id\`) REFERENCES \`barnahus\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`room\` DROP FOREIGN KEY \`FK_08e9e5a1dc1e7755402e32ad55e\``);
        await queryRunner.query(`ALTER TABLE \`room_image\` DROP FOREIGN KEY \`FK_e17b0be81560c1d460994d3e1b7\``);
        await queryRunner.query(`ALTER TABLE \`room_image\` DROP FOREIGN KEY \`FK_35ee2cf0c1288e44be6a54da441\``);
        await queryRunner.query(`ALTER TABLE \`room_translation\` DROP FOREIGN KEY \`FK_a765343fdfc5d56080a3ab34b49\``);
        await queryRunner.query(`ALTER TABLE \`room_translation\` DROP FOREIGN KEY \`FK_149dafb2ac23c8a9051bab9842b\``);
        await queryRunner.query(`ALTER TABLE \`room_translation\` DROP FOREIGN KEY \`FK_06c265a01bc34e760993ddc6cc1\``);
        await queryRunner.query(`DROP TABLE \`room\``);
        await queryRunner.query(`DROP INDEX \`IDX_ce3d68b0ee4350a52eac4bfea4\` ON \`room_image\``);
        await queryRunner.query(`DROP TABLE \`room_image\``);
        await queryRunner.query(`DROP INDEX \`IDX_afd12b86b9954f6aa0b7fbd8a5\` ON \`room_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_aaf7a643f1d68475a57f1eceea\` ON \`room_translation\``);
        await queryRunner.query(`DROP TABLE \`room_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_42a60c07e4b566f0cc06a1eaaf\` ON \`media\``);
        await queryRunner.query(`DROP TABLE \`media\``);
    }

}
