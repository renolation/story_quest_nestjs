import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CentersService } from './centers.service';

/**
 * Centers Controller
 *
 * Phase: 7
 * Status: 🔲 TODO - Placeholder only
 * Priority: HIGH
 *
 * Endpoints to implement:
 * - GET /api/v1/centers - List all centers (AGENCY) or own center (CENTER)
 * - GET /api/v1/centers/:id - Get center details
 * - POST /api/v1/centers - Create center (AGENCY only)
 * - PATCH /api/v1/centers/:id - Update center (AGENCY or own CENTER)
 * - DELETE /api/v1/centers/:id - Delete/suspend center (AGENCY only)
 * - GET /api/v1/centers/:id/branches - Get center's branches
 * - GET /api/v1/centers/:id/teachers - Get center's teachers
 * - GET /api/v1/centers/:id/analytics - Get center analytics
 */
@ApiTags('centers')
@Controller('centers')
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  // TODO: Implement endpoints in Phase 7
}
