import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { DiscountType, OfferStatus } from '../entities/offer.entity';

/**
 * Nested package information in offer response
 */
class PackageInfoDto {
  @ApiProperty({ description: 'Package ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Package name', example: 'Pro Plan' })
  @Expose()
  name: string;
}

/**
 * Offer response DTO with all offer information
 */
export class OfferResponseDto {
  @ApiProperty({ description: 'Offer ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Offer code', example: 'LAUNCH2025' })
  @Expose()
  code: string;

  @ApiProperty({ description: 'Offer name', example: 'Launch Promotion 2025' })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Offer description',
    example: 'Get 30% off your first subscription!',
  })
  @Expose()
  description: string | null;

  @ApiProperty({
    description: 'Discount type',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @Expose()
  discountType: DiscountType;

  @ApiProperty({ description: 'Discount value', example: 30 })
  @Expose()
  discountValue: number;

  @ApiPropertyOptional({ description: 'Package ID', example: 1 })
  @Expose()
  packageId: number | null;

  @ApiPropertyOptional({
    description: 'Package information',
    type: PackageInfoDto,
  })
  @Expose()
  @Type(() => PackageInfoDto)
  package?: PackageInfoDto;

  @ApiProperty({
    description: 'Offer validity start date',
    example: '2025-01-22T00:00:00Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  validFrom: string;

  @ApiProperty({
    description: 'Offer validity end date',
    example: '2025-12-31T23:59:59Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  validUntil: string;

  @ApiPropertyOptional({
    description: 'Maximum total uses',
    example: 100,
  })
  @Expose()
  maxUses: number | null;

  @ApiPropertyOptional({
    description: 'Maximum uses per center',
    example: 1,
  })
  @Expose()
  maxUsesPerCenter: number | null;

  @ApiProperty({ description: 'Current number of uses', example: 45 })
  @Expose()
  currentUses: number;

  @ApiProperty({
    description: 'Offer status',
    enum: OfferStatus,
    example: OfferStatus.ACTIVE,
  })
  @Expose()
  status: OfferStatus;

  @ApiPropertyOptional({
    description: 'Whether offer is currently valid (based on dates)',
    example: true,
  })
  @Expose()
  isValid?: boolean;

  @ApiPropertyOptional({
    description: 'Remaining uses available',
    example: 55,
  })
  @Expose()
  remainingUses?: number | null;

  @ApiProperty({
    description: 'Offer creation timestamp',
    example: '2025-01-22T00:00:00Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  createdAt: string;

  @ApiProperty({
    description: 'Offer last update timestamp',
    example: '2025-01-22T00:00:00Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  updatedAt: string;
}

/**
 * Paginated offers response
 */
export class PaginatedOffersResponseDto {
  @ApiProperty({
    description: 'Array of offers',
    type: [OfferResponseDto],
  })
  @Expose()
  @Type(() => OfferResponseDto)
  data: OfferResponseDto[];

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
