import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'
import { AcquisitionType } from './interface'

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 128 })
  name!: string

  @Column({ type: 'text', nullable: true })
  description?: string | null

  @Column({
    type: 'enum',
    enum: AcquisitionType,
    default: AcquisitionType.BUY
  })
  acquisitionType!: AcquisitionType

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
