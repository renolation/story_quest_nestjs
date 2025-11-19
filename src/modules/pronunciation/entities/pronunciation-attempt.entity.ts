import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * PHASE 3 - PRONUNCIATION ATTEMPTS
 *
 * Tracks student pronunciation practice attempts with audio recordings
 * and accuracy scores from speech recognition.
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

  @Column({ type: 'varchar', length: 255 })
  word: string;

  @Column({ name: 'audio_url', type: 'varchar', length: 500, nullable: true })
  audioUrl: string;

  @Column({ type: 'text', nullable: true })
  transcription: string;

  @Column({
    name: 'accuracy_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  accuracyScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
