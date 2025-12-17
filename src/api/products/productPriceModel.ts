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
import { Product } from './productsModel'
import { decimalTransformer } from '../../services/utils'

@Entity()
@Index(['productId', 'minQuantity'])
export class ProductPrice {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  productId!: string

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @Column({ type: 'int' })
  minQuantity!: number

  @Column({ type: 'int', nullable: true })
  maxQuantity?: number | null

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
    productId: string,
    minQuantity: number,
    price: number,
    maxQuantity?: number | null
  ) {
    this.productId = productId
    this.minQuantity = minQuantity
    this.price = price
    this.maxQuantity = maxQuantity ?? null
  }
}
