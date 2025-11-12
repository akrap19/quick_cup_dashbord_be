import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateServiceModel1762546623869 implements MigrationInterface {
  name = 'CreateServiceModel1762546623869'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `service` DROP COLUMN `price`')
    await queryRunner.query(
      'ALTER TABLE `service` DROP COLUMN `duration_minutes`'
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `service` ADD `duration_minutes` int NULL'
    )
    await queryRunner.query('ALTER TABLE `service` ADD `price` float NULL')
  }
}
