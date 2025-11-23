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
import { Center } from '../../centers/entities/center.entity';
import { Branch } from '../../branches/entities/branch.entity';

/**
 * Teacher Status Enum
 */
export enum TeacherStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * Teacher Entity
 *
 * Teachers are users with TEACHER role who belong to a CENTER.
 * They create educational content and manage assigned students.
 *
 * Relationships:
 * - Belongs to ONE User (1:1)
 * - Belongs to ONE Center (many:1)
 * - Belongs to ONE Branch (many:1, optional)
 *
 * Access Control:
 * - AGENCY: Can create/manage teachers for any center
 * - CENTER: Can create/manage teachers for own center only
 * - TEACHER: Can view/update own profile only
 */
@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'center_id' })
  centerId: number;

  @ManyToOne(() => Center, (center) => center.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'center_id' })
  center: Center;

  @Column({ name: 'branch_id', nullable: true })
  branchId: number | null;

  @ManyToOne(() => Branch, (branch) => branch.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch | null;

  @Column({ name: 'employee_id', type: 'varchar', length: 50, nullable: true })
  employeeId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  specialization: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'hire_date', type: 'date', nullable: true })
  hireDate: Date | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: TeacherStatus.ACTIVE,
  })
  status: TeacherStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
