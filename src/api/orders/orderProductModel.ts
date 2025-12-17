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
import { Order } from './ordersModel'
import { Product } from '../products/productsModel'
import { decimalTransformer } from '../../services/utils'

@Entity('order_product')
@Index(['orderId', 'productId'])
export class OrderProduct {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  orderId!: string

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order

  @Column()
  productId!: string

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @Column({ type: 'int' })
  quantity!: number

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    transformer: decimalTransformer
  })
  price!: number

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
    orderId: string,
    productId: string,
    quantity: number,
    price: number
  ) {
    this.orderId = orderId
    this.productId = productId
    this.quantity = quantity
    this.price = price
  }
}

