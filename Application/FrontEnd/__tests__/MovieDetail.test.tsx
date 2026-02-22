import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import MovieDetail from '../pages/movies/[id]';
import { ThemeModeProvider } from '../lib/ThemeModeContext';

vi.mock('next/router', () => ({
  useRouter: () => ({ query: { id: '5' } })
}));

vi.mock('swr', () => {
  return {
    default: (key: string) => {
      if (key === '/movies/5') {
        return {
          data: { id: 5, title: 'Movie One', description: 'Desc', actors: [{ id: 2, name: 'Actor Two' }], ratings: [{ score: 4, review: 'Good' }] },
          error: null
        };
      }
      return { data: null, error: null };
    }
  };
});

describe('MovieDetail', () => {
  it('renders movie details, actors and ratings', async () => {
    render(
      <ThemeModeProvider>
        <MovieDetail />
      </ThemeModeProvider>
    );

    expect(await screen.findByText(/Movie One/)).toBeInTheDocument();
    expect(await screen.findByText(/Desc/)).toBeInTheDocument();
    expect(await screen.findByText(/Actor Two/)).toBeInTheDocument();
    expect(await screen.findByText(/4 - Good/)).toBeInTheDocument();
  });
});
