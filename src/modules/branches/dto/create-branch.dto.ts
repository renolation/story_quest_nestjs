import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsInt,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBranchDto {
  @ApiProperty({
    description: 'Center ID to which this branch belongs',
    example: 1,
  })
  @IsNotEmpty({ message: 'Center ID is required' })
  @IsInt({ message: 'Center ID must be an integer' })
  @Type(() => Number)
  centerId: number;

  @ApiProperty({
    description: 'Branch name',
    example: 'District 1 Branch',
    minLength: 3,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Branch name is required' })
  @IsString({ message: 'Branch name must be a string' })
  @MinLength(3, { message: 'Branch name must be at least 3 characters long' })
  @MaxLength(255, { message: 'Branch name cannot exceed 255 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Branch physical address',
    example: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @ApiPropertyOptional({
    description: 'Branch phone number (Vietnamese format)',
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
    description: 'Branch email address',
    example: 'district1@abcenglish.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Whether the branch is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}
