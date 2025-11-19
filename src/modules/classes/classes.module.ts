import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './entities/class.entity';
import { StudentClass } from './entities/student-class.entity';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

/**
 * PHASE 7 - CLASSES MODULE - TODO
 *
 * Manages teaching classes and student enrollments.
 *
 * Features to implement:
 * - CRUD operations for classes
 * - Assign teacher to class
 * - Enroll/unenroll students
 * - List students in a class
 * - Class capacity management
 * - Class analytics and reports
 *
 * Access Control:
 * - AGENCY role: Full access to all classes
 * - CENTER role: CRUD access to classes in own center's branches
 * - TEACHER role: Read access to assigned classes only
 */
@Module({
  imports: [TypeOrmModule.forFeature([Class, StudentClass])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
