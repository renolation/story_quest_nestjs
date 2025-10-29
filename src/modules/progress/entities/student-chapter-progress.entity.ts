import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Chapter } from '../../chapters/entities/chapter.entity';

@Entity('student_chapter_progress')
export class StudentChapterProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id' })
  studentId: string;

  @Column({ name: 'chapter_id' })
  chapterId: string;

  @Column({ name: 'total_units', default: 0 })
  totalUnits: number;

  @Column({ name: 'completed_units', default: 0 })
  completedUnits: number;

  @Column({ name: 'total_points_available', default: 0 })
  totalPointsAvailable: number;

  @Column({ name: 'total_points_earned', default: 0 })
  totalPointsEarned: number;

  @Column({ name: 'average_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageScore: number;

  @Column({ name: 'last_accessed_at', nullable: true, type: 'timestamp' })
  lastAccessedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Chapter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;
}
