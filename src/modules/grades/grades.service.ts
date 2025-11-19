import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';

/**
 * Grades Service
 *
 * Phase: 7
 * Status: 🔲 TODO - Placeholder only
 * Priority: LOW
 *
 * Business logic to implement:
 * - List all grades (3, 4, 5)
 * - Grade-based content filtering
 *
 * Note: This is a simple lookup table with static data.
 * Grades are: 3, 4, 5 (for ages 8-11).
 */
@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
  ) {}

  // TODO: Implement service methods in Phase 7
}
