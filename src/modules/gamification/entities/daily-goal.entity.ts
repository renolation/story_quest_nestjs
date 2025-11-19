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
 * PHASE 4 - DAILY GOALS
 *
 * Tracks daily learning goals for students (words practiced, time spent).
 */
@Entity('daily_goals')
@Index(['studentId', 'goalDate'], { unique: true })
export class DailyGoal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'goal_date', type: 'date' })
  goalDate: Date;

  @Column({ name: 'target_words', type: 'int', default: 5 })
  targetWords: number;

  @Column({ name: 'completed_words', type: 'int', default: 0 })
  completedWords: number;

  @Column({ name: 'target_minutes', type: 'int', default: 15 })
  targetMinutes: number;

  @Column({ name: 'completed_minutes', type: 'int', default: 0 })
  completedMinutes: number;

  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
