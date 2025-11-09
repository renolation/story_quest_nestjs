import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../../../common/decorators/match.decorator';

/**
 * DTO for changing user password
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password for verification',
    example: 'OldPassword123!',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'NewPassword123!',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password (must match newPassword)',
    example: 'NewPassword123!',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @IsString()
  @MinLength(6, {
    message: 'Confirm password must be at least 6 characters long',
  })
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword: string;
}
