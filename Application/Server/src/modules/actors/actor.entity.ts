import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Movie } from '../movies/movie.entity';

@Entity()
export class Actor {
  @PrimaryGeneratedColumn()
  id!: number;

  // Actor name. Unique constraint to keep demo data predictable.
  @Column({ unique: true })
  name!: string;

  // Movies this actor appears in. Inverse side of Movie.actors relation.
  @ManyToMany(() => Movie, (movie: Movie) => movie.actors)
  movies!: Movie[];
}
