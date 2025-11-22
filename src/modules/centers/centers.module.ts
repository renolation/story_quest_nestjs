import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Center } from './entities/center.entity';
import { User } from '../users/entities/user.entity';
import { CentersController } from './centers.controller';
import { CentersService } from './centers.service';

/**
 * PHASE 7 - CENTERS MODULE - ✅ IMPLEMENTED
 *
 * Manages English learning centers (organizations).
 *
 * Features implemented:
 * - CRUD operations for centers with automatic user account creation
 * - Center status management (active/inactive/suspended)
 * - Role-based access control (AGENCY: full access, CENTER: own only)
 * - Email and username uniqueness validation
 * - Password hashing with bcrypt
 * - Center analytics and reporting
 *
 * User Account Creation:
 * When a center is created, a corresponding user account is automatically created with:
 * - role: CENTER
 * - username: auto-generated from email
 * - password: hashed with bcrypt
 * - email: same as center email
 *
 * Access Control:
 * - AGENCY role: Full CRUD access to all centers
 * - CENTER role: Read/Update own center only
 */
@Module({
  imports: [TypeOrmModule.forFeature([Center, User])],
  controllers: [CentersController],
  providers: [CentersService],
  exports: [CentersService],
})
export class CentersModule {}
