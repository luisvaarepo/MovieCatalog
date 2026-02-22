// Top-level app wrapper for Next.js pages
// - Loads global CSS
// - Wraps the application with ThemeModeProvider which provides a light/dark
//   theme toggle and storage of the preference.
// Note: CssBaseline and ThemeProvider are available for Material UI integration
// but this app uses a small custom context (`ThemeModeProvider`) to manage mode.
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeModeProvider } from '../lib/ThemeModeContext';

export default function MyApp({ Component, pageProps }: AppProps) {
  // The ThemeModeProvider exposes `useThemeMode` to toggle between light/dark
  // and persists the preference to localStorage. Page components can assume
  // the provider is present and use the hook where needed.
  return (
    <ThemeModeProvider>
      <Component {...pageProps} />
    </ThemeModeProvider>
  );
}
