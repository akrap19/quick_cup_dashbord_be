import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'
import { AcquisitionType } from '../products/interface'
import { MethodOfPayment, BillingType } from './interface'
import { decimalTransformer } from '../../services/utils'

@Entity('additional_costs')
export class AdditionalCost {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({
    name: 'method_of_payment',
    type: 'enum',
    enum: MethodOfPayment
  })
  methodOfPayment!: MethodOfPayment

  @Column({
    name: 'billing_type',
    type: 'enum',
    enum: BillingType
  })
  billingType!: BillingType

  @Column({
    name: 'acquisition_type',
    type: 'enum',
    enum: AcquisitionType
  })
  acquisitionType!: AcquisitionType

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    transformer: decimalTransformer
  })
  price!: number

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
    name: string,
    methodOfPayment: MethodOfPayment,
    billingType: BillingType,
    acquisitionType: AcquisitionType,
    price: number
  ) {
    this.name = name
    this.methodOfPayment = methodOfPayment
    this.billingType = billingType
    this.acquisitionType = acquisitionType
    this.price = price
  }
}
