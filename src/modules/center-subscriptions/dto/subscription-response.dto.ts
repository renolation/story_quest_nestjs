import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { SubscriptionStatus } from '../entities/center-subscription.entity';

/**
 * Nested center information in subscription response
 */
class CenterInfoDto {
  @ApiProperty({ description: 'Center ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Center name', example: 'ABC English Center' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: 'Center email', example: 'contact@abcenglish.com' })
  @Expose()
  email: string | null;
}

/**
 * Nested package information in subscription response
 */
class PackageInfoDto {
  @ApiProperty({ description: 'Package ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Package name', example: 'Pro Plan' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ description: 'Max students', example: 500 })
  @Expose()
  maxStudents: number | null;

  @ApiPropertyOptional({ description: 'Max branches', example: 5 })
  @Expose()
  maxBranches: number | null;

  @ApiPropertyOptional({ description: 'Max teachers', example: 20 })
  @Expose()
  maxTeachers: number | null;
}

/**
 * Subscription response DTO with all subscription information
 */
export class SubscriptionResponseDto {
  @ApiProperty({ description: 'Subscription ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Center ID', example: 1 })
  @Expose()
  centerId: number;

  @ApiPropertyOptional({
    description: 'Center information',
    type: CenterInfoDto,
  })
  @Expose()
  @Type(() => CenterInfoDto)
  center?: CenterInfoDto;

  @ApiProperty({ description: 'Package ID', example: 1 })
  @Expose()
  packageId: number;

  @ApiPropertyOptional({
    description: 'Package information',
    type: PackageInfoDto,
  })
  @Expose()
  @Type(() => PackageInfoDto)
  package?: PackageInfoDto;

  @ApiProperty({
    description: 'Subscription start date',
    example: '2025-01-22T00:00:00Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  startDate: string;

  @ApiProperty({
    description: 'Subscription expiry date',
    example: '2026-01-22T00:00:00Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  expiryDate: string;

  @ApiProperty({
    description: 'Auto-renewal enabled',
    example: true,
  })
  @Expose()
  autoRenew: boolean;

  @ApiProperty({
    description: 'Subscription status',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  @Expose()
  status: SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Days remaining until expiry',
    example: 365,
  })
  @Expose()
  daysRemaining?: number;

  @ApiPropertyOptional({
    description: 'Whether subscription is expired',
    example: false,
  })
  @Expose()
  isExpired?: boolean;

  @ApiProperty({
    description: 'Subscription creation timestamp',
    example: '2025-01-22T00:00:00Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  createdAt: string;

  @ApiProperty({
    description: 'Subscription last update timestamp',
    example: '2025-01-22T00:00:00Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  updatedAt: string;
}

/**
 * Paginated subscriptions response
 */
export class PaginatedSubscriptionsResponseDto {
  @ApiProperty({
    description: 'Array of subscriptions',
    type: [SubscriptionResponseDto],
  })
  @Expose()
  @Type(() => SubscriptionResponseDto)
  data: SubscriptionResponseDto[];

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
