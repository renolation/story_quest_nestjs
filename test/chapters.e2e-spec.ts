import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Chapters (e2e)', () => {
  let app: INestApplication;
  let studentToken: string;
  let teacherToken: string;
  let agencyToken: string;
  let createdChapterId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Register student (registration returns token)
    const studentEmail = `student-chapters-${Date.now()}@example.com`;
    const studentReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: studentEmail,
        username: `student${Date.now()}`,
        password: 'SecurePass123!',
        fullName: 'Student User',
        role: 'student',
      });

    studentToken = studentReg.body.access_token;

    // Register teacher (registration returns token)
    const teacherEmail = `teacher-chapters-${Date.now()}@example.com`;
    const teacherReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: teacherEmail,
        username: `teacher${Date.now()}`,
        password: 'SecurePass123!',
        fullName: 'Teacher User',
        role: 'teacher',
      });

    teacherToken = teacherReg.body.access_token;

    // Register agency (registration returns token)
    const agencyEmail = `agency-chapters-${Date.now()}@example.com`;
    const agencyReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: agencyEmail,
        username: `agency${Date.now()}`,
        password: 'SecurePass123!',
        fullName: 'Agency User',
        role: 'agency',
      });

    agencyToken = agencyReg.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/chapters', () => {
    it('should create a chapter as teacher', () => {
      return request(app.getHttpServer())
        .post('/api/v1/chapters')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Test Chapter',
          description: 'Test chapter description',
          orderIndex: 1000 + Date.now(),
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(typeof res.body.id).toBe('number');
          expect(res.body.title).toBe('Test Chapter');
          expect(res.body.description).toBe('Test chapter description');
          expect(res.body.isActive).toBe(true);
          createdChapterId = res.body.id;
        });
    });

    it('should create a chapter as agency', () => {
      return request(app.getHttpServer())
        .post('/api/v1/chapters')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'Agency Chapter',
          description: 'Created by agency',
          orderIndex: 2000 + Date.now(),
        })
        .expect(201);
    });

    it('should fail to create chapter as student (403)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/chapters')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Chapter',
          description: 'Should fail',
          orderIndex: 3000 + Date.now(),
        })
        .expect(403);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/chapters')
        .send({
          title: 'Unauthenticated Chapter',
          description: 'Should fail',
          orderIndex: 4000 + Date.now(),
        })
        .expect(401);
    });

    it('should fail with missing required fields (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/chapters')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          description: 'Missing title',
        })
        .expect(400);
    });

    it('should fail with invalid orderIndex (400)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/chapters')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Invalid Order',
          description: 'Test',
          orderIndex: -1,
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/chapters', () => {
    it('should get all chapters as student with progress', () => {
      return request(app.getHttpServer())
        .get('/api/v1/chapters')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('id');
            expect(typeof res.body[0].id).toBe('number');
            expect(res.body[0]).toHaveProperty('title');
            expect(res.body[0]).toHaveProperty('description');
            expect(res.body[0]).toHaveProperty('orderIndex');
            expect(res.body[0]).toHaveProperty('progress');
          }
        });
    });

    it('should get all chapters as teacher', () => {
      return request(app.getHttpServer())
        .get('/api/v1/chapters')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get chapters with includeUnits=true', () => {
      return request(app.getHttpServer())
        .get('/api/v1/chapters?includeUnits=true')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0 && res.body[0].units) {
            expect(Array.isArray(res.body[0].units)).toBe(true);
          }
        });
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/chapters')
        .expect(401);
    });
  });

  describe('GET /api/v1/chapters/:id', () => {
    it('should get a specific chapter by integer ID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/chapters/${createdChapterId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.id).toBe(createdChapterId);
          expect(typeof res.body.id).toBe('number');
          expect(res.body).toHaveProperty('title');
          expect(res.body).toHaveProperty('progress');
        });
    });

    it('should get chapter with includeUnits=true', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/chapters/${createdChapterId}?includeUnits=true`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdChapterId);
        });
    });

    it('should fail with non-existent ID (404)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/chapters/999999')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });

    it('should fail with invalid ID format (400)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/chapters/invalid-id')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/chapters/${createdChapterId}`)
        .expect(401);
    });
  });

  describe('PATCH /api/v1/chapters/:id', () => {
    it('should update a chapter as teacher', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/chapters/${createdChapterId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Updated Chapter Title',
          description: 'Updated description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdChapterId);
          expect(res.body.title).toBe('Updated Chapter Title');
          expect(res.body.description).toBe('Updated description');
        });
    });

    it('should update a chapter as agency', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/chapters/${createdChapterId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          isActive: false,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdChapterId);
          expect(res.body.isActive).toBe(false);
        });
    });

    it('should fail to update as student (403)', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/chapters/${createdChapterId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Update',
        })
        .expect(403);
    });

    it('should fail with non-existent ID (404)', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/chapters/999999')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Non-existent',
        })
        .expect(404);
    });

    it('should fail with invalid data (400)', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/chapters/${createdChapterId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          orderIndex: -5,
        })
        .expect(400);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/chapters/${createdChapterId}`)
        .send({
          title: 'Unauthenticated Update',
        })
        .expect(401);
    });
  });

  describe('PATCH /api/v1/chapters/reorder/bulk', () => {
    let chapterId1: number;
    let chapterId2: number;

    beforeAll(async () => {
      const ch1 = await request(app.getHttpServer())
        .post('/api/v1/chapters')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Reorder Chapter 1',
          description: 'Test',
          orderIndex: 10000 + Date.now(),
        });

      chapterId1 = ch1.body.id;

      const ch2 = await request(app.getHttpServer())
        .post('/api/v1/chapters')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Reorder Chapter 2',
          description: 'Test',
          orderIndex: 10001 + Date.now(),
        });

      chapterId2 = ch2.body.id;
    });

    it('should reorder chapters as teacher', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/chapters/reorder/bulk')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          chapters: [
            { id: chapterId1, orderIndex: 200 },
            { id: chapterId2, orderIndex: 100 },
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success');
          expect(res.body.success).toBe(true);
        });
    });

    it('should fail to reorder as student (403)', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/chapters/reorder/bulk')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          chapters: [
            { id: chapterId1, orderIndex: 300 },
          ],
        })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/chapters/:id', () => {
    let deleteChapterId: number;

    beforeEach(async () => {
      const ch = await request(app.getHttpServer())
        .post('/api/v1/chapters')
        .set('Authorization', `Bearer ${agencyToken}`)
        .send({
          title: 'Delete Test Chapter',
          description: 'Will be deleted',
          orderIndex: 20000 + Date.now(),
        });

      deleteChapterId = ch.body.id;
    });

    it('should delete a chapter as agency', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/chapters/${deleteChapterId}`)
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(204);
    });

    it('should fail to delete as teacher (403)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/chapters/${deleteChapterId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(403);
    });

    it('should fail to delete as student (403)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/chapters/${deleteChapterId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should fail with non-existent ID (404)', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/chapters/999999')
        .set('Authorization', `Bearer ${agencyToken}`)
        .expect(404);
    });

    it('should fail without authentication (401)', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/chapters/${deleteChapterId}`)
        .expect(401);
    });
  });
});
