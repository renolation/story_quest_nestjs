import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

/**
 * PHASE 4 - ACHIEVEMENTS
 *
 * Defines available achievements/badges that students can unlock.
 */
@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'achievement_type', type: 'varchar', length: 50 })
  achievementType: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl: string;

  @Column({ name: 'required_progress', type: 'int', nullable: true })
  requiredProgress: number;

  @Column({ name: 'reward_points', type: 'int', default: 0 })
  rewardPoints: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
