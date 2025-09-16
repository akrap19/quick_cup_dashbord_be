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
import { Room } from '../room/roomModel'
import { Media } from '../media/mediaModel'
import { RoomStatus } from './interface'

@Entity()
@Unique(['roomId', 'languageId'])
export class RoomTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string
  @Column()
  roomId!: string

  @ManyToOne(() => Room, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'room_id' })
  room!: Room

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

  @Column({ type: 'enum', enum: RoomStatus, default: RoomStatus.DRAFT })
  status!: RoomStatus

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
    languageId: string,
    title?: string,
    description?: string,
    audioId?: string
  ) {
    this.roomId = roomId
    this.languageId = languageId
    this.title = title
    this.description = description
    this.audioId = audioId
  }
}
