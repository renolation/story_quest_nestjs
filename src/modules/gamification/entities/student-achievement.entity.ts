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
import { Achievement } from './achievement.entity';

/**
 * PHASE 4 - STUDENT ACHIEVEMENTS
 *
 * Tracks individual student progress toward achievements.
 */
@Entity('student_achievements')
@Index(['studentId', 'achievementId'], { unique: true })
export class StudentAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'achievement_id' })
  achievementId: number;

  @ManyToOne(() => Achievement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'achievement_id' })
  achievement: Achievement;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ name: 'is_unlocked', type: 'boolean', default: false })
  isUnlocked: boolean;

  @Column({ name: 'unlocked_at', type: 'timestamp', nullable: true })
  unlockedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
