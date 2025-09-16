import { MigrationInterface, QueryRunner } from "typeorm";

export class ImplementCaseNotes1716206210394 implements MigrationInterface {
    name = 'ImplementCaseNotes1716206210394'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`about_note\` (\`id\` varchar(36) NOT NULL, \`case_about_id\` varchar(255) NOT NULL, \`note\` varchar(500) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room_note\` (\`id\` varchar(36) NOT NULL, \`case_room_id\` varchar(255) NOT NULL, \`note\` varchar(500) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`staff_note\` (\`id\` varchar(36) NOT NULL, \`case_staff_id\` varchar(255) NOT NULL, \`note\` varchar(500) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`about_note\` ADD CONSTRAINT \`FK_bcdc8b453653c08a118a8d0af0c\` FOREIGN KEY (\`case_about_id\`) REFERENCES \`case_about\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`room_note\` ADD CONSTRAINT \`FK_f848bb4d39f17123e735d4302af\` FOREIGN KEY (\`case_room_id\`) REFERENCES \`case_room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`staff_note\` ADD CONSTRAINT \`FK_ee1609bf28768054022fa1ad5b9\` FOREIGN KEY (\`case_staff_id\`) REFERENCES \`case_staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff_note\` DROP FOREIGN KEY \`FK_ee1609bf28768054022fa1ad5b9\``);
        await queryRunner.query(`ALTER TABLE \`room_note\` DROP FOREIGN KEY \`FK_f848bb4d39f17123e735d4302af\``);
        await queryRunner.query(`ALTER TABLE \`about_note\` DROP FOREIGN KEY \`FK_bcdc8b453653c08a118a8d0af0c\``);
        await queryRunner.query(`DROP TABLE \`staff_note\``);
        await queryRunner.query(`DROP TABLE \`room_note\``);
        await queryRunner.query(`DROP TABLE \`about_note\``);
    }

}
