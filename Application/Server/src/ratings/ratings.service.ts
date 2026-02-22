import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { Movie } from '../modules/movies/movie.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
  ) {}

  // Create a rating tied to an existing movie. Ensures the referenced movie
  // exists and throws 404 if not. Ratings are simple value objects attached to
  // movies.
  async create(dto: CreateRatingDto) {
    const movie = await this.movieRepo.findOne({ where: { id: dto.movieId } });
    if (!movie) throw new NotFoundException('Movie not found');
    const r = new Rating();
    r.score = dto.score;
    r.review = dto.review;
    r.movie = movie;
    return this.ratingRepo.save(r);
  }

  // List all ratings including the movie relation. In production scenarios
  // this should be paginated to avoid returning unbounded result sets.
  findAll() {
    return this.ratingRepo.find({ relations: ['movie'] });
  }

  // Find a single rating. Throws NotFoundException for missing entities.
  async findOne(id: number) {
    const r = await this.ratingRepo.findOne({ where: { id }, relations: ['movie'] });
    if (!r) throw new NotFoundException('Rating not found');
    return r;
  }

  // Update rating fields partially. If movieId is provided, the new movie is
  // validated to exist first.
  async update(id: number, dto: UpdateRatingDto) {
    const r = await this.findOne(id);
    if (dto.score !== undefined) r.score = dto.score as number;
    if (dto.review !== undefined) r.review = dto.review as string;
    if (dto.movieId) {
      const m = await this.movieRepo.findOne({ where: { id: dto.movieId } });
      if (!m) throw new NotFoundException('Movie not found');
      r.movie = m;
    }
    return this.ratingRepo.save(r);
  }

  // Remove a rating entity. Loading first ensures a 404 is returned for
  // unknown ids instead of a silent noop.
  async remove(id: number) {
    const r = await this.findOne(id);
    return this.ratingRepo.remove(r);
  }
}
