import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User',
        role: 'ADMIN',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body.message).toBe('Utilisateur créé avec succès');
      expect(response.body.user.email).toBe(registerDto.email);
      expect(response.body.user.name).toBe(registerDto.name);
      expect(response.body.user.role).toBe(registerDto.role);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should not register user with existing email', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User 2',
        role: 'ADMIN',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with correct credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'testpassword123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.user.email).toBe(loginDto.email);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should not login with incorrect credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    let token: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123',
        });

      token = loginResponse.body.access_token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe('test@example.com');
      expect(response.body.password).toBeUndefined();
    });

    it('should not get profile without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });
  });

  describe('POST /auth/validate-token', () => {
    let token: string;

    beforeAll(async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123',
        });

      token = loginResponse.body.access_token;
    });

    it('should validate valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/validate-token')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.valid).toBe(true);
      expect(response.body.user).toBeDefined();
    });
  });
}); 