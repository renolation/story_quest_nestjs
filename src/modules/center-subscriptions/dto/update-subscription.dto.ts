import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSubscriptionDto } from './create-subscription.dto';

/**
 * DTO for updating an existing subscription
 * Cannot change centerId or packageId after creation
 */
export class UpdateSubscriptionDto extends PartialType(
  OmitType(CreateSubscriptionDto, ['centerId', 'packageId'] as const),
) {}
