import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFileToMediaType1767100000000 implements MigrationInterface {
  name = 'AddFileToMediaType1767100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`media\` MODIFY COLUMN \`type\` enum ('Image', 'Audio', 'Video', 'File') NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`media\` MODIFY COLUMN \`type\` enum ('Image', 'Audio', 'Video') NOT NULL`
    )
  }
}

