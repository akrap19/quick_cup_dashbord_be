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
import { CaseStaff } from './caseStaffModel'

@Entity()
@Unique(['caseStaffId', 'mediaId'])
export class CaseStaffImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  caseStaffId!: string

  @ManyToOne(() => CaseStaff, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'case_staff_id' })
  caseStaff!: CaseStaff

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
    caseStaffId: string,
    mediaId: string
  ) {
    this.caseStaffId = caseStaffId
    this.mediaId = mediaId
  }
}
