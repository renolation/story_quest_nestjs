import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agency } from './entities/agency.entity';
import { User } from '../users/entities/user.entity';
import { AgenciesController } from './agencies.controller';
import { AgenciesService } from './agencies.service';

/**
 * PHASE 1 - AGENCIES MODULE - ✅ IMPLEMENTED
 *
 * Manages agencies (super admin organizations).
 *
 * Features implemented:
 * - CRUD operations for agencies
 * - Agency status management (active/inactive/suspended)
 * - Role-based access control (AGENCY role only)
 * - Email uniqueness validation
 * - Centers count for each agency
 * - Pagination and filtering
 *
 * Access Control:
 * - AGENCY role: Full CRUD access to all agencies
 * - Other roles: No access (highly restricted)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Agency, User])],
  controllers: [AgenciesController],
  providers: [AgenciesService],
  exports: [AgenciesService],
})
export class AgenciesModule {}
