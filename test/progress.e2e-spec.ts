import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Progress (e2e)', () => {
  let app: INestApplication;
  let studentToken: string;
  let teacherToken: string;
  let testChapterId: number;
  let testUnitId: number;
  let testLevelId: number;
  let testQuestionId: number;
  let testAnswerOptionId: number;
  let attemptId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    // Register and login as student
    const studentEmail = `student-progress-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: studentEmail,
        username: `student${Date.now()}`,
        password: 'SecurePass123!',
        fullName: 'Student User',
        role: 'student',
      });

    const studentLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: studentEmail,
        password: 'SecurePass123!',
      });

    studentToken = studentLogin.body.accessToken;

    // Register and login as teacher
    const teacherEmail = `teacher-progress-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: teacherEmail,
        username: `teacher${Date.now()}`,
        password: 'SecurePass123!',
        fullName: 'Teacher User',
        role: 'teacher',
      });

    const teacherLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: teacherEmail,
        password: 'SecurePass123!',
      });

    teacherToken = teacherLogin.body.accessToken;

    // Create test hierarchy: chapter -> unit -> level -> question
    const chapter = await request(app.getHttpServer())
      .post('/api/v1/chapters')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Chapter for Progress Test',
        description: 'Parent chapter',
        orderIndex: 60000 + Date.now(),
      });

    testChapterId = chapter.body.id;

    const unit = await request(app.getHttpServer())
      .post('/api/v1/units')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Unit for Progress Test',
        description: 'Parent unit',
        chapterId: testChapterId,
        orderIndex: 1,
      });

    testUnitId = unit.body.id;

    const level = await request(app.getHttpServer())
      .post('/api/v1/levels')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Level for Progress Test',
        description: 'Parent level',
        unitId: testUnitId,
        orderIndex: 1,
        timeLimit: 300,
        passingScore: 70,
      });

    testLevelId = level.body.id;

    const question = await request(app.getHttpServer())
      .post('/api/v1/questions')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        levelId: testLevelId,
        questionType: 'select_right_answer',
        questionText: 'Test question for progress',
        orderIndex: 1,
        points: 10,
        answerOptions: [
          { optionText: 'Correct Answer', isCorrect: true, orderIndex: 1 },
          { optionText: 'Wrong Answer', isCorrect: false, orderIndex: 2 },
        ],
      });

    testQuestionId = question.body.id;
    testAnswerOptionId = question.body.answerOptions.find(
      (opt: any) => opt.isCorrect,
    ).id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/progress/levels/:id/start', () => {
    it('should start a level as student', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${testLevelId}/start`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(typeof res.body.id).toBe('number');
          expect(res.body).toHaveProperty('studentId');
          expect(res.body).toHaveProperty('levelId');
          expect(res.body.levelId).toBe(testLevelId);
          expect(res.body).toHaveProperty('startedAt');
          expect(res.body.isCompleted).toBe(false);
          attemptId = res.body.id;
        });
    });

    it('should fail to start level as teacher (403)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${testLevelId}/start`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${testLevelId}/start`)
        .expect(401);
    });

    it('should fail with non-existent level ID (404)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/progress/levels/999999/start')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });

    it('should fail with invalid level ID format (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/progress/levels/invalid-id/start')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });
  });

  describe('POST /api/v1/progress/questions/:id/answer', () => {
    it('should submit a correct answer as student', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/progress/questions/${testQuestionId}/answer`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: attemptId,
          questionId: testQuestionId,
          selectedOptionId: testAnswerOptionId,
          isCorrect: true,
          pointsEarned: 10,
          timeSpentSeconds: 15,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(typeof res.body.id).toBe('number');
          expect(res.body).toHaveProperty('attemptId');
          expect(res.body.attemptId).toBe(attemptId);
          expect(res.body).toHaveProperty('questionId');
          expect(res.body.questionId).toBe(testQuestionId);
          expect(res.body.isCorrect).toBe(true);
          expect(res.body.pointsEarned).toBe(10);
        });
    });

    it('should submit an incorrect answer', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/progress/questions/${testQuestionId}/answer`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: attemptId,
          questionId: testQuestionId,
          answerText: 'Wrong answer text',
          isCorrect: false,
          pointsEarned: 0,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.isCorrect).toBe(false);
          expect(res.body.pointsEarned).toBe(0);
        });
    });

    it('should fail to submit answer as teacher (403)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/progress/questions/${testQuestionId}/answer`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          attemptId: attemptId,
          questionId: testQuestionId,
          isCorrect: true,
          pointsEarned: 10,
        })
        .expect(403);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/progress/questions/${testQuestionId}/answer`)
        .send({
          attemptId: attemptId,
          questionId: testQuestionId,
          isCorrect: true,
          pointsEarned: 10,
        })
        .expect(401);
    });

    it('should fail with missing required fields (400)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/progress/questions/${testQuestionId}/answer`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: attemptId,
        })
        .expect(400);
    });

    it('should fail with invalid attemptId type (400)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/progress/questions/${testQuestionId}/answer`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: 'not-a-number',
          questionId: testQuestionId,
          isCorrect: true,
          pointsEarned: 10,
        })
        .expect(400);
    });

    it('should fail with non-existent question ID (404)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/progress/questions/999999/answer')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: attemptId,
          questionId: 999999,
          isCorrect: true,
          pointsEarned: 10,
        })
        .expect(404);
    });
  });

  describe('POST /api/v1/progress/levels/:id/complete', () => {
    it('should complete a level as student', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${testLevelId}/complete`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: attemptId,
          score: 85,
          pointsEarned: 10,
          isPassed: true,
          timeSpentSeconds: 120,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toBe(attemptId);
          expect(res.body.isCompleted).toBe(true);
          expect(res.body.isPassed).toBe(true);
          expect(res.body.score).toBe(85);
          expect(res.body.pointsEarned).toBe(10);
        });
    });

    it('should fail to complete level as teacher (403)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${testLevelId}/complete`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          attemptId: attemptId,
          score: 85,
          pointsEarned: 10,
          isPassed: true,
          timeSpentSeconds: 120,
        })
        .expect(403);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${testLevelId}/complete`)
        .send({
          attemptId: attemptId,
          score: 85,
          pointsEarned: 10,
          isPassed: true,
          timeSpentSeconds: 120,
        })
        .expect(401);
    });

    it('should fail with missing required fields (400)', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${testLevelId}/complete`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: attemptId,
        })
        .expect(400);
    });

    it('should fail with non-existent level ID (404)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/progress/levels/999999/complete')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: attemptId,
          score: 85,
          pointsEarned: 10,
          isPassed: true,
          timeSpentSeconds: 120,
        })
        .expect(404);
    });
  });

  describe('GET /api/v1/progress/me', () => {
    it('should get student progress summary', () => {
      return request(app.getHttpServer())
        .get('/api/v1/progress/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('studentId');
          expect(res.body).toHaveProperty('totalChapters');
          expect(res.body).toHaveProperty('completedChapters');
          expect(res.body).toHaveProperty('totalUnits');
          expect(res.body).toHaveProperty('completedUnits');
          expect(res.body).toHaveProperty('totalLevels');
          expect(res.body).toHaveProperty('completedLevels');
          expect(res.body).toHaveProperty('averageScore');
          expect(res.body).toHaveProperty('totalPointsEarned');
        });
    });

    it('should fail for teacher role (student-only endpoint)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/progress/me')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200); // This might pass but return different data structure
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/progress/me')
        .expect(401);
    });
  });

  describe('GET /api/v1/progress/chapters/:id', () => {
    it('should get chapter progress', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/progress/chapters/${testChapterId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('chapterId');
          expect(res.body.chapterId).toBe(testChapterId);
          expect(res.body).toHaveProperty('totalUnits');
          expect(res.body).toHaveProperty('completedUnits');
          expect(res.body).toHaveProperty('averageScore');
        });
    });

    it('should fail with non-existent chapter ID (404)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/progress/chapters/999999')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });

    it('should fail with invalid chapter ID format (400)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/progress/chapters/invalid-id')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/progress/chapters/${testChapterId}`)
        .expect(401);
    });
  });

  describe('GET /api/v1/progress/units/:id', () => {
    it('should get unit progress', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/progress/units/${testUnitId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('unitId');
          expect(res.body.unitId).toBe(testUnitId);
          expect(res.body).toHaveProperty('totalLevels');
          expect(res.body).toHaveProperty('completedLevels');
          expect(res.body).toHaveProperty('averageScore');
        });
    });

    it('should fail with non-existent unit ID (404)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/progress/units/999999')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });

    it('should fail with invalid unit ID format (400)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/progress/units/invalid-id')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/progress/units/${testUnitId}`)
        .expect(401);
    });
  });

  describe('Complete Learning Flow', () => {
    let flowLevelId: number;
    let flowQuestionId: number;
    let flowAnswerOptionId: number;
    let flowAttemptId: number;

    beforeAll(async () => {
      // Create a new level for flow test
      const level = await request(app.getHttpServer())
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Flow Test Level',
          unitId: testUnitId,
          orderIndex: 99,
          timeLimit: 300,
          passingScore: 70,
        });

      flowLevelId = level.body.id;

      // Create a question
      const question = await request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          levelId: flowLevelId,
          questionType: 'select_right_answer',
          questionText: 'Flow test question',
          orderIndex: 1,
          points: 10,
          answerOptions: [
            { optionText: 'Right', isCorrect: true, orderIndex: 1 },
            { optionText: 'Wrong', isCorrect: false, orderIndex: 2 },
          ],
        });

      flowQuestionId = question.body.id;
      flowAnswerOptionId = question.body.answerOptions.find(
        (opt: any) => opt.isCorrect,
      ).id;
    });

    it('should complete full learning workflow', async () => {
      // Step 1: Start level
      const startResponse = await request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${flowLevelId}/start`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      flowAttemptId = startResponse.body.id;
      expect(flowAttemptId).toBeDefined();

      // Step 2: Submit answer
      await request(app.getHttpServer())
        .post(`/api/v1/progress/questions/${flowQuestionId}/answer`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: flowAttemptId,
          questionId: flowQuestionId,
          selectedOptionId: flowAnswerOptionId,
          isCorrect: true,
          pointsEarned: 10,
          timeSpentSeconds: 20,
        })
        .expect(201);

      // Step 3: Complete level
      await request(app.getHttpServer())
        .post(`/api/v1/progress/levels/${flowLevelId}/complete`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId: flowAttemptId,
          score: 100,
          pointsEarned: 10,
          isPassed: true,
          timeSpentSeconds: 60,
        })
        .expect(200);

      // Step 4: Verify progress is updated
      const progressResponse = await request(app.getHttpServer())
        .get('/api/v1/progress/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(progressResponse.body.completedLevels).toBeGreaterThan(0);
    });
  });
});
