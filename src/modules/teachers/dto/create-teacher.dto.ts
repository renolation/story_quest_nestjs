import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsInt,
  IsOptional,
  IsDateString,
} from 'class-validator';

/**
 * Create Teacher DTO
 *
 * Role-based behavior:
 * - AGENCY: Must provide centerId (can create teacher for any center)
 * - CENTER: centerId is auto-filled from authenticated user's center (cannot specify)
 *
 * Process:
 * 1. Create user account with TEACHER role
 * 2. Create teacher profile linked to user
 * 3. Assign to specified center
 */
export class CreateTeacherDto {
  @ApiProperty({
    description: 'Teacher email address',
    example: 'teacher@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Teacher username for login',
    example: 'john_teacher',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: 'Teacher password',
    example: 'SecurePass123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Teacher full name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({
    description:
      'Center ID (REQUIRED for AGENCY, AUTO-FILLED for CENTER based on their center)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  centerId?: number;

  @ApiPropertyOptional({
    description: 'Branch ID (optional)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  branchId?: number;

  @ApiPropertyOptional({
    description: 'Employee ID (optional, internal tracking)',
    example: 'EMP-001',
  })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'Teacher specialization (e.g., "Grammar", "Speaking", "Kids English")',
    example: 'Speaking & Pronunciation',
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Teacher bio/description',
    example: '5 years of teaching experience with children',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Hire date (ISO 8601 format)',
    example: '2025-01-15',
  })
  @IsOptional()
  @IsDateString()
  hireDate?: string;
}
