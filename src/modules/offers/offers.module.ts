import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { ServicePackagesModule } from '../service-packages/service-packages.module';
import { CenterSubscription } from '../center-subscriptions/entities/center-subscription.entity';

/**
 * PHASE 2 - OFFERS MODULE - ✅ IMPLEMENTED
 *
 * Manages promotional offers and discount codes.
 *
 * Features implemented:
 * - AGENCY creates discount codes (percentage or fixed amount)
 * - Offer validity periods (start/end dates)
 * - Usage limits (total + per-center)
 * - Package-specific or all-packages offers
 * - Offer validation before purchase
 * - Automatic usage tracking
 * - Status management (active/inactive/expired)
 *
 * Business Flow:
 * 1. AGENCY creates offer with code, discount, validity, limits
 * 2. CENTERS browse available offers
 * 3. CENTER validates offer code when purchasing package
 * 4. System checks: status, dates, usage limits, package applicability
 * 5. If valid, discount is calculated and applied to subscription
 * 6. Offer usage count is incremented
 *
 * Access Control:
 * - AGENCY role: Full CRUD on all offers
 * - CENTER role: View active offers, validate offers
 * - Other roles: No access
 *
 * Dependencies:
 * - ServicePackagesModule: To validate package applicability
 * - CenterSubscription entity: To track offer usage
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Offer, CenterSubscription]),
    ServicePackagesModule, // Provides ServicePackage repository and service
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService, TypeOrmModule],
})
export class OffersModule {}
