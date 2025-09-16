import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfession1710150459840 implements MigrationInterface {
    name = 'AddUserProfession1710150459840'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_role_barnahus\` ADD \`user_profession\` varchar(127) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_role_barnahus\` ADD \`assigned_by_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_role_barnahus\` ADD CONSTRAINT \`FK_bb3c8acbaefb6b0e515e7f76b75\` FOREIGN KEY (\`assigned_by_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_role_barnahus\` DROP FOREIGN KEY \`FK_bb3c8acbaefb6b0e515e7f76b75\``);
        await queryRunner.query(`ALTER TABLE \`user_role_barnahus\` DROP COLUMN \`assigned_by_id\``);
        await queryRunner.query(`ALTER TABLE \`user_role_barnahus\` DROP COLUMN \`user_profession\``);
    }

}
