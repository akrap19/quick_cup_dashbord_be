import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddNameToMedia1612345678901 implements MigrationInterface {
  name = 'AddNameToMedia1612345678901'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration is now handled by the AddRooms migration which creates the media table with the name column
    // No action needed here as the media table will be created with the name column in the later migration
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No action needed as this is handled by the AddRooms migration rollback
  }
}
