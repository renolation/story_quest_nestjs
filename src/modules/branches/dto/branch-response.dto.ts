import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

/**
 * Nested center information in branch response
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
 * Branch response DTO with all branch information
 */
export class BranchResponseDto {
  @ApiProperty({ description: 'Branch ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Center ID', example: 1 })
  @Expose()
  centerId: number;

  @ApiPropertyOptional({
    description: 'Associated center information',
    type: CenterInfoDto,
  })
  @Expose()
  @Type(() => CenterInfoDto)
  center?: CenterInfoDto | null;

  @ApiProperty({ description: 'Branch name', example: 'District 1 Branch' })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Branch address',
    example: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
  })
  @Expose()
  address: string | null;

  @ApiPropertyOptional({
    description: 'Branch phone number',
    example: '0901234567',
  })
  @Expose()
  phone: string | null;

  @ApiPropertyOptional({
    description: 'Branch email',
    example: 'district1@abcenglish.com',
  })
  @Expose()
  email: string | null;

  @ApiProperty({
    description: 'Branch active status',
    example: true,
    default: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Branch creation timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  createdAt: string;

  @ApiProperty({
    description: 'Branch last update timestamp',
    example: '2025-01-20T14:45:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  updatedAt: string;
}

/**
 * Paginated branches response
 */
export class PaginatedBranchesResponseDto {
  @ApiProperty({
    description: 'Array of branches',
    type: [BranchResponseDto],
  })
  @Expose()
  @Type(() => BranchResponseDto)
  data: BranchResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 20,
      total: 50,
      totalPages: 3,
    },
  })
  @Expose()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
