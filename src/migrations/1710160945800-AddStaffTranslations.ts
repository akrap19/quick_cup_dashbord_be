import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStaffTranslations1710160945800 implements MigrationInterface {
    name = 'AddStaffTranslations1710160945800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`staff_image\` (\`id\` varchar(36) NOT NULL, \`staff_id\` varchar(255) NOT NULL, \`media_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_283b258cc3ffb069d6f92d3229\` (\`staff_id\`, \`media_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`staff_translation\` (\`id\` varchar(36) NOT NULL, \`staff_id\` varchar(255) NOT NULL, \`language_id\` varchar(255) NOT NULL, \`title\` varchar(45) NOT NULL, \`description\` varchar(45) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_d3637acfe126257180d35852b4\` (\`title\`), UNIQUE INDEX \`IDX_5c69f48ac82b737b665cab62e3\` (\`description\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`staff\` (\`id\` varchar(36) NOT NULL, \`barnahus_id\` varchar(255) NOT NULL, \`name\` varchar(45) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`staff_image\` ADD CONSTRAINT \`FK_2c7296b2e339a6ec395bb290df7\` FOREIGN KEY (\`staff_id\`) REFERENCES \`staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`staff_image\` ADD CONSTRAINT \`FK_3f271cd7b84a6ba8b2b0fcaef7b\` FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` ADD CONSTRAINT \`FK_8bd278a97c98326f3d5fcc3d48f\` FOREIGN KEY (\`staff_id\`) REFERENCES \`staff\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` ADD CONSTRAINT \`FK_154b945a99e20f1f5e124b9e7bd\` FOREIGN KEY (\`language_id\`) REFERENCES \`barnahus_language\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`staff\` ADD CONSTRAINT \`FK_35f551a725fea36628a1f097c87\` FOREIGN KEY (\`barnahus_id\`) REFERENCES \`barnahus\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff\` DROP FOREIGN KEY \`FK_35f551a725fea36628a1f097c87\``);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` DROP FOREIGN KEY \`FK_154b945a99e20f1f5e124b9e7bd\``);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` DROP FOREIGN KEY \`FK_8bd278a97c98326f3d5fcc3d48f\``);
        await queryRunner.query(`ALTER TABLE \`staff_image\` DROP FOREIGN KEY \`FK_3f271cd7b84a6ba8b2b0fcaef7b\``);
        await queryRunner.query(`ALTER TABLE \`staff_image\` DROP FOREIGN KEY \`FK_2c7296b2e339a6ec395bb290df7\``);
        await queryRunner.query(`DROP TABLE \`staff\``);
        await queryRunner.query(`DROP INDEX \`IDX_5c69f48ac82b737b665cab62e3\` ON \`staff_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_d3637acfe126257180d35852b4\` ON \`staff_translation\``);
        await queryRunner.query(`DROP TABLE \`staff_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_283b258cc3ffb069d6f92d3229\` ON \`staff_image\``);
        await queryRunner.query(`DROP TABLE \`staff_image\``);
    }

}
