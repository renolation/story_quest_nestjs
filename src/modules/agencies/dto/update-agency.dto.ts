import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAgencyDto } from './create-agency.dto';
import { AgencyStatus } from '../entities/agency.entity';
import { IsOptional, IsEnum } from 'class-validator';

/**
 * DTO for updating an existing agency
 * All fields are optional (inherited from CreateAgencyDto via PartialType)
 */
export class UpdateAgencyDto extends PartialType(CreateAgencyDto) {
  @ApiPropertyOptional({
    description: 'Agency status',
    enum: AgencyStatus,
    example: AgencyStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AgencyStatus, { message: 'Invalid agency status' })
  status?: AgencyStatus;
}
