import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BranchesService } from './branches.service';

/**
 * Branches Controller
 *
 * Phase: 7
 * Status: 🔲 TODO - Placeholder only
 * Priority: HIGH
 *
 * Endpoints to implement:
 * - GET /api/v1/branches - List branches (filtered by center for CENTER role)
 * - GET /api/v1/branches/:id - Get branch details
 * - POST /api/v1/branches - Create branch (AGENCY or CENTER for own center)
 * - PATCH /api/v1/branches/:id - Update branch
 * - DELETE /api/v1/branches/:id - Delete/deactivate branch
 * - GET /api/v1/branches/:id/classes - Get branch's classes
 * - GET /api/v1/branches/:id/analytics - Get branch analytics
 */
@ApiTags('branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  // TODO: Implement endpoints in Phase 7
}
