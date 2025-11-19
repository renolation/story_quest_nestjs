import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { StudentChapterProgress } from './entities/student-chapter-progress.entity';
import { StudentUnitProgress } from './entities/student-unit-progress.entity';
import { StudentLevelAttempt } from './entities/student-level-attempt.entity';
import { StudentQuestionAnswer } from './entities/student-question-answer.entity';
import { Level } from '../levels/entities/level.entity';
import { Question } from '../questions/entities/question.entity';
import { AnswerOption } from '../questions/entities/answer-option.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentChapterProgress,
      StudentUnitProgress,
      StudentLevelAttempt,
      StudentQuestionAnswer,
      Level,
      Question,
      AnswerOption,
      User,
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
