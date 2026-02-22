// Root application module for the backend. It wires up database connectivity,
// registers feature modules and applies global guards/providers.
//
// Responsibilities:
// - Configure TypeORM to use a local SQLite file for development.
// - Import feature modules (Movies, Actors, Ratings, Auth) so their
//   controllers/providers are available to Nest.
// - Register a global guard (JwtAuthGuard) that enforces authentication
//   for all routes by default. Endpoints can opt-out using the `@Public()`
//   decorator.
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesModule } from './modules/movies/movies.module';
import { ActorsModule } from './modules/actors/actors.module';
import { RatingsModule } from './ratings/ratings.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: join(__dirname, '..', 'data', 'database.sqlite'),
      entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
      synchronize: true,
    }),
    MoviesModule,
    ActorsModule,
    RatingsModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
