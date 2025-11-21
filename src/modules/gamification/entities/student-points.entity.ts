import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * PHASE 4 - GAMIFICATION: STUDENT POINTS
 *
 * Tracks student points, streaks, and gamification metrics.
 * One record per student with cumulative statistics.
 */
@Entity('student_points')
export class StudentPoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id', unique: true })
  studentId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'total_points', type: 'int', default: 0 })
  totalPoints: number; // Lifetime accumulated points

  @Column({ name: 'current_streak', type: 'int', default: 0 })
  currentStreak: number; // Current consecutive days of activity

  @Column({ name: 'longest_streak', type: 'int', default: 0 })
  longestStreak: number; // Best streak ever achieved

  @Column({ name: 'last_activity_date', type: 'date', nullable: true })
  lastActivityDate: Date; // For streak calculation

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
