import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**
 * Center analytics DTO
 * Provides statistical information about a center's operations
 */
export class CenterAnalyticsDto {
  @ApiProperty({
    description: 'Center ID',
    example: 1,
  })
  @Expose()
  centerId: number;

  @ApiProperty({
    description: 'Center name',
    example: 'ABC English Center',
  })
  @Expose()
  centerName: string;

  @ApiProperty({
    description: 'Total number of branches',
    example: 5,
  })
  @Expose()
  totalBranches: number;

  @ApiProperty({
    description: 'Total number of teachers',
    example: 20,
  })
  @Expose()
  totalTeachers: number;

  @ApiProperty({
    description: 'Total number of students',
    example: 150,
  })
  @Expose()
  totalStudents: number;

  @ApiProperty({
    description: 'Total number of chapters created',
    example: 10,
  })
  @Expose()
  totalChapters: number;
}
