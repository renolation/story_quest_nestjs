import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: number;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new student', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          username: `testuser${Date.now()}`,
          password: 'SecurePass123!',
          fullName: 'Test User',
          role: 'student',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(typeof res.body.id).toBe('number');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('username');
          expect(res.body.role).toBe('student');
          userId = res.body.id;
        });
    });

    it('should fail with validation errors for missing fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid',
        })
        .expect(400);
    });

    it('should fail with duplicate email', async () => {
      const uniqueEmail = `duplicate-${Date.now()}@example.com`;

      // First registration
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: uniqueEmail,
          username: `user1${Date.now()}`,
          password: 'SecurePass123!',
          fullName: 'User One',
          role: 'student',
        })
        .expect(201);

      // Duplicate registration
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: uniqueEmail,
          username: `user2${Date.now()}`,
          password: 'SecurePass123!',
          fullName: 'User Two',
          role: 'student',
        })
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    const testEmail = `login-test-${Date.now()}@example.com`;
    const testPassword = 'SecurePass123!';

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          username: `loginuser${Date.now()}`,
          password: testPassword,
          fullName: 'Login Test User',
          role: 'student',
        });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testEmail);
          expect(typeof res.body.user.id).toBe('number');
          authToken = res.body.access_token;
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401);
    });

    it('should fail with validation errors', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('/auth/me (GET)', () => {
    it('should get current user with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(typeof res.body.id).toBe('number');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('role');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);
    });
  });

  describe('/auth/change-password (PATCH)', () => {
    const testEmail = `password-change-${Date.now()}@example.com`;
    const oldPassword = 'OldPassword123!';
    const newPassword = 'NewPassword456!';
    let userToken: string;

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          username: `pwuser${Date.now()}`,
          password: oldPassword,
          fullName: 'Password Test User',
          role: 'student',
        });

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: oldPassword,
        });

      userToken = loginRes.body.access_token;
    });

    it('should change password with valid current password', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: oldPassword,
          newPassword: newPassword,
        })
        .expect(200);
    });

    it('should login with new password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: newPassword,
        })
        .expect(200);
    });

    it('should fail with wrong current password', async () => {
      return request(app.getHttpServer())
        .patch('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'AnotherNew123!',
        })
        .expect(401);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/auth/change-password')
        .send({
          currentPassword: oldPassword,
          newPassword: 'AnotherNew123!',
        })
        .expect(401);
    });
  });
});
