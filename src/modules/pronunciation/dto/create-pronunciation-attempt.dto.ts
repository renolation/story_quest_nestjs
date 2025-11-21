import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating pronunciation attempt records
 *
 * Architecture Note:
 * - Speech recognition is CLIENT-SIDE (mobile app)
 * - Backend only stores client-calculated scores
 * - All score fields are optional (client may submit partial data)
 */
export class CreatePronunciationAttemptDto {
  @ApiProperty({
    description: 'Question ID being practiced',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  questionId: number;

  @ApiProperty({
    description: 'Reference text that student should pronounce',
    example: 'Hello, how are you?',
  })
  @IsNotEmpty()
  @IsString()
  referenceText: string;

  @ApiPropertyOptional({
    description: 'Text recognized by client speech recognition',
    example: 'Hello, how are you?',
  })
  @IsOptional()
  @IsString()
  recognizedText?: string;

  @ApiPropertyOptional({
    description: 'Overall pronunciation score (0-100) calculated by client',
    example: 87.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  pronunciationScore?: number;

  @ApiPropertyOptional({
    description: 'Accuracy score (0-100) calculated by client',
    example: 90.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  accuracyScore?: number;

  @ApiPropertyOptional({
    description: 'Fluency score (0-100) calculated by client',
    example: 85.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  fluencyScore?: number;

  @ApiPropertyOptional({
    description: 'Completeness score (0-100) calculated by client',
    example: 88.0,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  completenessScore?: number;
}
