import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from './entities/chapter.entity';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ChapterResponseDto } from './dto/chapter-response.dto';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    private readonly progressService: ProgressService,
  ) {}

  async create(createChapterDto: CreateChapterDto): Promise<Chapter> {
    const chapter = this.chapterRepository.create(createChapterDto);
    return await this.chapterRepository.save(chapter);
  }

  async findAll(userId: number, includeUnits = false): Promise<ChapterResponseDto[]> {
    const query: any = {
      where: { isActive: true },
      order: { orderIndex: 'ASC' },
    };

    if (includeUnits) {
      query.relations = ['units'];
    }

    const chapters = await this.chapterRepository.find(query);

    // Fetch all chapter progresses for this user
    const chapterIds = chapters.map(c => c.id);
    const progresses = await this.progressService.getChaptersProgress(userId, chapterIds);
    const progressMap = new Map(progresses.map(p => [p.chapterId, p]));

    // Map to response DTOs with progress
    return chapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      thumbnailUrl: chapter.thumbnailUrl,
      orderIndex: chapter.orderIndex,
      isActive: chapter.isActive,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      units: includeUnits ? chapter.units : undefined,
      progress: this.progressService.mapChapterProgressToDto(
        progressMap.get(chapter.id) || null,
      ),
    }));
  }

  async findOne(id: number, userId: number, includeUnits = false): Promise<ChapterResponseDto> {
    const query: any = { where: { id } };

    if (includeUnits) {
      query.relations = ['units'];
    }

    const chapter = await this.chapterRepository.findOne(query);

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    // Fetch chapter progress for this user
    const progress = await this.progressService.getChapterProgress(userId, id);

    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      thumbnailUrl: chapter.thumbnailUrl,
      orderIndex: chapter.orderIndex,
      isActive: chapter.isActive,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      units: includeUnits ? chapter.units : undefined,
      progress: this.progressService.mapChapterProgressToDto(progress),
    };
  }

  // Helper method for internal use without progress
  async findOneById(id: number): Promise<Chapter> {
    const chapter = await this.chapterRepository.findOne({ where: { id } });
    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }
    return chapter;
  }

  async update(id: number, updateChapterDto: UpdateChapterDto): Promise<Chapter> {
    const chapter = await this.findOneById(id);
    Object.assign(chapter, updateChapterDto);
    return await this.chapterRepository.save(chapter);
  }

  async remove(id: number): Promise<void> {
    const chapter = await this.findOneById(id);
    await this.chapterRepository.remove(chapter);
  }
}
