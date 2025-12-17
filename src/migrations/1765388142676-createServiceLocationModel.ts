import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateServiceLocationModel1765388142676
  implements MigrationInterface
{
  name = 'CreateServiceLocationModel1765388142676'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`service_location\` (\`id\` varchar(36) NOT NULL, \`city\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`phone\` varchar(14) NULL, \`email\` varchar(255) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`service_id\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `ALTER TABLE \`service_location\` ADD CONSTRAINT \`FK_72728a31803c6ff139ca111e77e\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`service_location\` ADD CONSTRAINT \`FK_b7efd2ff01a36ffb61e09191c72\` FOREIGN KEY (\`service_id\`) REFERENCES \`service\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`service_location\` DROP FOREIGN KEY \`FK_b7efd2ff01a36ffb61e09191c72\``
    )
    await queryRunner.query(
      `ALTER TABLE \`service_location\` DROP FOREIGN KEY \`FK_72728a31803c6ff139ca111e77e\``
    )
    await queryRunner.query(`DROP TABLE \`service_location\``)
  }
}
