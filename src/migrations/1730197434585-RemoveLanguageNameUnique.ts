import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveLanguageNameUnique1730197434585 implements MigrationInterface {
    name = 'RemoveLanguageNameUnique1730197434585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_fc559cc1533fd7b0b05b01ff3f\` ON \`barnahus_language\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_fc559cc1533fd7b0b05b01ff3f\` ON \`barnahus_language\` (\`name\`)`);
    }

}
