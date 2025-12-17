import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreatePriceProductModel1765056680098
  implements MigrationInterface
{
  name = 'CreatePriceProductModel1765056680098'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table already exists
    await queryRunner.query(
      `CREATE TABLE \`product_price\` (
          \`id\` varchar(36) NOT NULL,
          \`product_id\` varchar(255) NOT NULL,
          \`min_quantity\` int NOT NULL,
          \`max_quantity\` int NULL,
          \`price\` decimal(10,2) NOT NULL,
          \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`),
          INDEX \`IDX_c9fa84786d232b20298d96402d\` (\`product_id\`, \`min_quantity\`),
          CONSTRAINT \`FK_0da08b762f53700e4f8760a9b5c\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        ) ENGINE=InnoDB`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_price\` DROP FOREIGN KEY \`FK_0da08b762f53700e4f8760a9b5c\``
    )
    await queryRunner.query(`DROP TABLE \`product_price\``)
  }
}
