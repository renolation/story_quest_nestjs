import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for querying pronunciation attempt history
 *
 * Supports filtering by level or question, with pagination
 */
export class PronunciationHistoryQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by level ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  levelId?: number;

  @ApiPropertyOptional({
    description: 'Filter by question ID',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  questionId?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of records to return',
    example: 50,
    default: 50,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Number of records to skip',
    example: 0,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
