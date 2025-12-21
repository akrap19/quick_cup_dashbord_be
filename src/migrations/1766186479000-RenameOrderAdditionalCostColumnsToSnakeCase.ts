import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameOrderAdditionalCostColumnsToSnakeCase1766186479000
  implements MigrationInterface
{
  name = 'RenameOrderAdditionalCostColumnsToSnakeCase1766186479000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename columns from camelCase to snake_case
    await queryRunner.query(
      `ALTER TABLE \`order_additional_cost\` CHANGE \`createdAt\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    )
    await queryRunner.query(
      `ALTER TABLE \`order_additional_cost\` CHANGE \`updatedAt\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert columns back to camelCase
    await queryRunner.query(
      `ALTER TABLE \`order_additional_cost\` CHANGE \`created_at\` \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    )
    await queryRunner.query(
      `ALTER TABLE \`order_additional_cost\` CHANGE \`updated_at\` \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`
    )
  }
}
