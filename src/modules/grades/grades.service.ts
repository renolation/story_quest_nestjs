import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeDto, UpdateGradeDto } from './dto';

/**
 * Grades Service
 *
 * Manages grade levels for students (3, 4, 5)
 * Simple CRUD operations - grades are relatively static data
 */
@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradesRepository: Repository<Grade>,
  ) {}

  /**
   * Create a new grade level
   * Note: Grades 3, 4, 5 are created by default in migration
   */
  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    // Check if grade level already exists
    const existing = await this.gradesRepository.findOne({
      where: { gradeLevel: createGradeDto.gradeLevel },
    });

    if (existing) {
      throw new ConflictException(
        `Grade level ${createGradeDto.gradeLevel} already exists`,
      );
    }

    const grade = this.gradesRepository.create(createGradeDto);
    return await this.gradesRepository.save(grade);
  }

  /**
   * Get all grade levels
   */
  async findAll(): Promise<Grade[]> {
    return await this.gradesRepository.find({
      order: { gradeLevel: 'ASC' },
    });
  }

  /**
   * Get a single grade by ID
   */
  async findOne(id: number): Promise<Grade> {
    const grade = await this.gradesRepository.findOne({
      where: { id },
    });

    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }

    return grade;
  }

  /**
   * Get a grade by grade level (3, 4, or 5)
   */
  async findByLevel(gradeLevel: number): Promise<Grade> {
    const grade = await this.gradesRepository.findOne({
      where: { gradeLevel },
    });

    if (!grade) {
      throw new NotFoundException(`Grade level ${gradeLevel} not found`);
    }

    return grade;
  }

  /**
   * Update a grade
   */
  async update(id: number, updateGradeDto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.findOne(id);

    // If updating grade level, check for conflicts
    if (
      updateGradeDto.gradeLevel &&
      updateGradeDto.gradeLevel !== grade.gradeLevel
    ) {
      const existing = await this.gradesRepository.findOne({
        where: { gradeLevel: updateGradeDto.gradeLevel },
      });

      if (existing) {
        throw new ConflictException(
          `Grade level ${updateGradeDto.gradeLevel} already exists`,
        );
      }
    }

    Object.assign(grade, updateGradeDto);
    return await this.gradesRepository.save(grade);
  }

  /**
   * Delete a grade
   * Note: This will fail if classes are using this grade (foreign key constraint)
   */
  async remove(id: number): Promise<void> {
    const grade = await this.findOne(id);
    await this.gradesRepository.remove(grade);
  }
}
