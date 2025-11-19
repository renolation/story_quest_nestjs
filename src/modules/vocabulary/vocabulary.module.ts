import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyWord } from './entities/vocabulary-word.entity';

/**
 * PHASE 3 - VOCABULARY MODULE - TODO
 *
 * Manages vocabulary words with TTS audio generation.
 *
 * Features to implement:
 * - CRUD operations for vocabulary words
 * - Text-to-Speech audio generation
 * - Phonetic notation
 * - Example sentences
 * - Word categories/tags
 *
 * External services needed:
 * - Google Cloud Text-to-Speech API
 * - AWS S3 for audio storage
 */
@Module({
  imports: [TypeOrmModule.forFeature([VocabularyWord])],
  controllers: [],
  providers: [],
  exports: [],
})
export class VocabularyModule {}
