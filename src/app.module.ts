import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
// Phase 1 Modules (Active)
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { UnitsModule } from './modules/units/units.module';
import { LevelsModule } from './modules/levels/levels.module';
import { QuestionsModule } from './modules/questions/questions.module';

// Phase 2 Modules (Active)
import { ProgressModule } from './modules/progress/progress.module';

// Phase 3 Modules (Placeholder)
import { PronunciationModule } from './modules/pronunciation/pronunciation.module';

// Phase 4 Modules (Placeholder)
import { GamificationModule } from './modules/gamification/gamification.module';

// Phase 5 Modules (Placeholder)
import { StoriesModule } from './modules/stories/stories.module';

// Phase 7 Modules (Placeholder)
import { AgenciesModule } from './modules/agencies/agencies.module';
import { CentersModule } from './modules/centers/centers.module';
import { BranchesModule } from './modules/branches/branches.module';
import { GradesModule } from './modules/grades/grades.module';
import { ClassesModule } from './modules/classes/classes.module';
import { TeacherNotesModule } from './modules/teacher-notes/teacher-notes.module';
import { GiftcodesModule } from './modules/giftcodes/giftcodes.module';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { ServicePackagesModule } from './modules/service-packages/service-packages.module';
import { CenterSubscriptionsModule } from './modules/center-subscriptions/center-subscriptions.module';
import { OffersModule } from './modules/offers/offers.module';
import { TeachersModule } from './modules/teachers/teachers.module';

import { JwtAuthGuard } from './common/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    // Phase 1 - Active
    AuthModule,
    UsersModule,
    ChaptersModule,
    UnitsModule,
    LevelsModule,
    QuestionsModule,

    // Phase 2 - Active
    ProgressModule,

    // Phase 3 - Placeholder
    PronunciationModule,

    // Phase 4 - Placeholder
    GamificationModule,

    // Phase 5 - Placeholder
    StoriesModule,

    // Phase 7 - Placeholder
    AgenciesModule,
    CentersModule,
    BranchesModule,
    GradesModule,
    ClassesModule,
    TeacherNotesModule,
    GiftcodesModule,
    CurriculumModule,
    HomeworkModule,
    ServicePackagesModule,
    CenterSubscriptionsModule,
    OffersModule,
    TeachersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
