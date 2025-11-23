import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/**
 * Create Class DTO
 *
 * Role-based creation logic:
 * - AGENCY: Must specify branchId (can create for any branch)
 * - CENTER: Must specify branchId (only for own center's branches)
 */
export class CreateClassDto {
  @ApiProperty({
    description: 'Branch ID where the class is located',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  branchId: number;

  @ApiProperty({
    description: 'Grade ID for the class (3, 4, or 5)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  gradeId: number;

  @ApiProperty({
    description: 'Class name',
    example: 'Grade 3A - Morning Class',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Teacher ID assigned to this class',
    example: 5,
  })
  @IsInt()
  @IsOptional()
  teacherId?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of students allowed in the class',
    example: 30,
    default: 30,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxStudents?: number;
}
