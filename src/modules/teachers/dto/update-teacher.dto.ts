import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsDateString, IsEnum } from 'class-validator';
import { TeacherStatus } from '../entities/teacher.entity';

/**
 * Update Teacher DTO
 *
 * All fields are optional for partial updates.
 * Cannot change: user_id, center_id (these are set on creation)
 */
export class UpdateTeacherDto {
  @ApiPropertyOptional({
    description: 'Branch ID',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  branchId?: number;

  @ApiPropertyOptional({
    description: 'Employee ID',
    example: 'EMP-002',
  })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'Teacher specialization',
    example: 'Grammar & Writing',
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Teacher bio',
    example: 'Updated bio with new achievements',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Hire date',
    example: '2025-02-01',
  })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional({
    description: 'Teacher status',
    enum: TeacherStatus,
    example: TeacherStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(TeacherStatus)
  status?: TeacherStatus;
}
