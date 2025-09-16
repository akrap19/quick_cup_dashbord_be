import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserRoleBarnahusTable1704838452610
  implements MigrationInterface
{
  name = 'AddUserRoleBarnahusTable1704838452610'

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `CREATE TABLE \`user_role_barnahus\` (\`id\` varchar(36) NOT NULL, \`user_role_id\` varchar(255) NOT NULL, \`barnahus_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_6a8a327bef07944f4a3c0dcfdd\` (\`user_role_id\`, \`barnahus_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
    queryRunner.query(
      `ALTER TABLE \`user_role_barnahus\` ADD CONSTRAINT \`FK_43f704e05f72dd6355b2208fa31\` FOREIGN KEY (\`user_role_id\`) REFERENCES \`user_role\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    queryRunner.query(
      `ALTER TABLE \`user_role_barnahus\` ADD CONSTRAINT \`FK_2d38849bbee43a1fde23dc69d91\` FOREIGN KEY (\`barnahus_id\`) REFERENCES \`barnahus\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `ALTER TABLE \`user_role_barnahus\` DROP FOREIGN KEY \`FK_2d38849bbee43a1fde23dc69d91\``
    )
    queryRunner.query(
      `ALTER TABLE \`user_role_barnahus\` DROP FOREIGN KEY \`FK_43f704e05f72dd6355b2208fa31\``
    )
    queryRunner.query(
      `DROP INDEX \`IDX_6a8a327bef07944f4a3c0dcfdd\` ON \`user_role_barnahus\``
    )
    queryRunner.query(`DROP TABLE \`user_role_barnahus\``)
  }
}
