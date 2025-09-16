import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm'
import { UserRoleBarnahus } from '../user_role_barnahus/userRoleBarnahusModel'

@Entity()
export class Barnahus {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 36 })
  name: string

  @Column({ type: 'varchar', length: 127 })
  location: string

  @Column({ type: 'varchar', length: 9})
  locationCode: string

  @OneToMany(
    () => UserRoleBarnahus,
    (userRoleBarnahus) => userRoleBarnahus.barnahus
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


  constructor(name: string, location: string, locationCode: string) {
    this.name = name
    this.location = location
    this.locationCode = locationCode
  }
}
