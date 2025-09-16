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
import { Room } from '../room/roomModel'
import { Template } from './templateModel'

@Entity()
@Unique(['templateId', 'roomId'])
export class TemplateRoom {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  templateId!: string

  @ManyToOne(() => Template, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template!: Template

  @Column()
  roomId!: string

  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room!: Room

  @Column({ type: 'int' })
  orderNumber: number

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
    roomId: string,
    orderNumber: number,
    includeDescription?: boolean,
    includeAudio?: boolean,
    includeImages?: boolean
  ) {
    this.templateId = templateId
    this.roomId = roomId
    this.orderNumber = orderNumber
    this.includeDescription = includeDescription
    this.includeAudio = includeAudio
    this.includeImages = includeImages
  }
}
