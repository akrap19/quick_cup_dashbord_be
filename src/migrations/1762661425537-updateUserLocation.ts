import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateUserLocation1762661425537 implements MigrationInterface {
  name = 'UpdateUserLocation1762661425537'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`location\` \`location\` varchar(255) NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`location\` \`location\` varchar(255) NOT NULL`
    )
  }
}
