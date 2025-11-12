import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, IsEnum, MaxLength, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType, PlacementPosition } from '../../../common/enums';
import { CreateAnswerOptionDto } from './create-answer-option.dto';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsInt()
  levelId: number;

  @IsNotEmpty()
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @IsNotEmpty()
  @IsString()
  questionText: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  questionAudioUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  questionImageUrl?: string;

  @IsOptional()
  @IsEnum(PlacementPosition)
  questionPlace?: PlacementPosition;

  @IsOptional()
  @IsEnum(PlacementPosition)
  answerPlace?: PlacementPosition;

  @IsNotEmpty()
  @IsInt()
  orderIndex: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @IsOptional()
  @IsString()
  hint?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerOptionDto)
  answerOptions?: CreateAnswerOptionDto[];
}
