import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddServiceAcquisitionAndBillingFields1766238000000
  implements MigrationInterface
{
  name = 'AddServiceAcquisitionAndBillingFields1766238000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add acquisition_type enum column
    await queryRunner.query(
      `ALTER TABLE \`service\` ADD \`acquisition_type\` enum('buy', 'rent', 'both') NULL`
    )

    // Add billing_interval enum column
    await queryRunner.query(
      `ALTER TABLE \`service\` ADD \`billing_interval\` enum('one_time', 'weekly', 'monthly') NULL`
    )

    // Add is_default_service_for_buy boolean column
    await queryRunner.query(
      `ALTER TABLE \`service\` ADD \`is_default_service_for_buy\` tinyint NULL`
    )

    // Add is_default_service_for_rent boolean column
    await queryRunner.query(
      `ALTER TABLE \`service\` ADD \`is_default_service_for_rent\` tinyint NULL`
    )

    // Add input_type_for_buy enum column
    await queryRunner.query(
      `ALTER TABLE \`service\` ADD \`input_type_for_buy\` enum('before', 'after', 'both') NULL`
    )

    // Add input_type_for_rent enum column
    await queryRunner.query(
      `ALTER TABLE \`service\` ADD \`input_type_for_rent\` enum('before', 'after', 'both') NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove all added columns
    await queryRunner.query(
      `ALTER TABLE \`service\` DROP COLUMN \`input_type_for_rent\``
    )
    await queryRunner.query(
      `ALTER TABLE \`service\` DROP COLUMN \`input_type_for_buy\``
    )
    await queryRunner.query(
      `ALTER TABLE \`service\` DROP COLUMN \`is_default_service_for_rent\``
    )
    await queryRunner.query(
      `ALTER TABLE \`service\` DROP COLUMN \`is_default_service_for_buy\``
    )
    await queryRunner.query(
      `ALTER TABLE \`service\` DROP COLUMN \`billing_interval\``
    )
    await queryRunner.query(
      `ALTER TABLE \`service\` DROP COLUMN \`acquisition_type\``
    )
  }
}

