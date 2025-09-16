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
import { Media } from '../media/mediaModel'
import { About } from '../about/aboutModel'
import { AboutStatus } from './interface'

@Entity()
@Unique(['aboutId', 'languageId'])
export class AboutTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  aboutId!: string

  @ManyToOne(() => About, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'about_id' })
  about!: About

  @Column()
  languageId!: string

  @ManyToOne(() => BarnahusLanguage, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'language_id' })
  language!: BarnahusLanguage

  @Column({ type: 'varchar', length: 50, nullable: true })
  title?: string

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description?: string

  @Column({ nullable: true })
  audioId?: string

  @ManyToOne(() => Media, { onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'audio_id' })
  audio!: Media

  @Column({ type: 'enum', enum: AboutStatus, default: AboutStatus.DRAFT })
  status!: AboutStatus

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
    aboutId: string,
    languageId: string,
    title: string,
    description: string,
    audioId?: string
  ) {
    this.aboutId = aboutId
    this.languageId = languageId
    this.title = title
    this.description = description
    this.audioId = audioId
  }
}
