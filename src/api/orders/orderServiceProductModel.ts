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
import { OrderService } from './orderServiceModel'
import { Product } from '../products/productsModel'

@Entity('order_service_product')
@Index(['orderServiceId', 'productId'])
export class OrderServiceProduct {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  orderServiceId!: string

  @ManyToOne(() => OrderService, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_service_id' })
  orderService!: OrderService

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
    orderServiceId: string,
    productId: string,
    quantity: number
  ) {
    this.orderServiceId = orderServiceId
    this.productId = productId
    this.quantity = quantity
  }
}

