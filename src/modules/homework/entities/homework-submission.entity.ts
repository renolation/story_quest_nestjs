import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { HomeworkAssignment } from './homework-assignment.entity';
import { User } from '../../users/entities/user.entity';

/**
 * PHASE 7 - HOMEWORK SUBMISSIONS
 *
 * Student submissions for homework assignments.
 */
@Entity('homework_submissions')
@Index(['homeworkId', 'studentId'], { unique: true })
export class HomeworkSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'homework_id' })
  homeworkId: number;

  @ManyToOne(() => HomeworkAssignment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'homework_id' })
  homework: HomeworkAssignment;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'submission_text', type: 'text', nullable: true })
  submissionText: string;

  @Column({ name: 'file_url', type: 'varchar', length: 500, nullable: true })
  fileUrl: string;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @Column({ name: 'graded_at', type: 'timestamp', nullable: true })
  gradedAt: Date;

  @Column({ type: 'int', nullable: true })
  grade: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;
}
