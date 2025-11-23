import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateGradeDto {
  @ApiProperty({
    description: 'Grade level (3, 4, or 5)',
    example: 3,
    minimum: 3,
    maximum: 5,
  })
  @IsInt()
  @Min(3)
  @Max(5)
  gradeLevel: number;

  @ApiProperty({
    description: 'Description of the grade level',
    example: 'Grade 3 - Ages 8-9',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
