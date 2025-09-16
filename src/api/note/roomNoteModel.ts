import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { CaseAbout } from '../case/caseAboutModel'
import { CaseRoom } from '../case/caseRoomModel'

@Entity()
export class RoomNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  caseRoomId!: string

  @ManyToOne(() => CaseRoom, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'case_room_id' })
  caseRoom!: CaseRoom

  @Column({ type: 'varchar', length: 500, nullable: false })
  note: string
  
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
    note: string
  ) {
    this.caseRoomId = caseRoomId
    this.note = note
  }
}
