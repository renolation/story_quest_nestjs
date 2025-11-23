import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class GradeResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 3 })
  @Expose()
  gradeLevel: number;

  @ApiProperty({ example: 'Grade 3 - Ages 8-9' })
  @Expose()
  description: string;

  @ApiProperty({ example: '2025-11-23T00:00:00.000Z' })
  @Expose()
  createdAt: string;
}
