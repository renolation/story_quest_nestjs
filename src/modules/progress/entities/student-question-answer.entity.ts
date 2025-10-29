import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudentLevelAttempt } from './student-level-attempt.entity';
import { Question } from '../../questions/entities/question.entity';
import { User } from '../../users/entities/user.entity';
import { AnswerOption } from '../../questions/entities/answer-option.entity';

@Entity('student_question_answers')
export class StudentQuestionAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'attempt_id' })
  attemptId: string;

  @Column({ name: 'question_id' })
  questionId: string;

  @Column({ name: 'student_id' })
  studentId: string;

  @Column({ name: 'selected_option_id', nullable: true })
  selectedOptionId: string;

  @Column({ name: 'answer_text', type: 'text', nullable: true })
  answerText: string;

  @Column({ name: 'answer_audio_url', length: 500, nullable: true })
  answerAudioUrl: string;

  @Column({ name: 'is_correct', nullable: true })
  isCorrect: boolean;

  @Column({ name: 'points_earned', default: 0 })
  pointsEarned: number;

  @Column({ name: 'time_spent_seconds', nullable: true })
  timeSpentSeconds: number;

  @CreateDateColumn({ name: 'answered_at' })
  answeredAt: Date;

  @ManyToOne(() => StudentLevelAttempt, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attempt_id' })
  attempt: StudentLevelAttempt;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => AnswerOption, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'selected_option_id' })
  selectedOption: AnswerOption;
}
