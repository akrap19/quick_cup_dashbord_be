import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddOrderStatusCheckConstraint1767035000000
  implements MigrationInterface
{
  name = 'AddOrderStatusCheckConstraint1767035000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add CHECK constraint to validate order status values
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD CONSTRAINT \`CHK_order_status\` CHECK (\`status\` IN ('PENDING', 'ACCEPTED', 'DECLINED', 'PAYMENT_PENDING', 'PAYMENT_RECEIVED', 'IN_PRODUCTION', 'READY', 'IN_TRANSIT', 'FINAL_PAYMENT_PENDING', 'COMPLETED'))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove CHECK constraint
    await queryRunner.query(
      `ALTER TABLE \`order\` DROP CONSTRAINT \`CHK_order_status\``
    )
  }
}

