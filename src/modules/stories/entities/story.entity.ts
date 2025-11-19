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

/**
 * PHASE 5 - STORIES
 *
 * AI-generated stories for reading comprehension practice.
 */
@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  genre: string; // mystery, fairy_tale, mythology, daily_life

  @Column({ type: 'varchar', length: 20, nullable: true })
  difficulty: string; // easy, medium, hard

  @Column({ name: 'grade_level', type: 'int', nullable: true })
  gradeLevel: number;

  @Column({ name: 'total_word_count', type: 'int', nullable: true })
  totalWordCount: number;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
