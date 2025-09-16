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
import { Staff } from './staffModel'

@Entity()
@Unique(['staffId', 'mediaId'])
export class StaffImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  staffId!: string

  @ManyToOne(() => Staff, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'staff_id' })
  staff!: Staff

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
    staffId: string,
    mediaId: string
  ) {
    this.staffId = staffId
    this.mediaId = mediaId
  }
}
