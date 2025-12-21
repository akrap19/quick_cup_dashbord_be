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
import { AcquisitionType } from './acquisitionType'
import { decimalTransformer } from '../../services/utils'

@Entity()
@Index(['serviceId', 'acquisitionType', 'minQuantity'])
export class ServicePrice {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'service_id' })
  serviceId!: string

  @ManyToOne(() => ServiceModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service!: ServiceModel

  @Column({
    type: 'enum',
    enum: AcquisitionType,
    default: 'buy'
  })
  acquisitionType!: AcquisitionType

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
    acquisitionType: AcquisitionType,
    minQuantity: number,
    price: number,
    maxQuantity?: number | null
  ) {
    this.serviceId = serviceId
    this.acquisitionType = acquisitionType
    this.minQuantity = minQuantity
    this.price = price
    this.maxQuantity = maxQuantity ?? null
  }
}
