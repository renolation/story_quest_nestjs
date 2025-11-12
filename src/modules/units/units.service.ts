import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitResponseDto } from './dto/unit-response.dto';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    private readonly progressService: ProgressService,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const unit = this.unitRepository.create(createUnitDto);
    return await this.unitRepository.save(unit);
  }

  async findAll(userId: number, chapterId?: number, includeLevels = false): Promise<UnitResponseDto[]> {
    const query: any = {
      where: chapterId ? { chapterId, isActive: true } : { isActive: true },
      order: { orderIndex: 'ASC' },
    };

    if (includeLevels) {
      query.relations = ['levels'];
    }

    const units = await this.unitRepository.find(query);

    // Fetch all unit progresses for this user
    const unitIds = units.map(u => u.id);
    const progresses = await this.progressService.getUnitsProgress(userId, unitIds);
    const progressMap = new Map(progresses.map(p => [p.unitId, p]));

    // Map to response DTOs with progress
    return units.map(unit => ({
      id: unit.id,
      title: unit.title,
      description: unit.description,
      chapterId: unit.chapterId,
      orderIndex: unit.orderIndex,
      isActive: unit.isActive,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
      levels: includeLevels ? unit.levels : undefined,
      progress: this.progressService.mapUnitProgressToDto(
        progressMap.get(unit.id) || null,
      ),
    }));
  }

  async findOne(id: number, userId: number, includeLevels = false): Promise<UnitResponseDto> {
    const query: any = { where: { id } };

    if (includeLevels) {
      query.relations = ['levels'];
    }

    const unit = await this.unitRepository.findOne(query);

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    // Fetch unit progress for this user
    const progress = await this.progressService.getUnitProgress(userId, id);

    return {
      id: unit.id,
      title: unit.title,
      description: unit.description,
      chapterId: unit.chapterId,
      orderIndex: unit.orderIndex,
      isActive: unit.isActive,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
      levels: includeLevels ? unit.levels : undefined,
      progress: this.progressService.mapUnitProgressToDto(progress),
    };
  }

  // Helper method for internal use without progress
  async findOneById(id: number): Promise<Unit> {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    return unit;
  }

  async update(id: number, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findOneById(id);
    Object.assign(unit, updateUnitDto);
    return await this.unitRepository.save(unit);
  }

  async remove(id: number): Promise<void> {
    const unit = await this.findOneById(id);
    await this.unitRepository.remove(unit);
  }
}
