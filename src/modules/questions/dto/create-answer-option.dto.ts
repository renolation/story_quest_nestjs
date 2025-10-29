import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, MaxLength } from 'class-validator';

export class CreateAnswerOptionDto {
  @IsNotEmpty()
  @IsString()
  optionText: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  optionImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  optionAudioUrl?: string;

  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;

  @IsNotEmpty()
  @IsInt()
  orderIndex: number;
}
