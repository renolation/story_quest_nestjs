import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from './question.entity';

@Entity('answer_options')
export class AnswerOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'option_text', type: 'text' })
  optionText: string;

  @Column({ name: 'option_image_url', length: 500, nullable: true })
  optionImageUrl: string;

  @Column({ name: 'option_audio_url', length: 500, nullable: true })
  optionAudioUrl: string;

  @Column({ name: 'is_correct', default: false })
  isCorrect: boolean;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Question, (question) => question.answerOptions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  // Getter for foreign key ID
  get questionId(): number {
    return this.question?.id;
  }
}
