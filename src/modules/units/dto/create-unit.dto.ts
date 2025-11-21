import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({
    description: 'ID of the parent chapter',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  chapterId: number;

  @ApiProperty({
    description: 'Unit title',
    example: 'Greeting Friends',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Detailed description of the unit content',
    example: 'Learn how to greet friends in different situations',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'URL to the unit thumbnail image',
    example: 'https://storage.example.com/units/greeting-friends.jpg',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'Order index for unit sorting within the chapter',
    example: 1,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  orderIndex: number;

  @ApiProperty({
    description: 'Whether the unit is active and visible to students',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
