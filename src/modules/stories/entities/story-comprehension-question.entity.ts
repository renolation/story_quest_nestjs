import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Story } from './story.entity';

/**
 * PHASE 5 - STORY COMPREHENSION QUESTIONS
 *
 * Questions to test reading comprehension after story completion.
 */
@Entity('story_comprehension_questions')
export class StoryComprehensionQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'story_id' })
  storyId: number;

  @ManyToOne(() => Story, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ name: 'question_text', type: 'text' })
  questionText: string;

  @Column({ name: 'correct_answer', type: 'text' })
  correctAnswer: string;

  @Column({ type: 'text', array: true, nullable: true })
  options: string[]; // Multiple choice options

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
