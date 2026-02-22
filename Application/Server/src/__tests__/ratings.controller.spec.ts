import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { RatingsController } from '../ratings/ratings.controller';
import { RatingsService } from '../ratings/ratings.service';

describe('RatingsController (e2e)', () => {
  let app: INestApplication;

  const mockSvc = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 1, score: 5 }),
    create: jest.fn().mockResolvedValue({ id: 2 }),
    update: jest.fn().mockResolvedValue({ id: 2 }),
    remove: jest.fn().mockResolvedValue({}),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RatingsController],
      providers: [{ provide: RatingsService, useValue: mockSvc }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/ratings (GET)', () => {
    return request(app.getHttpServer()).get('/api/ratings').expect(200).expect([]);
  });

  it('/api/ratings/:id (GET)', () => {
    return request(app.getHttpServer()).get('/api/ratings/1').expect(200).expect({ id: 1, score: 5 });
  });

  it('/api/ratings (POST) - protected', () => {
    return request(app.getHttpServer())
      .post('/api/ratings')
      .set('x-api-token', 'demo-supersecret-token')
      .send({ movieId: 1, score: 4 })
      .expect(201)
      .expect({ id: 2 });
  });

  it('/api/ratings/:id (PUT) - protected', () => {
    return request(app.getHttpServer())
      .put('/api/ratings/2')
      .set('x-api-token', 'demo-supersecret-token')
      .send({ score: 5 })
      .expect(200)
      .expect({ id: 2 });
  });

  it('/api/ratings/:id (DELETE) - protected', () => {
    return request(app.getHttpServer())
      .delete('/api/ratings/2')
      .set('x-api-token', 'demo-supersecret-token')
      .expect(200);
  });
});
