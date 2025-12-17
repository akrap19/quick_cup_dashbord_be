import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProductServicePrice1765600000000
  implements MigrationInterface
{
  name = 'CreateProductServicePrice1765600000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`product_service_price\` (
          \`id\` varchar(36) NOT NULL,
          \`product_id\` varchar(255) NOT NULL,
          \`service_id\` varchar(255) NOT NULL,
          \`min_quantity\` int NOT NULL,
          \`max_quantity\` int NULL,
          \`price\` decimal(10,4) NOT NULL,
          \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`),
          INDEX \`IDX_product_service_price_composite\` (\`product_id\`, \`service_id\`, \`min_quantity\`),
          CONSTRAINT \`FK_product_service_price_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT \`FK_product_service_price_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`service\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        ) ENGINE=InnoDB`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_service_price\` DROP FOREIGN KEY \`FK_product_service_price_product\``
    )
    await queryRunner.query(
      `ALTER TABLE \`product_service_price\` DROP FOREIGN KEY \`FK_product_service_price_service\``
    )
    await queryRunner.query(`DROP TABLE \`product_service_price\``)
  }
}
