import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import MoviesPage from '../pages/movies/index';
import { ThemeModeProvider } from '../lib/ThemeModeContext';

vi.mock('swr', () => {
  return {
    default: (key: string) => {
      if (!key) return { data: null, error: null };
      if (key.startsWith('/movies?page=')) {
        return {
          data: { items: [{ id: 5, title: 'Movie One', actors: [{ id: 2, name: 'Actor Two' }], ratings: [{ score: 4 }] }], total: 1 },
          error: null
        };
      }
      return { data: null, error: null };
    }
  };
});

describe('MoviesPage', () => {
  it('renders movies table and ratings', async () => {
    render(
      <ThemeModeProvider>
        <MoviesPage />
      </ThemeModeProvider>
    );

    expect(await screen.findByRole('heading', { name: /Movies/ })).toBeInTheDocument();
    expect(await screen.findByText(/Movie One/)).toBeInTheDocument();
    expect(await screen.findByText(/Actor Two/)).toBeInTheDocument();
    expect(await screen.findByText(/1 items/)).toBeInTheDocument();
    expect(await screen.findByText(/1 \(avg 4.0\)/)).toBeInTheDocument();
  });
});
