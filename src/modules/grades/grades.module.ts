import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';

/**
 * PHASE 7 - GRADES MODULE - TODO
 *
 * Manages grade levels (3, 4, 5) for student classification.
 *
 * Features to implement:
 * - List all grades
 * - Grade-based content filtering
 *
 * Note: This is a simple lookup table with static data.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Grade])],
  controllers: [],
  providers: [],
  exports: [],
})
export class GradesModule {}
