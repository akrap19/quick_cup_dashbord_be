import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddOwnedByClientToProductStateStatus1767032000000
  implements MigrationInterface
{
  name = 'AddOwnedByClientToProductStateStatus1767032000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_state\` MODIFY COLUMN \`status\` enum ('available', 'in_use', 'maintenance', 'reserved', 'damaged', 'owned_by_client') NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_state\` MODIFY COLUMN \`status\` enum ('available', 'in_use', 'maintenance', 'reserved', 'damaged') NOT NULL`
    )
  }
}
