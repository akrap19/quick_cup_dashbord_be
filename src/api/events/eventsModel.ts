import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { User } from '../user/userModel'

@Entity()
export class EventModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 128 })
  title!: string

  @Column({ type: 'text', nullable: true })
  description?: string | null

  @Column({ type: 'timestamp' })
  startDate!: Date

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  place?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  street?: string | null

  @ManyToOne(() => User, (user) => user.events, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  owner!: User

  @Column({ type: 'uuid' })
  userId!: string

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
    title: string,
    description: string | null = null,
    startDate: Date,
    endDate: Date | null = null,
    location: string | null = null,
    place: string | null = null,
    street: string | null = null
  ) {
    this.title = title
    this.description = description
    this.startDate = startDate
    this.endDate = endDate
    this.location = location
    this.place = place
    this.street = street
  }
}
