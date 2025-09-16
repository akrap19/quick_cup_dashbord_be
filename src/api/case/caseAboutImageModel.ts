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
import { Media } from '../media/mediaModel'
import { CaseAbout } from './caseAboutModel'

@Entity()
@Unique(['caseAboutId', 'mediaId'])
export class CaseAboutImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  caseAboutId!: string

  @ManyToOne(() => CaseAbout, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'case_about_id' })
  caseAbout!: CaseAbout

  @Column()
  mediaId!: string

  @ManyToOne(() => Media, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'media_id' })
  media!: Media

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
    caseAboutId: string,
    mediaId: string
  ) {
    this.caseAboutId = caseAboutId
    this.mediaId = mediaId
  }
}
