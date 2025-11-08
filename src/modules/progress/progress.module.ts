import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { StudentChapterProgress } from './entities/student-chapter-progress.entity';
import { StudentUnitProgress } from './entities/student-unit-progress.entity';
import { StudentLevelAttempt } from './entities/student-level-attempt.entity';
import { StudentQuestionAnswer } from './entities/student-question-answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentChapterProgress,
      StudentUnitProgress,
      StudentLevelAttempt,
      StudentQuestionAnswer,
    ]),
  ],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
