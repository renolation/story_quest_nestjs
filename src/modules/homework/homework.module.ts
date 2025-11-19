import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeworkAssignment } from './entities/homework-assignment.entity';
import { HomeworkSubmission } from './entities/homework-submission.entity';

/**
 * PHASE 7 - HOMEWORK MODULE - TODO
 *
 * Manages homework assignments and student submissions.
 *
 * Features to implement:
 * - Create homework assignments (teachers)
 * - Assign to specific classes
 * - Student submission tracking
 * - Grading and feedback
 * - Due date management
 * - Late submission handling
 * - Submission statistics
 *
 * Workflow:
 * 1. Teacher creates homework for a class
 * 2. Students submit homework (text or file upload)
 * 3. Teacher grades submissions and provides feedback
 *
 * Access Control:
 * - TEACHER role: CRUD on assignments for own classes
 * - STUDENT role: Submit homework, view own submissions
 * - CENTER role: View homework statistics for center
 */
@Module({
  imports: [TypeOrmModule.forFeature([HomeworkAssignment, HomeworkSubmission])],
  controllers: [],
  providers: [],
  exports: [],
})
export class HomeworkModule {}
