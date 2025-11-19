import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Giftcode } from './entities/giftcode.entity';
import { GiftcodeUsage } from './entities/giftcode-usage.entity';

/**
 * PHASE 7 - GIFTCODES MODULE - TODO
 *
 * Manages trial codes, discount codes, and access management.
 *
 * Features to implement:
 * - Create/generate giftcodes
 * - Validate giftcode redemption
 * - Track giftcode usage
 * - Manage expiration and max uses
 * - Bulk code generation
 * - Usage analytics
 *
 * Business Logic:
 * - Prevent duplicate redemption
 * - Validate expiration dates
 * - Check max uses limit
 * - Grant access duration to students
 *
 * Access Control:
 * - AGENCY role: Full access to all giftcodes
 * - CENTER role: CRUD on own center's giftcodes only
 */
@Module({
  imports: [TypeOrmModule.forFeature([Giftcode, GiftcodeUsage])],
  controllers: [],
  providers: [],
  exports: [],
})
export class GiftcodesModule {}
