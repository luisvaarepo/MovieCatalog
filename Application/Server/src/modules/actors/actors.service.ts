import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Actor } from './actor.entity';
import { Movie } from '../movies/movie.entity';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';

@Injectable()
export class ActorsService {
  constructor(
    @InjectRepository(Actor)
    private readonly actorRepo: Repository<Actor>,
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
  ) {}

  // Create a new actor entity. Name is unique at the DB level.
  create(dto: CreateActorDto) {
    const a = new Actor();
    a.name = dto.name;
    return this.actorRepo.save(a);
  }

  // Return actors with pagination and include associated movies.
  async findAll(page = 1, limit = 10): Promise<{ items: Actor[]; total: number; page: number; limit: number }> {
    const take = limit;
    const skip = (page - 1) * limit;
    const [items, total] = await this.actorRepo.findAndCount({ relations: ['movies'], take, skip, order: { id: 'ASC' } });
    return { items, total, page, limit };
  }

  // Find actor by id including movies. Throws NotFoundException if missing.
  async findOne(id: number) {
    const a = await this.actorRepo.findOne({ where: { id }, relations: ['movies'] });
    if (!a) throw new NotFoundException('Actor not found');
    return a;
  }

  // Update actor with partial fields allowed.
  async update(id: number, dto: UpdateActorDto) {
    const a = await this.findOne(id);
    if (dto.name) a.name = dto.name;
    return this.actorRepo.save(a);
  }

  // Remove an actor. Loading first ensures the entity exists and allows
  // cascade/rules defined on relations to take effect.
  async remove(id: number) {
    const a = await this.findOne(id);
    return this.actorRepo.remove(a);
  }

  // Search actors by substring match on name. See note in movies.service
  // regarding limitations of SQL LIKE for internationalized searches.
  async searchByName(q: string, page = 1, limit = 10): Promise<{ items: Actor[]; total: number; page: number; limit: number }> {
    const take = limit;
    const skip = (page - 1) * limit;
    const [items, total] = await this.actorRepo.findAndCount({ where: { name: Like(`%${q}%`) }, relations: ['movies'], take, skip, order: { id: 'ASC' } });
    return { items, total, page, limit };
  }

  // Convenience method to return movies for an actor. Loads the actor via
  // findOne so a NotFoundException is thrown for unknown ids.
  async moviesForActor(id: number) {
    const a = await this.findOne(id);
    return a.movies || [];
  }
}
