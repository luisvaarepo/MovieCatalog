import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Small component that shows Login/Register links when the user is not
// authenticated and a Logout button when an access token exists. It keeps
// local state synchronized with localStorage and listens for storage events
// so multiple tabs update the UI consistently.
export default function AuthLinks() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Initialize token from localStorage
    const t = localStorage.getItem('access_token');
    setToken(t);
    // Listen to storage events so UI updates when other tabs change auth state
    const onStorage = () => setToken(localStorage.getItem('access_token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Removes the token and navigates to the home page. Also dispatches a
  // storage event so other tabs update immediately.
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      window.dispatchEvent(new Event('storage'));
      window.location.href = '/';
    }
  };

  if (token) {
    // When authenticated show a Logout button
    return (
      <button onClick={logout} className="text-gray-700 dark:text-gray-200">Logout</button>
    );
  }

  // Not authenticated: show Login / Register links
  return (
    <>
      <Link href="/login" legacyBehavior>
        <a className="text-gray-700 dark:text-gray-200">Login</a>
      </Link>
      <Link href="/register" legacyBehavior>
        <a className="text-gray-700 dark:text-gray-200">Register</a>
      </Link>
    </>
  );
}
