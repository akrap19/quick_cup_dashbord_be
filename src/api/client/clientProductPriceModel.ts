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
import { User } from '../user/userModel'
import { Product } from '../products/productsModel'
import { decimalTransformer } from '../../services/utils'

@Entity()
@Index(['clientId', 'productId', 'minQuantity'])
export class ClientProductPrice {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  clientId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: User

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
    clientId: string,
    productId: string,
    minQuantity: number,
    price: number,
    maxQuantity?: number | null
  ) {
    this.clientId = clientId
    this.productId = productId
    this.minQuantity = minQuantity
    this.price = price
    this.maxQuantity = maxQuantity ?? null
  }
}
