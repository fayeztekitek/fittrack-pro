import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { IntegrationSetup } from './shared/setup';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { UsersModule } from '../../src/modules/users/users.module';
import { ActivitiesModule } from '../../src/modules/activities/activities.module';
import { AuditModule } from '../../src/modules/audit/audit.module';
import { RedisModule } from '../../src/modules/redis/redis.module';

describe('Auth Integration', () => {
  let app: INestApplication;
  let setup: IntegrationSetup;

  beforeAll(async () => {
    setup = new IntegrationSetup();
    await setup.start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            type: 'postgres',
            host: setup.dbConfig.host,
            port: setup.dbConfig.port,
            username: setup.dbConfig.username,
            password: setup.dbConfig.password,
            database: setup.dbConfig.database,
            autoLoadEntities: true,
            synchronize: true,
            logging: false,
          }),
        }),
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 100 }] }),
        AuditModule,
        RedisModule,
        UsersModule,
        ActivitiesModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await setup.stop();
  });

  const registerDto = {
    email: 'integration-test@example.com',
    password: 'TestPass123!',
    name: 'Integration Tester',
    weightKg: 75,
    heightCm: 180,
    age: 30,
    gender: 'male',
    stepGoal: 10000,
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('integration-test@example.com');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'integration-test@example.com', password: 'TestPass123!' })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe('integration-test@example.com');
    });

    it('should reject wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'integration-test@example.com', password: 'wrong' })
        .expect(401);
    });

    it('should reject non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'noone@example.com', password: 'TestPass123!' })
        .expect(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'integration-test@example.com', password: 'TestPass123!' });

      const res = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: loginRes.body.refreshToken })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });
});
