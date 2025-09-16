import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueTranslations1731340092977 implements MigrationInterface {
    name = 'AddUniqueTranslations1731340092977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_1d2114c301924142176ea0c5db\` ON \`room_translation\` (\`room_id\`, \`language_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_9c1662304bea19d712d0e1c991\` ON \`about_translation\` (\`about_id\`, \`language_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_2f964083fd2fc3fc130138ca5a\` ON \`staff_translation\` (\`staff_id\`, \`language_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_2f964083fd2fc3fc130138ca5a\` ON \`staff_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_9c1662304bea19d712d0e1c991\` ON \`about_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_1d2114c301924142176ea0c5db\` ON \`room_translation\``);
    }

}
