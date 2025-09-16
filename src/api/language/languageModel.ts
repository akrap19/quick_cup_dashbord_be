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
import { LanguageStatus } from './interface'
import { Barnahus } from '../barnahus/barnahusModel'
import { Case } from '../case/caseModel'

@Entity()
export class BarnahusLanguage {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 36 })
  name: string

  @Column({ type: 'varchar', length: 3, nullable: true })
  languageCode?: string

  @Column({ type: 'enum', enum: LanguageStatus })
  status: LanguageStatus

  @Column({ type: 'boolean' })
  autoTranslate: boolean

  @Column({ type: 'boolean' })
  translateable: boolean

  @Column({ type: 'boolean', default: false })
  isDefault: boolean

  @Column()
  barnahusId!: string

  @ManyToOne(() => Barnahus, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'barnahus_id' })
  barnahus!: Barnahus

  @OneToMany(() => Case, (c) => c.language)
  cases!: Case[]

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
    name: string,
    status: LanguageStatus,
    autoTranslate: boolean,
    translateable: boolean,
    barnahusId: string,
    isDefault: boolean,
    languageCode?: string
  ) {
    this.name = name
    this.status = status
    this.autoTranslate = autoTranslate
    this.translateable = translateable
    this.barnahusId = barnahusId
    this.isDefault = isDefault
    this.languageCode = languageCode
  }
}
