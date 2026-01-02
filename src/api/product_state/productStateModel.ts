import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { Product } from '../products/productsModel'
import { ServiceModel } from '../service/serviceModel'
import { ServiceLocationModel } from '../service_location/serviceLocationModel'
import { User } from '../user/userModel'
import { ProductStateLocation, ProductStateStatus } from './interface'

@Entity('product_state')
export class ProductState {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({
    type: 'enum',
    enum: ProductStateStatus
  })
  status!: ProductStateStatus

  @Column({
    type: 'enum',
    enum: ProductStateLocation
  })
  location!: ProductStateLocation

  @Column({ type: 'int' })
  quantity!: number

  @Column({ type: 'uuid' })
  productId!: string

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @Column({ type: 'uuid', nullable: true })
  serviceId?: string | null

  @ManyToOne(() => ServiceModel, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'service_id' })
  service?: ServiceModel | null

  @Column({ type: 'uuid', nullable: true })
  serviceLocationId?: string | null

  @ManyToOne(() => ServiceLocationModel, {
    onDelete: 'SET NULL',
    nullable: true
  })
  @JoinColumn({ name: 'service_location_id' })
  serviceLocation?: ServiceLocationModel | null

  @Column({ type: 'uuid', nullable: true })
  userId?: string | null

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User | null

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
    status: ProductStateStatus,
    location: ProductStateLocation,
    quantity: number,
    productId: string,
    serviceId?: string | null,
    serviceLocationId?: string | null,
    userId?: string | null
  ) {
    this.status = status
    this.location = location
    this.quantity = quantity
    this.productId = productId
    this.serviceId = serviceId
    this.serviceLocationId = serviceLocationId
    this.userId = userId
  }
}
