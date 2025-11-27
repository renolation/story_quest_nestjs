import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChapterDto {
  @ApiProperty({
    description: 'Chapter title',
    example: 'Greetings & Introductions',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Chapter description',
    example: 'Learn basic greetings and how to introduce yourself',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Chapter thumbnail image URL',
    example: 'https://example.com/images/chapter1.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'Order index for chapter sorting (must be unique)',
    example: 1,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  orderIndex: number;

  @ApiPropertyOptional({
    description: 'Whether the chapter is active/visible',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Center ID for organization-specific chapters. Null for public chapters (AGENCY only)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  centerId?: number | null;

  @ApiPropertyOptional({
    description: 'Whether the chapter is public (available to all students). Only AGENCY can create public chapters',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
