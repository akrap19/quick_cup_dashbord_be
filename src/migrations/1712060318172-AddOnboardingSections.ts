import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOnboardingSections1712060318172 implements MigrationInterface {
    name = 'AddOnboardingSections1712060318172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`onboarding_section\` (\`id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`name\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_28aca639b345951d3618651689\` (\`name\`), UNIQUE INDEX \`IDX_83d90345a154a5808f207a8fa1\` (\`user_id\`, \`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`onboarding_section\` ADD CONSTRAINT \`FK_703dbbc2b54ae0cee23ea9c6dca\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`onboarding_section\` DROP FOREIGN KEY \`FK_703dbbc2b54ae0cee23ea9c6dca\``);
        await queryRunner.query(`DROP INDEX \`IDX_83d90345a154a5808f207a8fa1\` ON \`onboarding_section\``);
        await queryRunner.query(`DROP INDEX \`IDX_28aca639b345951d3618651689\` ON \`onboarding_section\``);
        await queryRunner.query(`DROP TABLE \`onboarding_section\``);
    }

}
