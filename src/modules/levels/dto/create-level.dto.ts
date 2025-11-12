import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, MaxLength, Min, Max } from 'class-validator';

export class CreateLevelDto {
  @IsNotEmpty()
  @IsInt()
  unitId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsInt()
  orderIndex: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalPoints?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
