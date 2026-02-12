import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameOrderAdditionalCostColumnsToSnakeCase1766186479000
  implements MigrationInterface
{
  name = 'RenameOrderAdditionalCostColumnsToSnakeCase1766186479000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists
    const tables = await queryRunner.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'order_additional_cost'`
    )

    if (tables.length > 0) {
      // Get current column names
      const columns = await queryRunner.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'order_additional_cost'`
      )
      const columnNames = columns.map((c: any) => c.COLUMN_NAME)

      // Rename columns from camelCase to snake_case only if they exist in camelCase
      if (columnNames.includes('createdAt') && !columnNames.includes('created_at')) {
        await queryRunner.query(
          `ALTER TABLE \`order_additional_cost\` CHANGE \`createdAt\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
        )
      }
      if (columnNames.includes('updatedAt') && !columnNames.includes('updated_at')) {
        await queryRunner.query(
          `ALTER TABLE \`order_additional_cost\` CHANGE \`updatedAt\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`
        )
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists
    const tables = await queryRunner.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'order_additional_cost'`
    )

    if (tables.length > 0) {
      // Get current column names
      const columns = await queryRunner.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'order_additional_cost'`
      )
      const columnNames = columns.map((c: any) => c.COLUMN_NAME)

      // Revert columns back to camelCase only if they exist in snake_case
      if (columnNames.includes('created_at') && !columnNames.includes('createdAt')) {
        await queryRunner.query(
          `ALTER TABLE \`order_additional_cost\` CHANGE \`created_at\` \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
        )
      }
      if (columnNames.includes('updated_at') && !columnNames.includes('updatedAt')) {
        await queryRunner.query(
          `ALTER TABLE \`order_additional_cost\` CHANGE \`updated_at\` \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`
        )
      }
    }
  }
}
