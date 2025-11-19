import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * PHASE 3 - TODO
 * DTO for creating pronunciation attempt records
 */
export class CreatePronunciationAttemptDto {
  @ApiProperty({ example: 'hello', description: 'Word being practiced' })
  @IsString()
  word: string;

  @ApiPropertyOptional({
    example: 'https://storage.example.com/audio/123.mp3',
    description: 'URL to recorded audio file',
  })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({
    example: 'helo',
    description: 'Transcription from speech recognition',
  })
  @IsOptional()
  @IsString()
  transcription?: string;

  @ApiPropertyOptional({
    example: 85.5,
    description: 'Pronunciation accuracy score (0-100)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  accuracyScore?: number;
}
