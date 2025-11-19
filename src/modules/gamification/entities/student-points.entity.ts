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
 * PHASE 4 - STUDENT POINTS
 *
 * Tracks student points, streaks, and gamification metrics.
 */
@Entity('student_points')
export class StudentPoints {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id', unique: true })
  studentId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'total_points', type: 'int', default: 0 })
  totalPoints: number;

  @Column({ name: 'current_streak', type: 'int', default: 0 })
  currentStreak: number;

  @Column({ name: 'longest_streak', type: 'int', default: 0 })
  longestStreak: number;

  @Column({ name: 'last_activity_date', type: 'date', nullable: true })
  lastActivityDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
