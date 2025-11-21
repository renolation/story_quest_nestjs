import { ApiProperty } from '@nestjs/swagger';

export class StudentStatsResponseDto {
  @ApiProperty({
    description: 'Total accumulated points',
    example: 1250,
  })
  totalPoints: number;

  @ApiProperty({
    description: 'Current consecutive days streak',
    example: 7,
  })
  currentStreak: number;

  @ApiProperty({
    description: 'Longest streak ever achieved',
    example: 14,
  })
  longestStreak: number;

  @ApiProperty({
    description: 'Total number of achievements unlocked',
    example: 12,
  })
  achievementsCount: number;

  @ApiProperty({
    description: 'Current rank in leaderboard (optional)',
    example: 23,
    required: false,
  })
  rank?: number;
}
