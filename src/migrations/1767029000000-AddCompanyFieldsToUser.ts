import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCompanyFieldsToUser1767029000000 implements MigrationInterface {
  name = 'AddCompanyFieldsToUser1767029000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`company_name\` varchar(255) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`pin\` varchar(50) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`street\` varchar(255) NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`street\``)
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`pin\``)
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`company_name\``)
  }
}

