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
import { Template } from './templateModel'
import { Staff } from '../staff/staffModel'

@Entity()
@Unique(['templateId', 'staffId'])
export class TemplateStaff {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  templateId!: string

  @ManyToOne(() => Template, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template!: Template

  @Column()
  staffId!: string

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff!: Staff

  @Column({ type: 'boolean', default: true })
  includeName?: boolean

  @Column({ type: 'boolean', default: true })
  includeDescription?: boolean

  @Column({ type: 'boolean', default: true })
  includeImages?: boolean

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
    templateId: string,
    staffId: string,
    includeName?: boolean,
    includeDescription?: boolean,
    includeImages?: boolean
  ) {
    this.templateId = templateId
    this.staffId = staffId
    this.includeName = includeName
    this.includeDescription = includeDescription
    this.includeImages = includeImages
  }
}
