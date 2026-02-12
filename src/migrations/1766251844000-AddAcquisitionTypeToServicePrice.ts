import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAcquisitionTypeToServicePrice1766251844000
  implements MigrationInterface
{
  name = 'AddAcquisitionTypeToServicePrice1766251844000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists
    const tables = await queryRunner.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'service_price'`
    )

    if (tables.length > 0) {
      // Check if acquisition_type column exists before adding
      const columns = await queryRunner.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_price' 
         AND COLUMN_NAME = 'acquisition_type'`
      )

      if (columns.length === 0) {
        // Add acquisition_type column with default value 'buy'
        await queryRunner.query(
          `ALTER TABLE \`service_price\` ADD COLUMN \`acquisition_type\` enum('buy', 'rent', 'both') NOT NULL DEFAULT 'buy' AFTER \`service_id\``
        )
      }

      // Check if we need to update the index (only if acquisition_type was just added)
      if (columns.length === 0) {
        // Get foreign key constraints that might use the index
        const foreignKeys = await queryRunner.query(
          `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'service_price' 
           AND CONSTRAINT_TYPE = 'FOREIGN KEY'
           AND CONSTRAINT_NAME IN ('FK_service_price_service', 'FK_8db5b7d5b965bdc30f528d244ce')`
        )
        const fkNames = foreignKeys.map((fk: any) => fk.CONSTRAINT_NAME)

        // Drop foreign keys temporarily if they exist
        for (const fkName of fkNames) {
          await queryRunner.query(
            `ALTER TABLE \`service_price\` DROP FOREIGN KEY \`${fkName}\``
          )
        }

        // Drop the old index if it exists
        const oldIndexes = await queryRunner.query(
          `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'service_price' 
           AND INDEX_NAME = 'IDX_service_price_composite'`
        )
        if (oldIndexes.length > 0) {
          await queryRunner.query(
            `DROP INDEX \`IDX_service_price_composite\` ON \`service_price\``
          )
        }

        // Create new composite index including acquisition_type
        await queryRunner.query(
          `CREATE INDEX \`IDX_service_price_composite\` ON \`service_price\` (\`service_id\`, \`acquisition_type\`, \`min_quantity\`)`
        )

        // Recreate foreign keys
        for (const fkName of fkNames) {
          await queryRunner.query(
            `ALTER TABLE \`service_price\` ADD CONSTRAINT \`${fkName}\` FOREIGN KEY (\`service_id\`) REFERENCES \`service\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
          )
        }
      } else {
        // Column already exists, check if index needs to be updated
        const currentIndexes = await queryRunner.query(
          `SELECT INDEX_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.STATISTICS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'service_price' 
           AND INDEX_NAME = 'IDX_service_price_composite'
           ORDER BY SEQ_IN_INDEX`
        )
        
        // Check if index includes acquisition_type
        const indexColumns = currentIndexes.map((idx: any) => idx.COLUMN_NAME)
        if (!indexColumns.includes('acquisition_type')) {
          // Index doesn't include acquisition_type, need to update it
          const foreignKeys = await queryRunner.query(
            `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
             WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_NAME = 'service_price' 
             AND CONSTRAINT_TYPE = 'FOREIGN KEY'
             AND CONSTRAINT_NAME IN ('FK_service_price_service', 'FK_8db5b7d5b965bdc30f528d244ce')`
          )
          const fkNames = foreignKeys.map((fk: any) => fk.CONSTRAINT_NAME)

          // Drop foreign keys temporarily
          for (const fkName of fkNames) {
            await queryRunner.query(
              `ALTER TABLE \`service_price\` DROP FOREIGN KEY \`${fkName}\``
            )
          }

          // Drop old index
          await queryRunner.query(
            `DROP INDEX \`IDX_service_price_composite\` ON \`service_price\``
          )

          // Create new index
          await queryRunner.query(
            `CREATE INDEX \`IDX_service_price_composite\` ON \`service_price\` (\`service_id\`, \`acquisition_type\`, \`min_quantity\`)`
          )

          // Recreate foreign keys
          for (const fkName of fkNames) {
            await queryRunner.query(
              `ALTER TABLE \`service_price\` ADD CONSTRAINT \`${fkName}\` FOREIGN KEY (\`service_id\`) REFERENCES \`service\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
            )
          }
        }
      }

      // Update existing prices based on service acquisition type if available
      // Only if the column was just added or if we need to update existing data
      if (columns.length === 0) {
        // Check if service table has acquisition_type column
        const serviceColumns = await queryRunner.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'service' 
           AND COLUMN_NAME = 'acquisition_type'`
        )
        
        if (serviceColumns.length > 0) {
          // For services with acquisitionType 'rent', set prices to 'rent'
          await queryRunner.query(
            `UPDATE \`service_price\` sp
             INNER JOIN \`service\` s ON sp.service_id = s.id
             SET sp.acquisition_type = 'rent'
             WHERE s.acquisition_type = 'rent'`
          )
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists
    const tables = await queryRunner.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'service_price'`
    )

    if (tables.length > 0) {
      // Check if acquisition_type column exists
      const columns = await queryRunner.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'service_price' 
         AND COLUMN_NAME = 'acquisition_type'`
      )

      if (columns.length > 0) {
        // Get foreign key constraints
        const foreignKeys = await queryRunner.query(
          `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'service_price' 
           AND CONSTRAINT_TYPE = 'FOREIGN KEY'
           AND CONSTRAINT_NAME IN ('FK_service_price_service', 'FK_8db5b7d5b965bdc30f528d244ce')`
        )
        const fkNames = foreignKeys.map((fk: any) => fk.CONSTRAINT_NAME)

        // Drop foreign keys temporarily
        for (const fkName of fkNames) {
          await queryRunner.query(
            `ALTER TABLE \`service_price\` DROP FOREIGN KEY \`${fkName}\``
          )
        }

        // Drop the new index if it exists
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

        // Recreate the old index
        await queryRunner.query(
          `CREATE INDEX \`IDX_service_price_composite\` ON \`service_price\` (\`service_id\`, \`min_quantity\`)`
        )

        // Recreate foreign keys
        for (const fkName of fkNames) {
          await queryRunner.query(
            `ALTER TABLE \`service_price\` ADD CONSTRAINT \`${fkName}\` FOREIGN KEY (\`service_id\`) REFERENCES \`service\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
          )
        }

        // Remove the acquisition_type column
        await queryRunner.query(
          `ALTER TABLE \`service_price\` DROP COLUMN \`acquisition_type\``
        )
      }
    }
  }
}

