import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Level } from '../../levels/entities/level.entity';
import { StudentQuestionAnswer } from './student-question-answer.entity';

@Entity('student_level_attempts')
export class StudentLevelAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  score: number;

  @Column({ name: 'points_earned', default: 0 })
  pointsEarned: number;

  @Column({ name: 'time_spent_seconds', nullable: true })
  timeSpentSeconds: number;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @Column({ name: 'is_passed', default: false })
  isPassed: boolean;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true, type: 'timestamp' })
  completedAt: Date;

  // Relationships
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Level, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'level_id' })
  level: Level;

  @OneToMany(() => StudentQuestionAnswer, (answer) => answer.attempt)
  answers: StudentQuestionAnswer[];

  // Getters for foreign key IDs (if needed)
  get studentId(): number {
    return this.student?.id;
  }

  get levelId(): number {
    return this.level?.id;
  }
}
