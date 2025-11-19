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
import { User } from '../../users/entities/user.entity';

/**
 * PHASE 7 - GIFTCODES
 *
 * Trial codes, discount codes, and access codes for students.
 */
@Entity('giftcodes')
export class Giftcode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'center_id' })
  centerId: number;

  @ManyToOne(() => Center, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ name: 'code_type', type: 'varchar', length: 20 })
  codeType: string; // trial, discount, full_access

  @Column({ name: 'duration_days', type: 'int' })
  durationDays: number;

  @Column({ name: 'max_uses', type: 'int', default: 1 })
  maxUses: number;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount: number;

  @Column({ name: 'valid_from', type: 'timestamp' })
  validFrom: Date;

  @Column({ name: 'valid_to', type: 'timestamp' })
  validTo: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
