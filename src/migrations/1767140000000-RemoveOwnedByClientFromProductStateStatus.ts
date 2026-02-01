import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveOwnedByClientFromProductStateStatus1767140000000
  implements MigrationInterface
{
  name = 'RemoveOwnedByClientFromProductStateStatus1767140000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, update any existing OWNED_BY_CLIENT states to IN_USE
    await queryRunner.query(
      `UPDATE \`product_state\` SET \`status\` = 'in_use' WHERE \`status\` = 'owned_by_client'`
    )

    // Then remove the enum value
    await queryRunner.query(
      `ALTER TABLE \`product_state\` MODIFY COLUMN \`status\` enum ('available', 'in_use', 'maintenance', 'reserved', 'damaged') NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_state\` MODIFY COLUMN \`status\` enum ('available', 'in_use', 'maintenance', 'reserved', 'damaged', 'owned_by_client') NOT NULL`
    )
  }
}

