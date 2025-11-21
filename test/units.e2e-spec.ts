import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Units (e2e)', () => {
  let app: INestApplication;
  let studentToken: string;
  let teacherToken: string;
  let agencyToken: string;
  let testChapterId: number;
  let createdUnitId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Register and login as student
    const studentEmail = `student-units-${Date.now()}@example.com`;
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
    const teacherEmail = `teacher-units-${Date.now()}@example.com`;
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
    const agencyEmail = `agency-units-${Date.now()}@example.com`;
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
        title: 'Chapter for Units Test',
        description: 'Parent chapter for unit tests',
        orderIndex: 30000 + Date.now(),
      });

    testChapterId = chapter.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/units', () => {
    it('should create a unit as teacher', () => {
      return request(app.getHttpServer())
        .post('/api/v1/units')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Test Unit',
          description: 'Test unit description',
          chapterId: testChapterId,
          orderIndex: 1,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(typeof res.body.id).toBe('number');
          expect(res.body.title).toBe('Test Unit');
          expect(res.body.description).toBe('Test unit description');
          expect(res.body.chapterId).toBe(testChapterId);
          expect(res.body.orderIndex).toBe(1);
          expect(res.body.isActive).toBe(true);
          createdUnitId = res.body.id;
        });
    });

    it('should create a unit as agency', () => {
      return request(app.getHttpServer())
        .post('/api/v1/units')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'Agency Unit',
          description: 'Created by agency',
          chapterId: testChapterId,
          orderIndex: 2,
        })
        .expect(201);
    });

    it('should fail to create unit as student (403)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/units')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Unit',
          description: 'Should fail',
          chapterId: testChapterId,
          orderIndex: 3,
        })
        .expect(403);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/units')
        .send({
          title: 'Unauthenticated Unit',
          description: 'Should fail',
          chapterId: testChapterId,
          orderIndex: 4,
        })
        .expect(401);
    });

    it('should fail with missing required fields (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/units')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          description: 'Missing title and chapterId',
        })
        .expect(400);
    });

    it('should fail with invalid chapterId type (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/units')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Invalid Chapter ID',
          description: 'Test',
          chapterId: 'not-a-number',
          orderIndex: 5,
        })
        .expect(400);
    });

    it('should fail with non-existent chapterId (404)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/units')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Non-existent Chapter',
          description: 'Test',
          chapterId: 999999,
          orderIndex: 6,
        })
        .expect(404);
    });

    it('should fail with negative orderIndex (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/units')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Invalid Order',
          description: 'Test',
          chapterId: testChapterId,
          orderIndex: -1,
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/units', () => {
    it('should get all units as student with progress', () => {
      return request(app.getHttpServer())
        .get('/api/v1/units')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(typeof res.body[0].id).toBe('number');
            expect(res.body[0]).toHaveProperty('title');
            expect(res.body[0]).toHaveProperty('chapterId');
            expect(res.body[0]).toHaveProperty('progress');
          }
        });
    });

    it('should filter units by chapterId', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/units?chapterId=${testChapterId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((unit: any) => {
            expect(unit.chapterId).toBe(testChapterId);
          });
        });
    });

    it('should get units with includeLevels=true', () => {
      return request(app.getHttpServer())
        .get('/api/v1/units?includeLevels=true')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get units with chapterId and includeLevels', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/units?chapterId=${testChapterId}&includeLevels=true`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/units')
        .expect(401);
    });
  });

  describe('GET /api/v1/units/:id', () => {
    it('should get a specific unit by integer ID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/units/${createdUnitId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toBe(createdUnitId);
          expect(typeof res.body.id).toBe('number');
          expect(res.body).toHaveProperty('title');
          expect(res.body).toHaveProperty('chapterId');
          expect(res.body).toHaveProperty('progress');
        });
    });

    it('should get unit with includeLevels=true', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/units/${createdUnitId}?includeLevels=true`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdUnitId);
        });
    });

    it('should fail with non-existent ID (404)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/units/999999')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });

    it('should fail with invalid ID format (400)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/units/invalid-id')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/units/${createdUnitId}`)
        .expect(401);
    });
  });

  describe('PATCH /api/v1/units/:id', () => {
    it('should update a unit as teacher', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/units/${createdUnitId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Updated Unit Title',
          description: 'Updated description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdUnitId);
          expect(res.body.title).toBe('Updated Unit Title');
          expect(res.body.description).toBe('Updated description');
        });
    });

    it('should update a unit as agency', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/units/${createdUnitId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          isActive: false,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdUnitId);
          expect(res.body.isActive).toBe(false);
        });
    });

    it('should fail to update as student (403)', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/units/${createdUnitId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Update',
        })
        .expect(403);
    });

    it('should fail with non-existent ID (404)', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/units/999999')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Non-existent',
        })
        .expect(404);
    });

    it('should fail with invalid data (400)', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/units/${createdUnitId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          orderIndex: -5,
        })
        .expect(400);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/units/${createdUnitId}`)
        .send({
          title: 'Unauthenticated Update',
        })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/units/:id', () => {
    let deleteUnitId: number;

    beforeEach(async () => {
      const unit = await request(app.getHttpServer())
        .post('/api/v1/units')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'Delete Test Unit',
          description: 'Will be deleted',
          chapterId: testChapterId,
          orderIndex: 1000 + Date.now(),
        });

      deleteUnitId = unit.body.id;
    });

    it('should delete a unit as agency', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/units/${deleteUnitId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(204);
    });

    it('should fail to delete as teacher (403)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/units/${deleteUnitId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('should fail to delete as student (403)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/units/${deleteUnitId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should fail with non-existent ID (404)', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/units/999999')
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(404);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/units/${deleteUnitId}`)
        .expect(401);
    });

    it('should verify deleted unit is gone (404)', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/units/${deleteUnitId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(204);

      return request(app.getHttpServer())
        .get(`/api/v1/units/${deleteUnitId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });
  });
});
