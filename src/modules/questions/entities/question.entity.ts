import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Level } from '../../levels/entities/level.entity';
import { AnswerOption } from './answer-option.entity';
import { QuestionType, PlacementPosition } from '../../../common/enums';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'level_id' })
  levelId: string;

  @Column({
    name: 'question_type',
    type: 'enum',
    enum: QuestionType,
  })
  questionType: QuestionType;

  @Column({ name: 'question_text', type: 'text' })
  questionText: string;

  @Column({ name: 'question_audio_url', length: 500, nullable: true })
  questionAudioUrl: string;

  @Column({ name: 'question_image_url', length: 500, nullable: true })
  questionImageUrl: string;

  @Column({
    name: 'question_place',
    type: 'enum',
    enum: PlacementPosition,
    nullable: true,
  })
  questionPlace: PlacementPosition;

  @Column({
    name: 'answer_place',
    type: 'enum',
    enum: PlacementPosition,
    nullable: true,
  })
  answerPlace: PlacementPosition;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ default: 10 })
  points: number;

  @Column({ type: 'text', nullable: true })
  hint: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Level, (level) => level.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'level_id' })
  level: Level;

  @OneToMany(() => AnswerOption, (answerOption) => answerOption.question)
  answerOptions: AnswerOption[];
}
