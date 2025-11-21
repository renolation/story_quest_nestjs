import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Questions (e2e)', () => {
  let app: INestApplication;
  let studentToken: string;
  let teacherToken: string;
  let agencyToken: string;
  let testChapterId: number;
  let testUnitId: number;
  let testLevelId: number;
  let createdQuestionId: number;

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
    const studentEmail = `student-questions-${Date.now()}@example.com`;
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
    const teacherEmail = `teacher-questions-${Date.now()}@example.com`;
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

    // Register and login as agency
    const agencyEmail = `agency-questions-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: agencyEmail,
        username: `agency${Date.now()}`,
        password: 'SecurePass123!',
        fullName: 'Agency User',
        role: 'agency',
      });

    const agencyLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: agencyEmail,
        password: 'SecurePass123!',
      });

    agencyToken = agencyLogin.body.accessToken;

    // Create test hierarchy: chapter -> unit -> level
    const chapter = await request(app.getHttpServer())
      .post('/api/v1/chapters')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Chapter for Questions Test',
        description: 'Parent chapter',
        orderIndex: 50000 + Date.now(),
      });

    testChapterId = chapter.body.id;

    const unit = await request(app.getHttpServer())
      .post('/api/v1/units')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Unit for Questions Test',
        description: 'Parent unit',
        chapterId: testChapterId,
        orderIndex: 1,
      });

    testUnitId = unit.body.id;

    const level = await request(app.getHttpServer())
      .post('/api/v1/levels')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Level for Questions Test',
        description: 'Parent level',
        unitId: testUnitId,
        orderIndex: 1,
        timeLimit: 300,
        passingScore: 70,
      });

    testLevelId = level.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/questions', () => {
    it('should create a question with answer options as teacher', () => {
      return request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          levelId: testLevelId,
          questionType: 'select_right_answer',
          questionText: 'What is the correct greeting?',
          orderIndex: 1,
          points: 10,
          answerOptions: [
            { optionText: 'Hello', isCorrect: true, orderIndex: 1 },
            { optionText: 'Goodbye', isCorrect: false, orderIndex: 2 },
            { optionText: 'Thanks', isCorrect: false, orderIndex: 3 },
          ],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(typeof res.body.id).toBe('number');
          expect(res.body.questionType).toBe('select_right_answer');
          expect(res.body.questionText).toBe('What is the correct greeting?');
          expect(res.body.levelId).toBe(testLevelId);
          expect(res.body.points).toBe(10);
          expect(res.body.isActive).toBe(true);
          expect(Array.isArray(res.body.answerOptions)).toBe(true);
          expect(res.body.answerOptions.length).toBe(3);
          createdQuestionId = res.body.id;
        });
    });

    it('should create a question without answer options', () => {
      return request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          levelId: testLevelId,
          questionType: 'fill_in_blank',
          questionText: 'Fill in the blank: I ___ a student',
          orderIndex: 2,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.questionType).toBe('fill_in_blank');
        });
    });

    it('should create a question with optional fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          levelId: testLevelId,
          questionType: 'talk_to_speech_compare',
          questionText: 'Repeat after me',
          questionAudioUrl: 'https://example.com/audio.mp3',
          questionImageUrl: 'https://example.com/image.jpg',
          questionPlace: 'top_left',
          answerPlace: 'bottom_right',
          orderIndex: 3,
          points: 15,
          hint: 'Listen carefully',
          explanation: 'Practice makes perfect',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.questionAudioUrl).toBe(
            'https://example.com/audio.mp3',
          );
          expect(res.body.hint).toBe('Listen carefully');
        });
    });

    it('should create a question as agency', () => {
      return request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          levelId: testLevelId,
          questionType: 'sort_words',
          questionText: 'Arrange these words correctly',
          orderIndex: 4,
        })
        .expect(201);
    });

    it('should fail to create question as student (403)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          levelId: testLevelId,
          questionType: 'select_right_answer',
          questionText: 'Student question',
          orderIndex: 5,
        })
        .expect(403);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/questions')
        .send({
          levelId: testLevelId,
          questionType: 'select_right_answer',
          questionText: 'Unauthenticated question',
          orderIndex: 6,
        })
        .expect(401);
    });

    it('should fail with missing required fields (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          questionText: 'Missing levelId and type',
        })
        .expect(400);
    });

    it('should fail with invalid questionType (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          levelId: testLevelId,
          questionType: 'invalid_type',
          questionText: 'Invalid type',
          orderIndex: 7,
        })
        .expect(400);
    });

    it('should fail with invalid levelId type (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          levelId: 'not-a-number',
          questionType: 'select_right_answer',
          questionText: 'Invalid level ID',
          orderIndex: 8,
        })
        .expect(400);
    });

    it('should fail with non-existent levelId (404)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          levelId: 999999,
          questionType: 'select_right_answer',
          questionText: 'Non-existent level',
          orderIndex: 9,
        })
        .expect(404);
    });

    it('should fail with negative orderIndex (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          levelId: testLevelId,
          questionType: 'select_right_answer',
          questionText: 'Negative order',
          orderIndex: -1,
        })
        .expect(400);
    });

    it('should fail with invalid points value (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          levelId: testLevelId,
          questionType: 'select_right_answer',
          questionText: 'Invalid points',
          orderIndex: 10,
          points: 0,
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/questions', () => {
    it('should get all questions as student', () => {
      return request(app.getHttpServer())
        .get('/api/v1/questions')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(typeof res.body[0].id).toBe('number');
            expect(res.body[0]).toHaveProperty('questionText');
            expect(res.body[0]).toHaveProperty('questionType');
            expect(res.body[0]).toHaveProperty('levelId');
            expect(res.body[0]).toHaveProperty('answerOptions');
            expect(Array.isArray(res.body[0].answerOptions)).toBe(true);
          }
        });
    });

    it('should filter questions by levelId', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/questions?levelId=${testLevelId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((question: any) => {
            expect(question.levelId).toBe(testLevelId);
          });
        });
    });

    it('should get all questions as teacher', () => {
      return request(app.getHttpServer())
        .get('/api/v1/questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer()).get('/api/v1/questions').expect(401);
    });
  });

  describe('GET /api/v1/questions/:id', () => {
    it('should get a specific question by integer ID with answer options', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/questions/${createdQuestionId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toBe(createdQuestionId);
          expect(typeof res.body.id).toBe('number');
          expect(res.body).toHaveProperty('questionText');
          expect(res.body).toHaveProperty('questionType');
          expect(res.body).toHaveProperty('answerOptions');
          expect(Array.isArray(res.body.answerOptions)).toBe(true);
          if (res.body.answerOptions.length > 0) {
            expect(res.body.answerOptions[0]).toHaveProperty('id');
            expect(res.body.answerOptions[0]).toHaveProperty('optionText');
            expect(res.body.answerOptions[0]).toHaveProperty('isCorrect');
            expect(typeof res.body.answerOptions[0].isCorrect).toBe('boolean');
          }
        });
    });

    it('should fail with non-existent ID (404)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/questions/999999')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });

    it('should fail with invalid ID format (400)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/questions/invalid-id')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/questions/${createdQuestionId}`)
        .expect(401);
    });
  });

  describe('PATCH /api/v1/questions/:id', () => {
    it('should update a question as teacher', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/questions/${createdQuestionId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          questionText: 'Updated question text',
          points: 20,
          hint: 'New hint',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdQuestionId);
          expect(res.body.questionText).toBe('Updated question text');
          expect(res.body.points).toBe(20);
          expect(res.body.hint).toBe('New hint');
        });
    });

    it('should update question with new answer options', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/questions/${createdQuestionId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          answerOptions: [
            { optionText: 'Hi', isCorrect: true, orderIndex: 1 },
            { optionText: 'Bye', isCorrect: false, orderIndex: 2 },
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdQuestionId);
          expect(res.body.answerOptions.length).toBe(2);
        });
    });

    it('should update a question as agency', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/questions/${createdQuestionId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          isActive: false,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdQuestionId);
          expect(res.body.isActive).toBe(false);
        });
    });

    it('should fail to update as student (403)', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/questions/${createdQuestionId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          questionText: 'Student update',
        })
        .expect(403);
    });

    it('should fail with non-existent ID (404)', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/questions/999999')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          questionText: 'Non-existent',
        })
        .expect(404);
    });

    it('should fail with invalid questionType (400)', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/questions/${createdQuestionId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          questionType: 'invalid_type',
        })
        .expect(400);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/questions/${createdQuestionId}`)
        .send({
          questionText: 'Unauthenticated update',
        })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/questions/:id', () => {
    let deleteQuestionId: number;

    beforeEach(async () => {
      const question = await request(app.getHttpServer())
        .post('/api/v1/questions')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          levelId: testLevelId,
          questionType: 'select_right_answer',
          questionText: 'Delete test question',
          orderIndex: 1000 + Date.now(),
          answerOptions: [
            { optionText: 'Option 1', isCorrect: true, orderIndex: 1 },
          ],
        });

      deleteQuestionId = question.body.id;
    });

    it('should delete a question as agency (cascade delete answer options)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/questions/${deleteQuestionId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(204);
    });

    it('should fail to delete as teacher (403)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/questions/${deleteQuestionId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('should fail to delete as student (403)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/questions/${deleteQuestionId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should fail with non-existent ID (404)', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/questions/999999')
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(404);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/questions/${deleteQuestionId}`)
        .expect(401);
    });

    it('should verify deleted question is gone (404)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/questions/${deleteQuestionId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(204);

      return request(app.getHttpServer())
        .get(`/api/v1/questions/${deleteQuestionId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });
});
