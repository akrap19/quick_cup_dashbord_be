import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey
} from 'typeorm'

export class CreateAdditionalCosts1766172287000 implements MigrationInterface {
  name = 'CreateAdditionalCosts1766172287000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create additional_costs table
    await queryRunner.createTable(
      new Table({
        name: 'additional_costs',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'method_of_payment',
            type: 'enum',
            enum: ['before', 'after'],
            isNullable: false
          },
          {
            name: 'billing_type',
            type: 'enum',
            enum: ['by_piece', 'one_time'],
            isNullable: false
          },
          {
            name: 'acquisition_type',
            type: 'enum',
            enum: ['buy', 'rent'],
            isNullable: false
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 4,
            isNullable: false
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP(6)',
            isNullable: false
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
            isNullable: false
          }
        ]
      }),
      true
    )

    // Create order_additional_cost join table
    await queryRunner.createTable(
      new Table({
        name: 'order_additional_cost',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true
          },
          {
            name: 'order_id',
            type: 'varchar',
            length: '36',
            isNullable: false
          },
          {
            name: 'additional_cost_id',
            type: 'varchar',
            length: '36',
            isNullable: false
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 4,
            isNullable: false
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP(6)',
            isNullable: false
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
            isNullable: false
          }
        ]
      }),
      true
    )

    // Create index on order_additional_cost for orderId and additionalCostId
    await queryRunner.createIndex(
      'order_additional_cost',
      new TableIndex({
        name: 'IDX_order_additional_cost_order_additional',
        columnNames: ['order_id', 'additional_cost_id']
      })
    )

    // Create foreign key from order_additional_cost to order
    await queryRunner.createForeignKey(
      'order_additional_cost',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'order',
        onDelete: 'CASCADE'
      })
    )

    // Create foreign key from order_additional_cost to additional_costs
    await queryRunner.createForeignKey(
      'order_additional_cost',
      new TableForeignKey({
        columnNames: ['additional_cost_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'additional_costs',
        onDelete: 'CASCADE'
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const orderAdditionalCostTable = await queryRunner.getTable(
      'order_additional_cost'
    )
    if (orderAdditionalCostTable) {
      const orderForeignKey = orderAdditionalCostTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('order_id') !== -1
      )
      const additionalCostForeignKey =
        orderAdditionalCostTable.foreignKeys.find(
          (fk) => fk.columnNames.indexOf('additional_cost_id') !== -1
        )

      if (orderForeignKey) {
        await queryRunner.dropForeignKey(
          'order_additional_cost',
          orderForeignKey
        )
      }
      if (additionalCostForeignKey) {
        await queryRunner.dropForeignKey(
          'order_additional_cost',
          additionalCostForeignKey
        )
      }
    }

    // Drop index
    await queryRunner.dropIndex(
      'order_additional_cost',
      'IDX_order_additional_cost_order_additional'
    )

    // Drop tables
    await queryRunner.dropTable('order_additional_cost')
    await queryRunner.dropTable('additional_costs')
  }
}
