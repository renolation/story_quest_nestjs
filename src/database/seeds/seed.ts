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
      console.log(`   Answer Options: ${this.questions.length * 4}`);

      console.log('\n🔑 Test Credentials:');
      console.log('   Super Admin: admin@storyquest.com / Password123');

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

    // 1 Super Admin (Agency) only
    const agency = userRepository.create({
      email: 'admin@storyquest.com',
      username: 'superadmin',
      passwordHash: hashedPassword,
      fullName: 'Super Administrator',
      role: UserRole.AGENCY,
    });
    this.users.push(await userRepository.save(agency));

    console.log(`   ✓ Created ${this.users.length} user (Super Admin)`);
  }

  private async seedChapters() {
    console.log('📚 Seeding chapters...');

    const chapterRepository = this.dataSource.getRepository(Chapter);

    // Only 2 chapters
    const chapterData = [
      { title: 'Greetings & Introductions', description: 'Learn basic greetings and how to introduce yourself' },
      { title: 'Numbers & Counting', description: 'Count from 1 to 100 and learn basic math vocabulary' },
    ];

    for (let i = 0; i < chapterData.length; i++) {
      const chapter = chapterRepository.create({
        ...chapterData[i],
        orderIndex: i + 1,
      });
      this.chapters.push(await chapterRepository.save(chapter));
    }

    console.log(`   ✓ Created ${this.chapters.length} chapters`);
  }

  private async seedUnits() {
    console.log('📖 Seeding units...');

    const unitRepository = this.dataSource.getRepository(Unit);

    for (const chapter of this.chapters) {
      const unitsPerChapter = 2; // 2 units per chapter

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

    console.log(`   ✓ Created ${this.units.length} units (2 per chapter)`);
  }

  private async seedLevels() {
    console.log('🎮 Seeding levels...');

    const levelRepository = this.dataSource.getRepository(Level);

    const difficulties = [
      { suffix: 'Beginner', timeLimitSeconds: 60, passingScore: 70 },
      { suffix: 'Easy', timeLimitSeconds: 90, passingScore: 75 },
    ];

    for (const unit of this.units) {
      const levelsPerUnit = 2; // 2 levels per unit

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

    console.log(`   ✓ Created ${this.levels.length} levels (2 per unit)`);
  }

  private async seedQuestions() {
    console.log('❓ Seeding questions...');

    const questionRepository = this.dataSource.getRepository(Question);
    const answerOptionRepository = this.dataSource.getRepository(AnswerOption);

    const questionTypes = ['select_right_answer', 'fill_in_blank', 'sort_words', 'talk_to_speech_compare'];

    for (const level of this.levels) {
      const questionsPerLevel = 4; // 4 questions per level

      for (let i = 0; i < questionsPerLevel; i++) {
        // Use different question type for each question
        const questionType = questionTypes[i % questionTypes.length];

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

    console.log(`   ✓ Created ${this.questions.length} questions (4 per level) with ${this.questions.length * 4} answer options`);
  }

  private async seedProgress() {
    console.log('📈 Seeding progress data...');

    // Skip progress seeding for now - only super admin exists, no students
    console.log('   ✓ Skipped (no students created)');
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
