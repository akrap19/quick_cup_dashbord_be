import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { User } from '../user/userModel'

@Entity()
@Unique(['userId', 'name'])
export class OnboardingSection {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'varchar', length: 36 })
  name: string

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

  constructor(userId: string, name: string) {
    this.userId = userId
    this.name = name
  }
}
