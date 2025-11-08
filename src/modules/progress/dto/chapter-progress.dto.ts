import { ApiProperty } from '@nestjs/swagger';

export class ChapterProgressDto {
  @ApiProperty({
    description: 'Total number of units in the chapter',
    example: 5,
  })
  totalUnits: number;

  @ApiProperty({
    description: 'Number of units completed by the student',
    example: 3,
  })
  completedUnits: number;

  @ApiProperty({
    description: 'Total points available across all units in the chapter',
    example: 500,
  })
  totalPointsAvailable: number;

  @ApiProperty({
    description: 'Total points earned by the student in the chapter',
    example: 420,
  })
  totalPointsEarned: number;

  @ApiProperty({
    description: 'Average score percentage across all completed units',
    example: 84.5,
  })
  averageScore: number;

  @ApiProperty({
    description: 'Last time the student accessed any content in this chapter',
    example: '2025-01-15T10:30:00Z',
    nullable: true,
  })
  lastAccessedAt: Date | null;
}
