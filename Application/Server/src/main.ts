// Entry point for the backend application.
// This file performs lightweight bootstrap tasks before handing control to NestJS.
//
// Responsibilities:
// - Load optional environment variables from a project .env file (best-effort).
// - Create the Nest application and apply global configuration (prefix, pipes, CORS).
// - Mount a minimal Swagger UI early so documentation is available even if
//   full Swagger assembly fails later (helps development and quick API discovery).
// - Optionally initialize full Swagger when ENABLE_SWAGGER=true (scans only a
//   limited set of controllers to avoid scanner issues).
//
// Note: This file intentionally uses try/catch liberally to make the bootstrap
// resilient in environments where optional dependencies (dotenv, swagger-ui-express,
// @nestjs/swagger) are not installed or where initialization order differs.
import 'reflect-metadata';
// load environment variables from .env if present (non-fatal)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
} catch (e) {
  // ignore if dotenv not available
}
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // create Nest application and apply common global settings
  const app = await NestFactory.create(AppModule);
  // prefix all application routes with /api to separate API from other routes
  app.setGlobalPrefix('api');
  // enable CORS if possible so the frontend running on a different origin can
  // call the API during development. Failures are non-fatal and logged.
  try {
    app.enableCors();
  } catch (err) {
    // ignore if enabling CORS fails in some environments
    // eslint-disable-next-line no-console
    const e: any = err;
    console.warn('enableCors failed:', e?.message || e);
  }
  // Use Nest's ValidationPipe globally to strip unknown properties by default
  // and perform DTO validation. For now forbidNonWhitelisted is false to avoid
  // breaking clients during development.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }));
  // Mount a minimal, hard-coded Swagger document early. This is intentionally
  // light-weight and does not require scanning all controllers or decorators.
  // It allows developers to open /api/docs even if the full swagger generation
  // fails later due to environment differences or missing optional packages.
  let mountedMinimalEarly = false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const swaggerUi = require('swagger-ui-express');
    // minimal document contains just enough metadata and paths to be useful
    const minDoc = {
      openapi: '3.0.0',
      tags: [
        { name: 'Movies', description: 'Movie endpoints' },
        { name: 'Actors', description: 'Actor endpoints' },
        { name: 'Ratings', description: 'Rating endpoints' },
        { name: 'Auth', description: 'Authentication endpoints' },
      ],
      info: { title: 'Movie Catalog API', version: '1.0.0' },
      components: {
        securitySchemes: {
          jwt: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          'api-token': { type: 'apiKey', name: 'x-api-token', in: 'header' },
        },
      },
      security: [{ jwt: [] }, { 'api-token': [] }],
      paths: {
        '/api/movies': {
          get: { tags: ['Movies'], summary: 'List movies', responses: { '200': { description: 'OK' } } },
          post: { tags: ['Movies'], summary: 'Create movie', security: [{ 'api-token': [] }], responses: { '201': { description: 'Created' } } },
        },
        '/api/movies/search': { get: { tags: ['Movies'], summary: 'Search movies', responses: { '200': { description: 'OK' } } } },
        '/api/movies/{id}': { get: { tags: ['Movies'], summary: 'Get movie' }, put: { tags: ['Movies'], summary: 'Update movie', security: [{ 'api-token': [] }] }, delete: { tags: ['Movies'], summary: 'Delete movie', security: [{ 'api-token': [] }] } },
        '/api/actors': {
            get: { tags: ['Actors'], summary: 'List actors', responses: { '200': { description: 'OK' } } },
            post: { tags: ['Actors'], summary: 'Create actor', responses: { '200': { description: 'OK' } }, security: [{ 'api-token': [] }] }
        },
        '/api/actors/search': { get: { tags: ['Actors'], summary: 'Search actors', responses: { '200': { description: 'OK' } } } },
        '/api/actors/{id}': { get: { tags: ['Actors'], summary: 'Get actor', responses: { '200': { description: 'OK' } } }, put: { tags: ['Actors'], summary: 'Update actor', security: [{ 'api-token': [] }] }, delete: { tags: ['Actors'], summary: 'Delete actor', security: [{ 'api-token': [] }] } },
        '/api/actors/{id}/movies': { get: { tags: ['Actors'], summary: 'List movies for actor', responses: { '200': { description: 'OK' } } } },
        '/api/ratings': { get: { tags: ['Ratings'], summary: 'List ratings', responses: { '200': { description: 'OK' } } }, post: { tags: ['Ratings'], summary: 'Create rating', security: [{ 'api-token': [] }] } },
        '/api/ratings/{id}': { get: { tags: ['Ratings'], summary: 'Get rating', responses: { '200': { description: 'OK' } } }, put: { tags: ['Ratings'], summary: 'Update rating', security: [{ 'api-token': [] }] }, delete: { tags: ['Ratings'], summary: 'Delete rating', security: [{ 'api-token': [] }] } },
        '/api/auth/login': { post: { tags: ['Auth'], summary: 'Login and obtain JWT' } },
        '/api/auth/register': { post: { tags: ['Auth'], summary: 'Register a new user' } },
      },
    };
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(minDoc));
    app.use('/docs', (_req: any, res: any) => res.redirect('/api/docs'));
    app.use('/swagger', (_req: any, res: any) => res.redirect('/api/docs'));
    mountedMinimalEarly = true;
    console.log('Mounted early minimal Swagger UI at /api/docs');
  } catch (e) {
    // ignore if swagger-ui-express not installed - we fall back later
  }

  // initialize the application to make module metadata available for full
  // Swagger document generation. Non-fatal: continue even if init fails.
  try {
    await app.init();
  } catch (err) {
    const e: any = err;
    console.warn('App init failed (continuing):', e?.message || e);
  }

  // Initialize full Swagger only when explicitly requested via ENABLE_SWAGGER
  // environment variable. Full Swagger generation requires @nestjs/swagger
  // and can trigger broad metadata scanning; keep it opt-in to avoid issues
  // in constrained environments and CI.
  let swaggerInitialized = false;
  if (process.env.ENABLE_SWAGGER === 'true') {
    try {
      const swagger = await import('@nestjs/swagger');
      const DocumentBuilder = swagger.DocumentBuilder;
      const SwaggerModule = swagger.SwaggerModule;
      const config = new DocumentBuilder()
        .setTitle('Movie Catalog API')
        .setDescription('API for managing movies, actors and ratings')
        .setVersion('1.0')
        // API token header used for administrative endpoints (API Key)
        .addApiKey({ type: 'apiKey', name: 'x-api-token', in: 'header' }, 'api-token')
        // Standard JWT bearer auth for user authentication
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'jwt')
        .addTag('Movies', 'Movie endpoints')
        .addTag('Actors', 'Actor endpoints')
        .addTag('Ratings', 'Rating endpoints')
        .addTag('Auth', 'Authentication endpoints')
        .build();
      try {
        // Import controllers explicitly and limit scanning to them to avoid scanner issues
        const moviesCtrl = (await import('./modules/movies/movies.controller')).MoviesController;
        const actorsCtrl = (await import('./modules/actors/actors.controller')).ActorsController;
        const ratingsCtrl = (await import('./ratings/ratings.controller')).RatingsController;
        const authCtrl = (await import('./modules/auth/auth.controller')).AuthController;
        const document = SwaggerModule.createDocument(app, config, { include: [moviesCtrl, actorsCtrl, ratingsCtrl, authCtrl] });
        // ensure security schemes are present in the generated document
        document.components = document.components || {};
        document.components.securitySchemes = document.components.securitySchemes || {};
        document.components.securitySchemes['api-token'] = document.components.securitySchemes['api-token'] || { type: 'apiKey', in: 'header', name: 'x-api-token' };
        document.components.securitySchemes['jwt'] = document.components.securitySchemes['jwt'] || { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' };
        // apply global security requirements so Swagger UI shows Authorize button for JWT and API token
        document.security = [{ jwt: [] }, { 'api-token': [] }];
        SwaggerModule.setup('api/docs', app, document);
        // provide a legacy alias for /swagger where possible
        try {
          const express = app.getHttpAdapter().getInstance();
          express.get('/swagger', (_req: any, res: any) => res.redirect('/api/docs'));
        } catch (e) {
          // ignore if adapter not available
        }
        swaggerInitialized = true;
      } catch (err) {
        const e: any = err;
        console.warn('Failed to initialize Swagger document:', e?.stack || e?.message || e);
      }
    } catch (err) {
      const e: any = err;
      console.warn('Swagger module not available:', e?.message || e);
    }
  } else {
    console.log('Swagger disabled. Set ENABLE_SWAGGER=true to enable docs.');
  }
  // Always attempt to provide a legacy /swagger redirect. If full swagger
  // initialization failed earlier, try to mount a minimal swagger-ui-express
  // document at /api/docs as a last resort. If even that is unavailable, a
  // simple HTML page explains how to enable docs.
  try {
    const express = app.getHttpAdapter().getInstance();
    express.get('/swagger', (_req: any, res: any) => res.redirect('/api/docs'));
    express.get('/swagger/', (_req: any, res: any) => res.redirect('/api/docs'));
    if (!swaggerInitialized) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const swaggerUi = require('swagger-ui-express');
        const minDoc = {
          openapi: '3.0.0',
          tags: [
            { name: 'Movies', description: 'Movie endpoints' },
            { name: 'Actors', description: 'Actor endpoints' },
            { name: 'Ratings', description: 'Rating endpoints' },
            { name: 'Auth', description: 'Authentication endpoints' },
          ],
          info: { title: 'Movie Catalog API (minimal)', version: '1.0.0' },
          components: {
            securitySchemes: {
              bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              apiToken: { type: 'apiKey', name: 'x-api-token', in: 'header' },
            },
          },
          security: [{ bearerAuth: [] }, { apiToken: [] }],
          paths: {
            '/api/movies': {
              get: { tags: ['Movies'], summary: 'List movies', responses: { '200': { description: 'OK' } } },
              post: {
                tags: ['Movies'],
                summary: 'Create movie',
                security: [{ apiToken: [] }],
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, actorIds: { type: 'array', items: { type: 'integer' } } } } } } },
                responses: { '201': { description: 'Created' } },
              },
            },
            '/api/movies/search': { get: { tags: ['Movies'], summary: 'Search movies', responses: { '200': { description: 'OK' } } } },
            '/api/movies/{id}': {
              get: { tags: ['Movies'], summary: 'Get movie by id', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
              put: { tags: ['Movies'], summary: 'Update movie', security: [{ apiToken: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'Updated' } } },
              delete: { tags: ['Movies'], summary: 'Delete movie', security: [{ apiToken: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '204': { description: 'No Content' } } },
            },
            '/api/actors': {
              get: { tags: ['Actors'], summary: 'List actors', responses: { '200': { description: 'OK' } } },
              post: { tags: ['Actors'], summary: 'Create actor', security: [{ apiToken: [] }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, bio: { type: 'string' } } } } } }, responses: { '201': { description: 'Created' } } },
            },
            '/api/actors/search': { get: { tags: ['Actors'], summary: 'Search actors', responses: { '200': { description: 'OK' } } } },
            '/api/actors/{id}': {
              get: { tags: ['Actors'], summary: 'Get actor', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
              put: { tags: ['Actors'], summary: 'Update actor', security: [{ apiToken: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'Updated' } } },
              delete: { tags: ['Actors'], summary: 'Delete actor', security: [{ apiToken: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '204': { description: 'No Content' } } },
            },
            '/api/actors/{id}/movies': { get: { tags: ['Actors'], summary: 'List movies for actor', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } } },
            '/api/ratings': {
              get: { tags: ['Ratings'], summary: 'List ratings', responses: { '200': { description: 'OK' } } },
              post: { tags: ['Ratings'], summary: 'Create rating', security: [{ apiToken: [] }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { movieId: { type: 'integer' }, score: { type: 'number' }, review: { type: 'string' } } } } } }, responses: { '201': { description: 'Created' } } },
            },
            '/api/ratings/{id}': {
              get: { tags: ['Ratings'], summary: 'Get rating', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
              put: { tags: ['Ratings'], summary: 'Update rating', security: [{ apiToken: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { '200': { description: 'Updated' } } },
              delete: { tags: ['Ratings'], summary: 'Delete rating', security: [{ apiToken: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '204': { description: 'No Content' } } },
            },
            '/api/auth/login': { post: { tags: ['Auth'], summary: 'Login and obtain JWT', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { '200': { description: 'OK' } } } },
            '/api/auth/register': { post: { tags: ['Auth'], summary: 'Register a new user', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { '201': { description: 'Created' } } } },
          },
        };
        // Mount via Nest app directly at /api/docs to avoid global-prefix issues
        app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(minDoc));
        // provide short redirects
        app.use('/docs', (_req: any, res: any) => res.redirect('/api/docs'));
        app.use('/swagger', (_req: any, res: any) => res.redirect('/api/docs'));
        swaggerInitialized = true;
        console.log('Mounted minimal Swagger UI at /api/docs');
      } catch (err) {
        // fallback simple HTML if swagger-ui-express is not available
        app.use('/api/docs', (_req: any, res: any) => {
          res.status(200).send(`
            <html><body>
              <h1>API Docs</h1>
              <p>Swagger UI is not available. To enable Swagger set <code>ENABLE_SWAGGER=true</code> and restart the server.</p>
              <p>Protected endpoints require header <code>x-api-token: demo-supersecret-token</code>.</p>
            </body></html>
          `);
        });
      }
    }
  } catch (e) {
    // ignore environment-specific errors when trying to access the underlying adapter
  }
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`Server listening on http://localhost:${port}`);
}

bootstrap();
