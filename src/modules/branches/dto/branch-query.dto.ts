import {
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

/**
 * Query parameters for filtering and pagination of branches list
 */
export class BranchQueryDto {
  // Pagination
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Type(() => Number)
  limit?: number = 20;

  // Sorting
  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
    enum: ['id', 'name', 'centerId', 'isActive', 'createdAt', 'updatedAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString({ message: 'Order by must be a string' })
  @IsEnum(['id', 'name', 'centerId', 'isActive', 'createdAt', 'updatedAt'], {
    message: 'Invalid order by field',
  })
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: 'Order must be either ASC or DESC',
  })
  order?: 'ASC' | 'DESC' = 'DESC';

  // Filtering
  @ApiPropertyOptional({
    description: 'Filter by center ID',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Center ID must be an integer' })
  @Type(() => Number)
  centerId?: number;

  @ApiPropertyOptional({
    description: 'Filter by branch active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Search query (searches in branch name and address)',
    example: 'District 1',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  @MaxLength(255, { message: 'Search query cannot exceed 255 characters' })
  search?: string;
}
