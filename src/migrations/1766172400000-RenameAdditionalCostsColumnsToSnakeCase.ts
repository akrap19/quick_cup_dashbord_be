import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameAdditionalCostsColumnsToSnakeCase1766172400000
  implements MigrationInterface
{
  name = 'RenameAdditionalCostsColumnsToSnakeCase1766172400000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename columns from camelCase to snake_case
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` CHANGE \`methodOfPayment\` \`method_of_payment\` enum('before','after') NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` CHANGE \`billingType\` \`billing_type\` enum('by_piece','one_time') NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` CHANGE \`acquisitionType\` \`acquisition_type\` enum('buy','rent') NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` CHANGE \`createdAt\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    )
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` CHANGE \`updatedAt\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert columns back to camelCase
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` CHANGE \`method_of_payment\` \`methodOfPayment\` enum('before','after') NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` CHANGE \`billing_type\` \`billingType\` enum('by_piece','one_time') NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` CHANGE \`acquisition_type\` \`acquisitionType\` enum('buy','rent') NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` CHANGE \`created_at\` \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    )
    await queryRunner.query(
      `ALTER TABLE \`additional_costs\` CHANGE \`updated_at\` \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`
    )
  }
}

