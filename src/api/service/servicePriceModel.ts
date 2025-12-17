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
import { ServiceModel } from './serviceModel'
import { decimalTransformer } from '../../services/utils'

@Entity()
@Index(['serviceId', 'minQuantity'])
export class ServicePrice {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  serviceId!: string

  @ManyToOne(() => ServiceModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service!: ServiceModel

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
    serviceId: string,
    minQuantity: number,
    price: number,
    maxQuantity?: number | null
  ) {
    this.serviceId = serviceId
    this.minQuantity = minQuantity
    this.price = price
    this.maxQuantity = maxQuantity ?? null
  }
}
