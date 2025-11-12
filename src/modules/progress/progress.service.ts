import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { StudentChapterProgress } from './entities/student-chapter-progress.entity';
import { StudentUnitProgress } from './entities/student-unit-progress.entity';
import { StudentLevelAttempt } from './entities/student-level-attempt.entity';
import { ChapterProgressDto } from './dto/chapter-progress.dto';
import { UnitProgressDto } from './dto/unit-progress.dto';
import { LevelProgressDto } from './dto/level-progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(StudentChapterProgress)
    private readonly chapterProgressRepository: Repository<StudentChapterProgress>,
    @InjectRepository(StudentUnitProgress)
    private readonly unitProgressRepository: Repository<StudentUnitProgress>,
    @InjectRepository(StudentLevelAttempt)
    private readonly levelAttemptRepository: Repository<StudentLevelAttempt>,
  ) {}

  /**
   * Get chapter progress for a specific student
   */
  async getChapterProgress(
    studentId: number,
    chapterId: number,
  ): Promise<StudentChapterProgress | null> {
    return await this.chapterProgressRepository.findOne({
      where: { studentId, chapterId },
    });
  }

  /**
   * Get multiple chapter progresses for a student
   */
  async getChaptersProgress(
    studentId: number,
    chapterIds: number[],
  ): Promise<StudentChapterProgress[]> {
    if (chapterIds.length === 0) {
      return [];
    }

    return await this.chapterProgressRepository.find({
      where: {
        studentId,
        chapterId: In(chapterIds),
      },
    });
  }

  /**
   * Get unit progress for a specific student
   */
  async getUnitProgress(
    studentId: number,
    unitId: number,
  ): Promise<StudentUnitProgress | null> {
    return await this.unitProgressRepository.findOne({
      where: { studentId, unitId },
    });
  }

  /**
   * Get multiple unit progresses for a student
   */
  async getUnitsProgress(
    studentId: number,
    unitIds: number[],
  ): Promise<StudentUnitProgress[]> {
    if (unitIds.length === 0) {
      return [];
    }

    return await this.unitProgressRepository.find({
      where: {
        studentId,
        unitId: In(unitIds),
      },
    });
  }

  /**
   * Get all level attempts for a specific student and level
   */
  async getLevelAttempts(
    studentId: number,
    levelId: number,
  ): Promise<StudentLevelAttempt[]> {
    return await this.levelAttemptRepository.find({
      where: { studentId, levelId },
      order: { startedAt: 'DESC' },
    });
  }

  /**
   * Get best level attempt (highest score) for a specific student and level
   */
  async getBestLevelAttempt(
    studentId: number,
    levelId: number,
  ): Promise<StudentLevelAttempt | null> {
    const attempts = await this.levelAttemptRepository.find({
      where: { studentId, levelId },
      order: { score: 'DESC', startedAt: 'DESC' },
      take: 1,
    });

    return attempts.length > 0 ? attempts[0] : null;
  }

  /**
   * Get multiple level progresses (best attempts) for a student
   * Returns a Map with levelId as key and best attempt as value
   */
  async getLevelsProgress(
    studentId: number,
    levelIds: number[],
  ): Promise<Map<number, StudentLevelAttempt>> {
    if (levelIds.length === 0) {
      return new Map();
    }

    // Get all attempts for the specified levels
    const attempts = await this.levelAttemptRepository.find({
      where: {
        studentId,
        levelId: In(levelIds),
      },
      order: { score: 'DESC', startedAt: 'DESC' },
    });

    // Group by levelId and keep only the best attempt for each level
    const progressMap = new Map<number, StudentLevelAttempt>();

    for (const attempt of attempts) {
      if (!progressMap.has(attempt.levelId)) {
        progressMap.set(attempt.levelId, attempt);
      } else {
        // Compare scores to ensure we have the best one
        const existing = progressMap.get(attempt.levelId);
        if (existing && attempt.score > existing.score) {
          progressMap.set(attempt.levelId, attempt);
        }
      }
    }

    return progressMap;
  }

  /**
   * Map StudentChapterProgress entity to DTO
   */
  mapChapterProgressToDto(
    progress: StudentChapterProgress | null,
  ): ChapterProgressDto | null {
    if (!progress) {
      return null;
    }

    return {
      totalUnits: progress.totalUnits,
      completedUnits: progress.completedUnits,
      totalPointsAvailable: progress.totalPointsAvailable,
      totalPointsEarned: progress.totalPointsEarned,
      averageScore: Number(progress.averageScore),
      lastAccessedAt: progress.lastAccessedAt,
    };
  }

  /**
   * Map StudentUnitProgress entity to DTO
   */
  mapUnitProgressToDto(
    progress: StudentUnitProgress | null,
  ): UnitProgressDto | null {
    if (!progress) {
      return null;
    }

    return {
      totalLevels: progress.totalLevels,
      completedLevels: progress.completedLevels,
      totalPointsAvailable: progress.totalPointsAvailable,
      totalPointsEarned: progress.totalPointsEarned,
      averageScore: Number(progress.averageScore),
      lastAccessedAt: progress.lastAccessedAt,
    };
  }

  /**
   * Map StudentLevelAttempt to progress DTO
   */
  async mapLevelProgressToDto(
    studentId: number,
    levelId: number,
    passingScore: number,
  ): Promise<LevelProgressDto | null> {
    // Get all attempts to count them
    const attempts = await this.getLevelAttempts(studentId, levelId);

    if (attempts.length === 0) {
      return null;
    }

    // Get best attempt
    const bestAttempt = attempts.reduce((best, current) =>
      current.score > best.score ? current : best
    , attempts[0]);

    return {
      attemptCount: attempts.length,
      bestScore: bestAttempt.score,
      bestPointsEarned: bestAttempt.pointsEarned,
      isPassed: bestAttempt.score >= passingScore,
      isCompleted: bestAttempt.isCompleted,
      lastAttemptAt: attempts[0].startedAt, // First in DESC order
    };
  }

  /**
   * Efficiently map multiple level attempts to progress DTOs
   */
  async mapLevelsProgressToDto(
    studentId: number,
    levels: Array<{ id: number; passingScore: number }>,
  ): Promise<Map<number, LevelProgressDto>> {
    const levelIds = levels.map(l => l.id);
    const progressMap = await this.getLevelsProgress(studentId, levelIds);

    // Get all attempts to count them and find last attempt date
    const allAttempts = await this.levelAttemptRepository.find({
      where: {
        studentId,
        levelId: In(levelIds),
      },
      order: { startedAt: 'DESC' },
    });

    // Group attempts by levelId
    const attemptsByLevel = new Map<number, StudentLevelAttempt[]>();
    for (const attempt of allAttempts) {
      if (!attemptsByLevel.has(attempt.levelId)) {
        attemptsByLevel.set(attempt.levelId, []);
      }
      const levelAttempts = attemptsByLevel.get(attempt.levelId);
      if (levelAttempts) {
        levelAttempts.push(attempt);
      }
    }

    // Create progress DTOs
    const result = new Map<number, LevelProgressDto>();

    for (const level of levels) {
      const bestAttempt = progressMap.get(level.id);
      const levelAttempts = attemptsByLevel.get(level.id) || [];

      if (bestAttempt && levelAttempts.length > 0) {
        result.set(level.id, {
          attemptCount: levelAttempts.length,
          bestScore: bestAttempt.score,
          bestPointsEarned: bestAttempt.pointsEarned,
          isPassed: bestAttempt.score >= level.passingScore,
          isCompleted: bestAttempt.isCompleted,
          lastAttemptAt: levelAttempts[0].startedAt, // First in DESC order
        });
      }
    }

    return result;
  }
}
