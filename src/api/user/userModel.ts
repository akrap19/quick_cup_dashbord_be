import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm'
import { UserStatus } from './interface'
import { UserRole } from '../user_role/userRoleModel'
import { EventModel } from '../events/eventsModel'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 36 })
  firstName: string

  @Column({ type: 'varchar', length: 36 })
  lastName: string

  @Column({ type: 'varchar', length: 255 })
  email: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  newEmail?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string | null

  @Column({ type: 'varchar', length: 14, nullable: true })
  phoneNumber?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName?: string | null

  @Column({ type: 'varchar', length: 50, nullable: true })
  pin?: string | null

  @Column({ type: 'varchar', length: 255, nullable: true })
  street?: string | null

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.CREATED })
  status!: UserStatus

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

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles!: UserRole[]

  @OneToMany(() => EventModel, (event) => event.owner)
  events!: EventModel[]

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber?: string
  ) {
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
    this.phoneNumber = phoneNumber
  }
}
