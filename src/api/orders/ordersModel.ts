import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm'
import { AcquisitionType } from '../products/interface'
import { User } from '../user/userModel'
import { EventModel } from '../events/eventsModel'
import { ServiceLocationModel } from '../service_location/serviceLocationModel'
import { OrderProduct } from './orderProductModel'
import { OrderService } from './orderServiceModel'
import { OrderAdditionalCost } from './orderAdditionalCostModel'

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 64, unique: true })
  orderNumber!: string

  @Column({ type: 'varchar', length: 64 })
  status!: string

  @Column({ type: 'float' })
  totalAmount!: number

  @Column({ type: 'varchar', length: 128, nullable: true })
  customerName?: string | null

  @Column({ type: 'text', nullable: true })
  notes?: string | null

  @Column({
    type: 'enum',
    enum: AcquisitionType,
    default: AcquisitionType.BUY
  })
  acquisitionType!: AcquisitionType

  @Column({ type: 'uuid', nullable: true })
  customerId?: string | null

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: User | null

  @Column({ type: 'uuid', nullable: true })
  eventId?: string | null

  @ManyToOne(() => EventModel, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'event_id' })
  event?: EventModel | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  place?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  street?: string | null

  @Column({ type: 'varchar', length: 128, nullable: true })
  contactPerson?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactPersonContact?: string | null

  @Column({ type: 'float', nullable: true })
  discount?: number | null

  @Column({ type: 'uuid', name: 'service_location_id', nullable: true })
  serviceLocationId?: string | null

  @ManyToOne(() => ServiceLocationModel, {
    onDelete: 'SET NULL',
    nullable: true
  })
  @JoinColumn({ name: 'service_location_id' })
  serviceLocation?: ServiceLocationModel | null

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  products?: OrderProduct[]

  @OneToMany(() => OrderService, (orderService) => orderService.order)
  services?: OrderService[]

  @OneToMany(
    () => OrderAdditionalCost,
    (orderAdditionalCost) => orderAdditionalCost.order
  )
  additionalCosts?: OrderAdditionalCost[]

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)'
  })
  placedAt!: Date

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

  constructor(orderNumber: string, status: string, totalAmount: number) {
    this.orderNumber = orderNumber
    this.status = status
    this.totalAmount = totalAmount
  }
}
