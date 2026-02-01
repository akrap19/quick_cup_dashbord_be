import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMediaIdToOrderAdditionalCostProduct1767120000000
  implements MigrationInterface
{
  name = 'AddMediaIdToOrderAdditionalCostProduct1767120000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_additional_cost_product\` ADD COLUMN \`media_id\` varchar(36) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`order_additional_cost_product\` ADD CONSTRAINT \`FK_order_additional_cost_product_media\` FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_additional_cost_product\` DROP FOREIGN KEY \`FK_order_additional_cost_product_media\``
    )
    await queryRunner.query(
      `ALTER TABLE \`order_additional_cost_product\` DROP COLUMN \`media_id\``
    )
  }
}

