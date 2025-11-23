import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

/**
 * DTO for validating an offer code
 * Used by CENTERS before purchasing a subscription
 */
export class ValidateOfferDto {
  @ApiProperty({
    description: 'Offer code to validate',
    example: 'LAUNCH2025',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Package ID to apply offer to',
    example: 1,
  })
  @IsInt()
  packageId: number;

  @ApiProperty({
    description: 'Center ID (optional, defaults to authenticated center)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  centerId?: number;
}

/**
 * Response DTO for offer validation
 */
export class ValidateOfferResponseDto {
  @ApiProperty({ description: 'Whether offer is valid', example: true })
  valid: boolean;

  @ApiProperty({ description: 'Offer code', example: 'LAUNCH2025' })
  code: string;

  @ApiProperty({ description: 'Discount amount', example: 30, required: false })
  discountValue?: number;

  @ApiProperty({
    description: 'Discount type',
    example: 'percentage',
    required: false,
  })
  discountType?: string;

  @ApiProperty({
    description: 'Calculated discount amount',
    example: 29.7,
    required: false,
  })
  calculatedDiscount?: number;

  @ApiProperty({
    description: 'Original price',
    example: 99.0,
    required: false,
  })
  originalPrice?: number;

  @ApiProperty({
    description: 'Final price after discount',
    example: 69.3,
    required: false,
  })
  finalPrice?: number;

  @ApiProperty({
    description: 'Error message if invalid',
    example: 'Offer has expired',
    required: false,
  })
  message?: string;
}
