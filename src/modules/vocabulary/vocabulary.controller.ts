import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VocabularyService } from './vocabulary.service';

/**
 * Vocabulary Controller
 *
 * Phase: 3
 * Status: 🔲 TODO - Placeholder only
 * Priority: MEDIUM
 *
 * Endpoints to implement:
 * - GET /api/v1/vocabulary - List vocabulary words with filters
 * - GET /api/v1/vocabulary/:id - Get vocabulary word by ID
 * - POST /api/v1/vocabulary - Create new vocabulary word (admin/teacher)
 * - PATCH /api/v1/vocabulary/:id - Update vocabulary word
 * - DELETE /api/v1/vocabulary/:id - Delete vocabulary word
 * - POST /api/v1/vocabulary/:id/generate-audio - Generate TTS audio
 */
@ApiTags('vocabulary')
@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  // TODO: Implement endpoints in Phase 3
}
