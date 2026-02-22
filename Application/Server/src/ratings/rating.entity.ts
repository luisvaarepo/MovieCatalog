import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Movie } from '../modules/movies/movie.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id!: number;

  // Numeric score for the rating. Stored as integer.
  @Column('integer')
  score!: number;

  // Optional text review accompanying the score.
  @Column({ nullable: true })
  review?: string;

  // Many-to-one relation to the Movie that this rating belongs to.
  @ManyToOne(() => Movie, (movie: Movie) => movie.ratings)
  movie!: Movie;
}
