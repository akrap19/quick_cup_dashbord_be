import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddServiceModel1762541234567 implements MigrationInterface {
  name = 'AddServiceModel1762541234567'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `service` (`id` varchar(36) NOT NULL, `name` varchar(128) NOT NULL, `description` text NULL, `price` float NULL, `duration_minutes` int NULL, `is_active` tinyint NOT NULL DEFAULT 1, `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB'
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `service`')
  }
}
