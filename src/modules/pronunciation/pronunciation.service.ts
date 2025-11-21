import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PronunciationAttempt } from './entities/pronunciation-attempt.entity';
import { CreatePronunciationAttemptDto } from './dto/create-pronunciation-attempt.dto';
import { UpdatePronunciationAttemptDto } from './dto/update-pronunciation-attempt.dto';
import { PronunciationHistoryQueryDto } from './dto/pronunciation-history-query.dto';

/**
 * Pronunciation Service
 *
 * Architecture Note:
 * - Speech recognition is CLIENT-SIDE (mobile app uses native speech APIs)
 * - Backend only stores attempts with client-calculated scores
 * - Students can only access their own pronunciation attempts
 */
@Injectable()
export class PronunciationService {
  constructor(
    @InjectRepository(PronunciationAttempt)
    private readonly pronunciationAttemptRepository: Repository<PronunciationAttempt>,
  ) {}

  /**
   * Create new pronunciation attempt
   * @param studentId - Student ID from JWT token
   * @param dto - Pronunciation attempt data with client-calculated scores
   * @returns Created pronunciation attempt
   */
  async create(
    studentId: number,
    dto: CreatePronunciationAttemptDto,
  ): Promise<PronunciationAttempt> {
    const attempt = this.pronunciationAttemptRepository.create({
      studentId,
      questionId: dto.questionId,
      referenceText: dto.referenceText,
      recognizedText: dto.recognizedText,
      pronunciationScore: dto.pronunciationScore,
      accuracyScore: dto.accuracyScore,
      fluencyScore: dto.fluencyScore,
      completenessScore: dto.completenessScore,
    });

    return await this.pronunciationAttemptRepository.save(attempt);
  }

  /**
   * Find all pronunciation attempts by student with filters and pagination
   * @param studentId - Student ID from JWT token
   * @param query - Query parameters (levelId, questionId, pagination)
   * @returns List of pronunciation attempts
   */
  async findAllByStudent(
    studentId: number,
    query: PronunciationHistoryQueryDto,
  ): Promise<PronunciationAttempt[]> {
    const { levelId, questionId, limit = 50, offset = 0 } = query;

    const queryBuilder = this.pronunciationAttemptRepository
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.question', 'question')
      .leftJoinAndSelect('question.level', 'level')
      .where('attempt.studentId = :studentId', { studentId })
      .orderBy('attempt.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    // Filter by levelId if provided
    if (levelId) {
      queryBuilder.andWhere('level.id = :levelId', { levelId });
    }

    // Filter by questionId if provided
    if (questionId) {
      queryBuilder.andWhere('attempt.questionId = :questionId', { questionId });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Find specific pronunciation attempt by ID
   * @param id - Attempt ID
   * @param studentId - Student ID from JWT token (for authorization)
   * @returns Pronunciation attempt
   * @throws NotFoundException if attempt not found
   * @throws ForbiddenException if attempt doesn't belong to student
   */
  async findOne(id: number, studentId: number): Promise<PronunciationAttempt> {
    const attempt = await this.pronunciationAttemptRepository.findOne({
      where: { id },
      relations: ['question', 'question.level'],
    });

    if (!attempt) {
      throw new NotFoundException(
        `Pronunciation attempt with ID ${id} not found`,
      );
    }

    // Ensure student owns this attempt
    if (attempt.studentId !== studentId) {
      throw new ForbiddenException(
        'You do not have permission to access this pronunciation attempt',
      );
    }

    return attempt;
  }

  /**
   * Update pronunciation attempt (e.g., add scores after client calculation)
   * @param id - Attempt ID
   * @param studentId - Student ID from JWT token (for authorization)
   * @param dto - Update data
   * @returns Updated pronunciation attempt
   * @throws NotFoundException if attempt not found
   * @throws ForbiddenException if attempt doesn't belong to student
   */
  async update(
    id: number,
    studentId: number,
    dto: UpdatePronunciationAttemptDto,
  ): Promise<PronunciationAttempt> {
    const attempt = await this.findOne(id, studentId);

    // Update fields
    if (dto.recognizedText !== undefined) {
      attempt.recognizedText = dto.recognizedText;
    }
    if (dto.pronunciationScore !== undefined) {
      attempt.pronunciationScore = dto.pronunciationScore;
    }
    if (dto.accuracyScore !== undefined) {
      attempt.accuracyScore = dto.accuracyScore;
    }
    if (dto.fluencyScore !== undefined) {
      attempt.fluencyScore = dto.fluencyScore;
    }
    if (dto.completenessScore !== undefined) {
      attempt.completenessScore = dto.completenessScore;
    }

    return await this.pronunciationAttemptRepository.save(attempt);
  }

  /**
   * Get best pronunciation score for a specific question
   * @param studentId - Student ID from JWT token
   * @param questionId - Question ID
   * @returns Best pronunciation score (0-100) or null if no attempts
   */
  async getBestScore(
    studentId: number,
    questionId: number,
  ): Promise<number | null> {
    const result = await this.pronunciationAttemptRepository
      .createQueryBuilder('attempt')
      .select('MAX(attempt.pronunciationScore)', 'bestScore')
      .where('attempt.studentId = :studentId', { studentId })
      .andWhere('attempt.questionId = :questionId', { questionId })
      .andWhere('attempt.pronunciationScore IS NOT NULL')
      .getRawOne();

    return result?.bestScore ? parseFloat(result.bestScore) : null;
  }

  /**
   * Get total attempt count for student
   * @param studentId - Student ID from JWT token
   * @returns Total number of attempts
   */
  async getAttemptCount(studentId: number): Promise<number> {
    return await this.pronunciationAttemptRepository.count({
      where: { studentId },
    });
  }
}
