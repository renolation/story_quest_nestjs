import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum LeaderboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'alltime',
}

export class LeaderboardQueryDto {
  @ApiProperty({
    description: 'Leaderboard time period',
    enum: LeaderboardPeriod,
    default: LeaderboardPeriod.ALL_TIME,
    required: false,
  })
  @IsOptional()
  @IsEnum(LeaderboardPeriod)
  period?: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME;

  @ApiProperty({
    description: 'Maximum number of entries to return',
    example: 100,
    default: 100,
    minimum: 1,
    maximum: 500,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 100;

  @ApiProperty({
    description: 'Number of entries to skip (for pagination)',
    example: 0,
    default: 0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
