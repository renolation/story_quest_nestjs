import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitProgressDto } from '../../progress/dto/unit-progress.dto';

export class UnitResponseDto {
  @ApiProperty({ description: 'Unit unique identifier', example: 1 })
  id: number;

  @ApiProperty({ description: 'Unit title', example: 'Greeting Friends' })
  title: string;

  @ApiPropertyOptional({
    description: 'Unit description',
    example: 'Learn how to greet friends',
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Unit thumbnail URL',
    example: 'https://storage.example.com/units/greeting-friends.jpg',
  })
  thumbnailUrl: string | null;

  @ApiProperty({ description: 'Parent chapter ID', example: 1 })
  chapterId: number;

  @ApiProperty({ description: 'Unit order index within chapter', example: 1 })
  orderIndex: number;

  @ApiProperty({ description: 'Whether unit is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Unit creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Unit last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Nested levels (if includeLevels=true)',
    type: 'array',
  })
  levels?: any[];

  @ApiPropertyOptional({
    description: 'Student progress for this unit (null if no progress yet)',
    type: UnitProgressDto,
    nullable: true,
  })
  progress?: UnitProgressDto | null;
}
