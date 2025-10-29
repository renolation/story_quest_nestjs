import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const unit = this.unitRepository.create(createUnitDto);
    return await this.unitRepository.save(unit);
  }

  async findAll(chapterId?: string, includeLevels = false): Promise<Unit[]> {
    const query: any = {
      where: chapterId ? { chapterId, isActive: true } : { isActive: true },
      order: { orderIndex: 'ASC' },
    };

    if (includeLevels) {
      query.relations = ['levels'];
    }

    return await this.unitRepository.find(query);
  }

  async findOne(id: string, includeLevels = false): Promise<Unit> {
    const query: any = { where: { id } };

    if (includeLevels) {
      query.relations = ['levels'];
    }

    const unit = await this.unitRepository.findOne(query);

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findOne(id);
    Object.assign(unit, updateUnitDto);
    return await this.unitRepository.save(unit);
  }

  async remove(id: string): Promise<void> {
    const unit = await this.findOne(id);
    await this.unitRepository.remove(unit);
  }
}
