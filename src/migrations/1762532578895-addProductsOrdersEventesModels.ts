import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddProductsOrdersEventesModels1762532578895
  implements MigrationInterface
{
  name = 'AddProductsOrdersEventesModels1762532578895'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`product\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(128) NOT NULL, \`sku\` varchar(64) NULL, \`description\` text NULL, \`price\` float NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_262b5f1246459dfb29d0a3dd3f\` (\`sku\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `CREATE TABLE \`order\` (\`id\` varchar(36) NOT NULL, \`order_number\` varchar(64) NOT NULL, \`status\` varchar(64) NOT NULL, \`total_amount\` float NOT NULL, \`customer_name\` varchar(128) NULL, \`notes\` text NULL, \`placed_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_f08b33fb0793b5617a4e0a7f2e\` (\`order_number\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `CREATE TABLE \`event_model\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(128) NOT NULL, \`description\` text NULL, \`start_date\` timestamp(6) NOT NULL, \`end_date\` timestamp(6) NULL, \`location\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`event_model\``)
    await queryRunner.query(
      `DROP INDEX \`IDX_f08b33fb0793b5617a4e0a7f2e\` ON \`order\``
    )
    await queryRunner.query(`DROP TABLE \`order\``)
    await queryRunner.query(
      `DROP INDEX \`IDX_262b5f1246459dfb29d0a3dd3f\` ON \`product\``
    )
    await queryRunner.query(`DROP TABLE \`product\``)
  }
}
