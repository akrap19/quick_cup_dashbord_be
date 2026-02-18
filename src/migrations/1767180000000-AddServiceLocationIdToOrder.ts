import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddServiceLocationIdToOrder1767180000000
  implements MigrationInterface
{
  name = 'AddServiceLocationIdToOrder1767180000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD \`service_location_id\` varchar(36) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD CONSTRAINT \`FK_order_service_location\` FOREIGN KEY (\`service_location_id\`) REFERENCES \`service_location\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order\` DROP FOREIGN KEY \`FK_order_service_location\``
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` DROP COLUMN \`service_location_id\``
    )
  }
}

