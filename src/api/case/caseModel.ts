import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique
} from 'typeorm'
import { Barnahus } from '../barnahus/barnahusModel'
import { Template } from '../template/templateModel'
import { BarnahusLanguage } from '../language/languageModel'
import { CaseStatus } from './interface'

@Entity()
@Unique(['customId', 'barnahusId'])
export class Case {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 36, unique: true })
  customId: string

  @Column()
  barnahusId!: string

  @ManyToOne(() => Barnahus, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'barnahus_id' })
  barnahus!: Barnahus

  @Column({ type: 'enum', enum: CaseStatus })
  status: CaseStatus

  @Column({ type: 'boolean', default: false })
  canAddNotes!: boolean

  @Column({ nullable: true })
  templateId?: string

  @ManyToOne(() => Template, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL'
  })
  
  @JoinColumn({ name: 'template_id' })
  template!: Template

  @Column({ nullable: true })
  languageId?: string

  @ManyToOne(() => BarnahusLanguage, { nullable: true, eager: true })
  @JoinColumn({ name: 'language_id' })
  language!: BarnahusLanguage

  @Column({ type: 'varchar', length: 255 })
  password: string

  @Column({ type: 'boolean', default: false })
  shouldChangePassword!: boolean

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
    customId: string,
    barnahusId: string,
    status: CaseStatus,
    password: string,
    shouldChangePassword: boolean
  ) {
    this.customId = customId
    this.barnahusId = barnahusId
    this.status = status
    this.password = password
    this.shouldChangePassword = shouldChangePassword
  }
}
