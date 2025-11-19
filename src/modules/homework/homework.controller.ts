import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HomeworkService } from './homework.service';

/**
 * Homework Controller
 *
 * Phase: 7
 * Status: 🔲 TODO - Placeholder only
 * Priority: HIGH
 *
 * Endpoints to implement:
 * - GET /api/v1/homework/assignments - List assignments (filtered by role)
 * - GET /api/v1/homework/assignments/:id - Get assignment details
 * - POST /api/v1/homework/assignments - Create assignment (TEACHER)
 * - PATCH /api/v1/homework/assignments/:id - Update assignment (TEACHER)
 * - DELETE /api/v1/homework/assignments/:id - Delete assignment (TEACHER)
 * - GET /api/v1/homework/assignments/:id/submissions - Get submissions for assignment
 * - POST /api/v1/homework/submissions - Submit homework (STUDENT)
 * - GET /api/v1/homework/submissions/:id - Get submission details
 * - PATCH /api/v1/homework/submissions/:id/grade - Grade submission (TEACHER)
 * - GET /api/v1/homework/my-homework - Get student's assigned homework (STUDENT)
 */
@ApiTags('homework')
@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  // TODO: Implement endpoints in Phase 7
}
