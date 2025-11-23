import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Branch } from '../../branches/entities/branch.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { User } from '../../users/entities/user.entity';

/**
 * PHASE 7 - CLASSES
 *
 * Teaching classes within a branch, assigned to a teacher.
 */
@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'branch_id' })
  branchId: number;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ name: 'grade_id' })
  gradeId: number;

  @ManyToOne(() => Grade, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grade_id' })
  grade: Grade;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'teacher_id', nullable: true })
  teacherId: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ name: 'max_students', type: 'int', default: 30 })
  maxStudents: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
