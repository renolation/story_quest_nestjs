import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, MaxLength, IsUUID } from 'class-validator';

export class CreateUnitDto {
  @IsNotEmpty()
  @IsUUID()
  chapterId: string;

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
