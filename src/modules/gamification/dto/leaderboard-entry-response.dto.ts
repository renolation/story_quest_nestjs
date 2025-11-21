import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryResponseDto {
  @ApiProperty({
    description: 'Rank position in leaderboard',
    example: 1,
  })
  rank: number;

  @ApiProperty({
    description: 'Student ID',
    example: 123,
  })
  studentId: number;

  @ApiProperty({
    description: 'Student username or display name',
    example: 'john_doe',
    required: false,
  })
  studentName?: string;

  @ApiProperty({
    description: 'Total points earned',
    example: 1500,
  })
  totalPoints: number;

  @ApiProperty({
    description: 'Number of achievements unlocked',
    example: 15,
  })
  achievementsCount: number;
}
