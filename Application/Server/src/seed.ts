// Script used to populate the local SQLite database with demo data.
// This is useful during development to provide a known dataset for the
// frontend and for manual testing. The script is idempotent in that it
// attempts to find existing records before creating duplicates.
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { Movie } from './modules/movies/movie.entity';
import { Actor } from './modules/actors/actor.entity';
import { Rating } from './ratings/rating.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'sqlite',
    // match AppModule path: Server/data/database.sqlite
    database: join(__dirname, '..', 'data', 'database.sqlite'),
    entities: [Movie, Actor, Rating],
    synchronize: true,
  });
  // ensure data directory exists
  const fs = await import('fs');
  const dataDir = join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  await dataSource.initialize();

  const actorRepo = dataSource.getRepository(Actor);
  const movieRepo = dataSource.getRepository(Movie);
  const ratingRepo = dataSource.getRepository(Rating);

  // helper to find or create by unique field. These utilities make the seed
  // script safe to run multiple times without creating duplicate rows.
  const findOrCreateActor = async (name: string) => {
    let a = await actorRepo.findOne({ where: { name } });
    if (!a) {
      a = actorRepo.create({ name });
      await actorRepo.save(a);
    }
    return a;
  };

  const findOrCreateMovie = async (title: string, description?: string, actors?: Actor[]) => {
    let m = await movieRepo.findOne({ where: { title }, relations: ['actors'] });
    if (!m) {
      m = movieRepo.create({ title, description });
      if (actors && actors.length) m.actors = actors;
      await movieRepo.save(m);
    } else if (actors && actors.length) {
      // ensure actors are linked
      m.actors = actors;
      await movieRepo.save(m);
    }
    return m;
  };

  // seed multiple movies with actors and ratings. The sample data includes
  // several well-known titles to make the frontend look realistic during
  // development. Ratings are attached to movies and duplicates are avoided.
  const moviesData = [
    {
      title: 'The Matrix',
      description: 'A computer hacker learns about the true nature of reality.',
      actors: ['Keanu Reeves', 'Laurence Fishburne'],
      ratings: [
        { score: 9, review: 'Great sci-fi' },
        { score: 10, review: 'Mind-blowing' },
        { score: 8, review: 'Classic action' },
        { score: 9, review: 'Excellent pacing' },
        { score: 9, review: 'Rewatchable' },
      ],
    },
    {
      title: 'Inception',
      description: 'A thief who steals corporate secrets through dream-sharing technology.',
      actors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'],
      ratings: [
        { score: 9, review: 'Complex and thrilling' },
        { score: 8, review: 'Great visuals' },
        { score: 9, review: 'Thought-provoking' },
        { score: 8, review: 'Amazing soundtrack' },
        { score: 9, review: 'Nolan at his best' },
      ],
    },
    {
      title: 'The Dark Knight',
      description: 'Batman faces the Joker in Gotham City.',
      actors: ['Christian Bale', 'Heath Ledger'],
      ratings: [
        { score: 10, review: 'Masterpiece' },
        { score: 9, review: 'Heath Ledger is superb' },
        { score: 9, review: 'Dark and gripping' },
        { score: 8, review: 'Strong performances' },
        { score: 9, review: 'Unforgettable' },
      ],
    },
    {
      title: 'Pulp Fiction',
      description: 'The lives of two mob hitmen, a boxer and others intertwine.',
      actors: ['John Travolta', 'Samuel L. Jackson'],
      ratings: [
        { score: 9, review: 'Quentin Tarantino classic' },
        { score: 8, review: 'Witty dialogue' },
        { score: 8, review: 'Nonlinear brilliance' },
        { score: 9, review: 'Iconic scenes' },
        { score: 8, review: 'Great soundtrack' },
      ],
    },
    {
      title: 'Fight Club',
      description: 'An insomniac office worker and a soapmaker form an underground fight club.',
      actors: ['Brad Pitt', 'Edward Norton'],
      ratings: [
        { score: 9, review: 'Cult classic' },
        { score: 8, review: 'Dark and provocative' },
        { score: 9, review: 'Twist ending' },
        { score: 8, review: 'Strong performances' },
        { score: 7, review: 'Polarizing but good' },
      ],
    },
    {
      title: 'Forrest Gump',
      description: 'The presidencies and events of the 20th century as seen through the eyes of Forrest Gump.',
      actors: ['Tom Hanks', 'Robin Wright'],
      ratings: [
        { score: 9, review: 'Heartwarming' },
        { score: 8, review: 'Tom Hanks shines' },
        { score: 9, review: 'Emotional' },
        { score: 8, review: 'Timeless' },
        { score: 9, review: 'Great storytelling' },
      ],
    },
    {
      title: 'The Shawshank Redemption',
      description: 'Two imprisoned men bond over a number of years.',
      actors: ['Tim Robbins', 'Morgan Freeman'],
      ratings: [
        { score: 10, review: 'Best movie ever' },
        { score: 10, review: 'Inspiring' },
        { score: 9, review: 'Beautiful story' },
        { score: 9, review: 'Powerful performances' },
        { score: 10, review: 'A must watch' },
      ],
    },
    {
      title: 'The Godfather',
      description: 'The aging patriarch of an organized crime dynasty transfers control to his son.',
      actors: ['Marlon Brando', 'Al Pacino'],
      ratings: [
        { score: 10, review: 'Cinematic masterpiece' },
        { score: 9, review: 'Epic storytelling' },
        { score: 9, review: 'Stellar performances' },
        { score: 10, review: 'Timeless' },
        { score: 9, review: 'Brilliant' },
      ],
    },
    {
      title: 'The Lord of the Rings: The Fellowship of the Ring',
      description: 'A meek Hobbit and eight companions set out on a journey to destroy the One Ring.',
      actors: ['Elijah Wood', 'Ian McKellen'],
      ratings: [
        { score: 9, review: 'Epic fantasy' },
        { score: 9, review: 'Stunning visuals' },
        { score: 8, review: 'Great adaptation' },
        { score: 9, review: 'Powerful world-building' },
        { score: 9, review: 'Amazing score' },
      ],
    },
    {
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      actors: ['Matthew McConaughey', 'Anne Hathaway'],
      ratings: [
        { score: 9, review: 'Visually stunning' },
        { score: 8, review: 'Emotional and grand' },
        { score: 9, review: 'Ambitious' },
        { score: 8, review: 'Great score' },
        { score: 9, review: 'Thought-provoking' },
      ],
    },
  ];

  for (const md of moviesData) {
    const actorEntities: Actor[] = [];
    for (const name of md.actors) {
      const a = await findOrCreateActor(name);
      actorEntities.push(a);
    }
    const movie = await findOrCreateMovie(md.title, md.description, actorEntities);
    for (const rt of md.ratings) {
      const exists = await ratingRepo.findOne({ where: { score: rt.score, review: rt.review, movie: { id: movie.id } }, relations: ['movie'] });
      if (!exists) {
        const r = ratingRepo.create({ score: rt.score, review: rt.review, movie });
        await ratingRepo.save(r);
      }
    }
  }

  console.log('Seed complete');
  await dataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
