import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * PHASE 7 - GRADES
 *
 * Grade levels for students (3, 4, 5).
 */
@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'grade_level', type: 'int', unique: true })
  gradeLevel: number; // 3, 4, or 5

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
