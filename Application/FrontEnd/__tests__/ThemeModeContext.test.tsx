import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ThemeModeProvider, useThemeMode } from '../lib/ThemeModeContext';

function wrapper({ children }: { children?: React.ReactNode }) {
  return <ThemeModeProvider>{children}</ThemeModeProvider> as any;
}

describe('ThemeModeContext', () => {
  it('defaults to light and toggles to dark', () => {
    const { result } = renderHook(() => useThemeMode(), { wrapper });
    expect(result.current.mode).toBe('light');

    act(() => {
      result.current.toggleMode();
    });

    expect(result.current.mode).toBe('dark');
    expect(localStorage.getItem('theme_mode')).toBe('dark');

    act(() => {
      result.current.setMode('light');
    });

    expect(result.current.mode).toBe('light');
    expect(localStorage.getItem('theme_mode')).toBe('light');
  });
});
