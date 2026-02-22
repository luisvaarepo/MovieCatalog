import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ActorsPage from '../pages/actors/index';
import { ThemeModeProvider } from '../lib/ThemeModeContext';

// dynamic mock for swr that returns paged actor lists based on page & limit
vi.mock('swr', () => ({
  default: (key: string) => {
    if (!key) return { data: null, error: null };
    const url = key as string;
    const qs = url.split('?')[1] || '';
    const params = new URLSearchParams(qs);
    const page = Number(params.get('page') || '1');
    const limit = Number(params.get('limit') || '5');
    const total = 12; // total items for tests
    const items: any[] = [];
    const start = (page - 1) * limit;
    for (let i = 0; i < limit; i++) {
      const idx = start + i;
      if (idx >= total) break;
      items.push({ id: idx + 1, name: `Actor ${idx + 1}`, movies: [{ id: 100 + idx, title: `Movie ${idx + 1}` }] });
    }
    return { data: { items, total }, error: null };
  }
}));

describe('Actors interactions', () => {
  it('handles pagination controls and page size changes', async () => {
    const user = userEvent.setup();
    render(
      <ThemeModeProvider>
        <ActorsPage />
      </ThemeModeProvider>
    );

    // initial load page 1
    expect((await screen.findAllByText(/Actor 1/)).length).toBeGreaterThan(0);
    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();

    // click page 2 via numbered button
    const page2Button = screen.getByRole('button', { name: '2' });
    await user.click(page2Button);
    expect((await screen.findAllByText(/Actor 6/)).length).toBeGreaterThan(0);
    expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument();

    // click Next to go to page 3
    const next = screen.getByRole('button', { name: /Next/i });
    await user.click(next);
    expect((await screen.findAllByText(/Actor 11/)).length).toBeGreaterThan(0);
    expect(screen.getByText(/Page 3 of 3/)).toBeInTheDocument();

    // click Prev to go back to page 2
    const prev = screen.getByRole('button', { name: /Prev/i });
    await user.click(prev);
    expect((await screen.findAllByText(/Actor 6/)).length).toBeGreaterThan(0);
    expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument();

    // change page size to 10 and ensure page resets and totalPages updates
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    await user.selectOptions(select, '10');
    expect((await screen.findAllByText(/Actor 1/)).length).toBeGreaterThan(0);
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();

    // verify link hrefs for an actor and movie
    const actorLink = screen.getByText('Actor 1').closest('a');
    expect(actorLink).toBeTruthy();
    expect(actorLink!.getAttribute('href')).toContain('/actors/1');
    const movieLink = screen.getByText('Movie 1').closest('a');
    expect(movieLink).toBeTruthy();
    // movie id generation is 100 + idx, so Movie 1 corresponds to id 100
    expect(movieLink!.getAttribute('href')).toContain('/movies/100');
  });
});
