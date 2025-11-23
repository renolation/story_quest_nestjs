import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

/**
 * Service Package response DTO with all package information
 */
export class ServicePackageResponseDto {
  @ApiProperty({ description: 'Package ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Package name', example: 'Pro Plan' })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Package description',
    example: 'Perfect for growing centers with multiple branches',
  })
  @Expose()
  description: string | null;

  @ApiPropertyOptional({
    description: 'Package features (JSON object)',
    example: {
      customBranding: true,
      prioritySupport: true,
      advancedAnalytics: true,
    },
  })
  @Expose()
  features: Record<string, any> | null;

  @ApiPropertyOptional({
    description: 'Maximum students allowed',
    example: 500,
  })
  @Expose()
  maxStudents: number | null;

  @ApiPropertyOptional({
    description: 'Maximum branches allowed',
    example: 5,
  })
  @Expose()
  maxBranches: number | null;

  @ApiPropertyOptional({
    description: 'Maximum teachers allowed',
    example: 20,
  })
  @Expose()
  maxTeachers: number | null;

  @ApiPropertyOptional({
    description: 'Monthly price (USD)',
    example: 99.99,
  })
  @Expose()
  priceMonthly: number | null;

  @ApiPropertyOptional({
    description: 'Yearly price (USD)',
    example: 999.99,
  })
  @Expose()
  priceYearly: number | null;

  @ApiProperty({
    description: 'Number of trial days',
    example: 14,
  })
  @Expose()
  trialDays: number;

  @ApiProperty({
    description: 'Whether package is active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Number of active subscriptions using this package',
    example: 12,
  })
  @Expose()
  subscriptionsCount?: number;

  @ApiProperty({
    description: 'Package creation timestamp',
    example: '2025-01-22T00:00:00Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  createdAt: string;

  @ApiProperty({
    description: 'Package last update timestamp',
    example: '2025-01-22T00:00:00Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  updatedAt: string;
}

/**
 * Paginated service packages response
 */
export class PaginatedServicePackagesResponseDto {
  @ApiProperty({
    description: 'Array of service packages',
    type: [ServicePackageResponseDto],
  })
  @Expose()
  @Type(() => ServicePackageResponseDto)
  data: ServicePackageResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 20,
      total: 5,
      totalPages: 1,
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
