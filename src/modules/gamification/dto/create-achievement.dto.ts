import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AchievementTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export class CreateAchievementDto {
  @ApiProperty({
    description: 'Unique achievement code identifier',
    example: 'first_level_complete',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  code: string;

  @ApiProperty({
    description: 'Achievement title shown to users',
    example: 'First Victory',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Achievement description explaining how to unlock',
    example: 'Complete your first level successfully',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'URL to achievement icon/badge image',
    example: 'https://cdn.example.com/badges/first-victory.png',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  iconUrl?: string;

  @ApiProperty({
    description: 'Points awarded when achievement is unlocked',
    example: 50,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  pointsReward: number;

  @ApiProperty({
    description: 'Achievement tier/rarity level',
    enum: AchievementTier,
    example: AchievementTier.BRONZE,
  })
  @IsNotEmpty()
  @IsEnum(AchievementTier)
  tier: AchievementTier;
}
