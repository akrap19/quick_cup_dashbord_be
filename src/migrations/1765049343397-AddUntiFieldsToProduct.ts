import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUntiFieldsToProduct1765049343397 implements MigrationInterface {
  name = 'AddUntiFieldsToProduct1765049343397'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product\` ADD \`unit\` varchar(128) NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`product\` ADD \`quantity_per_unit\` int NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`product\` ADD \`transportation_unit\` varchar(128) NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`product\` ADD \`units_per_transportation_unit\` int NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product\` DROP COLUMN \`units_per_transportation_unit\``
    )
    await queryRunner.query(
      `ALTER TABLE \`product\` DROP COLUMN \`transportation_unit\``
    )
    await queryRunner.query(
      `ALTER TABLE \`product\` DROP COLUMN \`quantity_per_unit\``
    )
    await queryRunner.query(`ALTER TABLE \`product\` DROP COLUMN \`unit\``)
  }
}
