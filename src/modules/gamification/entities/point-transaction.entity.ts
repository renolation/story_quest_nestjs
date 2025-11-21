import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * PHASE 4 - GAMIFICATION: POINT TRANSACTIONS
 *
 * Tracks all point transactions (awards and deductions) for audit trail.
 * Provides detailed history of how students earned or lost points.
 */
@Entity('point_transactions')
@Index(['studentId'])
@Index(['createdAt'])
export class PointTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ type: 'int' })
  points: number; // Can be positive (award) or negative (deduction)

  @Column({
    type: 'enum',
    enum: [
      'level_complete',
      'achievement_unlock',
      'perfect_score',
      'streak_bonus',
      'daily_login',
      'admin_adjustment',
    ],
  })
  reason: string; // Why points were awarded or deducted

  @Column({ name: 'reference_id', type: 'int', nullable: true })
  referenceId: number; // ID of related entity (levelId, achievementId, etc.)

  @Column({ type: 'text', nullable: true })
  notes: string; // Optional description or admin notes

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
