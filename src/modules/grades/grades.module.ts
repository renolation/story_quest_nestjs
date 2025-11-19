import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';

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
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}
