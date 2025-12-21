import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm'
import { ServicePrice } from './servicePriceModel'
import { AcquisitionType } from './acquisitionType'

export enum PriceCalculationUnit {
  PIECE = 'piece',
  UNIT = 'unit',
  TRANSPORTATION_UNIT = 'transportationUnit'
}

export { AcquisitionType }

export enum BillingInterval {
  ONE_TIME = 'one_time',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export enum InputType {
  BEFORE = 'before',
  AFTER = 'after',
  BOTH = 'both'
}

@Entity('service')
export class ServiceModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 128 })
  name!: string

  @Column({ type: 'text', nullable: true })
  description?: string | null

  @Column({
    type: 'enum',
    enum: PriceCalculationUnit,
    nullable: true
  })
  priceCalculationUnit?: PriceCalculationUnit | null

  @Column({
    type: 'enum',
    enum: AcquisitionType,
    nullable: true
  })
  acquisitionType?: AcquisitionType | null

  @Column({
    type: 'enum',
    enum: BillingInterval,
    nullable: true
  })
  billingInterval?: BillingInterval | null

  @Column({ type: 'boolean', nullable: true })
  isDefaultServiceForBuy?: boolean | null

  @Column({ type: 'boolean', nullable: true })
  isDefaultServiceForRent?: boolean | null

  @Column({
    type: 'enum',
    enum: InputType,
    nullable: true
  })
  inputTypeForBuy?: InputType | null

  @Column({
    type: 'enum',
    enum: InputType,
    nullable: true
  })
  inputTypeForRent?: InputType | null

  @OneToMany(() => ServicePrice, (price) => price.service)
  prices?: ServicePrice[]

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
    name: string,
    description: string | null = null,
    priceCalculationUnit: PriceCalculationUnit | null = null,
    acquisitionType: AcquisitionType | null = null,
    billingInterval: BillingInterval | null = null,
    isDefaultServiceForBuy: boolean | null = null,
    isDefaultServiceForRent: boolean | null = null,
    inputTypeForBuy: InputType | null = null,
    inputTypeForRent: InputType | null = null
  ) {
    this.name = name
    this.description = description
    this.priceCalculationUnit = priceCalculationUnit
    this.acquisitionType = acquisitionType
    this.billingInterval = billingInterval
    this.isDefaultServiceForBuy = isDefaultServiceForBuy
    this.isDefaultServiceForRent = isDefaultServiceForRent
    this.inputTypeForBuy = inputTypeForBuy
    this.inputTypeForRent = inputTypeForRent
  }
}
