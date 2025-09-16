import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveTemplateNameUnique1730198368122 implements MigrationInterface {
    name = 'RemoveTemplateNameUnique1730198368122'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_a62147c0d6b868e797061e142a\` ON \`template\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_a62147c0d6b868e797061e142a\` ON \`template\` (\`name\`)`);
    }

}
