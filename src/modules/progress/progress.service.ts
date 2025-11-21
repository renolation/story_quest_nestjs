import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { StudentChapterProgress } from './entities/student-chapter-progress.entity';
import { StudentUnitProgress } from './entities/student-unit-progress.entity';
import { StudentLevelAttempt } from './entities/student-level-attempt.entity';
import { StudentQuestionAnswer } from './entities/student-question-answer.entity';
import { Level } from '../levels/entities/level.entity';
import { Question } from '../questions/entities/question.entity';
import { AnswerOption } from '../questions/entities/answer-option.entity';
import { User } from '../users/entities/user.entity';
import { ChapterProgressDto } from './dto/chapter-progress.dto';
import { UnitProgressDto } from './dto/unit-progress.dto';
import { LevelProgressDto } from './dto/level-progress.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { CompleteLevelDto } from './dto/complete-level.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(StudentChapterProgress)
    private readonly chapterProgressRepository: Repository<StudentChapterProgress>,
    @InjectRepository(StudentUnitProgress)
    private readonly unitProgressRepository: Repository<StudentUnitProgress>,
    @InjectRepository(StudentLevelAttempt)
    private readonly levelAttemptRepository: Repository<StudentLevelAttempt>,
    @InjectRepository(StudentQuestionAnswer)
    private readonly questionAnswerRepository: Repository<StudentQuestionAnswer>,
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(AnswerOption)
    private readonly answerOptionRepository: Repository<AnswerOption>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get chapter progress for a specific student
   */
  async getChapterProgress(
    studentId: number,
    chapterId: number,
  ): Promise<StudentChapterProgress | null> {
    return await this.chapterProgressRepository.findOne({
      where: {
        student: { id: studentId },
        chapter: { id: chapterId },
      },
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
        student: { id: studentId },
        chapter: { id: In(chapterIds) },
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
      where: {
        student: { id: studentId },
        unit: { id: unitId },
      },
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
        student: { id: studentId },
        unit: { id: In(unitIds) },
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
      where: {
        student: { id: studentId },
        level: { id: levelId },
      },
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
      where: {
        student: { id: studentId },
        level: { id: levelId },
      },
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
        student: { id: studentId },
        level: { id: In(levelIds) },
      },
      order: { score: 'DESC', startedAt: 'DESC' },
      relations: ['level'],
    });

    // Group by levelId and keep only the best attempt for each level
    const progressMap = new Map<number, StudentLevelAttempt>();

    for (const attempt of attempts) {
      const levelId = attempt.level.id;
      if (!progressMap.has(levelId)) {
        progressMap.set(levelId, attempt);
      } else {
        // Compare scores to ensure we have the best one
        const existing = progressMap.get(levelId);
        if (existing && attempt.score > existing.score) {
          progressMap.set(levelId, attempt);
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
    const bestAttempt = attempts.reduce(
      (best, current) => (current.score > best.score ? current : best),
      attempts[0],
    );

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
    const levelIds = levels.map((l) => l.id);
    const progressMap = await this.getLevelsProgress(studentId, levelIds);

    // Get all attempts to count them and find last attempt date
    const allAttempts = await this.levelAttemptRepository.find({
      where: {
        student: { id: studentId },
        level: { id: In(levelIds) },
      },
      order: { startedAt: 'DESC' },
      relations: ['level'],
    });

    // Group attempts by levelId
    const attemptsByLevel = new Map<number, StudentLevelAttempt[]>();
    for (const attempt of allAttempts) {
      const levelId = attempt.level.id;
      if (!attemptsByLevel.has(levelId)) {
        attemptsByLevel.set(levelId, []);
      }
      const levelAttempts = attemptsByLevel.get(levelId);
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

  /**
   * Start a new level attempt for a student
   */
  async startLevel(studentId: number, levelId: number) {
    // Verify level exists
    const level = await this.levelRepository.findOne({
      where: { id: levelId },
    });

    if (!level) {
      throw new NotFoundException(`Level with ID ${levelId} not found`);
    }

    // Verify student exists
    const student = await this.userRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Create new attempt
    const attempt = this.levelAttemptRepository.create({
      student,
      level,
      score: 0,
      pointsEarned: 0,
      timeSpentSeconds: 0,
      isCompleted: false,
      isPassed: false,
      startedAt: new Date(),
    });

    return await this.levelAttemptRepository.save(attempt);
  }

  /**
   * Submit an answer to a question
   */
  async submitAnswer(
    studentId: number,
    questionId: number,
    submitAnswerDto: SubmitAnswerDto,
  ) {
    // Verify question exists
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // Verify attempt exists and belongs to student
    const attempt = await this.levelAttemptRepository.findOne({
      where: { id: submitAnswerDto.attemptId },
      relations: ['student'],
    });

    if (!attempt) {
      throw new NotFoundException(
        `Level attempt with ID ${submitAnswerDto.attemptId} not found`,
      );
    }

    if (attempt.student.id !== studentId) {
      throw new NotFoundException(
        'Level attempt does not belong to this student',
      );
    }

    // Verify student exists
    const student = await this.userRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Get selected option if provided
    let selectedOption: AnswerOption | undefined = undefined;
    if (submitAnswerDto.selectedOptionId) {
      const option = await this.answerOptionRepository.findOne({
        where: { id: submitAnswerDto.selectedOptionId },
      });
      if (option) {
        selectedOption = option;
      }
    }

    // Create answer record
    const answer = this.questionAnswerRepository.create({
      attempt,
      question,
      student,
      selectedOption,
      answerText: submitAnswerDto.answerText,
      answerAudioUrl: submitAnswerDto.answerAudioUrl,
      isCorrect: submitAnswerDto.isCorrect,
      pointsEarned: submitAnswerDto.pointsEarned,
      timeSpentSeconds: submitAnswerDto.timeSpentSeconds || 0,
      answeredAt: new Date(),
    });

    return await this.questionAnswerRepository.save(answer);
  }

  /**
   * Complete a level attempt
   */
  async completeLevel(
    studentId: number,
    levelId: number,
    completeLevelDto: CompleteLevelDto,
  ) {
    // Verify attempt exists and belongs to student
    const attempt = await this.levelAttemptRepository.findOne({
      where: { id: completeLevelDto.attemptId },
      relations: ['student', 'level'],
    });

    if (!attempt) {
      throw new NotFoundException(
        `Level attempt with ID ${completeLevelDto.attemptId} not found`,
      );
    }

    if (attempt.student.id !== studentId) {
      throw new NotFoundException(
        'Level attempt does not belong to this student',
      );
    }

    if (attempt.level.id !== levelId) {
      throw new NotFoundException(
        'Level attempt does not belong to this level',
      );
    }

    // Update attempt with completion data
    attempt.score = completeLevelDto.score;
    attempt.pointsEarned = completeLevelDto.pointsEarned;
    attempt.isPassed = completeLevelDto.isPassed;
    attempt.isCompleted = true;
    attempt.timeSpentSeconds = completeLevelDto.timeSpentSeconds;
    attempt.completedAt = new Date();

    return await this.levelAttemptRepository.save(attempt);
  }

  /**
   * Get overall progress summary for a student
   */
  async getStudentProgress(studentId: number) {
    // Verify student exists
    const student = await this.userRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Get all chapter progress
    const chapterProgress = await this.chapterProgressRepository.find({
      where: { student: { id: studentId } },
    });

    // Get all unit progress
    const unitProgress = await this.unitProgressRepository.find({
      where: { student: { id: studentId } },
    });

    // Get all level attempts
    const levelAttempts = await this.levelAttemptRepository.find({
      where: { student: { id: studentId } },
      order: { startedAt: 'DESC' },
    });

    // Calculate summary statistics
    const totalChapters = chapterProgress.length;
    const completedChapters = chapterProgress.filter(
      (cp) => cp.completedUnits === cp.totalUnits,
    ).length;

    const totalUnits = unitProgress.length;
    const completedUnits = unitProgress.filter(
      (up) => up.completedLevels === up.totalLevels,
    ).length;

    const totalAttempts = levelAttempts.length;
    const completedAttempts = levelAttempts.filter(
      (attempt) => attempt.isCompleted,
    ).length;
    const passedAttempts = levelAttempts.filter(
      (attempt) => attempt.isPassed,
    ).length;

    const averageScore =
      levelAttempts.length > 0
        ? levelAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
          levelAttempts.length
        : 0;

    const totalPointsEarned = levelAttempts.reduce(
      (sum, attempt) => sum + attempt.pointsEarned,
      0,
    );

    return {
      studentId,
      totalChapters,
      completedChapters,
      totalUnits,
      completedUnits,
      totalLevelAttempts: totalAttempts,
      completedLevelAttempts: completedAttempts,
      passedLevelAttempts: passedAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      totalPointsEarned,
      chapterProgress: chapterProgress.map((cp) =>
        this.mapChapterProgressToDto(cp),
      ),
      unitProgress: unitProgress.map((up) => this.mapUnitProgressToDto(up)),
    };
  }
}
