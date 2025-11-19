import { IsInt, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteLevelDto {
  @ApiProperty({
    description: 'Attempt ID to complete',
    example: 1,
  })
  @IsInt()
  attemptId: number;

  @ApiProperty({
    description: 'Total score achieved',
    example: 85,
  })
  @IsInt()
  score: number;

  @ApiProperty({
    description: 'Total points earned',
    example: 42,
  })
  @IsInt()
  pointsEarned: number;

  @ApiProperty({
    description: 'Whether the student passed the level',
    example: true,
  })
  @IsBoolean()
  isPassed: boolean;

  @ApiProperty({
    description: 'Total time spent in seconds',
    example: 180,
  })
  @IsInt()
  timeSpentSeconds: number;
}
