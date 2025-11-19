import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Center } from './entities/center.entity';
import { CentersController } from './centers.controller';
import { CentersService } from './centers.service';

/**
 * PHASE 7 - CENTERS MODULE - TODO
 *
 * Manages English learning centers (organizations).
 *
 * Features to implement:
 * - CRUD operations for centers
 * - Center status management (active/inactive/suspended)
 * - Branch listing for a center
 * - Teacher management for a center
 * - Center analytics and reporting
 * - Business license validation
 *
 * Access Control:
 * - AGENCY role: Full CRUD access to all centers
 * - CENTER role: Read/Update own center only
 */
@Module({
  imports: [TypeOrmModule.forFeature([Center])],
  controllers: [CentersController],
  providers: [CentersService],
  exports: [CentersService],
})
export class CentersModule {}
