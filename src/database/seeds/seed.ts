#!/usr/bin/env ts-node

/**
 * Database Seeder - Main Entry Point
 *
 * This script populates the database with sample data for development and testing.
 *
 * Usage:
 *   npm run seed:run           # Run all seeders
 *   npm run seed:reset         # Clear database and reseed
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

// Load environment variables
dotenv.config();

// Import entities
import { User } from '../../modules/users/entities/user.entity';
import { Chapter } from '../../modules/chapters/entities/chapter.entity';
import { Unit } from '../../modules/units/entities/unit.entity';
import { Level } from '../../modules/levels/entities/level.entity';
import { Question } from '../../modules/questions/entities/question.entity';
import { AnswerOption } from '../../modules/questions/entities/answer-option.entity';
import { StudentLevelAttempt } from '../../modules/progress/entities/student-level-attempt.entity';
import { StudentQuestionAnswer } from '../../modules/progress/entities/student-question-answer.entity';
import { StudentUnitProgress } from '../../modules/progress/entities/student-unit-progress.entity';
import { StudentChapterProgress } from '../../modules/progress/entities/student-chapter-progress.entity';
import { UserRole } from '../../common/enums/user-role.enum';

// Create DataSource
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    User,
    Chapter,
    Unit,
    Level,
    Question,
    AnswerOption,
    StudentLevelAttempt,
    StudentQuestionAnswer,
    StudentUnitProgress,
    StudentChapterProgress,
  ],
  synchronize: true, // Auto-create tables for seeding
});

// Seeder class
class DatabaseSeeder {
  private dataSource: DataSource;
  private users: User[] = [];
  private chapters: Chapter[] = [];
  private units: Unit[] = [];
  private levels: Level[] = [];
  private questions: Question[] = [];

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  async run() {
    console.log('🌱 Starting database seeding...\n');

    try {
      // Check for --reset flag
      const shouldReset = process.argv.includes('--reset');

      if (shouldReset) {
        console.log('⚠️  Reset mode: Clearing existing data...\n');
        await this.clearDatabase();
      }

      // Run seeders in order (respecting foreign key dependencies)
      await this.seedUsers();
      await this.seedChapters();
      await this.seedUnits();
      await this.seedLevels();
      await this.seedQuestions();
      await this.seedProgress();

      console.log('\n✅ Database seeding completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`   Users: ${this.users.length}`);
      console.log(`   Chapters: ${this.chapters.length}`);
      console.log(`   Units: ${this.units.length}`);
      console.log(`   Levels: ${this.levels.length}`);
      console.log(`   Questions: ${this.questions.length}`);

      console.log('\n🔑 Test Credentials:');
      console.log('   Agency:   agency@storyquest.com / Password123');
      console.log('   Center:   center1@storyquest.com / Password123');
      console.log('   Teacher:  teacher1@storyquest.com / Password123');
      console.log('   Reviewer: reviewer1@storyquest.com / Password123');
      console.log('   Student:  student1@test.com / Password123');

    } catch (error) {
      console.error('\n❌ Seeding failed:', error);
      throw error;
    }
  }

  private async clearDatabase() {
    // Delete in reverse order of dependencies using query builder
    const tables = [
      StudentQuestionAnswer,
      StudentLevelAttempt,
      StudentUnitProgress,
      StudentChapterProgress,
      AnswerOption,
      Question,
      Level,
      Unit,
      Chapter,
      User,
    ];

    for (const table of tables) {
      try {
        await this.dataSource.getRepository(table).createQueryBuilder().delete().execute();
      } catch (error) {
        // Ignore errors for non-existent tables
        if (!error.message.includes('does not exist')) {
          throw error;
        }
      }
    }

    console.log('   ✓ All tables cleared\n');
  }

  private async seedUsers() {
    console.log('👥 Seeding users...');

    const userRepository = this.dataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('Password123', 10);

    // 1 Agency
    const agency = userRepository.create({
      email: 'agency@storyquest.com',
      username: 'agency_admin',
      passwordHash: hashedPassword,
      fullName: 'Agency Administrator',
      role: UserRole.AGENCY,
    });
    this.users.push(await userRepository.save(agency));

    // 3 Centers
    for (let i = 1; i <= 3; i++) {
      const center = userRepository.create({
        email: `center${i}@storyquest.com`,
        username: `center_${i}`,
        passwordHash: hashedPassword,
        fullName: `Center ${i} Admin`,
        role: UserRole.CENTER,
      });
      this.users.push(await userRepository.save(center));
    }

    // 5 Teachers
    for (let i = 1; i <= 5; i++) {
      const teacher = userRepository.create({
        email: `teacher${i}@storyquest.com`,
        username: `teacher_${i}`,
        passwordHash: hashedPassword,
        fullName: `Teacher ${i}`,
        role: UserRole.TEACHER,
      });
      this.users.push(await userRepository.save(teacher));
    }

    // 2 Reviewers
    for (let i = 1; i <= 2; i++) {
      const reviewer = userRepository.create({
        email: `reviewer${i}@storyquest.com`,
        username: `reviewer_${i}`,
        passwordHash: hashedPassword,
        fullName: `Reviewer ${i}`,
        role: UserRole.REVIEWER,
      });
      this.users.push(await userRepository.save(reviewer));
    }

    // 20 Students
    for (let i = 1; i <= 20; i++) {
      const student = userRepository.create({
        email: `student${i}@test.com`,
        username: `student_${i}`,
        passwordHash: hashedPassword,
        fullName: faker.person.fullName(),
        role: UserRole.STUDENT,
      });
      this.users.push(await userRepository.save(student));
    }

    console.log(`   ✓ Created ${this.users.length} users`);
  }

  private async seedChapters() {
    console.log('📚 Seeding chapters...');

    const chapterRepository = this.dataSource.getRepository(Chapter);

    const chapterData = [
      { title: 'Greetings & Introductions', description: 'Learn basic greetings and how to introduce yourself' },
      { title: 'Numbers & Counting', description: 'Count from 1 to 100 and learn basic math vocabulary' },
      { title: 'Colors & Shapes', description: 'Identify and name different colors and shapes' },
      { title: 'Family & Friends', description: 'Talk about family members and friendships' },
    ];

    for (let i = 0; i < chapterData.length; i++) {
      const chapter = chapterRepository.create({
        ...chapterData[i],
        orderIndex: i + 1,
      });
      this.chapters.push(await chapterRepository.save(chapter));
    }

    console.log(`   ✓ Created 4 chapters`);
  }

  private async seedUnits() {
    console.log('📖 Seeding units...');

    const unitRepository = this.dataSource.getRepository(Unit);

    for (const chapter of this.chapters) {
      const unitsPerChapter = 4; // Always 4 units per chapter

      for (let i = 0; i < unitsPerChapter; i++) {
        const unit = unitRepository.create({
          title: `${chapter.title} - Unit ${i + 1}`,
          description: `Learn more about ${chapter.title.toLowerCase()} - Part ${i + 1}`,
          chapter: chapter,
          orderIndex: i + 1,
        });
        this.units.push(await unitRepository.save(unit));
      }
    }

    console.log(`   ✓ Created 16 units (4 per chapter)`);
  }

  private async seedLevels() {
    console.log('🎮 Seeding levels...');

    const levelRepository = this.dataSource.getRepository(Level);

    const difficulties = [
      { suffix: 'Beginner', timeLimitSeconds: 60, passingScore: 70 },
      { suffix: 'Easy', timeLimitSeconds: 90, passingScore: 75 },
      { suffix: 'Medium', timeLimitSeconds: 120, passingScore: 80 },
      { suffix: 'Hard', timeLimitSeconds: 150, passingScore: 85 },
    ];

    for (const unit of this.units) {
      const levelsPerUnit = 4; // Fixed 4 levels per unit

      for (let i = 0; i < levelsPerUnit; i++) {
        const difficulty = difficulties[i];
        const level = levelRepository.create({
          title: `${unit.title} - ${difficulty.suffix}`,
          description: `${difficulty.suffix} level for ${unit.title}`,
          unit: unit,
          orderIndex: i + 1,
          timeLimitSeconds: difficulty.timeLimitSeconds,
          passingScore: difficulty.passingScore,
        });
        this.levels.push(await levelRepository.save(level));
      }
    }

    console.log(`   ✓ Created 64 levels (4 per unit)`);
  }

  private async seedQuestions() {
    console.log('❓ Seeding questions...');

    const questionRepository = this.dataSource.getRepository(Question);
    const answerOptionRepository = this.dataSource.getRepository(AnswerOption);

    const questionTypes = ['select_right_answer', 'fill_in_blank', 'sort_words', 'talk_to_speech_compare'];
    const typeWeights = [0.4, 0.3, 0.2, 0.1]; // Distribution weights

    for (const level of this.levels) {
      const questionsPerLevel = 10; // Always 10 questions per level

      for (let i = 0; i < questionsPerLevel; i++) {
        // Select question type based on weights
        const rand = Math.random();
        let questionType = questionTypes[0];
        let cumulative = 0;
        for (let j = 0; j < questionTypes.length; j++) {
          cumulative += typeWeights[j];
          if (rand < cumulative) {
            questionType = questionTypes[j];
            break;
          }
        }

        const question = questionRepository.create({
          level: level,
          questionType: questionType as any,
          questionText: faker.lorem.sentence(),
          questionAudioUrl: `https://storage.example.com/audio/question_${faker.string.uuid()}.mp3`,
          questionImageUrl: Math.random() > 0.5 ? `https://storage.example.com/images/question_${faker.string.uuid()}.jpg` : undefined,
          points: 10,
          orderIndex: i + 1,
        });

        const savedQuestion = await questionRepository.save(question);
        this.questions.push(savedQuestion);

        // Create 4 answer options (1 correct, 3 incorrect)
        for (let j = 0; j < 4; j++) {
          const option = answerOptionRepository.create({
            question: savedQuestion,
            optionText: faker.lorem.word(),
            isCorrect: j === 0, // First option is correct
            orderIndex: j + 1,
          });
          await answerOptionRepository.save(option);
        }
      }
    }

    console.log(`   ✓ Created 640 questions (10 per level) with 2560 answer options`);
  }

  private async seedProgress() {
    console.log('📈 Seeding progress data...');

    const attemptRepository = this.dataSource.getRepository(StudentLevelAttempt);
    const answerRepository = this.dataSource.getRepository(StudentQuestionAnswer);
    const unitProgressRepository = this.dataSource.getRepository(StudentUnitProgress);
    const chapterProgressRepository = this.dataSource.getRepository(StudentChapterProgress);

    // Get students only (role = 'student')
    const students = this.users.filter(u => u.role === UserRole.STUDENT);

    let totalAttempts = 0;
    let totalAnswers = 0;

    for (const student of students) {
      // Each student completes random number of levels (10-50)
      // This will generate more realistic progress data
      const levelsToComplete = 10 + Math.floor(Math.random() * 41);

      for (let i = 0; i < levelsToComplete && i < this.levels.length; i++) {
        const level = this.levels[i];
        const score = 50 + Math.floor(Math.random() * 51); // 50-100
        const timeSpentSeconds = 30 + Math.floor(Math.random() * 120); // 30-150 seconds
        const isPassed = score >= level.passingScore;

        // 85% completed, 15% in progress for realism
        const isCompleted = Math.random() < 0.85;

        // Create level attempt
        const attempt = attemptRepository.create({
          student: student,
          level: level,
          score: isCompleted ? score : 0, // Only assign score if completed
          timeSpentSeconds: timeSpentSeconds,
          isCompleted: isCompleted,
          isPassed: isCompleted && isPassed,
        });

        const savedAttempt = await attemptRepository.save(attempt);
        totalAttempts++;

        // Create question answers for this attempt
        const levelQuestions = this.questions.filter(q => q.level.id === level.id);

        for (const question of levelQuestions) {
          const isCorrect = Math.random() < (score / 100); // Probability based on score
          const pointsEarned = isCorrect ? question.points : 0;

          const answer = answerRepository.create({
            attempt: savedAttempt,
            question: question,
            student: student, // Add student relationship
            selectedOption: undefined, // Would need to fetch actual option, simplified here
            isCorrect: isCorrect,
            pointsEarned: pointsEarned,
          });

          await answerRepository.save(answer);
          totalAnswers++;
        }
      }

      // Calculate unit progress
      for (const unit of this.units) {
        const unitLevels = this.levels.filter(l => l.unit.id === unit.id);
        const completedLevels = await attemptRepository
          .createQueryBuilder('attempt')
          .leftJoin('attempt.student', 'student')
          .leftJoin('attempt.level', 'level')
          .leftJoin('level.unit', 'unit')
          .where('student.id = :studentId', { studentId: student.id })
          .andWhere('unit.id = :unitId', { unitId: unit.id })
          .andWhere('attempt.isCompleted = :isCompleted', { isCompleted: true })
          .getCount();

        if (completedLevels > 0) {
          const unitProgress = unitProgressRepository.create({
            student: student,
            unit: unit,
            completedLevels: completedLevels,
            totalLevels: unitLevels.length,
            averageScore: 50 + Math.floor(Math.random() * 50), // Simplified
          });
          await unitProgressRepository.save(unitProgress);
        }
      }

      // Calculate chapter progress
      for (const chapter of this.chapters) {
        const chapterUnits = this.units.filter(u => u.chapter.id === chapter.id);
        const completedUnits = await unitProgressRepository
          .createQueryBuilder('progress')
          .leftJoin('progress.student', 'student')
          .leftJoin('progress.unit', 'unit')
          .leftJoin('unit.chapter', 'chapter')
          .where('student.id = :studentId', { studentId: student.id })
          .andWhere('chapter.id = :chapterId', { chapterId: chapter.id })
          .getCount();

        if (completedUnits > 0) {
          const chapterProgress = chapterProgressRepository.create({
            student: student,
            chapter: chapter,
            completedUnits: completedUnits,
            totalUnits: chapterUnits.length,
            averageScore: 50 + Math.floor(Math.random() * 50), // Simplified
          });
          await chapterProgressRepository.save(chapterProgress);
        }
      }
    }

    console.log(`   ✓ Created ${totalAttempts} level attempts`);
    console.log(`   ✓ Created ${totalAnswers} question answers`);
  }
}

// Main execution
async function main() {
  try {
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    const seeder = new DatabaseSeeder(AppDataSource);
    await seeder.run();

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run seeder
main();
