import { MigrationInterface, QueryRunner } from 'typeorm'

export class DeleteImageTabels1759171047468 implements MigrationInterface {
  name = 'DeleteImageTabels1759171047468'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Disable foreign key checks to avoid constraint issues
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0`)

    // Drop the image tables
    await queryRunner.query(`DROP TABLE IF EXISTS \`about_image\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`staff_image\``)

    // Re-enable foreign key checks
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: This down migration would need to recreate the dropped tables
    // Since this is a cleanup migration, the down method is intentionally left empty
    // If you need to rollback, you would need to restore from a backup or recreate the tables manually
    throw new Error(
      'This migration cannot be rolled back. Please restore from backup if needed.'
    )
  }
}
