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
import { CaseRoom } from './caseRoomModel'

@Entity()
@Unique(['caseRoomId', 'mediaId'])
export class CaseRoomImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  caseRoomId!: string

  @ManyToOne(() => CaseRoom, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'case_room_id' })
  caseRoom!: CaseRoom

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
    caseRoomId: string,
    mediaId: string
  ) {
    this.caseRoomId = caseRoomId
    this.mediaId = mediaId
  }
}
