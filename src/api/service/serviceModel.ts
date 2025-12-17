import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm'
import { ServicePrice } from './servicePriceModel'

export enum PriceCalculationUnit {
  PIECE = 'piece',
  UNIT = 'unit',
  TRANSPORTATION_UNIT = 'transportationUnit'
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
    priceCalculationUnit: PriceCalculationUnit | null = null
  ) {
    this.name = name
    this.description = description
    this.priceCalculationUnit = priceCalculationUnit
  }
}
