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
import { Barnahus } from '../barnahus/barnahusModel'
import { RoomTranslation } from '../room_translation/roomTranslationModel'
import { RoomImage } from './roomImageModel'

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  barnahusId!: string

  @ManyToOne(() => Barnahus, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'barnahus_id' })
  barnahus!: Barnahus

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

  @OneToMany(
    () => RoomTranslation,
    (roomTranslation) => roomTranslation.room
  )
  roomTranslations!: RoomTranslation[]

  @OneToMany(
    () => RoomImage,
    (roomImage) => roomImage.room
  )
  roomImages!: RoomImage[]

  constructor(
    barnahusId: string
  ) {
    this.barnahusId = barnahusId
  }
}
