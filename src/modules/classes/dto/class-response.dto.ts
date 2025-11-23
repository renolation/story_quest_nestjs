import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * Branch Response (minimal for class response)
 */
export class BranchMinimalResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 'Downtown Branch' })
  name: string;

  @Expose()
  @ApiProperty({ example: '123 Main St' })
  address: string;
}

/**
 * Grade Response (minimal for class response)
 */
export class GradeMinimalResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 3 })
  gradeLevel: number;

  @Expose()
  @ApiProperty({ example: 'Grade 3' })
  description: string;
}

/**
 * Teacher Response (minimal for class response)
 */
export class TeacherMinimalResponseDto {
  @Expose()
  @ApiProperty({ example: 5 })
  id: number;

  @Expose()
  @ApiProperty({ example: 'John Smith' })
  fullName: string;

  @Expose()
  @ApiProperty({ example: 'john.smith@example.com' })
  email: string;
}

/**
 * Class Response DTO
 *
 * Full class details with branch, grade, and teacher relations.
 */
export class ClassResponseDto {
  @Expose()
  @ApiProperty({ example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ example: 1 })
  branchId: number;

  @Expose()
  @Type(() => BranchMinimalResponseDto)
  @ApiProperty({ type: BranchMinimalResponseDto })
  branch: BranchMinimalResponseDto;

  @Expose()
  @ApiProperty({ example: 1 })
  gradeId: number;

  @Expose()
  @Type(() => GradeMinimalResponseDto)
  @ApiProperty({ type: GradeMinimalResponseDto })
  grade: GradeMinimalResponseDto;

  @Expose()
  @ApiProperty({ example: 'Grade 3A - Morning Class' })
  name: string;

  @Expose()
  @ApiProperty({ example: 5, nullable: true })
  teacherId: number;

  @Expose()
  @Type(() => TeacherMinimalResponseDto)
  @ApiProperty({ type: TeacherMinimalResponseDto, nullable: true })
  teacher: TeacherMinimalResponseDto;

  @Expose()
  @ApiProperty({ example: 30 })
  maxStudents: number;

  @Expose()
  @ApiProperty({ example: true })
  isActive: boolean;

  @Expose()
  @ApiProperty({ example: '2025-01-15T10:00:00Z' })
  createdAt: string;

  @Expose()
  @ApiProperty({ example: '2025-01-15T10:00:00Z' })
  updatedAt: string;

  @Expose()
  @ApiProperty({ example: 15, description: 'Current number of enrolled students' })
  enrolledCount?: number;
}

/**
 * Paginated Classes Response DTO
 */
export class PaginatedClassesResponseDto {
  @ApiProperty({ type: [ClassResponseDto] })
  data: ClassResponseDto[];

  @ApiProperty({
    example: {
      page: 1,
      limit: 20,
      total: 50,
      totalPages: 3,
    },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
