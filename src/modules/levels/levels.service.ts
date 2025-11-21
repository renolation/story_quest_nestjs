import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level } from './entities/level.entity';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { LevelResponseDto } from './dto/level-response.dto';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class LevelsService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
    private readonly progressService: ProgressService,
  ) {}

  async create(createLevelDto: CreateLevelDto): Promise<Level> {
    const level = this.levelRepository.create(createLevelDto);
    return await this.levelRepository.save(level);
  }

  async findAll(
    userId: number,
    unitId?: number,
    includeQuestions = false,
  ): Promise<LevelResponseDto[]> {
    const query: any = {
      where: unitId ? { unitId, isActive: true } : { isActive: true },
      order: { orderIndex: 'ASC' },
    };

    if (includeQuestions) {
      query.relations = ['questions', 'questions.answerOptions'];
    }

    const levels = await this.levelRepository.find(query);

    // Fetch all level progresses for this user efficiently
    const levelsData = levels.map((l) => ({
      id: l.id,
      passingScore: l.passingScore,
    }));
    const progressMap = await this.progressService.mapLevelsProgressToDto(
      userId,
      levelsData,
    );

    // Map to response DTOs with progress
    return levels.map((level) => ({
      id: level.id,
      title: level.title,
      description: level.description,
      unitId: level.unitId,
      orderIndex: level.orderIndex,
      timeLimitSeconds: level.timeLimitSeconds,
      passingScore: level.passingScore,
      isActive: level.isActive,
      createdAt: level.createdAt,
      updatedAt: level.updatedAt,
      questions: includeQuestions ? level.questions : undefined,
      progress: progressMap.get(level.id) || null,
    }));
  }

  async findOne(
    id: number,
    userId: number,
    includeQuestions = false,
  ): Promise<LevelResponseDto> {
    const query: any = { where: { id } };

    if (includeQuestions) {
      query.relations = ['questions', 'questions.answerOptions'];
    }

    const level = await this.levelRepository.findOne(query);

    if (!level) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }

    // Fetch level progress for this user
    const progress = await this.progressService.mapLevelProgressToDto(
      userId,
      id,
      level.passingScore,
    );

    return {
      id: level.id,
      title: level.title,
      description: level.description,
      unitId: level.unitId,
      orderIndex: level.orderIndex,
      timeLimitSeconds: level.timeLimitSeconds,
      passingScore: level.passingScore,
      isActive: level.isActive,
      createdAt: level.createdAt,
      updatedAt: level.updatedAt,
      questions: includeQuestions ? level.questions : undefined,
      progress,
    };
  }

  // Helper method for internal use without progress
  async findOneById(id: number): Promise<Level> {
    const level = await this.levelRepository.findOne({ where: { id } });
    if (!level) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }
    return level;
  }

  async update(id: number, updateLevelDto: UpdateLevelDto): Promise<Level> {
    const level = await this.findOneById(id);
    Object.assign(level, updateLevelDto);
    return await this.levelRepository.save(level);
  }

  async remove(id: number): Promise<void> {
    const level = await this.findOneById(id);
    await this.levelRepository.remove(level);
  }
}
