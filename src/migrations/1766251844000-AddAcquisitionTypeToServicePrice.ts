import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAcquisitionTypeToServicePrice1766251844000
  implements MigrationInterface
{
  name = 'AddAcquisitionTypeToServicePrice1766251844000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add acquisition_type column with default value 'buy'
    await queryRunner.query(
      `ALTER TABLE \`service_price\` ADD COLUMN \`acquisition_type\` enum('buy', 'rent', 'both') NOT NULL DEFAULT 'buy' AFTER \`service_id\``
    )

    // Drop the old index if it exists
    await queryRunner.query(
      `DROP INDEX IF EXISTS \`IDX_service_price_composite\` ON \`service_price\``
    )

    // Create new composite index including acquisition_type
    await queryRunner.query(
      `CREATE INDEX \`IDX_service_price_composite\` ON \`service_price\` (\`service_id\`, \`acquisition_type\`, \`min_quantity\`)`
    )

    // Update existing prices based on service acquisition type if available
    // For services with acquisitionType 'rent', set prices to 'rent'
    await queryRunner.query(
      `UPDATE \`service_price\` sp
       INNER JOIN \`service\` s ON sp.service_id = s.id
       SET sp.acquisition_type = 'rent'
       WHERE s.acquisition_type = 'rent'`
    )

    // For services with acquisitionType 'both', we keep prices as 'buy' by default
    // (They can be manually updated later if needed, or we could duplicate them)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new index
    await queryRunner.query(
      `DROP INDEX IF EXISTS \`IDX_service_price_composite\` ON \`service_price\``
    )

    // Recreate the old index
    await queryRunner.query(
      `CREATE INDEX \`IDX_service_price_composite\` ON \`service_price\` (\`service_id\`, \`min_quantity\`)`
    )

    // Remove the acquisition_type column
    await queryRunner.query(
      `ALTER TABLE \`service_price\` DROP COLUMN \`acquisition_type\``
    )
  }
}

