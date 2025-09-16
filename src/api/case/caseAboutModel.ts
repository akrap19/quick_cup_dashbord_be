import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm'
import { Case } from './caseModel'
import { Media } from '../media/mediaModel'
import { CaseAboutImage } from './caseAboutImageModel'

@Entity()
export class CaseAbout {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  caseId: string

  @ManyToOne(() => Case, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'case_id' })
  case!: Case

  @Column({ type: 'int' })
  orderNumber: number

  @Column({ type: 'varchar', length: 50, nullable: true })
  title?: string

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description?: string

  @Column({ nullable: true })
  audioId?: string

  @ManyToOne(() => Media, { onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'audio_id' })
  audio!: Media

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

  @OneToMany(() => CaseAboutImage, (caseAboutImage) => caseAboutImage.caseAbout)
  caseAboutImages!: CaseAboutImage[]

  constructor(
    caseId: string,
    orderNumber: number,
    title?: string,
    description?: string,
    audioId?: string
  ) {
    this.caseId = caseId
    this.orderNumber = orderNumber
    this.title = title
    this.description = description
    this.audioId = audioId
  }
}
