import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for pronunciation attempt records
 *
 * Returns all pronunciation attempt data including:
 * - Attempt metadata (ID, timestamps)
 * - Student and question references
 * - Reference and recognized text
 * - Client-calculated scores (pronunciation, accuracy, fluency, completeness)
 */
export class PronunciationAttemptResponseDto {
  @ApiProperty({
    description: 'Pronunciation attempt unique identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Student ID who made the attempt',
    example: 42,
  })
  studentId: number;

  @ApiProperty({
    description: 'Question ID being practiced',
    example: 5,
  })
  questionId: number;

  @ApiProperty({
    description: 'Reference text that should be pronounced',
    example: 'Hello, how are you?',
  })
  referenceText: string;

  @ApiPropertyOptional({
    description: 'Text recognized by client speech recognition',
    example: 'Hello, how are you?',
    nullable: true,
  })
  recognizedText: string | null;

  @ApiPropertyOptional({
    description: 'Overall pronunciation score (0-100) calculated by client',
    example: 87.5,
    nullable: true,
  })
  pronunciationScore: number | null;

  @ApiPropertyOptional({
    description: 'Accuracy score (0-100) calculated by client',
    example: 90.0,
    nullable: true,
  })
  accuracyScore: number | null;

  @ApiPropertyOptional({
    description: 'Fluency score (0-100) calculated by client',
    example: 85.0,
    nullable: true,
  })
  fluencyScore: number | null;

  @ApiPropertyOptional({
    description: 'Completeness score (0-100) calculated by client',
    example: 88.0,
    nullable: true,
  })
  completenessScore: number | null;

  @ApiProperty({
    description: 'Timestamp when attempt was created',
    example: '2025-01-21T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when attempt was last updated',
    example: '2025-01-21T10:30:00Z',
  })
  updatedAt: Date;
}
