import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartLevelDto {
  @ApiProperty({
    description: 'Level ID to start',
    example: 1,
  })
  @IsInt()
  levelId: number;
}
