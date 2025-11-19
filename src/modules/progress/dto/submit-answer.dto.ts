import { IsInt, IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({
    description: 'Attempt ID',
    example: 1,
  })
  @IsInt()
  attemptId: number;

  @ApiProperty({
    description: 'Question ID',
    example: 1,
  })
  @IsInt()
  questionId: number;

  @ApiProperty({
    description: 'Selected option ID (for multiple choice)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  selectedOptionId?: number;

  @ApiProperty({
    description: 'Text answer (for fill in blank, sort words)',
    example: 'Hello',
    required: false,
  })
  @IsOptional()
  @IsString()
  answerText?: string;

  @ApiProperty({
    description: 'Audio URL (for pronunciation)',
    example: 'https://example.com/audio.mp3',
    required: false,
  })
  @IsOptional()
  @IsString()
  answerAudioUrl?: string;

  @ApiProperty({
    description: 'Is the answer correct',
    example: true,
  })
  @IsBoolean()
  isCorrect: boolean;

  @ApiProperty({
    description: 'Points earned for this answer',
    example: 10,
  })
  @IsNumber()
  pointsEarned: number;

  @ApiProperty({
    description: 'Time spent on this question in seconds',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsInt()
  timeSpentSeconds?: number;
}
