import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCaseStatus1623421730000 implements MigrationInterface {
  name = 'AddCaseStatus1623421730000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration is now handled by the AddCaseTable migration which creates the case table with the status column
    // No action needed here as the case table will be created with the status column in the later migration
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No action needed as this is handled by the AddCaseTable migration rollback
  }
}
