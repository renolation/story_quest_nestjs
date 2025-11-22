import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { AgencyStatus } from '../entities/agency.entity';

/**
 * Agency response DTO with all agency information
 */
export class AgencyResponseDto {
  @ApiProperty({ description: 'Agency ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Agency name', example: 'Story Quest Global' })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Agency email',
    example: 'admin@storyquest.com',
  })
  @Expose()
  email: string;

  @ApiPropertyOptional({
    description: 'Agency phone number',
    example: '0901234567',
  })
  @Expose()
  phone: string | null;

  @ApiPropertyOptional({
    description: 'Agency address',
    example: '123 Main Street, Hanoi, Vietnam',
  })
  @Expose()
  address: string | null;

  @ApiPropertyOptional({
    description: 'Agency logo URL',
    example: 'https://example.com/logos/storyquest.png',
  })
  @Expose()
  logoUrl: string | null;

  @ApiPropertyOptional({
    description: 'Agency description',
    example: 'Leading English education provider in Vietnam',
  })
  @Expose()
  description: string | null;

  @ApiProperty({
    description: 'Agency status',
    enum: AgencyStatus,
    example: AgencyStatus.ACTIVE,
  })
  @Expose()
  status: AgencyStatus;

  @ApiPropertyOptional({
    description: 'Number of centers managed by this agency',
    example: 15,
  })
  @Expose()
  centersCount?: number;

  @ApiProperty({
    description: 'Agency creation timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  createdAt: string;

  @ApiProperty({
    description: 'Agency last update timestamp',
    example: '2025-01-20T14:45:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  updatedAt: string;
}

/**
 * Paginated agencies response
 */
export class PaginatedAgenciesResponseDto {
  @ApiProperty({
    description: 'Array of agencies',
    type: [AgencyResponseDto],
  })
  @Expose()
  @Type(() => AgencyResponseDto)
  data: AgencyResponseDto[];

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
