import { PartialType } from '@nestjs/swagger';
import { CreateBranchDto } from './create-branch.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBranchDto extends PartialType(CreateBranchDto) {
  @ApiPropertyOptional({
    description: 'Branch active status',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
