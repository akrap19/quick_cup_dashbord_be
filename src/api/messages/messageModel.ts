import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'
import { DynamicMessageTypes } from './interface'

@Entity()
export class DynamicMessages {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 36, unique: true })
  slug: string

  @Column({ type: 'varchar', length: 127 })
  title: string

  @Column({ type: 'varchar', length: 255 })
  message: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  redirectUrl!: string

  @Column({ type: 'enum', enum: DynamicMessageTypes })
  type: DynamicMessageTypes

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
    slug: string,
    title: string,
    message: string,
    type: DynamicMessageTypes
  ) {
    this.slug = slug
    this.title = title
    this.message = message
    this.type = type
  }
}
