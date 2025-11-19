import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PronunciationService } from './pronunciation.service';

/**
 * Pronunciation Controller
 *
 * Phase: 3
 * Status: 🔲 TODO - Placeholder only
 * Priority: MEDIUM
 *
 * Endpoints to implement:
 * - POST /api/v1/pronunciation/tts - Generate text-to-speech audio
 * - POST /api/v1/pronunciation/analyze - Analyze pronunciation attempt
 * - GET /api/v1/pronunciation/attempts/:studentId - Get student attempts
 */
@ApiTags('pronunciation')
@Controller('pronunciation')
export class PronunciationController {
  constructor(private readonly pronunciationService: PronunciationService) {}

  // TODO: Implement endpoints in Phase 3
}
