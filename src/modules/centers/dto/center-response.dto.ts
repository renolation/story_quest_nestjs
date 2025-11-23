import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { CenterStatus } from '../entities/center.entity';

/**
 * Nested agency information in center response
 */
class AgencyInfoDto {
  @ApiProperty({ description: 'Agency ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Agency name', example: 'Story Quest Global' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Agency email', example: 'admin@storyquest.com' })
  @Expose()
  email: string;
}

/**
 * Center response DTO with all center information
 */
export class CenterResponseDto {
  @ApiProperty({ description: 'Center ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Center name', example: 'ABC English Center' })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Center email',
    example: 'contact@abcenglish.com',
  })
  @Expose()
  email: string | null;

  @ApiPropertyOptional({
    description: 'Center phone number',
    example: '0901234567',
  })
  @Expose()
  phone: string | null;

  @ApiPropertyOptional({
    description: 'Center address',
    example: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
  })
  @Expose()
  address: string | null;

  @ApiPropertyOptional({
    description: 'Center logo URL',
    example: 'https://example.com/logos/abc-center.png',
  })
  @Expose()
  logoUrl: string | null;

  @ApiPropertyOptional({
    description: 'Business license number',
    example: 'BL-123456789',
  })
  @Expose()
  businessLicense: string | null;

  @ApiProperty({
    description: 'Center status',
    enum: CenterStatus,
    example: CenterStatus.ACTIVE,
  })
  @Expose()
  status: CenterStatus;

  @ApiPropertyOptional({
    description: 'Associated agency ID',
    example: 1,
  })
  @Expose()
  agencyId: number | null;

  @ApiPropertyOptional({
    description: 'Associated agency information',
    type: AgencyInfoDto,
  })
  @Expose()
  @Type(() => AgencyInfoDto)
  agency?: AgencyInfoDto | null;

  @ApiPropertyOptional({
    description: 'Number of branches in this center',
    example: 5,
  })
  @Expose()
  branchesCount?: number;

  @ApiPropertyOptional({
    description: 'Number of chapters created by this center',
    example: 10,
  })
  @Expose()
  chaptersCount?: number;

  @ApiProperty({
    description: 'Center creation timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  createdAt: string;

  @ApiProperty({
    description: 'Center last update timestamp',
    example: '2025-01-20T14:45:00.000Z',
  })
  @Expose()
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : value))
  updatedAt: string;
}

/**
 * Paginated centers response
 */
export class PaginatedCentersResponseDto {
  @ApiProperty({
    description: 'Array of centers',
    type: [CenterResponseDto],
  })
  @Expose()
  @Type(() => CenterResponseDto)
  data: CenterResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 20,
      total: 50,
      totalPages: 3,
    },
  })
  @Expose()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
