import Link from 'next/link';
import AuthLinks from '../../components/AuthLinks';
import { useThemeMode } from '../../lib/ThemeModeContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center h-16">
            <h1 className="text-lg font-semibold flex-1">Movie Catalog</h1>

            <nav className="flex items-center space-x-3">
              <Link href="/" legacyBehavior>
                <a className="text-gray-700 dark:text-gray-200">Home</a>
              </Link>
              <Link href="/movies" legacyBehavior>
                <a className="text-gray-700 dark:text-gray-200">Movies</a>
              </Link>
              <Link href="/actors" legacyBehavior>
                <a className="text-gray-700 dark:text-gray-200">Actors</a>
              </Link>
              <AuthLinks />
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-6">{children}</main>

      <footer className="border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">Demo frontend</p>
        </div>
      </footer>
    </div>
  );
}

function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  return (
    <button onClick={toggleMode} aria-label="toggle theme" className="ml-2 text-gray-700 dark:text-gray-200">
      {mode === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
