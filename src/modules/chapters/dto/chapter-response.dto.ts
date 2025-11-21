import { ApiProperty } from '@nestjs/swagger';
import { ChapterProgressDto } from '../../progress/dto/chapter-progress.dto';

export class ChapterResponseDto {
  @ApiProperty({ description: 'Chapter unique identifier', example: 1 })
  id: number;

  @ApiProperty({ description: 'Chapter title', example: 'Basic Greetings' })
  title: string;

  @ApiProperty({
    description: 'Chapter description',
    example: 'Learn basic greetings in English',
  })
  description: string;

  @ApiProperty({
    description: 'Chapter thumbnail URL',
    example: 'https://example.com/chapter.jpg',
  })
  thumbnailUrl: string;

  @ApiProperty({ description: 'Chapter order index', example: 1 })
  orderIndex: number;

  @ApiProperty({ description: 'Whether chapter is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Chapter creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Chapter last update timestamp' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Nested units (if includeUnits=true)',
    required: false,
    type: 'array',
  })
  units?: any[];

  @ApiProperty({
    description: 'Student progress for this chapter (null if no progress yet)',
    type: ChapterProgressDto,
    nullable: true,
    required: false,
  })
  progress?: ChapterProgressDto | null;
}
