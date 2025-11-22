import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Unit } from '../../units/entities/unit.entity';
import { Center } from '../../centers/entities/center.entity';

@Entity('chapters')
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'thumbnail_url', length: 500, nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Chapter ownership: public (AGENCY) or organization-specific (CENTER)
  @Column({ name: 'center_id', nullable: true })
  centerId: number | null;

  @ManyToOne(() => Center, { nullable: true })
  @JoinColumn({ name: 'center_id' })
  center: Center | null;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Unit, (unit) => unit.chapter)
  units: Unit[];
}
