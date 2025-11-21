import {
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PointReason {
  LEVEL_COMPLETE = 'level_complete',
  ACHIEVEMENT_UNLOCK = 'achievement_unlock',
  PERFECT_SCORE = 'perfect_score',
  STREAK_BONUS = 'streak_bonus',
  DAILY_LOGIN = 'daily_login',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}

export class AwardPointsDto {
  @ApiProperty({
    description: 'Student ID to award/deduct points',
    example: 123,
  })
  @IsNotEmpty()
  @IsInt()
  studentId: number;

  @ApiProperty({
    description: 'Points to award (positive) or deduct (negative)',
    example: 50,
  })
  @IsNotEmpty()
  @IsInt()
  points: number;

  @ApiProperty({
    description: 'Reason for point transaction',
    enum: PointReason,
    example: PointReason.LEVEL_COMPLETE,
  })
  @IsNotEmpty()
  @IsEnum(PointReason)
  reason: PointReason;

  @ApiProperty({
    description: 'Reference ID of related entity (level, achievement, etc.)',
    example: 42,
    required: false,
  })
  @IsOptional()
  @IsInt()
  referenceId?: number;

  @ApiProperty({
    description: 'Optional notes or description',
    example: 'Completed Level 5 with perfect score',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
