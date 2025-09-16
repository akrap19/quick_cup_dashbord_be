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
import { BarnahusLanguage } from '../language/languageModel'
import { Staff } from '../staff/staffModel'
import { StaffStatus } from './interface'

@Entity()
@Unique(['staffId', 'languageId'])
export class StaffTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string
  @Column()
  staffId!: string

  @ManyToOne(() => Staff, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'staff_id' })
  staff!: Staff

  @Column()
  languageId!: string

  @ManyToOne(() => BarnahusLanguage, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'language_id' })
  language!: BarnahusLanguage

  @Column({ type: 'varchar', length: 50, nullable: true })
  title?: string

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description?: string

  @Column({ type: 'enum', enum: StaffStatus, default: StaffStatus.DRAFT })
  status!: StaffStatus

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
    staffId: string,
    languageId: string,
    title?: string,
    description?: string
  ) {
    this.staffId = staffId
    this.languageId = languageId
    this.title = title
    this.description = description
  }
}
