import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { AcquisitionType, ProductStatus } from './interface'
import { ProductMedia } from './productsMediaModel'
import { ProductPrice } from './productPriceModel'
import { ProductState } from '../product_state/productStateModel'
import { Media } from '../media/mediaModel'

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

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE
  })
  status!: ProductStatus

  @OneToMany(() => ProductMedia, (productMedia) => productMedia.product)
  images?: ProductMedia[]

  @OneToMany(() => ProductPrice, (price) => price.product)
  prices?: ProductPrice[]

  @OneToMany(() => ProductState, (productState) => productState.product)
  productStates?: ProductState[]

  @Column({
    name: 'design_template_id',
    type: 'varchar',
    length: 36,
    nullable: true
  })
  designTemplateId?: string | null

  @ManyToOne(() => Media, { nullable: true })
  @JoinColumn({ name: 'design_template_id' })
  designTemplate?: Media | null

  @Column({
    name: 'owned_by',
    type: 'varchar',
    length: 36,
    nullable: true
  })
  ownedBy?: string | null

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
