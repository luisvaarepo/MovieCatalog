import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../components/Layout';
import { ThemeModeProvider } from '../lib/ThemeModeContext';

describe('Layout', () => {
  it('renders navigation links and footer', () => {
    render(
      <ThemeModeProvider>
        <Layout>
          <div>Test content</div>
        </Layout>
      </ThemeModeProvider>
    );

    expect(screen.getByText(/Movie Catalog/i)).toBeInTheDocument();
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Movies/i)).toBeInTheDocument();
    expect(screen.getByText(/Actors/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo frontend/i)).toBeInTheDocument();
    expect(screen.getByText(/Test content/i)).toBeInTheDocument();
  });
});
