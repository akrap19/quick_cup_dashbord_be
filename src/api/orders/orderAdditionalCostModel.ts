import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index
} from 'typeorm'
import { Order } from './ordersModel'
import { AdditionalCost } from '../additional_costs/additionalCostModel'
import { OrderAdditionalCostProduct } from './orderAdditionalCostProductModel'
import { decimalTransformer } from '../../services/utils'

@Entity('order_additional_cost')
@Index(['orderId', 'additionalCostId'])
export class OrderAdditionalCost {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  orderId!: string

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order

  @Column()
  additionalCostId!: string

  @ManyToOne(() => AdditionalCost, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'additional_cost_id' })
  additionalCost!: AdditionalCost

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    transformer: decimalTransformer
  })
  price!: number

  @Column({ type: 'int', nullable: true })
  quantity?: number | null

  @OneToMany(
    () => OrderAdditionalCostProduct,
    (orderAdditionalCostProduct) => orderAdditionalCostProduct.orderAdditionalCost
  )
  products?: OrderAdditionalCostProduct[]

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  createdAt!: Date

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)'
  })
  updatedAt!: Date

  constructor(
    orderId: string,
    additionalCostId: string,
    price: number,
    quantity?: number | null
  ) {
    this.orderId = orderId
    this.additionalCostId = additionalCostId
    this.price = price
    this.quantity = quantity ?? null
  }
}
