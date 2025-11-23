import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { TeacherStatus } from '../entities/teacher.entity';

/**
 * Nested User Info DTO
 */
class UserInfoDto {
  @ApiProperty({ description: 'User ID', example: 5 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Email', example: 'teacher@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Username', example: 'john_teacher' })
  @Expose()
  username: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @Expose()
  fullName: string;

  @ApiProperty({ description: 'Role', example: 'teacher' })
  @Expose()
  role: string;
}

/**
 * Nested Center Info DTO
 */
class CenterInfoDto {
  @ApiProperty({ description: 'Center ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Center name', example: 'ABC English Center' })
  @Expose()
  name: string;
}

/**
 * Nested Branch Info DTO
 */
class BranchInfoDto {
  @ApiProperty({ description: 'Branch ID', example: 2 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Branch name', example: 'Downtown Branch' })
  @Expose()
  name: string;
}

/**
 * Teacher Response DTO
 *
 * Returns teacher information with nested user, center, and branch details.
 */
export class TeacherResponseDto {
  @ApiProperty({ description: 'Teacher ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'User ID', example: 5 })
  @Expose()
  userId: number;

  @ApiProperty({ description: 'User information', type: UserInfoDto })
  @Expose()
  @Type(() => UserInfoDto)
  @Transform(({ obj }) => {
    if (obj.user) {
      return {
        id: obj.user.id,
        email: obj.user.email,
        username: obj.user.username,
        fullName: obj.user.fullName,
        role: obj.user.role,
      };
    }
    return undefined;
  })
  user?: UserInfoDto;

  @ApiProperty({ description: 'Center ID', example: 1 })
  @Expose()
  centerId: number;

  @ApiPropertyOptional({
    description: 'Center information',
    type: CenterInfoDto,
  })
  @Expose()
  @Type(() => CenterInfoDto)
  @Transform(({ obj }) => {
    if (obj.center) {
      return {
        id: obj.center.id,
        name: obj.center.name,
      };
    }
    return undefined;
  })
  center?: CenterInfoDto;

  @ApiPropertyOptional({ description: 'Branch ID', example: 2 })
  @Expose()
  branchId: number | null;

  @ApiPropertyOptional({
    description: 'Branch information',
    type: BranchInfoDto,
  })
  @Expose()
  @Type(() => BranchInfoDto)
  @Transform(({ obj }) => {
    if (obj.branch) {
      return {
        id: obj.branch.id,
        name: obj.branch.name,
      };
    }
    return null;
  })
  branch?: BranchInfoDto | null;

  @ApiPropertyOptional({ description: 'Employee ID', example: 'EMP-001' })
  @Expose()
  employeeId: string | null;

  @ApiPropertyOptional({
    description: 'Specialization',
    example: 'Speaking & Pronunciation',
  })
  @Expose()
  specialization: string | null;

  @ApiPropertyOptional({
    description: 'Bio',
    example: '5 years of teaching experience',
  })
  @Expose()
  bio: string | null;

  @ApiPropertyOptional({ description: 'Hire date', example: '2025-01-15' })
  @Expose()
  @Transform(({ value }) => (value ? value.toISOString().split('T')[0] : null))
  hireDate: string | null;

  @ApiProperty({ description: 'Status', enum: TeacherStatus, example: 'active' })
  @Expose()
  status: TeacherStatus;

  @ApiProperty({
    description: 'Created at',
    example: '2025-11-22T10:30:00.000Z',
  })
  @Expose()
  createdAt: string;

  @ApiProperty({
    description: 'Updated at',
    example: '2025-11-22T10:30:00.000Z',
  })
  @Expose()
  updatedAt: string;
}

/**
 * Paginated Teachers Response DTO
 */
export class PaginatedTeachersResponseDto {
  @ApiProperty({ description: 'Teachers data', type: [TeacherResponseDto] })
  data: TeacherResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
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
