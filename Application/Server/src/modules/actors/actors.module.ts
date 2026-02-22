import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actor } from './actor.entity';
import { ActorsService } from './actors.service';
import { ActorsController } from './actors.controller';
import { Movie } from '../movies/movie.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Actor, Movie])],
  providers: [ActorsService],
  controllers: [ActorsController],
  exports: [ActorsService],
})
export class ActorsModule {}
