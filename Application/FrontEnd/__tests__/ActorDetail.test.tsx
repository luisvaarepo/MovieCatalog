import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ActorDetail from '../pages/actors/[id]';
import { ThemeModeProvider } from '../lib/ThemeModeContext';

// mock next/router to provide query param id
vi.mock('next/router', () => ({
  useRouter: () => ({ query: { id: '1' } })
}));

vi.mock('swr', () => {
  return {
    default: (key: string) => {
      if (key === '/actors/1') {
        return { data: { id: 1, name: 'Actor One' }, error: null };
      }
      if (key === '/actors/1/movies') {
        return { data: [{ id: 10, title: 'Movie A' }], error: null };
      }
      return { data: null, error: null };
    }
  };
});

describe('ActorDetail', () => {
  it('renders actor name and movies list', async () => {
    render(
      <ThemeModeProvider>
        <ActorDetail />
      </ThemeModeProvider>
    );

    expect(await screen.findByText(/Actor One/)).toBeInTheDocument();
    expect(await screen.findByText(/Movie A/)).toBeInTheDocument();
  });
});
