import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Unique,
  OneToMany
} from 'typeorm'
import { User } from '../user/userModel'
import { Role } from '../role/roleModel'
import { UserRoleBarnahus } from '../user_role_barnahus/userRoleBarnahusModel'

@Entity()
@Unique(['userId', 'roleId'])
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  userId!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column()
  roleId!: string

  @ManyToOne(() => Role, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'role_id' })
  role!: Role

  @Column({ nullable: true })
  assignedById?: string

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_by_id' })
  assignedBy!: User

  @OneToMany(
    () => UserRoleBarnahus,
    (userRoleBarnahus) => userRoleBarnahus.userRole,
    { eager: true }
  )
  userRoleBarnahuses!: UserRoleBarnahus[]

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

  constructor(userId: string, roleId: string, assignedById: string) {
    this.userId = userId
    this.roleId = roleId
    this.assignedById = assignedById
  }
}
