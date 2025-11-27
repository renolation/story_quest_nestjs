import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChapterProgressDto } from '../../progress/dto/chapter-progress.dto';

/**
 * Nested center information in chapter response
 */
class CenterInfoDto {
  @ApiProperty({ description: 'Center ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Center name', example: 'ABC English Center' })
  name: string;
}

export class ChapterResponseDto {
  @ApiProperty({ description: 'Chapter unique identifier', example: 1 })
  id: number;

  @ApiProperty({ description: 'Chapter title', example: 'Basic Greetings' })
  title: string;

  @ApiPropertyOptional({
    description: 'Chapter description',
    example: 'Learn basic greetings in English',
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Chapter thumbnail URL',
    example: 'https://example.com/chapter.jpg',
  })
  thumbnailUrl: string | null;

  @ApiProperty({ description: 'Chapter order index', example: 1 })
  orderIndex: number;

  @ApiProperty({ description: 'Whether chapter is active', example: true })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Center ID for organization-specific chapters. Null for public chapters',
    example: 1,
    nullable: true,
  })
  centerId: number | null;

  @ApiPropertyOptional({
    description: 'Associated center information (for organization-specific chapters)',
    type: CenterInfoDto,
    nullable: true,
  })
  center?: CenterInfoDto | null;

  @ApiProperty({
    description: 'Whether the chapter is public (available to all students)',
    example: false,
  })
  isPublic: boolean;

  @ApiProperty({ description: 'Chapter creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Chapter last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Nested units (if includeUnits=true)',
    type: 'array',
  })
  units?: any[];

  @ApiPropertyOptional({
    description: 'Student progress for this chapter (null if no progress yet)',
    type: ChapterProgressDto,
    nullable: true,
  })
  progress?: ChapterProgressDto | null;
}
