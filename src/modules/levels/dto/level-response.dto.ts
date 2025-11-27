import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LevelProgressDto } from '../../progress/dto/level-progress.dto';

export class LevelResponseDto {
  @ApiProperty({ description: 'Level unique identifier', example: 1 })
  id: number;

  @ApiProperty({ description: 'Level title', example: 'Practice Hello' })
  title: string;

  @ApiPropertyOptional({
    description: 'Level description',
    example: 'Practice saying hello',
  })
  description: string | null;

  @ApiProperty({ description: 'Parent unit ID', example: 1 })
  unitId: number;

  @ApiProperty({ description: 'Level order index within unit', example: 1 })
  orderIndex: number;

  @ApiPropertyOptional({ description: 'Time limit in seconds', example: 300 })
  timeLimitSeconds: number | null;

  @ApiProperty({ description: 'Passing score percentage (0-100)', example: 70, default: 70 })
  passingScore: number;

  @ApiProperty({ description: 'Total points available for this level', example: 100, default: 100 })
  totalPoints: number;

  @ApiProperty({ description: 'Whether level is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Level creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Level last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Nested questions (if includeQuestions=true)',
    type: 'array',
  })
  questions?: any[];

  @ApiPropertyOptional({
    description: 'Student progress for this level (null if no attempts yet)',
    type: LevelProgressDto,
    nullable: true,
  })
  progress?: LevelProgressDto | null;
}
