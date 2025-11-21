import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import type { JwtPayload } from '../../common/interfaces';
import {
  UnlockAchievementDto,
  AwardPointsDto,
  StudentStatsResponseDto,
  LeaderboardQueryDto,
  LeaderboardEntryResponseDto,
} from './dto';
import { Achievement } from './entities/achievement.entity';
import { StudentAchievement } from './entities/student-achievement.entity';
import { PointTransaction } from './entities/point-transaction.entity';

/**
 * Gamification Controller
 *
 * Phase: 4
 * Status: ✅ IMPLEMENTED
 * Priority: HIGH
 *
 * Endpoints for managing gamification features:
 * - Achievement unlocking and tracking
 * - Points awarding and statistics
 * - Streak management
 * - Leaderboard rankings
 */
@ApiTags('Gamification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  // ========================================
  // ACHIEVEMENT ENDPOINTS
  // ========================================

  @Post('achievements/unlock')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Unlock an achievement',
    description:
      'Unlock a specific achievement for the authenticated student. Awards points if achievement has a reward.',
  })
  @ApiBody({ type: UnlockAchievementDto })
  @ApiResponse({
    status: 200,
    description: 'Achievement unlocked successfully',
    type: StudentAchievement,
  })
  @ApiResponse({
    status: 404,
    description: 'Achievement not found or inactive',
    schema: {
      example: {
        statusCode: 404,
        message:
          "Achievement with code 'first_level_complete' not found or inactive",
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Achievement already unlocked',
    schema: {
      example: {
        statusCode: 409,
        message: "Achievement 'First Victory' is already unlocked",
        error: 'Conflict',
      },
    },
  })
  async unlockAchievement(
    @Body() dto: UnlockAchievementDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<StudentAchievement> {
    // Use studentId from DTO (for testing) or from authenticated user
    const studentId = dto.studentId || user.sub;
    return this.gamificationService.unlockAchievement(
      studentId,
      dto.achievementCode,
    );
  }

  @Get('achievements/me')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get my achievements',
    description: 'Get all achievements unlocked by the authenticated student.',
  })
  @ApiResponse({
    status: 200,
    description: 'Student achievements retrieved successfully',
    type: [StudentAchievement],
  })
  async getMyAchievements(
    @CurrentUser() user: JwtPayload,
  ): Promise<StudentAchievement[]> {
    return this.gamificationService.getStudentAchievements(user.sub);
  }

  @Get('achievements')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get all available achievements',
    description: 'Get a list of all active achievements that can be unlocked.',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievements retrieved successfully',
    type: [Achievement],
  })
  async getAllAchievements(): Promise<Achievement[]> {
    return this.gamificationService.getAllAchievements();
  }

  @Get('achievements/progress')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get my achievement progress',
    description:
      'Get progress statistics showing how many achievements the student has unlocked.',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievement progress retrieved successfully',
    schema: {
      example: {
        unlocked: 12,
        total: 50,
        percentage: 24.0,
      },
    },
  })
  async getAchievementProgress(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ unlocked: number; total: number; percentage: number }> {
    return this.gamificationService.getAchievementProgress(user.sub);
  }

  // ========================================
  // POINTS ENDPOINTS
  // ========================================

  @Post('points/award')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.AGENCY)
  @ApiOperation({
    summary: 'Award points',
    description:
      'Award or deduct points for a student. Students can earn points automatically, teachers/agency can manually award.',
  })
  @ApiBody({ type: AwardPointsDto })
  @ApiResponse({
    status: 200,
    description: 'Points awarded successfully',
    type: PointTransaction,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request',
    schema: {
      example: {
        statusCode: 400,
        message: ['points must be an integer'],
        error: 'Bad Request',
      },
    },
  })
  async awardPoints(
    @Body() dto: AwardPointsDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PointTransaction> {
    // For students, use their own ID; for teachers/agency, use provided studentId
    if (user.role === UserRole.STUDENT) {
      dto.studentId = user.sub;
    }

    return this.gamificationService.awardPoints(dto);
  }

  @Get('stats/me')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get my statistics',
    description:
      'Get comprehensive statistics including points, streaks, achievements, and rank.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: StudentStatsResponseDto,
  })
  async getMyStats(
    @CurrentUser() user: JwtPayload,
  ): Promise<StudentStatsResponseDto> {
    return this.gamificationService.getStudentStats(user.sub);
  }

  @Post('streak/update')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Update my streak',
    description:
      'Update daily activity streak. Should be called when the student opens the app.',
  })
  @ApiResponse({
    status: 200,
    description: 'Streak updated successfully',
    schema: {
      example: {
        message: 'Streak updated successfully',
      },
    },
  })
  async updateStreak(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    await this.gamificationService.updateStreak(user.sub);
    return { message: 'Streak updated successfully' };
  }

  // ========================================
  // LEADERBOARD ENDPOINTS
  // ========================================

  @Get('leaderboard')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get leaderboard',
    description:
      'Get leaderboard rankings with optional period filtering (daily, weekly, monthly, all-time).',
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
    type: [LeaderboardEntryResponseDto],
  })
  async getLeaderboard(
    @Query() query: LeaderboardQueryDto,
  ): Promise<LeaderboardEntryResponseDto[]> {
    return this.gamificationService.getLeaderboard(query);
  }

  @Get('rank/me')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get my current rank',
    description: 'Get the current rank position of the authenticated student.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rank retrieved successfully',
    schema: {
      example: {
        rank: 42,
        message: 'You are ranked #42',
      },
    },
  })
  async getMyRank(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ rank: number; message: string }> {
    const rank = await this.gamificationService.getStudentRank(user.sub);

    return {
      rank,
      message: rank > 0 ? `You are ranked #${rank}` : 'Not ranked yet',
    };
  }
}
