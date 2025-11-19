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
 * PHASE 7 - TEACHER NOTES
 *
 * Notes that teachers can add about students for tracking observations.
 */
@Entity('teacher_notes')
export class TeacherNote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'note_type', type: 'varchar', length: 50, nullable: true })
  noteType: string; // struggling, excellent, average, needs_attention

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[]; // Array of tags for categorization

  @Column({ name: 'is_private', type: 'boolean', default: false })
  isPrivate: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
