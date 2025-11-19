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
 * PHASE 7 - CENTERS (ORGANIZATIONS)
 *
 * Represents English learning centers/organizations that manage branches and teachers.
 */
@Entity('centers')
export class Center {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'agency_id', nullable: true })
  agencyId: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'agency_id' })
  agency: User;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  @Column({ name: 'business_license', type: 'varchar', length: 255, nullable: true })
  businessLicense: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string; // active, inactive, suspended

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
