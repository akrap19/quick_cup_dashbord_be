import { MigrationInterface, QueryRunner } from "typeorm";

export class FixOnboardingUniqueConstraint1712578928235 implements MigrationInterface {
    name = 'FixOnboardingUniqueConstraint1712578928235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_28aca639b345951d3618651689\` ON \`onboarding_section\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_28aca639b345951d3618651689\` ON \`onboarding_section\` (\`name\`)`);
    }

}
