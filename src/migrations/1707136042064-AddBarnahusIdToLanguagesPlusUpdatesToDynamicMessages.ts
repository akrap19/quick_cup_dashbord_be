import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBarnahusIdToLanguagesPlusUpdatesToDynamicMessages1707136042064 implements MigrationInterface {
    name = 'AddBarnahusIdToLanguagesPlusUpdatesToDynamicMessages1707136042064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`barnahus_language\` ADD \`barnahus_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_abbf8916d99608f357e25ac3b8\` ON \`dynamic_messages\``);
        await queryRunner.query(`ALTER TABLE \`dynamic_messages\` DROP COLUMN \`slug\``);
        await queryRunner.query(`ALTER TABLE \`dynamic_messages\` ADD \`slug\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`dynamic_messages\` ADD UNIQUE INDEX \`IDX_abbf8916d99608f357e25ac3b8\` (\`slug\`)`);
        await queryRunner.query(`ALTER TABLE \`barnahus_language\` ADD CONSTRAINT \`FK_dabf8339c8c1740b1ae4210148e\` FOREIGN KEY (\`barnahus_id\`) REFERENCES \`barnahus\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`barnahus_language\` DROP FOREIGN KEY \`FK_dabf8339c8c1740b1ae4210148e\``);
        await queryRunner.query(`ALTER TABLE \`dynamic_messages\` DROP INDEX \`IDX_abbf8916d99608f357e25ac3b8\``);
        await queryRunner.query(`ALTER TABLE \`dynamic_messages\` DROP COLUMN \`slug\``);
        await queryRunner.query(`ALTER TABLE \`dynamic_messages\` ADD \`slug\` varchar(10) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_abbf8916d99608f357e25ac3b8\` ON \`dynamic_messages\` (\`slug\`)`);
        await queryRunner.query(`ALTER TABLE \`barnahus_language\` DROP COLUMN \`barnahus_id\``);
    }

}
