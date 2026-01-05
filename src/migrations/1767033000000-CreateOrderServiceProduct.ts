import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateOrderServiceProduct1767033000000
  implements MigrationInterface
{
  name = 'CreateOrderServiceProduct1767033000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`order_service_product\` (
        \`id\` varchar(36) NOT NULL,
        \`order_service_id\` varchar(255) NOT NULL,
        \`product_id\` varchar(255) NOT NULL,
        \`quantity\` int NOT NULL,
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX \`IDX_order_service_product_order_service_product\` (\`order_service_id\`, \`product_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `ALTER TABLE \`order_service_product\` ADD CONSTRAINT \`FK_order_service_product_order_service\` FOREIGN KEY (\`order_service_id\`) REFERENCES \`order_service\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`order_service_product\` ADD CONSTRAINT \`FK_order_service_product_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_service_product\` DROP FOREIGN KEY \`FK_order_service_product_product\``
    )
    await queryRunner.query(
      `ALTER TABLE \`order_service_product\` DROP FOREIGN KEY \`FK_order_service_product_order_service\``
    )
    await queryRunner.query(`DROP TABLE \`order_service_product\``)
  }
}

