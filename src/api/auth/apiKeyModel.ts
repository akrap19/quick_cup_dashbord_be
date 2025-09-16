import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
  key: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  description?: string

  @Column({ nullable: false, default: false })
  isActive: boolean

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

  constructor(key: string, description?: string, isActive?: boolean) {
    this.key = key
    this.description = description
    this.isActive = isActive || false
  }
}
