import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import MoviesPage from '../pages/movies/index';
import { ThemeModeProvider } from '../lib/ThemeModeContext';

// reuse the movies mock but make total larger to ensure many page buttons
vi.mock('swr', () => ({
  default: (key: string) => {
    if (!key) return { data: null, error: null };
    const qs = (key as string).split('?')[1] || '';
    const params = new URLSearchParams(qs);
    const page = Number(params.get('page') || '1');
    const limit = Number(params.get('limit') || '5');
    const total = 50;
    const items: any[] = [];
    const start = (page - 1) * limit;
    for (let i = 0; i < limit; i++) {
      const idx = start + i;
      if (idx >= total) break;
      items.push({ id: idx + 1, title: `Movie ${idx + 1}`, actors: [], ratings: [] });
    }
    return { data: { items, total }, error: null };
  }
}));

describe('Pagination button range', () => {
  it('limits number of page buttons to 10 and navigates', async () => {
    const user = userEvent.setup();
    render(
      <ThemeModeProvider>
        <MoviesPage />
      </ThemeModeProvider>
    );

    // wait for content
    expect(await screen.findByText(/Movie 1/)).toBeInTheDocument();

    // there should be 10 numbered page buttons (1..10)
    const numbered = screen.getAllByRole('button').filter(b => /^[0-9]+$/.test(b.textContent || ''));
    expect(numbered.length).toBe(10);

    // click page 5
    const btn5 = screen.getByRole('button', { name: '5' });
    await user.click(btn5);
    expect(await screen.findByText(/Movie 21/)).toBeInTheDocument();
  });
});
