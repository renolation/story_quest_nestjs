import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * PHASE 3 - TODO
 * DTO for creating vocabulary words
 */
export class CreateVocabularyWordDto {
  @ApiProperty({ example: 'hello', description: 'Vocabulary word' })
  @IsString()
  @MaxLength(255)
  word: string;

  @ApiPropertyOptional({
    example: 'A greeting or expression of goodwill',
    description: 'Word definition',
  })
  @IsOptional()
  @IsString()
  definition?: string;

  @ApiPropertyOptional({
    example: 'Hello, how are you today?',
    description: 'Example sentence using the word',
  })
  @IsOptional()
  @IsString()
  exampleSentence?: string;

  @ApiPropertyOptional({
    example: 'https://storage.example.com/tts/hello.mp3',
    description: 'TTS-generated audio URL',
  })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({
    example: 'həˈloʊ',
    description: 'Phonetic pronunciation',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  phonetic?: string;
}
