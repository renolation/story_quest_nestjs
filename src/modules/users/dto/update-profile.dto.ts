import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User email address',
    example: 'newemail@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Username for login',
    example: 'newusername123',
    minLength: 3,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  username?: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Smith',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/new-avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
