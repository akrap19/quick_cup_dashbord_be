import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNullableFields1710842724143 implements MigrationInterface {
    name = 'AddNullableFields1710842724143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_aaf7a643f1d68475a57f1eceea\` ON \`room_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_afd12b86b9954f6aa0b7fbd8a5\` ON \`room_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_2335f094881315bebbcb484bfa\` ON \`about_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_b37e9cc6bde10c7e3a80bca302\` ON \`about_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_5c69f48ac82b737b665cab62e3\` ON \`staff_translation\``);
        await queryRunner.query(`DROP INDEX \`IDX_d3637acfe126257180d35852b4\` ON \`staff_translation\``);
        await queryRunner.query(`ALTER TABLE \`room_translation\` CHANGE \`title\` \`title\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`room_translation\` CHANGE \`description\` \`description\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` CHANGE \`title\` \`title\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` CHANGE \`description\` \`description\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` CHANGE \`title\` \`title\` varchar(45) NULL`);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` CHANGE \`description\` \`description\` varchar(45) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`staff_translation\` CHANGE \`description\` \`description\` varchar(45) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`staff_translation\` CHANGE \`title\` \`title\` varchar(45) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` CHANGE \`description\` \`description\` varchar(45) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`about_translation\` CHANGE \`title\` \`title\` varchar(45) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`room_translation\` CHANGE \`description\` \`description\` varchar(45) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`room_translation\` CHANGE \`title\` \`title\` varchar(45) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_d3637acfe126257180d35852b4\` ON \`staff_translation\` (\`title\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_5c69f48ac82b737b665cab62e3\` ON \`staff_translation\` (\`description\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_b37e9cc6bde10c7e3a80bca302\` ON \`about_translation\` (\`title\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_2335f094881315bebbcb484bfa\` ON \`about_translation\` (\`description\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_afd12b86b9954f6aa0b7fbd8a5\` ON \`room_translation\` (\`description\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_aaf7a643f1d68475a57f1eceea\` ON \`room_translation\` (\`title\`)`);
    }

}
