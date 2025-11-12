import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateUserStatus1762658310617 implements MigrationInterface {
  name = 'UpdateUserStatus1762658310617'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`status\` \`status\` enum ('Created', 'Active', 'Blocked', 'Deleted') NOT NULL DEFAULT 'Created'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` CHANGE \`status\` \`status\` enum ('Created', 'Active', 'Deleted') NOT NULL DEFAULT ''Created''`
    )
  }
}
