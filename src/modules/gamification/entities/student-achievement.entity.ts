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
 * PHASE 4 - GAMIFICATION: STUDENT ACHIEVEMENTS
 *
 * Tracks which achievements students have unlocked.
 * Links students to their earned achievements with unlock timestamp.
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

  @Column({
    name: 'unlocked_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  unlockedAt: Date; // When the student earned this achievement

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
