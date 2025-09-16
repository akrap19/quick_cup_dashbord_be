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
import { StaffImage } from './staffImageModel'
import { StaffTranslation } from '../staff_translation/staffTranslationModel'

@Entity()
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  barnahusId!: string

  @ManyToOne(() => Barnahus, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'barnahus_id' })
  barnahus!: Barnahus

  @Column({ type: 'varchar', length: 50 })
  name: string

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
    () => StaffTranslation,
    (staffTranslation) => staffTranslation.staff
  )
  staffTranslations!: StaffTranslation[]

  @OneToMany(() => StaffImage, (staffImage) => staffImage.staff)
  staffImages!: StaffImage[]

  constructor(barnahusId: string, name: string) {
    this.barnahusId = barnahusId
    this.name = name
  }
}
