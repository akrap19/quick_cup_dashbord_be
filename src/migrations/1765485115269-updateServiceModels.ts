import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateServiceModels1765485115269 implements MigrationInterface {
  name = 'UpdateServiceModels1765485115269'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if service_price table exists before modifying it
    const tables = await queryRunner.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'service_price'`
    )

    if (tables.length > 0) {
      // Check if foreign key exists before dropping
      const constraints = await queryRunner.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_price' 
         AND CONSTRAINT_NAME = 'FK_service_price_service'`
      )
      if (constraints.length > 0) {
        await queryRunner.query(
          `ALTER TABLE \`service_price\` DROP FOREIGN KEY \`FK_service_price_service\``
        )
      }

      // Check if index exists before dropping
      const indexes = await queryRunner.query(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_price' 
         AND INDEX_NAME = 'IDX_service_price_composite'`
      )
      if (indexes.length > 0) {
        await queryRunner.query(
          `DROP INDEX \`IDX_service_price_composite\` ON \`service_price\``
        )
      }

      // Check if columns exist before dropping
      const columns = await queryRunner.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_price' 
         AND COLUMN_NAME IN ('price_calculation_unit', 'billing_frequency')`
      )
      const columnNames = columns.map((c: any) => c.COLUMN_NAME)

      if (columnNames.includes('price_calculation_unit')) {
        await queryRunner.query(
          `ALTER TABLE \`service_price\` DROP COLUMN \`price_calculation_unit\``
        )
      }
      if (columnNames.includes('billing_frequency')) {
        await queryRunner.query(
          `ALTER TABLE \`service_price\` DROP COLUMN \`billing_frequency\``
        )
      }

      // Check if index exists before creating
      const newIndexes = await queryRunner.query(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_price' 
         AND INDEX_NAME = 'IDX_2a8ec85fdc4207ead60b25a566'`
      )
      if (newIndexes.length === 0) {
        await queryRunner.query(
          `CREATE INDEX \`IDX_2a8ec85fdc4207ead60b25a566\` ON \`service_price\` (\`service_id\`, \`min_quantity\`)`
        )
      }

      // Check if constraint exists before adding
      const newConstraints = await queryRunner.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_price' 
         AND CONSTRAINT_NAME = 'FK_8db5b7d5b965bdc30f528d244ce'`
      )
      if (newConstraints.length === 0) {
        await queryRunner.query(
          `ALTER TABLE \`service_price\` ADD CONSTRAINT \`FK_8db5b7d5b965bdc30f528d244ce\` FOREIGN KEY (\`service_id\`) REFERENCES \`service\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
        )
      }
    }

    // Add column to service table (check if it exists first)
    const serviceColumns = await queryRunner.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'service' 
       AND COLUMN_NAME = 'price_calculation_unit'`
    )
    if (serviceColumns.length === 0) {
      await queryRunner.query(
        `ALTER TABLE \`service\` ADD \`price_calculation_unit\` enum ('piece', 'unit', 'transportationUnit') NULL`
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if service_price table exists
    const tables = await queryRunner.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'service_price'`
    )

    if (tables.length > 0) {
      // Check if constraint exists before dropping
      const constraints = await queryRunner.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_price' 
         AND CONSTRAINT_NAME = 'FK_8db5b7d5b965bdc30f528d244ce'`
      )
      if (constraints.length > 0) {
        await queryRunner.query(
          `ALTER TABLE \`service_price\` DROP FOREIGN KEY \`FK_8db5b7d5b965bdc30f528d244ce\``
        )
      }

      // Check if index exists before dropping
      const indexes = await queryRunner.query(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_price' 
         AND INDEX_NAME = 'IDX_2a8ec85fdc4207ead60b25a566'`
      )
      if (indexes.length > 0) {
        await queryRunner.query(
          `DROP INDEX \`IDX_2a8ec85fdc4207ead60b25a566\` ON \`service_price\``
        )
      }

      // Check if columns exist before adding
      const columns = await queryRunner.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_price' 
         AND COLUMN_NAME IN ('billing_frequency', 'price_calculation_unit')`
      )
      const columnNames = columns.map((c: any) => c.COLUMN_NAME)

      if (!columnNames.includes('billing_frequency')) {
        await queryRunner.query(
          `ALTER TABLE \`service_price\` ADD \`billing_frequency\` enum ('onetime', 'daily', 'weekly', 'monthly', 'yearly') NOT NULL`
        )
      }
      if (!columnNames.includes('price_calculation_unit')) {
        await queryRunner.query(
          `ALTER TABLE \`service_price\` ADD \`price_calculation_unit\` enum ('piece', 'unit', 'transportationUnit') NOT NULL`
        )
      }

      // Check if index exists before creating
      const compositeIndexes = await queryRunner.query(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_price' 
         AND INDEX_NAME = 'IDX_service_price_composite'`
      )
      if (compositeIndexes.length === 0) {
        await queryRunner.query(
          `CREATE INDEX \`IDX_service_price_composite\` ON \`service_price\` (\`service_id\`, \`min_quantity\`)`
        )
      }

      // Check if constraint exists before adding
      const serviceConstraints = await queryRunner.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_price' 
         AND CONSTRAINT_NAME = 'FK_service_price_service'`
      )
      if (serviceConstraints.length === 0) {
        await queryRunner.query(
          `ALTER TABLE \`service_price\` ADD CONSTRAINT \`FK_service_price_service\` FOREIGN KEY (\`service_id\`) REFERENCES \`service\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
        )
      }
    }

    // Check if column exists before dropping from service table
    const serviceColumns = await queryRunner.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'service' 
       AND COLUMN_NAME = 'price_calculation_unit'`
    )
    if (serviceColumns.length > 0) {
      await queryRunner.query(
        `ALTER TABLE \`service\` DROP COLUMN \`price_calculation_unit\``
      )
    }
  }
}
