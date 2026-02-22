import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import MoviesPage from '../pages/movies/index';
import MovieDetail from '../pages/movies/[id]';
import { ThemeModeProvider } from '../lib/ThemeModeContext';

// mock router to capture navigation by replacing useRouter but not performing real navigation
// allow tests to set `globalThis.__TEST_ROUTER_ID` to control the returned `query.id`
vi.mock('next/router', () => ({
  useRouter: () => ({ query: { id: (globalThis as any).__TEST_ROUTER_ID }, push: vi.fn() })
}));

// mock swr: first call for list, then detail by key
vi.mock('swr', () => ({
  default: (key: string) => {
    if (!key) return { data: null, error: null };
    if ((key as string).startsWith('/movies?page=')) {
      return { data: { items: [{ id: 7, title: 'Movie Seven', actors: [{ id: 3, name: 'Actor Three' }], ratings: [] }], total: 1 }, error: null };
    }
    if (key === '/movies/7') {
      return { data: { id: 7, title: 'Movie Seven', description: 'The seven', actors: [{ id: 3, name: 'Actor Three' }], ratings: [] }, error: null };
    }
    return { data: null, error: null };
  }
}));

describe('Links and details navigation', () => {
  it('renders link hrefs and detail content when direct detail is rendered', async () => {
    render(
      <ThemeModeProvider>
        <MoviesPage />
      </ThemeModeProvider>
    );

    expect(await screen.findByText(/Movie Seven/)).toBeInTheDocument();
    const movieLink = screen.getByText('Movie Seven').closest('a');
    expect(movieLink).toBeTruthy();
    expect(movieLink!.getAttribute('href')).toContain('/movies/7');

    // render detail directly - set router id to 7 so MovieDetail fetches /movies/7
    (globalThis as any).__TEST_ROUTER_ID = '7';
    render(
      <ThemeModeProvider>
        <MovieDetail />
      </ThemeModeProvider>
    );

    expect(await screen.findByText(/The seven/)).toBeInTheDocument();
    // there may be multiple references to the actor; ensure at least one exists
    expect((await screen.findAllByText(/Actor Three/)).length).toBeGreaterThan(0);
  });
});
