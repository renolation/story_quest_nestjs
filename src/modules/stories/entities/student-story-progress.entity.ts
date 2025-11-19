import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Story } from './story.entity';

/**
 * PHASE 5 - STUDENT STORY PROGRESS
 *
 * Tracks student progress through AI-generated stories.
 */
@Entity('student_story_progress')
@Index(['studentId', 'storyId'], { unique: true })
export class StudentStoryProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'story_id' })
  storyId: number;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ name: 'current_scene', type: 'int', default: 1 })
  currentScene: number;

  @Column({ name: 'is_completed', type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({ name: 'completion_date', type: 'timestamp', nullable: true })
  completionDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
