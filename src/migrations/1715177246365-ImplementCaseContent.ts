import { MigrationInterface, QueryRunner } from "typeorm";

export class ImplementCaseContent1715177246365 implements MigrationInterface {
    name = 'ImplementCaseContent1715177246365'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`case_about\` (\`id\` varchar(36) NOT NULL, \`case_id\` varchar(255) NOT NULL, \`order_number\` int NOT NULL, \`title\` varchar(45) NULL, \`description\` varchar(45) NULL, \`audio_id\` varchar(255) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`case_about_image\` (\`id\` varchar(36) NOT NULL, \`case_about_id\` varchar(255) NOT NULL, \`media_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_c359585b0973dd479900173758\` (\`case_about_id\`, \`media_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`case_room\` (\`id\` varchar(36) NOT NULL, \`case_id\` varchar(255) NOT NULL, \`order_number\` int NOT NULL, \`title\` varchar(45) NULL, \`description\` varchar(45) NULL, \`audio_id\` varchar(255) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`case_room_image\` (\`id\` varchar(36) NOT NULL, \`case_room_id\` varchar(255) NOT NULL, \`media_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_f46d2df03016fb809e2a18fdb9\` (\`case_room_id\`, \`media_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`case_staff\` (\`id\` varchar(36) NOT NULL, \`case_id\` varchar(255) NOT NULL, \`order_number\` int NOT NULL, \`title\` varchar(45) NULL, \`description\` varchar(45) NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`case_staff_image\` (\`id\` varchar(36) NOT NULL, \`case_staff_id\` varchar(255) NOT NULL, \`media_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`case_room_id\` varchar(36) NULL, UNIQUE INDEX \`IDX_943df51199785798884d9416ec\` (\`case_staff_id\`, \`media_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`case_about\` ADD CONSTRAINT \`FK_f9cb86644177cbd431f6bc16325\` FOREIGN KEY (\`case_id\`) REFERENCES \`case\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_about\` ADD CONSTRAINT \`FK_a806ffca89570e0aef56ac9b59e\` FOREIGN KEY (\`audio_id\`) REFERENCES \`media\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_about_image\` ADD CONSTRAINT \`FK_814e749394e4a841cede8efba67\` FOREIGN KEY (\`case_about_id\`) REFERENCES \`case_about\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_about_image\` ADD CONSTRAINT \`FK_7a7a2b36cfe463d3226d6771fe8\` FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_room\` ADD CONSTRAINT \`FK_5c3bb45db6a3fa798fce870b8d3\` FOREIGN KEY (\`case_id\`) REFERENCES \`case\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_room\` ADD CONSTRAINT \`FK_6d69498f5f8194ba6abf4934fd8\` FOREIGN KEY (\`audio_id\`) REFERENCES \`media\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_room_image\` ADD CONSTRAINT \`FK_a7d928fd17a5e68f45eb629d10b\` FOREIGN KEY (\`case_room_id\`) REFERENCES \`case_room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_room_image\` ADD CONSTRAINT \`FK_c7a3fea5a32b76ebc5e10bf7f6b\` FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_staff\` ADD CONSTRAINT \`FK_79c784a941118f913566be7864e\` FOREIGN KEY (\`case_id\`) REFERENCES \`case\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_staff_image\` ADD CONSTRAINT \`FK_87482910a854da6d1514b8d9796\` FOREIGN KEY (\`case_room_id\`) REFERENCES \`case_staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`case_staff_image\` ADD CONSTRAINT \`FK_f9d22b9900c942b301293616e85\` FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case_staff_image\` DROP FOREIGN KEY \`FK_f9d22b9900c942b301293616e85\``);
        await queryRunner.query(`ALTER TABLE \`case_staff_image\` DROP FOREIGN KEY \`FK_87482910a854da6d1514b8d9796\``);
        await queryRunner.query(`ALTER TABLE \`case_staff\` DROP FOREIGN KEY \`FK_79c784a941118f913566be7864e\``);
        await queryRunner.query(`ALTER TABLE \`case_room_image\` DROP FOREIGN KEY \`FK_c7a3fea5a32b76ebc5e10bf7f6b\``);
        await queryRunner.query(`ALTER TABLE \`case_room_image\` DROP FOREIGN KEY \`FK_a7d928fd17a5e68f45eb629d10b\``);
        await queryRunner.query(`ALTER TABLE \`case_room\` DROP FOREIGN KEY \`FK_6d69498f5f8194ba6abf4934fd8\``);
        await queryRunner.query(`ALTER TABLE \`case_room\` DROP FOREIGN KEY \`FK_5c3bb45db6a3fa798fce870b8d3\``);
        await queryRunner.query(`ALTER TABLE \`case_about_image\` DROP FOREIGN KEY \`FK_7a7a2b36cfe463d3226d6771fe8\``);
        await queryRunner.query(`ALTER TABLE \`case_about_image\` DROP FOREIGN KEY \`FK_814e749394e4a841cede8efba67\``);
        await queryRunner.query(`ALTER TABLE \`case_about\` DROP FOREIGN KEY \`FK_a806ffca89570e0aef56ac9b59e\``);
        await queryRunner.query(`ALTER TABLE \`case_about\` DROP FOREIGN KEY \`FK_f9cb86644177cbd431f6bc16325\``);
        await queryRunner.query(`DROP INDEX \`IDX_943df51199785798884d9416ec\` ON \`case_staff_image\``);
        await queryRunner.query(`DROP TABLE \`case_staff_image\``);
        await queryRunner.query(`DROP TABLE \`case_staff\``);
        await queryRunner.query(`DROP INDEX \`IDX_f46d2df03016fb809e2a18fdb9\` ON \`case_room_image\``);
        await queryRunner.query(`DROP TABLE \`case_room_image\``);
        await queryRunner.query(`DROP TABLE \`case_room\``);
        await queryRunner.query(`DROP INDEX \`IDX_c359585b0973dd479900173758\` ON \`case_about_image\``);
        await queryRunner.query(`DROP TABLE \`case_about_image\``);
        await queryRunner.query(`DROP TABLE \`case_about\``);
    }

}
