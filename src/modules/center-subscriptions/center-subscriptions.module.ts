import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CenterSubscription } from './entities/center-subscription.entity';
import { CenterSubscriptionsController } from './center-subscriptions.controller';
import { CenterSubscriptionsService } from './center-subscriptions.service';
import { ServicePackagesModule } from '../service-packages/service-packages.module';
import { CentersModule } from '../centers/centers.module';
import { OffersModule } from '../offers/offers.module';

/**
 * PHASE 2 - CENTER SUBSCRIPTIONS MODULE - ✅ IMPLEMENTED
 *
 * Manages center subscriptions to service packages.
 *
 * Features implemented:
 * - CENTERS purchase service packages
 * - Subscription lifecycle management (create, renew, cancel)
 * - Trial period support
 * - Auto-renewal management
 * - Expiry date calculations
 * - Status tracking (active, trial, expired, cancelled)
 * - Role-based access control
 *
 * Business Flow:
 * 1. AGENCY creates service packages (via ServicePackagesModule)
 * 2. CENTER browses available packages
 * 3. CENTER purchases package → creates subscription
 * 4. Subscription starts (with optional trial period)
 * 5. CENTER can renew or cancel subscription
 * 6. AGENCY has full oversight and control
 *
 * Access Control:
 * - AGENCY role: Full CRUD on all subscriptions
 * - CENTER role: Create own subscription, view/update/cancel own subscriptions only
 * - Other roles: No access
 *
 * Dependencies:
 * - ServicePackagesModule: To validate and fetch package details
 * - CentersModule: To validate center exists
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CenterSubscription]),
    ServicePackagesModule,
    CentersModule,
    forwardRef(() => OffersModule),
  ],
  controllers: [CenterSubscriptionsController],
  providers: [CenterSubscriptionsService],
  exports: [CenterSubscriptionsService],
})
export class CenterSubscriptionsModule {}
