import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, IsEnum, MaxLength, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionType, PlacementPosition } from '../../../common/enums';
import { CreateAnswerOptionDto } from './create-answer-option.dto';

export class CreateQuestionDto {
  @ApiProperty({
    description: 'ID of the parent level',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  levelId: number;

  @ApiProperty({
    description: 'Type of question',
    enum: QuestionType,
    example: QuestionType.SELECT_RIGHT_ANSWER,
    enumName: 'QuestionType',
  })
  @IsNotEmpty()
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiProperty({
    description: 'The question text or prompt',
    example: 'What is the correct way to say hello?',
  })
  @IsNotEmpty()
  @IsString()
  questionText: string;

  @ApiProperty({
    description: 'URL to the question audio file',
    example: 'https://storage.example.com/audio/question1.mp3',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  questionAudioUrl?: string;

  @ApiProperty({
    description: 'URL to the question image',
    example: 'https://storage.example.com/images/question1.jpg',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  questionImageUrl?: string;

  @ApiProperty({
    description: 'Placement position for the question on screen',
    enum: PlacementPosition,
    example: PlacementPosition.TOP_LEFT,
    enumName: 'PlacementPosition',
    required: false,
  })
  @IsOptional()
  @IsEnum(PlacementPosition)
  questionPlace?: PlacementPosition;

  @ApiProperty({
    description: 'Placement position for the answer area on screen',
    enum: PlacementPosition,
    example: PlacementPosition.BOTTOM_RIGHT,
    enumName: 'PlacementPosition',
    required: false,
  })
  @IsOptional()
  @IsEnum(PlacementPosition)
  answerPlace?: PlacementPosition;

  @ApiProperty({
    description: 'Order index for question sorting within the level',
    example: 1,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  orderIndex: number;

  @ApiProperty({
    description: 'Points awarded for correct answer',
    example: 10,
    minimum: 1,
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @ApiProperty({
    description: 'Hint text to help students',
    example: 'Think about friendly greetings',
    required: false,
  })
  @IsOptional()
  @IsString()
  hint?: string;

  @ApiProperty({
    description: 'Explanation shown after answer is submitted',
    example: 'Hello is the most common greeting in English',
    required: false,
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({
    description: 'Whether the question is active and visible to students',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Array of answer options for this question',
    type: [CreateAnswerOptionDto],
    example: [
      { optionText: 'Hello', isCorrect: true, orderIndex: 1 },
      { optionText: 'Goodbye', isCorrect: false, orderIndex: 2 },
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerOptionDto)
  answerOptions?: CreateAnswerOptionDto[];
}
