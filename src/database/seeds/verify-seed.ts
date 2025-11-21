#!/usr/bin/env ts-node

/**
 * Database Seed Verification Script
 *
 * This script verifies the integrity of seeded data
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

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
  synchronize: false,
});

async function verifySeeding() {
  console.log('🔍 Verifying database seeding...\n');

  try {
    await AppDataSource.initialize();

    // Get repositories
    const userRepo = AppDataSource.getRepository(User);
    const chapterRepo = AppDataSource.getRepository(Chapter);
    const unitRepo = AppDataSource.getRepository(Unit);
    const levelRepo = AppDataSource.getRepository(Level);
    const questionRepo = AppDataSource.getRepository(Question);
    const answerOptionRepo = AppDataSource.getRepository(AnswerOption);
    const attemptRepo = AppDataSource.getRepository(StudentLevelAttempt);
    const answerRepo = AppDataSource.getRepository(StudentQuestionAnswer);
    const unitProgressRepo = AppDataSource.getRepository(StudentUnitProgress);
    const chapterProgressRepo = AppDataSource.getRepository(
      StudentChapterProgress,
    );

    // Count users by role
    const agencyCount = await userRepo.count({
      where: { role: UserRole.AGENCY },
    });
    const centerCount = await userRepo.count({
      where: { role: UserRole.CENTER },
    });
    const teacherCount = await userRepo.count({
      where: { role: UserRole.TEACHER },
    });
    const reviewerCount = await userRepo.count({
      where: { role: UserRole.REVIEWER },
    });
    const studentCount = await userRepo.count({
      where: { role: UserRole.STUDENT },
    });
    const totalUsers = await userRepo.count();

    // Count content
    const chaptersCount = await chapterRepo.count();
    const unitsCount = await unitRepo.count();
    const levelsCount = await levelRepo.count();
    const questionsCount = await questionRepo.count();
    const answerOptionsCount = await answerOptionRepo.count();

    // Count progress
    const attemptsCount = await attemptRepo.count();
    const answersCount = await answerRepo.count();
    const unitProgressCount = await unitProgressRepo.count();
    const chapterProgressCount = await chapterProgressRepo.count();

    // Display results
    console.log('📊 DATABASE RECORD COUNTS');
    console.log('='.repeat(60));
    console.log('\n👥 USERS:');
    console.log(`   Agency:        ${agencyCount} / 1 expected`);
    console.log(`   Centers:       ${centerCount} / 3 expected`);
    console.log(`   Teachers:      ${teacherCount} / 5 expected`);
    console.log(`   Reviewers:     ${reviewerCount} / 2 expected`);
    console.log(`   Students:      ${studentCount} / 20 expected`);
    console.log(`   Total Users:   ${totalUsers} / 31 expected`);

    console.log('\n📚 CONTENT:');
    console.log(`   Chapters:      ${chaptersCount} / 10 expected`);
    console.log(`   Units:         ${unitsCount} / 40-50 expected`);
    console.log(`   Levels:        ${levelsCount} / 120-150 expected`);
    console.log(`   Questions:     ${questionsCount} / 1000+ expected`);
    console.log(
      `   Answer Opts:   ${answerOptionsCount} / ${questionsCount * 4} expected`,
    );

    console.log('\n📈 PROGRESS:');
    console.log(`   Level Attempts:      ${attemptsCount} / 500+ expected`);
    console.log(`   Question Answers:    ${answersCount} / 5000+ expected`);
    console.log(`   Unit Progress:       ${unitProgressCount}`);
    console.log(`   Chapter Progress:    ${chapterProgressCount}`);

    // Verify data integrity
    console.log('\n🔍 DATA INTEGRITY CHECKS');
    console.log('='.repeat(60));

    // Check that each question has at least one correct answer
    const questionsWithoutCorrectAnswer =
      await AppDataSource.createQueryBuilder()
        .select('q.id')
        .from(Question, 'q')
        .leftJoin('q.answerOptions', 'ao')
        .groupBy('q.id')
        .having('SUM(CASE WHEN ao.is_correct = true THEN 1 ELSE 0 END) = 0')
        .getRawMany();

    if (questionsWithoutCorrectAnswer.length === 0) {
      console.log('   ✅ All questions have at least one correct answer');
    } else {
      console.log(
        `   ❌ ${questionsWithoutCorrectAnswer.length} questions without correct answer`,
      );
    }

    // Check that each question has exactly 4 answer options
    const questionsWithWrongOptionCount =
      await AppDataSource.createQueryBuilder()
        .select('q.id', 'questionId')
        .addSelect('COUNT(ao.id)', 'optionCount')
        .from(Question, 'q')
        .leftJoin('q.answerOptions', 'ao')
        .groupBy('q.id')
        .having('COUNT(ao.id) != 4')
        .getRawMany();

    if (questionsWithWrongOptionCount.length === 0) {
      console.log('   ✅ All questions have exactly 4 answer options');
    } else {
      console.log(
        `   ❌ ${questionsWithWrongOptionCount.length} questions without 4 options`,
      );
    }

    // Check foreign key relationships
    const orphanedUnits = await unitRepo
      .createQueryBuilder('unit')
      .leftJoinAndSelect('unit.chapter', 'chapter')
      .where('chapter.id IS NULL')
      .getCount();

    const orphanedLevels = await levelRepo
      .createQueryBuilder('level')
      .leftJoinAndSelect('level.unit', 'unit')
      .where('unit.id IS NULL')
      .getCount();

    const orphanedQuestions = await questionRepo
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.level', 'level')
      .where('level.id IS NULL')
      .getCount();

    if (
      orphanedUnits === 0 &&
      orphanedLevels === 0 &&
      orphanedQuestions === 0
    ) {
      console.log('   ✅ No orphaned records (all foreign keys valid)');
    } else {
      console.log(
        `   ❌ Found orphaned records: Units(${orphanedUnits}), Levels(${orphanedLevels}), Questions(${orphanedQuestions})`,
      );
    }

    // Check progress data consistency
    const invalidAttempts = await attemptRepo
      .createQueryBuilder('attempt')
      .where('attempt.score < 0 OR attempt.score > 100')
      .getCount();

    if (invalidAttempts === 0) {
      console.log('   ✅ All scores are within valid range (0-100)');
    } else {
      console.log(`   ❌ ${invalidAttempts} attempts with invalid scores`);
    }

    // List test credentials
    console.log('\n🔑 TEST CREDENTIALS');
    console.log('='.repeat(60));

    const agency = await userRepo.findOne({ where: { role: UserRole.AGENCY } });
    const center = await userRepo.findOne({ where: { role: UserRole.CENTER } });
    const teacher = await userRepo.findOne({
      where: { role: UserRole.TEACHER },
    });
    const reviewer = await userRepo.findOne({
      where: { role: UserRole.REVIEWER },
    });
    const students = await userRepo.find({
      where: { role: UserRole.STUDENT },
      take: 3,
    });

    console.log(`\n   Agency Admin:`);
    console.log(`     Email:    ${agency?.email}`);
    console.log(`     Username: ${agency?.username}`);
    console.log(`     Password: Password123`);

    console.log(`\n   Center Admin:`);
    console.log(`     Email:    ${center?.email}`);
    console.log(`     Username: ${center?.username}`);
    console.log(`     Password: Password123`);

    console.log(`\n   Teacher:`);
    console.log(`     Email:    ${teacher?.email}`);
    console.log(`     Username: ${teacher?.username}`);
    console.log(`     Password: Password123`);

    console.log(`\n   Reviewer:`);
    console.log(`     Email:    ${reviewer?.email}`);
    console.log(`     Username: ${reviewer?.username}`);
    console.log(`     Password: Password123`);

    console.log(`\n   Students (showing first 3 of ${studentCount}):`);
    students.forEach((student, idx) => {
      console.log(
        `     ${idx + 1}. ${student.email} / ${student.username} / Password123`,
      );
    });

    console.log('\n✅ Verification completed!\n');
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run verification
verifySeeding();
