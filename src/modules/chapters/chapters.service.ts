import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from './entities/chapter.entity';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
  ) {}

  async create(createChapterDto: CreateChapterDto): Promise<Chapter> {
    const chapter = this.chapterRepository.create(createChapterDto);
    return await this.chapterRepository.save(chapter);
  }

  async findAll(includeUnits = false): Promise<Chapter[]> {
    const query: any = {
      where: { isActive: true },
      order: { orderIndex: 'ASC' },
    };

    if (includeUnits) {
      query.relations = ['units'];
    }

    return await this.chapterRepository.find(query);
  }

  async findOne(id: string, includeUnits = false): Promise<Chapter> {
    const query: any = { where: { id } };

    if (includeUnits) {
      query.relations = ['units'];
    }

    const chapter = await this.chapterRepository.findOne(query);

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    return chapter;
  }

  async update(id: string, updateChapterDto: UpdateChapterDto): Promise<Chapter> {
    const chapter = await this.findOne(id);
    Object.assign(chapter, updateChapterDto);
    return await this.chapterRepository.save(chapter);
  }

  async remove(id: string): Promise<void> {
    const chapter = await this.findOne(id);
    await this.chapterRepository.remove(chapter);
  }
}
