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
import { Unit } from '../../units/entities/unit.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('levels')
export class Level {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'unit_id' })
  unitId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ name: 'time_limit_seconds', nullable: true })
  timeLimitSeconds: number;

  @Column({ name: 'passing_score', default: 70 })
  passingScore: number;

  @Column({ name: 'total_points', default: 100 })
  totalPoints: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Unit, (unit) => unit.levels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @OneToMany(() => Question, (question) => question.level)
  questions: Question[];
}
