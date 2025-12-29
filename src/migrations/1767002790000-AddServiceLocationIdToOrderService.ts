import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddServiceLocationIdToOrderService1767002790000
  implements MigrationInterface
{
  name = 'AddServiceLocationIdToOrderService1767002790000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_service\` ADD \`service_location_id\` varchar(36) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`order_service\` ADD CONSTRAINT \`FK_order_service_service_location\` FOREIGN KEY (\`service_location_id\`) REFERENCES \`service_location\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_service\` DROP FOREIGN KEY \`FK_order_service_service_location\``
    )
    await queryRunner.query(
      `ALTER TABLE \`order_service\` DROP COLUMN \`service_location_id\``
    )
  }
}
