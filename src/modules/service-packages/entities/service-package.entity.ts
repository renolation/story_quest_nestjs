import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PHASE 2 - SERVICE PACKAGES
 *
 * Represents subscription packages/plans that AGENCY creates for CENTERS to purchase.
 *
 * Business Logic:
 * - AGENCY creates packages with different tiers (Basic, Pro, Enterprise, etc.)
 * - Each package has limits: max students, branches, teachers
 * - Pricing: monthly and yearly options
 * - Features stored as JSONB for flexibility
 * - CENTERS can browse and purchase these packages
 */
@Entity('service_packages')
export class ServicePackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, any> | null;

  @Column({ name: 'max_students', type: 'int', nullable: true })
  maxStudents: number | null;

  @Column({ name: 'max_branches', type: 'int', nullable: true })
  maxBranches: number | null;

  @Column({ name: 'max_teachers', type: 'int', nullable: true })
  maxTeachers: number | null;

  @Column({ name: 'price_monthly', type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceMonthly: number | null;

  @Column({ name: 'price_yearly', type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceYearly: number | null;

  @Column({ name: 'trial_days', type: 'int', default: 0 })
  trialDays: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
