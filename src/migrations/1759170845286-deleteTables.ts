import { MigrationInterface, QueryRunner } from 'typeorm'

export class DeleteTables1759170845286 implements MigrationInterface {
  name = 'DeleteTables1759170845286'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Disable foreign key checks to avoid constraint issues
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 0`)

    // Drop all unused tables
    await queryRunner.query(`DROP TABLE IF EXISTS \`about_note\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`room_note\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`staff_note\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`case_about_image\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`case_room_image\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`case_staff_image\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`room_image\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`case_about\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`case_room\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`case_staff\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`case\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`template_about\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`template_room\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`template_staff\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`template\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`room_translation\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`room\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`staff_translation\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`staff\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`about_translation\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`about\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`onboarding_section\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`user_role_barnahus\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`barnahus_language\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`language\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`dynamic_message\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`voiceover\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`barnahus\``)

    // Re-enable foreign key checks
    await queryRunner.query(`SET FOREIGN_KEY_CHECKS = 1`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: This down migration would need to recreate all the dropped tables
    // Since this is a cleanup migration, the down method is intentionally left empty
    // If you need to rollback, you would need to restore from a backup or recreate the tables manually
    throw new Error(
      'This migration cannot be rolled back. Please restore from backup if needed.'
    )
  }
}
