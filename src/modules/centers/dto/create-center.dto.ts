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
 * DTO for creating a new center with user credentials
 *
 * When a center is created, a corresponding user account is automatically created with:
 * - role: CENTER
 * - username: auto-generated from email (e.g., 'abc_center' from 'admin@abc.com')
 * - password: provided password (hashed with bcrypt)
 * - email: same as center email
 */
export class CreateCenterDto {
  @ApiProperty({
    description: 'Center name',
    example: 'ABC English Center',
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Center name is required' })
  @IsString({ message: 'Center name must be a string' })
  @MinLength(3, { message: 'Center name must be at least 3 characters long' })
  @MaxLength(255, { message: 'Center name cannot exceed 255 characters' })
  name: string;

  @ApiProperty({
    description:
      'Center email address (must be unique, used for login)',
    example: 'admin@abcenglish.com',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  email: string;

  @ApiProperty({
    description:
      'Password for center user account (min 6 characters, will be hashed)',
    example: 'SecurePassword123',
    minLength: 6,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(50, { message: 'Password cannot exceed 50 characters' })
  password: string;

  @ApiPropertyOptional({
    description: 'Center phone number (Vietnamese format)',
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
    description: 'Center physical address',
    example: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @ApiPropertyOptional({
    description: 'Center logo URL',
    example: 'https://example.com/logos/abc-center.png',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid logo URL format' })
  @MaxLength(500, { message: 'Logo URL cannot exceed 500 characters' })
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Business license number or identifier',
    example: 'BL-123456789',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Business license must be a string' })
  @MaxLength(255, { message: 'Business license cannot exceed 255 characters' })
  businessLicense?: string;

}
