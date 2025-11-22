import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsObject,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new service package
 * Only AGENCY role can create packages
 */
export class CreateServicePackageDto {
  @ApiProperty({
    description: 'Package name',
    example: 'Pro Plan',
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Package name is required' })
  @IsString({ message: 'Package name must be a string' })
  @MinLength(3, { message: 'Package name must be at least 3 characters long' })
  @MaxLength(255, { message: 'Package name cannot exceed 255 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Package description',
    example: 'Perfect for growing centers with multiple branches',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Package features (JSON object)',
    example: {
      customBranding: true,
      prioritySupport: true,
      advancedAnalytics: true,
      aiContentGeneration: false,
    },
  })
  @IsOptional()
  @IsObject({ message: 'Features must be an object' })
  features?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Maximum number of students allowed',
    example: 500,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Max students must be an integer' })
  @Min(1, { message: 'Max students must be at least 1' })
  maxStudents?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of branches allowed',
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Max branches must be an integer' })
  @Min(1, { message: 'Max branches must be at least 1' })
  maxBranches?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of teachers allowed',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Max teachers must be an integer' })
  @Min(1, { message: 'Max teachers must be at least 1' })
  maxTeachers?: number;

  @ApiPropertyOptional({
    description: 'Monthly price (USD)',
    example: 99.99,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price monthly must be a number with max 2 decimal places' })
  @Min(0, { message: 'Price monthly cannot be negative' })
  priceMonthly?: number;

  @ApiPropertyOptional({
    description: 'Yearly price (USD) - usually discounted',
    example: 999.99,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price yearly must be a number with max 2 decimal places' })
  @Min(0, { message: 'Price yearly cannot be negative' })
  priceYearly?: number;

  @ApiPropertyOptional({
    description: 'Number of trial days offered',
    example: 14,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Trial days must be an integer' })
  @Min(0, { message: 'Trial days cannot be negative' })
  trialDays?: number;

  @ApiPropertyOptional({
    description: 'Whether the package is active and available for purchase',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive?: boolean;
}
