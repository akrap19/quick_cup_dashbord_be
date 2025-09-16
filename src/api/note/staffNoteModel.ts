import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { CaseStaff } from '../case/caseStaffModel'

@Entity()
export class StaffNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  caseStaffId!: string

  @ManyToOne(() => CaseStaff, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'case_staff_id' })
  caseStaff!: CaseStaff

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

  constructor(caseStaffId: string, note: string) {
    this.caseStaffId = caseStaffId
    this.note = note
  }
}
