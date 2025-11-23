import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { User } from '../users/entities/user.entity';
import { Center } from '../centers/entities/center.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Class } from '../classes/entities/class.entity';
import { StudentClass } from '../classes/entities/student-class.entity';

/**
 * Teachers Module
 *
 * Manages teachers who belong to centers and create educational content.
 *
 * Features:
 * - Role-based teacher creation (AGENCY must specify center, CENTER auto-assigns)
 * - Teacher profile management
 * - Branch assignment (optional)
 * - Access control for viewing/managing teachers
 *
 * Access Control:
 * - AGENCY: Full access to all teachers across all centers
 * - CENTER: Access to own center's teachers only
 * - TEACHER: View/update own profile only
 *
 * Dependencies:
 * - User: For teacher account creation
 * - Center: For center assignment
 * - Branch: For optional branch assignment
 */
@Module({
  imports: [TypeOrmModule.forFeature([Teacher, User, Center, Branch, Class, StudentClass])],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService, TypeOrmModule],
})
export class TeachersModule {}
