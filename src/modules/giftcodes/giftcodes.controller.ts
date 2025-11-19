import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GiftcodesService } from './giftcodes.service';

/**
 * Giftcodes Controller
 *
 * Phase: 7
 * Status: 🔲 TODO - Placeholder only
 * Priority: HIGH
 *
 * Endpoints to implement:
 * - GET /api/v1/giftcodes - List giftcodes (filtered by role)
 * - GET /api/v1/giftcodes/:id - Get giftcode details
 * - POST /api/v1/giftcodes - Create giftcode (AGENCY or CENTER)
 * - POST /api/v1/giftcodes/bulk - Bulk generate giftcodes
 * - PATCH /api/v1/giftcodes/:id - Update giftcode
 * - DELETE /api/v1/giftcodes/:id - Delete/deactivate giftcode
 * - POST /api/v1/giftcodes/redeem - Redeem giftcode (STUDENT)
 * - GET /api/v1/giftcodes/:id/usage - Get usage statistics
 */
@ApiTags('giftcodes')
@Controller('giftcodes')
export class GiftcodesController {
  constructor(private readonly giftcodesService: GiftcodesService) {}

  // TODO: Implement endpoints in Phase 7
}
