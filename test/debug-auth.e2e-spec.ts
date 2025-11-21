import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Debug Auth (e2e)', () => {
  let app: INestApplication;

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

  it('should register and login', async () => {
    const email = `test-${Date.now()}@example.com`;

    // Register
    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: email,
        username: `test${Date.now()}`,
        password: 'SecurePass123!',
        fullName: 'Test User',
        role: 'teacher',
      })
      .expect(201);

    console.log('Register response:', registerResponse.body);

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: email,
        password: 'SecurePass123!',
      })
      .expect(200);

    console.log('Login response:', loginResponse.body);
    const token = loginResponse.body.accessToken;
    console.log('Token:', token);

    // Try to access protected route
    const meResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    console.log('Me response:', meResponse.body);

    // Try to create chapter
    const chapterResponse = await request(app.getHttpServer())
      .post('/api/v1/chapters')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Chapter',
        description: 'Test',
        orderIndex: Date.now(),
      });

    console.log('Chapter response status:', chapterResponse.status);
    console.log('Chapter response body:', chapterResponse.body);
  });
});
