import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ActorsPage from '../pages/actors/index';
import { ThemeModeProvider } from '../lib/ThemeModeContext';

// mock swr to return a predictable response for actors list
vi.mock('swr', () => {
  return {
    default: (key: string) => {
      if (!key) return { data: null, error: null };
      if (key.startsWith('/actors?page=')) {
        return {
          data: { items: [{ id: 1, name: 'Actor One', movies: [{ id: 10, title: 'Movie A' }] }], total: 1 },
          error: null
        };
      }
      return { data: null, error: null };
    }
  };
});

describe('ActorsPage', () => {
  it('renders actors table and pagination info', async () => {
    render(
      <ThemeModeProvider>
        <ActorsPage />
      </ThemeModeProvider>
    );

    expect(await screen.findByRole('heading', { name: /Actors/ })).toBeInTheDocument();
    expect(await screen.findByText(/Actor One/)).toBeInTheDocument();
    expect(await screen.findByText(/Movie A/)).toBeInTheDocument();
    expect(await screen.findByText(/Page 1 of 1 - 1 items/)).toBeInTheDocument();
  });
});
