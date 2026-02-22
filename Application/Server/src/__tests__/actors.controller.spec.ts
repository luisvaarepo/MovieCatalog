import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ActorsController } from '../modules/actors/actors.controller';
import { ActorsService } from '../modules/actors/actors.service';

describe('ActorsController (e2e)', () => {
  let app: INestApplication;

  const mockSvc = {
    findAll: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 }),
    searchByName: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 }),
    findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Test Actor' }),
    moviesForActor: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 2 }),
    update: jest.fn().mockResolvedValue({ id: 2 }),
    remove: jest.fn().mockResolvedValue({}),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ActorsController],
      providers: [{ provide: ActorsService, useValue: mockSvc }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/actors (GET)', () => {
    return request(app.getHttpServer()).get('/api/actors').expect(200).expect({ items: [], total: 0, page: 1, limit: 10 });
  });

  it('/api/actors/search (GET)', () => {
    return request(app.getHttpServer()).get('/api/actors/search').expect(200).expect({ items: [], total: 0, page: 1, limit: 10 });
  });

  it('/api/actors/:id (GET)', () => {
    return request(app.getHttpServer()).get('/api/actors/1').expect(200).expect({ id: 1, name: 'Test Actor' });
  });

  it('/api/actors/:id/movies (GET)', () => {
    return request(app.getHttpServer()).get('/api/actors/1/movies').expect(200).expect([]);
  });

  it('/api/actors (POST) - protected', () => {
    return request(app.getHttpServer())
      .post('/api/actors')
      .set('x-api-token', 'demo-supersecret-token')
      .send({ name: 'New Actor' })
      .expect(201)
      .expect({ id: 2 });
  });

  it('/api/actors/:id (PUT) - protected', () => {
    return request(app.getHttpServer())
      .put('/api/actors/2')
      .set('x-api-token', 'demo-supersecret-token')
      .send({ name: 'Updated' })
      .expect(200)
      .expect({ id: 2 });
  });

  it('/api/actors/:id (DELETE) - protected', () => {
    return request(app.getHttpServer())
      .delete('/api/actors/2')
      .set('x-api-token', 'demo-supersecret-token')
      .expect(200);
  });
});
