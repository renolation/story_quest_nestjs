import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { StudentAchievement } from './entities/student-achievement.entity';
import { StudentPoint } from './entities/student-points.entity';
import { PointTransaction } from './entities/point-transaction.entity';
import { DailyGoal } from './entities/daily-goal.entity';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';

/**
 * PHASE 4 - GAMIFICATION MODULE
 *
 * Manages gamification features: achievements, points, streaks, daily goals.
 *
 * Features:
 * - Achievement system (badges, milestones)
 * - Points accumulation and tracking
 * - Point transaction history
 * - Streak tracking (consecutive days)
 * - Daily goals management
 * - Leaderboards
 *
 * Business Logic:
 * - Auto-unlock achievements when progress reaches threshold
 * - Calculate and update streaks daily
 * - Award bonus points for streaks
 * - Track daily goal completion
 * - Maintain audit trail of all point transactions
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Achievement,
      StudentAchievement,
      StudentPoint,
      PointTransaction,
      DailyGoal,
    ]),
  ],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
