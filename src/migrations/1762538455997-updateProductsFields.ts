import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateProductsFields1762538455997 implements MigrationInterface {
  name = 'UpdateProductsFields1762538455997'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `product` DROP INDEX `IDX_262b5f1246459dfb29d0a3dd3f`'
    )
    await queryRunner.query('ALTER TABLE `product` DROP COLUMN `sku`')
    await queryRunner.query('ALTER TABLE `product` DROP COLUMN `price`')
    await queryRunner.query('ALTER TABLE `product` DROP COLUMN `is_active`')
    await queryRunner.query(
      "ALTER TABLE `product` ADD `acquisition_type` enum('rent','buy') NOT NULL DEFAULT 'buy'"
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `product` DROP COLUMN `acquisition_type`'
    )
    await queryRunner.query('ALTER TABLE `product` ADD `sku` varchar(64) NULL')
    await queryRunner.query(
      'ALTER TABLE `product` ADD `price` float NOT NULL DEFAULT 0'
    )
    await queryRunner.query(
      'ALTER TABLE `product` ADD `is_active` tinyint NOT NULL DEFAULT 1'
    )
    await queryRunner.query(
      'ALTER TABLE `product` ADD UNIQUE INDEX `IDX_262b5f1246459dfb29d0a3dd3f` (`sku`)'
    )
  }
}
