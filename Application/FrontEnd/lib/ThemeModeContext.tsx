import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';

type ContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (m: ThemeMode) => void;
};

const ThemeModeContext = createContext<ContextValue | undefined>(undefined);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage.getItem('theme_mode');
    if (stored === 'dark' || stored === 'light') return stored as ThemeMode;
    // fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    if (typeof window !== 'undefined') window.localStorage.setItem('theme_mode', m);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (m === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    }
  };

  const toggleMode = () => {
    setModeState((prev) => {
      const m = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') window.localStorage.setItem('theme_mode', m);
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (m === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
      }
      return m;
    });
  };

  // Ensure the html class reflects the current mode on mount/update
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (mode === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}

export default ThemeModeContext;
