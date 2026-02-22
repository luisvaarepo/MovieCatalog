import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MoviesController } from '../modules/movies/movies.controller';
import { MoviesService } from '../modules/movies/movies.service';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;

  const mockSvc = {
    findAll: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 }),
    searchByTitle: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 }),
    findOne: jest.fn().mockResolvedValue({ id: 1, title: 'Test Movie' }),
    create: jest.fn().mockResolvedValue({ id: 2 }),
    update: jest.fn().mockResolvedValue({ id: 2 }),
    remove: jest.fn().mockResolvedValue({}),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [{ provide: MoviesService, useValue: mockSvc }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/movies (GET)', () => {
    return request(app.getHttpServer()).get('/api/movies').expect(200).expect({ items: [], total: 0, page: 1, limit: 10 });
  });

  it('/api/movies/search (GET)', () => {
    return request(app.getHttpServer()).get('/api/movies/search').expect(200).expect({ items: [], total: 0, page: 1, limit: 10 });
  });

  it('/api/movies/:id (GET)', () => {
    return request(app.getHttpServer()).get('/api/movies/1').expect(200).expect({ id: 1, title: 'Test Movie' });
  });

  it('/api/movies (POST) - protected', () => {
    return request(app.getHttpServer())
      .post('/api/movies')
      .set('x-api-token', 'demo-supersecret-token')
      .send({ title: 'New' })
      .expect(201)
      .expect({ id: 2 });
  });

  it('/api/movies/:id (PUT) - protected', () => {
    return request(app.getHttpServer())
      .put('/api/movies/2')
      .set('x-api-token', 'demo-supersecret-token')
      .send({ title: 'Updated' })
      .expect(200)
      .expect({ id: 2 });
  });

  it('/api/movies/:id (DELETE) - protected', () => {
    return request(app.getHttpServer())
      .delete('/api/movies/2')
      .set('x-api-token', 'demo-supersecret-token')
      .expect(200);
  });
});
