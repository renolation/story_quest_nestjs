import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, MaxLength } from 'class-validator';

export class CreateChapterDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnailUrl?: string;

  @IsNotEmpty()
  @IsInt()
  orderIndex: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
