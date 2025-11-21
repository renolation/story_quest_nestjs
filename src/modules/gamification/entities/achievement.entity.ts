import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * PHASE 4 - GAMIFICATION: ACHIEVEMENTS
 *
 * Defines available achievements/badges that students can unlock.
 * Achievements motivate students with rewards and recognition.
 */
@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string; // e.g., 'first_level_complete', 'perfect_score', 'streak_7_days'

  @Column({ type: 'varchar', length: 255 })
  title: string; // e.g., 'First Victory'

  @Column({ type: 'text' })
  description: string; // e.g., 'Complete your first level'

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl: string; // Icon/badge image URL

  @Column({ name: 'points_reward', type: 'int', default: 0 })
  pointsReward: number; // Points earned when unlocking

  @Column({
    type: 'enum',
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze',
  })
  tier: string; // Achievement tier/rarity

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean; // Can be disabled by admins

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
