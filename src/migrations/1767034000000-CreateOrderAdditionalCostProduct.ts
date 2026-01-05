import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateOrderAdditionalCostProduct1767034000000
  implements MigrationInterface
{
  name = 'CreateOrderAdditionalCostProduct1767034000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`order_additional_cost_product\` (
        \`id\` varchar(36) NOT NULL,
        \`order_additional_cost_id\` varchar(255) NOT NULL,
        \`product_id\` varchar(255) NOT NULL,
        \`quantity\` int NOT NULL,
        \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        INDEX \`IDX_order_additional_cost_product_order_additional_cost_product\` (\`order_additional_cost_id\`, \`product_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `ALTER TABLE \`order_additional_cost_product\` ADD CONSTRAINT \`FK_order_additional_cost_product_order_additional_cost\` FOREIGN KEY (\`order_additional_cost_id\`) REFERENCES \`order_additional_cost\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`order_additional_cost_product\` ADD CONSTRAINT \`FK_order_additional_cost_product_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_additional_cost_product\` DROP FOREIGN KEY \`FK_order_additional_cost_product_product\``
    )
    await queryRunner.query(
      `ALTER TABLE \`order_additional_cost_product\` DROP FOREIGN KEY \`FK_order_additional_cost_product_order_additional_cost\``
    )
    await queryRunner.query(`DROP TABLE \`order_additional_cost_product\``)
  }
}

