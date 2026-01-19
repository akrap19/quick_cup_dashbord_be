import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDiscountToOrder1767036000000 implements MigrationInterface {
  name = 'AddDiscountToOrder1767036000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`order\` ADD \`discount\` float NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`discount\``)
  }
}
