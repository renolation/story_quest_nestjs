import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Levels (e2e)', () => {
  let app: INestApplication;
  let studentToken: string;
  let teacherToken: string;
  let agencyToken: string;
  let testChapterId: number;
  let testUnitId: number;
  let createdLevelId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Register and login as student
    const studentEmail = `student-levels-${Date.now()}@example.com`;
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
    const teacherEmail = `teacher-levels-${Date.now()}@example.com`;
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
    const agencyEmail = `agency-levels-${Date.now()}@example.com`;
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

    // Create a test chapter
    const chapter = await request(app.getHttpServer())
      .post('/api/v1/chapters')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Chapter for Levels Test',
        description: 'Parent chapter',
        orderIndex: 40000 + Date.now(),
      });

    testChapterId = chapter.body.id;

    // Create a test unit
    const unit = await request(app.getHttpServer())
      .post('/api/v1/units')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Unit for Levels Test',
        description: 'Parent unit',
        chapterId: testChapterId,
        orderIndex: 1,
      });

    testUnitId = unit.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/levels', () => {
    it('should create a level as teacher', () => {
      return request(app.getHttpServer())
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Test Level',
          description: 'Test level description',
          unitId: testUnitId,
          orderIndex: 1,
          timeLimit: 300,
          passingScore: 70,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(typeof res.body.id).toBe('number');
          expect(res.body.title).toBe('Test Level');
          expect(res.body.description).toBe('Test level description');
          expect(res.body.unitId).toBe(testUnitId);
          expect(res.body.orderIndex).toBe(1);
          expect(res.body.timeLimit).toBe(300);
          expect(res.body.passingScore).toBe(70);
          expect(res.body.isActive).toBe(true);
          createdLevelId = res.body.id;
        });
    });

    it('should create a level with minimal fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Minimal Level',
          unitId: testUnitId,
          orderIndex: 2,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Minimal Level');
        });
    });

    it('should create a level as agency', () => {
      return request(app.getHttpServer())
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'Agency Level',
          description: 'Created by agency',
          unitId: testUnitId,
          orderIndex: 3,
          timeLimit: 600,
          passingScore: 80,
        })
        .expect(201);
    });

    it('should fail to create level as student (403)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Level',
          description: 'Should fail',
          unitId: testUnitId,
          orderIndex: 4,
        })
        .expect(403);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/levels')
        .send({
          title: 'Unauthenticated Level',
          unitId: testUnitId,
          orderIndex: 5,
        })
        .expect(401);
    });

    it('should fail with missing required fields (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          description: 'Missing title and unitId',
        })
        .expect(400);
    });

    it('should fail with invalid unitId type (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Invalid Unit ID',
          unitId: 'not-a-number',
          orderIndex: 6,
        })
        .expect(400);
    });

    it('should fail with non-existent unitId (404)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Non-existent Unit',
          unitId: 999999,
          orderIndex: 7,
        })
        .expect(404);
    });

    it('should fail with invalid passingScore > 100 (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Invalid Passing Score',
          unitId: testUnitId,
          orderIndex: 8,
          passingScore: 150,
        })
        .expect(400);
    });

    it('should fail with negative timeLimit (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Negative Time Limit',
          unitId: testUnitId,
          orderIndex: 9,
          timeLimit: -100,
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/levels', () => {
    it('should get all levels as student with progress', () => {
      return request(app.getHttpServer())
        .get('/api/v1/levels')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(typeof res.body[0].id).toBe('number');
            expect(res.body[0]).toHaveProperty('title');
            expect(res.body[0]).toHaveProperty('unitId');
            expect(res.body[0]).toHaveProperty('progress');
          }
        });
    });

    it('should filter levels by unitId', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/levels?unitId=${testUnitId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((level: any) => {
            expect(level.unitId).toBe(testUnitId);
          });
        });
    });

    it('should get levels with includeQuestions=true', () => {
      return request(app.getHttpServer())
        .get('/api/v1/levels?includeQuestions=true')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get levels with unitId and includeQuestions', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/levels?unitId=${testUnitId}&includeQuestions=true`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/levels')
        .expect(401);
    });
  });

  describe('GET /api/v1/levels/:id', () => {
    it('should get a specific level by integer ID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/levels/${createdLevelId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toBe(createdLevelId);
          expect(typeof res.body.id).toBe('number');
          expect(res.body).toHaveProperty('title');
          expect(res.body).toHaveProperty('unitId');
          expect(res.body).toHaveProperty('timeLimit');
          expect(res.body).toHaveProperty('passingScore');
          expect(res.body).toHaveProperty('progress');
        });
    });

    it('should get level with includeQuestions=true', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/levels/${createdLevelId}?includeQuestions=true`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdLevelId);
        });
    });

    it('should fail with non-existent ID (404)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/levels/999999')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });

    it('should fail with invalid ID format (400)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/levels/invalid-id')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/levels/${createdLevelId}`)
        .expect(401);
    });
  });

  describe('PATCH /api/v1/levels/:id', () => {
    it('should update a level as teacher', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/levels/${createdLevelId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Updated Level Title',
          description: 'Updated description',
          timeLimit: 450,
          passingScore: 75,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdLevelId);
          expect(res.body.title).toBe('Updated Level Title');
          expect(res.body.description).toBe('Updated description');
          expect(res.body.timeLimit).toBe(450);
          expect(res.body.passingScore).toBe(75);
        });
    });

    it('should update a level as agency', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/levels/${createdLevelId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          isActive: false,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdLevelId);
          expect(res.body.isActive).toBe(false);
        });
    });

    it('should fail to update as student (403)', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/levels/${createdLevelId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Update',
        })
        .expect(403);
    });

    it('should fail with non-existent ID (404)', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/levels/999999')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Non-existent',
        })
        .expect(404);
    });

    it('should fail with invalid passingScore (400)', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/levels/${createdLevelId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          passingScore: 200,
        })
        .expect(400);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/levels/${createdLevelId}`)
        .send({
          title: 'Unauthenticated Update',
        })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/levels/:id', () => {
    let deleteLevelId: number;

    beforeEach(async () => {
      const level = await request(app.getHttpServer())
        .post('/api/v1/levels')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'Delete Test Level',
          description: 'Will be deleted',
          unitId: testUnitId,
          orderIndex: 1000 + Date.now(),
        });

      deleteLevelId = level.body.id;
    });

    it('should delete a level as agency', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/levels/${deleteLevelId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(204);
    });

    it('should fail to delete as teacher (403)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/levels/${deleteLevelId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('should fail to delete as student (403)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/levels/${deleteLevelId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should fail with non-existent ID (404)', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/levels/999999')
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(404);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/levels/${deleteLevelId}`)
        .expect(401);
    });

    it('should verify deleted level is gone (404)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/levels/${deleteLevelId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(204);

      return request(app.getHttpServer())
        .get(`/api/v1/levels/${deleteLevelId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });
});
