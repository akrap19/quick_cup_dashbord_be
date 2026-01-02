import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProductState1767019287000 implements MigrationInterface {
  name = 'CreateProductState1767019287000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`product_state\` (
          \`id\` varchar(36) NOT NULL,
          \`status\` enum ('available', 'in_use', 'maintenance', 'reserved', 'damaged') NOT NULL,
          \`location\` enum ('service', 'user') NOT NULL,
          \`quantity\` int NOT NULL,
          \`product_id\` varchar(255) NOT NULL,
          \`service_id\` varchar(255) NULL,
          \`user_id\` varchar(255) NULL,
          \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`),
          INDEX \`IDX_product_state_product_id\` (\`product_id\`),
          INDEX \`IDX_product_state_service_id\` (\`service_id\`),
          INDEX \`IDX_product_state_user_id\` (\`user_id\`)
        ) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `ALTER TABLE \`product_state\` ADD CONSTRAINT \`FK_product_state_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`product_state\` ADD CONSTRAINT \`FK_product_state_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`service\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`product_state\` ADD CONSTRAINT \`FK_product_state_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_state\` DROP FOREIGN KEY \`FK_product_state_product\``
    )
    await queryRunner.query(
      `ALTER TABLE \`product_state\` DROP FOREIGN KEY \`FK_product_state_service\``
    )
    await queryRunner.query(
      `ALTER TABLE \`product_state\` DROP FOREIGN KEY \`FK_product_state_user\``
    )
    await queryRunner.query(`DROP TABLE \`product_state\``)
  }
}
