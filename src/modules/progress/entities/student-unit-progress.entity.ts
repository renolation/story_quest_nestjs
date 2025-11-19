import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Unit } from '../../units/entities/unit.entity';

@Entity('student_unit_progress')
export class StudentUnitProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'total_levels', default: 0 })
  totalLevels: number;

  @Column({ name: 'completed_levels', default: 0 })
  completedLevels: number;

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

  @ManyToOne(() => Unit, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  // Getters for foreign key IDs
  get studentId(): number {
    return this.student?.id;
  }

  get unitId(): number {
    return this.unit?.id;
  }
}
