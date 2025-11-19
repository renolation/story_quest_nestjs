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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'total_units', default: 0 })
  totalUnits: number;

  @Column({ name: 'completed_units', default: 0 })
  completedUnits: number;

  @Column({ name: 'total_points_available', default: 0 })
  totalPointsAvailable: number;

  @Column({ name: 'total_points_earned', default: 0 })
  totalPointsEarned: number;

  @Column({
    name: 'average_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  averageScore: number;

  @Column({ name: 'last_accessed_at', nullable: true, type: 'timestamp' })
  lastAccessedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Chapter, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'chapter_id' })
  chapter: Chapter;

  // Getters for foreign key IDs
  get studentId(): number {
    return this.student?.id;
  }

  get chapterId(): number {
    return this.chapter?.id;
  }
}
