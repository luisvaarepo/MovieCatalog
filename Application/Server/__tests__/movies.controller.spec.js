"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = __importStar(require("supertest"));
const movies_controller_1 = require("../src/modules/movies/movies.controller");
describe('MoviesController (e2e)', () => {
    let app;
    const mockSvc = {
        findAll: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 }),
        searchByTitle: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 }),
        findOne: jest.fn().mockResolvedValue({ id: 1, title: 'Test Movie' }),
        create: jest.fn().mockResolvedValue({ id: 2 }),
        update: jest.fn().mockResolvedValue({ id: 2 }),
        remove: jest.fn().mockResolvedValue({}),
    };
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            controllers: [movies_controller_1.MoviesController],
        })
            .overrideProvider('MoviesService')
            .useValue(mockSvc)
            .compile();
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
});
//# sourceMappingURL=movies.controller.spec.js.map