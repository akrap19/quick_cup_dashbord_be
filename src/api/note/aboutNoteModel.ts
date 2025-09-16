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

@Entity()
export class AboutNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  caseAboutId: string

  @ManyToOne(() => CaseAbout, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'case_about_id' })
  caseAbout!: CaseAbout

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
    caseAboutId: string,
    note: string
  ) {
    this.caseAboutId = caseAboutId
    this.note = note
  }
}
