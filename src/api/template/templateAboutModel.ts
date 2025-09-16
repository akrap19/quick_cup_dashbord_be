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
import { About } from '../about/aboutModel'

@Entity()
@Unique(['templateId', 'aboutId'])
export class TemplateAbout {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  templateId!: string

  @ManyToOne(() => Template, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template!: Template

  @Column()
  aboutId!: string

  @ManyToOne(() => About, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'about_id' })
  about!: About

  @Column({ type: 'boolean', default: true })
  includeDescription?: boolean

  @Column({ type: 'boolean', default: true })
  includeAudio?: boolean

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
    aboutId: string,
    includeDescription?: boolean,
    includeAudio?: boolean,
    includeImages?: boolean
  ) {
    this.templateId = templateId
    this.aboutId = aboutId
    this.includeDescription = includeDescription
    this.includeAudio = includeAudio
    this.includeImages = includeImages
  }
}
