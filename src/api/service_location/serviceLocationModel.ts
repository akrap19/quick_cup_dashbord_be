import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { User } from '../user/userModel'
import { ServiceModel } from '../service/serviceModel'

@Entity('service_location')
export class ServiceLocationModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255 })
  city!: string

  @Column({ type: 'varchar', length: 255 })
  address!: string

  @Column({ type: 'varchar', length: 14, nullable: true })
  phone?: string | null

  @Column({ type: 'varchar', length: 255 })
  email!: string

  @Column({ type: 'uuid' })
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'uuid' })
  serviceId!: string

  @ManyToOne(() => ServiceModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service!: ServiceModel

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
    city: string,
    address: string,
    email: string,
    userId: string,
    serviceId: string,
    phone?: string | null
  ) {
    this.city = city
    this.address = address
    this.email = email
    this.userId = userId
    this.serviceId = serviceId
    this.phone = phone ?? null
  }
}
