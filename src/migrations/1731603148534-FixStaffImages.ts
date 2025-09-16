import { MigrationInterface, QueryRunner } from "typeorm";

export class FixStaffImages1731603148534 implements MigrationInterface {
    name = 'FixStaffImages1731603148534'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case_staff_image\` DROP FOREIGN KEY \`FK_87482910a854da6d1514b8d9796\``);
        await queryRunner.query(`ALTER TABLE \`case_staff_image\` DROP COLUMN \`case_room_id\``);
        await queryRunner.query(`ALTER TABLE \`case_staff_image\` ADD CONSTRAINT \`FK_e3d030c817de1372b99c47a238e\` FOREIGN KEY (\`case_staff_id\`) REFERENCES \`case_staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`case_staff_image\` DROP FOREIGN KEY \`FK_e3d030c817de1372b99c47a238e\``);
        await queryRunner.query(`ALTER TABLE \`case_staff_image\` ADD \`case_room_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`case_staff_image\` ADD CONSTRAINT \`FK_87482910a854da6d1514b8d9796\` FOREIGN KEY (\`case_room_id\`) REFERENCES \`case_staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
