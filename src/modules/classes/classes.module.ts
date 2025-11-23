import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './entities/class.entity';
import { StudentClass } from './entities/student-class.entity';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { User } from '../users/entities/user.entity';
import { Branch } from '../branches/entities/branch.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Center } from '../centers/entities/center.entity';

/**
 * PHASE 7 - CLASSES MODULE
 *
 * Manages teaching classes and student enrollments with role-based access control.
 *
 * Features implemented:
 * - ✅ CRUD operations for classes
 * - ✅ Role-based class creation (AGENCY, CENTER)
 * - ✅ Access control (AGENCY, CENTER, TEACHER)
 * - ✅ Student enrollment/unenrollment
 * - ✅ Class capacity management
 * - ✅ List students in a class
 *
 * Access Control:
 * - AGENCY role: Full access to all classes
 * - CENTER role: CRUD access to own center's classes
 * - TEACHER role: Read-only access to assigned classes
 *
 * Key Business Logic:
 * 1. AGENCY creates class → Must specify branchId (can create for any branch)
 * 2. CENTER creates class → branchId must belong to their center
 * 3. Teachers can only view classes assigned to them
 * 4. Student enrollment validates capacity and prevents duplicates
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Class,
      StudentClass,
      User,
      Branch,
      Grade,
      Center,
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
