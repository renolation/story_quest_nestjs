import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { StudentAchievement } from './entities/student-achievement.entity';
import { StudentPoints } from './entities/student-points.entity';
import { DailyGoal } from './entities/daily-goal.entity';

/**
 * PHASE 4 - GAMIFICATION MODULE - TODO
 *
 * Manages gamification features: achievements, points, streaks, daily goals.
 *
 * Features to implement:
 * - Achievement system (badges, milestones)
 * - Points accumulation and tracking
 * - Streak tracking (consecutive days)
 * - Daily goals management
 * - Leaderboards
 * - Level-up system
 *
 * Business Logic:
 * - Auto-unlock achievements when progress reaches threshold
 * - Calculate and update streaks daily
 * - Award bonus points for streaks
 * - Track daily goal completion
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Achievement,
      StudentAchievement,
      StudentPoints,
      DailyGoal,
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class GamificationModule {}
