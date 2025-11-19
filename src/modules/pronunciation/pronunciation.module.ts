import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PronunciationAttempt } from './entities/pronunciation-attempt.entity';

/**
 * PHASE 3 - PRONUNCIATION MODULE - TODO
 *
 * Manages pronunciation practice and speech recognition features.
 *
 * Features to implement:
 * - Record pronunciation attempts
 * - Speech-to-text validation
 * - Pronunciation accuracy scoring
 * - Practice history tracking
 *
 * External services needed:
 * - Google Cloud Speech-to-Text API
 * - AWS S3 for audio storage
 */
@Module({
  imports: [TypeOrmModule.forFeature([PronunciationAttempt])],
  controllers: [],
  providers: [],
  exports: [],
})
export class PronunciationModule {}
