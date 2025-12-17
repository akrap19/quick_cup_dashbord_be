import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateClientProductPrice1765079918328
  implements MigrationInterface
{
  name = 'CreateClientProductPrice1765079918328'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`client_product_price\` (
          \`id\` varchar(36) NOT NULL,
          \`client_id\` varchar(255) NOT NULL,
          \`product_id\` varchar(255) NOT NULL,
          \`min_quantity\` int NOT NULL,
          \`max_quantity\` int NULL,
          \`price\` decimal(10,4) NOT NULL,
          \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`),
          INDEX \`IDX_client_product_price_composite\` (\`client_id\`, \`product_id\`, \`min_quantity\`),
          CONSTRAINT \`FK_client_product_price_client\` FOREIGN KEY (\`client_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT \`FK_client_product_price_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        ) ENGINE=InnoDB`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`client_product_price\` DROP FOREIGN KEY \`FK_client_product_price_client\``
    )
    await queryRunner.query(
      `ALTER TABLE \`client_product_price\` DROP FOREIGN KEY \`FK_client_product_price_product\``
    )
    await queryRunner.query(`DROP TABLE \`client_product_price\``)
  }
}

