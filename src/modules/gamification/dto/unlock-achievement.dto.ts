import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnlockAchievementDto {
  @ApiProperty({
    description: 'Unique achievement code to unlock',
    example: 'first_level_complete',
  })
  @IsNotEmpty()
  @IsString()
  achievementCode: string;

  @ApiProperty({
    description: 'Student ID who earned the achievement',
    example: 123,
  })
  @IsNotEmpty()
  @IsInt()
  studentId: number;
}
