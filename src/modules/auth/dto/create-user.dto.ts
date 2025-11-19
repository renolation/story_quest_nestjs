import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

/**
 * DTO for creating users (admin-only endpoint)
 *
 * AGENCY can create: CENTER, TEACHER, REVIEWER, STUDENT
 * CENTER can create: TEACHER, STUDENT (for their center)
 *
 * No public self-registration - all users created by admins
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Username for login',
    example: 'user123',
    minLength: 3,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({
    description: 'User role (AGENCY role cannot be created via this endpoint for security)',
    enum: UserRole,
    example: UserRole.STUDENT,
  })
  @IsNotEmpty()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role: UserRole;

  @ApiProperty({
    description: 'Avatar URL (optional)',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
