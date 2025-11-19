import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GradesService } from './grades.service';

/**
 * Grades Controller
 *
 * Phase: 7
 * Status: 🔲 TODO - Placeholder only
 * Priority: LOW
 *
 * Endpoints to implement:
 * - GET /api/v1/grades - List all grades (3, 4, 5)
 * - GET /api/v1/grades/:id - Get grade details
 *
 * Note: This is a simple lookup table with static data (grades 3, 4, 5).
 * Mainly used for filtering content by grade level.
 */
@ApiTags('grades')
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  // TODO: Implement endpoints in Phase 7
}
