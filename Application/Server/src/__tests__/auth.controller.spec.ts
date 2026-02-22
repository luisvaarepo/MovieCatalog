import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../modules/auth/auth.controller';
import { MoviesController } from '../modules/movies/movies.controller';
import { MoviesService } from '../modules/movies/movies.service';
import { AuthService } from '../modules/auth/auth.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockSvc = {
    login: jest.fn().mockResolvedValue({ access_token: 'abc' }),
    register: jest.fn().mockResolvedValue({ id: 2, username: 'newuser' }),
  };

  beforeAll(async () => {
    const moviesMock = { create: jest.fn().mockResolvedValue({ id: 2 }) };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, MoviesController],
      providers: [
        { provide: AuthService, useValue: mockSvc },
        { provide: MoviesService, useValue: moviesMock },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'u', password: 'p' })
      .expect(201)
      .expect({ access_token: 'abc' });
  });

  it('/api/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ username: 'u', password: 'p' })
      .expect(201)
      .expect({ user: { id: 2, username: 'newuser' } });
  });

  // Ensure login/register remain accessible without API token
  it('unauthorized access to protected endpoints should fail', () => {
    return request(app.getHttpServer()).post('/api/movies').send({}).expect(401);
  });
});
