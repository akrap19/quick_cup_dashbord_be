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
import { ServiceModel } from '../service/serviceModel'
import { ServiceLocationModel } from '../service_location/serviceLocationModel'
import { decimalTransformer } from '../../services/utils'

@Entity('order_service')
@Index(['orderId', 'serviceId'])
export class OrderService {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  orderId!: string

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order

  @Column()
  serviceId!: string

  @ManyToOne(() => ServiceModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service!: ServiceModel

  @Column({ type: 'int' })
  quantity!: number

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    transformer: decimalTransformer
  })
  price!: number

  @Column({ type: 'uuid', nullable: true })
  serviceLocationId?: string | null

  @ManyToOne(() => ServiceLocationModel, {
    onDelete: 'SET NULL',
    nullable: true
  })
  @JoinColumn({ name: 'service_location_id' })
  serviceLocation?: ServiceLocationModel | null

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
    serviceId: string,
    quantity: number,
    price: number,
    serviceLocationId?: string | null
  ) {
    this.orderId = orderId
    this.serviceId = serviceId
    this.quantity = quantity
    this.price = price
    this.serviceLocationId = serviceLocationId ?? null
  }
}
