import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Movie } from './movie.entity';
import { Actor } from '../actors/actor.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
    @InjectRepository(Actor)
    private readonly actorRepo: Repository<Actor>,
  ) {}

  // Create a movie entity. If actor IDs are provided, attempt to load and
  // associate those actors. Uses repository.save() which will insert or update
  // as appropriate for the entity state.
  async create(dto: CreateMovieDto) {
    const movie = new Movie();
    movie.title = dto.title;
    movie.description = dto.description;
    if (dto.actorIds && dto.actorIds.length) {
      movie.actors = await this.actorRepo.findByIds(dto.actorIds);
    }
    return this.movieRepo.save(movie);
  }

  // Return paginated results for movies including relations. Uses
  // findAndCount() to supply total for client-side paging.
  async findAll(page = 1, limit = 10): Promise<{ items: Movie[]; total: number; page: number; limit: number }> {
    const take = limit;
    const skip = (page - 1) * limit;
    const [items, total] = await this.movieRepo.findAndCount({ relations: ['actors', 'ratings'], take, skip, order: { id: 'ASC' } });
    return { items, total, page, limit };
  }

  // Load a single movie by id including its actors and ratings. Throws
  // NotFoundException if the entity does not exist to produce a 404 response.
  async findOne(id: number) {
    const m = await this.movieRepo.findOne({ where: { id }, relations: ['actors', 'ratings'] });
    if (!m) throw new NotFoundException('Movie not found');
    return m;
  }

  // Update a movie. Partial updates are supported by checking for undefined
  // fields. Actor associations are replaced when provided.
  async update(id: number, dto: UpdateMovieDto) {
    const movie = await this.findOne(id);
    if (dto.title) movie.title = dto.title;
    if (dto.description !== undefined) movie.description = dto.description;
    if (dto.actorIds) movie.actors = await this.actorRepo.findByIds(dto.actorIds);
    return this.movieRepo.save(movie);
  }

  // Remove a movie entity. The movie is loaded first to ensure existence and
  // to allow cascade behavior (ratings) to run if configured.
  async remove(id: number) {
    const movie = await this.findOne(id);
    return this.movieRepo.remove(movie);
  }

  // Search movies by title using SQL LIKE matching. This is simple and fine
  // for demos but may not scale or handle accents/case folding in production.
  async searchByTitle(q: string, page = 1, limit = 10): Promise<{ items: Movie[]; total: number; page: number; limit: number }> {
    const take = limit;
    const skip = (page - 1) * limit;
    const [items, total] = await this.movieRepo.findAndCount({ where: { title: Like(`%${q}%`) }, relations: ['actors', 'ratings'], take, skip, order: { id: 'ASC' } });
    return { items, total, page, limit };
  }
}
