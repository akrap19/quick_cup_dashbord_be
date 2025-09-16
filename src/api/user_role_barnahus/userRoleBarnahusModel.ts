import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Unique
} from 'typeorm'
import { UserRole } from '../user_role/userRoleModel'
import { Barnahus } from '../barnahus/barnahusModel'
import { User } from '../user/userModel'

@Entity()
@Unique(['userRoleId', 'barnahusId'])
export class UserRoleBarnahus {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  userRoleId!: string

  @ManyToOne(() => UserRole, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_role_id' })
  userRole!: UserRole

  @Column()
  barnahusId!: string

  @ManyToOne(() => Barnahus, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'barnahus_id' })
  barnahus!: Barnahus

  @Column({ type: 'varchar', length: 127, nullable: true })
  userProfession?: string

  @Column({ nullable: true })
  assignedById?: string

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_by_id' })
  assignedBy!: User

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

  constructor(userRoleId: string, barnahusId: string, assignedById: string) {
    this.userRoleId = userRoleId
    this.barnahusId = barnahusId
    this.assignedById = assignedById
  }
}
