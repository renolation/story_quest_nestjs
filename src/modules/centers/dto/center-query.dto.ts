import {
  IsOptional,
  IsEnum,
  IsInt,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CenterStatus } from '../entities/center.entity';

/**
 * Query parameters for filtering and pagination of centers list
 */
export class CenterQueryDto {
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
    enum: ['id', 'name', 'email', 'status', 'createdAt', 'updatedAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString({ message: 'Order by must be a string' })
  @IsEnum(['id', 'name', 'email', 'status', 'createdAt', 'updatedAt'], {
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
    description: 'Filter by center status',
    enum: CenterStatus,
    example: CenterStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CenterStatus, {
    message: `Status must be one of: ${Object.values(CenterStatus).join(', ')}`,
  })
  status?: CenterStatus;

  @ApiPropertyOptional({
    description: 'Filter by agency ID (for AGENCY role to view centers they manage)',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Agency ID must be an integer' })
  @Type(() => Number)
  agencyId?: number;

  @ApiPropertyOptional({
    description: 'Search query (searches in name and email)',
    example: 'ABC English',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  @MaxLength(255, { message: 'Search query cannot exceed 255 characters' })
  search?: string;
}
