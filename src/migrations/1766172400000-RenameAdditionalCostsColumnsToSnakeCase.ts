import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameAdditionalCostsColumnsToSnakeCase1766172400000
  implements MigrationInterface
{
  name = 'RenameAdditionalCostsColumnsToSnakeCase1766172400000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists
    const tables = await queryRunner.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'additional_costs'`
    )

    if (tables.length > 0) {
      // Get current column names
      const columns = await queryRunner.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'additional_costs'`
      )
      const columnNames = columns.map((c: any) => c.COLUMN_NAME)

      // Rename columns from camelCase to snake_case only if they exist in camelCase
      if (columnNames.includes('methodOfPayment') && !columnNames.includes('method_of_payment')) {
        await queryRunner.query(
          `ALTER TABLE \`additional_costs\` CHANGE \`methodOfPayment\` \`method_of_payment\` enum('before','after') NOT NULL`
        )
      }
      if (columnNames.includes('billingType') && !columnNames.includes('billing_type')) {
        await queryRunner.query(
          `ALTER TABLE \`additional_costs\` CHANGE \`billingType\` \`billing_type\` enum('by_piece','one_time') NOT NULL`
        )
      }
      if (columnNames.includes('acquisitionType') && !columnNames.includes('acquisition_type')) {
        await queryRunner.query(
          `ALTER TABLE \`additional_costs\` CHANGE \`acquisitionType\` \`acquisition_type\` enum('buy','rent') NOT NULL`
        )
      }
      if (columnNames.includes('createdAt') && !columnNames.includes('created_at')) {
        await queryRunner.query(
          `ALTER TABLE \`additional_costs\` CHANGE \`createdAt\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
        )
      }
      if (columnNames.includes('updatedAt') && !columnNames.includes('updated_at')) {
        await queryRunner.query(
          `ALTER TABLE \`additional_costs\` CHANGE \`updatedAt\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`
        )
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists
    const tables = await queryRunner.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'additional_costs'`
    )

    if (tables.length > 0) {
      // Get current column names
      const columns = await queryRunner.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'additional_costs'`
      )
      const columnNames = columns.map((c: any) => c.COLUMN_NAME)

      // Revert columns back to camelCase only if they exist in snake_case
      if (columnNames.includes('method_of_payment') && !columnNames.includes('methodOfPayment')) {
        await queryRunner.query(
          `ALTER TABLE \`additional_costs\` CHANGE \`method_of_payment\` \`methodOfPayment\` enum('before','after') NOT NULL`
        )
      }
      if (columnNames.includes('billing_type') && !columnNames.includes('billingType')) {
        await queryRunner.query(
          `ALTER TABLE \`additional_costs\` CHANGE \`billing_type\` \`billingType\` enum('by_piece','one_time') NOT NULL`
        )
      }
      if (columnNames.includes('acquisition_type') && !columnNames.includes('acquisitionType')) {
        await queryRunner.query(
          `ALTER TABLE \`additional_costs\` CHANGE \`acquisition_type\` \`acquisitionType\` enum('buy','rent') NOT NULL`
        )
      }
      if (columnNames.includes('created_at') && !columnNames.includes('createdAt')) {
        await queryRunner.query(
          `ALTER TABLE \`additional_costs\` CHANGE \`created_at\` \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
        )
      }
      if (columnNames.includes('updated_at') && !columnNames.includes('updatedAt')) {
        await queryRunner.query(
          `ALTER TABLE \`additional_costs\` CHANGE \`updated_at\` \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`
        )
      }
    }
  }
}

