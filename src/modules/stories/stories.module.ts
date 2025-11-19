import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Story } from './entities/story.entity';
import { StoryScene } from './entities/story-scene.entity';
import { StoryVocabulary } from './entities/story-vocabulary.entity';
import { StoryComprehensionQuestion } from './entities/story-comprehension-question.entity';
import { StudentStoryProgress } from './entities/student-story-progress.entity';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';

/**
 * PHASE 5 - STORIES MODULE - TODO
 *
 * AI-powered story generation and reading comprehension features.
 *
 * Features to implement:
 * - AI story generation (OpenAI/Gemini)
 * - Story scene management
 * - Vocabulary extraction from stories
 * - Reading comprehension questions
 * - Story progress tracking
 * - TTS narration generation
 * - Image generation for scenes (optional)
 *
 * External services needed:
 * - OpenAI/Gemini API for story generation
 * - Content moderation API (child-safe content)
 * - Google Cloud TTS for narration
 * - AWS S3 for image/audio storage
 *
 * Safety considerations:
 * - Content moderation for all AI-generated content
 * - Age-appropriate themes and vocabulary
 * - COPPA compliance
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Story,
      StoryScene,
      StoryVocabulary,
      StoryComprehensionQuestion,
      StudentStoryProgress,
    ]),
  ],
  controllers: [StoriesController],
  providers: [StoriesService],
  exports: [StoriesService],
})
export class StoriesModule {}
