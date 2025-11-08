import { ApiProperty } from '@nestjs/swagger';

export class LevelProgressDto {
  @ApiProperty({
    description: 'Total number of attempts for this level',
    example: 3,
  })
  attemptCount: number;

  @ApiProperty({
    description: 'Best score achieved across all attempts (0-100)',
    example: 95,
  })
  bestScore: number;

  @ApiProperty({
    description: 'Points earned in the best attempt',
    example: 95,
  })
  bestPointsEarned: number;

  @ApiProperty({
    description: 'Whether the student has passed this level',
    example: true,
  })
  isPassed: boolean;

  @ApiProperty({
    description: 'Whether the student has completed at least one attempt',
    example: true,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'Last attempt timestamp',
    example: '2025-01-15T16:45:00Z',
    nullable: true,
  })
  lastAttemptAt: Date | null;
}
