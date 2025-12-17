import { MigrationInterface, QueryRunner } from 'typeorm'

export class IncreaseScaleOnPrice1765066477423 implements MigrationInterface {
  name = 'IncreaseScaleOnPrice1765066477423'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_price\` CHANGE \`price\` \`price\` decimal(10,4) NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_price\` CHANGE \`price\` \`price\` decimal(10,2) NOT NULL`
    )
  }
}
