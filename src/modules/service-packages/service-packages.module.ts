import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicePackage } from './entities/service-package.entity';
import { ServicePackagesController } from './service-packages.controller';
import { ServicePackagesService } from './service-packages.service';

/**
 * PHASE 2 - SERVICE PACKAGES MODULE - ✅ IMPLEMENTED
 *
 * Manages subscription packages/plans that AGENCY creates for CENTERS.
 *
 * Features implemented:
 * - CRUD operations for service packages
 * - Package pricing (monthly/yearly)
 * - Resource limits (students, branches, teachers)
 * - Features stored as JSONB for flexibility
 * - Active/inactive status management
 * - Role-based access control (AGENCY: full CRUD, others: read active only)
 *
 * Business Flow:
 * 1. AGENCY creates packages with different tiers (Basic, Pro, Enterprise)
 * 2. Each package defines limits and pricing
 * 3. CENTERS browse active packages
 * 4. CENTERS purchase packages (handled by subscriptions module)
 *
 * Access Control:
 * - AGENCY role: Full CRUD access to all packages
 * - CENTER/TEACHER/REVIEWER roles: Read access to active packages only
 * - STUDENT role: No access
 */
@Module({
  imports: [TypeOrmModule.forFeature([ServicePackage])],
  controllers: [ServicePackagesController],
  providers: [ServicePackagesService],
  exports: [ServicePackagesService, TypeOrmModule],
})
export class ServicePackagesModule {}
