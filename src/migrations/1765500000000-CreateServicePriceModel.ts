import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateServicePriceModel1765500000000
  implements MigrationInterface
{
  name = 'CreateServicePriceModel1765500000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`service_price\` (
          \`id\` varchar(36) NOT NULL,
          \`service_id\` varchar(255) NOT NULL,
          \`price_calculation_unit\` enum('piece', 'unit', 'transportationUnit') NOT NULL,
          \`billing_frequency\` enum('onetime', 'daily', 'weekly', 'monthly', 'yearly') NOT NULL,
          \`min_quantity\` int NOT NULL,
          \`max_quantity\` int NULL,
          \`price\` decimal(10,4) NOT NULL,
          \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`),
          INDEX \`IDX_service_price_composite\` (\`service_id\`, \`min_quantity\`),
          CONSTRAINT \`FK_service_price_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`service\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        ) ENGINE=InnoDB`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`service_price\` DROP FOREIGN KEY \`FK_service_price_service\``
    )
    await queryRunner.query(`DROP TABLE \`service_price\``)
  }
}

