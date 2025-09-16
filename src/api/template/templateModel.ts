import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { Barnahus } from '../barnahus/barnahusModel'
import { TemplateRoom } from './templateRoomModel'
import { TemplateAbout } from './templateAboutModel'
import { TemplateStaff } from './templateStaffModel'
import { TemplateStatus } from './interface'
import { Case } from '../case/caseModel'
import { User } from '../user/userModel'

@Entity()
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  barnahusId!: string

  @ManyToOne(() => Barnahus, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'barnahus_id' })
  barnahus!: Barnahus

  @Column({ type: 'boolean', default: false })
  isGeneral!: boolean

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string

  @Column({ type: 'varchar', length: 36 })
  name: string

  @Column({ type: 'enum', enum: TemplateStatus })
  status: TemplateStatus

  @Column({ nullable: true })
  addedById?: string

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'added_by_id' })
  addedBy!: User

  @OneToMany(() => Case, (c) => c.template)
  cases!: Case[]

  @OneToMany(() => TemplateRoom, (templateRoom) => templateRoom.template, {
    eager: true
  })
  templateRooms!: TemplateRoom[]

  @OneToMany(() => TemplateAbout, (templateAbout) => templateAbout.template, {
    eager: true
  })
  templateAbouts!: TemplateAbout[]

  @OneToMany(() => TemplateStaff, (templateStaff) => templateStaff.template, {
    eager: true
  })
  templateStaff!: TemplateStaff[]

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
    addedById: string,
    barnahusId: string,
    isGeneral: boolean,
    name: string,
    status: TemplateStatus,
    password?: string
  ) {
    this.addedById = addedById
    this.barnahusId = barnahusId
    this.isGeneral = isGeneral
    this.name = name
    this.status = status
    this.password = password
  }
}
