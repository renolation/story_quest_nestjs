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
 * PHASE 7 - CURRICULUM CONTENT
 *
 * Teacher-created curriculum content that can be reviewed and approved.
 */
@Entity('curriculum_content')
export class CurriculumContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'content_type', type: 'varchar', length: 50, nullable: true })
  contentType: string; // lesson, homework, quiz

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string; // draft, pending_review, approved, rejected

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
