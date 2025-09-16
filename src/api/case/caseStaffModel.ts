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
import { Case } from './caseModel'
import { CaseStaffImage } from './caseStaffImageModel'

@Entity()
export class CaseStaff {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  caseId: string

  @ManyToOne(() => Case, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'case_id' })
  case!: Case

  @Column({ type: 'int' })
  orderNumber: number

  @Column({ type: 'varchar', length: 50, nullable: true })
  name?: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  title?: string

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description?: string

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

  @OneToMany(() => CaseStaffImage, (caseStaffImage) => caseStaffImage.caseStaff)
  caseStaffImages!: CaseStaffImage[]

  constructor(
    caseId: string,
    orderNumber: number,
    name?: string,
    title?: string,
    description?: string
  ) {
    this.caseId = caseId
    this.orderNumber = orderNumber
    this.name = name
    this.title = title
    this.description = description
  }
}
