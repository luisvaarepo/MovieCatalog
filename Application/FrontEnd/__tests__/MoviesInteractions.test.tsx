import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import MoviesPage from '../pages/movies/index';
import { ThemeModeProvider } from '../lib/ThemeModeContext';

vi.mock('swr', () => ({
  default: (key: string) => {
    if (!key) return { data: null, error: null };
    const qs = (key as string).split('?')[1] || '';
    const params = new URLSearchParams(qs);
    const page = Number(params.get('page') || '1');
    const limit = Number(params.get('limit') || '5');
    const total = 7;
    const items: any[] = [];
    const start = (page - 1) * limit;
    for (let i = 0; i < limit; i++) {
      const idx = start + i;
      if (idx >= total) break;
      items.push({ id: idx + 1, title: `Movie ${idx + 1}`, actors: [{ id: 200 + idx, name: `Actor ${idx + 1}` }], ratings: [{ score: 3 + (idx % 2) }] });
    }
    return { data: { items, total }, error: null };
  }
}));

describe('Movies interactions', () => {
  it('navigates pages and updates page size', async () => {
    const user = userEvent.setup();
    render(
      <ThemeModeProvider>
        <MoviesPage />
      </ThemeModeProvider>
    );

    expect(await screen.findByText(/Movie 1/)).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();

    // go to page 2
    const btn2 = screen.getByRole('button', { name: '2' });
    await user.click(btn2);
    expect(await screen.findByText(/Movie 6/)).toBeInTheDocument();

    // change page size to 10 (should reduce pages)
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    await user.selectOptions(select, '10');
    expect(await screen.findByText(/Movie 1/)).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();

    // verify actor link href
    const actorLink = screen.getByText('Actor 1').closest('a');
    expect(actorLink).toBeTruthy();
    // mock generates actor ids as 200 + idx, Actor 1 corresponds to idx 0 => id 200
    expect(actorLink!.getAttribute('href')).toContain('/actors/200');

    // verify ratings text is not present
    expect(screen.queryByText(/No ratings/)).not.toBeInTheDocument();
  });
});
