import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { DiscountType } from '../entities/offer.entity';

/**
 * DTO for creating a new offer
 * Only AGENCY role can create offers
 */
export class CreateOfferDto {
  @ApiProperty({
    description: 'Unique offer code (case-insensitive)',
    example: 'LAUNCH2025',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  code: string;

  @ApiProperty({
    description: 'Offer name/title',
    example: 'Launch Promotion 2025',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Offer description',
    example: 'Get 30% off your first subscription purchase!',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Discount type',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    description:
      'Discount value (0-100 for percentage, dollar amount for fixed)',
    example: 30,
  })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({
    description:
      'Specific package ID this offer applies to (null = all packages)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  packageId?: number;

  @ApiProperty({
    description: 'Offer validity start date (ISO 8601)',
    example: '2025-01-22T00:00:00Z',
  })
  @IsDateString()
  validFrom: string;

  @ApiProperty({
    description: 'Offer validity end date (ISO 8601)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  validUntil: string;

  @ApiPropertyOptional({
    description: 'Maximum total uses (null = unlimited)',
    example: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @ApiPropertyOptional({
    description: 'Maximum uses per center (null = unlimited per center)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsesPerCenter?: number;
}
