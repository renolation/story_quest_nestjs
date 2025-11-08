import { ApiProperty } from '@nestjs/swagger';
import { LevelProgressDto } from '../../progress/dto/level-progress.dto';

export class LevelResponseDto {
  @ApiProperty({ description: 'Level unique identifier', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Level title', example: 'Practice Hello' })
  title: string;

  @ApiProperty({ description: 'Level description', example: 'Practice saying hello' })
  description: string;

  @ApiProperty({ description: 'Parent unit ID', example: 'uuid' })
  unitId: string;

  @ApiProperty({ description: 'Level order index within unit', example: 1 })
  orderIndex: number;

  @ApiProperty({ description: 'Time limit in seconds', example: 300 })
  timeLimitSeconds: number;

  @ApiProperty({ description: 'Passing score percentage (0-100)', example: 70 })
  passingScore: number;

  @ApiProperty({ description: 'Whether level is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Level creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Level last update timestamp' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Nested questions (if includeQuestions=true)',
    required: false,
    type: 'array',
  })
  questions?: any[];

  @ApiProperty({
    description: 'Student progress for this level (null if no attempts yet)',
    type: LevelProgressDto,
    nullable: true,
    required: false,
  })
  progress?: LevelProgressDto | null;
}
