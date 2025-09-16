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
import { LoginType, UserSessionStatus } from './interface'

@Entity()
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  userId: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'varchar', length: 255 })
  refreshToken: string

  @Column({ type: 'timestamp' })
  expiresAt: Date

  @Column({
    type: 'enum',
    enum: UserSessionStatus,
    default: UserSessionStatus.ACTIVE
  })
  status!: UserSessionStatus

  @Column({
    type: 'enum',
    enum: LoginType,
    default: LoginType.WEB
  })
  loginType: LoginType

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

  constructor(userId: string, refreshToken: string, expiresAt: Date, loginType: LoginType) {
    this.loginType = loginType
    this.userId = userId
    this.refreshToken = refreshToken
    this.expiresAt = expiresAt
  }
}
