import { PartialType } from '@nestjs/swagger';
import { CreateOfferDto } from './create-offer.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OfferStatus } from '../entities/offer.entity';

/**
 * DTO for updating an offer
 * Only AGENCY role can update offers
 */
export class UpdateOfferDto extends PartialType(CreateOfferDto) {
  @ApiPropertyOptional({
    description: 'Offer status',
    enum: OfferStatus,
    example: OfferStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}
