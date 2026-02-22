import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Actor } from '../actors/actor.entity';
import { Rating } from '../../ratings/rating.entity';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  id!: number;

  // Human-readable title. Uniqueness constraint helps simple lookups and UI
  // behaviour (prevents duplicate movie names in seed/demo data).
  @Column({ unique: true })
  title!: string;

  // Optional textual description of the movie.
  @Column({ nullable: true })
  description?: string;

  // Many-to-many relation to actors. Cascade true allows creating new actors
  // when saving a movie in simple workflows (suitable for demo purposes).
  @ManyToMany(() => Actor, (actor: Actor) => actor.movies, { cascade: true })
  @JoinTable()
  actors!: Actor[];

  // One-to-many relation to ratings. Cascade true allows ratings to be
  // persisted/removed alongside movies when using repository.remove/save.
  @OneToMany(() => Rating, (rating: Rating) => rating.movie, { cascade: true })
  ratings!: Rating[];
}
