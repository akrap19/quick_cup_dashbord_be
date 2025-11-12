import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

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
