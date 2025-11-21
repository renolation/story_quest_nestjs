import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerOptionDto {
  @ApiProperty({
    description: 'Answer option text',
    example: 'Hello',
  })
  @IsNotEmpty()
  @IsString()
  optionText: string;

  @ApiProperty({
    description: 'URL to the answer option image',
    example: 'https://storage.example.com/answers/hello.jpg',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  optionImageUrl?: string;

  @ApiProperty({
    description: 'URL to the answer option audio',
    example: 'https://storage.example.com/audio/hello.mp3',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  optionAudioUrl?: string;

  @ApiProperty({
    description: 'Whether this option is the correct answer',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;

  @ApiProperty({
    description: 'Order index for displaying answer options',
    example: 1,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  orderIndex: number;
}
