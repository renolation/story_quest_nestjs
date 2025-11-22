import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  MaxLength,
  IsUrl,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new agency (super admin organization)
 */
export class CreateAgencyDto {
  @ApiProperty({
    description: 'Agency name',
    example: 'Story Quest Global',
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Agency name is required' })
  @IsString({ message: 'Agency name must be a string' })
  @MinLength(3, { message: 'Agency name must be at least 3 characters long' })
  @MaxLength(255, { message: 'Agency name cannot exceed 255 characters' })
  name: string;

  @ApiProperty({
    description: 'Agency email address (must be unique)',
    example: 'admin@storyquest.com',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  email: string;

  @ApiPropertyOptional({
    description: 'Agency phone number (Vietnamese format)',
    example: '0901234567',
    pattern: '^(0|\\+84)(\\s|\\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\\d)(\\s|\\.)?(\\d{3})(\\s|\\.)?(\\d{3})$',
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/, {
    message: 'Invalid Vietnamese phone number format',
  })
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Agency physical address',
    example: '123 Main Street, Hanoi, Vietnam',
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @ApiPropertyOptional({
    description: 'Agency logo URL',
    example: 'https://example.com/logos/storyquest.png',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid logo URL format' })
  @MaxLength(500, { message: 'Logo URL cannot exceed 500 characters' })
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Agency description or mission statement',
    example: 'Leading English education provider in Vietnam',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
