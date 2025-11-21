import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { StudentAchievement } from './entities/student-achievement.entity';
import { StudentPoint } from './entities/student-points.entity';
import { PointTransaction } from './entities/point-transaction.entity';
import { DailyGoal } from './entities/daily-goal.entity';
import {
  AwardPointsDto,
  StudentStatsResponseDto,
  LeaderboardQueryDto,
  LeaderboardEntryResponseDto,
  LeaderboardPeriod,
} from './dto';

/**
 * Gamification Service
 *
 * Phase: 4
 * Status: ✅ IMPLEMENTED
 * Priority: HIGH
 *
 * Business logic:
 * - Achievement system (unlock achievements based on progress)
 * - Points accumulation and tracking
 * - Point transaction history and audit trail
 * - Streak tracking (consecutive days)
 * - Leaderboard calculation
 * - Bonus points for streaks and achievements
 * - Auto-unlock achievements when thresholds are reached
 */
@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(StudentAchievement)
    private studentAchievementRepository: Repository<StudentAchievement>,
    @InjectRepository(StudentPoint)
    private studentPointRepository: Repository<StudentPoint>,
    @InjectRepository(PointTransaction)
    private pointTransactionRepository: Repository<PointTransaction>,
    @InjectRepository(DailyGoal)
    private dailyGoalRepository: Repository<DailyGoal>,
  ) {}

  // ========================================
  // ACHIEVEMENT METHODS
  // ========================================

  /**
   * Unlock an achievement for a student
   * @param studentId - Student ID
   * @param achievementCode - Unique achievement code
   * @returns Unlocked student achievement
   * @throws NotFoundException if achievement not found or inactive
   * @throws ConflictException if achievement already unlocked
   */
  async unlockAchievement(
    studentId: number,
    achievementCode: string,
  ): Promise<StudentAchievement> {
    this.logger.log(
      `Unlocking achievement ${achievementCode} for student ${studentId}`,
    );

    // Find the achievement by code
    const achievement = await this.achievementRepository.findOne({
      where: { code: achievementCode, isActive: true },
    });

    if (!achievement) {
      this.logger.warn(`Achievement not found or inactive: ${achievementCode}`);
      throw new NotFoundException(
        `Achievement with code '${achievementCode}' not found or inactive`,
      );
    }

    // Check if already unlocked
    const existingAchievement = await this.studentAchievementRepository.findOne(
      {
        where: {
          studentId,
          achievementId: achievement.id,
        },
      },
    );

    if (existingAchievement) {
      this.logger.warn(
        `Achievement ${achievementCode} already unlocked for student ${studentId}`,
      );
      throw new ConflictException(
        `Achievement '${achievement.title}' is already unlocked`,
      );
    }

    // Create student achievement record
    const studentAchievement = this.studentAchievementRepository.create({
      studentId,
      achievementId: achievement.id,
      unlockedAt: new Date(),
    });

    const saved =
      await this.studentAchievementRepository.save(studentAchievement);

    // Award points for the achievement
    if (achievement.pointsReward > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      await this.awardPoints({
        studentId,
        points: achievement.pointsReward,
        reason: 'achievement_unlock' as any,
        referenceId: achievement.id,
        notes: `Unlocked achievement: ${achievement.title}`,
      });
    }

    this.logger.log(
      `Achievement ${achievementCode} unlocked for student ${studentId}`,
    );

    // Load the achievement relation before returning
    const result = await this.studentAchievementRepository.findOne({
      where: { id: saved.id },
      relations: ['achievement'],
    });

    if (!result) {
      throw new NotFoundException('Failed to retrieve unlocked achievement');
    }

    return result;
  }

  /**
   * Get all achievements unlocked by a student
   * @param studentId - Student ID
   * @returns List of student achievements with details
   */
  async getStudentAchievements(
    studentId: number,
  ): Promise<StudentAchievement[]> {
    this.logger.log(`Fetching achievements for student ${studentId}`);

    const achievements = await this.studentAchievementRepository.find({
      where: { studentId },
      relations: ['achievement'],
      order: { unlockedAt: 'DESC' },
    });

    return achievements;
  }

  /**
   * Get all available achievements
   * @returns List of all active achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    this.logger.log('Fetching all available achievements');

    const achievements = await this.achievementRepository.find({
      where: { isActive: true },
      order: { tier: 'ASC', pointsReward: 'DESC' },
    });

    return achievements;
  }

  /**
   * Get achievement progress for a student
   * @param studentId - Student ID
   * @returns Progress statistics
   */
  async getAchievementProgress(
    studentId: number,
  ): Promise<{ unlocked: number; total: number; percentage: number }> {
    this.logger.log(
      `Calculating achievement progress for student ${studentId}`,
    );

    const [unlockedCount, totalCount] = await Promise.all([
      this.studentAchievementRepository.count({ where: { studentId } }),
      this.achievementRepository.count({ where: { isActive: true } }),
    ]);

    const percentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    return {
      unlocked: unlockedCount,
      total: totalCount,
      percentage: Math.round(percentage * 100) / 100, // Round to 2 decimals
    };
  }

  // ========================================
  // POINTS METHODS
  // ========================================

  /**
   * Award points to a student
   * @param dto - Award points data
   * @returns Point transaction record
   */
  async awardPoints(dto: AwardPointsDto): Promise<PointTransaction> {
    this.logger.log(
      `Awarding ${dto.points} points to student ${dto.studentId} for ${dto.reason}`,
    );

    // Create point transaction
    const transaction = this.pointTransactionRepository.create({
      studentId: dto.studentId,
      points: dto.points,
      reason: dto.reason,
      referenceId: dto.referenceId,
      notes: dto.notes,
    });

    const savedTransaction =
      await this.pointTransactionRepository.save(transaction);

    // Get or create student points record
    let studentPoints = await this.studentPointRepository.findOne({
      where: { studentId: dto.studentId },
    });

    if (!studentPoints) {
      studentPoints = this.studentPointRepository.create({
        studentId: dto.studentId,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
    }

    // Update total points
    studentPoints.totalPoints += dto.points;

    // Update streak if reason is daily_login
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (dto.reason === 'daily_login') {
      this.updateStreakInternal(studentPoints);
    }

    await this.studentPointRepository.save(studentPoints);

    this.logger.log(
      `Points awarded successfully. New total: ${studentPoints.totalPoints}`,
    );

    return savedTransaction;
  }

  /**
   * Get student statistics (points, streaks, achievements)
   * @param studentId - Student ID
   * @returns Student stats
   */
  async getStudentStats(studentId: number): Promise<StudentStatsResponseDto> {
    this.logger.log(`Fetching stats for student ${studentId}`);

    // Get student points (or create if not exists)
    let studentPoints = await this.studentPointRepository.findOne({
      where: { studentId },
    });

    if (!studentPoints) {
      studentPoints = this.studentPointRepository.create({
        studentId,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
      await this.studentPointRepository.save(studentPoints);
    }

    // Get achievements count
    const achievementsCount = await this.studentAchievementRepository.count({
      where: { studentId },
    });

    // Get rank (optional - can be expensive for large datasets)
    const rank = await this.getStudentRank(studentId);

    return {
      totalPoints: studentPoints.totalPoints,
      currentStreak: studentPoints.currentStreak,
      longestStreak: studentPoints.longestStreak,
      achievementsCount,
      rank,
    };
  }

  /**
   * Update streak for a student based on activity
   * @param studentId - Student ID
   */
  async updateStreak(studentId: number): Promise<void> {
    this.logger.log(`Updating streak for student ${studentId}`);

    // Get or create student points record
    let studentPoints = await this.studentPointRepository.findOne({
      where: { studentId },
    });

    if (!studentPoints) {
      studentPoints = this.studentPointRepository.create({
        studentId,
        totalPoints: 0,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: new Date(),
      });
    } else {
      this.updateStreakInternal(studentPoints);
    }

    await this.studentPointRepository.save(studentPoints);

    this.logger.log(
      `Streak updated. Current: ${studentPoints.currentStreak}, Longest: ${studentPoints.longestStreak}`,
    );
  }

  /**
   * Internal method to update streak logic
   * @param studentPoints - Student points entity
   */
  private updateStreakInternal(studentPoints: StudentPoint): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day

    if (!studentPoints.lastActivityDate) {
      // First activity
      studentPoints.currentStreak = 1;
      studentPoints.longestStreak = 1;
      studentPoints.lastActivityDate = today;
      return;
    }

    const lastActivity = new Date(studentPoints.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === 0) {
      // Same day, no change
      return;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      studentPoints.currentStreak += 1;
      studentPoints.lastActivityDate = today;

      // Update longest streak if current is higher
      if (studentPoints.currentStreak > studentPoints.longestStreak) {
        studentPoints.longestStreak = studentPoints.currentStreak;
      }
    } else {
      // Gap in days, reset streak
      studentPoints.currentStreak = 1;
      studentPoints.lastActivityDate = today;
    }
  }

  // ========================================
  // LEADERBOARD METHODS
  // ========================================

  /**
   * Get leaderboard with optional filtering
   * @param query - Leaderboard query parameters
   * @returns Leaderboard entries
   */
  async getLeaderboard(
    query: LeaderboardQueryDto,
  ): Promise<LeaderboardEntryResponseDto[]> {
    this.logger.log(
      `Fetching leaderboard for period: ${query.period}, limit: ${query.limit}, offset: ${query.offset}`,
    );

    const { period, limit, offset } = query;

    // Build query based on period
    const queryBuilder = this.studentPointRepository
      .createQueryBuilder('sp')
      .leftJoin('sp.student', 'user')
      .leftJoin('student_achievements', 'sa', 'sa.student_id = sp.student_id')
      .select([
        'sp.student_id AS "studentId"',
        'user.username AS "studentName"',
        'sp.total_points AS "totalPoints"',
        'COUNT(DISTINCT sa.id) AS "achievementsCount"',
      ])
      .groupBy('sp.student_id, sp.total_points, user.username')
      .orderBy('sp.total_points', 'DESC')
      .limit(limit)
      .offset(offset);

    // Apply period filter if needed (for point transactions)
    if (period && period !== LeaderboardPeriod.ALL_TIME) {
      const dateFilter = this.getDateFilterForPeriod(period);

      // For time-based leaderboards, we need to sum points from transactions
      // instead of using total_points. This is more accurate for specific periods.
      const transactionQuery = this.pointTransactionRepository
        .createQueryBuilder('pt')
        .leftJoin('pt.student', 'user')
        .leftJoin('student_achievements', 'sa', 'sa.student_id = pt.student_id')
        .select([
          'pt.student_id AS "studentId"',
          'user.username AS "studentName"',
          'SUM(pt.points) AS "totalPoints"',
          'COUNT(DISTINCT sa.id) AS "achievementsCount"',
        ])
        .where('pt.created_at >= :startDate', { startDate: dateFilter })
        .groupBy('pt.student_id, user.username')
        .orderBy('SUM(pt.points)', 'DESC')
        .limit(limit)
        .offset(offset);

      const results = await transactionQuery.getRawMany();

      return results.map((entry, index) => ({
        rank: (offset || 0) + index + 1,
        studentId: entry.studentId,
        studentName: entry.studentName,
        totalPoints: parseInt(entry.totalPoints) || 0,
        achievementsCount: parseInt(entry.achievementsCount) || 0,
      }));
    }

    // For all-time leaderboard, use student_points table
    const results = await queryBuilder.getRawMany();

    return results.map((entry, index) => ({
      rank: (offset || 0) + index + 1,
      studentId: entry.studentId,
      studentName: entry.studentName,
      totalPoints: entry.totalPoints,
      achievementsCount: parseInt(entry.achievementsCount) || 0,
    }));
  }

  /**
   * Get a student's current rank
   * @param studentId - Student ID
   * @returns Rank position (1-based)
   */
  async getStudentRank(studentId: number): Promise<number> {
    this.logger.log(`Calculating rank for student ${studentId}`);

    const studentPoints = await this.studentPointRepository.findOne({
      where: { studentId },
    });

    if (!studentPoints) {
      return 0; // Student has no points yet
    }

    // Count how many students have more points
    const higherRankedCount = await this.studentPointRepository.count({
      where: {
        totalPoints: MoreThan(studentPoints.totalPoints),
      },
    });

    // Rank is 1-based (1 = first place)
    return higherRankedCount + 1;
  }

  /**
   * Helper method to get date filter for leaderboard period
   * @param period - Leaderboard period
   * @returns Start date for filtering
   */
  private getDateFilterForPeriod(period: LeaderboardPeriod): Date {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case LeaderboardPeriod.DAILY:
        startDate.setHours(0, 0, 0, 0);
        break;
      case LeaderboardPeriod.WEEKLY:
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case LeaderboardPeriod.MONTHLY:
        startDate.setMonth(now.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        // ALL_TIME - return very old date
        startDate.setFullYear(2000, 0, 1);
    }

    return startDate;
  }
}
