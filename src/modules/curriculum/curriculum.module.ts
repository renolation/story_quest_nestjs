import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurriculumContent } from './entities/curriculum-content.entity';

/**
 * PHASE 7 - CURRICULUM MODULE - TODO
 *
 * Teacher-created curriculum content with review workflow.
 *
 * Features to implement:
 * - Create/edit curriculum content (teachers)
 * - Submit for review
 * - Review workflow (approve/reject by reviewers)
 * - Curriculum marketplace/library
 * - Content search and filtering
 * - Content versioning
 *
 * Workflow:
 * 1. Teacher creates content (status: draft)
 * 2. Teacher submits for review (status: pending_review)
 * 3. Reviewer approves or rejects (status: approved/rejected)
 * 4. Approved content becomes available in marketplace
 *
 * Access Control:
 * - TEACHER role: CRUD on own content
 * - REVIEWER role: Review pending content, approve/reject
 * - CENTER role: Browse and purchase content
 * - AGENCY role: Full access
 */
@Module({
  imports: [TypeOrmModule.forFeature([CurriculumContent])],
  controllers: [],
  providers: [],
  exports: [],
})
export class CurriculumModule {}
