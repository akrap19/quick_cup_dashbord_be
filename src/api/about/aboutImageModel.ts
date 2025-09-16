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
import { About } from './aboutModel'

@Entity()
@Unique(['aboutId', 'mediaId'])
export class AboutImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  aboutId!: string

  @ManyToOne(() => About, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'about_id' })
  about!: About

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
    aboutId: string,
    mediaId: string
  ) {
    this.aboutId = aboutId
    this.mediaId = mediaId
  }
}
