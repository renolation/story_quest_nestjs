import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Agency } from '../../agencies/entities/agency.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Chapter } from '../../chapters/entities/chapter.entity';

export enum CenterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * PHASE 7 - CENTERS (ORGANIZATIONS)
 *
 * Represents English learning centers/organizations that manage branches and teachers.
 */
@Entity('centers')
export class Center {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'agency_id', type: 'int', nullable: true })
  agencyId: number | null;

  @ManyToOne(() => Agency, (agency) => agency.centers, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'agency_id' })
  agency: Agency | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({
    name: 'business_license',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  businessLicense: string | null;

  @Column({
    type: 'enum',
    enum: CenterStatus,
    default: CenterStatus.ACTIVE,
  })
  status: CenterStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Branch, (branch) => branch.center)
  branches: Branch[];

  @OneToMany(() => Chapter, (chapter) => chapter.center)
  chapters: Chapter[];
}
