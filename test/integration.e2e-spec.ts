import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Integration - Full Learning Workflow (e2e)', () => {
  let app: INestApplication;
  let studentToken: string;
  let teacherToken: string;

  // Content IDs
  let chapterId: number;
  let unitId: number;
  let levelId: number;
  let question1Id: number;
  let question2Id: number;
  let correctOption1Id: number;
  let correctOption2Id: number;

  // Progress IDs
  let attemptId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Register and login as teacher
    const teacherEmail = `teacher-integration-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: teacherEmail,
        username: `teacher${Date.now()}`,
        password: 'SecurePass123!',
        fullName: 'Integration Teacher',
        role: 'teacher',
      });

    const teacherLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: teacherEmail,
        password: 'SecurePass123!',
      });

    teacherToken = teacherLogin.body.accessToken;

    // Register and login as student
    const studentEmail = `student-integration-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: studentEmail,
        username: `student${Date.now()}`,
        password: 'SecurePass123!',
        fullName: 'Integration Student',
        role: 'student',
      });

    const studentLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: studentEmail,
        password: 'SecurePass123!',
      });

    studentToken = studentLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Step 1: Teacher Creates Content Hierarchy', () => {
    it('should create a chapter', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/chapters')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Integration Test Chapter',
          description: 'Complete learning journey test',
          orderIndex: 70000 + Date.now(),
        })
        .expect(201);

      chapterId = response.body.id;
      expect(chapterId).toBeDefined();
      expect(typeof chapterId).toBe('number');
      expect(response.body.title).toBe('Integration Test Chapter');
    });

    it('should create a unit in the chapter', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/units')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Integration Test Unit',
          description: 'Unit with complete workflow',
          chapterId: chapterId,
          orderIndex: 1,
        })
        .expect(201);

      unitId = response.body.id;
      expect(unitId).toBeDefined();
      expect(typeof unitId).toBe('number');
      expect(response.body.chapterId).toBe(chapterId);
    });

    it('should create a level in the unit', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Integration Test Level',
          description: 'Level with questions',
          unitId: unitId,
          orderIndex: 1,
          timeLimit: 600,
          passingScore: 60,
        })
        .expect(201);

      levelId = response.body.id;
      expect(levelId).toBeDefined();
      expect(typeof levelId).toBe('number');
      expect(response.body.unitId).toBe(unitId);
      expect(response.body.passingScore).toBe(60);
    });

    it('should create first question with answer options', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          levelId: levelId,
          questionType: 'select_right_answer',
          questionText: 'What is 2 + 2?',
          orderIndex: 1,
          points: 10,
          hint: 'Count on your fingers',
          explanation: 'Two plus two equals four',
          answerOptions: [
            { optionText: '3', isCorrect: false, orderIndex: 1 },
            { optionText: '4', isCorrect: true, orderIndex: 2 },
            { optionText: '5', isCorrect: false, orderIndex: 3 },
          ],
        })
        .expect(201);

      question1Id = response.body.id;
      expect(question1Id).toBeDefined();
      expect(response.body.levelId).toBe(levelId);
      expect(response.body.answerOptions.length).toBe(3);

      // Find the correct answer option
      correctOption1Id = response.body.answerOptions.find(
        (opt: any) => opt.isCorrect === true,
      ).id;
      expect(correctOption1Id).toBeDefined();
    });

    it('should create second question with answer options', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          levelId: levelId,
          questionType: 'select_right_answer',
          questionText: 'What color is the sky?',
          orderIndex: 2,
          points: 10,
          answerOptions: [
            { optionText: 'Blue', isCorrect: true, orderIndex: 1 },
            { optionText: 'Red', isCorrect: false, orderIndex: 2 },
            { optionText: 'Green', isCorrect: false, orderIndex: 3 },
          ],
        })
        .expect(201);

      question2Id = response.body.id;
      expect(question2Id).toBeDefined();
      expect(response.body.answerOptions.length).toBe(3);

      correctOption2Id = response.body.answerOptions.find(
        (opt: any) => opt.isCorrect === true,
      ).id;
      expect(correctOption2Id).toBeDefined();
    });
  });

  describe('Step 2: Student Views Content', () => {
    it('should get all chapters with progress', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/chapters')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const createdChapter = response.body.find((ch: any) => ch.id === chapterId);
      expect(createdChapter).toBeDefined();
      expect(createdChapter).toHaveProperty('progress');
      expect(createdChapter.progress.completedUnits).toBe(0);
    });

    it('should get chapter with nested units', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/chapters/${chapterId}?includeUnits=true`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.id).toBe(chapterId);
      expect(Array.isArray(response.body.units)).toBe(true);
      expect(response.body.units.length).toBeGreaterThan(0);

      const createdUnit = response.body.units.find((u: any) => u.id === unitId);
      expect(createdUnit).toBeDefined();
    });

    it('should get unit with nested levels', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/units/${unitId}?includeLevels=true`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.id).toBe(unitId);
      expect(Array.isArray(response.body.levels)).toBe(true);
      expect(response.body.levels.length).toBeGreaterThan(0);

      const createdLevel = response.body.levels.find((l: any) => l.id === levelId);
      expect(createdLevel).toBeDefined();
    });

    it('should get level with questions', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/levels/${levelId}?includeQuestions=true`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.id).toBe(levelId);
      expect(response.body.timeLimit).toBe(600);
      expect(response.body.passingScore).toBe(60);
      expect(Array.isArray(response.body.questions)).toBe(true);
      expect(response.body.questions.length).toBe(2);
    });

    it('should get questions for the level', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/questions?levelId=${levelId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      const q1 = response.body.find((q: any) => q.id === question1Id);
      expect(q1).toBeDefined();
      expect(q1.questionText).toBe('What is 2 + 2?');
      expect(q1.answerOptions.length).toBe(3);
    });
  });

  describe('Step 3: Student Starts Level', () => {
    it('should start the level attempt', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${levelId}/start`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      attemptId = response.body.id;
      expect(attemptId).toBeDefined();
      expect(typeof attemptId).toBe('number');
      expect(response.body.levelId).toBe(levelId);
      expect(response.body.isCompleted).toBe(false);
      expect(response.body).toHaveProperty('startedAt');
    });

    it('should verify progress shows in-progress attempt', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/progress/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('studentId');
      expect(response.body).toHaveProperty('totalLevels');
    });
  });

  describe('Step 4: Student Answers Questions', () => {
    it('should submit correct answer to first question', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/progress/questions/${question1Id}/answer`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: attemptId,
          questionId: question1Id,
          selectedOptionId: correctOption1Id,
          isCorrect: true,
          pointsEarned: 10,
          timeSpentSeconds: 25,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.attemptId).toBe(attemptId);
      expect(response.body.questionId).toBe(question1Id);
      expect(response.body.isCorrect).toBe(true);
      expect(response.body.pointsEarned).toBe(10);
    });

    it('should submit correct answer to second question', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/progress/questions/${question2Id}/answer`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: attemptId,
          questionId: question2Id,
          selectedOptionId: correctOption2Id,
          isCorrect: true,
          pointsEarned: 10,
          timeSpentSeconds: 20,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.isCorrect).toBe(true);
      expect(response.body.pointsEarned).toBe(10);
    });
  });

  describe('Step 5: Student Completes Level', () => {
    it('should complete the level with passing score', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${levelId}/complete`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: attemptId,
          score: 100,
          pointsEarned: 20,
          isPassed: true,
          timeSpentSeconds: 180,
        })
        .expect(200);

      expect(response.body.id).toBe(attemptId);
      expect(response.body.isCompleted).toBe(true);
      expect(response.body.isPassed).toBe(true);
      expect(response.body.score).toBe(100);
      expect(response.body.pointsEarned).toBe(20);
      expect(response.body).toHaveProperty('completedAt');
    });
  });

  describe('Step 6: Verify Progress Tracking', () => {
    it('should show updated overall progress', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/progress/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.completedLevels).toBeGreaterThan(0);
      expect(response.body.totalPointsEarned).toBeGreaterThanOrEqual(20);
      expect(response.body.averageScore).toBeGreaterThan(0);
    });

    it('should show chapter progress', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/progress/chapters/${chapterId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.chapterId).toBe(chapterId);
      expect(response.body).toHaveProperty('totalUnits');
      expect(response.body).toHaveProperty('completedUnits');
    });

    it('should show unit progress', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/progress/units/${unitId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.unitId).toBe(unitId);
      expect(response.body.completedLevels).toBeGreaterThan(0);
      expect(response.body.averageScore).toBeGreaterThan(0);
    });

    it('should show completed level in chapter view', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/chapters/${chapterId}?includeUnits=true`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.progress).toBeDefined();
      expect(response.body.progress.completedUnits).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Step 7: Test Second Attempt (Replay)', () => {
    let secondAttemptId: number;

    it('should allow starting the same level again', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${levelId}/start`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      secondAttemptId = response.body.id;
      expect(secondAttemptId).toBeDefined();
      expect(secondAttemptId).not.toBe(attemptId);
    });

    it('should submit answers for second attempt', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/progress/questions/${question1Id}/answer`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: secondAttemptId,
          questionId: question1Id,
          selectedOptionId: correctOption1Id,
          isCorrect: true,
          pointsEarned: 10,
        })
        .expect(201);
    });

    it('should complete second attempt with different score', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${levelId}/complete`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: secondAttemptId,
          score: 50,
          pointsEarned: 10,
          isPassed: false,
          timeSpentSeconds: 120,
        })
        .expect(200);

      expect(response.body.id).toBe(secondAttemptId);
      expect(response.body.isPassed).toBe(false);
      expect(response.body.score).toBe(50);
    });
  });

  describe('Step 8: Test RBAC - Role Restrictions', () => {
    it('should prevent student from creating content', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/chapters')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Chapter',
          orderIndex: 99999,
        })
        .expect(403);
    });

    it('should prevent teacher from deleting content', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/chapters/${chapterId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('should prevent teacher from starting level attempts', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${levelId}/start`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('should allow teacher to view content', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/chapters')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);
    });

    it('should allow teacher to update content', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/chapters/${chapterId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          description: 'Updated by teacher',
        })
        .expect(200);
    });
  });

  describe('Step 9: Data Integrity Checks', () => {
    it('should maintain integer IDs throughout', async () => {
      expect(typeof chapterId).toBe('number');
      expect(typeof unitId).toBe('number');
      expect(typeof levelId).toBe('number');
      expect(typeof question1Id).toBe('number');
      expect(typeof attemptId).toBe('number');
    });

    it('should have correct foreign key relationships', async () => {
      const unit = await request(app.getHttpServer())
        .get(`/api/v1/units/${unitId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(unit.body.chapterId).toBe(chapterId);

      const level = await request(app.getHttpServer())
        .get(`/api/v1/levels/${levelId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(level.body.unitId).toBe(unitId);

      const question = await request(app.getHttpServer())
        .get(`/api/v1/questions/${question1Id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(question.body.levelId).toBe(levelId);
    });

    it('should maintain data consistency after updates', async () => {
      const updateResponse = await request(app.getHttpServer())
        .patch(`/api/v1/questions/${question1Id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          questionText: 'What is 2 + 2? (Updated)',
        })
        .expect(200);

      expect(updateResponse.body.questionText).toBe('What is 2 + 2? (Updated)');

      const getResponse = await request(app.getHttpServer())
        .get(`/api/v1/questions/${question1Id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(getResponse.body.questionText).toBe('What is 2 + 2? (Updated)');
    });
  });
});
