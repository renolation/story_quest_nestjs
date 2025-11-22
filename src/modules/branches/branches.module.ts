import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';
import { CentersModule } from '../centers/centers.module';

/**
 * PHASE 7 - BRANCHES MODULE
 *
 * Manages physical branch locations for centers.
 *
 * Features implemented:
 * - CRUD operations for branches
 * - List branches by center
 * - Branch activation/deactivation
 * - Role-based access control
 *
 * Access Control:
 * - AGENCY role: Full access to all branches
 * - CENTER role: CRUD access to own center's branches only
 */
@Module({
  imports: [TypeOrmModule.forFeature([Branch]), CentersModule],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
