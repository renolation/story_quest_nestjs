import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLevelDto {
  @ApiProperty({
    description: 'ID of the parent unit',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  unitId: number;

  @ApiProperty({
    description: 'Level title',
    example: 'Practice Hello',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Detailed description of the level content and learning objectives',
    example: 'Practice saying hello and introducing yourself with interactive exercises',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Order index for level sorting within the unit',
    example: 1,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  orderIndex: number;

  @ApiProperty({
    description: 'Time limit for completing the level in seconds',
    example: 300,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitSeconds?: number;

  @ApiProperty({
    description: 'Minimum score percentage (0-100) required to pass the level',
    example: 70,
    minimum: 0,
    maximum: 100,
    default: 70,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @ApiProperty({
    description: 'Total points available for this level (sum of all question points)',
    example: 100,
    minimum: 1,
    default: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalPoints?: number;

  @ApiProperty({
    description: 'Whether the level is active and visible to students',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
