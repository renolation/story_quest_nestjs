import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StoriesService } from './stories.service';

/**
 * Stories Controller
 *
 * Phase: 5
 * Status: 🔲 TODO - Placeholder only
 * Priority: HIGH
 *
 * Endpoints to implement:
 * - POST /api/v1/stories/generate - Generate AI story based on theme/level
 * - GET /api/v1/stories - List stories with filters
 * - GET /api/v1/stories/:id - Get story with scenes and vocabulary
 * - GET /api/v1/stories/:id/scenes - Get story scenes
 * - GET /api/v1/stories/:id/vocabulary - Get story vocabulary words
 * - GET /api/v1/stories/:id/questions - Get comprehension questions
 * - POST /api/v1/stories/:id/progress - Track student story progress
 * - POST /api/v1/stories/:id/tts - Generate narration audio
 */
@ApiTags('stories')
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  // TODO: Implement endpoints in Phase 5
}
