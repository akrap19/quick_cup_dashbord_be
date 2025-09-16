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
import { AboutImage } from './aboutImageModel'
import { AboutTranslation } from '../about_translation/aboutTranslationModel'

@Entity()
export class About {
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
    () => AboutTranslation,
    (aboutTranslation) => aboutTranslation.about
  )
  aboutTranslations!: AboutTranslation[]

  @OneToMany(
    () => AboutImage,
    (aboutImage) => aboutImage.about
  )
  aboutImages!: AboutImage[]



  constructor(
    barnahusId: string
  ) {
    this.barnahusId = barnahusId
  }
}
