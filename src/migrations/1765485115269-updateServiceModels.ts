import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateServiceModels1765485115269 implements MigrationInterface {
  name = 'UpdateServiceModels1765485115269'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`service_price\` DROP FOREIGN KEY \`FK_service_price_service\``
    )
    await queryRunner.query(
      `DROP INDEX \`IDX_service_price_composite\` ON \`service_price\``
    )
    await queryRunner.query(
      `ALTER TABLE \`service_price\` DROP COLUMN \`price_calculation_unit\``
    )
    await queryRunner.query(
      `ALTER TABLE \`service_price\` DROP COLUMN \`billing_frequency\``
    )
    await queryRunner.query(
      `ALTER TABLE \`service\` ADD \`price_calculation_unit\` enum ('piece', 'unit', 'transportationUnit') NULL`
    )
    await queryRunner.query(
      `CREATE INDEX \`IDX_2a8ec85fdc4207ead60b25a566\` ON \`service_price\` (\`service_id\`, \`min_quantity\`)`
    )
    await queryRunner.query(
      `ALTER TABLE \`service_price\` ADD CONSTRAINT \`FK_8db5b7d5b965bdc30f528d244ce\` FOREIGN KEY (\`service_id\`) REFERENCES \`service\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`service_price\` DROP FOREIGN KEY \`FK_8db5b7d5b965bdc30f528d244ce\``
    )
    await queryRunner.query(
      `DROP INDEX \`IDX_2a8ec85fdc4207ead60b25a566\` ON \`service_price\``
    )
    await queryRunner.query(
      `ALTER TABLE \`service\` DROP COLUMN \`price_calculation_unit\``
    )
    await queryRunner.query(
      `ALTER TABLE \`service_price\` ADD \`billing_frequency\` enum ('onetime', 'daily', 'weekly', 'monthly', 'yearly') NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`service_price\` ADD \`price_calculation_unit\` enum ('piece', 'unit', 'transportationUnit') NOT NULL`
    )
    await queryRunner.query(
      `CREATE INDEX \`IDX_service_price_composite\` ON \`service_price\` (\`service_id\`, \`min_quantity\`)`
    )
    await queryRunner.query(
      `ALTER TABLE \`service_price\` ADD CONSTRAINT \`FK_service_price_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`service\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }
}
