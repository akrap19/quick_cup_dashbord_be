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
import { Room } from '../room/roomModel'
import { Media } from '../media/mediaModel'

@Entity()
@Unique(['roomId', 'mediaId'])
export class RoomImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  roomId!: string

  @ManyToOne(() => Room, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'room_id' })
  room!: Room

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
    roomId: string,
    mediaId: string
  ) {
    this.roomId = roomId
    this.mediaId = mediaId
  }
}
