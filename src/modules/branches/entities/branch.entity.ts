import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Center } from '../../centers/entities/center.entity';

/**
 * PHASE 7 - BRANCHES
 *
 * Physical branches/locations of a center.
 */
@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'center_id' })
  centerId: number;

  @ManyToOne(() => Center, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
