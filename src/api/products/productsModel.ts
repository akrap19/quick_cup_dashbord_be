import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm'
import { AcquisitionType } from './interface'
import { ProductMedia } from './productsMediaModel'
import { ProductPrice } from './productPriceModel'
import { ProductState } from '../product_state/productStateModel'

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 128 })
  name!: string

  @Column({ type: 'varchar', length: 128 })
  size?: string

  @Column({ type: 'varchar', length: 128 })
  unit?: string

  @Column({ type: 'int' })
  quantityPerUnit?: number

  @Column({ type: 'varchar', length: 128 })
  transportationUnit?: string

  @Column({ type: 'int' })
  unitsPerTransportationUnit?: number

  @Column({ type: 'text', nullable: true })
  description?: string | null

  @Column({
    type: 'enum',
    enum: AcquisitionType,
    default: AcquisitionType.BUY
  })
  acquisitionType!: AcquisitionType

  @OneToMany(() => ProductMedia, (productMedia) => productMedia.product)
  images?: ProductMedia[]

  @OneToMany(() => ProductPrice, (price) => price.product)
  prices?: ProductPrice[]

  @OneToMany(() => ProductState, (productState) => productState.product)
  productStates?: ProductState[]

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
    description: string,
    acquisitionType: AcquisitionType
  ) {
    this.name = name
    this.description = description
    this.acquisitionType = acquisitionType
  }
}
