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
import { Product } from './productsModel'

@Entity()
@Unique(['productId', 'mediaId'])
export class ProductMedia {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  productId!: string

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product

  @Column()
  mediaId!: string

  @ManyToOne(() => Media, { onDelete: 'CASCADE' })
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

  constructor(productId: string, mediaId: string) {
    this.productId = productId
    this.mediaId = mediaId
  }
}
