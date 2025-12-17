import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPlaceAndStreetToOrdersAndEvents1765740000000
  implements MigrationInterface
{
  name = 'AddPlaceAndStreetToOrdersAndEvents1765740000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add place and street columns to order table
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD \`place\` varchar(255) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD \`street\` varchar(255) NULL`
    )

    // Add place and street columns to event_model table
    await queryRunner.query(
      `ALTER TABLE \`event_model\` ADD \`place\` varchar(255) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`event_model\` ADD \`street\` varchar(255) NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove place and street columns from event_model table
    await queryRunner.query(`ALTER TABLE \`event_model\` DROP COLUMN \`street\``)
    await queryRunner.query(`ALTER TABLE \`event_model\` DROP COLUMN \`place\``)

    // Remove place and street columns from order table
    await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`street\``)
    await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`place\``)
  }
}

