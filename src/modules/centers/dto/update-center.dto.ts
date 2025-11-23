import { PartialType } from '@nestjs/swagger';
import { CreateCenterDto } from './create-center.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CenterStatus } from '../entities/center.entity';

export class UpdateCenterDto extends PartialType(CreateCenterDto) {
  @ApiPropertyOptional({
    description: 'Center status',
    enum: CenterStatus,
    example: CenterStatus.ACTIVE,
    default: CenterStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CenterStatus, {
    message: `Status must be one of: ${Object.values(CenterStatus).join(', ')}`,
  })
  status?: CenterStatus;
}
