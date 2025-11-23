import {
  IsNotEmpty,
  IsInt,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsDateString,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionStatus } from '../entities/center-subscription.entity';

/**
 * DTO for creating a new subscription
 * CENTER purchases a package, AGENCY can create for any center
 */
export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Center ID (AGENCY specifies, CENTER uses own ID)',
    example: 1,
  })
  @IsNotEmpty({ message: 'Center ID is required' })
  @IsInt({ message: 'Center ID must be an integer' })
  centerId: number;

  @ApiProperty({
    description: 'Service package ID to subscribe to',
    example: 1,
  })
  @IsNotEmpty({ message: 'Package ID is required' })
  @IsInt({ message: 'Package ID must be an integer' })
  packageId: number;

  @ApiPropertyOptional({
    description: 'Subscription start date (defaults to now)',
    example: '2025-01-22T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO 8601 date string' })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Subscription expiry date (calculated based on billing period if not provided)',
    example: '2026-01-22T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expiry date must be a valid ISO 8601 date string' })
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Enable auto-renewal',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Auto renew must be a boolean' })
  autoRenew?: boolean;

  @ApiPropertyOptional({
    description: 'Subscription status (AGENCY can override)',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus, { message: 'Invalid subscription status' })
  status?: SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Offer code to apply (discount)',
    example: 'LAUNCH2025',
  })
  @IsOptional()
  @IsString()
  offerCode?: string;
}
