import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity()
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('varchar')
  name: string

  @Column('varchar')
  templateId: string

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  createdAt!: Date

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)'
  })
  updatedAt!: Date

  constructor(name: string, templateId: string) {
    this.name = name
    this.templateId = templateId
  }
}
