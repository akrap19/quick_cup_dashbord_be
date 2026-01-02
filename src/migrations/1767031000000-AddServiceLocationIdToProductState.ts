import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddServiceLocationIdToProductState1767031000000
  implements MigrationInterface
{
  name = 'AddServiceLocationIdToProductState1767031000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_state\` ADD \`service_location_id\` varchar(36) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`product_state\` ADD INDEX \`IDX_product_state_service_location_id\` (\`service_location_id\`)`
    )
    await queryRunner.query(
      `ALTER TABLE \`product_state\` ADD CONSTRAINT \`FK_product_state_service_location\` FOREIGN KEY (\`service_location_id\`) REFERENCES \`service_location\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_state\` DROP FOREIGN KEY \`FK_product_state_service_location\``
    )
    await queryRunner.query(
      `ALTER TABLE \`product_state\` DROP INDEX \`IDX_product_state_service_location_id\``
    )
    await queryRunner.query(
      `ALTER TABLE \`product_state\` DROP COLUMN \`service_location_id\``
    )
  }
}

