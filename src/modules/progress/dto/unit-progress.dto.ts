import { ApiProperty } from '@nestjs/swagger';

export class UnitProgressDto {
  @ApiProperty({
    description: 'Total number of levels in the unit',
    example: 10,
  })
  totalLevels: number;

  @ApiProperty({
    description: 'Number of levels completed by the student',
    example: 7,
  })
  completedLevels: number;

  @ApiProperty({
    description: 'Total points available across all levels in the unit',
    example: 100,
  })
  totalPointsAvailable: number;

  @ApiProperty({
    description: 'Total points earned by the student in the unit',
    example: 85,
  })
  totalPointsEarned: number;

  @ApiProperty({
    description: 'Average score percentage across all completed levels',
    example: 85.0,
  })
  averageScore: number;

  @ApiProperty({
    description: 'Last time the student accessed any level in this unit',
    example: '2025-01-15T14:20:00Z',
    nullable: true,
  })
  lastAccessedAt: Date | null;
}
