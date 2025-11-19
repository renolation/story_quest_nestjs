import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurriculumService } from './curriculum.service';

/**
 * Curriculum Controller
 *
 * Phase: 7
 * Status: 🔲 TODO - Placeholder only
 * Priority: HIGH
 *
 * Endpoints to implement:
 * - GET /api/v1/curriculum - List curriculum content (filtered by role)
 * - GET /api/v1/curriculum/:id - Get curriculum details
 * - POST /api/v1/curriculum - Create curriculum (TEACHER)
 * - PATCH /api/v1/curriculum/:id - Update own curriculum (TEACHER)
 * - DELETE /api/v1/curriculum/:id - Delete own curriculum (TEACHER)
 * - POST /api/v1/curriculum/:id/submit - Submit for review (TEACHER)
 * - POST /api/v1/curriculum/:id/approve - Approve content (REVIEWER)
 * - POST /api/v1/curriculum/:id/reject - Reject content (REVIEWER)
 * - GET /api/v1/curriculum/marketplace - Browse approved content
 * - GET /api/v1/curriculum/pending-review - Get review queue (REVIEWER)
 */
@ApiTags('curriculum')
@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  // TODO: Implement endpoints in Phase 7
}
