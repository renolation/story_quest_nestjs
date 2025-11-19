import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { BranchesController } from './branches.controller';
import { BranchesService } from './branches.service';

/**
 * PHASE 7 - BRANCHES MODULE - TODO
 *
 * Manages physical branch locations for centers.
 *
 * Features to implement:
 * - CRUD operations for branches
 * - List branches by center
 * - Branch activation/deactivation
 * - Class listing for a branch
 * - Branch analytics
 *
 * Access Control:
 * - AGENCY role: Full access to all branches
 * - CENTER role: CRUD access to own center's branches only
 */
@Module({
  imports: [TypeOrmModule.forFeature([Branch])],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
