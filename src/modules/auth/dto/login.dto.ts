import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email or username for login',
    example: 'student@example.com',
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
