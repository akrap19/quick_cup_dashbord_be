import { MigrationInterface, QueryRunner } from 'typeorm'

export class DeleteUserCascade1704889487939 implements MigrationInterface {
  name = 'DeleteUserCascade1704889487939'

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `ALTER TABLE \`user_role_barnahus\` DROP FOREIGN KEY \`FK_2d38849bbee43a1fde23dc69d91\``
    )
    queryRunner.query(
      `ALTER TABLE \`user_role_barnahus\` ADD CONSTRAINT \`FK_2d38849bbee43a1fde23dc69d91\` FOREIGN KEY (\`barnahus_id\`) REFERENCES \`barnahus\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `ALTER TABLE \`user_role_barnahus\` DROP FOREIGN KEY \`FK_2d38849bbee43a1fde23dc69d91\``
    )
    queryRunner.query(
      `ALTER TABLE \`user_role_barnahus\` ADD CONSTRAINT \`FK_2d38849bbee43a1fde23dc69d91\` FOREIGN KEY (\`barnahus_id\`) REFERENCES \`barnahus\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`
    )
  }
}
