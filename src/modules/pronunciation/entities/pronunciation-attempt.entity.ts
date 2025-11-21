import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Question } from '../../questions/entities/question.entity';

/**
 * PRONUNCIATION ATTEMPTS
 *
 * Architecture: Speech recognition is CLIENT-SIDE (mobile app)
 * Backend only stores pronunciation attempts with client-calculated scores.
 *
 * Tracks student pronunciation practice attempts with:
 * - Reference text (what should be pronounced)
 * - Recognized text (what client recognized - optional)
 * - Client-calculated scores (pronunciation, accuracy, fluency, completeness)
 */
@Entity('pronunciation_attempts')
export class PronunciationAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'question_id' })
  questionId: number;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: 'reference_text', type: 'text' })
  referenceText: string;

  @Column({ name: 'recognized_text', type: 'text', nullable: true })
  recognizedText: string;

  @Column({
    name: 'pronunciation_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  pronunciationScore: number;

  @Column({
    name: 'accuracy_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  accuracyScore: number;

  @Column({
    name: 'fluency_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  fluencyScore: number;

  @Column({
    name: 'completeness_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  completenessScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
