import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Class } from './class.entity';

/**
 * PHASE 7 - STUDENT CLASS ASSIGNMENTS
 *
 * Many-to-many relationship between students and classes.
 */
@Entity('student_classes')
@Index(['studentId', 'classId'], { unique: true })
export class StudentClass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'class_id' })
  classId: number;

  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt: Date;
}
