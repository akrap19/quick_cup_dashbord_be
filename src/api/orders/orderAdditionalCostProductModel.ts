import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm'
import { OrderAdditionalCost } from './orderAdditionalCostModel'
import { Product } from '../products/productsModel'

@Entity('order_additional_cost_product')
@Index(['orderAdditionalCostId', 'productId'])
export class OrderAdditionalCostProduct {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  orderAdditionalCostId!: string

  @ManyToOne(() => OrderAdditionalCost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_additional_cost_id' })
  orderAdditionalCost!: OrderAdditionalCost

  @Column()
  productId!: string

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @Column({ type: 'int' })
  quantity!: number

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  createdAt!: Date

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)'
  })
  updatedAt!: Date

  constructor(
    orderAdditionalCostId: string,
    productId: string,
    quantity: number
  ) {
    this.orderAdditionalCostId = orderAdditionalCostId
    this.productId = productId
    this.quantity = quantity
  }
}
